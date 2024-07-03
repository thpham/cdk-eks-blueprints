"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarpenterAddOn = void 0;
const assert = require("assert");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_events_1 = require("aws-cdk-lib/aws-events");
const aws_events_targets_1 = require("aws-cdk-lib/aws-events-targets");
const iam = require("aws-cdk-lib/aws-iam");
const sqs = require("aws-cdk-lib/aws-sqs");
const semver = require("semver");
const ts_deepmerge_1 = require("ts-deepmerge");
const md5 = require("ts-md5");
const utils = require("../../utils");
const helm_addon_1 = require("../helm-addon");
const iam_1 = require("./iam");
class versionMap {
    static has(version) {
        return this.versionMap.has(version.version);
    }
    static get(version) {
        return this.versionMap.get(version.version);
    }
}
versionMap.versionMap = new Map([
    [aws_eks_1.KubernetesVersion.V1_30.version, '0.37.0'],
    [aws_eks_1.KubernetesVersion.V1_29.version, '0.34.0'],
    [aws_eks_1.KubernetesVersion.V1_28.version, '0.31.0'],
    [aws_eks_1.KubernetesVersion.V1_27.version, '0.28.0'],
    [aws_eks_1.KubernetesVersion.V1_26.version, '0.28.0'],
    [aws_eks_1.KubernetesVersion.V1_25.version, '0.25.0'],
    [aws_eks_1.KubernetesVersion.V1_24.version, '0.21.0'],
    [aws_eks_1.KubernetesVersion.V1_23.version, '0.21.0'],
]);
const KARPENTER = 'karpenter';
const RELEASE = 'blueprints-addon-karpenter';
/**
 * Defaults options for the add-on
 */
const defaultProps = {
    name: KARPENTER,
    namespace: KARPENTER,
    version: 'v0.34.1',
    chart: KARPENTER,
    release: KARPENTER,
    repository: 'oci://public.ecr.aws/karpenter/karpenter',
};
/**
 * Implementation of the Karpenter add-on
 */
