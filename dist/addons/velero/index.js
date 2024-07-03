"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeleroAddOn = void 0;
const iam = require("aws-cdk-lib/aws-iam");
const s3 = require("aws-cdk-lib/aws-s3");
const ts_deepmerge_1 = require("ts-deepmerge");
const utils_1 = require("../../utils");
const helm_addon_1 = require("../helm-addon");
/**
 * Defaults options for the add-on
 */
const defaultProps = {
    name: 'velero',
    version: "3.2.0",
    namespace: "velero",
    createNamespace: true,
    chart: "velero",
    repository: "https://vmware-tanzu.github.io/helm-charts/",
    release: "blueprints-addon-velero",
    values: {
        initContainers: [
            {
                name: "velero-plugin-for-aws",
                image: "velero/velero-plugin-for-aws:v1.2.0",
                imagePullPolicy: "IfNotPresent",
                volumeMounts: [
                    {
                        mountPath: "/target",
                        name: "plugins"
                    }
                ]
            }
        ],
        configuration: {
            provider: "aws",
            backupStorageLocation: {
                name: "default",
                config: {}
            },
            volumeSnapshotLocation: {
                name: "default",
                config: {}
            },
        },
        serviceAccount: {
            server: {}
        }
    },
};
let VeleroAddOn = class VeleroAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super((0, ts_deepmerge_1.merge)(defaultProps, props !== null && props !== void 0 ? props : {}));
        this.options = this.props;
    }
    /**
     * Implementation of the add-on contract deploy method.
    */
    deploy(clusterInfo) {
        var _a, _b, _c, _d;
        const cluster = clusterInfo.cluster;
        const props = this.options;
        // Create S3 bucket if no existing bucket, create s3 bucket and corresponding KMS key
        const s3Bucket = this.getOrCreateS3Bucket(clusterInfo, "backup-bucket", props.values.configuration.backupStorageLocation.bucket);
        // Create Namespace if namespace is not explicied defined.
        const veleroNamespace = this.createNamespaceIfNeeded(clusterInfo, "velero", props.namespace, props.createNamespace);
        // Setup IAM Role for Service Accounts (IRSA) for the Velero Service Account    
        const veleroServiceAccount = this.createServiceAccountWithIamRoles(clusterInfo, "velero-account", veleroNamespace.name, s3Bucket);
        // if veleroName space does not exist and needs creation, add the dependency
        if (veleroNamespace.manifest) {
            veleroServiceAccount.node.addDependency(veleroNamespace.manifest);
        }
        // Setup the values for the helm chart
        const valueVariable = {
            values: {
                configuration: {
                    backupStorageLocation: {
                        prefix: (_a = props.values.configuration.backupStorageLocation.prefix) !== null && _a !== void 0 ? _a : "velero/" + cluster.clusterName,
                        bucket: s3Bucket.bucketName,
                        config: {
                            region: (_b = props.values.configuration.backupStorageLocation.config.region) !== null && _b !== void 0 ? _b : cluster.stack.region,
                        }
                    },
                    volumeSnapshotLocation: {
                        config: {
                            region: (_c = props.values.configuration.backupStorageLocation.config.region) !== null && _c !== void 0 ? _c : cluster.stack.region
                        }
                    }
                },
                // IAM role for Service Account
                serviceAccount: {
                    server: {
                        create: false,
                        name: veleroServiceAccount.serviceAccountName,
                    }
                }
            }
        };
        const values = (_d = (0, ts_deepmerge_1.merge)(props.values, valueVariable.values)) !== null && _d !== void 0 ? _d : {};
        const chartNode = this.addHelmChart(clusterInfo, values);
        chartNode.node.addDependency(veleroServiceAccount);
        return Promise.resolve(chartNode);
    }
    /**
     * Return S3 Bucket
     * @param clusterInfo
     * @param id S3-Bucket-Postfix
     * @param existingBucketName exiting provided S3 BucketName if it exists
     * @returns the existing provided S3 bucket  or the newly created S3 bucket as s3.IBucket
     */
    getOrCreateS3Bucket(clusterInfo, id, existingBucketName) {
        if (!existingBucketName) {
            const bucket = new s3.Bucket(clusterInfo.cluster, "velero-${id}", {
                encryption: s3.BucketEncryption.KMS_MANAGED, // Velero Known bug for support with S3 with SSE-KMS with CMK, thus it does not support S3 Bucket Key: https://github.com/vmware-tanzu/helm-charts/issues/83
                blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Block Public Access for S3
                publicReadAccess: false,
                enforceSSL: true // Encryption in Transit
            });
            return s3.Bucket.fromBucketName(clusterInfo.cluster, 'getOrCreateS3Bucket', bucket.bucketName);
        }
        else {
            return s3.Bucket.fromBucketName(clusterInfo.cluster, 'getOrCreateS3Bucket', existingBucketName);
        }
    }
    /**
     * Return Velero Namespace where Velero will be installed onto
     * @param clusterInfo
     * @param defaultName the Default Namespace for Velero if nothing specified
     * @param namespace
     * @returns the namespace created or existed.
     */
    createNamespaceIfNeeded(clusterInfo, defaultName, namespace, create) {
        // Create Namespace if namespace is not explicied defined.
        if (namespace) {
            // Create Namespace if the "create" option is true
            if (create) {
                const namespaceManifest = (0, utils_1.createNamespace)(namespace, clusterInfo.cluster);
                return { name: namespace, manifest: namespaceManifest };
            }
            // If the "create" option if false, then namespace will not be created, return namespace.name
            else {
                return { name: namespace };
            }
        }
        else {
            return { name: defaultName }; // initial value of veleroNamespace
        }
    }
    /**
     * Return Velero Namespace where Velero will be installed onto
     * @param clusterInfo
     * @param id
     * @param namespace Velero namespace name
     * @param s3BucketName the S3 BucketName where Velero will stores the backup onto
     * @returns the service Account
     */
    createServiceAccountWithIamRoles(clusterInfo, id, namespace, s3Bucket) {
        // Setup IAM Role for Service Accounts (IRSA) for the Velero Service Account
        const veleroServiceAccount = clusterInfo.cluster.addServiceAccount(id, {
            name: id,
            namespace: namespace
        });
        // IAM policy for Velero
        const veleroPolicyDocument = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "ec2:DescribeVolumes",
                        "ec2:DescribeSnapshots",
                        "ec2:CreateTags",
                        "ec2:CreateVolume",
                        "ec2:CreateSnapshot",
                        "ec2:DeleteSnapshot"
                    ],
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:GetObject",
                        "s3:DeleteObject",
                        "s3:PutObject",
                        "s3:AbortMultipartUpload",
                        "s3:ListMultipartUploadParts",
                        "s3:ListBucket"
                    ],
                    "Resource": [
                        s3Bucket.arnForObjects("*"),
                        s3Bucket.bucketArn
                    ]
                }
            ]
        };
        const veleroCustomPolicyDocument = iam.PolicyDocument.fromJson(veleroPolicyDocument);
        const veleroPolicy = new iam.ManagedPolicy(clusterInfo.cluster, "velero-managed-policy", {
            document: veleroCustomPolicyDocument
        });
        veleroServiceAccount.role.addManagedPolicy(veleroPolicy);
        return veleroServiceAccount;
    }
};
exports.VeleroAddOn = VeleroAddOn;
exports.VeleroAddOn = VeleroAddOn = __decorate([
    utils_1.supportsALL
], VeleroAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL3ZlbGVyby9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFDQSwyQ0FBMkM7QUFDM0MseUNBQXlDO0FBRXpDLCtDQUFxQztBQUVyQyx1Q0FBMkQ7QUFDM0QsOENBQThEO0FBUzlEOztHQUVHO0FBQ0gsTUFBTSxZQUFZLEdBQUc7SUFDakIsSUFBSSxFQUFFLFFBQVE7SUFDZCxPQUFPLEVBQUUsT0FBTztJQUNoQixTQUFTLEVBQUUsUUFBUTtJQUNuQixlQUFlLEVBQUUsSUFBSTtJQUNyQixLQUFLLEVBQUUsUUFBUTtJQUNmLFVBQVUsRUFBRSw2Q0FBNkM7SUFDekQsT0FBTyxFQUFFLHlCQUF5QjtJQUNsQyxNQUFNLEVBQUM7UUFDSCxjQUFjLEVBQUM7WUFDWDtnQkFDSSxJQUFJLEVBQUUsdUJBQXVCO2dCQUM3QixLQUFLLEVBQUUscUNBQXFDO2dCQUM1QyxlQUFlLEVBQUUsY0FBYztnQkFDL0IsWUFBWSxFQUFDO29CQUNUO3dCQUNJLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixJQUFJLEVBQUUsU0FBUztxQkFDbEI7aUJBQ0o7YUFDSjtTQUNKO1FBQ0QsYUFBYSxFQUFFO1lBQ1gsUUFBUSxFQUFFLEtBQUs7WUFDZixxQkFBcUIsRUFBQztnQkFDbEIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsTUFBTSxFQUFDLEVBQUU7YUFDWjtZQUNELHNCQUFzQixFQUFDO2dCQUNuQixJQUFJLEVBQUUsU0FBUztnQkFDZixNQUFNLEVBQUMsRUFBRTthQUNaO1NBQ0o7UUFDRCxjQUFjLEVBQUU7WUFDWixNQUFNLEVBQUMsRUFBRTtTQUNaO0tBQ0o7Q0FDSixDQUFDO0FBR0ssSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBWSxTQUFRLHNCQUFTO0lBSXRDLFlBQVksS0FBd0I7UUFDaEMsS0FBSyxDQUFDLElBQUEsb0JBQUssRUFBQyxZQUFZLEVBQUUsS0FBSyxh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QUFvQixDQUFDO0lBQ2hDLENBQUM7Q0FDSixDQUFBO0FBMUtZLGtDQUFXO3NCQUFYLFdBQVc7SUFEdkIsbUJBQVc7R0FDQyxXQUFXLENBMEt2QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEt1YmVybmV0ZXNNYW5pZmVzdCwgU2VydmljZUFjY291bnQgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgKiBhcyBzMyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tIFwidHMtZGVlcG1lcmdlXCI7XG5pbXBvcnQgeyBDbHVzdGVySW5mbyB9IGZyb20gXCIuLi8uLi9zcGlcIjtcbmltcG9ydCB7IGNyZWF0ZU5hbWVzcGFjZSwgc3VwcG9ydHNBTEwgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcbmltcG9ydCB7IEhlbG1BZGRPbiwgSGVsbUFkZE9uVXNlclByb3BzIH0gZnJvbSBcIi4uL2hlbG0tYWRkb25cIjtcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBhZGQtb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmVsZXJvQWRkT25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7ICAgIFxuICAgIGNyZWF0ZU5hbWVzcGFjZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZWZhdWx0cyBvcHRpb25zIGZvciB0aGUgYWRkLW9uXG4gKi9cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgICBuYW1lOiAndmVsZXJvJyxcbiAgICB2ZXJzaW9uOiBcIjMuMi4wXCIsXG4gICAgbmFtZXNwYWNlOiBcInZlbGVyb1wiLFxuICAgIGNyZWF0ZU5hbWVzcGFjZTogdHJ1ZSxcbiAgICBjaGFydDogXCJ2ZWxlcm9cIixcbiAgICByZXBvc2l0b3J5OiBcImh0dHBzOi8vdm13YXJlLXRhbnp1LmdpdGh1Yi5pby9oZWxtLWNoYXJ0cy9cIixcbiAgICByZWxlYXNlOiBcImJsdWVwcmludHMtYWRkb24tdmVsZXJvXCIsXG4gICAgdmFsdWVzOntcbiAgICAgICAgaW5pdENvbnRhaW5lcnM6W1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwidmVsZXJvLXBsdWdpbi1mb3ItYXdzXCIsXG4gICAgICAgICAgICAgICAgaW1hZ2U6IFwidmVsZXJvL3ZlbGVyby1wbHVnaW4tZm9yLWF3czp2MS4yLjBcIixcbiAgICAgICAgICAgICAgICBpbWFnZVB1bGxQb2xpY3k6IFwiSWZOb3RQcmVzZW50XCIsXG4gICAgICAgICAgICAgICAgdm9sdW1lTW91bnRzOltcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbW91bnRQYXRoOiBcIi90YXJnZXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwicGx1Z2luc1wiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgIHByb3ZpZGVyOiBcImF3c1wiLFxuICAgICAgICAgICAgYmFja3VwU3RvcmFnZUxvY2F0aW9uOntcbiAgICAgICAgICAgICAgICBuYW1lOiBcImRlZmF1bHRcIixcbiAgICAgICAgICAgICAgICBjb25maWc6e31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2b2x1bWVTbmFwc2hvdExvY2F0aW9uOntcbiAgICAgICAgICAgICAgICBuYW1lOiBcImRlZmF1bHRcIixcbiAgICAgICAgICAgICAgICBjb25maWc6e31cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHNlcnZpY2VBY2NvdW50OiB7XG4gICAgICAgICAgICBzZXJ2ZXI6e31cbiAgICAgICAgfVxuICAgIH0sXG59O1xuXG5Ac3VwcG9ydHNBTExcbmV4cG9ydCBjbGFzcyBWZWxlcm9BZGRPbiBleHRlbmRzIEhlbG1BZGRPbiB7XG5cbiAgICBwcml2YXRlIG9wdGlvbnM6IFJlcXVpcmVkPFZlbGVyb0FkZE9uUHJvcHM+O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM/OiBWZWxlcm9BZGRPblByb3BzKSB7XG4gICAgICAgIHN1cGVyKG1lcmdlKGRlZmF1bHRQcm9wcywgcHJvcHMgPz8ge30pKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdGhpcy5wcm9wcyBhcyBSZXF1aXJlZDxWZWxlcm9BZGRPblByb3BzPjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgYWRkLW9uIGNvbnRyYWN0IGRlcGxveSBtZXRob2QuXG4gICAgKi9cbiAgICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogUHJvbWlzZTxDb25zdHJ1Y3Q+IHtcbiAgICAgICAgY29uc3QgY2x1c3RlciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXI7XG4gICAgICAgIGNvbnN0IHByb3BzID0gdGhpcy5vcHRpb25zO1xuICAgICAgICAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBTMyBidWNrZXQgaWYgbm8gZXhpc3RpbmcgYnVja2V0LCBjcmVhdGUgczMgYnVja2V0IGFuZCBjb3JyZXNwb25kaW5nIEtNUyBrZXlcbiAgICAgICAgY29uc3QgczNCdWNrZXQgPSB0aGlzLmdldE9yQ3JlYXRlUzNCdWNrZXQoY2x1c3RlckluZm8sIFwiYmFja3VwLWJ1Y2tldFwiLCBwcm9wcy52YWx1ZXMuY29uZmlndXJhdGlvbi5iYWNrdXBTdG9yYWdlTG9jYXRpb24uYnVja2V0KTtcblxuICAgICAgICAvLyBDcmVhdGUgTmFtZXNwYWNlIGlmIG5hbWVzcGFjZSBpcyBub3QgZXhwbGljaWVkIGRlZmluZWQuXG4gICAgICAgIGNvbnN0IHZlbGVyb05hbWVzcGFjZSA9IHRoaXMuY3JlYXRlTmFtZXNwYWNlSWZOZWVkZWQoY2x1c3RlckluZm8sIFwidmVsZXJvXCIsIHByb3BzLm5hbWVzcGFjZSwgcHJvcHMuY3JlYXRlTmFtZXNwYWNlKTtcblxuICAgICAgICAvLyBTZXR1cCBJQU0gUm9sZSBmb3IgU2VydmljZSBBY2NvdW50cyAoSVJTQSkgZm9yIHRoZSBWZWxlcm8gU2VydmljZSBBY2NvdW50ICAgIFxuICAgICAgICBjb25zdCB2ZWxlcm9TZXJ2aWNlQWNjb3VudCA9IHRoaXMuY3JlYXRlU2VydmljZUFjY291bnRXaXRoSWFtUm9sZXMoY2x1c3RlckluZm8sIFwidmVsZXJvLWFjY291bnRcIiwgdmVsZXJvTmFtZXNwYWNlLm5hbWUsIHMzQnVja2V0KTtcbiAgICAgICAgXG4gICAgICAgIC8vIGlmIHZlbGVyb05hbWUgc3BhY2UgZG9lcyBub3QgZXhpc3QgYW5kIG5lZWRzIGNyZWF0aW9uLCBhZGQgdGhlIGRlcGVuZGVuY3lcbiAgICAgICAgaWYgKHZlbGVyb05hbWVzcGFjZS5tYW5pZmVzdCkge1xuICAgICAgICAgICAgdmVsZXJvU2VydmljZUFjY291bnQubm9kZS5hZGREZXBlbmRlbmN5KHZlbGVyb05hbWVzcGFjZS5tYW5pZmVzdCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFNldHVwIHRoZSB2YWx1ZXMgZm9yIHRoZSBoZWxtIGNoYXJ0XG4gICAgICAgIGNvbnN0IHZhbHVlVmFyaWFibGUgPSB7XG4gICAgICAgICAgICB2YWx1ZXM6IHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGJhY2t1cFN0b3JhZ2VMb2NhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4OiBwcm9wcy52YWx1ZXMhLmNvbmZpZ3VyYXRpb24uYmFja3VwU3RvcmFnZUxvY2F0aW9uLnByZWZpeCA/PyBcInZlbGVyby9cIiArIGNsdXN0ZXIuY2x1c3Rlck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBidWNrZXQ6IHMzQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiBwcm9wcy52YWx1ZXMhLmNvbmZpZ3VyYXRpb24uYmFja3VwU3RvcmFnZUxvY2F0aW9uLmNvbmZpZy5yZWdpb24gPz8gY2x1c3Rlci5zdGFjay5yZWdpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHZvbHVtZVNuYXBzaG90TG9jYXRpb246e1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpb246IHByb3BzLnZhbHVlcyEuY29uZmlndXJhdGlvbi5iYWNrdXBTdG9yYWdlTG9jYXRpb24uY29uZmlnLnJlZ2lvbiA/PyBjbHVzdGVyLnN0YWNrLnJlZ2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAvLyBJQU0gcm9sZSBmb3IgU2VydmljZSBBY2NvdW50XG4gICAgICAgICAgICAgICAgc2VydmljZUFjY291bnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogdmVsZXJvU2VydmljZUFjY291bnQuc2VydmljZUFjY291bnROYW1lLCAgICBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgdmFsdWVzID0gbWVyZ2UocHJvcHMudmFsdWVzISwgdmFsdWVWYXJpYWJsZS52YWx1ZXMpID8/IHt9OyBcbiBcbiAgICAgICAgY29uc3QgY2hhcnROb2RlID0gdGhpcy5hZGRIZWxtQ2hhcnQoY2x1c3RlckluZm8sIHZhbHVlcyk7XG4gICAgICAgIGNoYXJ0Tm9kZS5ub2RlLmFkZERlcGVuZGVuY3kodmVsZXJvU2VydmljZUFjY291bnQpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNoYXJ0Tm9kZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIFMzIEJ1Y2tldFxuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mbyBcbiAgICAgKiBAcGFyYW0gaWQgUzMtQnVja2V0LVBvc3RmaXggXG4gICAgICogQHBhcmFtIGV4aXN0aW5nQnVja2V0TmFtZSBleGl0aW5nIHByb3ZpZGVkIFMzIEJ1Y2tldE5hbWUgaWYgaXQgZXhpc3RzIFxuICAgICAqIEByZXR1cm5zIHRoZSBleGlzdGluZyBwcm92aWRlZCBTMyBidWNrZXQgIG9yIHRoZSBuZXdseSBjcmVhdGVkIFMzIGJ1Y2tldCBhcyBzMy5JQnVja2V0XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldE9yQ3JlYXRlUzNCdWNrZXQoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvLCBpZDogc3RyaW5nLCBleGlzdGluZ0J1Y2tldE5hbWU6IG51bGx8c3RyaW5nICk6IHMzLklCdWNrZXQge1xuICAgICAgICBpZiAoIWV4aXN0aW5nQnVja2V0TmFtZSl7XG4gICAgICAgICAgICBjb25zdCBidWNrZXQgPSBuZXcgczMuQnVja2V0KGNsdXN0ZXJJbmZvLmNsdXN0ZXIsIFwidmVsZXJvLSR7aWR9XCIsIHtcbiAgICAgICAgICAgICAgICBlbmNyeXB0aW9uOiBzMy5CdWNrZXRFbmNyeXB0aW9uLktNU19NQU5BR0VELCAvLyBWZWxlcm8gS25vd24gYnVnIGZvciBzdXBwb3J0IHdpdGggUzMgd2l0aCBTU0UtS01TIHdpdGggQ01LLCB0aHVzIGl0IGRvZXMgbm90IHN1cHBvcnQgUzMgQnVja2V0IEtleTogaHR0cHM6Ly9naXRodWIuY29tL3Ztd2FyZS10YW56dS9oZWxtLWNoYXJ0cy9pc3N1ZXMvODNcbiAgICAgICAgICAgICAgICBibG9ja1B1YmxpY0FjY2VzczogczMuQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLCAvLyBCbG9jayBQdWJsaWMgQWNjZXNzIGZvciBTM1xuICAgICAgICAgICAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVuZm9yY2VTU0w6IHRydWUgLy8gRW5jcnlwdGlvbiBpbiBUcmFuc2l0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBzMy5CdWNrZXQuZnJvbUJ1Y2tldE5hbWUoY2x1c3RlckluZm8uY2x1c3RlciwgJ2dldE9yQ3JlYXRlUzNCdWNrZXQnLCBidWNrZXQuYnVja2V0TmFtZSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHMzLkJ1Y2tldC5mcm9tQnVja2V0TmFtZShjbHVzdGVySW5mby5jbHVzdGVyLCAnZ2V0T3JDcmVhdGVTM0J1Y2tldCcsIGV4aXN0aW5nQnVja2V0TmFtZSApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIFZlbGVybyBOYW1lc3BhY2Ugd2hlcmUgVmVsZXJvIHdpbGwgYmUgaW5zdGFsbGVkIG9udG9cbiAgICAgKiBAcGFyYW0gY2x1c3RlckluZm9cbiAgICAgKiBAcGFyYW0gZGVmYXVsdE5hbWUgdGhlIERlZmF1bHQgTmFtZXNwYWNlIGZvciBWZWxlcm8gaWYgbm90aGluZyBzcGVjaWZpZWQgXG4gICAgICogQHBhcmFtIG5hbWVzcGFjZVxuICAgICAqIEByZXR1cm5zIHRoZSBuYW1lc3BhY2UgY3JlYXRlZCBvciBleGlzdGVkLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVOYW1lc3BhY2VJZk5lZWRlZChjbHVzdGVySW5mbzogQ2x1c3RlckluZm8sIGRlZmF1bHROYW1lOiBzdHJpbmcsIG5hbWVzcGFjZTogc3RyaW5nLCBjcmVhdGU6IGJvb2xlYW4pOiB7bmFtZTogc3RyaW5nLCBtYW5pZmVzdD86IEt1YmVybmV0ZXNNYW5pZmVzdH0ge1xuICAgICAgICAvLyBDcmVhdGUgTmFtZXNwYWNlIGlmIG5hbWVzcGFjZSBpcyBub3QgZXhwbGljaWVkIGRlZmluZWQuXG4gICAgICAgIGlmIChuYW1lc3BhY2Upe1xuICAgICAgICAgICAgLy8gQ3JlYXRlIE5hbWVzcGFjZSBpZiB0aGUgXCJjcmVhdGVcIiBvcHRpb24gaXMgdHJ1ZVxuICAgICAgICAgICAgaWYgKGNyZWF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWVzcGFjZU1hbmlmZXN0ID0gY3JlYXRlTmFtZXNwYWNlKG5hbWVzcGFjZSwgY2x1c3RlckluZm8uY2x1c3Rlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbmFtZTogbmFtZXNwYWNlLCBtYW5pZmVzdDogbmFtZXNwYWNlTWFuaWZlc3QgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIHRoZSBcImNyZWF0ZVwiIG9wdGlvbiBpZiBmYWxzZSwgdGhlbiBuYW1lc3BhY2Ugd2lsbCBub3QgYmUgY3JlYXRlZCwgcmV0dXJuIG5hbWVzcGFjZS5uYW1lXG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHJldHVybiB7IG5hbWU6IG5hbWVzcGFjZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICByZXR1cm4geyBuYW1lOiBkZWZhdWx0TmFtZSB9OyAvLyBpbml0aWFsIHZhbHVlIG9mIHZlbGVyb05hbWVzcGFjZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIFZlbGVybyBOYW1lc3BhY2Ugd2hlcmUgVmVsZXJvIHdpbGwgYmUgaW5zdGFsbGVkIG9udG9cbiAgICAgKiBAcGFyYW0gY2x1c3RlckluZm9cbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKiBAcGFyYW0gbmFtZXNwYWNlIFZlbGVybyBuYW1lc3BhY2UgbmFtZVxuICAgICAqIEBwYXJhbSBzM0J1Y2tldE5hbWUgdGhlIFMzIEJ1Y2tldE5hbWUgd2hlcmUgVmVsZXJvIHdpbGwgc3RvcmVzIHRoZSBiYWNrdXAgb250b1xuICAgICAqIEByZXR1cm5zIHRoZSBzZXJ2aWNlIEFjY291bnRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlU2VydmljZUFjY291bnRXaXRoSWFtUm9sZXMoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvLCBpZDogc3RyaW5nLCBuYW1lc3BhY2U6IHN0cmluZywgczNCdWNrZXQ6IHMzLklCdWNrZXQpOiBTZXJ2aWNlQWNjb3VudCB7XG4gICAgICAgIC8vIFNldHVwIElBTSBSb2xlIGZvciBTZXJ2aWNlIEFjY291bnRzIChJUlNBKSBmb3IgdGhlIFZlbGVybyBTZXJ2aWNlIEFjY291bnRcbiAgICAgICAgY29uc3QgdmVsZXJvU2VydmljZUFjY291bnQgPSBjbHVzdGVySW5mby5jbHVzdGVyLmFkZFNlcnZpY2VBY2NvdW50IChcbiAgICAgICAgICAgIGlkLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6IGlkLFxuICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogbmFtZXNwYWNlXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gSUFNIHBvbGljeSBmb3IgVmVsZXJvXG4gICAgICAgIGNvbnN0IHZlbGVyb1BvbGljeURvY3VtZW50ID0ge1xuICAgICAgICAgICAgXCJWZXJzaW9uXCI6IFwiMjAxMi0xMC0xN1wiLFxuICAgICAgICAgICAgXCJTdGF0ZW1lbnRcIjogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVWb2x1bWVzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVTbmFwc2hvdHNcIixcbiAgICAgICAgICAgICAgICAgICAgICBcImVjMjpDcmVhdGVUYWdzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJlYzI6Q3JlYXRlVm9sdW1lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJlYzI6Q3JlYXRlU25hcHNob3RcIixcbiAgICAgICAgICAgICAgICAgICAgICBcImVjMjpEZWxldGVTbmFwc2hvdFwiXG4gICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIlxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJzMzpHZXRPYmplY3RcIixcbiAgICAgICAgICAgICAgICAgICAgXCJzMzpEZWxldGVPYmplY3RcIixcbiAgICAgICAgICAgICAgICAgICAgXCJzMzpQdXRPYmplY3RcIixcbiAgICAgICAgICAgICAgICAgICAgXCJzMzpBYm9ydE11bHRpcGFydFVwbG9hZFwiLFxuICAgICAgICAgICAgICAgICAgICBcInMzOkxpc3RNdWx0aXBhcnRVcGxvYWRQYXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcInMzOkxpc3RCdWNrZXRcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBbXG4gICAgICAgICAgICAgICAgICAgIHMzQnVja2V0LmFybkZvck9iamVjdHMoXCIqXCIpLFxuICAgICAgICAgICAgICAgICAgICBzM0J1Y2tldC5idWNrZXRBcm4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgdmVsZXJvQ3VzdG9tUG9saWN5RG9jdW1lbnQgPSBpYW0uUG9saWN5RG9jdW1lbnQuZnJvbUpzb24odmVsZXJvUG9saWN5RG9jdW1lbnQpO1xuICAgICAgICBjb25zdCB2ZWxlcm9Qb2xpY3kgPSBuZXcgaWFtLk1hbmFnZWRQb2xpY3koY2x1c3RlckluZm8uY2x1c3RlciwgXCJ2ZWxlcm8tbWFuYWdlZC1wb2xpY3lcIiwge1xuICAgICAgICAgICAgZG9jdW1lbnQ6IHZlbGVyb0N1c3RvbVBvbGljeURvY3VtZW50XG4gICAgICAgIH0pO1xuICAgICAgICB2ZWxlcm9TZXJ2aWNlQWNjb3VudC5yb2xlLmFkZE1hbmFnZWRQb2xpY3kodmVsZXJvUG9saWN5KTtcbiAgICAgICAgcmV0dXJuIHZlbGVyb1NlcnZpY2VBY2NvdW50O1xuICAgIH1cbn0iXX0=