"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarpenterAddOn = void 0;
const iam = require("aws-cdk-lib/aws-iam");
const ts_deepmerge_1 = require("ts-deepmerge");
const utils = require("../../utils");
const helm_addon_1 = require("../helm-addon");
const iam_1 = require("./iam");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const md5 = require("ts-md5");
const semver = require("semver");
const assert = require("assert");
const sqs = require("aws-cdk-lib/aws-sqs");
const aws_events_1 = require("aws-cdk-lib/aws-events");
const aws_events_targets_1 = require("aws-cdk-lib/aws-events-targets");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
class versionMap {
    static has(version) {
        return this.versionMap.has(version.version);
    }
    static get(version) {
        return this.versionMap.get(version.version);
    }
}
versionMap.versionMap = new Map([
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
        const sa = utils.createServiceAccount(cluster, RELEASE, this.options.namespace, karpenterPolicyDocument);
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
        const saValues = {
            serviceAccount: {
                create: false,
                name: RELEASE,
                annotations: {
                    "eks.amazonaws.com/role-arn": sa.role.roleArn,
                }
            }
        };
        values = (0, ts_deepmerge_1.merge)(values, saValues);
        const karpenterChart = this.addHelmChart(clusterInfo, values, false, true);
        karpenterChart.node.addDependency(ns);
        if (clusterInfo.nodeGroups) {
            clusterInfo.nodeGroups.forEach(n => karpenterChart.node.addDependency(n));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2thcnBlbnRlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwyQ0FBMkM7QUFFM0MsK0NBQXFDO0FBRXJDLHFDQUFxQztBQUNyQyw4Q0FBOEU7QUFDOUUsK0JBQWlGO0FBQ2pGLDZDQUF5RDtBQUN6RCw4QkFBOEI7QUFDOUIsaUNBQWlDO0FBQ2pDLGlDQUFpQztBQUNqQywyQ0FBMkM7QUFDM0MsdURBQThDO0FBQzlDLHVFQUEwRDtBQUMxRCxpREFBaUU7QUFFakUsTUFBTSxVQUFVO0lBVUwsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUEwQjtRQUMxQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBQ00sTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUEwQjtRQUMxQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QyxDQUFDOztBQWR1QixxQkFBVSxHQUF3QixJQUFJLEdBQUcsQ0FBQztJQUM5RCxDQUFDLDJCQUFpQixDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO0lBQzNDLENBQUMsMkJBQWlCLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7SUFDM0MsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztJQUMzQyxDQUFDLDJCQUFpQixDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO0lBQzNDLENBQUMsMkJBQWlCLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7SUFDM0MsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztJQUMzQyxDQUFDLDJCQUFp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QUNyRCxVQUFVLEVBQUUsU0FBUyxHQUFDLDhCQUE4QjtTQUN2RCxDQUFDLENBQUM7UUFFSCw0QkFBNEI7UUFDNUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUU7WUFDOUMsTUFBTSxFQUFFLENBQUMscUJBQXFCLEVBQUUsY0FBYyxDQUFDO1lBQy9DLFFBQVEsRUFBRSxtQ0FBbUM7U0FDaEQsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLGlCQUFpQixFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNLLFlBQVksQ0FBQyxnQkFBd0IsRUFBRSxXQUE4QjtRQUN6RSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxzRUFBc0UsQ0FBQyxDQUFDO1FBQzVHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxFQUFFLCtDQUErQyxDQUFDLENBQUM7UUFDaEcsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBVyxDQUFDO1FBQ2hFLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7WUFDakQsT0FBTyxDQUFDLElBQUksQ0FBQyxxRUFBcUUsaUJBQWlCLHFEQUFxRCxDQUFDLENBQUM7UUFDOUosQ0FBQztJQUNMLENBQUM7Q0FDSixDQUFBO0FBNWRZLHdDQUFjO0FBVXZCO0lBREMsS0FBSyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQzs0Q0FrVDdDO3lCQTNUUSxjQUFjO0lBRDFCLEtBQUssQ0FBQyxXQUFXO0dBQ0wsY0FBYyxDQTRkMUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tICd0cy1kZWVwbWVyZ2UnO1xuaW1wb3J0IHsgQ2x1c3RlckluZm8sIFZhbHVlcywgQmxvY2tEZXZpY2VNYXBwaW5nLCBUYWludCwgU2VjLCBNaW4sIEhvdXIgfSBmcm9tICcuLi8uLi9zcGknO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi4vLi4vdXRpbHMnO1xuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Qcm9wcywgSGVsbUFkZE9uVXNlclByb3BzIH0gZnJvbSAnLi4vaGVsbS1hZGRvbic7XG5pbXBvcnQgeyBLYXJwZW50ZXJDb250cm9sbGVyUG9saWN5LCBLYXJwZW50ZXJDb250cm9sbGVyUG9saWN5QmV0YSB9IGZyb20gJy4vaWFtJztcbmltcG9ydCB7IENmbk91dHB1dCwgRHVyYXRpb24sIE5hbWVzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgbWQ1IGZyb20gJ3RzLW1kNSc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCAqIGFzIGFzc2VydCBmcm9tIFwiYXNzZXJ0XCI7XG5pbXBvcnQgKiBhcyBzcXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XG5pbXBvcnQgeyBSdWxlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWV2ZW50cyc7XG5pbXBvcnQgeyBTcXNRdWV1ZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1ldmVudHMtdGFyZ2V0cyc7XG5pbXBvcnQgeyBDbHVzdGVyLCBLdWJlcm5ldGVzVmVyc2lvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xuXG5jbGFzcyB2ZXJzaW9uTWFwIHtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSB2ZXJzaW9uTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcChbXG4gICAgICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yOS52ZXJzaW9uLCAnMC4zNC4wJ10sXG4gICAgICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yOC52ZXJzaW9uLCAnMC4zMS4wJ10sXG4gICAgICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNy52ZXJzaW9uLCAnMC4yOC4wJ10sXG4gICAgICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNi52ZXJzaW9uLCAnMC4yOC4wJ10sXG4gICAgICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNS52ZXJzaW9uLCAnMC4yNS4wJ10sXG4gICAgICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNC52ZXJzaW9uLCAnMC4yMS4wJ10sXG4gICAgICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yMy52ZXJzaW9uLCAnMC4yMS4wJ10sXG4gICAgXSk7XG4gICAgcHVibGljIHN0YXRpYyBoYXModmVyc2lvbjogS3ViZXJuZXRlc1ZlcnNpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnZlcnNpb25NYXAuaGFzKHZlcnNpb24udmVyc2lvbik7XG4gICAgfVxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0KHZlcnNpb246IEt1YmVybmV0ZXNWZXJzaW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy52ZXJzaW9uTWFwLmdldCh2ZXJzaW9uLnZlcnNpb24pO1xuICAgIH1cbiAgfVxuXG4vKipcbiAqIFV0aWxpdHkgdHlwZSBmb3IgS2FycGVudGVyIHJlcXVpcmVtZW50IHZhbHVlcyBmb3IgTm9kZVBvb2xzXG4gKi9cbmV4cG9ydCB0eXBlIE5vZGVQb29sUmVxdWlyZW1lbnRWYWx1ZXMgPSB7XG4gICAga2V5OiBzdHJpbmcsXG4gICAgb3BlcmF0b3I6IFwiSW5cIiB8IFwiTm90SW5cIiB8IFwiRXhpc3RzXCIgfCBcIkRvZXNOb3RFeGlzdFwiIHwgXCJHdFwiIHwgXCJMdFwiLFxuICAgIHZhbHVlczogc3RyaW5nW10sXG59W11cblxuLy8gVXRpbGl0eSBUeXBlIGZvciBLYXJwZW50ZXIgTm9kZUNsYXNzIERpc3J1cHRpb24gQnVkZ2V0XG5leHBvcnQgdHlwZSBEaXNydXB0aW9uQnVkZ2V0ID0ge1xuICAgIG5vZGVzOiBzdHJpbmdcbiAgICBzY2hlZHVsZT86IHN0cmluZ1xuICAgIGR1cmF0aW9uPzogc3RyaW5nXG59O1xuXG4vLyBTcGVjaWZpYyB0eXBlcyBmb3IgdGhlIEJldGEgQ1JEIFN1Ym5ldCBhbmQgU2VjdXJpdHkgR3JvdXAgc2VsZWN0b3IgdGVybXNcbmV4cG9ydCB0eXBlIEJldGFTdWJuZXRUZXJtID0geyBpZD86IHN0cmluZywgdGFncz86IFZhbHVlcyB9O1xuZXhwb3J0IHR5cGUgQmV0YVNlY3VyaXR5R3JvdXBUZXJtID0geyB0YWdzPzogVmFsdWVzLCBpZD86IHN0cmluZywgbmFtZT86IHN0cmluZyB9O1xuZXhwb3J0IHR5cGUgQW1pU2VsZWN0b3JUZXJtID0geyB0YWdzPzogVmFsdWVzLCBuYW1lPzogc3RyaW5nLCBvd25lcj86IHN0cmluZyB9IHwgeyBpZD86IHN0cmluZyB9O1xuXG4vKipcbiAqIFV0aWxpdHkgdHlwZSBmb3IgS2FycGVudGVyIEVDMk5vZGVDbGFzcyBTcGVjc1xuICovXG5leHBvcnQgdHlwZSBFYzJOb2RlQ2xhc3NTcGVjID0ge1xuICAgIC8qKlxuICAgICAqIFRhZ3MgbmVlZGVkIGZvciBzdWJuZXRzIC0gU3VibmV0IHRhZ3MgYW5kIHNlY3VyaXR5IGdyb3VwIHRhZ3MgYXJlIHJlcXVpcmVkIGZvciB0aGUgcHJvdmlzaW9uZXIgdG8gYmUgY3JlYXRlZFxuICAgICAqIFJlcXVpcmVkIGZvciBBbHBoYSBDUkRTXG4gICAgICovXG4gICAgc3VibmV0U2VsZWN0b3I/OiBWYWx1ZXMsXG5cbiAgICAvKipcbiAgICAgKiBUYWdzIG5lZWRlZCBmb3Igc2VjdXJpdHkgZ3JvdXBzIC0gU3VibmV0IHRhZ3MgYW5kIHNlY3VyaXR5IGdyb3VwIHRhZ3MgYXJlIHJlcXVpcmVkIGZvciB0aGUgcHJvdmlzaW9uZXIgdG8gYmUgY3JlYXRlZFxuICAgICAqIFJlcXVpcmVkIGZvciBBbHBoYSBDUkRTXG4gICAgICovXG4gICAgc2VjdXJpdHlHcm91cFNlbGVjdG9yPzogVmFsdWVzLFxuXG4gICAgLyoqXG4gICAgICogU3VibmV0IHNlbGVjdG9yIHRlcm1zIChzdWJuZXQgaWQgb3IgdGFncykgdXNlZCBmb3IgQmV0YSBDUkRzXG4gICAgICogUmVxdWlyZWQgZm9yIEJldGEgQ1JEU1xuICAgICAqL1xuICAgIHN1Ym5ldFNlbGVjdG9yVGVybXM/OiBCZXRhU3VibmV0VGVybVtdLFxuXG4gICAgLyoqXG4gICAgICogU2VjdXJpdHkgR3JvdXAgc2VsZWN0b3IgdGVybXMgKHNlY3VyaXR5IGdyb3VwIGlkLCB0YWdzIG9yIG5hbWVzKSB1c2VkIGZvciBCZXRhIENSRHNcbiAgICAgKiBSZXF1aXJlZCBmb3IgQmV0YSBDUkRTXG4gICAgICovXG4gICAgc2VjdXJpdHlHcm91cFNlbGVjdG9yVGVybXM/OiBCZXRhU2VjdXJpdHlHcm91cFRlcm1bXSxcblxuICAgIC8qKlxuICAgICAqIEFNSSBTZWxlY3RvclxuICAgICAqL1xuICAgIGFtaVNlbGVjdG9yPzogVmFsdWVzLFxuXG4gICAgLyoqXG4gICAgICogQU1JIFNlbGVjdG9yIHRlcm1zIHVzZWQgZm9yIEJldGEgQ1JEc1xuICAgICAqL1xuICAgIGFtaVNlbGVjdG9yVGVybXM/OiBBbWlTZWxlY3RvclRlcm1bXTtcblxuICAgIC8qKlxuICAgICAqIEFNSSBGYW1pbHk6IHJlcXVpcmVkIGZvciB2MC4zMi4wIGFuZCBhYm92ZSwgb3B0aW9uYWwgb3RoZXJ3aXNlXG4gICAgICogS2FycGVudGVyIHdpbGwgYXV0b21hdGljYWxseSBxdWVyeSB0aGUgYXBwcm9wcmlhdGUgRUtTIG9wdGltaXplZCBBTUkgdmlhIEFXUyBTeXN0ZW1zIE1hbmFnZXJcbiAgICAgKi9cbiAgICBhbWlGYW1pbHk/OiBcIkFMMlwiIHwgXCJCb3R0bGVyb2NrZXRcIiB8IFwiVWJ1bnR1XCIgfCBcIldpbmRvd3MyMDE5XCIgfCBcIldpbmRvd3MyMDIyXCJcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsIGZpZWxkIHRvIGNvbnRyb2wgaG93IGluc3RhbmNlIHN0b3JlIHZvbHVtZXMgYXJlIGhhbmRsZWQuIFNldCBpdCB0byBSQUlEMFxuICAgICAqIGZvciBmYXN0ZXIgZXBoZW1lcmFsIHN0b3JhZ2VcbiAgICAgKi9cbiAgICBpbnN0YW5jZVN0b3JlUG9saWN5PzogXCJSQUlEMFwiXG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbCB1c2VyIHByb3ZpZGVkIFVzZXJEYXRhIGFwcGxpZWQgdG8gdGhlIHdvcmtlciBub2RlcyxcbiAgICAgKiBpLmUuIGN1c3RvbSBzY3JpcHRzIG9yIHBhc3MtdGhyb3VnaCBjdXN0b20gY29uZmlndXJhdGlvbnMgYXQgc3RhcnQtdXBcbiAgICAgKi9cbiAgICB1c2VyRGF0YT86IHN0cmluZyxcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsIGZpZWxkIHRvIHVzZSB0aGUgbmFtZSBvZiB0aGUgSUFNIEluc3RhbmNlIHByb2ZpbGUsXG4gICAgICogaW5zdGVhZCBvZiB0aGUgcm9sZSBnZW5lcmF0ZWQgYnkgS2FycGVudGVyLlxuICAgICAqIFVzZXIgbXVzdCBwcmUtcHJvdmlzaW9uIGFuIElBTSBpbnN0YW5jZSBwcm9maWxlIGFuZCBhc3NpZ24gYSByb2xlIHRvIGl0LlxuICAgICAqL1xuICAgIGluc3RhbmNlUHJvZmlsZT86IHN0cmluZyxcblxuICAgIC8qKlxuICAgICAqIFRhZ3MgYWRkcyB0YWdzIHRvIGFsbCByZXNvdXJjZXMgY3JlYXRlZCwgaW5jbHVkaW5nIEVDMiBJbnN0YW5jZXMsIEVCUyB2b2x1bWVzIGFuZCBMYXVuY2ggVGVtcGxhdGVzLlxuICAgICAqIEthcnBlbnRlciBhbGxvd3Mgb3ZlcnJpZGVzIG9mIHRoZSBkZWZhdWx0IFwiTmFtZVwiIHRhZyBidXQgZG9lcyBub3QgYWxsb3cgb3ZlcnJpZGVzIHRvIHJlc3RyaWN0ZWQgZG9tYWluc1xuICAgICAqIChzdWNoIGFzIFwia2FycGVudGVyLnNoXCIsIFwia2FycGVudGVyLms4cy5hd3NcIiwgYW5kIFwia3ViZXJuZXRlcy5pby9jbHVzdGVyXCIpLlxuICAgICAqIFRoaXMgZW5zdXJlcyB0aGF0IEthcnBlbnRlciBpcyBhYmxlIHRvIGNvcnJlY3RseSBhdXRvLWRpc2NvdmVyIG1hY2hpbmVzIHRoYXQgaXQgb3ducy5cbiAgICAgKi9cbiAgICB0YWdzPzogVmFsdWVzO1xuXG4gICAgLyoqXG4gICAgICogQ29udHJvbCB0aGUgZXhwb3N1cmUgb2YgSW5zdGFuY2UgTWV0YWRhdGEgc2VydmljZSB1c2luZyB0aGlzIGNvbmZpZ3VyYXRpb25cbiAgICAgKi9cbiAgICBtZXRhZGF0YU9wdGlvbnM/OiBWYWx1ZXM7XG5cbiAgICAvKipcbiAgICAgKiBCbG9ja0RldmljZU1hcHBpbmdzIGFsbG93cyB5b3UgdG8gc3BlY2lmeSB0aGUgYmxvY2sgZGV2aWNlIG1hcHBpbmdzIGZvciB0aGUgaW5zdGFuY2VzLlxuICAgICAqIFRoaXMgaXMgYSBsaXN0IG9mIG1hcHBpbmdzLCB3aGVyZSBlYWNoIG1hcHBpbmcgY29uc2lzdHMgb2YgYSBkZXZpY2UgbmFtZSBhbmQgYW4gRUJTIGNvbmZpZ3VyYXRpb24uXG4gICAgICogSWYgeW91IGxlYXZlIHRoaXMgYmxhbmssIGl0IHdpbGwgdXNlIHRoZSBLYXJwZW50ZXIgZGVmYXVsdC5cbiAgICAgKi9cbiAgICBibG9ja0RldmljZU1hcHBpbmdzPzogQmxvY2tEZXZpY2VNYXBwaW5nW107XG5cbiAgICAvKipcbiAgICAgKiBEZXRhaWxlZCBtb25pdG9yaW5nIG9uIEVDMlxuICAgICAqL1xuICAgIGRldGFpbGVkTW9uaXRvcmluZz86IGJvb2xlYW5cbn1cblxuLyoqXG4gKiBVdGlsaXR5IHR5cGUgZm9yIEthcnBlbnRlciBOb2RlUG9vbCBTcGVjc1xuICovXG5leHBvcnQgdHlwZSBOb2RlUG9vbFNwZWMgPSB7XG4gICAgIC8qKlxuICAgICAgICAgKiBMYWJlbHMgYXBwbGllZCB0byBhbGwgbm9kZXNcbiAgICAgICAgICovXG4gICAgIGxhYmVscz86IFZhbHVlcyxcblxuICAgICAvKipcbiAgICAgICogQW5ub3RhdGlvbnMgYXBwbGllZCB0byBhbGwgbm9kZXNcbiAgICAgICovXG4gICAgIGFubm90YXRpb25zPzogVmFsdWVzLFxuXG4gICAgIC8qKlxuICAgICAgKiBUYWludHMgZm9yIHRoZSBwcm92aXNpb25lZCBub2RlcyAtIFRhaW50cyBtYXkgcHJldmVudCBwb2RzIGZyb20gc2NoZWR1bGluZyBpZiB0aGV5IGFyZSBub3QgdG9sZXJhdGVkIGJ5IHRoZSBwb2QuXG4gICAgICAqL1xuICAgICB0YWludHM/OiBUYWludFtdLFxuXG4gICAgIC8qKlxuICAgICAgKiBQcm92aXNpb25lZCBub2RlcyB3aWxsIGhhdmUgdGhlc2UgdGFpbnRzLCBidXQgcG9kcyBkbyBub3QgbmVlZCB0byB0b2xlcmF0ZSB0aGVzZSB0YWludHMgdG8gYmUgcHJvdmlzaW9uZWQgYnkgdGhpc1xuICAgICAgKiBwcm92aXNpb25lci4gVGhlc2UgdGFpbnRzIGFyZSBleHBlY3RlZCB0byBiZSB0ZW1wb3JhcnkgYW5kIHNvbWUgb3RoZXIgZW50aXR5IChlLmcuIGEgRGFlbW9uU2V0KSBpcyByZXNwb25zaWJsZSBmb3JcbiAgICAgICogcmVtb3ZpbmcgdGhlIHRhaW50IGFmdGVyIGl0IGhhcyBmaW5pc2hlZCBpbml0aWFsaXppbmcgdGhlIG5vZGUuXG4gICAgICAqL1xuICAgICBzdGFydHVwVGFpbnRzPzogVGFpbnRbXSxcblxuICAgICAvKipcbiAgICAgICogUmVxdWlyZW1lbnQgcHJvcGVydGllcyBmb3IgTm9kZSBQb29sIChPcHRpb25hbCkgLSBJZiBub3QgcHJvdmlkZWQsIHRoZSBhZGQtb24gd2lsbFxuICAgICAgKiBkZXBsb3kgb25lIHdpdGggbm8gdmFsdWUsIHByb3ZpZGluZyBubyByZXN0cmljdGlvbnMgd2hlbiBLYXJwZW50ZXIgb3B0aW1pemVzLlxuICAgICAgKi9cbiAgICAgcmVxdWlyZW1lbnRzPzogTm9kZVBvb2xSZXF1aXJlbWVudFZhbHVlcyxcblxuICAgICAvKipcbiAgICAgICogRW5hYmxlcyBjb25zb2xpZGF0aW9uIHdoaWNoIGF0dGVtcHRzIHRvIHJlZHVjZSBjbHVzdGVyIGNvc3QgYnkgYm90aCByZW1vdmluZyB1bi1uZWVkZWQgbm9kZXMgYW5kIGRvd24tc2l6aW5nIHRob3NlIHRoYXQgY2FuJ3QgYmUgcmVtb3ZlZC5cbiAgICAgICogTXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggdGhlIHR0bFNlY29uZHNBZnRlckVtcHR5IHBhcmFtZXRlci5cbiAgICAgICpcbiAgICAgICogUmVwbGFjZWQgd2l0aCBkaXNydXB0aW9uLmNvbnNvbGlkYXRpb25Qb2xpY3kgZm9yIHZlcnNpb25zIHYwLjMyLnggYW5kIGxhdGVyXG4gICAgICAqL1xuICAgICBjb25zb2xpZGF0aW9uPzoge1xuICAgICAgICAgZW5hYmxlZDogYm9vbGVhbixcbiAgICAgfVxuXG4gICAgIC8qKlxuICAgICAgKiBJZiBvbWl0dGVkLCB0aGUgZmVhdHVyZSBpcyBkaXNhYmxlZCBhbmQgbm9kZXMgd2lsbCBuZXZlciBleHBpcmUuXG4gICAgICAqIElmIHNldCB0byBsZXNzIHRpbWUgdGhhbiBpdCByZXF1aXJlcyBmb3IgYSBub2RlIHRvIGJlY29tZSByZWFkeSxcbiAgICAgICogdGhlIG5vZGUgbWF5IGV4cGlyZSBiZWZvcmUgYW55IHBvZHMgc3VjY2Vzc2Z1bGx5IHN0YXJ0LlxuICAgICAgKlxuICAgICAgKiBSZXBsYWNlZCB3aXRoIGRpc3J1cHRpb24uZXhwaXJlQWZ0ZXIgZm9yIHZlcnNpb25zIHYwLjMyLnggYW5kIGxhdGVyXG4gICAgICAqL1xuICAgICB0dGxTZWNvbmRzVW50aWxFeHBpcmVkPzogbnVtYmVyLFxuXG4gICAgIC8qKlxuICAgICAgKiBIb3cgbWFueSBzZWNvbmRzIEthcnBlbnRlciB3aWxsIHdhaWx0IHVudGlsIGl0IGRlbGV0ZXMgZW1wdHkvdW5uZWNlc3NhcnkgaW5zdGFuY2VzIChpbiBzZWNvbmRzKS5cbiAgICAgICogTXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggdGhlIGNvbnNvbGlkYXRpb24gcGFyYW1ldGVyLlxuICAgICAgKlxuICAgICAgKiBSZXBsYWNlZCB3aXRoIGRpc3J1cHRpb24uY29uc29saWRhdGlvblBvbGljeSBhbmQgZGlzcnVwdGlvbi5jb25zb2xpZGF0ZUFmdGVyIGZvciB2ZXJzaW9ucyB2MC4zMi54IGFuZCBsYXRlclxuICAgICAgKi9cbiAgICAgdHRsU2Vjb25kc0FmdGVyRW1wdHk/OiBudW1iZXIsXG5cbiAgICAgLyoqXG4gICAgICAqIERpc3J1cHRpb24gc2VjdGlvbiB3aGljaCBkZXNjcmliZXMgdGhlIHdheXMgaW4gd2hpY2ggS2FycGVudGVyIGNhbiBkaXNydXB0IGFuZCByZXBsYWNlIE5vZGVzXG4gICAgICAqIENvbmZpZ3VyYXRpb24gaW4gdGhpcyBzZWN0aW9uIGNvbnN0cmFpbnMgaG93IGFnZ3Jlc3NpdmUgS2FycGVudGVyIGNhbiBiZSB3aXRoIHBlcmZvcm1pbmcgb3BlcmF0aW9uc1xuICAgICAgKiBsaWtlIHJvbGxpbmcgTm9kZXMgZHVlIHRvIHRoZW0gaGl0dGluZyB0aGVpciBtYXhpbXVtIGxpZmV0aW1lIChleHBpcnkpIG9yIHNjYWxpbmcgZG93biBub2RlcyB0byByZWR1Y2UgY2x1c3RlciBjb3N0XG4gICAgICAqIE9ubHkgYXBwbGljYWJsZSBmb3IgdmVyc2lvbnMgdjAuMzIgb3IgbGF0ZXJcbiAgICAgICpcbiAgICAgICogQHBhcmFtIGNvbnNvbGlkYXRpb25Qb2xpY3kgY29uc29saWRhdGlvbiBwb2xpY3kgLSB3aWxsIGRlZmF1bHQgdG8gV2hlblVuZGVydXRpbGl6ZWQgaWYgbm90IHByb3ZpZGVkXG4gICAgICAqIEBwYXJhbSBjb25zb2xpZGF0ZUFmdGVyIEhvdyBsb25nIEthcnBlbnRlciB3YWl0cyB0byBjb25zb2xpZGF0ZSBub2RlcyAtIGNhbm5vdCBiZSBzZXQgd2hlbiB0aGUgcG9saWN5IGlzIFdoZW5VbmRlcnV0aWxpemVkXG4gICAgICAqIEBwYXJhbSBleHBpcmVBZnRlciBIb3cgbG9uZyBLYXJwZW50ZXIgd2FpdHMgdG8gZXhwaXJlIG5vZGVzXG4gICAgICAqL1xuICAgICBkaXNydXB0aW9uPzoge1xuICAgICAgICAgY29uc29saWRhdGlvblBvbGljeT86IFwiV2hlblVuZGVydXRpbGl6ZWRcIiB8IFwiV2hlbkVtcHR5XCIsXG4gICAgICAgICBjb25zb2xpZGF0ZUFmdGVyPzogU2VjIHwgTWluIHwgSG91cixcbiAgICAgICAgIGV4cGlyZUFmdGVyPzogIFwiTmV2ZXJcIiB8IFNlYyB8IE1pbiB8IEhvdXJcbiAgICAgICAgIGJ1ZGdldHM/OiBEaXNydXB0aW9uQnVkZ2V0W11cbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogTGltaXRzIGRlZmluZSBhIHNldCBvZiBib3VuZHMgZm9yIHByb3Zpc2lvbmluZyBjYXBhY2l0eS5cbiAgICAgICogUmVzb3VyY2UgbGltaXRzIGNvbnN0cmFpbiB0aGUgdG90YWwgc2l6ZSBvZiB0aGUgY2x1c3Rlci5cbiAgICAgICogTGltaXRzIHByZXZlbnQgS2FycGVudGVyIGZyb20gY3JlYXRpbmcgbmV3IGluc3RhbmNlcyBvbmNlIHRoZSBsaW1pdCBpcyBleGNlZWRlZC5cbiAgICAgICovXG4gICAgIGxpbWl0cz86IHtcbiAgICAgICAgIGNwdT86IG51bWJlcjtcbiAgICAgICAgIG1lbW9yeT86IHN0cmluZztcbiAgICAgICAgIC8qKlxuICAgICAgICAgICogRXh0ZW5kZWQgcmVzb3VyY2VzIGFyZSBmdWxseS1xdWFsaWZpZWQgcmVzb3VyY2UgbmFtZXMgb3V0c2lkZSB0aGUga3ViZXJuZXRlcy5pbyBkb21haW4uXG4gICAgICAgICAgKiBUaGV5IGFsbG93IGNsdXN0ZXIgb3BlcmF0b3JzIHRvIGFkdmVydGlzZSBhbmQgdXNlcnMgdG8gY29uc3VtZSB0aGUgbm9uLUt1YmVybmV0ZXMtYnVpbHQtaW5cbiAgICAgICAgICAqIHJlc291cmNlcyBzdWNoIGFzIGhhcmR3YXJlIGRldmljZXMgR1BVcywgUkRNQXMsIFNSLUlPVnMuLi5cbiAgICAgICAgICAqIGUuZyBudmlkaWEuY29tL2dwdSwgYW1kLmNvbS9ncHUsIGV0Yy4uLlxuICAgICAgICAgICovXG4gICAgICAgICBbazogc3RyaW5nXTogdW5rbm93bjtcbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogUHJpb3JpdHkgZ2l2ZW4gdG8gdGhlIHByb3Zpc2lvbmVyIHdoZW4gdGhlIHNjaGVkdWxlciBjb25zaWRlcnMgd2hpY2ggcHJvdmlzaW9uZXJcbiAgICAgICogdG8gc2VsZWN0LiBIaWdoZXIgd2VpZ2h0cyBpbmRpY2F0ZSBoaWdoZXIgcHJpb3JpdHkgd2hlbiBjb21wYXJpbmcgcHJvdmlzaW9uZXJzLlxuICAgICAgKi9cbiAgICAgd2VpZ2h0PzogbnVtYmVyLFxufVxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIGFkZC1vblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEthcnBlbnRlckFkZE9uUHJvcHMgZXh0ZW5kcyBIZWxtQWRkT25Vc2VyUHJvcHMge1xuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgdGhlIHRvcCBsZXZlbCBub2RlcG9vbCBzcGVjaWZpY2F0aW9uLiBOb2RlcG9vbHMgbGF1bmNoIG5vZGVzIGluIHJlc3BvbnNlIHRvIHBvZHMgdGhhdCBhcmUgdW5zY2hlZHVsYWJsZS5cbiAgICAgKiBBIHNpbmdsZSBub2RlcG9vbCBpcyBjYXBhYmxlIG9mIG1hbmFnaW5nIGEgZGl2ZXJzZSBzZXQgb2Ygbm9kZXMuXG4gICAgICogTm9kZSBwcm9wZXJ0aWVzIGFyZSBkZXRlcm1pbmVkIGZyb20gYSBjb21iaW5hdGlvbiBvZiBub2RlcG9vbCBhbmQgcG9kIHNjaGVkdWxpbmcgY29uc3RyYWludHMuXG4gICAgICovXG4gICAgbm9kZVBvb2xTcGVjPzogTm9kZVBvb2xTcGVjLFxuXG4gICAgLyoqXG4gICAgICogVGhpcyBpcyB0aGUgdG9wIGxldmVsIHNwZWMgZm9yIHRoZSBBV1MgS2FycGVudGVyIFByb3ZpZGVyXG4gICAgICogSXQgY29udGFpbnMgY29uZmlndXJhdGlvbiBuZWNlc3NhcnkgdG8gbGF1bmNoIGluc3RhbmNlcyBpbiBBV1MuXG4gICAgICovXG4gICAgZWMyTm9kZUNsYXNzU3BlYz86IEVjMk5vZGVDbGFzc1NwZWMsXG5cbiAgICAvKipcbiAgICAgKiBGbGFnIGZvciBlbmFibGluZyBLYXJwZW50ZXIncyBuYXRpdmUgaW50ZXJydXB0aW9uIGhhbmRsaW5nXG4gICAgICovXG4gICAgaW50ZXJydXB0aW9uSGFuZGxpbmc/OiBib29sZWFuLFxufVxuXG5jb25zdCBLQVJQRU5URVIgPSAna2FycGVudGVyJztcbmNvbnN0IFJFTEVBU0UgPSAnYmx1ZXByaW50cy1hZGRvbi1rYXJwZW50ZXInO1xuXG4vKipcbiAqIERlZmF1bHRzIG9wdGlvbnMgZm9yIHRoZSBhZGQtb25cbiAqL1xuY29uc3QgZGVmYXVsdFByb3BzOiBIZWxtQWRkT25Qcm9wcyA9IHtcbiAgICBuYW1lOiBLQVJQRU5URVIsXG4gICAgbmFtZXNwYWNlOiBLQVJQRU5URVIsXG4gICAgdmVyc2lvbjogJ3YwLjM0LjEnLFxuICAgIGNoYXJ0OiBLQVJQRU5URVIsXG4gICAgcmVsZWFzZTogS0FSUEVOVEVSLFxuICAgIHJlcG9zaXRvcnk6ICdvY2k6Ly9wdWJsaWMuZWNyLmF3cy9rYXJwZW50ZXIva2FycGVudGVyJyxcbn07XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgdGhlIEthcnBlbnRlciBhZGQtb25cbiAqL1xuQHV0aWxzLnN1cHBvcnRzQUxMXG5leHBvcnQgY2xhc3MgS2FycGVudGVyQWRkT24gZXh0ZW5kcyBIZWxtQWRkT24ge1xuXG4gICAgcmVhZG9ubHkgb3B0aW9uczogS2FycGVudGVyQWRkT25Qcm9wcztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogS2FycGVudGVyQWRkT25Qcm9wcykge1xuICAgICAgICBzdXBlcih7Li4uZGVmYXVsdFByb3BzLCAuLi5wcm9wc30pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzO1xuICAgIH1cblxuICAgIEB1dGlscy5jb25mbGljdHNXaXRoKCdDbHVzdGVyQXV0b1NjYWxlckFkZE9uJylcbiAgICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogUHJvbWlzZTxDb25zdHJ1Y3Q+IHtcbiAgICAgICAgYXNzZXJ0KGNsdXN0ZXJJbmZvLmNsdXN0ZXIgaW5zdGFuY2VvZiBDbHVzdGVyLCBcIkthcnBlbnRlckFkZE9uIGNhbm5vdCBiZSB1c2VkIHdpdGggaW1wb3J0ZWQgY2x1c3RlcnMgYXMgaXQgcmVxdWlyZXMgY2hhbmdlcyB0byB0aGUgY2x1c3RlciBhdXRoZW50aWNhdGlvbi5cIik7XG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgOiBDbHVzdGVyID0gY2x1c3RlckluZm8uY2x1c3RlcjtcbiAgICAgICAgY29uc3QgZW5kcG9pbnQgPSBjbHVzdGVyLmNsdXN0ZXJFbmRwb2ludDtcbiAgICAgICAgY29uc3QgbmFtZSA9IGNsdXN0ZXIuY2x1c3Rlck5hbWU7XG4gICAgICAgIGNvbnN0IHBhcnRpdGlvbiA9IGNsdXN0ZXIuc3RhY2sucGFydGl0aW9uO1xuXG4gICAgICAgIGNvbnN0IHN0YWNrTmFtZSA9IGNsdXN0ZXIuc3RhY2suc3RhY2tOYW1lO1xuICAgICAgICBjb25zdCByZWdpb24gPSBjbHVzdGVyLnN0YWNrLnJlZ2lvbjtcblxuICAgICAgICBsZXQgdmFsdWVzID0gdGhpcy5vcHRpb25zLnZhbHVlcyA/PyB7fTtcbiAgICAgICAgY29uc3QgdmVyc2lvbiA9IHRoaXMub3B0aW9ucy52ZXJzaW9uITtcblxuICAgICAgICBjb25zdCBpbnRlcnJ1cHRpb24gPSB0aGlzLm9wdGlvbnMuaW50ZXJydXB0aW9uSGFuZGxpbmcgfHwgZmFsc2U7XG5cbiAgICAgICAgLy8gTm9kZVBvb2wgdmFyaWFibGVzXG4gICAgICAgIGNvbnN0IGxhYmVscyA9IHRoaXMub3B0aW9ucy5ub2RlUG9vbFNwZWM/LmxhYmVscyB8fCB7fTtcbiAgICAgICAgY29uc3QgYW5ub3RhdGlvbnMgPSB0aGlzLm9wdGlvbnMubm9kZVBvb2xTcGVjPy5hbm5vdGF0aW9ucyB8fCB7fTtcbiAgICAgICAgY29uc3QgdGFpbnRzID0gdGhpcy5vcHRpb25zLm5vZGVQb29sU3BlYz8udGFpbnRzIHx8IFtdO1xuICAgICAgICBjb25zdCBzdGFydHVwVGFpbnRzID0gdGhpcy5vcHRpb25zLm5vZGVQb29sU3BlYz8uc3RhcnR1cFRhaW50cyB8fCBbXTtcbiAgICAgICAgY29uc3QgcmVxdWlyZW1lbnRzID0gdGhpcy5vcHRpb25zLm5vZGVQb29sU3BlYz8ucmVxdWlyZW1lbnRzIHx8IFtdO1xuICAgICAgICBjb25zdCBjb25zb2wgPSB0aGlzLm9wdGlvbnMubm9kZVBvb2xTcGVjPy5jb25zb2xpZGF0aW9uIHx8IG51bGw7XG4gICAgICAgIGNvbnN0IHR0bFNlY29uZHNBZnRlckVtcHR5ID0gdGhpcy5vcHRpb25zLm5vZGVQb29sU3BlYz8udHRsU2Vjb25kc0FmdGVyRW1wdHkgfHwgbnVsbDtcbiAgICAgICAgY29uc3QgdHRsU2Vjb25kc1VudGlsRXhwaXJlZCA9IHRoaXMub3B0aW9ucy5ub2RlUG9vbFNwZWM/LnR0bFNlY29uZHNVbnRpbEV4cGlyZWQgfHwgbnVsbDtcbiAgICAgICAgY29uc3QgZGlzcnVwdGlvbiA9IHRoaXMub3B0aW9ucy5ub2RlUG9vbFNwZWM/LmRpc3J1cHRpb24gfHwgbnVsbDtcbiAgICAgICAgY29uc3QgbGltaXRzID0gdGhpcy5vcHRpb25zLm5vZGVQb29sU3BlYz8ubGltaXRzIHx8IG51bGw7XG4gICAgICAgIGNvbnN0IHdlaWdodCA9IHRoaXMub3B0aW9ucy5ub2RlUG9vbFNwZWM/LndlaWdodCB8fCBudWxsO1xuXG4gICAgICAgIC8vIE5vZGVDbGFzcyB2YXJpYWJsZXNcbiAgICAgICAgY29uc3Qgc3VibmV0U2VsZWN0b3IgPSB0aGlzLm9wdGlvbnMuZWMyTm9kZUNsYXNzU3BlYz8uc3VibmV0U2VsZWN0b3I7XG4gICAgICAgIGNvbnN0IHNnU2VsZWN0b3IgPSB0aGlzLm9wdGlvbnMuZWMyTm9kZUNsYXNzU3BlYz8uc2VjdXJpdHlHcm91cFNlbGVjdG9yO1xuICAgICAgICBjb25zdCBzdWJuZXRTZWxlY3RvclRlcm1zID0gdGhpcy5vcHRpb25zLmVjMk5vZGVDbGFzc1NwZWM/LnN1Ym5ldFNlbGVjdG9yVGVybXM7XG4gICAgICAgIGNvbnN0IHNnU2VsZWN0b3JUZXJtcyA9IHRoaXMub3B0aW9ucy5lYzJOb2RlQ2xhc3NTcGVjPy5zZWN1cml0eUdyb3VwU2VsZWN0b3JUZXJtcztcbiAgICAgICAgY29uc3QgYW1pRmFtaWx5ID0gdGhpcy5vcHRpb25zLmVjMk5vZGVDbGFzc1NwZWM/LmFtaUZhbWlseTtcbiAgICAgICAgY29uc3QgYW1pU2VsZWN0b3IgPSB0aGlzLm9wdGlvbnMuZWMyTm9kZUNsYXNzU3BlYz8uYW1pU2VsZWN0b3IgfHwge307XG4gICAgICAgIGNvbnN0IGFtaVNlbGVjdG9yVGVybXMgPSB0aGlzLm9wdGlvbnMuZWMyTm9kZUNsYXNzU3BlYz8uYW1pU2VsZWN0b3JUZXJtcztcbiAgICAgICAgY29uc3QgaW5zdGFuY2VTdG9yZVBvbGljeSA9IHRoaXMub3B0aW9ucy5lYzJOb2RlQ2xhc3NTcGVjPy5pbnN0YW5jZVN0b3JlUG9saWN5IHx8IG51bGw7XG4gICAgICAgIGNvbnN0IHVzZXJEYXRhID0gdGhpcy5vcHRpb25zLmVjMk5vZGVDbGFzc1NwZWM/LnVzZXJEYXRhIHx8IFwiXCI7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlUHJvZiA9IHRoaXMub3B0aW9ucy5lYzJOb2RlQ2xhc3NTcGVjPy5pbnN0YW5jZVByb2ZpbGU7XG4gICAgICAgIGNvbnN0IHRhZ3MgPSB0aGlzLm9wdGlvbnMuZWMyTm9kZUNsYXNzU3BlYz8udGFncyB8fCB7fTtcbiAgICAgICAgY29uc3QgbWV0YWRhdGFPcHRpb25zID0gdGhpcy5vcHRpb25zLmVjMk5vZGVDbGFzc1NwZWM/Lm1ldGFkYXRhT3B0aW9ucyB8fCB7XG4gICAgICAgICAgICBodHRwRW5kcG9pbnQ6IFwiZW5hYmxlZFwiLFxuICAgICAgICAgICAgaHR0cFByb3RvY29sSVB2NjogXCJkaXNhYmxlZFwiLFxuICAgICAgICAgICAgaHR0cFB1dFJlc3BvbnNlSG9wTGltaXQ6IDIsXG4gICAgICAgICAgICBodHRwVG9rZW5zOiBcInJlcXVpcmVkXCJcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgYmxvY2tEZXZpY2VNYXBwaW5ncyA9IHRoaXMub3B0aW9ucy5lYzJOb2RlQ2xhc3NTcGVjPy5ibG9ja0RldmljZU1hcHBpbmdzIHx8IFtdO1xuICAgICAgICBjb25zdCBkZXRhaWxlZE1vbml0b3JpbmcgPSB0aGlzLm9wdGlvbnMuZWMyTm9kZUNsYXNzU3BlYz8uZGV0YWlsZWRNb25pdG9yaW5nIHx8IGZhbHNlO1xuXG4gICAgICAgIC8vIENoZWNrIEt1YmVybmV0ZXMgYW5kIEthcnBlbnRlciB2ZXJzaW9uIGNvbXBhdGliaWxpdHkgZm9yIHdhcm5pbmdcbiAgICAgICAgdGhpcy5pc0NvbXBhdGlibGUodmVyc2lvbiwgY2x1c3RlckluZm8udmVyc2lvbik7XG5cbiAgICAgICAgLy8gVmVyc2lvbiBmZWF0dXJlIGNoZWNrcyBmb3IgZXJyb3JzXG4gICAgICAgIHRoaXMudmVyc2lvbkZlYXR1cmVDaGVja3NGb3JFcnJvcihjbHVzdGVySW5mbywgdmVyc2lvbiwgZGlzcnVwdGlvbiwgY29uc29sLCB0dGxTZWNvbmRzQWZ0ZXJFbXB0eSwgdHRsU2Vjb25kc1VudGlsRXhwaXJlZCxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5lYzJOb2RlQ2xhc3NTcGVjLCBhbWlGYW1pbHkpO1xuXG4gICAgICAgIC8vIFNldCB1cCB0aGUgbm9kZSByb2xlIGFuZCBpbnN0YW5jZSBwcm9maWxlXG4gICAgICAgIGNvbnN0IFtrYXJwZW50ZXJOb2RlUm9sZSwga2FycGVudGVySW5zdGFuY2VQcm9maWxlXSA9IHRoaXMuc2V0VXBOb2RlUm9sZShjbHVzdGVyLCBzdGFja05hbWUsIHJlZ2lvbik7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBjb250cm9sbGVyIHBvbGljeVxuICAgICAgICBsZXQga2FycGVudGVyUG9saWN5RG9jdW1lbnQ7XG4gICAgICAgIGlmIChzZW12ZXIuZ3RlKHZlcnNpb24sIFwidjAuMzIuMFwiKSl7XG4gICAgICAgICAgICBrYXJwZW50ZXJQb2xpY3lEb2N1bWVudCA9IGlhbS5Qb2xpY3lEb2N1bWVudC5mcm9tSnNvbihLYXJwZW50ZXJDb250cm9sbGVyUG9saWN5QmV0YShjbHVzdGVyLCBwYXJ0aXRpb24sIHJlZ2lvbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2FycGVudGVyUG9saWN5RG9jdW1lbnQgPSBpYW0uUG9saWN5RG9jdW1lbnQuZnJvbUpzb24oS2FycGVudGVyQ29udHJvbGxlclBvbGljeSk7XG4gICAgICAgIH1cbiAgICAgICAga2FycGVudGVyUG9saWN5RG9jdW1lbnQuYWRkU3RhdGVtZW50cyhuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgXCJpYW06UGFzc1JvbGVcIixcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICByZXNvdXJjZXM6IFtgJHtrYXJwZW50ZXJOb2RlUm9sZS5yb2xlQXJufWBdXG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyBTdXBwb3J0IGZvciBOYXRpdmUgc3BvdCBpbnRlcnJ1cHRpb25cbiAgICAgICAgaWYgKGludGVycnVwdGlvbil7XG4gICAgICAgICAgICAvLyBDcmVhdGUgSW50ZXJydXB0aW9uIFF1ZXVlXG4gICAgICAgICAgICBjb25zdCBxdWV1ZSA9IG5ldyBzcXMuUXVldWUoY2x1c3Rlci5zdGFjaywgJ2thcnBlbnRlci1xdWV1ZScsIHtcbiAgICAgICAgICAgICAgICBxdWV1ZU5hbWU6IHN0YWNrTmFtZSxcbiAgICAgICAgICAgICAgICByZXRlbnRpb25QZXJpb2Q6IER1cmF0aW9uLnNlY29uZHMoMzAwKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcXVldWUuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgc2lkOiAnRUMySW50ZXJydXB0aW9uUG9saWN5JyxcbiAgICAgICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgICAgcHJpbmNpcGFsczogW1xuICAgICAgICAgICAgICAgICAgICBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ3Nxcy5hbWF6b25hd3MuY29tJyksXG4gICAgICAgICAgICAgICAgICAgIG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnZXZlbnRzLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJzcXM6U2VuZE1lc3NhZ2VcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbYCR7cXVldWUucXVldWVBcm59YF1cbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgLy8gQWRkIEludGVycnVwdGlvbiBSdWxlc1xuICAgICAgICAgICAgbmV3IFJ1bGUoY2x1c3Rlci5zdGFjaywgJ3NjaGVkdWxlLWNoYW5nZS1ydWxlJywge1xuICAgICAgICAgICAgICAgIGV2ZW50UGF0dGVybjoge1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IFtcImF3cy5oZWFsdGhcIl0sXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbFR5cGU6IFsnQVdTIEhlYWx0aCBFdmVudCddXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pLmFkZFRhcmdldChuZXcgU3FzUXVldWUocXVldWUpKTtcblxuICAgICAgICAgICAgbmV3IFJ1bGUoY2x1c3Rlci5zdGFjaywgJ3Nwb3QtaW50ZXJydXB0aW9uLXJ1bGUnLCB7XG4gICAgICAgICAgICAgICAgZXZlbnRQYXR0ZXJuOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogW1wiYXdzLmVjMlwiXSxcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsVHlwZTogWydFQzIgU3BvdCBJbnN0YW5jZSBJbnRlcnJ1cHRpb24gV2FybmluZyddXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pLmFkZFRhcmdldChuZXcgU3FzUXVldWUocXVldWUpKTtcblxuICAgICAgICAgICAgbmV3IFJ1bGUoY2x1c3Rlci5zdGFjaywgJ3JlYmFsYW5jZS1ydWxlJywge1xuICAgICAgICAgICAgICAgIGV2ZW50UGF0dGVybjoge1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IFtcImF3cy5lYzJcIl0sXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbFR5cGU6IFsnRUMyIEluc3RhbmNlIFJlYmFsYW5jZSBSZWNvbW1lbmRhdGlvbiddXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pLmFkZFRhcmdldChuZXcgU3FzUXVldWUocXVldWUpKTtcblxuICAgICAgICAgICAgbmV3IFJ1bGUoY2x1c3Rlci5zdGFjaywgJ2luc3Qtc3RhdGUtY2hhbmdlLXJ1bGUnLCB7XG4gICAgICAgICAgICAgICAgZXZlbnRQYXR0ZXJuOiB7XG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogW1wiYXdzLmVjMlwiXSxcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsVHlwZTogWydDMiBJbnN0YW5jZSBTdGF0ZS1jaGFuZ2UgTm90aWZpY2F0aW9uJ11cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSkuYWRkVGFyZ2V0KG5ldyBTcXNRdWV1ZShxdWV1ZSkpO1xuXG4gICAgICAgICAgICAvLyBBZGQgcG9saWN5IHRvIHRoZSBub2RlIHJvbGUgdG8gYWxsb3cgYWNjZXNzIHRvIHRoZSBJbnRlcnJ1cHRpb24gUXVldWVcbiAgICAgICAgICAgIGNvbnN0IGludGVycnVwdGlvblF1ZXVlU3RhdGVtZW50ID0gbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIFwic3FzOkRlbGV0ZU1lc3NhZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgXCJzcXM6R2V0UXVldWVVcmxcIixcbiAgICAgICAgICAgICAgICAgICAgXCJzcXM6R2V0UXVldWVBdHRyaWJ1dGVzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwic3FzOlJlY2VpdmVNZXNzYWdlXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc291cmNlczogW2Ake3F1ZXVlLnF1ZXVlQXJufWBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGthcnBlbnRlclBvbGljeURvY3VtZW50LmFkZFN0YXRlbWVudHMoaW50ZXJydXB0aW9uUXVldWVTdGF0ZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIE5hbWVzcGFjZVxuICAgICAgICBjb25zdCBucyA9IHV0aWxzLmNyZWF0ZU5hbWVzcGFjZSh0aGlzLm9wdGlvbnMubmFtZXNwYWNlISwgY2x1c3RlciwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IHNhID0gdXRpbHMuY3JlYXRlU2VydmljZUFjY291bnQoY2x1c3RlciwgUkVMRUFTRSwgdGhpcy5vcHRpb25zLm5hbWVzcGFjZSEsIGthcnBlbnRlclBvbGljeURvY3VtZW50KTtcbiAgICAgICAgc2Eubm9kZS5hZGREZXBlbmRlbmN5KG5zKTtcblxuICAgICAgICAvLyBDcmVhdGUgZ2xvYmFsIGhlbG0gdmFsdWVzIGJhc2VkIG9uIHYxYmV0YTEgbWlncmF0aW9uIGFzIHNob3duIGJlbG93OlxuICAgICAgICAvLyBodHRwczovL2thcnBlbnRlci5zaC92MC4zMi91cGdyYWRpbmcvdjFiZXRhMS1taWdyYXRpb24vI2hlbG0tdmFsdWVzXG4gICAgICAgIGxldCBnbG9iYWxTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBuYW1lLFxuICAgICAgICAgICAgY2x1c3RlckVuZHBvaW50OiBlbmRwb2ludFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChzZW12ZXIubHQodmVyc2lvbiwgJzAuMzIuMCcpKXtcbiAgICAgICAgICAgIGdsb2JhbFNldHRpbmdzID0gbWVyZ2UoZ2xvYmFsU2V0dGluZ3MsIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0SW5zdGFuY2VQcm9maWxlOiBrYXJwZW50ZXJJbnN0YW5jZVByb2ZpbGUuaW5zdGFuY2VQcm9maWxlTmFtZSxcbiAgICAgICAgICAgICAgICBpbnRlcnJ1cHRpb25RdWV1ZU5hbWU6IGludGVycnVwdGlvbiA/IHN0YWNrTmFtZSA6IFwiXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2xvYmFsU2V0dGluZ3MgPSBtZXJnZShnbG9iYWxTZXR0aW5ncywge1xuICAgICAgICAgICAgICAgIGludGVycnVwdGlvblF1ZXVlOiBpbnRlcnJ1cHRpb24gPyBzdGFja05hbWUgOiBcIlwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZW12ZXIubHQodmVyc2lvbiwgJzAuMzIuMCcpKXtcbiAgICAgICAgICAgIHV0aWxzLnNldFBhdGgodmFsdWVzLCBcInNldHRpbmdzLmF3c1wiLCBtZXJnZShnbG9iYWxTZXR0aW5ncywgdmFsdWVzPy5zZXR0aW5ncz8uYXdzID8/IHt9KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1dGlscy5zZXRQYXRoKHZhbHVlcywgXCJzZXR0aW5nc1wiLCBtZXJnZShnbG9iYWxTZXR0aW5ncywgdmFsdWVzPy5zZXR0aW5ncyA/PyB7fSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2FWYWx1ZXMgPSB7XG4gICAgICAgICAgICBzZXJ2aWNlQWNjb3VudDoge1xuICAgICAgICAgICAgICAgIGNyZWF0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgbmFtZTogUkVMRUFTRSxcbiAgICAgICAgICAgICAgICBhbm5vdGF0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBcImVrcy5hbWF6b25hd3MuY29tL3JvbGUtYXJuXCI6IHNhLnJvbGUucm9sZUFybixcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFsdWVzID0gbWVyZ2UodmFsdWVzLCBzYVZhbHVlcyk7XG4gICAgICAgIGNvbnN0IGthcnBlbnRlckNoYXJ0ID0gdGhpcy5hZGRIZWxtQ2hhcnQoY2x1c3RlckluZm8sIHZhbHVlcywgZmFsc2UsIHRydWUpO1xuXG4gICAgICAgIGthcnBlbnRlckNoYXJ0Lm5vZGUuYWRkRGVwZW5kZW5jeShucyk7XG5cbiAgICAgICAgaWYoY2x1c3RlckluZm8ubm9kZUdyb3Vwcykge1xuICAgICAgICAgICAgY2x1c3RlckluZm8ubm9kZUdyb3Vwcy5mb3JFYWNoKG4gPT4ga2FycGVudGVyQ2hhcnQubm9kZS5hZGREZXBlbmRlbmN5KG4pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlcGxveSBQcm92aXNpb25lciAoQWxwaGEpIG9yIE5vZGVQb29sIChCZXRhKSBDUkQgYmFzZWQgb24gdGhlIEthcnBlbnRlciBWZXJzaW9uXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubm9kZVBvb2xTcGVjKXtcbiAgICAgICAgICAgIGxldCBwb29sO1xuICAgICAgICAgICAgaWYgKHNlbXZlci5ndGUodmVyc2lvbiwgJzAuMzIuMCcpKXtcbiAgICAgICAgICAgICAgICBwb29sID0ge1xuICAgICAgICAgICAgICAgICAgICBhcGlWZXJzaW9uOiAna2FycGVudGVyLnNoL3YxYmV0YTEnLFxuICAgICAgICAgICAgICAgICAgICBraW5kOiAnTm9kZVBvb2wnLFxuICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YTogeyBuYW1lOiAnZGVmYXVsdC1ub2RlcG9vbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgc3BlYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IGxhYmVscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IGFubm90YXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlQ2xhc3NSZWY6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiZGVmYXVsdC1lYzJub2RlY2xhc3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWludHM6IHRhaW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR1cFRhaW50czogc3RhcnR1cFRhaW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmNvbnZlcnQocmVxdWlyZW1lbnRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcnVwdGlvbjogZGlzcnVwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0czogbGltaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0OiB3ZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcG9vbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgYXBpVmVyc2lvbjogJ2thcnBlbnRlci5zaC92MWFscGhhNScsXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ6ICdQcm92aXNpb25lcicsXG4gICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7IG5hbWU6ICdkZWZhdWx0LXByb3Zpc2lvbmVyJyB9LFxuICAgICAgICAgICAgICAgICAgICBzcGVjOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlclJlZjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiZGVmYXVsdC1ub2RldGVtcGxhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhaW50czogdGFpbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnR1cFRhaW50czogc3RhcnR1cFRhaW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczogbGFiZWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IGFubm90YXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZW1lbnRzOiB0aGlzLmNvbnZlcnQocmVxdWlyZW1lbnRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlczogbGltaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGlkYXRpb246IGNvbnNvbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR0bFNlY29uZHNVbnRpbEV4cGlyZWQ6IHR0bFNlY29uZHNVbnRpbEV4cGlyZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0dGxTZWNvbmRzQWZ0ZXJFbXB0eTogdHRsU2Vjb25kc0FmdGVyRW1wdHksXG4gICAgICAgICAgICAgICAgICAgICAgICB3ZWlnaHQ6IHdlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcG9vbE1hbmlmZXN0ID0gY2x1c3Rlci5hZGRNYW5pZmVzdCgnZGVmYXVsdC1wb29sJywgcG9vbCk7XG4gICAgICAgICAgICBwb29sTWFuaWZlc3Qubm9kZS5hZGREZXBlbmRlbmN5KGthcnBlbnRlckNoYXJ0KTtcblxuICAgICAgICAgICAgLy8gRGVwbG95IEFXU05vZGVUZW1wbGF0ZSAoQWxwaGEpIG9yIEVDMk5vZGVDbGFzcyAoQmV0YSkgQ1JEIGJhc2VkIG9uIHRoZSBLYXJwZW50ZXIgVmVyc2lvblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5lYzJOb2RlQ2xhc3NTcGVjKXtcbiAgICAgICAgICAgICAgICBsZXQgZWMyTm9kZTtcbiAgICAgICAgICAgICAgICBpZiAoc2VtdmVyLmd0ZSh2ZXJzaW9uLCAnMC4zMi4wJykpe1xuICAgICAgICAgICAgICAgICAgICBlYzJOb2RlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpVmVyc2lvbjogXCJrYXJwZW50ZXIuazhzLmF3cy92MWJldGExXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kOiBcIkVDMk5vZGVDbGFzc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcImRlZmF1bHQtZWMybm9kZWNsYXNzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVjOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW1pRmFtaWx5OiBhbWlGYW1pbHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibmV0U2VsZWN0b3JUZXJtczogc3VibmV0U2VsZWN0b3JUZXJtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWN1cml0eUdyb3VwU2VsZWN0b3JUZXJtczogc2dTZWxlY3RvclRlcm1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFtaVNlbGVjdG9yVGVybXM6IGFtaVNlbGVjdG9yVGVybXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRhdGE6IHVzZXJEYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3M6IHRhZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGFPcHRpb25zOiBtZXRhZGF0YU9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tEZXZpY2VNYXBwaW5nczogYmxvY2tEZXZpY2VNYXBwaW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxlZE1vbml0b3Jpbmc6IGRldGFpbGVkTW9uaXRvcmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvdmlkZSBjdXN0b20gSW5zdGFuY2UgUHJvZmlsZSB0byByZXBsYWNlIHJvbGUgaWYgcHJvdmlkZWQsIGVsc2UgdXNlIHRoZSByb2xlIGNyZWF0ZWQgd2l0aCB0aGUgYWRkb25cbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlUHJvZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWMyTm9kZSA9IG1lcmdlKGVjMk5vZGUsIHsgc3BlYzogeyBpbnN0YW5jZVByb2ZpbGU6IGluc3RhbmNlUHJvZiB9fSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlYzJOb2RlID0gbWVyZ2UoZWMyTm9kZSwgeyBzcGVjOiB7IHJvbGU6IGthcnBlbnRlck5vZGVSb2xlLnJvbGVOYW1lIH19KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEluc3RhbmNlIFN0b3JlIFBvbGljeSBhZGRlZCBmb3IgdjAuMzQuMCBhbmQgdXBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbXZlci5ndGUodmVyc2lvbiwgJzAuMzQuMCcpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVjMk5vZGUgPSBtZXJnZShlYzJOb2RlLCB7IHNwZWM6IHsgaW5zdGFuY2VTdG9yZVBvbGljeTogaW5zdGFuY2VTdG9yZVBvbGljeSB9fSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlYzJOb2RlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpVmVyc2lvbjogXCJrYXJwZW50ZXIuazhzLmF3cy92MWFscGhhMVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAga2luZDogXCJBV1NOb2RlVGVtcGxhdGVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJkZWZhdWx0LW5vZGV0ZW1wbGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgc3BlYzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym5ldFNlbGVjdG9yOiBzdWJuZXRTZWxlY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWN1cml0eUdyb3VwU2VsZWN0b3I6IHNnU2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VQcm9maWxlOiBpbnN0YW5jZVByb2YgPyBpbnN0YW5jZVByb2YgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFtaUZhbWlseTogYW1pRmFtaWx5ID8gYW1pRmFtaWx5IDogXCJBTDJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbWlTZWxlY3RvcjogYW1pU2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnczogdGFncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YU9wdGlvbnM6IG1ldGFkYXRhT3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9ja0RldmljZU1hcHBpbmdzOiBibG9ja0RldmljZU1hcHBpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhOiB1c2VyRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIEVDMiBEZXRhaWxlZCBNb25pdG9yaW5nIGZvciB2MC4yMi4wIGFuZCB1cFxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VtdmVyLmd0ZSh2ZXJzaW9uLCAnMC4yMi4wJykpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZWMyTm9kZSA9IG1lcmdlKGVjMk5vZGUsIHsgc3BlYzogeyBkZXRhaWxlZE1vbml0b3Jpbmc6IGRldGFpbGVkTW9uaXRvcmluZ319KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBub2RlTWFuaWZlc3QgPSBjbHVzdGVyLmFkZE1hbmlmZXN0KCdkZWZhdWx0LW5vZGUtdGVtcGxhdGUnLCBlYzJOb2RlKTtcbiAgICAgICAgICAgICAgICBub2RlTWFuaWZlc3Qubm9kZS5hZGREZXBlbmRlbmN5KHBvb2xNYW5pZmVzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGthcnBlbnRlckNoYXJ0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgZnVuY3Rpb24gdG8gY29udmVydCBhIGtleS1wYWlyIHZhbHVlcyAod2l0aCBhbiBvcGVyYXRvcilcbiAgICAgKiBvZiBzcGVjIGNvbmZpZ3VyYXRpb25zIHRvIGFwcHJvcHJpYXRlIGpzb24gZm9ybWF0IGZvciBhZGRNYW5pZmVzdCBmdW5jdGlvblxuICAgICAqIEBwYXJhbSByZXFzXG4gICAgICogQHJldHVybnMgbmV3UmVxc1xuICAgICAqICovXG4gICAgcHJvdGVjdGVkIGNvbnZlcnQocmVxczoge2tleTogc3RyaW5nLCBvcGVyYXRvcjogc3RyaW5nLCB2YWx1ZXM6IHN0cmluZ1tdfVtdKTogYW55W10ge1xuICAgICAgICBjb25zdCBuZXdSZXFzID0gW107XG4gICAgICAgIGZvciAobGV0IHJlcSBvZiByZXFzKXtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHJlcVsna2V5J107XG4gICAgICAgICAgICBjb25zdCBvcCA9IHJlcVsnb3BlcmF0b3InXTtcbiAgICAgICAgICAgIGNvbnN0IHZhbCA9IHJlcVsndmFsdWVzJ107XG4gICAgICAgICAgICBjb25zdCByZXF1aXJlbWVudCA9IHtcbiAgICAgICAgICAgICAgICBcImtleVwiOiBrZXksXG4gICAgICAgICAgICAgICAgXCJvcGVyYXRvclwiOiBvcCxcbiAgICAgICAgICAgICAgICBcInZhbHVlc1wiOiB2YWxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBuZXdSZXFzLnB1c2gocmVxdWlyZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdSZXFzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBmdW5jdGlvbiB0byBlbnN1cmUgcmlnaHQgZmVhdHVyZXMgYXJlIGFkZGVkIGFzIHBhcnQgb2YgdGhlIGNvbmZpZ3VyYXRpb25cbiAgICAgKiBmb3IgdGhlIHJpZ2h0IHZlcnNpb24gb2YgdGhlIGFkZC1vblxuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mb1xuICAgICAqIEBwYXJhbSB2ZXJzaW9uIHZlcnNpb24gb2YgdGhlIGFkZC1vblxuICAgICAqIEBwYXJhbSBkaXNydXB0aW9uIGRpc3J1cHRpb24gZmVhdHVyZSBhdmFpbGFibGUgd2l0aCB0aGUgQmV0YSBDUkRzXG4gICAgICogQHBhcmFtIGNvbnNvbGlkYXRpb24gY29uc29saWRhdGlvbiBzZXR0aW5nIGF2YWlsYWJsZSB3aXRoIHRoZSBBbHBoYSBDUkRzXG4gICAgICogQHBhcmFtIHR0bFNlY29uZHNBZnRlckVtcHR5IHR0bFNlY29uZHNBZnRlckVtcHR5IHNldHRpbmdcbiAgICAgKiBAcGFyYW0gdHRsU2Vjb25kc1VudGlsRXhwaXJlZCB0dGxTZWNvbmRzVW50aWxFeHBpcmVkIHNldHRpbmdcbiAgICAgKiBAcGFyYW0gZWMyTm9kZUNsYXNzU3BlYyBOb2RlIENsYXNzIFNwZWNcbiAgICAgKiBAcGFyYW0gYW1pRmFtaWx5IEFNSSBGYW1pbHlcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIHByaXZhdGUgdmVyc2lvbkZlYXR1cmVDaGVja3NGb3JFcnJvcihjbHVzdGVySW5mbzogQ2x1c3RlckluZm8sIHZlcnNpb246IHN0cmluZywgZGlzcnVwdGlvbjogYW55LCBjb25zb2xpZGF0aW9uOiBhbnksIHR0bFNlY29uZHNBZnRlckVtcHR5OiBhbnksIHR0bFNlY29uZHNVbnRpbEV4cGlyZWQ6IGFueSxcbiAgICAgICAgZWMyTm9kZUNsYXNzU3BlYzogYW55LCBhbWlGYW1pbHk6IGFueSk6IHZvaWQge1xuXG4gICAgICAgIC8vIEVDMiBEZXRhaWxlZCBNb25pdG9yaW5nIGlzIG9ubHkgYXZhaWxhYmxlIGluIHZlcnNpb25zIDAuMjMuMCBhbmQgYWJvdmVcbiAgICAgICAgaWYgKHNlbXZlci5sdCh2ZXJzaW9uLCAnMC4yMy4wJykgJiYgZWMyTm9kZUNsYXNzU3BlYyl7XG4gICAgICAgICAgICBhc3NlcnQoZWMyTm9kZUNsYXNzU3BlY1tcImRldGFpbGVkTW9uaXRvcmluZ1wiXSA9PT0gdW5kZWZpbmVkLCBcIkRldGFpbGVkIE1vbml0b3JpbmcgaXMgbm90IGF2YWlsYWJsZSBpbiB0aGlzIHZlcnNpb24gb2YgS2FycGVudGVyLiBQbGVhc2UgdXBncmFkZSB0byBhdCBsZWFzdCAwLjIzLjAuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGlzcnVwdGlvbiBidWRnZXQgc2hvdWxkIG5vdCBleGlzdCBmb3IgdmVyc2lvbnMgYmVsb3cgMC4zNC54XG4gICAgICAgIGlmIChzZW12ZXIubHQodmVyc2lvbiwgJzAuMzQuMCcpKXtcbiAgICAgICAgICAgIGlmIChkaXNydXB0aW9uKXtcbiAgICAgICAgICAgICAgICBhc3NlcnQoIWRpc3J1cHRpb25bXCJidWRnZXRzXCJdLCBcIllvdSBjYW5ub3Qgc2V0IGRpc3J1cHRpb24gYnVkZ2V0cyBmb3IgdGhpcyB2ZXJzaW9uIG9mIEthcnBlbnRlci4gUGxlYXNlIHVwZ3JhZGUgdG8gMC4zNC4wIG9yIGhpZ2hlci5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB2ZXJzaW9uIGNoZWNrIGVycm9ycyBmb3IgdjAuMzIuMCBhbmQgdXAgKGJldGEgQ1JEcylcbiAgICAgICAgaWYgKHNlbXZlci5ndGUodmVyc2lvbiwgJzAuMzIuMCcpKXtcbiAgICAgICAgICAgIC8vIENvbnNvbGlkYXRpb24gZmVhdHVyZXMgZG9uJ3QgZXhpc3QgaW4gYmV0YSBDUkRzXG4gICAgICAgICAgICBhc3NlcnQoIWNvbnNvbGlkYXRpb24gJiYgIXR0bFNlY29uZHNBZnRlckVtcHR5ICYmICF0dGxTZWNvbmRzVW50aWxFeHBpcmVkLCAnQ29uc29saWRhdGlvbiBmZWF0dXJlcyBhcmUgb25seSBhdmFpbGFibGUgZm9yIHByZXZpb3VzIHZlcnNpb25zIG9mIEthcnBlbnRlci4nKTtcblxuICAgICAgICAgICAgLy8gY29uc29saWRhdGVBZnRlciBjYW5ub3QgYmUgc2V0IGlmIHBvbGljeSBpcyBzZXQgdG8gV2hlblVuZGVydXRpbGl6ZWRcbiAgICAgICAgICAgIGlmIChkaXNydXB0aW9uICYmIGRpc3J1cHRpb25bXCJjb25zb2xpZGF0aW9uUG9saWN5XCJdID09IFwiV2hlblVuZGVydXRpbGl6ZWRcIil7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KCFkaXNydXB0aW9uW1wiY29uc29saWRhdGVBZnRlclwiXSwgJ1lvdSBjYW5ub3Qgc2V0IGNvbnNvbGlkYXRlQWZ0ZXIgdmFsdWUgaWYgdGhlIGNvbnNvbGlkYXRpb24gcG9saWN5IGlzIHNldCB0byBVbmRlcnV0aWxpemVkLicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBTUkgRmFtaWx5LCBTZWN1cml0eSBHcm91cCBhbmQgU3VibmV0IHRlcm1zIG11c3QgYmUgcHJvdmlkZWQsIGdpdmVuIEVDMiBOb2RlU3BlY1xuICAgICAgICAgICAgaWYgKGVjMk5vZGVDbGFzc1NwZWMpe1xuICAgICAgICAgICAgICAgIGFzc2VydChhbWlGYW1pbHkgIT09IHVuZGVmaW5lZCwgXCJQbGVhc2UgcHJvdmlkZSB0aGUgQU1JIEZhbWlseSBmb3IgeW91ciBFQzJOb2RlQ2xhc3MuXCIpO1xuICAgICAgICAgICAgICAgIGFzc2VydChlYzJOb2RlQ2xhc3NTcGVjW1wic2VjdXJpdHlHcm91cFNlbGVjdG9yVGVybXNcIl0gIT09IHVuZGVmaW5lZCwgXCJQbGVhc2UgcHJvdmlkZSBTZWN1cml0eUdyb3VwVGVybSBmb3IgeW91ciBFQzJOb2RlQ2xhc3MuXCIpO1xuICAgICAgICAgICAgICAgIGFzc2VydChlYzJOb2RlQ2xhc3NTcGVjW1wic3VibmV0U2VsZWN0b3JUZXJtc1wiXSAhPT0gdW5kZWZpbmVkLCBcIlBsZWFzZSBwcm92aWRlIHN1Ym5ldEdyb3VwVGVybSBmb3IgeW91ciBFQzJOb2RlQ2xhc3MuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmVyc2lvbiBjaGVjayBlcnJvcnMgZm9yIHYwLjMxLnggYW5kIGRvd24gKGFscGhhIENSRHMpXG4gICAgICAgIC8vIEluY2x1ZGVzIGNoZWNrcyBmb3IgY29uc29saWRhdGlvbiBhbmQgZGlzcnVwdGlvbiBmZWF0dXJlc1xuICAgICAgICBpZiAoc2VtdmVyLmx0KHZlcnNpb24sICcwLjMyLjAnKSl7XG4gICAgICAgICAgICBpZiAoY29uc29saWRhdGlvbil7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KCEoY29uc29saWRhdGlvbi5lbmFibGVkICYmIHR0bFNlY29uZHNBZnRlckVtcHR5KSAsICdDb25zb2xpZGF0aW9uIGFuZCB0dGxTZWNvbmRzQWZ0ZXJFbXB0eSBtdXN0IGJlIG11dHVhbGx5IGV4Y2x1c2l2ZS4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFzc2VydCghZGlzcnVwdGlvbiwgJ0Rpc3J1cHRpb24gY29uZmlndXJhdGlvbiBpcyBvbmx5IHN1cHBvcnRlZCBvbiB2ZXJzaW9ucyB2MC4zMi4wIGFuZCBsYXRlci4nKTtcblxuICAgICAgICAgICAgLy9TZWN1cml0eSBHcm91cCBhbmQgU3VibmV0IHRlcm1zIG11c3QgYmUgcHJvdmlkZWQsIGdpdmVuIEVDMiBOb2RlU3BlY1xuICAgICAgICAgICAgaWYgKGVjMk5vZGVDbGFzc1NwZWMpe1xuICAgICAgICAgICAgICAgIGFzc2VydChlYzJOb2RlQ2xhc3NTcGVjW1wic2VjdXJpdHlHcm91cFNlbGVjdG9yXCJdICE9PSB1bmRlZmluZWQsIFwiUGxlYXNlIHByb3ZpZGUgU2VjdXJpdHlHcm91cFRlcm0gZm9yIHlvdXIgQVdTTm9kZVRlbXBsYXRlLlwiKTtcbiAgICAgICAgICAgICAgICBhc3NlcnQoZWMyTm9kZUNsYXNzU3BlY1tcInN1Ym5ldFNlbGVjdG9yXCJdICE9PSB1bmRlZmluZWQsIFwiUGxlYXNlIHByb3ZpZGUgc3VibmV0R3JvdXBUZXJtIGZvciB5b3VyIEFXU05vZGVUZW1wbGF0ZS5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBzaG91bGQgYmxvY2sgTm9kZSBUZXJtaW5hdGlvbiBIYW5kbGVyIHVzYWdlIG9uY2UgS2FycGVudGVyIGlzIGxldmVyYWdlZFxuICAgICAgICAgYXNzZXJ0KCFjbHVzdGVySW5mby5nZXRQcm92aXNpb25lZEFkZE9uKCdBd3NOb2RlVGVybWluYXRpb25IYW5kbGVyQWRkT24nKSwgJ0thcnBlbnRlciBzdXBwb3J0cyBuYXRpdmUgaW50ZXJydXB0aW9uIGhhbmRsaW5nLCBzbyBOb2RlIFRlcm1pbmF0aW9uIEhhbmRsZXIgd2lsbCBub3QgYmUgbmVjZXNzYXJ5LicpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGVscGVyIGZ1bmN0aW9uIHRvIHNldCB1cCB0aGUgS2FycGVudGVyIE5vZGUgUm9sZSBhbmQgSW5zdGFuY2UgUHJvZmlsZVxuICAgICAqIE91dHB1dHMgdG8gQ2xvdWRGb3JtYXRpb24gYW5kIG1hcCB0aGUgcm9sZSB0byB0aGUgYXdzLWF1dGggQ29uZmlnTWFwXG4gICAgICogQHBhcmFtIGNsdXN0ZXIgRUtTIENsdXN0ZXJcbiAgICAgKiBAcGFyYW0gc3RhY2tOYW1lIE5hbWUgb2YgdGhlIHN0YWNrXG4gICAgICogQHBhcmFtIHJlZ2lvbiBSZWdpb24gb2YgdGhlIHN0YWNrXG4gICAgICogQHJldHVybnMgW2thcnBlbnRlck5vZGVSb2xlLCBrYXJwZW50ZXJJbnN0YW5jZVByb2ZpbGVdXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRVcE5vZGVSb2xlKGNsdXN0ZXI6IENsdXN0ZXIsIHN0YWNrTmFtZTogc3RyaW5nLCByZWdpb246IHN0cmluZyk6IFtpYW0uUm9sZSwgaWFtLkNmbkluc3RhbmNlUHJvZmlsZV0ge1xuICAgICAgICAvLyBTZXQgdXAgTm9kZSBSb2xlXG4gICAgICAgIGNvbnN0IGthcnBlbnRlck5vZGVSb2xlID0gbmV3IGlhbS5Sb2xlKGNsdXN0ZXIsICdrYXJwZW50ZXItbm9kZS1yb2xlJywge1xuICAgICAgICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoYGVjMi4ke2NsdXN0ZXIuc3RhY2sudXJsU3VmZml4fWApLFxuICAgICAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgICAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uRUtTV29ya2VyTm9kZVBvbGljeVwiKSxcbiAgICAgICAgICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25FS1NfQ05JX1BvbGljeVwiKSxcbiAgICAgICAgICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25FQzJDb250YWluZXJSZWdpc3RyeVJlYWRPbmx5XCIpLFxuICAgICAgICAgICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvblNTTU1hbmFnZWRJbnN0YW5jZUNvcmVcIiksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgLy9yb2xlTmFtZTogYEthcnBlbnRlck5vZGVSb2xlLSR7bmFtZX1gIC8vIGxldCByb2xlIG5hbWUgdG8gYmUgZ2VuZXJhdGVkIGFzIHVuaXF1ZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTZXQgdXAgSW5zdGFuY2UgUHJvZmlsZVxuICAgICAgICBjb25zdCBpbnN0YW5jZVByb2ZpbGVOYW1lID0gbWQ1Lk1kNS5oYXNoU3RyKHN0YWNrTmFtZStyZWdpb24pO1xuICAgICAgICBjb25zdCBrYXJwZW50ZXJJbnN0YW5jZVByb2ZpbGUgPSBuZXcgaWFtLkNmbkluc3RhbmNlUHJvZmlsZShjbHVzdGVyLCAna2FycGVudGVyLWluc3RhbmNlLXByb2ZpbGUnLCB7XG4gICAgICAgICAgICByb2xlczogW2thcnBlbnRlck5vZGVSb2xlLnJvbGVOYW1lXSxcbiAgICAgICAgICAgIGluc3RhbmNlUHJvZmlsZU5hbWU6IGBLYXJwZW50ZXJOb2RlSW5zdGFuY2VQcm9maWxlLSR7aW5zdGFuY2VQcm9maWxlTmFtZX1gLFxuICAgICAgICAgICAgcGF0aDogJy8nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNsdXN0ZXJJZCA9IE5hbWVzLnVuaXF1ZUlkKGNsdXN0ZXIpO1xuXG4gICAgICAgIC8vQ2ZuIG91dHB1dCBmb3IgTm9kZSBSb2xlIGluIGNhc2Ugb2YgbmVlZGluZyB0byBhZGQgYWRkaXRpb25hbCBwb2xpY2llc1xuICAgICAgICBuZXcgQ2ZuT3V0cHV0KGNsdXN0ZXIuc3RhY2ssICdLYXJwZW50ZXIgSW5zdGFuY2UgTm9kZSBSb2xlJywge1xuICAgICAgICAgICAgdmFsdWU6IGthcnBlbnRlck5vZGVSb2xlLnJvbGVOYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiS2FycGVudGVyIGFkZC1vbiBOb2RlIFJvbGUgbmFtZVwiLFxuICAgICAgICAgICAgZXhwb3J0TmFtZTogY2x1c3RlcklkK1wiS2FycGVudGVyTm9kZVJvbGVOYW1lXCIsXG4gICAgICAgIH0pO1xuICAgICAgICAvL0NmbiBvdXRwdXQgZm9yIEluc3RhbmNlIFByb2ZpbGUgZm9yIGNyZWF0aW5nIGFkZGl0aW9uYWwgcHJvdmlzaW9uZXJzXG4gICAgICAgIG5ldyBDZm5PdXRwdXQoY2x1c3Rlci5zdGFjaywgJ0thcnBlbnRlciBJbnN0YW5jZSBQcm9maWxlIG5hbWUnLCB7XG4gICAgICAgICAgICB2YWx1ZToga2FycGVudGVySW5zdGFuY2VQcm9maWxlID8ga2FycGVudGVySW5zdGFuY2VQcm9maWxlLmluc3RhbmNlUHJvZmlsZU5hbWUhIDogXCJub25lXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJLYXJwZW50ZXIgYWRkLW9uIEluc3RhbmNlIFByb2ZpbGUgbmFtZVwiLFxuICAgICAgICAgICAgZXhwb3J0TmFtZTogY2x1c3RlcklkK1wiS2FycGVudGVySW5zdGFuY2VQcm9maWxlTmFtZVwiLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBNYXAgTm9kZSBSb2xlIHRvIGF3cy1hdXRoXG4gICAgICAgIGNsdXN0ZXIuYXdzQXV0aC5hZGRSb2xlTWFwcGluZyhrYXJwZW50ZXJOb2RlUm9sZSwge1xuICAgICAgICAgICAgZ3JvdXBzOiBbJ3N5c3RlbTpib290c3RyYXBwZXInLCAnc3lzdGVtOm5vZGVzJ10sXG4gICAgICAgICAgICB1c2VybmFtZTogJ3N5c3RlbTpub2RlOnt7RUMyUHJpdmF0ZUROU05hbWV9fSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIFtrYXJwZW50ZXJOb2RlUm9sZSwga2FycGVudGVySW5zdGFuY2VQcm9maWxlXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgZnVuY3Rpb24gdG8gY2hlY2sgd2hldGhlcjpcbiAgICAgKiAxLiBTdXBwb3J0ZWQgS2FycGVudGVyIHZlcnNpb25zIGFyZSBpbXBsZW1lbnRlZCwgYW5kXG4gICAgICogMi4gU3VwcG9ydGVkIEt1YmVybmV0ZXMgdmVyc2lvbnMgYXJlIGRlcGxveWVkIG9uIHRoZSBjbHVzdGVyIHRvIHVzZSBLYXJwZW50ZXJcbiAgICAgKiBJdCB3aWxsIHJlamVjdCB0aGUgYWRkb24gaWYgdGhlIGNsdXN0ZXIgdXNlcyBkZXByZWNhdGVkIEt1YmVybmV0ZXMgdmVyc2lvbiwgYW5kXG4gICAgICogV2FybiB1c2VycyBhYm91dCBpc3N1ZXMgaWYgaW5jb21wYXRpYmxlIEthcnBlbnRlciB2ZXJzaW9uIGlzIHVzZWQgZm9yIGEgcGFydGljdWxhciBjbHVzdGVyXG4gICAgICogZ2l2ZW4gaXRzIEt1YmVybmV0ZXMgdmVyc2lvblxuICAgICAqIEBwYXJhbSBrYXJwZW50ZXJWZXJzaW9uIEthcnBlbnRlciB2ZXJzaW9uIHRvIGJlIGRlcGxveWVkXG4gICAgICogQHBhcmFtIGt1YmVWZXJzaW9uIENsdXN0ZXIncyBLdWJlcm5ldGVzIHZlcnNpb25cbiAgICAgKi9cbiAgICBwcml2YXRlIGlzQ29tcGF0aWJsZShrYXJwZW50ZXJWZXJzaW9uOiBzdHJpbmcsIGt1YmVWZXJzaW9uOiBLdWJlcm5ldGVzVmVyc2lvbik6IHZvaWQge1xuICAgICAgICBhc3NlcnQodmVyc2lvbk1hcC5oYXMoa3ViZVZlcnNpb24pLCAnUGxlYXNlIHVwZ3JhZGUgeW91ciBFS1MgS3ViZXJuZXRlcyB2ZXJzaW9uIHRvIHN0YXJ0IHVzaW5nIEthcnBlbnRlci4nKTtcbiAgICAgICAgYXNzZXJ0KHNlbXZlci5ndGUoa2FycGVudGVyVmVyc2lvbiwgJzAuMjEuMCcpLCAnUGxlYXNlIHVzZSBLYXJwZW50ZXIgdmVyc2lvbiAwLjIxLjAgb3IgYWJvdmUuJyk7XG4gICAgICAgIGNvbnN0IGNvbXBhdGlibGVWZXJzaW9uID0gdmVyc2lvbk1hcC5nZXQoa3ViZVZlcnNpb24pIGFzIHN0cmluZztcbiAgICAgICAgaWYgKHNlbXZlci5ndChjb21wYXRpYmxlVmVyc2lvbiwga2FycGVudGVyVmVyc2lvbikpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgUGxlYXNlIHVzZSBtaW5pbXVtIEthcnBlbnRlciB2ZXJzaW9uIGZvciB0aGlzIEt1YmVybmV0ZXMgVmVyc2lvbjogJHtjb21wYXRpYmxlVmVyc2lvbn0sIG90aGVyd2lzZSB5b3Ugd2lsbCBydW4gaW50byBjb21wYXRpYmlsaXR5IGlzc3Vlcy5gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==