let KarpenterAddOn = class KarpenterAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
        assert(clusterInfo.cluster instanceof aws_eks_1.Cluster, "KarpenterAddOn cannot be used with imported clusters as it requires changes to the cluster authentication.");
        const cluster = clusterInfo.cluster;
        const endpoint = cluster.clusterEndpoint;
        const name = cluster.clusterName;
        const partition = cluster.stack.partition;
        const stackName = cluster.stack.stackName;
        const region = cluster.stack.region;
        let values = (_a = this.options.values) !== null && _a !== void 0 ? _a : {};
        const version = this.options.version;
        const interruption = this.options.interruptionHandling || false;
        const installCRDs = this.options.installCRDs || false;
        const podIdentity = this.options.podIdentity || false;
        // NodePool variables
        const labels = ((_b = this.options.nodePoolSpec) === null || _b === void 0 ? void 0 : _b.labels) || {};
        const annotations = ((_c = this.options.nodePoolSpec) === null || _c === void 0 ? void 0 : _c.annotations) || {};
        const taints = ((_d = this.options.nodePoolSpec) === null || _d === void 0 ? void 0 : _d.taints) || [];
        const startupTaints = ((_e = this.options.nodePoolSpec) === null || _e === void 0 ? void 0 : _e.startupTaints) || [];
        const requirements = ((_f = this.options.nodePoolSpec) === null || _f === void 0 ? void 0 : _f.requirements) || [];
        const consol = ((_g = this.options.nodePoolSpec) === null || _g === void 0 ? void 0 : _g.consolidation) || null;
        const ttlSecondsAfterEmpty = ((_h = this.options.nodePoolSpec) === null || _h === void 0 ? void 0 : _h.ttlSecondsAfterEmpty) || null;
        const ttlSecondsUntilExpired = ((_j = this.options.nodePoolSpec) === null || _j === void 0 ? void 0 : _j.ttlSecondsUntilExpired) || null;
        const disruption = ((_k = this.options.nodePoolSpec) === null || _k === void 0 ? void 0 : _k.disruption) || null;
        const limits = ((_l = this.options.nodePoolSpec) === null || _l === void 0 ? void 0 : _l.limits) || null;
        const weight = ((_m = this.options.nodePoolSpec) === null || _m === void 0 ? void 0 : _m.weight) || null;
        // NodeClass variables
        const subnetSelector = (_o = this.options.ec2NodeClassSpec) === null || _o === void 0 ? void 0 : _o.subnetSelector;
        const sgSelector = (_p = this.options.ec2NodeClassSpec) === null || _p === void 0 ? void 0 : _p.securityGroupSelector;
        const subnetSelectorTerms = (_q = this.options.ec2NodeClassSpec) === null || _q === void 0 ? void 0 : _q.subnetSelectorTerms;
        const sgSelectorTerms = (_r = this.options.ec2NodeClassSpec) === null || _r === void 0 ? void 0 : _r.securityGroupSelectorTerms;
        const amiFamily = (_s = this.options.ec2NodeClassSpec) === null || _s === void 0 ? void 0 : _s.amiFamily;
        const amiSelector = ((_t = this.options.ec2NodeClassSpec) === null || _t === void 0 ? void 0 : _t.amiSelector) || {};
        const amiSelectorTerms = (_u = this.options.ec2NodeClassSpec) === null || _u === void 0 ? void 0 : _u.amiSelectorTerms;
        const instanceStorePolicy = ((_v = this.options.ec2NodeClassSpec) === null || _v === void 0 ? void 0 : _v.instanceStorePolicy) || null;
        const userData = ((_w = this.options.ec2NodeClassSpec) === null || _w === void 0 ? void 0 : _w.userData) || "";
        const instanceProf = (_x = this.options.ec2NodeClassSpec) === null || _x === void 0 ? void 0 : _x.instanceProfile;
        const tags = ((_y = this.options.ec2NodeClassSpec) === null || _y === void 0 ? void 0 : _y.tags) || {};
        const metadataOptions = ((_z = this.options.ec2NodeClassSpec) === null || _z === void 0 ? void 0 : _z.metadataOptions) || {
            httpEndpoint: "enabled",
            httpProtocolIPv6: "disabled",
            httpPutResponseHopLimit: 2,
            httpTokens: "required"
        };
        const blockDeviceMappings = ((_0 = this.options.ec2NodeClassSpec) === null || _0 === void 0 ? void 0 : _0.blockDeviceMappings) || [];
        const detailedMonitoring = ((_1 = this.options.ec2NodeClassSpec) === null || _1 === void 0 ? void 0 : _1.detailedMonitoring) || false;
        // Check Kubernetes and Karpenter version compatibility for warning
        this.isCompatible(version, clusterInfo.version);
        // Version feature checks for errors
        this.versionFeatureChecksForError(clusterInfo, version, disruption, consol, ttlSecondsAfterEmpty, ttlSecondsUntilExpired, this.options.ec2NodeClassSpec, amiFamily);
        // Set up the node role and instance profile
        const [karpenterNodeRole, karpenterInstanceProfile] = this.setUpNodeRole(cluster, stackName, region);
        // Create the controller policy
        let karpenterPolicyDocument;
        if (semver.gte(version, "v0.32.0")) {
            karpenterPolicyDocument = iam.PolicyDocument.fromJson((0, iam_1.KarpenterControllerPolicyBeta)(cluster, partition, region));
        }
        else {
            karpenterPolicyDocument = iam.PolicyDocument.fromJson(iam_1.KarpenterControllerPolicy);
        }
        karpenterPolicyDocument.addStatements(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                "iam:PassRole",
            ],
            resources: [`${karpenterNodeRole.roleArn}`]
        }));
        // Support for Native spot interruption
        if (interruption) {
            // Create Interruption Queue
            const queue = new sqs.Queue(cluster.stack, 'karpenter-queue', {
                queueName: stackName,
                retentionPeriod: aws_cdk_lib_1.Duration.seconds(300),
            });
            queue.addToResourcePolicy(new iam.PolicyStatement({
                sid: 'EC2InterruptionPolicy',
                effect: iam.Effect.ALLOW,
                principals: [
                    new iam.ServicePrincipal('sqs.amazonaws.com'),
                    new iam.ServicePrincipal('events.amazonaws.com'),
                ],
                actions: [
                    "sqs:SendMessage"
                ],
                resources: [`${queue.queueArn}`]
            }));
            // Add Interruption Rules
            new aws_events_1.Rule(cluster.stack, 'schedule-change-rule', {
                eventPattern: {
                    source: ["aws.health"],
                    detailType: ['AWS Health Event']
                },
            }).addTarget(new aws_events_targets_1.SqsQueue(queue));
            new aws_events_1.Rule(cluster.stack, 'spot-interruption-rule', {
                eventPattern: {
                    source: ["aws.ec2"],
                    detailType: ['EC2 Spot Instance Interruption Warning']
                },
            }).addTarget(new aws_events_targets_1.SqsQueue(queue));
            new aws_events_1.Rule(cluster.stack, 'rebalance-rule', {
                eventPattern: {
                    source: ["aws.ec2"],
                    detailType: ['EC2 Instance Rebalance Recommendation']
                },
            }).addTarget(new aws_events_targets_1.SqsQueue(queue));
            new aws_events_1.Rule(cluster.stack, 'inst-state-change-rule', {
                eventPattern: {
                    source: ["aws.ec2"],
                    detailType: ['C2 Instance State-change Notification']
                },
            }).addTarget(new aws_events_targets_1.SqsQueue(queue));
            // Add policy to the node role to allow access to the Interruption Queue
            const interruptionQueueStatement = new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    "sqs:DeleteMessage",
                    "sqs:GetQueueUrl",
                    "sqs:GetQueueAttributes",
                    "sqs:ReceiveMessage"
                ],
                resources: [`${queue.queueArn}`]
            });
            karpenterPolicyDocument.addStatements(interruptionQueueStatement);
        }
        // Create Namespace
        const ns = utils.createNamespace(this.options.namespace, cluster, true, true);
        let sa;
        let saAnnotation;
        if (podIdentity && semver.gte(`${clusterInfo.version.version}.0`, '1.24.0') && semver.gte(version, "v0.35.0")) {
            sa = utils.podIdentityAssociation(cluster, RELEASE, this.options.namespace, karpenterPolicyDocument);
            saAnnotation = {};
        }
        else {
            sa = utils.createServiceAccount(cluster, RELEASE, this.options.namespace, karpenterPolicyDocument);
            saAnnotation = { "eks.amazonaws.com/role-arn": sa.role.roleArn };
        }
        sa.node.addDependency(ns);
        // Create global helm values based on v1beta1 migration as shown below:
        // https://karpenter.sh/v0.32/upgrading/v1beta1-migration/#helm-values
        let globalSettings = {
            clusterName: name,
            clusterEndpoint: endpoint
        };
        if (semver.lt(version, '0.32.0')) {
            globalSettings = (0, ts_deepmerge_1.merge)(globalSettings, {
                defaultInstanceProfile: karpenterInstanceProfile.instanceProfileName,
                interruptionQueueName: interruption ? stackName : ""
            });
        }
        else {
            globalSettings = (0, ts_deepmerge_1.merge)(globalSettings, {
                interruptionQueue: interruption ? stackName : ""
            });
        }
        if (semver.lt(version, '0.32.0')) {
            utils.setPath(values, "settings.aws", (0, ts_deepmerge_1.merge)(globalSettings, (_3 = (_2 = values === null || values === void 0 ? void 0 : values.settings) === null || _2 === void 0 ? void 0 : _2.aws) !== null && _3 !== void 0 ? _3 : {}));
        }
        else {
            utils.setPath(values, "settings", (0, ts_deepmerge_1.merge)(globalSettings, (_4 = values === null || values === void 0 ? void 0 : values.settings) !== null && _4 !== void 0 ? _4 : {}));
        }
        // Let Helm create the service account if using pod identity
        const saValues = {
            serviceAccount: {
                create: podIdentity,
                name: RELEASE,
                annotations: saAnnotation,
            }
        };
        values = (0, ts_deepmerge_1.merge)(values, saValues);
        // Install HelmChart using user defined value or default of 5 minutes.
        const helmChartTimeout = this.options.helmChartTimeout || aws_cdk_lib_1.Duration.minutes(5);
        const karpenterChart = this.addHelmChart(clusterInfo, values, false, true, helmChartTimeout);
        karpenterChart.node.addDependency(sa);
        if (clusterInfo.nodeGroups) {
            clusterInfo.nodeGroups.forEach(n => karpenterChart.node.addDependency(n));
        }
        if (semver.gte(version, "0.32.0") && installCRDs) {
            let _version = version;
            if (!version.startsWith('v')) {
                _version = `v${version}`;
            }
            const CRDs = [
                ["karpentersh-nodepool-beta1-crd", `https://raw.githubusercontent.com/aws/karpenter/${_version}/pkg/apis/crds/karpenter.sh_nodepools.yaml`],
                ["karpentersh-nodeclaims-beta1-crd", `https://raw.githubusercontent.com/aws/karpenter/${_version}/pkg/apis/crds/karpenter.sh_nodeclaims.yaml`],
                ["karpenterk8s-ec2nodeclasses-beta1-crd", `https://raw.githubusercontent.com/aws/karpenter/${_version}/pkg/apis/crds/karpenter.k8s.aws_ec2nodeclasses.yaml`],
            ];
            // loop over the CRD's and load the yaml and deploy the manifest
            for (const [crdName, crdUrl] of CRDs) {
                const crdManifest = utils.loadExternalYaml(crdUrl);
                const manifest = cluster.addManifest(crdName, crdManifest);
                // We want these installed before the karpenterChart, or helm will timeout waiting for it to stabilize
                karpenterChart.node.addDependency(manifest);
            }
        }
        // Deploy Provisioner (Alpha) or NodePool (Beta) CRD based on the Karpenter Version
        if (this.options.nodePoolSpec) {
            let pool;
            if (semver.gte(version, '0.32.0')) {
                pool = {
                    apiVersion: 'karpenter.sh/v1beta1',
                    kind: 'NodePool',
                    metadata: { name: 'default-nodepool' },
                    spec: {
                        template: {
                            metadata: {
                                labels: labels,
                                annotations: annotations,
                            },
                            spec: {
                                nodeClassRef: {
                                    name: "default-ec2nodeclass"
                                },
                                taints: taints,
                                startupTaints: startupTaints,
                                requirements: this.convert(requirements),
                            }
                        },
                        disruption: disruption,
                        limits: limits,
                        weight: weight,
                    },
                };
            }
            else {
                pool = {
                    apiVersion: 'karpenter.sh/v1alpha5',
                    kind: 'Provisioner',
                    metadata: { name: 'default-provisioner' },
                    spec: {
                        providerRef: {
                            name: "default-nodetemplate"
                        },
                        taints: taints,
                        startupTaints: startupTaints,
                        labels: labels,
                        annotations: annotations,
                        requirements: this.convert(requirements),
                        limits: {
                            resources: limits,
                        },
                        consolidation: consol,
                        ttlSecondsUntilExpired: ttlSecondsUntilExpired,
                        ttlSecondsAfterEmpty: ttlSecondsAfterEmpty,
                        weight: weight,
                    },
                };
            }
            const poolManifest = cluster.addManifest('default-pool', pool);
            poolManifest.node.addDependency(karpenterChart);
            // Deploy AWSNodeTemplate (Alpha) or EC2NodeClass (Beta) CRD based on the Karpenter Version
            if (this.options.ec2NodeClassSpec) {
                let ec2Node;
                if (semver.gte(version, '0.32.0')) {
                    ec2Node = {
                        apiVersion: "karpenter.k8s.aws/v1beta1",
                        kind: "EC2NodeClass",
                        metadata: {
                            name: "default-ec2nodeclass"
                        },
                        spec: {
                            amiFamily: amiFamily,
                            subnetSelectorTerms: subnetSelectorTerms,
                            securityGroupSelectorTerms: sgSelectorTerms,
                            amiSelectorTerms: amiSelectorTerms,
                            userData: userData,
                            tags: tags,
                            metadataOptions: metadataOptions,
                            blockDeviceMappings: blockDeviceMappings,
                            detailedMonitoring: detailedMonitoring,
                        },
                    };
                    // Provide custom Instance Profile to replace role if provided, else use the role created with the addon
                    if (instanceProf) {
                        ec2Node = (0, ts_deepmerge_1.merge)(ec2Node, { spec: { instanceProfile: instanceProf } });
                    }
                    else {
                        ec2Node = (0, ts_deepmerge_1.merge)(ec2Node, { spec: { role: karpenterNodeRole.roleName } });
                    }
                    // Instance Store Policy added for v0.34.0 and up
                    if (semver.gte(version, '0.34.0')) {
                        ec2Node = (0, ts_deepmerge_1.merge)(ec2Node, { spec: { instanceStorePolicy: instanceStorePolicy } });
                    }
                }
                else {
                    ec2Node = {
                        apiVersion: "karpenter.k8s.aws/v1alpha1",
                        kind: "AWSNodeTemplate",
                        metadata: {
                            name: "default-nodetemplate"
                        },
                        spec: {
                            subnetSelector: subnetSelector,
                            securityGroupSelector: sgSelector,
                            instanceProfile: instanceProf ? instanceProf : null,
                            amiFamily: amiFamily ? amiFamily : "AL2",
                            amiSelector: amiSelector,
                            tags: tags,
                            metadataOptions: metadataOptions,
                            blockDeviceMappings: blockDeviceMappings,
                            userData: userData,
                        },
                    };
                    // Add EC2 Detailed Monitoring for v0.22.0 and up
                    if (semver.gte(version, '0.22.0')) {
                        ec2Node = (0, ts_deepmerge_1.merge)(ec2Node, { spec: { detailedMonitoring: detailedMonitoring } });
                    }
                }
                const nodeManifest = cluster.addManifest('default-node-template', ec2Node);
                nodeManifest.node.addDependency(poolManifest);
            }
        }
        return Promise.resolve(karpenterChart);
    }
    /**
     * Helper function to convert a key-pair values (with an operator)
     * of spec configurations to appropriate json format for addManifest function
     * @param reqs
     * @returns newReqs
     * */
    convert(reqs) {
        const newReqs = [];
        for (let req of reqs) {
            const key = req['key'];
            const op = req['operator'];
            const val = req['values'];
            const requirement = {
                "key": key,
                "operator": op,
                "values": val
            };
            newReqs.push(requirement);
        }
        return newReqs;
    }
    /**
     * Helper function to ensure right features are added as part of the configuration
     * for the right version of the add-on
     * @param clusterInfo
     * @param version version of the add-on
     * @param disruption disruption feature available with the Beta CRDs
     * @param consolidation consolidation setting available with the Alpha CRDs
     * @param ttlSecondsAfterEmpty ttlSecondsAfterEmpty setting
     * @param ttlSecondsUntilExpired ttlSecondsUntilExpired setting
     * @param ec2NodeClassSpec Node Class Spec
     * @param amiFamily AMI Family
     * @returns
     */
    versionFeatureChecksForError(clusterInfo, version, disruption, consolidation, ttlSecondsAfterEmpty, ttlSecondsUntilExpired, ec2NodeClassSpec, amiFamily) {
        // EC2 Detailed Monitoring is only available in versions 0.23.0 and above
        if (semver.lt(version, '0.23.0') && ec2NodeClassSpec) {
            assert(ec2NodeClassSpec["detailedMonitoring"] === undefined, "Detailed Monitoring is not available in this version of Karpenter. Please upgrade to at least 0.23.0.");
        }
        // Disruption budget should not exist for versions below 0.34.x
        if (semver.lt(version, '0.34.0')) {
            if (disruption) {
                assert(!disruption["budgets"], "You cannot set disruption budgets for this version of Karpenter. Please upgrade to 0.34.0 or higher.");
            }
        }
        // version check errors for v0.32.0 and up (beta CRDs)
        if (semver.gte(version, '0.32.0')) {
            // Consolidation features don't exist in beta CRDs
            assert(!consolidation && !ttlSecondsAfterEmpty && !ttlSecondsUntilExpired, 'Consolidation features are only available for previous versions of Karpenter.');
            // consolidateAfter cannot be set if policy is set to WhenUnderutilized
            if (disruption && disruption["consolidationPolicy"] == "WhenUnderutilized") {
                assert(!disruption["consolidateAfter"], 'You cannot set consolidateAfter value if the consolidation policy is set to Underutilized.');
            }
            // AMI Family, Security Group and Subnet terms must be provided, given EC2 NodeSpec
            if (ec2NodeClassSpec) {
                assert(amiFamily !== undefined, "Please provide the AMI Family for your EC2NodeClass.");
                assert(ec2NodeClassSpec["securityGroupSelectorTerms"] !== undefined, "Please provide SecurityGroupTerm for your EC2NodeClass.");
                assert(ec2NodeClassSpec["subnetSelectorTerms"] !== undefined, "Please provide subnetGroupTerm for your EC2NodeClass.");
            }
        }
        // version check errors for v0.31.x and down (alpha CRDs)
        // Includes checks for consolidation and disruption features
        if (semver.lt(version, '0.32.0')) {
            if (consolidation) {
                assert(!(consolidation.enabled && ttlSecondsAfterEmpty), 'Consolidation and ttlSecondsAfterEmpty must be mutually exclusive.');
            }
            assert(!disruption, 'Disruption configuration is only supported on versions v0.32.0 and later.');
            //Security Group and Subnet terms must be provided, given EC2 NodeSpec
            if (ec2NodeClassSpec) {
                assert(ec2NodeClassSpec["securityGroupSelector"] !== undefined, "Please provide SecurityGroupTerm for your AWSNodeTemplate.");
                assert(ec2NodeClassSpec["subnetSelector"] !== undefined, "Please provide subnetGroupTerm for your AWSNodeTemplate.");
            }
        }
        // We should block Node Termination Handler usage once Karpenter is leveraged
        assert(!clusterInfo.getProvisionedAddOn('AwsNodeTerminationHandlerAddOn'), 'Karpenter supports native interruption handling, so Node Termination Handler will not be necessary.');
    }
    /**
     * Helper function to set up the Karpenter Node Role and Instance Profile
     * Outputs to CloudFormation and map the role to the aws-auth ConfigMap
     * @param cluster EKS Cluster
     * @param stackName Name of the stack
     * @param region Region of the stack
     * @returns [karpenterNodeRole, karpenterInstanceProfile]
     */
    setUpNodeRole(cluster, stackName, region) {
        // Set up Node Role
        const karpenterNodeRole = new iam.Role(cluster, 'karpenter-node-role', {
            assumedBy: new iam.ServicePrincipal(`ec2.${cluster.stack.urlSuffix}`),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSWorkerNodePolicy"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ContainerRegistryReadOnly"),
                iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
            ],
            //roleName: `KarpenterNodeRole-${name}` // let role name to be generated as unique
        });
        // Set up Instance Profile
        const instanceProfileName = md5.Md5.hashStr(stackName + region);
        const karpenterInstanceProfile = new iam.CfnInstanceProfile(cluster, 'karpenter-instance-profile', {
            roles: [karpenterNodeRole.roleName],
            instanceProfileName: `KarpenterNodeInstanceProfile-${instanceProfileName}`,
            path: '/'
        });
        const clusterId = aws_cdk_lib_1.Names.uniqueId(cluster);
        //Cfn output for Node Role in case of needing to add additional policies
        new aws_cdk_lib_1.CfnOutput(cluster.stack, 'Karpenter Instance Node Role', {
            value: karpenterNodeRole.roleName,
            description: "Karpenter add-on Node Role name",
            exportName: clusterId + "KarpenterNodeRoleName",
        });
        //Cfn output for Instance Profile for creating additional provisioners
        new aws_cdk_lib_1.CfnOutput(cluster.stack, 'Karpenter Instance Profile name', {
            value: karpenterInstanceProfile ? karpenterInstanceProfile.instanceProfileName : "none",
            description: "Karpenter add-on Instance Profile name",
            exportName: clusterId + "KarpenterInstanceProfileName",
        });
        // Map Node Role to aws-auth
        cluster.awsAuth.addRoleMapping(karpenterNodeRole, {
            groups: ['system:bootstrapper', 'system:nodes'],
            username: 'system:node:{{EC2PrivateDNSName}}'
        });
        return [karpenterNodeRole, karpenterInstanceProfile];
    }
    /**
     * Helper function to check whether:
     * 1. Supported Karpenter versions are implemented, and
     * 2. Supported Kubernetes versions are deployed on the cluster to use Karpenter
     * It will reject the addon if the cluster uses deprecated Kubernetes version, and
     * Warn users about issues if incompatible Karpenter version is used for a particular cluster
     * given its Kubernetes version
     * @param karpenterVersion Karpenter version to be deployed
     * @param kubeVersion Cluster's Kubernetes version
     */
    isCompatible(karpenterVersion, kubeVersion) {
        assert(versionMap.has(kubeVersion), 'Please upgrade your EKS Kubernetes version to start using Karpenter.');
        assert(semver.gte(karpenterVersion, '0.21.0'), 'Please use Karpenter version 0.21.0 or above.');
        const compatibleVersion = versionMap.get(kubeVersion);
        if (semver.gt(compatibleVersion, karpenterVersion)) {
            console.warn(`Please use minimum Karpenter version for this Kubernetes Version: ${compatibleVersion}, otherwise you will run into compatibility issues.`);
        }
    }
};
exports.KarpenterAddOn = KarpenterAddOn;
__decorate([
    utils.conflictsWith('ClusterAutoScalerAddOn')
], KarpenterAddOn.prototype, "deploy", null);
exports.KarpenterAddOn = KarpenterAddOn = __decorate([
    utils.supportsALL
], KarpenterAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2thcnBlbnRlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxpQ0FBaUM7QUFDakMsNkNBQXlEO0FBQ3pELGlEQUFpRTtBQUNqRSx1REFBOEM7QUFDOUMsdUVBQTBEO0FBQzFELDJDQUEyQztBQUMzQywyQ0FBMkM7QUFFM0MsaUNBQWlDO0FBQ2pDLCtDQUFxQztBQUNyQyw4QkFBOEI7QUFFOUIscUNBQXFDO0FBQ3JDLDhDQUE4RTtBQUM5RSwrQkFBaUY7QUFFakYsTUFBTSxVQUFVO0lBV0wsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUEwQjtRQUMxQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBQ00sTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUEwQjtRQUMxQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QyxDQUFDOztBQWZ1QixxQkFBVSxHQUF3QixJQUFJLEdBQUcsQ0FBQztJQUM5RCxDQUFDLDJCQUFpQixDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO0lBQzNDLENBQUMsMkJBQWlCLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7SUFDM0MsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztJQUMzQyxDQUFDLDJCQUFpQixDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO0lBQzNDLENBQUMsMkJBQWlCLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7SUFDM0MsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztJQUMzQyxDQUFDLDJCQUFpQixDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO0lBQzNDLENBQUMsMkJBQWlCLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7Q0FDOUMsQ0FBQyxDQUFDO0FBMlFQLE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQztBQUM5QixNQUFNLE9BQU8sR0FBRyw0QkFBNEIsQ0FBQztBQUU3Qzs7R0FFRztBQUNILE1BQU0sWUFBWSxHQUFtQjtJQUNqQyxJQUFJLEVBQUUsU0FBUztJQUNmLFNBQVMsRUFBRSxTQUFTO0lBQ3BCLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLEtBQUssRUFBRSxTQUFTO0lBQ2hCLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFVBQVUsRUFBRSwwQ0FBMEM7Q0FDekQsQ0FBQztBQUVGOztHQUVHO0FBRUksSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLHNCQUFTO0lBSXpDLFlBQVksS0FBMkI7UUFDbkMsS0FBSyxDQUFDLEVBQUMsR0FBRyxZQUFZLEVBQUUsR0FBRyxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUM5QixDQUFDO0lBR0QsTUFBTSxDQUFDLFdBQXdCOztRQUMzQixNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sWUFBWSxpQkFBTyxFQUFFLDRHQUE0RyxDQUFDLENBQUM7UUFDN0osTUFBTSxPQUFPLEdBQWEsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUM5QyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDO1FBQ3pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFDakMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFFMUMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDMUMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFFcEMsSUFBSSxNQUFNLEdBQUcsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sbUNBQUksRUFBRSxDQUFDO1FBQ3ZDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBUSxDQUFDO1FBRXRDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLElBQUksS0FBSyxDQUFDO1FBQ2hFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQztRQUV0RCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxLQUFLLENBQUM7UUFFdEQscUJBQXFCO1FBQ3JCLE1BQU0sTUFBTSxHQUFHLENBQUEsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksMENBQUUsTUFBTSxLQUFJLEVBQUUsQ0FBQztRQUN2RCxNQUFNLFdBQVcsR0FBRyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLDBDQUFFLFdBQVcsS0FBSSxFQUFFLENBQUM7UUFDakUsTUFBTSxNQUFNLEdBQUcsQ0FBQSxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSwwQ0FBRSxNQUFNLEtBQUksRUFBRSxDQUFDO1FBQ3ZELE1BQU0sYUFBYSxHQUFHLENBQUEsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksMENBQUUsYUFBYSxLQUFJLEVBQUUsQ0FBQztRQUNyRSxNQUFNLFlBQVksR0FBRyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLDBDQUFFLFlBQVksS0FBSSxFQUFFLENBQUM7UUFDbkUsTUFBTSxNQUFNLEdBQUcsQ0FBQSxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSwwQ0FBRSxhQUFhLEtBQUksSUFBSSxDQUFDO1FBQ2hFLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQSxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSwwQ0FBRSxvQkFBb0IsS0FBSSxJQUFJLENBQUM7UUFDckYsTUFBTSxzQkFBc0IsR0FBRyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLDBDQUFFLHNCQUFzQixLQUFJLElBQUksQ0FBQztRQUN6RixNQUFNLFVBQVUsR0FBRyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLDBDQUFFLFVBQVUsS0FBSSxJQUFJLENBQUM7UUFDakUsTUFBTSxNQUFNLEdBQUcsQ0FBQSxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSwwQ0FBRSxNQUFNLEtBQUksSUFBSSxDQUFDO1FBQ3pELE1BQU0sTUFBTSxHQUFHLENBQUEsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksMENBQUUsTUFBTSxLQUFJLElBQUksQ0FBQztRQUV6RCxzQkFBc0I7UUFDdEIsTUFBTSxjQUFjLEdBQUcsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQiwwQ0FBRSxjQUFjLENBQUM7UUFDckUsTUFBTSxVQUFVLEdBQUcsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQiwwQ0FBRSxxQkFBcUIsQ0FBQztRQUN4RSxNQUFNLG1CQUFtQixHQUFHLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsMENBQUUsbUJBQW1CLENBQUM7UUFDL0UsTUFBTSxlQUFlLEdBQUcsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQiwwQ0FBRSwwQkFBMEIsQ0FBQztRQUNsRixNQUFNLFNBQVMsR0FBRyxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLDBDQUFFLFNBQVMsQ0FBQztRQUMzRCxNQUFNLFdBQVcsR0FBRyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsMENBQUUsV0FBVyxLQUFJLEVBQUUsQ0FBQztRQUNyRSxNQUFNLGdCQUFnQixHQUFHLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsMENBQUUsZ0JBQWdCLENBQUM7UUFDekUsTUFBTSxtQkFBbUIsR0FBRyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsMENBQUUsbUJBQW1CLEtBQUksSUFBSSxDQUFDO1FBQ3ZGLE1BQU0sUUFBUSxHQUFHLENBQUEsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQiwwQ0FBRSxRQUFRLEtBQUksRUFBRSxDQUFDO1FBQy9ELE1BQU0sWUFBWSxHQUFHLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsMENBQUUsZUFBZSxDQUFDO1FBQ3BFLE1BQU0sSUFBSSxHQUFHLENBQUEsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQiwwQ0FBRSxJQUFJLEtBQUksRUFBRSxDQUFDO1FBQ3ZELE1BQU0sZUFBZSxHQUFHLENBQUEsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQiwwQ0FBRSxlQUFlLEtBQUk7WUFDdEUsWUFBWSxFQUFFLFNBQVM7WUFDdkIsZ0JBQWdCLEVBQUUsVUFBVTtZQUM1Qix1QkFBdUIsRUFBRSxDQUFDO1lBQzFCLFVBQVUsRUFBRSxVQUFVO1NBQ3pCLENBQUM7UUFDRixNQUFNLG1CQUFtQixHQUFHLENBQUEsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQiwwQ0FBRSxtQkFBbUIsS0FBSSxFQUFFLENBQUM7UUFDckYsTUFBTSxrQkFBa0IsR0FBRyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsMENBQUUsa0JBQWtCLEtBQUksS0FBSyxDQUFDO1FBRXRGLG1FQUFtRTtRQUNuRSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFaEQsb0NBQW9DO1FBQ3BDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsb0JBQW9CLEVBQUUsc0JBQXNCLEVBQ3BILElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFOUMsNENBQTRDO1FBQzVDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSx3QkFBd0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVyRywrQkFBK0I7UUFDL0IsSUFBSSx1QkFBdUIsQ0FBQztRQUM1QixJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFDLENBQUM7WUFDaEMsdUJBQXVCLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBQSxtQ0FBNkIsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDckgsQ0FBQzthQUFNLENBQUM7WUFDSix1QkFBdUIsR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQywrQkFBeUIsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7UUFDRCx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQzFELE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFDeEIsT0FBTyxFQUFFO2dCQUNMLGNBQWM7YUFDakI7WUFDRCxTQUFTLEVBQUUsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQzlDLENBQUMsQ0FBQyxDQUFDO1FBRUosdUNBQXVDO1FBQ3ZDLElBQUksWUFBWSxFQUFDLENBQUM7WUFDZCw0QkFBNEI7WUFDNUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLEVBQUU7Z0JBQzFELFNBQVMsRUFBRSxTQUFTO2dCQUNwQixlQUFlLEVBQUUsc0JBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO2FBQ3pDLENBQUMsQ0FBQztZQUNILEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7Z0JBQzlDLEdBQUcsRUFBRSx1QkFBdUI7Z0JBQzVCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUs7Z0JBQ3hCLFVBQVUsRUFBRTtvQkFDUixJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQztvQkFDN0MsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUM7aUJBQ25EO2dCQUNELE9BQU8sRUFBRTtvQkFDTCxpQkFBaUI7aUJBQ3BCO2dCQUNELFNBQVMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ25DLENBQUMsQ0FBQyxDQUFDO1lBRUoseUJBQXlCO1lBQ3pCLElBQUksaUJBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLHNCQUFzQixFQUFFO2dCQUM1QyxZQUFZLEVBQUU7b0JBQ1YsTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDO29CQUN0QixVQUFVLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztpQkFDbkM7YUFDSixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRWxDLElBQUksaUJBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLHdCQUF3QixFQUFFO2dCQUM5QyxZQUFZLEVBQUU7b0JBQ1YsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDO29CQUNuQixVQUFVLEVBQUUsQ0FBQyx3Q0FBd0MsQ0FBQztpQkFDekQ7YUFDSixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRWxDLElBQUksaUJBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFO2dCQUN0QyxZQUFZLEVBQUU7b0JBQ1YsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDO29CQUNuQixVQUFVLEVBQUUsQ0FBQyx1Q0FBdUMsQ0FBQztpQkFDeEQ7YUFDSixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRWxDLElBQUksaUJBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLHdCQUF3QixFQUFFO2dCQUM5QyxZQUFZLEVBQUU7b0JBQ1YsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDO29CQUNuQixVQUFVLEVBQUUsQ0FBQyx1Q0FBdUMsQ0FBQztpQkFDeEQ7YUFDSixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRWxDLHdFQUF3RTtZQUN4RSxNQUFNLDBCQUEwQixHQUFHLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQztnQkFDdkQsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSztnQkFDeEIsT0FBTyxFQUFFO29CQUNMLG1CQUFtQjtvQkFDbkIsaUJBQWlCO29CQUNqQix3QkFBd0I7b0JBQ3hCLG9CQUFvQjtpQkFDdkI7Z0JBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDbkMsQ0FBQyxDQUFDO1lBQ0gsdUJBQXVCLENBQUMsYUFBYSxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUVELG1CQUFtQjtRQUNuQixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFL0UsSUFBSSxFQUFPLENBQUM7UUFDWixJQUFJLFlBQWlCLENBQUM7UUFDdEIsSUFBSSxXQUFXLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUMsQ0FBQztZQUM3RyxFQUFFLEdBQUcsS0FBSyxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFVLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztZQUN0RyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLENBQUM7YUFBTSxDQUFDO1lBQ04sRUFBRSxHQUFHLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBVSxFQUFFLHVCQUF1QixDQUFDLENBQUM7WUFDcEcsWUFBWSxHQUFHLEVBQUMsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUMsQ0FBQztRQUNqRSxDQUFDO1FBQ0QsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFMUIsdUVBQXVFO1FBQ3ZFLHNFQUFzRTtRQUN0RSxJQUFJLGNBQWMsR0FBRztZQUNqQixXQUFXLEVBQUUsSUFBSTtZQUNqQixlQUFlLEVBQUUsUUFBUTtTQUM1QixDQUFDO1FBRUYsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBQyxDQUFDO1lBQzlCLGNBQWMsR0FBRyxJQUFBLG9CQUFLLEVBQUMsY0FBYyxFQUFFO2dCQUNuQyxzQkFBc0IsRUFBRSx3QkFBd0IsQ0FBQyxtQkFBbUI7Z0JBQ3BFLHFCQUFxQixFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO2FBQ3ZELENBQUMsQ0FBQztRQUNQLENBQUM7YUFBTSxDQUFDO1lBQ0osY0FBYyxHQUFHLElBQUEsb0JBQUssRUFBQyxjQUFjLEVBQUU7Z0JBQ25DLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO2FBQ25ELENBQUMsQ0FBQztRQUNQLENBQUM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFDLENBQUM7WUFDOUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLElBQUEsb0JBQUssRUFBQyxjQUFjLEVBQUUsTUFBQSxNQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxRQUFRLDBDQUFFLEdBQUcsbUNBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5RixDQUFDO2FBQU0sQ0FBQztZQUNKLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFBLG9CQUFLLEVBQUMsY0FBYyxFQUFFLE1BQUEsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLFFBQVEsbUNBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyRixDQUFDO1FBRUQsNERBQTREO1FBQzVELE1BQU0sUUFBUSxHQUFHO1lBQ2IsY0FBYyxFQUFFO2dCQUNaLE1BQU0sRUFBRSxXQUFXO2dCQUNuQixJQUFJLEVBQUUsT0FBTztnQkFDYixXQUFXLEVBQUUsWUFBWTthQUM1QjtTQUNKLENBQUM7UUFFRixNQUFNLEdBQUcsSUFBQSxvQkFBSyxFQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNqQyxzRUFBc0U7UUFDdEUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLHNCQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFFN0YsY0FBYyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFdEMsSUFBRyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDeEIsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLFdBQVcsRUFBQyxDQUFDO1lBQzlDLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMxQixRQUFRLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUM3QixDQUFDO1lBRUQsTUFBTSxJQUFJLEdBQUU7Z0JBQ1IsQ0FBRSxnQ0FBZ0MsRUFBRSxtREFBbUQsUUFBUSw0Q0FBNEMsQ0FBRTtnQkFDN0ksQ0FBRSxrQ0FBa0MsRUFBRSxtREFBbUQsUUFBUSw2Q0FBNkMsQ0FBQztnQkFDL0ksQ0FBRSx1Q0FBdUMsRUFBRSxtREFBbUQsUUFBUSxzREFBc0QsQ0FBQzthQUNoSyxDQUFDO1lBRUYsZ0VBQWdFO1lBQ2hFLEtBQUssTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDbkMsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFFM0Qsc0dBQXNHO2dCQUN0RyxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoRCxDQUFDO1FBQ0wsQ0FBQztRQUdELG1GQUFtRjtRQUNuRixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFDLENBQUM7WUFDM0IsSUFBSSxJQUFJLENBQUM7WUFDVCxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFDLENBQUM7Z0JBQy9CLElBQUksR0FBRztvQkFDSCxVQUFVLEVBQUUsc0JBQXNCO29CQUNsQyxJQUFJLEVBQUUsVUFBVTtvQkFDaEIsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFO29CQUN0QyxJQUFJLEVBQUU7d0JBQ0YsUUFBUSxFQUFFOzRCQUNOLFFBQVEsRUFBRTtnQ0FDTixNQUFNLEVBQUUsTUFBTTtnQ0FDZCxXQUFXLEVBQUUsV0FBVzs2QkFDM0I7NEJBQ0QsSUFBSSxFQUFFO2dDQUNGLFlBQVksRUFBRTtvQ0FDVixJQUFJLEVBQUUsc0JBQXNCO2lDQUMvQjtnQ0FDRCxNQUFNLEVBQUUsTUFBTTtnQ0FDZCxhQUFhLEVBQUUsYUFBYTtnQ0FDNUIsWUFBWSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDOzZCQUMzQzt5QkFDSjt3QkFDRCxVQUFVLEVBQUUsVUFBVTt3QkFDdEIsTUFBTSxFQUFFLE1BQU07d0JBQ2QsTUFBTSxFQUFFLE1BQU07cUJBQ2pCO2lCQUNKLENBQUM7WUFDTixDQUFDO2lCQUFNLENBQUM7Z0JBQ0osSUFBSSxHQUFHO29CQUNILFVBQVUsRUFBRSx1QkFBdUI7b0JBQ25DLElBQUksRUFBRSxhQUFhO29CQUNuQixRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUU7b0JBQ3pDLElBQUksRUFBRTt3QkFDRixXQUFXLEVBQUU7NEJBQ1QsSUFBSSxFQUFFLHNCQUFzQjt5QkFDL0I7d0JBQ0QsTUFBTSxFQUFFLE1BQU07d0JBQ2QsYUFBYSxFQUFFLGFBQWE7d0JBQzVCLE1BQU0sRUFBRSxNQUFNO3dCQUNkLFdBQVcsRUFBRSxXQUFXO3dCQUN4QixZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7d0JBQ3hDLE1BQU0sRUFBRTs0QkFDSixTQUFTLEVBQUUsTUFBTTt5QkFDcEI7d0JBQ0QsYUFBYSxFQUFFLE1BQU07d0JBQ3JCLHNCQUFzQixFQUFFLHNCQUFzQjt3QkFDOUMsb0JBQW9CLEVBQUUsb0JBQW9CO3dCQUMxQyxNQUFNLEVBQUUsTUFBTTtxQkFDakI7aUJBQ0osQ0FBQztZQUNOLENBQUM7WUFDRCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvRCxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUVoRCwyRkFBMkY7WUFDM0YsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFDLENBQUM7Z0JBQy9CLElBQUksT0FBTyxDQUFDO2dCQUNaLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUMsQ0FBQztvQkFDL0IsT0FBTyxHQUFHO3dCQUNOLFVBQVUsRUFBRSwyQkFBMkI7d0JBQ3ZDLElBQUksRUFBRSxjQUFjO3dCQUNwQixRQUFRLEVBQUU7NEJBQ04sSUFBSSxFQUFFLHNCQUFzQjt5QkFDL0I7d0JBQ0QsSUFBSSxFQUFFOzRCQUNGLFNBQVMsRUFBRSxTQUFTOzRCQUNwQixtQkFBbUIsRUFBRSxtQkFBbUI7NEJBQ3hDLDBCQUEwQixFQUFFLGVBQWU7NEJBQzNDLGdCQUFnQixFQUFFLGdCQUFnQjs0QkFDbEMsUUFBUSxFQUFFLFFBQVE7NEJBQ2xCLElBQUksRUFBRSxJQUFJOzRCQUNWLGVBQWUsRUFBRSxlQUFlOzRCQUNoQyxtQkFBbUIsRUFBRSxtQkFBbUI7NEJBQ3hDLGtCQUFrQixFQUFFLGtCQUFrQjt5QkFDekM7cUJBQ0osQ0FBQztvQkFFRix3R0FBd0c7b0JBQ3hHLElBQUksWUFBWSxFQUFFLENBQUM7d0JBQ2YsT0FBTyxHQUFHLElBQUEsb0JBQUssRUFBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLEVBQUMsQ0FBQyxDQUFDO29CQUN6RSxDQUFDO3lCQUFNLENBQUM7d0JBQ0osT0FBTyxHQUFHLElBQUEsb0JBQUssRUFBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxFQUFFLEVBQUMsQ0FBQyxDQUFDO29CQUM1RSxDQUFDO29CQUVELGlEQUFpRDtvQkFDakQsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBQyxDQUFDO3dCQUMvQixPQUFPLEdBQUcsSUFBQSxvQkFBSyxFQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLG1CQUFtQixFQUFFLG1CQUFtQixFQUFFLEVBQUMsQ0FBQyxDQUFDO29CQUNwRixDQUFDO2dCQUNMLENBQUM7cUJBQU0sQ0FBQztvQkFDSixPQUFPLEdBQUc7d0JBQ04sVUFBVSxFQUFFLDRCQUE0Qjt3QkFDeEMsSUFBSSxFQUFFLGlCQUFpQjt3QkFDdkIsUUFBUSxFQUFFOzRCQUNOLElBQUksRUFBRSxzQkFBc0I7eUJBQy9CO3dCQUNELElBQUksRUFBRTs0QkFDRixjQUFjLEVBQUUsY0FBYzs0QkFDOUIscUJBQXFCLEVBQUUsVUFBVTs0QkFDakMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJOzRCQUNuRCxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUs7NEJBQ3hDLFdBQVcsRUFBRSxXQUFXOzRCQUN4QixJQUFJLEVBQUUsSUFBSTs0QkFDVixlQUFlLEVBQUUsZUFBZTs0QkFDaEMsbUJBQW1CLEVBQUUsbUJBQW1COzRCQUN4QyxRQUFRLEVBQUUsUUFBUTt5QkFDckI7cUJBQ0osQ0FBQztvQkFFRixpREFBaUQ7b0JBQ2pELElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUMsQ0FBQzt3QkFDL0IsT0FBTyxHQUFHLElBQUEsb0JBQUssRUFBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBQyxFQUFDLENBQUMsQ0FBQztvQkFDakYsQ0FBQztnQkFDTCxDQUFDO2dCQUNELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzNFLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2xELENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRDs7Ozs7U0FLSztJQUNLLE9BQU8sQ0FBQyxJQUF5RDtRQUN2RSxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbkIsS0FBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUMsQ0FBQztZQUNsQixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkIsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxQixNQUFNLFdBQVcsR0FBRztnQkFDaEIsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsVUFBVSxFQUFFLEVBQUU7Z0JBQ2QsUUFBUSxFQUFFLEdBQUc7YUFDaEIsQ0FBQztZQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7O09BWUc7SUFDSyw0QkFBNEIsQ0FBQyxXQUF3QixFQUFFLE9BQWUsRUFBRSxVQUFlLEVBQUUsYUFBa0IsRUFBRSxvQkFBeUIsRUFBRSxzQkFBMkIsRUFDdkssZ0JBQXFCLEVBQUUsU0FBYztRQUVyQyx5RUFBeUU7UUFDekUsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxnQkFBZ0IsRUFBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLFNBQVMsRUFBRSx1R0FBdUcsQ0FBQyxDQUFDO1FBQzFLLENBQUM7UUFFRCwrREFBK0Q7UUFDL0QsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBQyxDQUFDO1lBQzlCLElBQUksVUFBVSxFQUFDLENBQUM7Z0JBQ1osTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLHNHQUFzRyxDQUFDLENBQUM7WUFDM0ksQ0FBQztRQUNMLENBQUM7UUFFRCxzREFBc0Q7UUFDdEQsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBQyxDQUFDO1lBQy9CLGtEQUFrRDtZQUNsRCxNQUFNLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLHNCQUFzQixFQUFFLCtFQUErRSxDQUFDLENBQUM7WUFFNUosdUVBQXVFO1lBQ3ZFLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLG1CQUFtQixFQUFDLENBQUM7Z0JBQ3hFLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLDRGQUE0RixDQUFDLENBQUM7WUFDMUksQ0FBQztZQUVELG1GQUFtRjtZQUNuRixJQUFJLGdCQUFnQixFQUFDLENBQUM7Z0JBQ2xCLE1BQU0sQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFLHNEQUFzRCxDQUFDLENBQUM7Z0JBQ3hGLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLFNBQVMsRUFBRSx5REFBeUQsQ0FBQyxDQUFDO2dCQUNoSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLENBQUMsS0FBSyxTQUFTLEVBQUUsdURBQXVELENBQUMsQ0FBQztZQUMzSCxDQUFDO1FBQ0wsQ0FBQztRQUVELHlEQUF5RDtRQUN6RCw0REFBNEQ7UUFDNUQsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBQyxDQUFDO1lBQzlCLElBQUksYUFBYSxFQUFDLENBQUM7Z0JBQ2YsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxJQUFJLG9CQUFvQixDQUFDLEVBQUcsb0VBQW9FLENBQUMsQ0FBQztZQUNwSSxDQUFDO1lBQ0QsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFFLDJFQUEyRSxDQUFDLENBQUM7WUFFakcsc0VBQXNFO1lBQ3RFLElBQUksZ0JBQWdCLEVBQUMsQ0FBQztnQkFDbEIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLEtBQUssU0FBUyxFQUFFLDREQUE0RCxDQUFDLENBQUM7Z0JBQzlILE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLFNBQVMsRUFBRSwwREFBMEQsQ0FBQyxDQUFDO1lBQ3pILENBQUM7UUFDTCxDQUFDO1FBRUQsNkVBQTZFO1FBQzVFLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFFLHFHQUFxRyxDQUFDLENBQUM7SUFFdkwsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSyxhQUFhLENBQUMsT0FBZ0IsRUFBRSxTQUFpQixFQUFFLE1BQWM7UUFDckUsbUJBQW1CO1FBQ25CLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRTtZQUNuRSxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3JFLGVBQWUsRUFBRTtnQkFDYixHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLDJCQUEyQixDQUFDO2dCQUN2RSxHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLHNCQUFzQixDQUFDO2dCQUNsRSxHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLG9DQUFvQyxDQUFDO2dCQUNoRixHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLDhCQUE4QixDQUFDO2FBQzdFO1lBQ0Qsa0ZBQWtGO1NBQ3JGLENBQUMsQ0FBQztRQUVILDBCQUEwQjtRQUMxQixNQUFNLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5RCxNQUFNLHdCQUF3QixHQUFHLElBQUksR0FBRyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSw0QkFBNEIsRUFBRTtZQUMvRixLQUFLLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7WUFDbkMsbUJBQW1CLEVBQUUsZ0NBQWdDLG1CQUFtQixFQUFFO1lBQzFFLElBQUksRUFBRSxHQUFHO1NBQ1osQ0FBQyxDQUFDO1FBRUgsTUFBTSxTQUFTLEdBQUcsbUJBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFMUMsd0VBQXdFO1FBQ3hFLElBQUksdUJBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLDhCQUE4QixFQUFFO1lBQ3pELEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxRQUFRO1lBQ2pDLFdBQVcsRUFBRSxpQ0FBaUM7WUFDOUMsVUFBVSxFQUFFLFNBQVMsR0FBQyx1QkFBdUI7U0FDaEQsQ0FBQyxDQUFDO1FBQ0gsc0VBQXNFO1FBQ3RFLElBQUksdUJBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLGlDQUFpQyxFQUFFO1lBQzVELEtBQUssRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsbUJBQW9CLENBQUMsQ0FBQyxDQUFDLE1BQU07WUFDeEYsV0FBVyxFQUFFLHdDQUF3QztZQUNyRCxVQUFVLEVBQUUsU0FBUyxHQUFDLDhCQUE4QjtTQUN2RCxDQUFDLENBQUM7UUFFSCw0QkFBNEI7UUFDNUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUU7WUFDOUMsTUFBTSxFQUFFLENBQUMscUJBQXFCLEVBQUUsY0FBYyxDQUFDO1lBQy9DLFFBQVEsRUFBRSxtQ0FBbUM7U0FDaEQsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLGlCQUFpQixFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNLLFlBQVksQ0FBQyxnQkFBd0IsRUFBRSxXQUE4QjtRQUN6RSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxzRUFBc0UsQ0FBQyxDQUFDO1FBQzVHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxFQUFFLCtDQUErQyxDQUFDLENBQUM7UUFDaEcsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBVyxDQUFDO1FBQ2hFLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7WUFDakQsT0FBTyxDQUFDLElBQUksQ0FBQyxxRUFBcUUsaUJBQWlCLHFEQUFxRCxDQUFDLENBQUM7UUFDOUosQ0FBQztJQUNMLENBQUM7Q0FDSixDQUFBO0FBaGdCWSx3Q0FBYztBQVV2QjtJQURDLEtBQUssQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUM7NENBc1Y3Qzt5QkEvVlEsY0FBYztJQUQxQixLQUFLLENBQUMsV0FBVztHQUNMLGNBQWMsQ0FnZ0IxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFzc2VydCBmcm9tIFwiYXNzZXJ0XCI7XG5pbXBvcnQgeyBDZm5PdXRwdXQsIER1cmF0aW9uLCBOYW1lcyB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENsdXN0ZXIsIEt1YmVybmV0ZXNWZXJzaW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWVrcyc7XG5pbXBvcnQgeyBSdWxlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWV2ZW50cyc7XG5pbXBvcnQgeyBTcXNRdWV1ZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1ldmVudHMtdGFyZ2V0cyc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgKiBhcyBzcXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQgeyBtZXJnZSB9IGZyb20gJ3RzLWRlZXBtZXJnZSc7XG5pbXBvcnQgKiBhcyBtZDUgZnJvbSAndHMtbWQ1JztcbmltcG9ydCB7IEJsb2NrRGV2aWNlTWFwcGluZywgQ2x1c3RlckluZm8sIEhvdXIsIE1pbiwgU2VjLCBUYWludCwgVmFsdWVzIH0gZnJvbSAnLi4vLi4vc3BpJztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4uLy4uL3V0aWxzJztcbmltcG9ydCB7IEhlbG1BZGRPbiwgSGVsbUFkZE9uUHJvcHMsIEhlbG1BZGRPblVzZXJQcm9wcyB9IGZyb20gJy4uL2hlbG0tYWRkb24nO1xuaW1wb3J0IHsgS2FycGVudGVyQ29udHJvbGxlclBvbGljeSwgS2FycGVudGVyQ29udHJvbGxlclBvbGljeUJldGEgfSBmcm9tICcuL2lhbSc7XG5cbmNsYXNzIHZlcnNpb25NYXAge1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IHZlcnNpb25NYXA6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKFtcbiAgICAgICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzMwLnZlcnNpb24sICcwLjM3LjAnXSxcbiAgICAgICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI5LnZlcnNpb24sICcwLjM0LjAnXSxcbiAgICAgICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI4LnZlcnNpb24sICcwLjMxLjAnXSxcbiAgICAgICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI3LnZlcnNpb24sICcwLjI4LjAnXSxcbiAgICAgICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI2LnZlcnNpb24sICcwLjI4LjAnXSxcbiAgICAgICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI1LnZlcnNpb24sICcwLjI1LjAnXSxcbiAgICAgICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI0LnZlcnNpb24sICcwLjIxLjAnXSxcbiAgICAgICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzIzLnZlcnNpb24sICcwLjIxLjAnXSxcbiAgICBdKTtcbiAgICBwdWJsaWMgc3RhdGljIGhhcyh2ZXJzaW9uOiBLdWJlcm5ldGVzVmVyc2lvbikge1xuICAgICAgcmV0dXJuIHRoaXMudmVyc2lvbk1hcC5oYXModmVyc2lvbi52ZXJzaW9uKTtcbiAgICB9XG4gICAgcHVibGljIHN0YXRpYyBnZXQodmVyc2lvbjogS3ViZXJuZXRlc1ZlcnNpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnZlcnNpb25NYXAuZ2V0KHZlcnNpb24udmVyc2lvbik7XG4gICAgfVxuICB9XG5cbi8qKlxuICogVXRpbGl0eSB0eXBlIGZvciBLYXJwZW50ZXIgcmVxdWlyZW1lbnQgdmFsdWVzIGZvciBOb2RlUG9vbHNcbiAqL1xuZXhwb3J0IHR5cGUgTm9kZVBvb2xSZXF1aXJlbWVudFZhbHVlcyA9IHtcbiAgICBrZXk6IHN0cmluZyxcbiAgICBvcGVyYXRvcjogXCJJblwiIHwgXCJOb3RJblwiIHwgXCJFeGlzdHNcIiB8IFwiRG9lc05vdEV4aXN0XCIgfCBcIkd0XCIgfCBcIkx0XCIsXG4gICAgdmFsdWVzOiBzdHJpbmdbXSxcbn1bXVxuXG4vLyBVdGlsaXR5IFR5cGUgZm9yIEthcnBlbnRlciBOb2RlQ2xhc3MgRGlzcnVwdGlvbiBCdWRnZXRcbmV4cG9ydCB0eXBlIERpc3J1cHRpb25CdWRnZXQgPSB7XG4gICAgbm9kZXM6IHN0cmluZ1xuICAgIHNjaGVkdWxlPzogc3RyaW5nXG4gICAgZHVyYXRpb24/OiBzdHJpbmdcbn07XG5cbi8vIFNwZWNpZmljIHR5cGVzIGZvciB0aGUgQmV0YSBDUkQgU3VibmV0IGFuZCBTZWN1cml0eSBHcm91cCBzZWxlY3RvciB0ZXJtc1xuZXhwb3J0IHR5cGUgQmV0YVN1Ym5ldFRlcm0gPSB7IGlkPzogc3RyaW5nLCB0YWdzPzogVmFsdWVzIH07XG5leHBvcnQgdHlwZSBCZXRhU2VjdXJpdHlHcm91cFRlcm0gPSB7IHRhZ3M/OiBWYWx1ZXMsIGlkPzogc3RyaW5nLCBuYW1lPzogc3RyaW5nIH07XG5leHBvcnQgdHlwZSBBbWlTZWxlY3RvclRlcm0gPSB7IHRhZ3M/OiBWYWx1ZXMsIG5hbWU/OiBzdHJpbmcsIG93bmVyPzogc3RyaW5nIH0gfCB7IGlkPzogc3RyaW5nIH07XG5cbi8qKlxuICogVXRpbGl0eSB0eXBlIGZvciBLYXJwZW50ZXIgRUMyTm9kZUNsYXNzIFNwZWNzXG4gKi9cbmV4cG9ydCB0eXBlIEVjMk5vZGVDbGFzc1NwZWMgPSB7XG4gICAgLyoqXG4gICAgICogVGFncyBuZWVkZWQgZm9yIHN1Ym5ldHMgLSBTdWJuZXQgdGFncyBhbmQgc2VjdXJpdHkgZ3JvdXAgdGFncyBhcmUgcmVxdWlyZWQgZm9yIHRoZSBwcm92aXNpb25lciB0byBiZSBjcmVhdGVkXG4gICAgICogUmVxdWlyZWQgZm9yIEFscGhhIENSRFNcbiAgICAgKi9cbiAgICBzdWJuZXRTZWxlY3Rvcj86IFZhbHVlcyxcblxuICAgIC8qKlxuICAgICAqIFRhZ3MgbmVlZGVkIGZvciBzZWN1cml0eSBncm91cHMgLSBTdWJuZXQgdGFncyBhbmQgc2VjdXJpdHkgZ3JvdXAgdGFncyBhcmUgcmVxdWlyZWQgZm9yIHRoZSBwcm92aXNpb25lciB0byBiZSBjcmVhdGVkXG4gICAgICogUmVxdWlyZWQgZm9yIEFscGhhIENSRFNcbiAgICAgKi9cbiAgICBzZWN1cml0eUdyb3VwU2VsZWN0b3I/OiBWYWx1ZXMsXG5cbiAgICAvKipcbiAgICAgKiBTdWJuZXQgc2VsZWN0b3IgdGVybXMgKHN1Ym5ldCBpZCBvciB0YWdzKSB1c2VkIGZvciBCZXRhIENSRHNcbiAgICAgKiBSZXF1aXJlZCBmb3IgQmV0YSBDUkRTXG4gICAgICovXG4gICAgc3VibmV0U2VsZWN0b3JUZXJtcz86IEJldGFTdWJuZXRUZXJtW10sXG5cbiAgICAvKipcbiAgICAgKiBTZWN1cml0eSBHcm91cCBzZWxlY3RvciB0ZXJtcyAoc2VjdXJpdHkgZ3JvdXAgaWQsIHRhZ3Mgb3IgbmFtZXMpIHVzZWQgZm9yIEJldGEgQ1JEc1xuICAgICAqIFJlcXVpcmVkIGZvciBCZXRhIENSRFNcbiAgICAgKi9cbiAgICBzZWN1cml0eUdyb3VwU2VsZWN0b3JUZXJtcz86IEJldGFTZWN1cml0eUdyb3VwVGVybVtdLFxuXG4gICAgLyoqXG4gICAgICogQU1JIFNlbGVjdG9yXG4gICAgICovXG4gICAgYW1pU2VsZWN0b3I/OiBWYWx1ZXMsXG5cbiAgICAvKipcbiAgICAgKiBBTUkgU2VsZWN0b3IgdGVybXMgdXNlZCBmb3IgQmV0YSBDUkRzXG4gICAgICovXG4gICAgYW1pU2VsZWN0b3JUZXJtcz86IEFtaVNlbGVjdG9yVGVybVtdO1xuXG4gICAgLyoqXG4gICAgICogQU1JIEZhbWlseTogcmVxdWlyZWQgZm9yIHYwLjMyLjAgYW5kIGFib3ZlLCBvcHRpb25hbCBvdGhlcndpc2VcbiAgICAgKiBLYXJwZW50ZXIgd2lsbCBhdXRvbWF0aWNhbGx5IHF1ZXJ5IHRoZSBhcHByb3ByaWF0ZSBFS1Mgb3B0aW1pemVkIEFNSSB2aWEgQVdTIFN5c3RlbXMgTWFuYWdlclxuICAgICAqL1xuICAgIGFtaUZhbWlseT86IFwiQUwyXCIgfCBcIkJvdHRsZXJvY2tldFwiIHwgXCJVYnVudHVcIiB8IFwiV2luZG93czIwMTlcIiB8IFwiV2luZG93czIwMjJcIlxuXG4gICAgLyoqXG4gICAgICogT3B0aW9uYWwgZmllbGQgdG8gY29udHJvbCBob3cgaW5zdGFuY2Ugc3RvcmUgdm9sdW1lcyBhcmUgaGFuZGxlZC4gU2V0IGl0IHRvIFJBSUQwXG4gICAgICogZm9yIGZhc3RlciBlcGhlbWVyYWwgc3RvcmFnZVxuICAgICAqL1xuICAgIGluc3RhbmNlU3RvcmVQb2xpY3k/OiBcIlJBSUQwXCJcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsIHVzZXIgcHJvdmlkZWQgVXNlckRhdGEgYXBwbGllZCB0byB0aGUgd29ya2VyIG5vZGVzLFxuICAgICAqIGkuZS4gY3VzdG9tIHNjcmlwdHMgb3IgcGFzcy10aHJvdWdoIGN1c3RvbSBjb25maWd1cmF0aW9ucyBhdCBzdGFydC11cFxuICAgICAqL1xuICAgIHVzZXJEYXRhPzogc3RyaW5nLFxuXG4gICAgLyoqXG4gICAgICogT3B0aW9uYWwgZmllbGQgdG8gdXNlIHRoZSBuYW1lIG9mIHRoZSBJQU0gSW5zdGFuY2UgcHJvZmlsZSxcbiAgICAgKiBpbnN0ZWFkIG9mIHRoZSByb2xlIGdlbmVyYXRlZCBieSBLYXJwZW50ZXIuXG4gICAgICogVXNlciBtdXN0IHByZS1wcm92aXNpb24gYW4gSUFNIGluc3RhbmNlIHByb2ZpbGUgYW5kIGFzc2lnbiBhIHJvbGUgdG8gaXQuXG4gICAgICovXG4gICAgaW5zdGFuY2VQcm9maWxlPzogc3RyaW5nLFxuXG4gICAgLyoqXG4gICAgICogVGFncyBhZGRzIHRhZ3MgdG8gYWxsIHJlc291cmNlcyBjcmVhdGVkLCBpbmNsdWRpbmcgRUMyIEluc3RhbmNlcywgRUJTIHZvbHVtZXMgYW5kIExhdW5jaCBUZW1wbGF0ZXMuXG4gICAgICogS2FycGVudGVyIGFsbG93cyBvdmVycmlkZXMgb2YgdGhlIGRlZmF1bHQgXCJOYW1lXCIgdGFnIGJ1dCBkb2VzIG5vdCBhbGxvdyBvdmVycmlkZXMgdG8gcmVzdHJpY3RlZCBkb21haW5zXG4gICAgICogKHN1Y2ggYXMgXCJrYXJwZW50ZXIuc2hcIiwgXCJrYXJwZW50ZXIuazhzLmF3c1wiLCBhbmQgXCJrdWJlcm5ldGVzLmlvL2NsdXN0ZXJcIikuXG4gICAgICogVGhpcyBlbnN1cmVzIHRoYXQgS2FycGVudGVyIGlzIGFibGUgdG8gY29ycmVjdGx5IGF1dG8tZGlzY292ZXIgbWFjaGluZXMgdGhhdCBpdCBvd25zLlxuICAgICAqL1xuICAgIHRhZ3M/OiBWYWx1ZXM7XG5cbiAgICAvKipcbiAgICAgKiBDb250cm9sIHRoZSBleHBvc3VyZSBvZiBJbnN0YW5jZSBNZXRhZGF0YSBzZXJ2aWNlIHVzaW5nIHRoaXMgY29uZmlndXJhdGlvblxuICAgICAqL1xuICAgIG1ldGFkYXRhT3B0aW9ucz86IFZhbHVlcztcblxuICAgIC8qKlxuICAgICAqIEJsb2NrRGV2aWNlTWFwcGluZ3MgYWxsb3dzIHlvdSB0byBzcGVjaWZ5IHRoZSBibG9jayBkZXZpY2UgbWFwcGluZ3MgZm9yIHRoZSBpbnN0YW5jZXMuXG4gICAgICogVGhpcyBpcyBhIGxpc3Qgb2YgbWFwcGluZ3MsIHdoZXJlIGVhY2ggbWFwcGluZyBjb25zaXN0cyBvZiBhIGRldmljZSBuYW1lIGFuZCBhbiBFQlMgY29uZmlndXJhdGlvbi5cbiAgICAgKiBJZiB5b3UgbGVhdmUgdGhpcyBibGFuaywgaXQgd2lsbCB1c2UgdGhlIEthcnBlbnRlciBkZWZhdWx0LlxuICAgICAqL1xuICAgIGJsb2NrRGV2aWNlTWFwcGluZ3M/OiBCbG9ja0RldmljZU1hcHBpbmdbXTtcblxuICAgIC8qKlxuICAgICAqIERldGFpbGVkIG1vbml0b3Jpbmcgb24gRUMyXG4gICAgICovXG4gICAgZGV0YWlsZWRNb25pdG9yaW5nPzogYm9vbGVhblxufVxuXG4vKipcbiAqIFV0aWxpdHkgdHlwZSBmb3IgS2FycGVudGVyIE5vZGVQb29sIFNwZWNzXG4gKi9cbmV4cG9ydCB0eXBlIE5vZGVQb29sU3BlYyA9IHtcbiAgICAgLyoqXG4gICAgICAgICAqIExhYmVscyBhcHBsaWVkIHRvIGFsbCBub2Rlc1xuICAgICAgICAgKi9cbiAgICAgbGFiZWxzPzogVmFsdWVzLFxuXG4gICAgIC8qKlxuICAgICAgKiBBbm5vdGF0aW9ucyBhcHBsaWVkIHRvIGFsbCBub2Rlc1xuICAgICAgKi9cbiAgICAgYW5ub3RhdGlvbnM/OiBWYWx1ZXMsXG5cbiAgICAgLyoqXG4gICAgICAqIFRhaW50cyBmb3IgdGhlIHByb3Zpc2lvbmVkIG5vZGVzIC0gVGFpbnRzIG1heSBwcmV2ZW50IHBvZHMgZnJvbSBzY2hlZHVsaW5nIGlmIHRoZXkgYXJlIG5vdCB0b2xlcmF0ZWQgYnkgdGhlIHBvZC5cbiAgICAgICovXG4gICAgIHRhaW50cz86IFRhaW50W10sXG5cbiAgICAgLyoqXG4gICAgICAqIFByb3Zpc2lvbmVkIG5vZGVzIHdpbGwgaGF2ZSB0aGVzZSB0YWludHMsIGJ1dCBwb2RzIGRvIG5vdCBuZWVkIHRvIHRvbGVyYXRlIHRoZXNlIHRhaW50cyB0byBiZSBwcm92aXNpb25lZCBieSB0aGlzXG4gICAgICAqIHByb3Zpc2lvbmVyLiBUaGVzZSB0YWludHMgYXJlIGV4cGVjdGVkIHRvIGJlIHRlbXBvcmFyeSBhbmQgc29tZSBvdGhlciBlbnRpdHkgKGUuZy4gYSBEYWVtb25TZXQpIGlzIHJlc3BvbnNpYmxlIGZvclxuICAgICAgKiByZW1vdmluZyB0aGUgdGFpbnQgYWZ0ZXIgaXQgaGFzIGZpbmlzaGVkIGluaXRpYWxpemluZyB0aGUgbm9kZS5cbiAgICAgICovXG4gICAgIHN0YXJ0dXBUYWludHM/OiBUYWludFtdLFxuXG4gICAgIC8qKlxuICAgICAgKiBSZXF1aXJlbWVudCBwcm9wZXJ0aWVzIGZvciBOb2RlIFBvb2wgKE9wdGlvbmFsKSAtIElmIG5vdCBwcm92aWRlZCwgdGhlIGFkZC1vbiB3aWxsXG4gICAgICAqIGRlcGxveSBvbmUgd2l0aCBubyB2YWx1ZSwgcHJvdmlkaW5nIG5vIHJlc3RyaWN0aW9ucyB3aGVuIEthcnBlbnRlciBvcHRpbWl6ZXMuXG4gICAgICAqL1xuICAgICByZXF1aXJlbWVudHM/OiBOb2RlUG9vbFJlcXVpcmVtZW50VmFsdWVzLFxuXG4gICAgIC8qKlxuICAgICAgKiBFbmFibGVzIGNvbnNvbGlkYXRpb24gd2hpY2ggYXR0ZW1wdHMgdG8gcmVkdWNlIGNsdXN0ZXIgY29zdCBieSBib3RoIHJlbW92aW5nIHVuLW5lZWRlZCBub2RlcyBhbmQgZG93bi1zaXppbmcgdGhvc2UgdGhhdCBjYW4ndCBiZSByZW1vdmVkLlxuICAgICAgKiBNdXR1YWxseSBleGNsdXNpdmUgd2l0aCB0aGUgdHRsU2Vjb25kc0FmdGVyRW1wdHkgcGFyYW1ldGVyLlxuICAgICAgKlxuICAgICAgKiBSZXBsYWNlZCB3aXRoIGRpc3J1cHRpb24uY29uc29saWRhdGlvblBvbGljeSBmb3IgdmVyc2lvbnMgdjAuMzIueCBhbmQgbGF0ZXJcbiAgICAgICovXG4gICAgIGNvbnNvbGlkYXRpb24/OiB7XG4gICAgICAgICBlbmFibGVkOiBib29sZWFuLFxuICAgICB9XG5cbiAgICAgLyoqXG4gICAgICAqIElmIG9taXR0ZWQsIHRoZSBmZWF0dXJlIGlzIGRpc2FibGVkIGFuZCBub2RlcyB3aWxsIG5ldmVyIGV4cGlyZS5cbiAgICAgICogSWYgc2V0IHRvIGxlc3MgdGltZSB0aGFuIGl0IHJlcXVpcmVzIGZvciBhIG5vZGUgdG8gYmVjb21lIHJlYWR5LFxuICAgICAgKiB0aGUgbm9kZSBtYXkgZXhwaXJlIGJlZm9yZSBhbnkgcG9kcyBzdWNjZXNzZnVsbHkgc3RhcnQuXG4gICAgICAqXG4gICAgICAqIFJlcGxhY2VkIHdpdGggZGlzcnVwdGlvbi5leHBpcmVBZnRlciBmb3IgdmVyc2lvbnMgdjAuMzIueCBhbmQgbGF0ZXJcbiAgICAgICovXG4gICAgIHR0bFNlY29uZHNVbnRpbEV4cGlyZWQ/OiBudW1iZXIsXG5cbiAgICAgLyoqXG4gICAgICAqIEhvdyBtYW55IHNlY29uZHMgS2FycGVudGVyIHdpbGwgd2FpbHQgdW50aWwgaXQgZGVsZXRlcyBlbXB0eS91bm5lY2Vzc2FyeSBpbnN0YW5jZXMgKGluIHNlY29uZHMpLlxuICAgICAgKiBNdXR1YWxseSBleGNsdXNpdmUgd2l0aCB0aGUgY29uc29saWRhdGlvbiBwYXJhbWV0ZXIuXG4gICAgICAqXG4gICAgICAqIFJlcGxhY2VkIHdpdGggZGlzcnVwdGlvbi5jb25zb2xpZGF0aW9uUG9saWN5IGFuZCBkaXNydXB0aW9uLmNvbnNvbGlkYXRlQWZ0ZXIgZm9yIHZlcnNpb25zIHYwLjMyLnggYW5kIGxhdGVyXG4gICAgICAqL1xuICAgICB0dGxTZWNvbmRzQWZ0ZXJFbXB0eT86IG51bWJlcixcblxuICAgICAvKipcbiAgICAgICogRGlzcnVwdGlvbiBzZWN0aW9uIHdoaWNoIGRlc2NyaWJlcyB0aGUgd2F5cyBpbiB3aGljaCBLYXJwZW50ZXIgY2FuIGRpc3J1cHQgYW5kIHJlcGxhY2UgTm9kZXNcbiAgICAgICogQ29uZmlndXJhdGlvbiBpbiB0aGlzIHNlY3Rpb24gY29uc3RyYWlucyBob3cgYWdncmVzc2l2ZSBLYXJwZW50ZXIgY2FuIGJlIHdpdGggcGVyZm9ybWluZyBvcGVyYXRpb25zXG4gICAgICAqIGxpa2Ugcm9sbGluZyBOb2RlcyBkdWUgdG8gdGhlbSBoaXR0aW5nIHRoZWlyIG1heGltdW0gbGlmZXRpbWUgKGV4cGlyeSkgb3Igc2NhbGluZyBkb3duIG5vZGVzIHRvIHJlZHVjZSBjbHVzdGVyIGNvc3RcbiAgICAgICogT25seSBhcHBsaWNhYmxlIGZvciB2ZXJzaW9ucyB2MC4zMiBvciBsYXRlclxuICAgICAgKlxuICAgICAgKiBAcGFyYW0gY29uc29saWRhdGlvblBvbGljeSBjb25zb2xpZGF0aW9uIHBvbGljeSAtIHdpbGwgZGVmYXVsdCB0byBXaGVuVW5kZXJ1dGlsaXplZCBpZiBub3QgcHJvdmlkZWRcbiAgICAgICogQHBhcmFtIGNvbnNvbGlkYXRlQWZ0ZXIgSG93IGxvbmcgS2FycGVudGVyIHdhaXRzIHRvIGNvbnNvbGlkYXRlIG5vZGVzIC0gY2Fubm90IGJlIHNldCB3aGVuIHRoZSBwb2xpY3kgaXMgV2hlblVuZGVydXRpbGl6ZWRcbiAgICAgICogQHBhcmFtIGV4cGlyZUFmdGVyIEhvdyBsb25nIEthcnBlbnRlciB3YWl0cyB0byBleHBpcmUgbm9kZXNcbiAgICAgICovXG4gICAgIGRpc3J1cHRpb24/OiB7XG4gICAgICAgICBjb25zb2xpZGF0aW9uUG9saWN5PzogXCJXaGVuVW5kZXJ1dGlsaXplZFwiIHwgXCJXaGVuRW1wdHlcIixcbiAgICAgICAgIGNvbnNvbGlkYXRlQWZ0ZXI/OiBTZWMgfCBNaW4gfCBIb3VyLFxuICAgICAgICAgZXhwaXJlQWZ0ZXI/OiAgXCJOZXZlclwiIHwgU2VjIHwgTWluIHwgSG91clxuICAgICAgICAgYnVkZ2V0cz86IERpc3J1cHRpb25CdWRnZXRbXVxuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBMaW1pdHMgZGVmaW5lIGEgc2V0IG9mIGJvdW5kcyBmb3IgcHJvdmlzaW9uaW5nIGNhcGFjaXR5LlxuICAgICAgKiBSZXNvdXJjZSBsaW1pdHMgY29uc3RyYWluIHRoZSB0b3RhbCBzaXplIG9mIHRoZSBjbHVzdGVyLlxuICAgICAgKiBMaW1pdHMgcHJldmVudCBLYXJwZW50ZXIgZnJvbSBjcmVhdGluZyBuZXcgaW5zdGFuY2VzIG9uY2UgdGhlIGxpbWl0IGlzIGV4Y2VlZGVkLlxuICAgICAgKi9cbiAgICAgbGltaXRzPzoge1xuICAgICAgICAgY3B1PzogbnVtYmVyO1xuICAgICAgICAgbWVtb3J5Pzogc3RyaW5nO1xuICAgICAgICAgLyoqXG4gICAgICAgICAgKiBFeHRlbmRlZCByZXNvdXJjZXMgYXJlIGZ1bGx5LXF1YWxpZmllZCByZXNvdXJjZSBuYW1lcyBvdXRzaWRlIHRoZSBrdWJlcm5ldGVzLmlvIGRvbWFpbi5cbiAgICAgICAgICAqIFRoZXkgYWxsb3cgY2x1c3RlciBvcGVyYXRvcnMgdG8gYWR2ZXJ0aXNlIGFuZCB1c2VycyB0byBjb25zdW1lIHRoZSBub24tS3ViZXJuZXRlcy1idWlsdC1pblxuICAgICAgICAgICogcmVzb3VyY2VzIHN1Y2ggYXMgaGFyZHdhcmUgZGV2aWNlcyBHUFVzLCBSRE1BcywgU1ItSU9Wcy4uLlxuICAgICAgICAgICogZS5nIG52aWRpYS5jb20vZ3B1LCBhbWQuY29tL2dwdSwgZXRjLi4uXG4gICAgICAgICAgKi9cbiAgICAgICAgIFtrOiBzdHJpbmddOiB1bmtub3duO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBQcmlvcml0eSBnaXZlbiB0byB0aGUgcHJvdmlzaW9uZXIgd2hlbiB0aGUgc2NoZWR1bGVyIGNvbnNpZGVycyB3aGljaCBwcm92aXNpb25lclxuICAgICAgKiB0byBzZWxlY3QuIEhpZ2hlciB3ZWlnaHRzIGluZGljYXRlIGhpZ2hlciBwcmlvcml0eSB3aGVuIGNvbXBhcmluZyBwcm92aXNpb25lcnMuXG4gICAgICAqL1xuICAgICB3ZWlnaHQ/OiBudW1iZXIsXG59XG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGUgYWRkLW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgS2FycGVudGVyQWRkT25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7XG4gICAgLyoqXG4gICAgICogVGhpcyBpcyB0aGUgdG9wIGxldmVsIG5vZGVwb29sIHNwZWNpZmljYXRpb24uIE5vZGVwb29scyBsYXVuY2ggbm9kZXMgaW4gcmVzcG9uc2UgdG8gcG9kcyB0aGF0IGFyZSB1bnNjaGVkdWxhYmxlLlxuICAgICAqIEEgc2luZ2xlIG5vZGVwb29sIGlzIGNhcGFibGUgb2YgbWFuYWdpbmcgYSBkaXZlcnNlIHNldCBvZiBub2Rlcy5cbiAgICAgKiBOb2RlIHByb3BlcnRpZXMgYXJlIGRldGVybWluZWQgZnJvbSBhIGNvbWJpbmF0aW9uIG9mIG5vZGVwb29sIGFuZCBwb2Qgc2NoZWR1bGluZyBjb25zdHJhaW50cy5cbiAgICAgKi9cbiAgICBub2RlUG9vbFNwZWM/OiBOb2RlUG9vbFNwZWMsXG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIHRoZSB0b3AgbGV2ZWwgc3BlYyBmb3IgdGhlIEFXUyBLYXJwZW50ZXIgUHJvdmlkZXJcbiAgICAgKiBJdCBjb250YWlucyBjb25maWd1cmF0aW9uIG5lY2Vzc2FyeSB0byBsYXVuY2ggaW5zdGFuY2VzIGluIEFXUy5cbiAgICAgKi9cbiAgICBlYzJOb2RlQ2xhc3NTcGVjPzogRWMyTm9kZUNsYXNzU3BlYyxcblxuICAgIC8qKlxuICAgICAqIEZsYWcgZm9yIGVuYWJsaW5nIEthcnBlbnRlcidzIG5hdGl2ZSBpbnRlcnJ1cHRpb24gaGFuZGxpbmdcbiAgICAgKi9cbiAgICBpbnRlcnJ1cHRpb25IYW5kbGluZz86IGJvb2xlYW4sXG5cbiAgICAvKlxuICAgICogRmxhZyBmb3IgbWFuYWdpbmcgaW5zdGFsbCBvZiBLYXJwZW50ZXIncyBuZXcgQ1JEcyBiZXR3ZWVuIHZlcnNpb25zXG4gICAgKiBUaGlzIGlzIG9ubHkgbmVjZXNzYXJ5IGlmIHVwZ3JhZGluZyBmcm9tIGEgdmVyc2lvbiBwcmlvciB0byB2MC4zMi4wXG4gICAgKiBJZiBub3QgcHJvdmlkZWQsIGRlZmF1bHRzIHRvIHRydWVcbiAgICAqIElmIHNldCB0byB0cnVlLCB0aGUgYWRkLW9uIHdpbGwgbWFuYWdlIGluc3RhbGxhdGlvbiBvZiB0aGUgQ1JEc1xuICAgICovXG4gICAgaW5zdGFsbENSRHM/OiBib29sZWFuLFxuICAgIC8qKlxuICAgICAqIFRpbWVvdXQgZHVyYXRpb24gd2hpbGUgaW5zdGFsbGluZyBrYXJwZW50ZXIgaGVsbSBjaGFydCB1c2luZyBhZGRIZWxtQ2hhcnQgQVBJXG4gICAgICovXG4gICAgaGVsbUNoYXJ0VGltZW91dD86IER1cmF0aW9uLFxuXG4gICAgLyoqXG4gICAgICogVXNlIFBvZCBJZGVudGl0eS5cbiAgICAgKiBUbyB1c2UgRUtTIFBvZCBJZGVudGl0aWVzXG4gICAgICogIC0gVGhlIGNsdXN0ZXIgbXVzdCBoYXZlIEt1YmVybmV0ZXMgdmVyc2lvbiAxLjI0IG9yIGxhdGVyXG4gICAgICogIC0gS2FycGVudGVyIFBvZHMgbXVzdCBiZSBhc3NpZ25lZCB0byBMaW51eCBBbWF6b24gRUMyIGluc3RhbmNlc1xuICAgICAqICAtIEthcnBlbnRlciB2ZXJzaW9uIHN1cHBvcnRzIFBvZCBJZGVudGl0eSAodjAuMzUuMCBvciBsYXRlcikgc2VlIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9la3MvbGF0ZXN0L3VzZXJndWlkZS9wb2QtaWRlbnRpdHkuaHRtbFxuICAgICAqXG4gICAgICogQHNlZSBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vZWtzL2xhdGVzdC91c2VyZ3VpZGUvcG9kLWlkZW50aXR5Lmh0bWxcbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgcG9kSWRlbnRpdHk/OiBib29sZWFuLFxufVxuXG5jb25zdCBLQVJQRU5URVIgPSAna2FycGVudGVyJztcbmNvbnN0IFJFTEVBU0UgPSAnYmx1ZXByaW50cy1hZGRvbi1rYXJwZW50ZXInO1xuXG4vKipcbiAqIERlZmF1bHRzIG9wdGlvbnMgZm9yIHRoZSBhZGQtb25cbiAqL1xuY29uc3QgZGVmYXVsdFByb3BzOiBIZWxtQWRkT25Qcm9wcyA9IHtcbiAgICBuYW1lOiBLQVJQRU5URVIsXG4gICAgbmFtZXNwYWNlOiBLQVJQRU5URVIsXG4gICAgdmVyc2lvbjogJ3YwLjM0LjEnLFxuICAgIGNoYXJ0OiBLQVJQRU5URVIsXG4gICAgcmVsZWFzZTogS0FSUEVOVEVSLFxuICAgIHJlcG9zaXRvcnk6ICdvY2k6Ly9wdWJsaWMuZWNyLmF3cy9rYXJwZW50ZXIva2FycGVudGVyJyxcbn07XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgdGhlIEthcnBlbnRlciBhZGQtb25cbiAqL1xuQHV0aWxzLnN1cHBvcnRzQUxMXG5leHBvcnQgY2xhc3MgS2FycGVudGVyQWRkT24gZXh0ZW5kcyBIZWxtQWRkT24ge1xuXG4gICAgcmVhZG9ubHkgb3B0aW9uczogS2FycGVudGVyQWRkT25Qcm9wcztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogS2FycGVudGVyQWRkT25Qcm9wcykge1xuICAgICAgICBzdXBlcih7Li4uZGVmYXVsdFByb3BzLCAuLi5wcm9wc30pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzO1xuICAgIH1cblxuICAgIEB1dGlscy5jb25mbGljdHNXaXRoKCdDbHVzdGVyQXV0b1NjYWxlckFkZE9uJylcbiAgICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogUHJvbWlzZTxDb25zdHJ1Y3Q+IHtcbiAgICAgICAgYXNzZXJ0KGNsdXN0ZXJJbmZvLmNsdXN0ZXIgaW5zdGFuY2VvZiBDbHVzdGVyLCBcIkthcnBlbnRlckFkZE9uIGNhbm5vdCBiZSB1c2VkIHdpdGggaW1wb3J0ZWQgY2x1c3RlcnMgYXMgaXQgcmVxdWlyZXMgY2hhbmdlcyB0byB0aGUgY2x1c3RlciBhdXRoZW50aWNhdGlvbi5cIik7XG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgOiBDbHVzdGVyID0gY2x1c3RlckluZm8uY2x1c3RlcjtcbiAgICAgICAgY29uc3QgZW5kcG9pbnQgPSBjbHVzdGVyLmNsdXN0ZXJFbmRwb2ludDtcbiAgICAgICAgY29uc3QgbmFtZSA9IGNsdXN0ZXIuY2x1c3Rlck5hbWU7XG4gICAgICAgIGNvbnN0IHBhcnRpdGlvbiA9IGNsdXN0ZXIuc3RhY2sucGFydGl0aW9uO1xuXG4gICAgICAgIGNvbnN0IHN0YWNrTmFtZSA9IGNsdXN0ZXIuc3RhY2suc3RhY2tOYW1lO1xuICAgICAgICBjb25zdCByZWdpb24gPSBjbHVzdGVyLnN0YWNrLnJlZ2lvbjtcblxuICAgICAgICBsZXQgdmFsdWVzID0gdGhpcy5vcHRpb25zLnZhbHVlcyA/PyB7fTtcbiAgICAgICAgY29uc3QgdmVyc2lvbiA9IHRoaXMub3B0aW9ucy52ZXJzaW9uITtcblxuICAgICAgICBjb25zdCBpbnRlcnJ1cHRpb24gPSB0aGlzLm9wdGlvbnMuaW50ZXJydXB0aW9uSGFuZGxpbmcgfHwgZmFsc2U7XG4gICAgICAgIGNvbnN0IGluc3RhbGxDUkRzID0gdGhpcy5vcHRpb25zLmluc3RhbGxDUkRzIHx8IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IHBvZElkZW50aXR5ID0gdGhpcy5vcHRpb25zLnBvZElkZW50aXR5IHx8IGZhbHNlO1xuXG4gICAgICAgIC8vIE5vZGVQb29sIHZhcmlhYmxlc1xuICAgICAgICBjb25zdCBsYWJlbHMgPSB0aGlzLm9wdGlvbnMubm9kZVBvb2xTcGVjPy5sYWJlbHMgfHwge307XG4gICAgICAgIGNvbnN0IGFubm90YXRpb25zID0gdGhpcy5vcHRpb25zLm5vZGVQb29sU3BlYz8uYW5ub3RhdGlvbnMgfHwge307XG4gICAgICAgIGNvbnN0IHRhaW50cyA9IHRoaXMub3B0aW9ucy5ub2RlUG9vbFNwZWM/LnRhaW50cyB8fCBbXTtcbiAgICAgICAgY29uc3Qgc3RhcnR1cFRhaW50cyA9IHRoaXMub3B0aW9ucy5ub2RlUG9vbFNwZWM/LnN0YXJ0dXBUYWludHMgfHwgW107XG4gICAgICAgIGNvbnN0IHJlcXVpcmVtZW50cyA9IHRoaXMub3B0aW9ucy5ub2RlUG9vbFNwZWM/LnJlcXVpcmVtZW50cyB8fCBbXTtcbiAgICAgICAgY29uc3QgY29uc29sID0gdGhpcy5vcHRpb25zLm5vZGVQb29sU3BlYz8uY29uc29saWRhdGlvbiB8fCBudWxsO1xuICAgICAgICBjb25zdCB0dGxTZWNvbmRzQWZ0ZXJFbXB0eSA9IHRoaXMub3B0aW9ucy5ub2RlUG9vbFNwZWM/LnR0bFNlY29uZHNBZnRlckVtcHR5IHx8IG51bGw7XG4gICAgICAgIGNvbnN0IHR0bFNlY29uZHNVbnRpbEV4cGlyZWQgPSB0aGlzLm9wdGlvbnMubm9kZVBvb2xTcGVjPy50dGxTZWNvbmRzVW50aWxFeHBpcmVkIHx8IG51bGw7XG4gICAgICAgIGNvbnN0IGRpc3J1cHRpb24gPSB0aGlzLm9wdGlvbnMubm9kZVBvb2xTcGVjPy5kaXNydXB0aW9uIHx8IG51bGw7XG4gICAgICAgIGNvbnN0IGxpbWl0cyA9IHRoaXMub3B0aW9ucy5ub2RlUG9vbFNwZWM/LmxpbWl0cyB8fCBudWxsO1xuICAgICAgICBjb25zdCB3ZWlnaHQgPSB0aGlzLm9wdGlvbnMubm9kZVBvb2xTcGVjPy53ZWlnaHQgfHwgbnVsbDtcblxuICAgICAgICAvLyBOb2RlQ2xhc3MgdmFyaWFibGVzXG4gICAgICAgIGNvbnN0IHN1Ym5ldFNlbGVjdG9yID0gdGhpcy5vcHRpb25zLmVjMk5vZGVDbGFzc1NwZWM/LnN1Ym5ldFNlbGVjdG9yO1xuICAgICAgICBjb25zdCBzZ1NlbGVjdG9yID0gdGhpcy5vcHRpb25zLmVjMk5vZGVDbGFzc1NwZWM/LnNlY3VyaXR5R3JvdXBTZWxlY3RvcjtcbiAgICAgICAgY29uc3Qgc3VibmV0U2VsZWN0b3JUZXJtcyA9IHRoaXMub3B0aW9ucy5lYzJOb2RlQ2xhc3NTcGVjPy5zdWJuZXRTZWxlY3RvclRlcm1zO1xuICAgICAgICBjb25zdCBzZ1NlbGVjdG9yVGVybXMgPSB0aGlzLm9wdGlvbnMuZWMyTm9kZUNsYXNzU3BlYz8uc2VjdXJpdHlHcm91cFNlbGVjdG9yVGVybXM7XG4gICAgICAgIGNvbnN0IGFtaUZhbWlseSA9IHRoaXMub3B0aW9ucy5lYzJOb2RlQ2xhc3NTcGVjPy5hbWlGYW1pbHk7XG4gICAgICAgIGNvbnN0IGFtaVNlbGVjdG9yID0gdGhpcy5vcHRpb25zLmVjMk5vZGVDbGFzc1NwZWM/LmFtaVNlbGVjdG9yIHx8IHt9O1xuICAgICAgICBjb25zdCBhbWlTZWxlY3RvclRlcm1zID0gdGhpcy5vcHRpb25zLmVjMk5vZGVDbGFzc1NwZWM/LmFtaVNlbGVjdG9yVGVybXM7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlU3RvcmVQb2xpY3kgPSB0aGlzLm9wdGlvbnMuZWMyTm9kZUNsYXNzU3BlYz8uaW5zdGFuY2VTdG9yZVBvbGljeSB8fCBudWxsO1xuICAgICAgICBjb25zdCB1c2VyRGF0YSA9IHRoaXMub3B0aW9ucy5lYzJOb2RlQ2xhc3NTcGVjPy51c2VyRGF0YSB8fCBcIlwiO1xuICAgICAgICBjb25zdCBpbnN0YW5jZVByb2YgPSB0aGlzLm9wdGlvbnMuZWMyTm9kZUNsYXNzU3BlYz8uaW5zdGFuY2VQcm9maWxlO1xuICAgICAgICBjb25zdCB0YWdzID0gdGhpcy5vcHRpb25zLmVjMk5vZGVDbGFzc1NwZWM/LnRhZ3MgfHwge307XG4gICAgICAgIGNvbnN0IG1ldGFkYXRhT3B0aW9ucyA9IHRoaXMub3B0aW9ucy5lYzJOb2RlQ2xhc3NTcGVjPy5tZXRhZGF0YU9wdGlvbnMgfHwge1xuICAgICAgICAgICAgaHR0cEVuZHBvaW50OiBcImVuYWJsZWRcIixcbiAgICAgICAgICAgIGh0dHBQcm90b2NvbElQdjY6IFwiZGlzYWJsZWRcIixcbiAgICAgICAgICAgIGh0dHBQdXRSZXNwb25zZUhvcExpbWl0OiAyLFxuICAgICAgICAgICAgaHR0cFRva2VuczogXCJyZXF1aXJlZFwiXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGJsb2NrRGV2aWNlTWFwcGluZ3MgPSB0aGlzLm9wdGlvbnMuZWMyTm9kZUNsYXNzU3BlYz8uYmxvY2tEZXZpY2VNYXBwaW5ncyB8fCBbXTtcbiAgICAgICAgY29uc3QgZGV0YWlsZWRNb25pdG9yaW5nID0gdGhpcy5vcHRpb25zLmVjMk5vZGVDbGFzc1NwZWM/LmRldGFpbGVkTW9uaXRvcmluZyB8fCBmYWxzZTtcblxuICAgICAgICAvLyBDaGVjayBLdWJlcm5ldGVzIGFuZCBLYXJwZW50ZXIgdmVyc2lvbiBjb21wYXRpYmlsaXR5IGZvciB3YXJuaW5nXG4gICAgICAgIHRoaXMuaXNDb21wYXRpYmxlKHZlcnNpb24sIGNsdXN0ZXJJbmZvLnZlcnNpb24pO1xuXG4gICAgICAgIC8vIFZlcnNpb24gZmVhdHVyZSBjaGVja3MgZm9yIGVycm9yc1xuICAgICAgICB0aGlzLnZlcnNpb25GZWF0dXJlQ2hlY2tzRm9yRXJyb3IoY2x1c3RlckluZm8sIHZlcnNpb24sIGRpc3J1cHRpb24sIGNvbnNvbCwgdHRsU2Vjb25kc0FmdGVyRW1wdHksIHR0bFNlY29uZHNVbnRpbEV4cGlyZWQsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuZWMyTm9kZUNsYXNzU3BlYywgYW1pRmFtaWx5KTtcblxuICAgICAgICAvLyBTZXQgdXAgdGhlIG5vZGUgcm9sZSBhbmQgaW5zdGFuY2UgcHJvZmlsZVxuICAgICAgICBjb25zdCBba2FycGVudGVyTm9kZVJvbGUsIGthcnBlbnRlckluc3RhbmNlUHJvZmlsZV0gPSB0aGlzLnNldFVwTm9kZVJvbGUoY2x1c3Rlciwgc3RhY2tOYW1lLCByZWdpb24pO1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgY29udHJvbGxlciBwb2xpY3lcbiAgICAgICAgbGV0IGthcnBlbnRlclBvbGljeURvY3VtZW50O1xuICAgICAgICBpZiAoc2VtdmVyLmd0ZSh2ZXJzaW9uLCBcInYwLjMyLjBcIikpe1xuICAgICAgICAgICAga2FycGVudGVyUG9saWN5RG9jdW1lbnQgPSBpYW0uUG9saWN5RG9jdW1lbnQuZnJvbUpzb24oS2FycGVudGVyQ29udHJvbGxlclBvbGljeUJldGEoY2x1c3RlciwgcGFydGl0aW9uLCByZWdpb24pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGthcnBlbnRlclBvbGljeURvY3VtZW50ID0gaWFtLlBvbGljeURvY3VtZW50LmZyb21Kc29uKEthcnBlbnRlckNvbnRyb2xsZXJQb2xpY3kpO1xuICAgICAgICB9XG4gICAgICAgIGthcnBlbnRlclBvbGljeURvY3VtZW50LmFkZFN0YXRlbWVudHMobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgIFwiaWFtOlBhc3NSb2xlXCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbYCR7a2FycGVudGVyTm9kZVJvbGUucm9sZUFybn1gXVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gU3VwcG9ydCBmb3IgTmF0aXZlIHNwb3QgaW50ZXJydXB0aW9uXG4gICAgICAgIGlmIChpbnRlcnJ1cHRpb24pe1xuICAgICAgICAgICAgLy8gQ3JlYXRlIEludGVycnVwdGlvbiBRdWV1ZVxuICAgICAgICAgICAgY29uc3QgcXVldWUgPSBuZXcgc3FzLlF1ZXVlKGNsdXN0ZXIuc3RhY2ssICdrYXJwZW50ZXItcXVldWUnLCB7XG4gICAgICAgICAgICAgICAgcXVldWVOYW1lOiBzdGFja05hbWUsXG4gICAgICAgICAgICAgICAgcmV0ZW50aW9uUGVyaW9kOiBEdXJhdGlvbi5zZWNvbmRzKDMwMCksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHF1ZXVlLmFkZFRvUmVzb3VyY2VQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgIHNpZDogJ0VDMkludGVycnVwdGlvblBvbGljeScsXG4gICAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICAgIHByaW5jaXBhbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdzcXMuYW1hem9uYXdzLmNvbScpLFxuICAgICAgICAgICAgICAgICAgICBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2V2ZW50cy5hbWF6b25hd3MuY29tJyksXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIFwic3FzOlNlbmRNZXNzYWdlXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc291cmNlczogW2Ake3F1ZXVlLnF1ZXVlQXJufWBdXG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIEFkZCBJbnRlcnJ1cHRpb24gUnVsZXNcbiAgICAgICAgICAgIG5ldyBSdWxlKGNsdXN0ZXIuc3RhY2ssICdzY2hlZHVsZS1jaGFuZ2UtcnVsZScsIHtcbiAgICAgICAgICAgICAgICBldmVudFBhdHRlcm46IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBbXCJhd3MuaGVhbHRoXCJdLFxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxUeXBlOiBbJ0FXUyBIZWFsdGggRXZlbnQnXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KS5hZGRUYXJnZXQobmV3IFNxc1F1ZXVlKHF1ZXVlKSk7XG5cbiAgICAgICAgICAgIG5ldyBSdWxlKGNsdXN0ZXIuc3RhY2ssICdzcG90LWludGVycnVwdGlvbi1ydWxlJywge1xuICAgICAgICAgICAgICAgIGV2ZW50UGF0dGVybjoge1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IFtcImF3cy5lYzJcIl0sXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbFR5cGU6IFsnRUMyIFNwb3QgSW5zdGFuY2UgSW50ZXJydXB0aW9uIFdhcm5pbmcnXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KS5hZGRUYXJnZXQobmV3IFNxc1F1ZXVlKHF1ZXVlKSk7XG5cbiAgICAgICAgICAgIG5ldyBSdWxlKGNsdXN0ZXIuc3RhY2ssICdyZWJhbGFuY2UtcnVsZScsIHtcbiAgICAgICAgICAgICAgICBldmVudFBhdHRlcm46IHtcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBbXCJhd3MuZWMyXCJdLFxuICAgICAgICAgICAgICAgICAgICBkZXRhaWxUeXBlOiBbJ0VDMiBJbnN0YW5jZSBSZWJhbGFuY2UgUmVjb21tZW5kYXRpb24nXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KS5hZGRUYXJnZXQobmV3IFNxc1F1ZXVlKHF1ZXVlKSk7XG5cbiAgICAgICAgICAgIG5ldyBSdWxlKGNsdXN0ZXIuc3RhY2ssICdpbnN0LXN0YXRlLWNoYW5nZS1ydWxlJywge1xuICAgICAgICAgICAgICAgIGV2ZW50UGF0dGVybjoge1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IFtcImF3cy5lYzJcIl0sXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbFR5cGU6IFsnQzIgSW5zdGFuY2UgU3RhdGUtY2hhbmdlIE5vdGlmaWNhdGlvbiddXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pLmFkZFRhcmdldChuZXcgU3FzUXVldWUocXVldWUpKTtcblxuICAgICAgICAgICAgLy8gQWRkIHBvbGljeSB0byB0aGUgbm9kZSByb2xlIHRvIGFsbG93IGFjY2VzcyB0byB0aGUgSW50ZXJydXB0aW9uIFF1ZXVlXG4gICAgICAgICAgICBjb25zdCBpbnRlcnJ1cHRpb25RdWV1ZVN0YXRlbWVudCA9IG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICBcInNxczpEZWxldGVNZXNzYWdlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwic3FzOkdldFF1ZXVlVXJsXCIsXG4gICAgICAgICAgICAgICAgICAgIFwic3FzOkdldFF1ZXVlQXR0cmlidXRlc1wiLFxuICAgICAgICAgICAgICAgICAgICBcInNxczpSZWNlaXZlTWVzc2FnZVwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFtgJHtxdWV1ZS5xdWV1ZUFybn1gXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBrYXJwZW50ZXJQb2xpY3lEb2N1bWVudC5hZGRTdGF0ZW1lbnRzKGludGVycnVwdGlvblF1ZXVlU3RhdGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSBOYW1lc3BhY2VcbiAgICAgICAgY29uc3QgbnMgPSB1dGlscy5jcmVhdGVOYW1lc3BhY2UodGhpcy5vcHRpb25zLm5hbWVzcGFjZSEsIGNsdXN0ZXIsIHRydWUsIHRydWUpO1xuXG4gICAgICAgIGxldCBzYTogYW55O1xuICAgICAgICBsZXQgc2FBbm5vdGF0aW9uOiBhbnk7XG4gICAgICAgIGlmIChwb2RJZGVudGl0eSAmJiBzZW12ZXIuZ3RlKGAke2NsdXN0ZXJJbmZvLnZlcnNpb24udmVyc2lvbn0uMGAsICcxLjI0LjAnKSAmJiBzZW12ZXIuZ3RlKHZlcnNpb24sIFwidjAuMzUuMFwiKSl7XG4gICAgICAgICAgc2EgPSB1dGlscy5wb2RJZGVudGl0eUFzc29jaWF0aW9uKGNsdXN0ZXIsIFJFTEVBU0UsIHRoaXMub3B0aW9ucy5uYW1lc3BhY2UhLCBrYXJwZW50ZXJQb2xpY3lEb2N1bWVudCk7XG4gICAgICAgICAgc2FBbm5vdGF0aW9uID0ge307XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2EgPSB1dGlscy5jcmVhdGVTZXJ2aWNlQWNjb3VudChjbHVzdGVyLCBSRUxFQVNFLCB0aGlzLm9wdGlvbnMubmFtZXNwYWNlISwga2FycGVudGVyUG9saWN5RG9jdW1lbnQpO1xuICAgICAgICAgIHNhQW5ub3RhdGlvbiA9IHtcImVrcy5hbWF6b25hd3MuY29tL3JvbGUtYXJuXCI6IHNhLnJvbGUucm9sZUFybn07XG4gICAgICAgIH1cbiAgICAgICAgc2Eubm9kZS5hZGREZXBlbmRlbmN5KG5zKTtcblxuICAgICAgICAvLyBDcmVhdGUgZ2xvYmFsIGhlbG0gdmFsdWVzIGJhc2VkIG9uIHYxYmV0YTEgbWlncmF0aW9uIGFzIHNob3duIGJlbG93OlxuICAgICAgICAvLyBodHRwczovL2thcnBlbnRlci5zaC92MC4zMi91cGdyYWRpbmcvdjFiZXRhMS1taWdyYXRpb24vI2hlbG0tdmFsdWVzXG4gICAgICAgIGxldCBnbG9iYWxTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBuYW1lLFxuICAgICAgICAgICAgY2x1c3RlckVuZHBvaW50OiBlbmRwb2ludFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChzZW12ZXIubHQodmVyc2lvbiwgJzAuMzIuMCcpKXtcbiAgICAgICAgICAgIGdsb2JhbFNldHRpbmdzID0gbWVyZ2UoZ2xvYmFsU2V0dGluZ3MsIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0SW5zdGFuY2VQcm9maWxlOiBrYXJwZW50ZXJJbnN0YW5jZVByb2ZpbGUuaW5zdGFuY2VQcm9maWxlTmFtZSxcbiAgICAgICAgICAgICAgICBpbnRlcnJ1cHRpb25RdWV1ZU5hbWU6IGludGVycnVwdGlvbiA/IHN0YWNrTmFtZSA6IFwiXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2xvYmFsU2V0dGluZ3MgPSBtZXJnZShnbG9iYWxTZXR0aW5ncywge1xuICAgICAgICAgICAgICAgIGludGVycnVwdGlvblF1ZXVlOiBpbnRlcnJ1cHRpb24gPyBzdGFja05hbWUgOiBcIlwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZW12ZXIubHQodmVyc2lvbiwgJzAuMzIuMCcpKXtcbiAgICAgICAgICAgIHV0aWxzLnNldFBhdGgodmFsdWVzLCBcInNldHRpbmdzLmF3c1wiLCBtZXJnZShnbG9iYWxTZXR0aW5ncywgdmFsdWVzPy5zZXR0aW5ncz8uYXdzID8/IHt9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1dGlscy5zZXRQYXRoKHZhbHVlcywgXCJzZXR0aW5nc1wiLCBtZXJnZShnbG9iYWxTZXR0aW5ncywgdmFsdWVzPy5zZXR0aW5ncyA/PyB7fSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGV0IEhlbG0gY3JlYXRlIHRoZSBzZXJ2aWNlIGFjY291bnQgaWYgdXNpbmcgcG9kIGlkZW50aXR5XG4gICAgICAgIGNvbnN0IHNhVmFsdWVzID0ge1xuICAgICAgICAgICAgc2VydmljZUFjY291bnQ6IHtcbiAgICAgICAgICAgICAgICBjcmVhdGU6IHBvZElkZW50aXR5LFxuICAgICAgICAgICAgICAgIG5hbWU6IFJFTEVBU0UsXG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IHNhQW5ub3RhdGlvbixcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YWx1ZXMgPSBtZXJnZSh2YWx1ZXMsIHNhVmFsdWVzKTtcbiAgICAgICAgLy8gSW5zdGFsbCBIZWxtQ2hhcnQgdXNpbmcgdXNlciBkZWZpbmVkIHZhbHVlIG9yIGRlZmF1bHQgb2YgNSBtaW51dGVzLlxuICAgICAgICBjb25zdCBoZWxtQ2hhcnRUaW1lb3V0ID0gdGhpcy5vcHRpb25zLmhlbG1DaGFydFRpbWVvdXQgfHwgRHVyYXRpb24ubWludXRlcyg1KTtcbiAgICAgICAgY29uc3Qga2FycGVudGVyQ2hhcnQgPSB0aGlzLmFkZEhlbG1DaGFydChjbHVzdGVySW5mbywgdmFsdWVzLCBmYWxzZSwgdHJ1ZSwgaGVsbUNoYXJ0VGltZW91dCk7XG5cbiAgICAgICAga2FycGVudGVyQ2hhcnQubm9kZS5hZGREZXBlbmRlbmN5KHNhKTtcblxuICAgICAgICBpZihjbHVzdGVySW5mby5ub2RlR3JvdXBzKSB7XG4gICAgICAgICAgICBjbHVzdGVySW5mby5ub2RlR3JvdXBzLmZvckVhY2gobiA9PiBrYXJwZW50ZXJDaGFydC5ub2RlLmFkZERlcGVuZGVuY3kobikpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbXZlci5ndGUodmVyc2lvbiwgXCIwLjMyLjBcIikgJiYgaW5zdGFsbENSRHMpe1xuICAgICAgICAgICAgbGV0IF92ZXJzaW9uID0gdmVyc2lvbjtcbiAgICAgICAgICAgIGlmKCF2ZXJzaW9uLnN0YXJ0c1dpdGgoJ3YnKSkge1xuICAgICAgICAgICAgICAgIF92ZXJzaW9uID0gYHYke3ZlcnNpb259YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgQ1JEcyA9W1xuICAgICAgICAgICAgICAgIFsgXCJrYXJwZW50ZXJzaC1ub2RlcG9vbC1iZXRhMS1jcmRcIiwgYGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9hd3Mva2FycGVudGVyLyR7X3ZlcnNpb259L3BrZy9hcGlzL2NyZHMva2FycGVudGVyLnNoX25vZGVwb29scy55YW1sYCBdLFxuICAgICAgICAgICAgICAgIFsgXCJrYXJwZW50ZXJzaC1ub2RlY2xhaW1zLWJldGExLWNyZFwiLCBgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2F3cy9rYXJwZW50ZXIvJHtfdmVyc2lvbn0vcGtnL2FwaXMvY3Jkcy9rYXJwZW50ZXIuc2hfbm9kZWNsYWltcy55YW1sYF0sXG4gICAgICAgICAgICAgICAgWyBcImthcnBlbnRlcms4cy1lYzJub2RlY2xhc3Nlcy1iZXRhMS1jcmRcIiwgYGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9hd3Mva2FycGVudGVyLyR7X3ZlcnNpb259L3BrZy9hcGlzL2NyZHMva2FycGVudGVyLms4cy5hd3NfZWMybm9kZWNsYXNzZXMueWFtbGBdLFxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgLy8gbG9vcCBvdmVyIHRoZSBDUkQncyBhbmQgbG9hZCB0aGUgeWFtbCBhbmQgZGVwbG95IHRoZSBtYW5pZmVzdFxuICAgICAgICAgICAgZm9yIChjb25zdCBbY3JkTmFtZSwgY3JkVXJsXSBvZiBDUkRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3JkTWFuaWZlc3QgPSB1dGlscy5sb2FkRXh0ZXJuYWxZYW1sKGNyZFVybCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFuaWZlc3QgPSBjbHVzdGVyLmFkZE1hbmlmZXN0KGNyZE5hbWUsIGNyZE1hbmlmZXN0KTtcblxuICAgICAgICAgICAgICAgIC8vIFdlIHdhbnQgdGhlc2UgaW5zdGFsbGVkIGJlZm9yZSB0aGUga2FycGVudGVyQ2hhcnQsIG9yIGhlbG0gd2lsbCB0aW1lb3V0IHdhaXRpbmcgZm9yIGl0IHRvIHN0YWJpbGl6ZVxuICAgICAgICAgICAgICAgIGthcnBlbnRlckNoYXJ0Lm5vZGUuYWRkRGVwZW5kZW5jeShtYW5pZmVzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIERlcGxveSBQcm92aXNpb25lciAoQWxwaGEpIG9yIE5vZGVQb29sIChCZXRhKSBDUkQgYmFzZWQgb24gdGhlIEthcnBlbnRlciBWZXJzaW9uXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubm9kZVBvb2xTcGVjKXtcbiAgICAgICAgICAgIGxldCBwb29sO1xuICAgICAgICAgICAgaWYgKHNlbXZlci5ndGUodmVyc2lvbiwgJzAuMzIuMCcpKXtcbiAgICAgICAgICAgICAgICBwb29sID0ge1xuICAgICAgICAgICAgICAgICAgICBhcGlWZXJzaW9uOiAna2FycGVudGVyLnNoL3YxYmV0YTEnLFxuICAgICAgICAgICAgICAgICAgICBraW5kOiAnTm9kZVBvb2wnLFxuICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YTogeyBuYW1lOiAnZGVmYXVsdC1ub2RlcG9vbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgc3BlYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IGFubm90YXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlQ2xhc3NSZWY6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiZGVmYXVsdC1lYzJub2RlY2xhc3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWludHM6IHRhaW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR1cFRhaW50czogc3RhcnR1cFRhaW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmNvbnZlcnQocmVxdWlyZW1lbnRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcnVwdGlvbjogZGlzcnVwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0czogbGltaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0OiB3ZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcG9vbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgYXBpVmVyc2lvbjogJ2thcnBlbnRlci5zaC92MWFscGhhNScsXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ6ICdQcm92aXNpb25lcicsXG4gICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7IG5hbWU6ICdkZWZhdWx0LXByb3Zpc2lvbmVyJyB9LFxuICAgICAgICAgICAgICAgICAgICBzcGVjOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlclJlZjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiZGVmYXVsdC1ub2RldGVtcGxhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhaW50czogdGFpbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR1cFRhaW50czogc3RhcnR1cFRhaW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IGFubm90YXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmNvbnZlcnQocmVxdWlyZW1lbnRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogbGltaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGlkYXRpb246IGNvbnNvbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR0bFNlY29uZHNVbnRpbEV4cGlyZWQ6IHR0bFNlY29uZHNVbnRpbEV4cGlyZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0dGxTZWNvbmRzQWZ0ZXJFbXB0eTogdHRsU2Vjb25kc0FmdGVyRW1wdHksXG4gICAgICAgICAgICAgICAgICAgICAgICB3ZWlnaHQ6IHdlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcG9vbE1hbmlmZXN0ID0gY2x1c3Rlci5hZGRNYW5pZmVzdCgnZGVmYXVsdC1wb29sJywgcG9vbCk7XG4gICAgICAgICAgICBwb29sTWFuaWZlc3Qubm9kZS5hZGREZXBlbmRlbmN5KGthcnBlbnRlckNoYXJ0KTtcblxuICAgICAgICAgICAgLy8gRGVwbG95IEFXU05vZGVUZW1wbGF0ZSAoQWxwaGEpIG9yIEVDMk5vZGVDbGFzcyAoQmV0YSkgQ1JEIGJhc2VkIG9uIHRoZSBLYXJwZW50ZXIgVmVyc2lvblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5lYzJOb2RlQ2xhc3NTcGVjKXtcbiAgICAgICAgICAgICAgICBsZXQgZWMyTm9kZTtcbiAgICAgICAgICAgICAgICBpZiAoc2VtdmVyLmd0ZSh2ZXJzaW9uLCAnMC4zMi4wJykpe1xuICAgICAgICAgICAgICAgICAgICBlYzJOb2RlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpVmVyc2lvbjogXCJrYXJwZW50ZXIuazhzLmF3cy92MWJldGExXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBcIkVDMk5vZGVDbGFzc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcImRlZmF1bHQtZWMybm9kZWNsYXNzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVjOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW1pRmFtaWx5OiBhbWlGYW1pbHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibmV0U2VsZWN0b3JUZXJtczogc3VibmV0U2VsZWN0b3JUZXJtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWN1cml0eUdyb3VwU2VsZWN0b3JUZXJtczogc2dTZWxlY3RvclRlcm1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFtaVNlbGVjdG9yVGVybXM6IGFtaVNlbGVjdG9yVGVybXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3M6IHRhZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGFPcHRpb25zOiBtZXRhZGF0YU9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tEZXZpY2VNYXBwaW5nczogYmxvY2tEZXZpY2VNYXBwaW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxlZE1vbml0b3Jpbmc6IGRldGFpbGVkTW9uaXRvcmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvdmlkZSBjdXN0b20gSW5zdGFuY2UgUHJvZmlsZSB0byByZXBsYWNlIHJvbGUgaWYgcHJvdmlkZWQsIGVsc2UgdXNlIHRoZSByb2xlIGNyZWF0ZWQgd2l0aCB0aGUgYWRkb25cbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlUHJvZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWMyTm9kZSA9IG1lcmdlKGVjMk5vZGUsIHsgc3BlYzogeyBpbnN0YW5jZVByb2ZpbGU6IGluc3RhbmNlUHJvZiB9fSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlYzJOb2RlID0gbWVyZ2UoZWMyTm9kZSwgeyBzcGVjOiB7IHJvbGU6IGthcnBlbnRlck5vZGVSb2xlLnJvbGVOYW1lIH19KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEluc3RhbmNlIFN0b3JlIFBvbGljeSBhZGRlZCBmb3IgdjAuMzQuMCBhbmQgdXBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbXZlci5ndGUodmVyc2lvbiwgJzAuMzQuMCcpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVjMk5vZGUgPSBtZXJnZShlYzJOb2RlLCB7IHNwZWM6IHsgaW5zdGFuY2VTdG9yZVBvbGljeTogaW5zdGFuY2VTdG9yZVBvbGljeSB9fSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlYzJOb2RlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpVmVyc2lvbjogXCJrYXJwZW50ZXIuazhzLmF3cy92MWFscGhhMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAga2luZDogXCJBV1NOb2RlVGVtcGxhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJkZWZhdWx0LW5vZGV0ZW1wbGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BlYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym5ldFNlbGVjdG9yOiBzdWJuZXRTZWxlY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWN1cml0eUdyb3VwU2VsZWN0b3I6IHNnU2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VQcm9maWxlOiBpbnN0YW5jZVByb2YgPyBpbnN0YW5jZVByb2YgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFtaUZhbWlseTogYW1pRmFtaWx5ID8gYW1pRmFtaWx5IDogXCJBTDJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbWlTZWxlY3RvcjogYW1pU2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnczogdGFncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YU9wdGlvbnM6IG1ldGFkYXRhT3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9ja0RldmljZU1hcHBpbmdzOiBibG9ja0RldmljZU1hcHBpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB1c2VyRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIEVDMiBEZXRhaWxlZCBNb25pdG9yaW5nIGZvciB2MC4yMi4wIGFuZCB1cFxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VtdmVyLmd0ZSh2ZXJzaW9uLCAnMC4yMi4wJykpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZWMyTm9kZSA9IG1lcmdlKGVjMk5vZGUsIHsgc3BlYzogeyBkZXRhaWxlZE1vbml0b3Jpbmc6IGRldGFpbGVkTW9uaXRvcmluZ319KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBub2RlTWFuaWZlc3QgPSBjbHVzdGVyLmFkZE1hbmlmZXN0KCdkZWZhdWx0LW5vZGUtdGVtcGxhdGUnLCBlYzJOb2RlKTtcbiAgICAgICAgICAgICAgICBub2RlTWFuaWZlc3Qubm9kZS5hZGREZXBlbmRlbmN5KHBvb2xNYW5pZmVzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGthcnBlbnRlckNoYXJ0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgZnVuY3Rpb24gdG8gY29udmVydCBhIGtleS1wYWlyIHZhbHVlcyAod2l0aCBhbiBvcGVyYXRvcilcbiAgICAgKiBvZiBzcGVjIGNvbmZpZ3VyYXRpb25zIHRvIGFwcHJvcHJpYXRlIGpzb24gZm9ybWF0IGZvciBhZGRNYW5pZmVzdCBmdW5jdGlvblxuICAgICAqIEBwYXJhbSByZXFzXG4gICAgICogQHJldHVybnMgbmV3UmVxc1xuICAgICAqICovXG4gICAgcHJvdGVjdGVkIGNvbnZlcnQocmVxczoge2tleTogc3RyaW5nLCBvcGVyYXRvcjogc3RyaW5nLCB2YWx1ZXM6IHN0cmluZ1tdfVtdKTogYW55W10ge1xuICAgICAgICBjb25zdCBuZXdSZXFzID0gW107XG4gICAgICAgIGZvciAobGV0IHJlcSBvZiByZXFzKXtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHJlcVsna2V5J107XG4gICAgICAgICAgICBjb25zdCBvcCA9IHJlcVsnb3BlcmF0b3InXTtcbiAgICAgICAgICAgIGNvbnN0IHZhbCA9IHJlcVsndmFsdWVzJ107XG4gICAgICAgICAgICBjb25zdCByZXF1aXJlbWVudCA9IHtcbiAgICAgICAgICAgICAgICBcImtleVwiOiBrZXksXG4gICAgICAgICAgICAgICAgXCJvcGVyYXRvclwiOiBvcCxcbiAgICAgICAgICAgICAgICBcInZhbHVlc1wiOiB2YWxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBuZXdSZXFzLnB1c2gocmVxdWlyZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdSZXFzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBmdW5jdGlvbiB0byBlbnN1cmUgcmlnaHQgZmVhdHVyZXMgYXJlIGFkZGVkIGFzIHBhcnQgb2YgdGhlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBmb3IgdGhlIHJpZ2h0IHZlcnNpb24gb2YgdGhlIGFkZC1vblxuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mb1xuICAgICAqIEBwYXJhbSB2ZXJzaW9uIHZlcnNpb24gb2YgdGhlIGFkZC1vblxuICAgICAqIEBwYXJhbSBkaXNydXB0aW9uIGRpc3J1cHRpb24gZmVhdHVyZSBhdmFpbGFibGUgd2l0aCB0aGUgQmV0YSBDUkRzXG4gICAgICogQHBhcmFtIGNvbnNvbGlkYXRpb24gY29uc29saWRhdGlvbiBzZXR0aW5nIGF2YWlsYWJsZSB3aXRoIHRoZSBBbHBoYSBDUkRzXG4gICAgICogQHBhcmFtIHR0bFNlY29uZHNBZnRlckVtcHR5IHR0bFNlY29uZHNBZnRlckVtcHR5IHNldHRpbmdcbiAgICAgKiBAcGFyYW0gdHRsU2Vjb25kc1VudGlsRXhwaXJlZCB0dGxTZWNvbmRzVW50aWxFeHBpcmVkIHNldHRpbmdcbiAgICAgKiBAcGFyYW0gZWMyTm9kZUNsYXNzU3BlYyBOb2RlIENsYXNzIFNwZWNcbiAgICAgKiBAcGFyYW0gYW1pRmFtaWx5IEFNSSBGYW1pbHlcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByaXZhdGUgdmVyc2lvbkZlYXR1cmVDaGVja3NGb3JFcnJvcihjbHVzdGVySW5mbzogQ2x1c3RlckluZm8sIHZlcnNpb246IHN0cmluZywgZGlzcnVwdGlvbjogYW55LCBjb25zb2xpZGF0aW9uOiBhbnksIHR0bFNlY29uZHNBZnRlckVtcHR5OiBhbnksIHR0bFNlY29uZHNVbnRpbEV4cGlyZWQ6IGFueSxcbiAgICAgICAgZWMyTm9kZUNsYXNzU3BlYzogYW55LCBhbWlGYW1pbHk6IGFueSk6IHZvaWQge1xuXG4gICAgICAgIC8vIEVDMiBEZXRhaWxlZCBNb25pdG9yaW5nIGlzIG9ubHkgYXZhaWxhYmxlIGluIHZlcnNpb25zIDAuMjMuMCBhbmQgYWJvdmVcbiAgICAgICAgaWYgKHNlbXZlci5sdCh2ZXJzaW9uLCAnMC4yMy4wJykgJiYgZWMyTm9kZUNsYXNzU3BlYyl7XG4gICAgICAgICAgICBhc3NlcnQoZWMyTm9kZUNsYXNzU3BlY1tcImRldGFpbGVkTW9uaXRvcmluZ1wiXSA9PT0gdW5kZWZpbmVkLCBcIkRldGFpbGVkIE1vbml0b3JpbmcgaXMgbm90IGF2YWlsYWJsZSBpbiB0aGlzIHZlcnNpb24gb2YgS2FycGVudGVyLiBQbGVhc2UgdXBncmFkZSB0byBhdCBsZWFzdCAwLjIzLjAuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGlzcnVwdGlvbiBidWRnZXQgc2hvdWxkIG5vdCBleGlzdCBmb3IgdmVyc2lvbnMgYmVsb3cgMC4zNC54XG4gICAgICAgIGlmIChzZW12ZXIubHQodmVyc2lvbiwgJzAuMzQuMCcpKXtcbiAgICAgICAgICAgIGlmIChkaXNydXB0aW9uKXtcbiAgICAgICAgICAgICAgICBhc3NlcnQoIWRpc3J1cHRpb25bXCJidWRnZXRzXCJdLCBcIllvdSBjYW5ub3Qgc2V0IGRpc3J1cHRpb24gYnVkZ2V0cyBmb3IgdGhpcyB2ZXJzaW9uIG9mIEthcnBlbnRlci4gUGxlYXNlIHVwZ3JhZGUgdG8gMC4zNC4wIG9yIGhpZ2hlci5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB2ZXJzaW9uIGNoZWNrIGVycm9ycyBmb3IgdjAuMzIuMCBhbmQgdXAgKGJldGEgQ1JEcylcbiAgICAgICAgaWYgKHNlbXZlci5ndGUodmVyc2lvbiwgJzAuMzIuMCcpKXtcbiAgICAgICAgICAgIC8vIENvbnNvbGlkYXRpb24gZmVhdHVyZXMgZG9uJ3QgZXhpc3QgaW4gYmV0YSBDUkRzXG4gICAgICAgICAgICBhc3NlcnQoIWNvbnNvbGlkYXRpb24gJiYgIXR0bFNlY29uZHNBZnRlckVtcHR5ICYmICF0dGxTZWNvbmRzVW50aWxFeHBpcmVkLCAnQ29uc29saWRhdGlvbiBmZWF0dXJlcyBhcmUgb25seSBhdmFpbGFibGUgZm9yIHByZXZpb3VzIHZlcnNpb25zIG9mIEthcnBlbnRlci4nKTtcblxuICAgICAgICAgICAgLy8gY29uc29saWRhdGVBZnRlciBjYW5ub3QgYmUgc2V0IGlmIHBvbGljeSBpcyBzZXQgdG8gV2hlblVuZGVydXRpbGl6ZWRcbiAgICAgICAgICAgIGlmIChkaXNydXB0aW9uICYmIGRpc3J1cHRpb25bXCJjb25zb2xpZGF0aW9uUG9saWN5XCJdID09IFwiV2hlblVuZGVydXRpbGl6ZWRcIil7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KCFkaXNydXB0aW9uW1wiY29uc29saWRhdGVBZnRlclwiXSwgJ1lvdSBjYW5ub3Qgc2V0IGNvbnNvbGlkYXRlQWZ0ZXIgdmFsdWUgaWYgdGhlIGNvbnNvbGlkYXRpb24gcG9saWN5IGlzIHNldCB0byBVbmRlcnV0aWxpemVkLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBTUkgRmFtaWx5LCBTZWN1cml0eSBHcm91cCBhbmQgU3VibmV0IHRlcm1zIG11c3QgYmUgcHJvdmlkZWQsIGdpdmVuIEVDMiBOb2RlU3BlY1xuICAgICAgICAgICAgaWYgKGVjMk5vZGVDbGFzc1NwZWMpe1xuICAgICAgICAgICAgICAgIGFzc2VydChhbWlGYW1pbHkgIT09IHVuZGVmaW5lZCwgXCJQbGVhc2UgcHJvdmlkZSB0aGUgQU1JIEZhbWlseSBmb3IgeW91ciBFQzJOb2RlQ2xhc3MuXCIpO1xuICAgICAgICAgICAgICAgIGFzc2VydChlYzJOb2RlQ2xhc3NTcGVjW1wic2VjdXJpdHlHcm91cFNlbGVjdG9yVGVybXNcIl0gIT09IHVuZGVmaW5lZCwgXCJQbGVhc2UgcHJvdmlkZSBTZWN1cml0eUdyb3VwVGVybSBmb3IgeW91ciBFQzJOb2RlQ2xhc3MuXCIpO1xuICAgICAgICAgICAgICAgIGFzc2VydChlYzJOb2RlQ2xhc3NTcGVjW1wic3VibmV0U2VsZWN0b3JUZXJtc1wiXSAhPT0gdW5kZWZpbmVkLCBcIlBsZWFzZSBwcm92aWRlIHN1Ym5ldEdyb3VwVGVybSBmb3IgeW91ciBFQzJOb2RlQ2xhc3MuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmVyc2lvbiBjaGVjayBlcnJvcnMgZm9yIHYwLjMxLnggYW5kIGRvd24gKGFscGhhIENSRHMpXG4gICAgICAgIC8vIEluY2x1ZGVzIGNoZWNrcyBmb3IgY29uc29saWRhdGlvbiBhbmQgZGlzcnVwdGlvbiBmZWF0dXJlc1xuICAgICAgICBpZiAoc2VtdmVyLmx0KHZlcnNpb24sICcwLjMyLjAnKSl7XG4gICAgICAgICAgICBpZiAoY29uc29saWRhdGlvbil7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KCEoY29uc29saWRhdGlvbi5lbmFibGVkICYmIHR0bFNlY29uZHNBZnRlckVtcHR5KSAsICdDb25zb2xpZGF0aW9uIGFuZCB0dGxTZWNvbmRzQWZ0ZXJFbXB0eSBtdXN0IGJlIG11dHVhbGx5IGV4Y2x1c2l2ZS4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFzc2VydCghZGlzcnVwdGlvbiwgJ0Rpc3J1cHRpb24gY29uZmlndXJhdGlvbiBpcyBvbmx5IHN1cHBvcnRlZCBvbiB2ZXJzaW9ucyB2MC4zMi4wIGFuZCBsYXRlci4nKTtcblxuICAgICAgICAgICAgLy9TZWN1cml0eSBHcm91cCBhbmQgU3VibmV0IHRlcm1zIG11c3QgYmUgcHJvdmlkZWQsIGdpdmVuIEVDMiBOb2RlU3BlY1xuICAgICAgICAgICAgaWYgKGVjMk5vZGVDbGFzc1NwZWMpe1xuICAgICAgICAgICAgICAgIGFzc2VydChlYzJOb2RlQ2xhc3NTcGVjW1wic2VjdXJpdHlHcm91cFNlbGVjdG9yXCJdICE9PSB1bmRlZmluZWQsIFwiUGxlYXNlIHByb3ZpZGUgU2VjdXJpdHlHcm91cFRlcm0gZm9yIHlvdXIgQVdTTm9kZVRlbXBsYXRlLlwiKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZWMyTm9kZUNsYXNzU3BlY1tcInN1Ym5ldFNlbGVjdG9yXCJdICE9PSB1bmRlZmluZWQsIFwiUGxlYXNlIHByb3ZpZGUgc3VibmV0R3JvdXBUZXJtIGZvciB5b3VyIEFXU05vZGVUZW1wbGF0ZS5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBzaG91bGQgYmxvY2sgTm9kZSBUZXJtaW5hdGlvbiBIYW5kbGVyIHVzYWdlIG9uY2UgS2FycGVudGVyIGlzIGxldmVyYWdlZFxuICAgICAgICAgYXNzZXJ0KCFjbHVzdGVySW5mby5nZXRQcm92aXNpb25lZEFkZE9uKCdBd3NOb2RlVGVybWluYXRpb25IYW5kbGVyQWRkT24nKSwgJ0thcnBlbnRlciBzdXBwb3J0cyBuYXRpdmUgaW50ZXJydXB0aW9uIGhhbmRsaW5nLCBzbyBOb2RlIFRlcm1pbmF0aW9uIEhhbmRsZXIgd2lsbCBub3QgYmUgbmVjZXNzYXJ5LicpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGVscGVyIGZ1bmN0aW9uIHRvIHNldCB1cCB0aGUgS2FycGVudGVyIE5vZGUgUm9sZSBhbmQgSW5zdGFuY2UgUHJvZmlsZVxuICAgICAqIE91dHB1dHMgdG8gQ2xvdWRGb3JtYXRpb24gYW5kIG1hcCB0aGUgcm9sZSB0byB0aGUgYXdzLWF1dGggQ29uZmlnTWFwXG4gICAgICogQHBhcmFtIGNsdXN0ZXIgRUtTIENsdXN0ZXJcbiAgICAgKiBAcGFyYW0gc3RhY2tOYW1lIE5hbWUgb2YgdGhlIHN0YWNrXG4gICAgICogQHBhcmFtIHJlZ2lvbiBSZWdpb24gb2YgdGhlIHN0YWNrXG4gICAgICogQHJldHVybnMgW2thcnBlbnRlck5vZGVSb2xlLCBrYXJwZW50ZXJJbnN0YW5jZVByb2ZpbGVdXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRVcE5vZGVSb2xlKGNsdXN0ZXI6IENsdXN0ZXIsIHN0YWNrTmFtZTogc3RyaW5nLCByZWdpb246IHN0cmluZyk6IFtpYW0uUm9sZSwgaWFtLkNmbkluc3RhbmNlUHJvZmlsZV0ge1xuICAgICAgICAvLyBTZXQgdXAgTm9kZSBSb2xlXG4gICAgICAgIGNvbnN0IGthcnBlbnRlck5vZGVSb2xlID0gbmV3IGlhbS5Sb2xlKGNsdXN0ZXIsICdrYXJwZW50ZXItbm9kZS1yb2xlJywge1xuICAgICAgICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoYGVjMi4ke2NsdXN0ZXIuc3RhY2sudXJsU3VmZml4fWApLFxuICAgICAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgICAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uRUtTV29ya2VyTm9kZVBvbGljeVwiKSxcbiAgICAgICAgICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25FS1NfQ05JX1BvbGljeVwiKSxcbiAgICAgICAgICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25FQzJDb250YWluZXJSZWdpc3RyeVJlYWRPbmx5XCIpLFxuICAgICAgICAgICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvblNTTU1hbmFnZWRJbnN0YW5jZUNvcmVcIiksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgLy9yb2xlTmFtZTogYEthcnBlbnRlck5vZGVSb2xlLSR7bmFtZX1gIC8vIGxldCByb2xlIG5hbWUgdG8gYmUgZ2VuZXJhdGVkIGFzIHVuaXF1ZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTZXQgdXAgSW5zdGFuY2UgUHJvZmlsZVxuICAgICAgICBjb25zdCBpbnN0YW5jZVByb2ZpbGVOYW1lID0gbWQ1Lk1kNS5oYXNoU3RyKHN0YWNrTmFtZStyZWdpb24pO1xuICAgICAgICBjb25zdCBrYXJwZW50ZXJJbnN0YW5jZVByb2ZpbGUgPSBuZXcgaWFtLkNmbkluc3RhbmNlUHJvZmlsZShjbHVzdGVyLCAna2FycGVudGVyLWluc3RhbmNlLXByb2ZpbGUnLCB7XG4gICAgICAgICAgICByb2xlczogW2thcnBlbnRlck5vZGVSb2xlLnJvbGVOYW1lXSxcbiAgICAgICAgICAgIGluc3RhbmNlUHJvZmlsZU5hbWU6IGBLYXJwZW50ZXJOb2RlSW5zdGFuY2VQcm9maWxlLSR7aW5zdGFuY2VQcm9maWxlTmFtZX1gLFxuICAgICAgICAgICAgcGF0aDogJy8nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNsdXN0ZXJJZCA9IE5hbWVzLnVuaXF1ZUlkKGNsdXN0ZXIpO1xuXG4gICAgICAgIC8vQ2ZuIG91dHB1dCBmb3IgTm9kZSBSb2xlIGluIGNhc2Ugb2YgbmVlZGluZyB0byBhZGQgYWRkaXRpb25hbCBwb2xpY2llc1xuICAgICAgICBuZXcgQ2ZuT3V0cHV0KGNsdXN0ZXIuc3RhY2ssICdLYXJwZW50ZXIgSW5zdGFuY2UgTm9kZSBSb2xlJywge1xuICAgICAgICAgICAgdmFsdWU6IGthcnBlbnRlck5vZGVSb2xlLnJvbGVOYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiS2FycGVudGVyIGFkZC1vbiBOb2RlIFJvbGUgbmFtZVwiLFxuICAgICAgICAgICAgZXhwb3J0TmFtZTogY2x1c3RlcklkK1wiS2FycGVudGVyTm9kZVJvbGVOYW1lXCIsXG4gICAgICAgIH0pO1xuICAgICAgICAvL0NmbiBvdXRwdXQgZm9yIEluc3RhbmNlIFByb2ZpbGUgZm9yIGNyZWF0aW5nIGFkZGl0aW9uYWwgcHJvdmlzaW9uZXJzXG4gICAgICAgIG5ldyBDZm5PdXRwdXQoY2x1c3Rlci5zdGFjaywgJ0thcnBlbnRlciBJbnN0YW5jZSBQcm9maWxlIG5hbWUnLCB7XG4gICAgICAgICAgICB2YWx1ZToga2FycGVudGVySW5zdGFuY2VQcm9maWxlID8ga2FycGVudGVySW5zdGFuY2VQcm9maWxlLmluc3RhbmNlUHJvZmlsZU5hbWUhIDogXCJub25lXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJLYXJwZW50ZXIgYWRkLW9uIEluc3RhbmNlIFByb2ZpbGUgbmFtZVwiLFxuICAgICAgICAgICAgZXhwb3J0TmFtZTogY2x1c3RlcklkK1wiS2FycGVudGVySW5zdGFuY2VQcm9maWxlTmFtZVwiLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBNYXAgTm9kZSBSb2xlIHRvIGF3cy1hdXRoXG4gICAgICAgIGNsdXN0ZXIuYXdzQXV0aC5hZGRSb2xlTWFwcGluZyhrYXJwZW50ZXJOb2RlUm9sZSwge1xuICAgICAgICAgICAgZ3JvdXBzOiBbJ3N5c3RlbTpib290c3RyYXBwZXInLCAnc3lzdGVtOm5vZGVzJ10sXG4gICAgICAgICAgICB1c2VybmFtZTogJ3N5c3RlbTpub2RlOnt7RUMyUHJpdmF0ZUROU05hbWV9fSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIFtrYXJwZW50ZXJOb2RlUm9sZSwga2FycGVudGVySW5zdGFuY2VQcm9maWxlXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgZnVuY3Rpb24gdG8gY2hlY2sgd2hldGhlcjpcbiAgICAgKiAxLiBTdXBwb3J0ZWQgS2FycGVudGVyIHZlcnNpb25zIGFyZSBpbXBsZW1lbnRlZCwgYW5kXG4gICAgICogMi4gU3VwcG9ydGVkIEt1YmVybmV0ZXMgdmVyc2lvbnMgYXJlIGRlcGxveWVkIG9uIHRoZSBjbHVzdGVyIHRvIHVzZSBLYXJwZW50ZXJcbiAgICAgKiBJdCB3aWxsIHJlamVjdCB0aGUgYWRkb24gaWYgdGhlIGNsdXN0ZXIgdXNlcyBkZXByZWNhdGVkIEt1YmVybmV0ZXMgdmVyc2lvbiwgYW5kXG4gICAgICogV2FybiB1c2VycyBhYm91dCBpc3N1ZXMgaWYgaW5jb21wYXRpYmxlIEthcnBlbnRlciB2ZXJzaW9uIGlzIHVzZWQgZm9yIGEgcGFydGljdWxhciBjbHVzdGVyXG4gICAgICogZ2l2ZW4gaXRzIEt1YmVybmV0ZXMgdmVyc2lvblxuICAgICAqIEBwYXJhbSBrYXJwZW50ZXJWZXJzaW9uIEthcnBlbnRlciB2ZXJzaW9uIHRvIGJlIGRlcGxveWVkXG4gICAgICogQHBhcmFtIGt1YmVWZXJzaW9uIENsdXN0ZXIncyBLdWJlcm5ldGVzIHZlcnNpb25cbiAgICAgKi9cbiAgICBwcml2YXRlIGlzQ29tcGF0aWJsZShrYXJwZW50ZXJWZXJzaW9uOiBzdHJpbmcsIGt1YmVWZXJzaW9uOiBLdWJlcm5ldGVzVmVyc2lvbik6IHZvaWQge1xuICAgICAgICBhc3NlcnQodmVyc2lvbk1hcC5oYXMoa3ViZVZlcnNpb24pLCAnUGxlYXNlIHVwZ3JhZGUgeW91ciBFS1MgS3ViZXJuZXRlcyB2ZXJzaW9uIHRvIHN0YXJ0IHVzaW5nIEthcnBlbnRlci4nKTtcbiAgICAgICAgYXNzZXJ0KHNlbXZlci5ndGUoa2FycGVudGVyVmVyc2lvbiwgJzAuMjEuMCcpLCAnUGxlYXNlIHVzZSBLYXJwZW50ZXIgdmVyc2lvbiAwLjIxLjAgb3IgYWJvdmUuJyk7XG4gICAgICAgIGNvbnN0IGNvbXBhdGlibGVWZXJzaW9uID0gdmVyc2lvbk1hcC5nZXQoa3ViZVZlcnNpb24pIGFzIHN0cmluZztcbiAgICAgICAgaWYgKHNlbXZlci5ndChjb21wYXRpYmxlVmVyc2lvbiwga2FycGVudGVyVmVyc2lvbikpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgUGxlYXNlIHVzZSBtaW5pbXVtIEthcnBlbnRlciB2ZXJzaW9uIGZvciB0aGlzIEt1YmVybmV0ZXMgVmVyc2lvbjogJHtjb21wYXRpYmxlVmVyc2lvbn0sIG90aGVyd2lzZSB5b3Ugd2lsbCBydW4gaW50byBjb21wYXRpYmlsaXR5IGlzc3Vlcy5gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==