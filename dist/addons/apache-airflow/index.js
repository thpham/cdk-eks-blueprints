"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApacheAirflowAddOn = void 0;
const assert = require("assert");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const index_1 = require("../helm-addon/index");
const aws_loadbalancer_controller_1 = require("../aws-loadbalancer-controller");
const efs_csi_driver_1 = require("../efs-csi-driver");
const utils_1 = require("../../utils");
const ts_deepmerge_1 = require("ts-deepmerge");
const AIRFLOW = 'airflow';
const RELEASE = 'blueprints-addon-apache-airflow';
const AIRFLOWSC = 'apache-airflow-sc';
const AIRFLOWPVC = 'efs-apache-airflow-pvc';
/**
 * Default props to be used when creating the Helm chart
 */
const defaultProps = {
    name: AIRFLOW,
    namespace: AIRFLOW,
    chart: AIRFLOW,
    version: "1.14.0",
    release: RELEASE,
    repository: "https://airflow.apache.org",
    enableAlb: false,
    enableEfs: false,
    enableLogging: false,
    values: {}
};
/**
 * This add-on is currently not supported. It will apply the latest falco helm chart but the latest AMI does not have stock driver supported and
 * driver build in the init fails atm.
 */
let ApacheAirflowAddOn = class ApacheAirflowAddOn extends index_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a;
        const cluster = clusterInfo.cluster;
        const albAddOnCheck = clusterInfo.getScheduledAddOn(aws_loadbalancer_controller_1.AwsLoadBalancerControllerAddOn.name);
        const enableAlb = this.options.enableAlb;
        const cert = this.options.certificateResourceName;
        const loggingIsEnabled = this.options.enableLogging;
        const loggingBucketResourceName = this.options.s3Bucket;
        const efsIsEnabled = this.options.enableEfs;
        const efsResourceName = this.options.efsFileSystem;
        const namespace = this.options.namespace;
        // Create Namespace
        const ns = (0, utils_1.createNamespace)(namespace, cluster, true, true);
        // Setting basic custom values for Kubernetes
        let values = {
            config: {
                "kubernetes": {
                    "namespace": this.options.namespace
                },
                "kubernetes_executor": {
                    "namespace": this.options.namespace
                }
            },
            "securityContext": {
                "fsGroup": 66534
            },
            "executor": "KubernetesExecutor"
        };
        // If Load Balancing is enabled
        if (enableAlb) {
            values = setUpLoadBalancer(clusterInfo, values, albAddOnCheck, cert);
        }
        else {
            assert(!cert, 'Cert option is supported only if ALB is enabled.');
        }
        // If Logging with S3 is enabled
        if (loggingIsEnabled) {
            const bucket = clusterInfo.getRequiredResource(loggingBucketResourceName);
            values = setUpLogging(clusterInfo, values, ns, namespace, bucket);
        }
        // If EFS is enabled for persistent storage
        let pvcResource;
        if (efsIsEnabled) {
            [values, pvcResource] = setUpEFS(clusterInfo, values, ns, namespace, efsResourceName);
        }
        // Merge values with user-provided one
        values = (0, ts_deepmerge_1.merge)(values, (_a = this.props.values) !== null && _a !== void 0 ? _a : {});
        // Apply Helm Chart
        const chart = this.addHelmChart(clusterInfo, values, false, false);
        // Add PVC dependency to the Chart in case of EFS generating the resource
        if (efsIsEnabled) {
            chart.node.addDependency(pvcResource);
        }
        return Promise.resolve(chart);
    }
};
exports.ApacheAirflowAddOn = ApacheAirflowAddOn;
exports.ApacheAirflowAddOn = ApacheAirflowAddOn = __decorate([
    utils_1.supportsX86
], ApacheAirflowAddOn);
/**
 * Helper function to set up Load Balancer
 */
function setUpLoadBalancer(clusterInfo, values, albAddOnCheck, cert) {
    // Check to ensure AWS Load Balancer Controller AddOn is provided in the list of Addons
    assert(albAddOnCheck, `Missing a dependency: ${aws_loadbalancer_controller_1.AwsLoadBalancerControllerAddOn.name}. Please add it to your list of addons.`);
    const presetAnnotations = {
        'alb.ingress.kubernetes.io/group.name': 'airflow',
        'alb.ingress.kubernetes.io/scheme': 'internet-facing',
        'alb.ingress.kubernetes.io/target-type': 'ip',
        'alb.ingress.kubernetes.io/listen-ports': '[{"HTTP": 80}]',
        'alb.ingress.kubernetes.io/healthcheck-path': '/health',
    };
    // Set helm custom value for certificates, if provided
    if (cert) {
        presetAnnotations['alb.ingress.kubernetes.io/listen-ports'] = '[{"HTTP": 80},{"HTTPS":443}]';
        const certificate = clusterInfo.getResource(cert);
        presetAnnotations['alb.ingress.kubernetes.io/certificate-arn'] = certificate === null || certificate === void 0 ? void 0 : certificate.certificateArn;
    }
    (0, utils_1.setPath)(values, "ingress.web", {
        "enabled": "true",
        "annotations": presetAnnotations,
        "pathType": "Prefix",
        "ingressClassName": "alb",
    });
    // Configuring Ingress for Airflow Web Ui hence the service type is changed to NodePort
    (0, utils_1.setPath)(values, "webserver.service", {
        type: "NodePort",
        ports: [{
                name: "airflow-ui",
                port: "{{ .Values.ports.airflowUI }}"
            }]
    });
    return values;
}
/**
 * Helper function to set up Logging with S3 Bucket
*/
function setUpLogging(clusterInfo, values, ns, namespace, bucket) {
    // Assert check to ensure you provide an S3 Bucket
    assert(bucket, "Please provide the name of S3 bucket for Logging.");
    // IRSA Policy
    const AirflowLoggingPolicy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:ListBucket"
                ],
                "Resource": [`arn:aws:s3:::${bucket.bucketName}`]
            },
            {
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject"
                ],
                "Resource": [`arn:aws:s3:::${bucket.bucketName}/*`]
            }
        ]
    };
    // Set up IRSA
    const airflowLoggingPolicyDocument = aws_iam_1.PolicyDocument.fromJson(AirflowLoggingPolicy);
    const sa = (0, utils_1.createServiceAccount)(clusterInfo.cluster, 'airflow-s3-logging-sa', namespace, airflowLoggingPolicyDocument);
    sa.node.addDependency(ns);
    // Helm custom value set up for S3 logging set up
    (0, utils_1.setPath)(values, "config.core.colored_console_log", 'True');
    (0, utils_1.setPath)(values, "config.core.remote_logging", 'True');
    (0, utils_1.setPath)(values, "config.logging", {
        "remote_logging": 'True',
        "logging_level": 'INFO',
        "colored_console_log": 'True',
        "remote_base_log_folder": `s3://${bucket.bucketName}/airflow-logs`,
        // aws_s3_conn is the name of the connection that needs to be created using Airflow admin UI once the deployment is complete
        // Steps can be seen in the docs link here -> https://github.com/apache/airflow/issues/25322
        "remote_log_conn_id": 'aws_s3_conn',
        "delete_worker_pods": 'False',
        "encrypt_s3_logs": 'True'
    });
    // Set Webserver SA so that server logs can be shipped to S3
    (0, utils_1.setPath)(values, "webserver.serviceAccount", {
        create: false,
        name: `${sa.serviceAccountName}`
    });
    // Set Worker SA so that worker logs can be shipped to S3
    (0, utils_1.setPath)(values, "workers.serviceAccount", {
        create: false,
        name: `${sa.serviceAccountName}`
    });
    // Set Scheduler SA so that scheduler logs can be shipped to S3
    (0, utils_1.setPath)(values, "scheduler.serviceAccount", {
        create: false,
        name: `${sa.serviceAccountName}`
    });
    return values;
}
/**
 *
 */
function setUpEFS(clusterInfo, values, ns, namespace, efsResourceName) {
    // Check 
    const efsAddOnCheck = clusterInfo.getScheduledAddOn(efs_csi_driver_1.EfsCsiDriverAddOn.name);
    assert(efsAddOnCheck, `Missing a dependency: ${efs_csi_driver_1.EfsCsiDriverAddOn.name}. Please add it to your list of addons.`);
    const efs = clusterInfo.getRequiredResource(efsResourceName);
    assert(efs, "Please provide the name of EFS File System.");
    // Need to create a storage class and pvc for the EFS
    const scResource = new aws_eks_1.KubernetesManifest(clusterInfo.cluster, 'apache-airflow-efs-sc', {
        cluster: clusterInfo.cluster,
        manifest: [{
                apiVersion: "storage.k8s.io/v1",
                kind: "StorageClass",
                metadata: { name: AIRFLOWSC },
                provisioner: "efs.csi.aws.com",
                parameters: {
                    provisioningMode: "efs-ap",
                    fileSystemId: `${efs.fileSystemId}`,
                    directoryPerms: "700",
                    gidRangeStart: "1000",
                    gidRangeEnd: "2000",
                }
            }], overwrite: true,
    });
    const pvcResource = new aws_eks_1.KubernetesManifest(clusterInfo.cluster, 'apache-airflow-efs-pvc', {
        cluster: clusterInfo.cluster,
        manifest: [{
                apiVersion: "v1",
                kind: "PersistentVolumeClaim",
                metadata: {
                    name: AIRFLOWPVC,
                    namespace: `${namespace}`
                },
                spec: {
                    accessModes: ["ReadWriteMany"],
                    storageClassName: AIRFLOWSC,
                    resources: {
                        requests: {
                            storage: '10Gi'
                        }
                    }
                }
            }], overwrite: true,
    });
    // SC depends on the EFS addon
    if (efsAddOnCheck) {
        efsAddOnCheck.then(construct => scResource.node.addDependency(construct));
    }
    // PVC depends on SC and NS
    pvcResource.node.addDependency(scResource);
    pvcResource.node.addDependency(ns);
    // Set helm custom values for persistent storage of DAGs
    (0, utils_1.setPath)(values, "dags.persistence", {
        enabled: true,
        size: "10Gi",
        storageClassName: AIRFLOWSC,
        accessMode: "ReadWriteMany",
        existingClaim: AIRFLOWPVC
    });
    return [values, pvcResource];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2FwYWNoZS1haXJmbG93L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLGlDQUFpQztBQUlqQyxpREFBeUQ7QUFDekQsaURBQXFEO0FBR3JELCtDQUFnRDtBQUNoRCxnRkFBZ0Y7QUFDaEYsc0RBQXNEO0FBSXRELHVDQUEwRjtBQUcxRiwrQ0FBcUM7QUE4Q3JDLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUMxQixNQUFNLE9BQU8sR0FBRyxpQ0FBaUMsQ0FBQztBQUNsRCxNQUFNLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQztBQUN0QyxNQUFNLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQztBQUU1Qzs7R0FFRztBQUNGLE1BQU0sWUFBWSxHQUFzQjtJQUNyQyxJQUFJLEVBQUUsT0FBTztJQUNiLFNBQVMsRUFBRSxPQUFPO0lBQ2xCLEtBQUssRUFBRSxPQUFPO0lBQ2QsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLE9BQU87SUFDaEIsVUFBVSxFQUFHLDRCQUE0QjtJQUN6QyxTQUFTLEVBQUUsS0FBSztJQUNoQixTQUFTLEVBQUUsS0FBSztJQUNoQixhQUFhLEVBQUUsS0FBSztJQUNwQixNQUFNLEVBQUUsRUFBRTtDQUNiLENBQUM7QUFFRjs7O0dBR0c7QUFFSSxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLGlCQUFTO0lBSTdDLFlBQVksS0FBeUI7UUFDakMsS0FBSyxDQUFDLEVBQUMsR0FBRyxZQUFvQixFQUFFLEdBQUcsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUEwQixDQUFDO0lBQ25ELENBQUM7SUFFRCxNQUFNLENBQUMsV0FBd0I7O1FBQzNCLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDcEMsTUFBTSxhQUFhLEdB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QUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVELDJCQUEyQjtJQUMzQixXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMzQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVuQyx3REFBd0Q7SUFDeEQsSUFBQSxlQUFPLEVBQUMsTUFBTSxFQUFFLGtCQUFrQixFQUFFO1FBQ2hDLE9BQU8sRUFBRSxJQUFJO1FBQ2IsSUFBSSxFQUFFLE1BQU07UUFDWixnQkFBZ0IsRUFBRSxTQUFTO1FBQzNCLFVBQVUsRUFBRSxlQUFlO1FBQzNCLGFBQWEsRUFBRSxVQUFVO0tBQzVCLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDakMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSBcImFzc2VydFwiO1xuXG5pbXBvcnQgeyBJQ2VydGlmaWNhdGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJztcbmltcG9ydCB7IElCdWNrZXQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0IHsgS3ViZXJuZXRlc01hbmlmZXN0IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVrcyc7XG5pbXBvcnQgeyBQb2xpY3lEb2N1bWVudCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuXG5pbXBvcnQgeyBIZWxtQWRkT25Vc2VyUHJvcHMgfSBmcm9tIFwiLi4vaGVsbS1hZGRvblwiO1xuaW1wb3J0IHsgSGVsbUFkZE9uIH0gZnJvbSAnLi4vaGVsbS1hZGRvbi9pbmRleCc7XG5pbXBvcnQgeyBBd3NMb2FkQmFsYW5jZXJDb250cm9sbGVyQWRkT24gfSBmcm9tIFwiLi4vYXdzLWxvYWRiYWxhbmNlci1jb250cm9sbGVyXCI7XG5pbXBvcnQgeyBFZnNDc2lEcml2ZXJBZGRPbiB9IGZyb20gXCIuLi9lZnMtY3NpLWRyaXZlclwiO1xuXG5pbXBvcnQgeyBDbHVzdGVySW5mbyB9IGZyb20gJy4uLy4uL3NwaS90eXBlcyc7XG5pbXBvcnQgeyBWYWx1ZXMgfSBmcm9tIFwiLi4vLi4vc3BpXCI7XG5pbXBvcnQgeyBzZXRQYXRoLCBjcmVhdGVOYW1lc3BhY2UsIGNyZWF0ZVNlcnZpY2VBY2NvdW50LCBzdXBwb3J0c1g4NiB9IGZyb20gXCIuLi8uLi91dGlsc1wiO1xuaW1wb3J0IHsgSUZpbGVTeXN0ZW0gfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVmc1wiO1xuXG5pbXBvcnQgeyBtZXJnZSB9IGZyb20gXCJ0cy1kZWVwbWVyZ2VcIjtcblxuLyoqXG4gKiBVc2VyIHByb3ZpZGVkIG9wdGlvbnMgZm9yIHRoZSBIZWxtIENoYXJ0XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWlyZmxvd0FkZE9uUHJvcHMgZXh0ZW5kcyBIZWxtQWRkT25Vc2VyUHJvcHMge1xuICAgIC8qKlxuICAgICAqIE5hbWVzcGFjZVxuICAgICAqL1xuICAgIG5hbWVzcGFjZT86IHN0cmluZyxcbiAgICBcbiAgICAvKipcbiAgICAgKiBFbmFibGUgTG9hZCBCYWxhbmNlciBmb3IgSW5ncmVzcyAtIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgKi9cbiAgICBlbmFibGVBbGI/OiBib29sZWFuLFxuXG4gICAgLyoqXG4gICAgICogTmFtZSBvZiB0aGUge0BsaW5rIGNlcnRpZmljYXRlUmVzb3VyY2VOYW1lfSB0byBiZSB1c2VkIGZvciBjZXJ0aWZpY2F0ZSBsb29rIHVwLiBcbiAgICAgKiBAc2VlIHtAbGluayBJbXBvcnRDZXJ0aWZpY2F0ZVByb3ZpZGVyfSBhbmQge0BsaW5rIENyZWF0ZUNlcnRpZmljYXRlUHJvdmlkZXJ9IGZvciBleGFtcGxlcyBvZiBjZXJ0aWZpY2F0ZSBwcm92aWRlcnMuXG4gICAgICovXG4gICAgY2VydGlmaWNhdGVSZXNvdXJjZU5hbWU/OiBzdHJpbmcsXG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUgTG9nZ2luZyB3aXRoIFMzICAtIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgKi9cbiAgICBlbmFibGVMb2dnaW5nPzogYm9vbGVhbixcblxuICAgIC8qKlxuICAgICAqIE5hbWVzIG9mIHRoZSBTMyBCdWNrZXQgcHJvdmlkZXIgbmFtZWQgcmVzb3VyY2VzIChAc2VlIENyZWF0ZVMzQnVja2V0UHJvdmlkZXIsIEBzZWUgSW1wb3J0UzNCdWNrZXRQcm92aWRlcikuXG4gICAgICogUzMgQnVja2V0IHByb3ZpZGVyIGlzIHJlZ2lzdGVyZWQgYXMgbmFtZWQgcmVzb3VyY2UgcHJvdmlkZXJzIHdpdGggdGhlIEVrc0JsdWVwcmludFByb3BzLlxuICAgICAqL1xuICAgIHMzQnVja2V0Pzogc3RyaW5nLFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlIEVGUyBmb3IgcGVyc2lzdGVudCBzdG9yYWdlIG9mIERBR3MgLSBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICovXG4gICAgZW5hYmxlRWZzPzogYm9vbGVhbixcblxuICAgIC8qKlxuICAgICAqIE5hbWVzIG9mIHRoZSBFRlMgRmlsZSBTeXN0ZW0gcHJvdmlkZXIgbmFtZWQgcmVzb3VyY2VzIChAc2VlIENyZWF0ZUVmc0ZpbGVTeXN0ZW1Qcm92aWRlciwgQHNlZSBMb29rdXBFZnNGaWxlU3lzdGVtUHJvdmlkZXIpLlxuICAgICAqIEVGUyBGaWxlIFN5c3RlbSBwcm92aWRlciBpcyByZWdpc3RlcmVkIGFzIG5hbWVkIHJlc291cmNlIHByb3ZpZGVycyB3aXRoIHRoZSBFa3NCbHVlcHJpbnRQcm9wcy5cbiAgICAgKiBUaGlzIGlzIHJlcXVpcmVkIGlmIEVGUyBpcyBlbmFibGVkXG4gICAgICovXG4gICAgZWZzRmlsZVN5c3RlbT86IHN0cmluZyxcbn1cblxuY29uc3QgQUlSRkxPVyA9ICdhaXJmbG93JztcbmNvbnN0IFJFTEVBU0UgPSAnYmx1ZXByaW50cy1hZGRvbi1hcGFjaGUtYWlyZmxvdyc7XG5jb25zdCBBSVJGTE9XU0MgPSAnYXBhY2hlLWFpcmZsb3ctc2MnO1xuY29uc3QgQUlSRkxPV1BWQyA9ICdlZnMtYXBhY2hlLWFpcmZsb3ctcHZjJztcblxuLyoqXG4gKiBEZWZhdWx0IHByb3BzIHRvIGJlIHVzZWQgd2hlbiBjcmVhdGluZyB0aGUgSGVsbSBjaGFydFxuICovXG4gY29uc3QgZGVmYXVsdFByb3BzOiBBaXJmbG93QWRkT25Qcm9wcyA9IHtcbiAgICBuYW1lOiBBSVJGTE9XLFxuICAgIG5hbWVzcGFjZTogQUlSRkxPVyxcbiAgICBjaGFydDogQUlSRkxPVyxcbiAgICB2ZXJzaW9uOiBcIjEuMTQuMFwiLFxuICAgIHJlbGVhc2U6IFJFTEVBU0UsXG4gICAgcmVwb3NpdG9yeTogIFwiaHR0cHM6Ly9haXJmbG93LmFwYWNoZS5vcmdcIixcbiAgICBlbmFibGVBbGI6IGZhbHNlLFxuICAgIGVuYWJsZUVmczogZmFsc2UsXG4gICAgZW5hYmxlTG9nZ2luZzogZmFsc2UsXG4gICAgdmFsdWVzOiB7fVxufTtcblxuLyoqXG4gKiBUaGlzIGFkZC1vbiBpcyBjdXJyZW50bHkgbm90IHN1cHBvcnRlZC4gSXQgd2lsbCBhcHBseSB0aGUgbGF0ZXN0IGZhbGNvIGhlbG0gY2hhcnQgYnV0IHRoZSBsYXRlc3QgQU1JIGRvZXMgbm90IGhhdmUgc3RvY2sgZHJpdmVyIHN1cHBvcnRlZCBhbmRcbiAqIGRyaXZlciBidWlsZCBpbiB0aGUgaW5pdCBmYWlscyBhdG0uIFxuICovXG5Ac3VwcG9ydHNYODZcbmV4cG9ydCBjbGFzcyBBcGFjaGVBaXJmbG93QWRkT24gZXh0ZW5kcyBIZWxtQWRkT24ge1xuXG4gICAgcmVhZG9ubHkgb3B0aW9uczogQWlyZmxvd0FkZE9uUHJvcHM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IEFpcmZsb3dBZGRPblByb3BzKSB7XG4gICAgICAgIHN1cGVyKHsuLi5kZWZhdWx0UHJvcHMgIGFzIGFueSwgLi4ucHJvcHN9KTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdGhpcy5wcm9wcyBhcyBBaXJmbG93QWRkT25Qcm9wcztcbiAgICB9XG4gICAgXG4gICAgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFByb21pc2U8Q29uc3RydWN0PiB7XG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuICAgICAgICBjb25zdCBhbGJBZGRPbkNoZWNrID0gY2x1c3RlckluZm8uZ2V0U2NoZWR1bGVkQWRkT24oQXdzTG9hZEJhbGFuY2VyQ29udHJvbGxlckFkZE9uLm5hbWUpO1xuICAgICAgICBjb25zdCBlbmFibGVBbGIgPSB0aGlzLm9wdGlvbnMuZW5hYmxlQWxiO1xuICAgICAgICBjb25zdCBjZXJ0ID0gdGhpcy5vcHRpb25zLmNlcnRpZmljYXRlUmVzb3VyY2VOYW1lO1xuICAgICAgICBjb25zdCBsb2dnaW5nSXNFbmFibGVkID0gdGhpcy5vcHRpb25zLmVuYWJsZUxvZ2dpbmc7XG4gICAgICAgIGNvbnN0IGxvZ2dpbmdCdWNrZXRSZXNvdXJjZU5hbWUgPSB0aGlzLm9wdGlvbnMuczNCdWNrZXQ7XG4gICAgICAgIGNvbnN0IGVmc0lzRW5hYmxlZCA9IHRoaXMub3B0aW9ucy5lbmFibGVFZnM7XG4gICAgICAgIGNvbnN0IGVmc1Jlc291cmNlTmFtZSA9IHRoaXMub3B0aW9ucy5lZnNGaWxlU3lzdGVtO1xuICAgICAgICBjb25zdCBuYW1lc3BhY2UgPSB0aGlzLm9wdGlvbnMubmFtZXNwYWNlO1xuXG4gICAgICAgIC8vIENyZWF0ZSBOYW1lc3BhY2VcbiAgICAgICAgY29uc3QgbnMgPSBjcmVhdGVOYW1lc3BhY2UobmFtZXNwYWNlISwgY2x1c3RlciwgdHJ1ZSwgdHJ1ZSk7XG5cbiAgICAgICAgLy8gU2V0dGluZyBiYXNpYyBjdXN0b20gdmFsdWVzIGZvciBLdWJlcm5ldGVzXG4gICAgICAgIGxldCB2YWx1ZXM6IFZhbHVlcyA9IHtcbiAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIFwia3ViZXJuZXRlc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwibmFtZXNwYWNlXCI6IHRoaXMub3B0aW9ucy5uYW1lc3BhY2UhXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcImt1YmVybmV0ZXNfZXhlY3V0b3JcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIm5hbWVzcGFjZVwiOiB0aGlzLm9wdGlvbnMubmFtZXNwYWNlIVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNlY3VyaXR5Q29udGV4dFwiOiB7XG4gICAgICAgICAgICAgICAgXCJmc0dyb3VwXCI6IDY2NTM0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJleGVjdXRvclwiOiBcIkt1YmVybmV0ZXNFeGVjdXRvclwiXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSWYgTG9hZCBCYWxhbmNpbmcgaXMgZW5hYmxlZFxuICAgICAgICBpZiAoZW5hYmxlQWxiKXtcbiAgICAgICAgICAgIHZhbHVlcyA9IHNldFVwTG9hZEJhbGFuY2VyKGNsdXN0ZXJJbmZvLCB2YWx1ZXMsIGFsYkFkZE9uQ2hlY2ssIGNlcnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXNzZXJ0KCFjZXJ0LCAnQ2VydCBvcHRpb24gaXMgc3VwcG9ydGVkIG9ubHkgaWYgQUxCIGlzIGVuYWJsZWQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBMb2dnaW5nIHdpdGggUzMgaXMgZW5hYmxlZFxuICAgICAgICBpZiAobG9nZ2luZ0lzRW5hYmxlZCl7XG4gICAgICAgICAgICBjb25zdCBidWNrZXQgPSBjbHVzdGVySW5mby5nZXRSZXF1aXJlZFJlc291cmNlPElCdWNrZXQ+KGxvZ2dpbmdCdWNrZXRSZXNvdXJjZU5hbWUhKTtcbiAgICAgICAgICAgIHZhbHVlcyA9IHNldFVwTG9nZ2luZyhjbHVzdGVySW5mbywgdmFsdWVzLCBucywgbmFtZXNwYWNlISwgYnVja2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIEVGUyBpcyBlbmFibGVkIGZvciBwZXJzaXN0ZW50IHN0b3JhZ2VcbiAgICAgICAgbGV0IHB2Y1Jlc291cmNlOiBLdWJlcm5ldGVzTWFuaWZlc3Q7XG4gICAgICAgIGlmIChlZnNJc0VuYWJsZWQpe1xuICAgICAgICAgICAgW3ZhbHVlcywgcHZjUmVzb3VyY2VdID0gc2V0VXBFRlMoY2x1c3RlckluZm8sIHZhbHVlcywgbnMsIG5hbWVzcGFjZSEsIGVmc1Jlc291cmNlTmFtZSEpOyAgIFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWVyZ2UgdmFsdWVzIHdpdGggdXNlci1wcm92aWRlZCBvbmVcbiAgICAgICAgdmFsdWVzID0gbWVyZ2UodmFsdWVzLCB0aGlzLnByb3BzLnZhbHVlcyA/PyB7fSk7XG5cbiAgICAgICAgLy8gQXBwbHkgSGVsbSBDaGFydFxuICAgICAgICBjb25zdCBjaGFydCA9IHRoaXMuYWRkSGVsbUNoYXJ0KGNsdXN0ZXJJbmZvLCB2YWx1ZXMsIGZhbHNlLCBmYWxzZSk7XG5cbiAgICAgICAgLy8gQWRkIFBWQyBkZXBlbmRlbmN5IHRvIHRoZSBDaGFydCBpbiBjYXNlIG9mIEVGUyBnZW5lcmF0aW5nIHRoZSByZXNvdXJjZVxuICAgICAgICBpZiAoZWZzSXNFbmFibGVkKXtcbiAgICAgICAgICAgIGNoYXJ0Lm5vZGUuYWRkRGVwZW5kZW5jeShwdmNSZXNvdXJjZSEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFydCk7XG4gICAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBzZXQgdXAgTG9hZCBCYWxhbmNlclxuICovXG5mdW5jdGlvbiBzZXRVcExvYWRCYWxhbmNlcihjbHVzdGVySW5mbzogQ2x1c3RlckluZm8sIHZhbHVlczogVmFsdWVzLCBhbGJBZGRPbkNoZWNrOiBQcm9taXNlPENvbnN0cnVjdD4gfCB1bmRlZmluZWQsIGNlcnQ6IHN0cmluZyB8IHVuZGVmaW5lZCApOiBWYWx1ZXMge1xuICAgICAvLyBDaGVjayB0byBlbnN1cmUgQVdTIExvYWQgQmFsYW5jZXIgQ29udHJvbGxlciBBZGRPbiBpcyBwcm92aWRlZCBpbiB0aGUgbGlzdCBvZiBBZGRvbnNcbiAgICAgYXNzZXJ0KGFsYkFkZE9uQ2hlY2ssIGBNaXNzaW5nIGEgZGVwZW5kZW5jeTogJHtBd3NMb2FkQmFsYW5jZXJDb250cm9sbGVyQWRkT24ubmFtZX0uIFBsZWFzZSBhZGQgaXQgdG8geW91ciBsaXN0IG9mIGFkZG9ucy5gKTsgXG4gICAgIGNvbnN0IHByZXNldEFubm90YXRpb25zOiBhbnkgPSB7XG4gICAgICAgICAnYWxiLmluZ3Jlc3Mua3ViZXJuZXRlcy5pby9ncm91cC5uYW1lJzogJ2FpcmZsb3cnLFxuICAgICAgICAgJ2FsYi5pbmdyZXNzLmt1YmVybmV0ZXMuaW8vc2NoZW1lJzogJ2ludGVybmV0LWZhY2luZycsXG4gICAgICAgICAnYWxiLmluZ3Jlc3Mua3ViZXJuZXRlcy5pby90YXJnZXQtdHlwZSc6ICdpcCcsXG4gICAgICAgICAnYWxiLmluZ3Jlc3Mua3ViZXJuZXRlcy5pby9saXN0ZW4tcG9ydHMnOiAnW3tcIkhUVFBcIjogODB9XScsXG4gICAgICAgICAnYWxiLmluZ3Jlc3Mua3ViZXJuZXRlcy5pby9oZWFsdGhjaGVjay1wYXRoJzogJy9oZWFsdGgnLFxuICAgICB9O1xuXG4gICAgIC8vIFNldCBoZWxtIGN1c3RvbSB2YWx1ZSBmb3IgY2VydGlmaWNhdGVzLCBpZiBwcm92aWRlZFxuICAgICBpZiAoY2VydCl7XG4gICAgICAgICBwcmVzZXRBbm5vdGF0aW9uc1snYWxiLmluZ3Jlc3Mua3ViZXJuZXRlcy5pby9saXN0ZW4tcG9ydHMnXSA9ICdbe1wiSFRUUFwiOiA4MH0se1wiSFRUUFNcIjo0NDN9XSc7XG4gICAgICAgICBjb25zdCBjZXJ0aWZpY2F0ZSA9IGNsdXN0ZXJJbmZvLmdldFJlc291cmNlPElDZXJ0aWZpY2F0ZT4oY2VydCk7XG4gICAgICAgICBwcmVzZXRBbm5vdGF0aW9uc1snYWxiLmluZ3Jlc3Mua3ViZXJuZXRlcy5pby9jZXJ0aWZpY2F0ZS1hcm4nXSA9IGNlcnRpZmljYXRlPy5jZXJ0aWZpY2F0ZUFybjtcbiAgICAgfSBcbiAgICAgXG4gICAgIHNldFBhdGgodmFsdWVzLCBcImluZ3Jlc3Mud2ViXCIsIHtcbiAgICAgICAgIFwiZW5hYmxlZFwiOiBcInRydWVcIixcbiAgICAgICAgIFwiYW5ub3RhdGlvbnNcIjogcHJlc2V0QW5ub3RhdGlvbnMsXG4gICAgICAgICBcInBhdGhUeXBlXCI6IFwiUHJlZml4XCIsXG4gICAgICAgICBcImluZ3Jlc3NDbGFzc05hbWVcIjogXCJhbGJcIixcbiAgICAgfSk7XG5cbiAgICAgLy8gQ29uZmlndXJpbmcgSW5ncmVzcyBmb3IgQWlyZmxvdyBXZWIgVWkgaGVuY2UgdGhlIHNlcnZpY2UgdHlwZSBpcyBjaGFuZ2VkIHRvIE5vZGVQb3J0XG4gICAgIHNldFBhdGgodmFsdWVzLCBcIndlYnNlcnZlci5zZXJ2aWNlXCIsIHtcbiAgICAgICAgIHR5cGU6IFwiTm9kZVBvcnRcIixcbiAgICAgICAgIHBvcnRzOiBbe1xuICAgICAgICAgICAgIG5hbWU6IFwiYWlyZmxvdy11aVwiLFxuICAgICAgICAgICAgIHBvcnQ6IFwie3sgLlZhbHVlcy5wb3J0cy5haXJmbG93VUkgfX1cIlxuICAgICAgICAgfV1cbiAgICAgfSk7XG5cbiAgICAgcmV0dXJuIHZhbHVlcztcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gc2V0IHVwIExvZ2dpbmcgd2l0aCBTMyBCdWNrZXRcbiovXG5mdW5jdGlvbiBzZXRVcExvZ2dpbmcoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvLCB2YWx1ZXM6IFZhbHVlcywgbnM6IEt1YmVybmV0ZXNNYW5pZmVzdCwgbmFtZXNwYWNlOiBzdHJpbmcsIGJ1Y2tldDogSUJ1Y2tldCk6IFZhbHVlcyB7XG4gICAgXG4gICAgLy8gQXNzZXJ0IGNoZWNrIHRvIGVuc3VyZSB5b3UgcHJvdmlkZSBhbiBTMyBCdWNrZXRcbiAgICBhc3NlcnQoYnVja2V0LCBcIlBsZWFzZSBwcm92aWRlIHRoZSBuYW1lIG9mIFMzIGJ1Y2tldCBmb3IgTG9nZ2luZy5cIik7XG5cbiAgICAvLyBJUlNBIFBvbGljeVxuICAgIGNvbnN0IEFpcmZsb3dMb2dnaW5nUG9saWN5ID0ge1xuICAgICAgICBcIlZlcnNpb25cIjogXCIyMDEyLTEwLTE3XCIsXG4gICAgICAgIFwiU3RhdGVtZW50XCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcInMzOkxpc3RCdWNrZXRcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBbYGFybjphd3M6czM6Ojoke2J1Y2tldC5idWNrZXROYW1lfWBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiczM6R2V0T2JqZWN0XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiczM6UHV0T2JqZWN0XCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogW2Bhcm46YXdzOnMzOjo6JHtidWNrZXQuYnVja2V0TmFtZX0vKmBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuXG4gICAgLy8gU2V0IHVwIElSU0FcbiAgICBjb25zdCBhaXJmbG93TG9nZ2luZ1BvbGljeURvY3VtZW50ID0gUG9saWN5RG9jdW1lbnQuZnJvbUpzb24oQWlyZmxvd0xvZ2dpbmdQb2xpY3kpO1xuICAgIGNvbnN0IHNhID0gY3JlYXRlU2VydmljZUFjY291bnQoY2x1c3RlckluZm8uY2x1c3RlciwgJ2FpcmZsb3ctczMtbG9nZ2luZy1zYScsIG5hbWVzcGFjZSwgYWlyZmxvd0xvZ2dpbmdQb2xpY3lEb2N1bWVudCk7XG4gICAgc2Eubm9kZS5hZGREZXBlbmRlbmN5KG5zKTtcblxuICAgIC8vIEhlbG0gY3VzdG9tIHZhbHVlIHNldCB1cCBmb3IgUzMgbG9nZ2luZyBzZXQgdXBcbiAgICBzZXRQYXRoKHZhbHVlcywgXCJjb25maWcuY29yZS5jb2xvcmVkX2NvbnNvbGVfbG9nXCIsICdUcnVlJyk7XG4gICAgc2V0UGF0aCh2YWx1ZXMsIFwiY29uZmlnLmNvcmUucmVtb3RlX2xvZ2dpbmdcIiwgJ1RydWUnKTtcbiAgICBzZXRQYXRoKHZhbHVlcywgXCJjb25maWcubG9nZ2luZ1wiLCB7XG4gICAgICAgIFwicmVtb3RlX2xvZ2dpbmdcIjogJ1RydWUnLFxuICAgICAgICBcImxvZ2dpbmdfbGV2ZWxcIjogJ0lORk8nLFxuICAgICAgICBcImNvbG9yZWRfY29uc29sZV9sb2dcIjogJ1RydWUnLFxuICAgICAgICBcInJlbW90ZV9iYXNlX2xvZ19mb2xkZXJcIjogYHMzOi8vJHtidWNrZXQuYnVja2V0TmFtZX0vYWlyZmxvdy1sb2dzYCxcbiAgICAgICAgLy8gYXdzX3MzX2Nvbm4gaXMgdGhlIG5hbWUgb2YgdGhlIGNvbm5lY3Rpb24gdGhhdCBuZWVkcyB0byBiZSBjcmVhdGVkIHVzaW5nIEFpcmZsb3cgYWRtaW4gVUkgb25jZSB0aGUgZGVwbG95bWVudCBpcyBjb21wbGV0ZVxuICAgICAgICAvLyBTdGVwcyBjYW4gYmUgc2VlbiBpbiB0aGUgZG9jcyBsaW5rIGhlcmUgLT4gaHR0cHM6Ly9naXRodWIuY29tL2FwYWNoZS9haXJmbG93L2lzc3Vlcy8yNTMyMlxuICAgICAgICBcInJlbW90ZV9sb2dfY29ubl9pZFwiOiAnYXdzX3MzX2Nvbm4nLFxuICAgICAgICBcImRlbGV0ZV93b3JrZXJfcG9kc1wiOiAnRmFsc2UnLFxuICAgICAgICBcImVuY3J5cHRfczNfbG9nc1wiOiAnVHJ1ZSdcbiAgICB9KTtcblxuICAgIC8vIFNldCBXZWJzZXJ2ZXIgU0Egc28gdGhhdCBzZXJ2ZXIgbG9ncyBjYW4gYmUgc2hpcHBlZCB0byBTM1xuICAgIHNldFBhdGgodmFsdWVzLCBcIndlYnNlcnZlci5zZXJ2aWNlQWNjb3VudFwiLCB7XG4gICAgICAgIGNyZWF0ZTogZmFsc2UsXG4gICAgICAgIG5hbWU6IGAke3NhLnNlcnZpY2VBY2NvdW50TmFtZX1gXG4gICAgfSk7XG5cbiAgICAvLyBTZXQgV29ya2VyIFNBIHNvIHRoYXQgd29ya2VyIGxvZ3MgY2FuIGJlIHNoaXBwZWQgdG8gUzNcbiAgICBzZXRQYXRoKHZhbHVlcywgXCJ3b3JrZXJzLnNlcnZpY2VBY2NvdW50XCIsIHtcbiAgICAgICAgY3JlYXRlOiBmYWxzZSxcbiAgICAgICAgbmFtZTogYCR7c2Euc2VydmljZUFjY291bnROYW1lfWBcbiAgICB9KTtcblxuICAgIC8vIFNldCBTY2hlZHVsZXIgU0Egc28gdGhhdCBzY2hlZHVsZXIgbG9ncyBjYW4gYmUgc2hpcHBlZCB0byBTM1xuICAgIHNldFBhdGgodmFsdWVzLCBcInNjaGVkdWxlci5zZXJ2aWNlQWNjb3VudFwiLCB7XG4gICAgICAgIGNyZWF0ZTogZmFsc2UsXG4gICAgICAgIG5hbWU6IGAke3NhLnNlcnZpY2VBY2NvdW50TmFtZX1gXG4gICAgfSk7XG4gICAgXG4gICAgcmV0dXJuIHZhbHVlcztcbn1cblxuLyoqXG4gKiBcbiAqL1xuZnVuY3Rpb24gc2V0VXBFRlMoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvLCB2YWx1ZXM6IFZhbHVlcywgbnM6IEt1YmVybmV0ZXNNYW5pZmVzdCwgbmFtZXNwYWNlOiBzdHJpbmcsIGVmc1Jlc291cmNlTmFtZTogc3RyaW5nKTogW1ZhbHVlcywgS3ViZXJuZXRlc01hbmlmZXN0XSB7XG4gICAgLy8gQ2hlY2sgXG4gICAgY29uc3QgZWZzQWRkT25DaGVjayA9IGNsdXN0ZXJJbmZvLmdldFNjaGVkdWxlZEFkZE9uKEVmc0NzaURyaXZlckFkZE9uLm5hbWUpO1xuICAgIGFzc2VydChlZnNBZGRPbkNoZWNrLCBgTWlzc2luZyBhIGRlcGVuZGVuY3k6ICR7RWZzQ3NpRHJpdmVyQWRkT24ubmFtZX0uIFBsZWFzZSBhZGQgaXQgdG8geW91ciBsaXN0IG9mIGFkZG9ucy5gKTsgXG4gICAgY29uc3QgZWZzID0gY2x1c3RlckluZm8uZ2V0UmVxdWlyZWRSZXNvdXJjZTxJRmlsZVN5c3RlbT4oZWZzUmVzb3VyY2VOYW1lKTtcbiAgICBhc3NlcnQoZWZzLCBcIlBsZWFzZSBwcm92aWRlIHRoZSBuYW1lIG9mIEVGUyBGaWxlIFN5c3RlbS5cIik7XG5cbiAgICAvLyBOZWVkIHRvIGNyZWF0ZSBhIHN0b3JhZ2UgY2xhc3MgYW5kIHB2YyBmb3IgdGhlIEVGU1xuICAgIGNvbnN0IHNjUmVzb3VyY2UgPSBuZXcgS3ViZXJuZXRlc01hbmlmZXN0KGNsdXN0ZXJJbmZvLmNsdXN0ZXIsICdhcGFjaGUtYWlyZmxvdy1lZnMtc2MnLCB7XG4gICAgICAgIGNsdXN0ZXI6IGNsdXN0ZXJJbmZvLmNsdXN0ZXIsXG4gICAgICAgIG1hbmlmZXN0OiBbe1xuICAgICAgICAgICAgYXBpVmVyc2lvbjogXCJzdG9yYWdlLms4cy5pby92MVwiLFxuICAgICAgICAgICAga2luZDogXCJTdG9yYWdlQ2xhc3NcIixcbiAgICAgICAgICAgIG1ldGFkYXRhOiB7IG5hbWU6IEFJUkZMT1dTQyB9LFxuICAgICAgICAgICAgcHJvdmlzaW9uZXI6IFwiZWZzLmNzaS5hd3MuY29tXCIsXG4gICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgcHJvdmlzaW9uaW5nTW9kZTogXCJlZnMtYXBcIixcbiAgICAgICAgICAgICAgICBmaWxlU3lzdGVtSWQ6IGAke2Vmcy5maWxlU3lzdGVtSWR9YCxcbiAgICAgICAgICAgICAgICBkaXJlY3RvcnlQZXJtczogXCI3MDBcIixcbiAgICAgICAgICAgICAgICBnaWRSYW5nZVN0YXJ0OiBcIjEwMDBcIixcbiAgICAgICAgICAgICAgICBnaWRSYW5nZUVuZDogXCIyMDAwXCIsXG4gICAgICAgICAgICB9XG4gICAgICAgIH1dLCBvdmVyd3JpdGU6IHRydWUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBwdmNSZXNvdXJjZSA9IG5ldyBLdWJlcm5ldGVzTWFuaWZlc3QoY2x1c3RlckluZm8uY2x1c3RlciwgJ2FwYWNoZS1haXJmbG93LWVmcy1wdmMnLHtcbiAgICAgICAgY2x1c3RlcjogY2x1c3RlckluZm8uY2x1c3RlcixcbiAgICAgICAgbWFuaWZlc3Q6IFt7XG4gICAgICAgICAgICBhcGlWZXJzaW9uOiBcInYxXCIsXG4gICAgICAgICAgICBraW5kOiBcIlBlcnNpc3RlbnRWb2x1bWVDbGFpbVwiLFxuICAgICAgICAgICAgbWV0YWRhdGE6IHsgXG4gICAgICAgICAgICAgICAgbmFtZTogQUlSRkxPV1BWQyxcbiAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IGAke25hbWVzcGFjZX1gIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNwZWM6IHtcbiAgICAgICAgICAgICAgICBhY2Nlc3NNb2RlczogW1wiUmVhZFdyaXRlTWFueVwiXSxcbiAgICAgICAgICAgICAgICBzdG9yYWdlQ2xhc3NOYW1lOiBBSVJGTE9XU0MsXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzOiB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9yYWdlOiAnMTBHaSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfV0sIG92ZXJ3cml0ZTogdHJ1ZSxcbiAgICB9KTtcblxuICAgIC8vIFNDIGRlcGVuZHMgb24gdGhlIEVGUyBhZGRvblxuICAgIGlmKGVmc0FkZE9uQ2hlY2spIHtcbiAgICAgICAgZWZzQWRkT25DaGVjay50aGVuKGNvbnN0cnVjdCA9PiBzY1Jlc291cmNlLm5vZGUuYWRkRGVwZW5kZW5jeShjb25zdHJ1Y3QpKTtcbiAgICB9XG5cbiAgICAvLyBQVkMgZGVwZW5kcyBvbiBTQyBhbmQgTlNcbiAgICBwdmNSZXNvdXJjZS5ub2RlLmFkZERlcGVuZGVuY3koc2NSZXNvdXJjZSk7XG4gICAgcHZjUmVzb3VyY2Uubm9kZS5hZGREZXBlbmRlbmN5KG5zKTtcblxuICAgIC8vIFNldCBoZWxtIGN1c3RvbSB2YWx1ZXMgZm9yIHBlcnNpc3RlbnQgc3RvcmFnZSBvZiBEQUdzXG4gICAgc2V0UGF0aCh2YWx1ZXMsIFwiZGFncy5wZXJzaXN0ZW5jZVwiLCB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHNpemU6IFwiMTBHaVwiLFxuICAgICAgICBzdG9yYWdlQ2xhc3NOYW1lOiBBSVJGTE9XU0MsXG4gICAgICAgIGFjY2Vzc01vZGU6IFwiUmVhZFdyaXRlTWFueVwiLFxuICAgICAgICBleGlzdGluZ0NsYWltOiBBSVJGTE9XUFZDXG4gICAgfSk7XG5cbiAgICByZXR1cm4gW3ZhbHVlcywgcHZjUmVzb3VyY2VdO1xufSJdfQ==