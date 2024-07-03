"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericClusterProvider = exports.ClusterBuilder = exports.defaultOptions = exports.GenericClusterPropsConstraints = exports.FargateProfileConstraints = exports.AutoscalingNodeGroupConstraints = exports.ManagedNodeGroupConstraints = void 0;
exports.clusterBuilder = clusterBuilder;
exports.selectKubectlLayer = selectKubectlLayer;
const lambda_layer_kubectl_v23_1 = require("@aws-cdk/lambda-layer-kubectl-v23");
const lambda_layer_kubectl_v24_1 = require("@aws-cdk/lambda-layer-kubectl-v24");
const lambda_layer_kubectl_v25_1 = require("@aws-cdk/lambda-layer-kubectl-v25");
const lambda_layer_kubectl_v26_1 = require("@aws-cdk/lambda-layer-kubectl-v26");
const lambda_layer_kubectl_v27_1 = require("@aws-cdk/lambda-layer-kubectl-v27");
const lambda_layer_kubectl_v28_1 = require("@aws-cdk/lambda-layer-kubectl-v28");
const lambda_layer_kubectl_v29_1 = require("@aws-cdk/lambda-layer-kubectl-v29");
const lambda_layer_kubectl_v30_1 = require("@aws-cdk/lambda-layer-kubectl-v30");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const autoscaling = require("aws-cdk-lib/aws-autoscaling");
const ec2 = require("aws-cdk-lib/aws-ec2");
const eks = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const spi_1 = require("../spi");
const utils = require("../utils");
const constants = require("./constants");
const assert = require("assert");
function clusterBuilder() {
    return new ClusterBuilder();
}
/**
 * Function that contains logic to map the correct kunbectl layer based on the passed in version.
 * @param scope in whch the kubectl layer must be created
 * @param version EKS version
 * @returns ILayerVersion or undefined
 */
function selectKubectlLayer(scope, version) {
    switch (version.version) {
        case "1.23":
            return new lambda_layer_kubectl_v23_1.KubectlV23Layer(scope, "kubectllayer23");
        case "1.24":
            return new lambda_layer_kubectl_v24_1.KubectlV24Layer(scope, "kubectllayer24");
        case "1.25":
            return new lambda_layer_kubectl_v25_1.KubectlV25Layer(scope, "kubectllayer25");
        case "1.26":
            return new lambda_layer_kubectl_v26_1.KubectlV26Layer(scope, "kubectllayer26");
        case "1.27":
            return new lambda_layer_kubectl_v27_1.KubectlV27Layer(scope, "kubectllayer27");
        case "1.28":
            return new lambda_layer_kubectl_v28_1.KubectlV28Layer(scope, "kubectllayer28");
        case "1.29":
            return new lambda_layer_kubectl_v29_1.KubectlV29Layer(scope, "kubectllayer29");
        case "1.30":
            return new lambda_layer_kubectl_v30_1.KubectlV30Layer(scope, "kubectllayer30");
    }
    const minor = version.version.split('.')[1];
    if (minor && parseInt(minor, 10) > 30) {
        return new lambda_layer_kubectl_v30_1.KubectlV30Layer(scope, "kubectllayer30"); // for all versions above 1.30 use 1.30 kubectl (unless explicitly supported in CDK)
    }
    return undefined;
}
class ManagedNodeGroupConstraints {
    constructor() {
        /**
         * id can be no less than 1 character long, and no greater than 63 characters long due to DNS system limitations.
         * https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
         */
        this.id = new utils.StringConstraint(1, 63);
        /**
        * nodes per node group has a soft limit of 450 nodes, and as little as 0. But we multiply that by a factor of 5 to 2250 in case
        * of situations of a hard limit request being accepted, and as a result the limit would be raised
        * https://docs.aws.amazon.com/eks/latest/userguide/service-quotas.html
        */
        this.minSize = new utils.NumberConstraint(0, 2250);
        /**
         * nodes per node group has a soft limit of 450 nodes, and as little as 0. But we multiply that by a factor of 5 to 2250 in case
         * of situations of a hard limit request being accepted, and as a result the limit would be raised
         * https://docs.aws.amazon.com/eks/latest/userguide/service-quotas.html
         */
        this.maxSize = new utils.NumberConstraint(0, 2250);
        /**
         * Nodes per node group has a soft limit of 450 nodes, and as little as 0. But we multiply that by a factor of 5 to 2250 in case
         * of situations of a hard limit request being accepted, and as a result the limit would be raised
         * https://docs.aws.amazon.com/eks/latest/userguide/service-quotas.html
         */
        this.desiredSize = new utils.NumberConstraint(0, 2250);
        /**
         * amiReleaseVersion can be no less than 1 character long, and no greater than 1024 characters long.
         * https://docs.aws.amazon.com/imagebuilder/latest/APIReference/API_Ami.html
         */
        this.amiReleaseVersion = new utils.StringConstraint(1, 1024);
    }
}
exports.ManagedNodeGroupConstraints = ManagedNodeGroupConstraints;
class AutoscalingNodeGroupConstraints {
    constructor() {
        /**
        * id can be no less than 1 character long, and no greater than 63 characters long due to DNS system limitations.
        * https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
        */
        this.id = new utils.StringConstraint(1, 63);
        /**
        * Allowed range is 0 to 5000 inclusive.
        * https://kubernetes.io/docs/setup/best-practices/cluster-large/
        */
        this.minSize = new utils.NumberConstraint(0, 5000);
        /**
        * Allowed range is 0 to 5000 inclusive.
        * https://kubernetes.io/docs/setup/best-practices/cluster-large/
        */
        this.maxSize = new utils.NumberConstraint(0, 5000);
        /**
        * Allowed range is 0 to 5000 inclusive.
        * https://kubernetes.io/docs/setup/best-practices/cluster-large/
        */
        this.desiredSize = new utils.NumberConstraint(0, 5000);
    }
}
exports.AutoscalingNodeGroupConstraints = AutoscalingNodeGroupConstraints;
class FargateProfileConstraints {
    constructor() {
        /**
        * fargateProfileNames can be no less than 1 character long, and no greater than 63 characters long due to DNS system limitations.
        * https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
        */
        this.fargateProfileName = new utils.StringConstraint(1, 63);
    }
}
exports.FargateProfileConstraints = FargateProfileConstraints;
class GenericClusterPropsConstraints {
    constructor() {
        /**
        * managedNodeGroups per cluster have a soft limit of 30 managed node groups per EKS cluster, and as little as 0. But we multiply that
        * by a factor of 5 to 150 in case of situations of a hard limit request being accepted, and as a result the limit would be raised.
        * https://docs.aws.amazon.com/eks/latest/userguide/service-quotas.html
        */
        this.managedNodeGroups = new utils.ArrayConstraint(0, 150);
        /**
        * autoscalingNodeGroups per cluster have a soft limit of 500 autoscaling node groups per EKS cluster, and as little as 0. But we multiply that
        * by a factor of 5 to 2500 in case of situations of a hard limit request being accepted, and as a result the limit would be raised.
        * https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-quotas.html
        */
        this.autoscalingNodeGroups = new utils.ArrayConstraint(0, 5000);
    }
}
exports.GenericClusterPropsConstraints = GenericClusterPropsConstraints;
exports.defaultOptions = {};
class ClusterBuilder {
    constructor() {
        this.props = {};
        this.privateCluster = false;
        this.managedNodeGroups = [];
        this.autoscalingNodeGroups = [];
        this.fargateProfiles = {};
        this.props = { ...this.props };
    }
    withCommonOptions(options) {
        this.props = { ...this.props, ...options };
        return this;
    }
    managedNodeGroup(...nodeGroups) {
        this.managedNodeGroups = this.managedNodeGroups.concat(nodeGroups);
        return this;
    }
    autoscalingGroup(...nodeGroups) {
        this.autoscalingNodeGroups = this.autoscalingNodeGroups.concat(nodeGroups);
        return this;
    }
    fargateProfile(name, options) {
        this.fargateProfiles[name] = options;
        return this;
    }
    version(version) {
        this.props = { ...this.props, version };
        return this;
    }
    build() {
        return new GenericClusterProvider({
            ...this.props,
            privateCluster: this.privateCluster,
            managedNodeGroups: this.managedNodeGroups,
            autoscalingNodeGroups: this.autoscalingNodeGroups,
            fargateProfiles: this.fargateProfiles
        });
    }
}
exports.ClusterBuilder = ClusterBuilder;
/**
 * Cluster provider implementation that supports multiple node groups.
 */
class GenericClusterProvider {
    constructor(props) {
        this.props = props;
        this.validateInput(props);
        assert(!(props.managedNodeGroups && props.managedNodeGroups.length > 0
            && props.autoscalingNodeGroups && props.autoscalingNodeGroups.length > 0), "Mixing managed and autoscaling node groups is not supported. Please file a request on GitHub to add this support if needed.");
    }
    /**
     * @override
     */
    createCluster(scope, vpc, secretsEncryptionKey, kubernetesVersion, clusterLogging) {
        var _a, _b, _c, _d, _e, _f, _g;
        const id = scope.node.id;
        // Props for the cluster.
        const clusterName = (_a = this.props.clusterName) !== null && _a !== void 0 ? _a : id;
        const outputClusterName = true;
        if (!kubernetesVersion && !this.props.version) {
            throw new Error("Version was not specified by cluster builder or in cluster provider props, must be specified in one of these");
        }
        const version = kubernetesVersion || this.props.version || eks.KubernetesVersion.V1_30;
        const privateCluster = (_b = this.props.privateCluster) !== null && _b !== void 0 ? _b : utils.valueFromContext(scope, constants.PRIVATE_CLUSTER, false);
        const endpointAccess = (privateCluster === true) ? eks.EndpointAccess.PRIVATE : eks.EndpointAccess.PUBLIC_AND_PRIVATE;
        const vpcSubnets = (_c = this.props.vpcSubnets) !== null && _c !== void 0 ? _c : (privateCluster === true ? [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }] : undefined);
        const mastersRole = (_d = this.props.mastersRole) !== null && _d !== void 0 ? _d : new aws_iam_1.Role(scope, `${clusterName}-AccessRole`, {
            assumedBy: new aws_iam_1.AccountRootPrincipal()
        });
        const kubectlLayer = this.getKubectlLayer(scope, version);
        const tags = this.props.tags;
        const defaultOptions = {
            vpc,
            secretsEncryptionKey,
            clusterName,
            clusterLogging,
            outputClusterName,
            version,
            vpcSubnets,
            endpointAccess,
            kubectlLayer,
            tags,
            mastersRole,
            defaultCapacity: 0 // we want to manage capacity ourselves
        };
        const clusterOptions = { ...defaultOptions, ...this.props, version };
        // Create an EKS Cluster
        const cluster = this.internalCreateCluster(scope, id, clusterOptions);
        cluster.node.addDependency(vpc);
        const nodeGroups = [];
        (_e = this.props.managedNodeGroups) === null || _e === void 0 ? void 0 : _e.forEach(n => {
            const nodeGroup = this.addManagedNodeGroup(cluster, n);
            nodeGroups.push(nodeGroup);
        });
        const autoscalingGroups = [];
        (_f = this.props.autoscalingNodeGroups) === null || _f === void 0 ? void 0 : _f.forEach(n => {
            const autoscalingGroup = this.addAutoScalingGroup(cluster, n);
            autoscalingGroups.push(autoscalingGroup);
        });
        const fargateProfiles = Object.entries((_g = this.props.fargateProfiles) !== null && _g !== void 0 ? _g : {});
        const fargateConstructs = [];
        fargateProfiles === null || fargateProfiles === void 0 ? void 0 : fargateProfiles.forEach(([key, options]) => fargateConstructs.push(this.addFargateProfile(cluster, key, options)));
        return new spi_1.ClusterInfo(cluster, version, nodeGroups, autoscalingGroups, fargateConstructs);
    }
    /**
     * Template method that may be overridden by subclasses to create a specific cluster flavor (e.g. FargateCluster vs eks.Cluster)
     * @param scope
     * @param id
     * @param clusterOptions
     * @returns
     */
    internalCreateCluster(scope, id, clusterOptions) {
        return new eks.Cluster(scope, id, clusterOptions);
    }
    /**
     * Can be overridden to provide a custom kubectl layer.
     * @param scope
     * @param version
     * @returns
     */
    getKubectlLayer(scope, version) {
        return selectKubectlLayer(scope, version);
    }
    /**
     * Adds an autoscaling group to the cluster.
     * @param cluster
     * @param nodeGroup
     * @returns
     */
    addAutoScalingGroup(cluster, nodeGroup) {
        var _a, _b, _c, _d, _e, _f, _g;
        const machineImageType = (_a = nodeGroup.machineImageType) !== null && _a !== void 0 ? _a : eks.MachineImageType.AMAZON_LINUX_2;
        const instanceTypeContext = utils.valueFromContext(cluster, constants.INSTANCE_TYPE_KEY, constants.DEFAULT_INSTANCE_TYPE);
        const instanceType = (_b = nodeGroup.instanceType) !== null && _b !== void 0 ? _b : (typeof instanceTypeContext === 'string' ? new ec2.InstanceType(instanceTypeContext) : instanceTypeContext);
        const minSize = (_c = nodeGroup.minSize) !== null && _c !== void 0 ? _c : utils.valueFromContext(cluster, constants.MIN_SIZE_KEY, constants.DEFAULT_NG_MINSIZE);
        const maxSize = (_d = nodeGroup.maxSize) !== null && _d !== void 0 ? _d : utils.valueFromContext(cluster, constants.MAX_SIZE_KEY, constants.DEFAULT_NG_MAXSIZE);
        const desiredSize = (_e = nodeGroup.desiredSize) !== null && _e !== void 0 ? _e : utils.valueFromContext(cluster, constants.DESIRED_SIZE_KEY, minSize);
        const updatePolicy = (_f = nodeGroup.updatePolicy) !== null && _f !== void 0 ? _f : autoscaling.UpdatePolicy.rollingUpdate();
        // Create an autoscaling group
        return cluster.addAutoScalingGroupCapacity(nodeGroup.id, {
            ...nodeGroup,
            ...{
                autoScalingGroupName: (_g = nodeGroup.autoScalingGroupName) !== null && _g !== void 0 ? _g : nodeGroup.id,
                machineImageType,
                instanceType,
                minCapacity: minSize,
                maxCapacity: maxSize,
                desiredCapacity: desiredSize,
                updatePolicy,
                vpcSubnets: nodeGroup.nodeGroupSubnets,
            }
        });
    }
    /**
     * Adds a fargate profile to the cluster
     */
    addFargateProfile(cluster, name, profileOptions) {
        return cluster.addFargateProfile(name, profileOptions);
    }
    /**
     * Adds a managed node group to the cluster.
     * @param cluster
     * @param nodeGroup
     * @returns
     */
    addManagedNodeGroup(cluster, nodeGroup) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const capacityType = nodeGroup.nodeGroupCapacityType;
        const releaseVersion = nodeGroup.amiReleaseVersion;
        const instanceTypeContext = utils.valueFromContext(cluster, constants.INSTANCE_TYPE_KEY, constants.DEFAULT_INSTANCE_TYPE);
        const instanceTypes = (_a = nodeGroup.instanceTypes) !== null && _a !== void 0 ? _a : ([typeof instanceTypeContext === 'string' ? new ec2.InstanceType(instanceTypeContext) : instanceTypeContext]);
        const minSize = (_b = nodeGroup.minSize) !== null && _b !== void 0 ? _b : utils.valueFromContext(cluster, constants.MIN_SIZE_KEY, constants.DEFAULT_NG_MINSIZE);
        const maxSize = (_c = nodeGroup.maxSize) !== null && _c !== void 0 ? _c : utils.valueFromContext(cluster, constants.MAX_SIZE_KEY, constants.DEFAULT_NG_MAXSIZE);
        const desiredSize = (_d = nodeGroup.desiredSize) !== null && _d !== void 0 ? _d : utils.valueFromContext(cluster, constants.DESIRED_SIZE_KEY, minSize);
        // Create a managed node group.
        const nodegroupOptions = {
            ...nodeGroup,
            ...{
                nodegroupName: (_e = nodeGroup.nodegroupName) !== null && _e !== void 0 ? _e : nodeGroup.id,
                capacityType,
                instanceTypes,
                minSize,
                maxSize,
                desiredSize,
                releaseVersion,
                subnets: nodeGroup.nodeGroupSubnets
            }
        };
        if (nodeGroup.launchTemplate) {
            // Create launch template with provided launch template properties
            const lt = new ec2.LaunchTemplate(cluster, `${nodeGroup.id}-lt`, {
                blockDevices: nodeGroup.launchTemplate.blockDevices,
                machineImage: (_f = nodeGroup.launchTemplate) === null || _f === void 0 ? void 0 : _f.machineImage,
                securityGroup: nodeGroup.launchTemplate.securityGroup,
                userData: (_g = nodeGroup.launchTemplate) === null || _g === void 0 ? void 0 : _g.userData,
                requireImdsv2: (_h = nodeGroup.launchTemplate) === null || _h === void 0 ? void 0 : _h.requireImdsv2,
            });
            utils.setPath(nodegroupOptions, "launchTemplateSpec", {
                id: lt.launchTemplateId,
                version: lt.latestVersionNumber,
            });
            const tags = Object.entries((_j = nodeGroup.launchTemplate.tags) !== null && _j !== void 0 ? _j : {});
            tags.forEach(([key, options]) => aws_cdk_lib_1.Tags.of(lt).add(key, options));
            if ((_k = nodeGroup.launchTemplate) === null || _k === void 0 ? void 0 : _k.machineImage) {
                delete nodegroupOptions.amiType;
                delete nodegroupOptions.releaseVersion;
                delete nodeGroup.amiReleaseVersion;
            }
        }
        const result = cluster.addNodegroupCapacity(nodeGroup.id + "-ng", nodegroupOptions);
        if (nodeGroup.enableSsmPermissions) {
            result.role.addManagedPolicy(aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
        }
        return result;
    }
    validateInput(props) {
        utils.validateConstraints(new GenericClusterPropsConstraints, GenericClusterProvider.name, props);
        if (props.managedNodeGroups != undefined)
            utils.validateConstraints(new ManagedNodeGroupConstraints, "ManagedNodeGroup", ...props.managedNodeGroups);
        if (props.autoscalingNodeGroups != undefined)
            utils.validateConstraints(new AutoscalingNodeGroupConstraints, "AutoscalingNodeGroups", ...props.autoscalingNodeGroups);
        if (props.fargateProfiles != undefined)
            utils.validateConstraints(new FargateProfileConstraints, "FargateProfiles", ...Object.values(props.fargateProfiles));
    }
}
exports.GenericClusterProvider = GenericClusterProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJpYy1jbHVzdGVyLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NsdXN0ZXItcHJvdmlkZXJzL2dlbmVyaWMtY2x1c3Rlci1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUF3QkEsd0NBRUM7QUFRRCxnREEyQkM7QUE1REQsZ0ZBQW9FO0FBQ3BFLGdGQUFvRTtBQUNwRSxnRkFBb0U7QUFDcEUsZ0ZBQW9FO0FBQ3BFLGdGQUFvRTtBQUNwRSxnRkFBb0U7QUFDcEUsZ0ZBQW9FO0FBQ3BFLGdGQUFvRTtBQUVwRSw2Q0FBbUM7QUFDbkMsMkRBQTJEO0FBQzNELDJDQUEyQztBQUMzQywyQ0FBMkM7QUFDM0MsaURBQWdGO0FBSWhGLGdDQUFzRDtBQUN0RCxrQ0FBa0M7QUFDbEMseUNBQXlDO0FBRXpDLGlDQUFrQztBQUVsQyxTQUFnQixjQUFjO0lBQzFCLE9BQU8sSUFBSSxjQUFjLEVBQUUsQ0FBQztBQUNoQyxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixrQkFBa0IsQ0FBQyxLQUFnQixFQUFFLE9BQThCO0lBQy9FLFFBQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3JCLEtBQUssTUFBTTtZQUNQLE9BQU8sSUFBSSwwQ0FBZSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hELEtBQUssTUFBTTtZQUNQLE9BQU8sSUFBSSwwQ0FBZSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hELEtBQUssTUFBTTtZQUNQLE9BQU8sSUFBSSwwQ0FBZSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hELEtBQUssTUFBTTtZQUNQLE9BQU8sSUFBSSwwQ0FBZSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hELEtBQUssTUFBTTtZQUNQLE9BQU8sSUFBSSwwQ0FBZSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFD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QUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXBGLElBQUcsU0FBUyxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx1QkFBYSxDQUFDLHdCQUF3QixDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztRQUN6RyxDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLGFBQWEsQ0FBQyxLQUFrQztRQUVwRCxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSw4QkFBOEIsRUFBRSxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLElBQUksU0FBUztZQUNwQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSwyQkFBMkIsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQy9HLElBQUksS0FBSyxDQUFDLHFCQUFxQixJQUFJLFNBQVM7WUFDeEMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksK0JBQStCLEVBQUUsdUJBQXVCLEVBQUUsR0FBRyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUM1SCxJQUFJLEtBQUssQ0FBQyxlQUFzQixJQUFJLFNBQVM7WUFDekMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUkseUJBQXlCLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFzQixDQUFDLENBQUMsQ0FBQztJQUNwSSxDQUFDO0NBQ0o7QUE3TUQsd0RBNk1DIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBLdWJlY3RsVjIzTGF5ZXIgfSBmcm9tIFwiQGF3cy1jZGsvbGFtYmRhLWxheWVyLWt1YmVjdGwtdjIzXCI7XG5pbXBvcnQgeyBLdWJlY3RsVjI0TGF5ZXIgfSBmcm9tIFwiQGF3cy1jZGsvbGFtYmRhLWxheWVyLWt1YmVjdGwtdjI0XCI7XG5pbXBvcnQgeyBLdWJlY3RsVjI1TGF5ZXIgfSBmcm9tIFwiQGF3cy1jZGsvbGFtYmRhLWxheWVyLWt1YmVjdGwtdjI1XCI7XG5pbXBvcnQgeyBLdWJlY3RsVjI2TGF5ZXIgfSBmcm9tIFwiQGF3cy1jZGsvbGFtYmRhLWxheWVyLWt1YmVjdGwtdjI2XCI7XG5pbXBvcnQgeyBLdWJlY3RsVjI3TGF5ZXIgfSBmcm9tIFwiQGF3cy1jZGsvbGFtYmRhLWxheWVyLWt1YmVjdGwtdjI3XCI7XG5pbXBvcnQgeyBLdWJlY3RsVjI4TGF5ZXIgfSBmcm9tIFwiQGF3cy1jZGsvbGFtYmRhLWxheWVyLWt1YmVjdGwtdjI4XCI7XG5pbXBvcnQgeyBLdWJlY3RsVjI5TGF5ZXIgfSBmcm9tIFwiQGF3cy1jZGsvbGFtYmRhLWxheWVyLWt1YmVjdGwtdjI5XCI7XG5pbXBvcnQgeyBLdWJlY3RsVjMwTGF5ZXIgfSBmcm9tIFwiQGF3cy1jZGsvbGFtYmRhLWxheWVyLWt1YmVjdGwtdjMwXCI7XG5cbmltcG9ydCB7IFRhZ3MgfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCAqIGFzIGF1dG9zY2FsaW5nIGZyb20gJ2F3cy1jZGstbGliL2F3cy1hdXRvc2NhbGluZyc7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSBcImF3cy1jZGstbGliL2F3cy1lYzJcIjtcbmltcG9ydCAqIGFzIGVrcyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xuaW1wb3J0IHsgQWNjb3VudFJvb3RQcmluY2lwYWwsIE1hbmFnZWRQb2xpY3ksIFJvbGUgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0IHsgSUtleSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mta21zXCI7XG5pbXBvcnQgeyBJTGF5ZXJWZXJzaW9uIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1sYW1iZGFcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBDbHVzdGVySW5mbywgQ2x1c3RlclByb3ZpZGVyIH0gZnJvbSBcIi4uL3NwaVwiO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcIi4uL3V0aWxzXCI7XG5pbXBvcnQgKiBhcyBjb25zdGFudHMgZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgQXV0b3NjYWxpbmdOb2RlR3JvdXAsIE1hbmFnZWROb2RlR3JvdXAgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gY2x1c3RlckJ1aWxkZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBDbHVzdGVyQnVpbGRlcigpO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgY29udGFpbnMgbG9naWMgdG8gbWFwIHRoZSBjb3JyZWN0IGt1bmJlY3RsIGxheWVyIGJhc2VkIG9uIHRoZSBwYXNzZWQgaW4gdmVyc2lvbi4gXG4gKiBAcGFyYW0gc2NvcGUgaW4gd2hjaCB0aGUga3ViZWN0bCBsYXllciBtdXN0IGJlIGNyZWF0ZWRcbiAqIEBwYXJhbSB2ZXJzaW9uIEVLUyB2ZXJzaW9uXG4gKiBAcmV0dXJucyBJTGF5ZXJWZXJzaW9uIG9yIHVuZGVmaW5lZFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0S3ViZWN0bExheWVyKHNjb3BlOiBDb25zdHJ1Y3QsIHZlcnNpb246IGVrcy5LdWJlcm5ldGVzVmVyc2lvbik6IElMYXllclZlcnNpb24gfCB1bmRlZmluZWQge1xuICAgIHN3aXRjaCh2ZXJzaW9uLnZlcnNpb24pIHtcbiAgICAgICAgY2FzZSBcIjEuMjNcIjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgS3ViZWN0bFYyM0xheWVyKHNjb3BlLCBcImt1YmVjdGxsYXllcjIzXCIpO1xuICAgICAgICBjYXNlIFwiMS4yNFwiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBLdWJlY3RsVjI0TGF5ZXIoc2NvcGUsIFwia3ViZWN0bGxheWVyMjRcIik7XG4gICAgICAgIGNhc2UgXCIxLjI1XCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEt1YmVjdGxWMjVMYXllcihzY29wZSwgXCJrdWJlY3RsbGF5ZXIyNVwiKTtcbiAgICAgICAgY2FzZSBcIjEuMjZcIjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgS3ViZWN0bFYyNkxheWVyKHNjb3BlLCBcImt1YmVjdGxsYXllcjI2XCIpO1xuICAgICAgICBjYXNlIFwiMS4yN1wiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBLdWJlY3RsVjI3TGF5ZXIoc2NvcGUsIFwia3ViZWN0bGxheWVyMjdcIik7XG4gICAgICAgIGNhc2UgXCIxLjI4XCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEt1YmVjdGxWMjhMYXllcihzY29wZSwgXCJrdWJlY3RsbGF5ZXIyOFwiKTtcbiAgICAgICAgY2FzZSBcIjEuMjlcIjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgS3ViZWN0bFYyOUxheWVyKHNjb3BlLCBcImt1YmVjdGxsYXllcjI5XCIpO1xuICAgICAgICBjYXNlIFwiMS4zMFwiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBLdWJlY3RsVjMwTGF5ZXIoc2NvcGUsIFwia3ViZWN0bGxheWVyMzBcIik7XG4gICAgXG4gICAgfVxuICAgIFxuICAgIGNvbnN0IG1pbm9yID0gdmVyc2lvbi52ZXJzaW9uLnNwbGl0KCcuJylbMV07XG5cbiAgICBpZihtaW5vciAmJiBwYXJzZUludChtaW5vciwgMTApID4gMzApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBLdWJlY3RsVjMwTGF5ZXIoc2NvcGUsIFwia3ViZWN0bGxheWVyMzBcIik7IC8vIGZvciBhbGwgdmVyc2lvbnMgYWJvdmUgMS4zMCB1c2UgMS4zMCBrdWJlY3RsICh1bmxlc3MgZXhwbGljaXRseSBzdXBwb3J0ZWQgaW4gQ0RLKVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuLyoqXG4gKiBQcm9wZXJ0aWVzIGZvciB0aGUgZ2VuZXJpYyBjbHVzdGVyIHByb3ZpZGVyLCBjb250YWluaW5nIGRlZmluaXRpb25zIG9mIG1hbmFnZWQgbm9kZSBncm91cHMsXG4gKiBhdXRvLXNjYWxpbmcgZ3JvdXBzLCBmYXJnYXRlIHByb2ZpbGVzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdlbmVyaWNDbHVzdGVyUHJvdmlkZXJQcm9wcyBleHRlbmRzIFBhcnRpYWw8ZWtzLkNsdXN0ZXJPcHRpb25zPiB7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIEFQSSBzZXJ2ZXIgaXMgcHJpdmF0ZS5cbiAgICAgKi9cbiAgICBwcml2YXRlQ2x1c3Rlcj86IGJvb2xlYW4sXG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBtYW5hZ2VkIG5vZGUgZ3JvdXBzLlxuICAgICAqL1xuICAgIG1hbmFnZWROb2RlR3JvdXBzPzogTWFuYWdlZE5vZGVHcm91cFtdO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2YgYXV0b3NjYWxpbmcgbm9kZSBncm91cHMuXG4gICAgICovXG4gICAgYXV0b3NjYWxpbmdOb2RlR3JvdXBzPzogQXV0b3NjYWxpbmdOb2RlR3JvdXBbXTtcblxuICAgIC8qKlxuICAgICAqIEZhcmdhdGUgcHJvZmlsZXNcbiAgICAgKi9cbiAgICBmYXJnYXRlUHJvZmlsZXM/OiB7XG4gICAgICAgIFtrZXk6IHN0cmluZ106IGVrcy5GYXJnYXRlUHJvZmlsZU9wdGlvbnM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGFncyBmb3IgdGhlIGNsdXN0ZXJcbiAgICAgKi9cbiAgICB0YWdzPzoge1xuICAgICAgICBba2V5OiBzdHJpbmddOiBzdHJpbmc7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWFuYWdlZE5vZGVHcm91cENvbnN0cmFpbnRzIGltcGxlbWVudHMgdXRpbHMuQ29uc3RyYWludHNUeXBlPE1hbmFnZWROb2RlR3JvdXA+IHtcbiAgICAvKipcbiAgICAgKiBpZCBjYW4gYmUgbm8gbGVzcyB0aGFuIDEgY2hhcmFjdGVyIGxvbmcsIGFuZCBubyBncmVhdGVyIHRoYW4gNjMgY2hhcmFjdGVycyBsb25nIGR1ZSB0byBETlMgc3lzdGVtIGxpbWl0YXRpb25zLlxuICAgICAqIGh0dHBzOi8va3ViZXJuZXRlcy5pby9kb2NzL2NvbmNlcHRzL292ZXJ2aWV3L3dvcmtpbmctd2l0aC1vYmplY3RzL25hbWVzL1xuICAgICAqL1xuICAgIGlkID0gbmV3IHV0aWxzLlN0cmluZ0NvbnN0cmFpbnQoMSwgNjMpO1xuXG4gICAgLyoqXG4gICAgKiBub2RlcyBwZXIgbm9kZSBncm91cCBoYXMgYSBzb2Z0IGxpbWl0IG9mIDQ1MCBub2RlcywgYW5kIGFzIGxpdHRsZSBhcyAwLiBCdXQgd2UgbXVsdGlwbHkgdGhhdCBieSBhIGZhY3RvciBvZiA1IHRvIDIyNTAgaW4gY2FzZVxuICAgICogb2Ygc2l0dWF0aW9ucyBvZiBhIGhhcmQgbGltaXQgcmVxdWVzdCBiZWluZyBhY2NlcHRlZCwgYW5kIGFzIGEgcmVzdWx0IHRoZSBsaW1pdCB3b3VsZCBiZSByYWlzZWRcbiAgICAqIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9la3MvbGF0ZXN0L3VzZXJndWlkZS9zZXJ2aWNlLXF1b3Rhcy5odG1sXG4gICAgKi9cbiAgICBtaW5TaXplID0gbmV3IHV0aWxzLk51bWJlckNvbnN0cmFpbnQoMCwgMjI1MCk7XG5cbiAgICAvKipcbiAgICAgKiBub2RlcyBwZXIgbm9kZSBncm91cCBoYXMgYSBzb2Z0IGxpbWl0IG9mIDQ1MCBub2RlcywgYW5kIGFzIGxpdHRsZSBhcyAwLiBCdXQgd2UgbXVsdGlwbHkgdGhhdCBieSBhIGZhY3RvciBvZiA1IHRvIDIyNTAgaW4gY2FzZVxuICAgICAqIG9mIHNpdHVhdGlvbnMgb2YgYSBoYXJkIGxpbWl0IHJlcXVlc3QgYmVpbmcgYWNjZXB0ZWQsIGFuZCBhcyBhIHJlc3VsdCB0aGUgbGltaXQgd291bGQgYmUgcmFpc2VkXG4gICAgICogaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2Vrcy9sYXRlc3QvdXNlcmd1aWRlL3NlcnZpY2UtcXVvdGFzLmh0bWxcbiAgICAgKi9cbiAgICBtYXhTaXplID0gbmV3IHV0aWxzLk51bWJlckNvbnN0cmFpbnQoMCwgMjI1MCk7XG5cbiAgICAvKipcbiAgICAgKiBOb2RlcyBwZXIgbm9kZSBncm91cCBoYXMgYSBzb2Z0IGxpbWl0IG9mIDQ1MCBub2RlcywgYW5kIGFzIGxpdHRsZSBhcyAwLiBCdXQgd2UgbXVsdGlwbHkgdGhhdCBieSBhIGZhY3RvciBvZiA1IHRvIDIyNTAgaW4gY2FzZVxuICAgICAqIG9mIHNpdHVhdGlvbnMgb2YgYSBoYXJkIGxpbWl0IHJlcXVlc3QgYmVpbmcgYWNjZXB0ZWQsIGFuZCBhcyBhIHJlc3VsdCB0aGUgbGltaXQgd291bGQgYmUgcmFpc2VkXG4gICAgICogaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2Vrcy9sYXRlc3QvdXNlcmd1aWRlL3NlcnZpY2UtcXVvdGFzLmh0bWxcbiAgICAgKi9cbiAgICBkZXNpcmVkU2l6ZSA9IG5ldyB1dGlscy5OdW1iZXJDb25zdHJhaW50KDAsIDIyNTApO1xuXG4gICAgLyoqXG4gICAgICogYW1pUmVsZWFzZVZlcnNpb24gY2FuIGJlIG5vIGxlc3MgdGhhbiAxIGNoYXJhY3RlciBsb25nLCBhbmQgbm8gZ3JlYXRlciB0aGFuIDEwMjQgY2hhcmFjdGVycyBsb25nLlxuICAgICAqIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9pbWFnZWJ1aWxkZXIvbGF0ZXN0L0FQSVJlZmVyZW5jZS9BUElfQW1pLmh0bWxcbiAgICAgKi9cbiAgICBhbWlSZWxlYXNlVmVyc2lvbiA9IG5ldyB1dGlscy5TdHJpbmdDb25zdHJhaW50KDEsIDEwMjQpO1xufVxuXG5leHBvcnQgY2xhc3MgQXV0b3NjYWxpbmdOb2RlR3JvdXBDb25zdHJhaW50cyBpbXBsZW1lbnRzIHV0aWxzLkNvbnN0cmFpbnRzVHlwZTxBdXRvc2NhbGluZ05vZGVHcm91cD4ge1xuICAgIC8qKlxuICAgICogaWQgY2FuIGJlIG5vIGxlc3MgdGhhbiAxIGNoYXJhY3RlciBsb25nLCBhbmQgbm8gZ3JlYXRlciB0aGFuIDYzIGNoYXJhY3RlcnMgbG9uZyBkdWUgdG8gRE5TIHN5c3RlbSBsaW1pdGF0aW9ucy5cbiAgICAqIGh0dHBzOi8va3ViZXJuZXRlcy5pby9kb2NzL2NvbmNlcHRzL292ZXJ2aWV3L3dvcmtpbmctd2l0aC1vYmplY3RzL25hbWVzL1xuICAgICovXG4gICAgaWQgPSBuZXcgdXRpbHMuU3RyaW5nQ29uc3RyYWludCgxLCA2Myk7XG5cbiAgICAvKipcbiAgICAqIEFsbG93ZWQgcmFuZ2UgaXMgMCB0byA1MDAwIGluY2x1c2l2ZS5cbiAgICAqIGh0dHBzOi8va3ViZXJuZXRlcy5pby9kb2NzL3NldHVwL2Jlc3QtcHJhY3RpY2VzL2NsdXN0ZXItbGFyZ2UvXG4gICAgKi9cbiAgICBtaW5TaXplID0gbmV3IHV0aWxzLk51bWJlckNvbnN0cmFpbnQoMCwgNTAwMCk7XG5cbiAgICAvKipcbiAgICAqIEFsbG93ZWQgcmFuZ2UgaXMgMCB0byA1MDAwIGluY2x1c2l2ZS5cbiAgICAqIGh0dHBzOi8va3ViZXJuZXRlcy5pby9kb2NzL3NldHVwL2Jlc3QtcHJhY3RpY2VzL2NsdXN0ZXItbGFyZ2UvXG4gICAgKi9cbiAgICBtYXhTaXplID0gbmV3IHV0aWxzLk51bWJlckNvbnN0cmFpbnQoMCwgNTAwMCk7XG5cbiAgICAvKipcbiAgICAqIEFsbG93ZWQgcmFuZ2UgaXMgMCB0byA1MDAwIGluY2x1c2l2ZS5cbiAgICAqIGh0dHBzOi8va3ViZXJuZXRlcy5pby9kb2NzL3NldHVwL2Jlc3QtcHJhY3RpY2VzL2NsdXN0ZXItbGFyZ2UvXG4gICAgKi9cbiAgICBkZXNpcmVkU2l6ZSA9IG5ldyB1dGlscy5OdW1iZXJDb25zdHJhaW50KDAsIDUwMDApO1xufVxuXG5leHBvcnQgY2xhc3MgRmFyZ2F0ZVByb2ZpbGVDb25zdHJhaW50cyBpbXBsZW1lbnRzIHV0aWxzLkNvbnN0cmFpbnRzVHlwZTxla3MuRmFyZ2F0ZVByb2ZpbGVPcHRpb25zPiB7XG4gICAgLyoqXG4gICAgKiBmYXJnYXRlUHJvZmlsZU5hbWVzIGNhbiBiZSBubyBsZXNzIHRoYW4gMSBjaGFyYWN0ZXIgbG9uZywgYW5kIG5vIGdyZWF0ZXIgdGhhbiA2MyBjaGFyYWN0ZXJzIGxvbmcgZHVlIHRvIEROUyBzeXN0ZW0gbGltaXRhdGlvbnMuXG4gICAgKiBodHRwczovL2t1YmVybmV0ZXMuaW8vZG9jcy9jb25jZXB0cy9vdmVydmlldy93b3JraW5nLXdpdGgtb2JqZWN0cy9uYW1lcy9cbiAgICAqL1xuICAgIGZhcmdhdGVQcm9maWxlTmFtZSA9IG5ldyB1dGlscy5TdHJpbmdDb25zdHJhaW50KDEsIDYzKTtcbn1cblxuZXhwb3J0IGNsYXNzIEdlbmVyaWNDbHVzdGVyUHJvcHNDb25zdHJhaW50cyBpbXBsZW1lbnRzIHV0aWxzLkNvbnN0cmFpbnRzVHlwZTxHZW5lcmljQ2x1c3RlclByb3ZpZGVyUHJvcHM+IHtcbiAgICAvKipcbiAgICAqIG1hbmFnZWROb2RlR3JvdXBzIHBlciBjbHVzdGVyIGhhdmUgYSBzb2Z0IGxpbWl0IG9mIDMwIG1hbmFnZWQgbm9kZSBncm91cHMgcGVyIEVLUyBjbHVzdGVyLCBhbmQgYXMgbGl0dGxlIGFzIDAuIEJ1dCB3ZSBtdWx0aXBseSB0aGF0XG4gICAgKiBieSBhIGZhY3RvciBvZiA1IHRvIDE1MCBpbiBjYXNlIG9mIHNpdHVhdGlvbnMgb2YgYSBoYXJkIGxpbWl0IHJlcXVlc3QgYmVpbmcgYWNjZXB0ZWQsIGFuZCBhcyBhIHJlc3VsdCB0aGUgbGltaXQgd291bGQgYmUgcmFpc2VkLlxuICAgICogaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2Vrcy9sYXRlc3QvdXNlcmd1aWRlL3NlcnZpY2UtcXVvdGFzLmh0bWxcbiAgICAqL1xuICAgIG1hbmFnZWROb2RlR3JvdXBzID0gbmV3IHV0aWxzLkFycmF5Q29uc3RyYWludCgwLCAxNTApO1xuICAgIC8qKlxuICAgICogYXV0b3NjYWxpbmdOb2RlR3JvdXBzIHBlciBjbHVzdGVyIGhhdmUgYSBzb2Z0IGxpbWl0IG9mIDUwMCBhdXRvc2NhbGluZyBub2RlIGdyb3VwcyBwZXIgRUtTIGNsdXN0ZXIsIGFuZCBhcyBsaXR0bGUgYXMgMC4gQnV0IHdlIG11bHRpcGx5IHRoYXRcbiAgICAqIGJ5IGEgZmFjdG9yIG9mIDUgdG8gMjUwMCBpbiBjYXNlIG9mIHNpdHVhdGlvbnMgb2YgYSBoYXJkIGxpbWl0IHJlcXVlc3QgYmVpbmcgYWNjZXB0ZWQsIGFuZCBhcyBhIHJlc3VsdCB0aGUgbGltaXQgd291bGQgYmUgcmFpc2VkLlxuICAgICogaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2F1dG9zY2FsaW5nL2VjMi91c2VyZ3VpZGUvZWMyLWF1dG8tc2NhbGluZy1xdW90YXMuaHRtbFxuICAgICovXG4gICAgYXV0b3NjYWxpbmdOb2RlR3JvdXBzID0gbmV3IHV0aWxzLkFycmF5Q29uc3RyYWludCgwLCA1MDAwKTtcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xufTtcblxuZXhwb3J0IGNsYXNzIENsdXN0ZXJCdWlsZGVyIHtcblxuICAgIHByaXZhdGUgcHJvcHM6IFBhcnRpYWw8R2VuZXJpY0NsdXN0ZXJQcm92aWRlclByb3BzPiA9IHt9O1xuICAgIHByaXZhdGUgcHJpdmF0ZUNsdXN0ZXIgPSBmYWxzZTtcbiAgICBwcml2YXRlIG1hbmFnZWROb2RlR3JvdXBzOiBNYW5hZ2VkTm9kZUdyb3VwW10gPSBbXTtcbiAgICBwcml2YXRlIGF1dG9zY2FsaW5nTm9kZUdyb3VwczogQXV0b3NjYWxpbmdOb2RlR3JvdXBbXSA9IFtdO1xuICAgIHByaXZhdGUgZmFyZ2F0ZVByb2ZpbGVzOiB7XG4gICAgICAgIFtrZXk6IHN0cmluZ106IGVrcy5GYXJnYXRlUHJvZmlsZU9wdGlvbnM7XG4gICAgfSA9IHt9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMgfTtcbiAgICB9XG5cbiAgICB3aXRoQ29tbW9uT3B0aW9ucyhvcHRpb25zOiBQYXJ0aWFsPGVrcy5DbHVzdGVyT3B0aW9ucz4pOiB0aGlzIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4ub3B0aW9ucyB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtYW5hZ2VkTm9kZUdyb3VwKC4uLm5vZGVHcm91cHM6IE1hbmFnZWROb2RlR3JvdXBbXSk6IHRoaXMge1xuICAgICAgICB0aGlzLm1hbmFnZWROb2RlR3JvdXBzID0gdGhpcy5tYW5hZ2VkTm9kZUdyb3Vwcy5jb25jYXQobm9kZUdyb3Vwcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGF1dG9zY2FsaW5nR3JvdXAoLi4ubm9kZUdyb3VwczogQXV0b3NjYWxpbmdOb2RlR3JvdXBbXSk6IHRoaXMge1xuICAgICAgICB0aGlzLmF1dG9zY2FsaW5nTm9kZUdyb3VwcyA9IHRoaXMuYXV0b3NjYWxpbmdOb2RlR3JvdXBzLmNvbmNhdChub2RlR3JvdXBzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZmFyZ2F0ZVByb2ZpbGUobmFtZTogc3RyaW5nLCBvcHRpb25zOiBla3MuRmFyZ2F0ZVByb2ZpbGVPcHRpb25zKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZmFyZ2F0ZVByb2ZpbGVzW25hbWVdID0gb3B0aW9ucztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdmVyc2lvbih2ZXJzaW9uOiBla3MuS3ViZXJuZXRlc1ZlcnNpb24pOiB0aGlzIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgdmVyc2lvbiB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBidWlsZCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBHZW5lcmljQ2x1c3RlclByb3ZpZGVyKHtcbiAgICAgICAgICAgIC4uLnRoaXMucHJvcHMsXG4gICAgICAgICAgICBwcml2YXRlQ2x1c3RlcjogdGhpcy5wcml2YXRlQ2x1c3RlcixcbiAgICAgICAgICAgIG1hbmFnZWROb2RlR3JvdXBzOiB0aGlzLm1hbmFnZWROb2RlR3JvdXBzLFxuICAgICAgICAgICAgYXV0b3NjYWxpbmdOb2RlR3JvdXBzOiB0aGlzLmF1dG9zY2FsaW5nTm9kZUdyb3VwcyxcbiAgICAgICAgICAgIGZhcmdhdGVQcm9maWxlczogdGhpcy5mYXJnYXRlUHJvZmlsZXNcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIENsdXN0ZXIgcHJvdmlkZXIgaW1wbGVtZW50YXRpb24gdGhhdCBzdXBwb3J0cyBtdWx0aXBsZSBub2RlIGdyb3Vwcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEdlbmVyaWNDbHVzdGVyUHJvdmlkZXIgaW1wbGVtZW50cyBDbHVzdGVyUHJvdmlkZXIge1xuXG4gICAgY29uc3RydWN0b3IocmVhZG9ubHkgcHJvcHM6IEdlbmVyaWNDbHVzdGVyUHJvdmlkZXJQcm9wcykge1xuXG4gICAgICAgIHRoaXMudmFsaWRhdGVJbnB1dChwcm9wcyk7XG5cbiAgICAgICAgYXNzZXJ0KCEocHJvcHMubWFuYWdlZE5vZGVHcm91cHMgJiYgcHJvcHMubWFuYWdlZE5vZGVHcm91cHMubGVuZ3RoID4gMFxuICAgICAgICAgICAgJiYgcHJvcHMuYXV0b3NjYWxpbmdOb2RlR3JvdXBzICYmIHByb3BzLmF1dG9zY2FsaW5nTm9kZUdyb3Vwcy5sZW5ndGggPiAwKSxcbiAgICAgICAgICAgIFwiTWl4aW5nIG1hbmFnZWQgYW5kIGF1dG9zY2FsaW5nIG5vZGUgZ3JvdXBzIGlzIG5vdCBzdXBwb3J0ZWQuIFBsZWFzZSBmaWxlIGEgcmVxdWVzdCBvbiBHaXRIdWIgdG8gYWRkIHRoaXMgc3VwcG9ydCBpZiBuZWVkZWQuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGNyZWF0ZUNsdXN0ZXIoc2NvcGU6IENvbnN0cnVjdCwgdnBjOiBlYzIuSVZwYywgc2VjcmV0c0VuY3J5cHRpb25LZXk/OiBJS2V5LCBrdWJlcm5ldGVzVmVyc2lvbj86IGVrcy5LdWJlcm5ldGVzVmVyc2lvbiwgY2x1c3RlckxvZ2dpbmc/OiBla3MuQ2x1c3RlckxvZ2dpbmdUeXBlc1tdKSA6IENsdXN0ZXJJbmZvIHtcbiAgICAgICAgY29uc3QgaWQgPSBzY29wZS5ub2RlLmlkO1xuXG4gICAgICAgIC8vIFByb3BzIGZvciB0aGUgY2x1c3Rlci5cbiAgICAgICAgY29uc3QgY2x1c3Rlck5hbWUgPSB0aGlzLnByb3BzLmNsdXN0ZXJOYW1lID8/IGlkO1xuICAgICAgICBjb25zdCBvdXRwdXRDbHVzdGVyTmFtZSA9IHRydWU7XG4gICAgICAgIGlmKCFrdWJlcm5ldGVzVmVyc2lvbiAmJiAhdGhpcy5wcm9wcy52ZXJzaW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWZXJzaW9uIHdhcyBub3Qgc3BlY2lmaWVkIGJ5IGNsdXN0ZXIgYnVpbGRlciBvciBpbiBjbHVzdGVyIHByb3ZpZGVyIHByb3BzLCBtdXN0IGJlIHNwZWNpZmllZCBpbiBvbmUgb2YgdGhlc2VcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmVyc2lvbjogZWtzLkt1YmVybmV0ZXNWZXJzaW9uID0ga3ViZXJuZXRlc1ZlcnNpb24gfHwgdGhpcy5wcm9wcy52ZXJzaW9uIHx8IGVrcy5LdWJlcm5ldGVzVmVyc2lvbi5WMV8zMDtcblxuICAgICAgICBjb25zdCBwcml2YXRlQ2x1c3RlciA9IHRoaXMucHJvcHMucHJpdmF0ZUNsdXN0ZXIgPz8gdXRpbHMudmFsdWVGcm9tQ29udGV4dChzY29wZSwgY29uc3RhbnRzLlBSSVZBVEVfQ0xVU1RFUiwgZmFsc2UpO1xuICAgICAgICBjb25zdCBlbmRwb2ludEFjY2VzcyA9IChwcml2YXRlQ2x1c3RlciA9PT0gdHJ1ZSkgPyBla3MuRW5kcG9pbnRBY2Nlc3MuUFJJVkFURSA6IGVrcy5FbmRwb2ludEFjY2Vzcy5QVUJMSUNfQU5EX1BSSVZBVEU7XG4gICAgICAgIGNvbnN0IHZwY1N1Ym5ldHMgPSB0aGlzLnByb3BzLnZwY1N1Ym5ldHMgPz8gKHByaXZhdGVDbHVzdGVyID09PSB0cnVlID8gW3sgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFJJVkFURV9XSVRIX0VHUkVTUyB9XSA6IHVuZGVmaW5lZCk7XG4gICAgICAgIGNvbnN0IG1hc3RlcnNSb2xlID0gdGhpcy5wcm9wcy5tYXN0ZXJzUm9sZSA/PyBuZXcgUm9sZShzY29wZSwgYCR7Y2x1c3Rlck5hbWV9LUFjY2Vzc1JvbGVgLCB7XG4gICAgICAgICAgICBhc3N1bWVkQnk6IG5ldyBBY2NvdW50Um9vdFByaW5jaXBhbCgpIFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBrdWJlY3RsTGF5ZXIgPSB0aGlzLmdldEt1YmVjdGxMYXllcihzY29wZSwgdmVyc2lvbik7XG4gICAgICAgIGNvbnN0IHRhZ3MgPSB0aGlzLnByb3BzLnRhZ3M7XG5cbiAgICAgICAgY29uc3QgZGVmYXVsdE9wdGlvbnM6IFBhcnRpYWw8ZWtzLkNsdXN0ZXJQcm9wcz4gPSB7XG4gICAgICAgICAgICB2cGMsXG4gICAgICAgICAgICBzZWNyZXRzRW5jcnlwdGlvbktleSxcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lLFxuICAgICAgICAgICAgY2x1c3RlckxvZ2dpbmcsXG4gICAgICAgICAgICBvdXRwdXRDbHVzdGVyTmFtZSxcbiAgICAgICAgICAgIHZlcnNpb24sXG4gICAgICAgICAgICB2cGNTdWJuZXRzLFxuICAgICAgICAgICAgZW5kcG9pbnRBY2Nlc3MsXG4gICAgICAgICAgICBrdWJlY3RsTGF5ZXIsXG4gICAgICAgICAgICB0YWdzLFxuICAgICAgICAgICAgbWFzdGVyc1JvbGUsXG4gICAgICAgICAgICBkZWZhdWx0Q2FwYWNpdHk6IDAgLy8gd2Ugd2FudCB0byBtYW5hZ2UgY2FwYWNpdHkgb3Vyc2VsdmVzXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgY2x1c3Rlck9wdGlvbnMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCAuLi50aGlzLnByb3BzLCB2ZXJzaW9uIH07XG4gICAgICAgIC8vIENyZWF0ZSBhbiBFS1MgQ2x1c3RlclxuICAgICAgICBjb25zdCBjbHVzdGVyID0gdGhpcy5pbnRlcm5hbENyZWF0ZUNsdXN0ZXIoc2NvcGUsIGlkLCBjbHVzdGVyT3B0aW9ucyk7XG4gICAgICAgIGNsdXN0ZXIubm9kZS5hZGREZXBlbmRlbmN5KHZwYyk7XG5cbiAgICAgICAgY29uc3Qgbm9kZUdyb3VwczogZWtzLk5vZGVncm91cFtdID0gW107XG5cbiAgICAgICAgdGhpcy5wcm9wcy5tYW5hZ2VkTm9kZUdyb3Vwcz8uZm9yRWFjaChuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVHcm91cCA9IHRoaXMuYWRkTWFuYWdlZE5vZGVHcm91cChjbHVzdGVyLCBuKTtcbiAgICAgICAgICAgIG5vZGVHcm91cHMucHVzaChub2RlR3JvdXApO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBhdXRvc2NhbGluZ0dyb3VwczogYXV0b3NjYWxpbmcuQXV0b1NjYWxpbmdHcm91cFtdID0gW107XG4gICAgICAgIHRoaXMucHJvcHMuYXV0b3NjYWxpbmdOb2RlR3JvdXBzPy5mb3JFYWNoKG4gPT4ge1xuICAgICAgICAgICAgY29uc3QgYXV0b3NjYWxpbmdHcm91cCA9IHRoaXMuYWRkQXV0b1NjYWxpbmdHcm91cChjbHVzdGVyLCBuKTtcbiAgICAgICAgICAgIGF1dG9zY2FsaW5nR3JvdXBzLnB1c2goYXV0b3NjYWxpbmdHcm91cCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGZhcmdhdGVQcm9maWxlcyA9IE9iamVjdC5lbnRyaWVzKHRoaXMucHJvcHMuZmFyZ2F0ZVByb2ZpbGVzID8/IHt9KTtcbiAgICAgICAgY29uc3QgZmFyZ2F0ZUNvbnN0cnVjdHMgOiBla3MuRmFyZ2F0ZVByb2ZpbGVbXSA9IFtdO1xuICAgICAgICBmYXJnYXRlUHJvZmlsZXM/LmZvckVhY2goKFtrZXksIG9wdGlvbnNdKSA9PiBmYXJnYXRlQ29uc3RydWN0cy5wdXNoKHRoaXMuYWRkRmFyZ2F0ZVByb2ZpbGUoY2x1c3Rlciwga2V5LCBvcHRpb25zKSkpO1xuXG4gICAgICAgIHJldHVybiBuZXcgQ2x1c3RlckluZm8oY2x1c3RlciwgdmVyc2lvbiwgbm9kZUdyb3VwcywgYXV0b3NjYWxpbmdHcm91cHMsIGZhcmdhdGVDb25zdHJ1Y3RzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUZW1wbGF0ZSBtZXRob2QgdGhhdCBtYXkgYmUgb3ZlcnJpZGRlbiBieSBzdWJjbGFzc2VzIHRvIGNyZWF0ZSBhIHNwZWNpZmljIGNsdXN0ZXIgZmxhdm9yIChlLmcuIEZhcmdhdGVDbHVzdGVyIHZzIGVrcy5DbHVzdGVyKVxuICAgICAqIEBwYXJhbSBzY29wZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEBwYXJhbSBjbHVzdGVyT3B0aW9uc1xuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGludGVybmFsQ3JlYXRlQ2x1c3RlcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBjbHVzdGVyT3B0aW9uczogYW55KTogZWtzLkNsdXN0ZXIge1xuICAgICAgICByZXR1cm4gbmV3IGVrcy5DbHVzdGVyKHNjb3BlLCBpZCwgY2x1c3Rlck9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbiBiZSBvdmVycmlkZGVuIHRvIHByb3ZpZGUgYSBjdXN0b20ga3ViZWN0bCBsYXllci4gXG4gICAgICogQHBhcmFtIHNjb3BlIFxuICAgICAqIEBwYXJhbSB2ZXJzaW9uIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRLdWJlY3RsTGF5ZXIoc2NvcGU6IENvbnN0cnVjdCwgdmVyc2lvbjogZWtzLkt1YmVybmV0ZXNWZXJzaW9uKSA6IElMYXllclZlcnNpb24gfCB1bmRlZmluZWQge1xuICAgICAgIHJldHVybiBzZWxlY3RLdWJlY3RsTGF5ZXIoc2NvcGUsIHZlcnNpb24pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gYXV0b3NjYWxpbmcgZ3JvdXAgdG8gdGhlIGNsdXN0ZXIuXG4gICAgICogQHBhcmFtIGNsdXN0ZXJcbiAgICAgKiBAcGFyYW0gbm9kZUdyb3VwXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBhZGRBdXRvU2NhbGluZ0dyb3VwKGNsdXN0ZXI6IGVrcy5DbHVzdGVyLCBub2RlR3JvdXA6IEF1dG9zY2FsaW5nTm9kZUdyb3VwKTogYXV0b3NjYWxpbmcuQXV0b1NjYWxpbmdHcm91cCB7XG4gICAgICAgIGNvbnN0IG1hY2hpbmVJbWFnZVR5cGUgPSBub2RlR3JvdXAubWFjaGluZUltYWdlVHlwZSA/PyBla3MuTWFjaGluZUltYWdlVHlwZS5BTUFaT05fTElOVVhfMjtcbiAgICAgICAgY29uc3QgaW5zdGFuY2VUeXBlQ29udGV4dCA9IHV0aWxzLnZhbHVlRnJvbUNvbnRleHQoY2x1c3RlciwgY29uc3RhbnRzLklOU1RBTkNFX1RZUEVfS0VZLCBjb25zdGFudHMuREVGQVVMVF9JTlNUQU5DRV9UWVBFKTtcbiAgICAgICAgY29uc3QgaW5zdGFuY2VUeXBlID0gbm9kZUdyb3VwLmluc3RhbmNlVHlwZSA/PyAodHlwZW9mIGluc3RhbmNlVHlwZUNvbnRleHQgPT09ICdzdHJpbmcnID8gbmV3IGVjMi5JbnN0YW5jZVR5cGUoaW5zdGFuY2VUeXBlQ29udGV4dCkgOiBpbnN0YW5jZVR5cGVDb250ZXh0KTtcbiAgICAgICAgY29uc3QgbWluU2l6ZSA9IG5vZGVHcm91cC5taW5TaXplID8/IHV0aWxzLnZhbHVlRnJvbUNvbnRleHQoY2x1c3RlciwgY29uc3RhbnRzLk1JTl9TSVpFX0tFWSwgY29uc3RhbnRzLkRFRkFVTFRfTkdfTUlOU0laRSk7XG4gICAgICAgIGNvbnN0IG1heFNpemUgPSBub2RlR3JvdXAubWF4U2l6ZSA/PyB1dGlscy52YWx1ZUZyb21Db250ZXh0KGNsdXN0ZXIsIGNvbnN0YW50cy5NQVhfU0laRV9LRVksIGNvbnN0YW50cy5ERUZBVUxUX05HX01BWFNJWkUpO1xuICAgICAgICBjb25zdCBkZXNpcmVkU2l6ZSA9IG5vZGVHcm91cC5kZXNpcmVkU2l6ZSA/PyB1dGlscy52YWx1ZUZyb21Db250ZXh0KGNsdXN0ZXIsIGNvbnN0YW50cy5ERVNJUkVEX1NJWkVfS0VZLCBtaW5TaXplKTtcbiAgICAgICAgY29uc3QgdXBkYXRlUG9saWN5ID0gbm9kZUdyb3VwLnVwZGF0ZVBvbGljeSA/PyBhdXRvc2NhbGluZy5VcGRhdGVQb2xpY3kucm9sbGluZ1VwZGF0ZSgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbiBhdXRvc2NhbGluZyBncm91cFxuICAgICAgICByZXR1cm4gY2x1c3Rlci5hZGRBdXRvU2NhbGluZ0dyb3VwQ2FwYWNpdHkobm9kZUdyb3VwLmlkLCB7XG4gICAgICAgICAgICAuLi5ub2RlR3JvdXAsXG4gICAgICAgICAgICAuLi4ge1xuICAgICAgICAgICAgICAgIGF1dG9TY2FsaW5nR3JvdXBOYW1lOiBub2RlR3JvdXAuYXV0b1NjYWxpbmdHcm91cE5hbWUgPz8gbm9kZUdyb3VwLmlkLFxuICAgICAgICAgICAgICAgIG1hY2hpbmVJbWFnZVR5cGUsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VUeXBlLFxuICAgICAgICAgICAgICAgIG1pbkNhcGFjaXR5OiBtaW5TaXplLFxuICAgICAgICAgICAgICAgIG1heENhcGFjaXR5OiBtYXhTaXplLFxuICAgICAgICAgICAgICAgIGRlc2lyZWRDYXBhY2l0eTogZGVzaXJlZFNpemUsXG4gICAgICAgICAgICAgICAgdXBkYXRlUG9saWN5LFxuICAgICAgICAgICAgICAgIHZwY1N1Ym5ldHM6IG5vZGVHcm91cC5ub2RlR3JvdXBTdWJuZXRzLFxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgZmFyZ2F0ZSBwcm9maWxlIHRvIHRoZSBjbHVzdGVyXG4gICAgICovXG4gICAgYWRkRmFyZ2F0ZVByb2ZpbGUoY2x1c3RlcjogZWtzLkNsdXN0ZXIsIG5hbWU6IHN0cmluZywgcHJvZmlsZU9wdGlvbnM6IGVrcy5GYXJnYXRlUHJvZmlsZU9wdGlvbnMpOiBla3MuRmFyZ2F0ZVByb2ZpbGUge1xuICAgICAgICByZXR1cm4gY2x1c3Rlci5hZGRGYXJnYXRlUHJvZmlsZShuYW1lLCBwcm9maWxlT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIG1hbmFnZWQgbm9kZSBncm91cCB0byB0aGUgY2x1c3Rlci5cbiAgICAgKiBAcGFyYW0gY2x1c3RlclxuICAgICAqIEBwYXJhbSBub2RlR3JvdXBcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGFkZE1hbmFnZWROb2RlR3JvdXAoY2x1c3RlcjogZWtzLkNsdXN0ZXIsIG5vZGVHcm91cDogTWFuYWdlZE5vZGVHcm91cCk6IGVrcy5Ob2RlZ3JvdXAge1xuICAgICAgICBjb25zdCBjYXBhY2l0eVR5cGUgPSBub2RlR3JvdXAubm9kZUdyb3VwQ2FwYWNpdHlUeXBlO1xuICAgICAgICBjb25zdCByZWxlYXNlVmVyc2lvbiA9IG5vZGVHcm91cC5hbWlSZWxlYXNlVmVyc2lvbjtcbiAgICAgICAgY29uc3QgaW5zdGFuY2VUeXBlQ29udGV4dCA9IHV0aWxzLnZhbHVlRnJvbUNvbnRleHQoY2x1c3RlciwgY29uc3RhbnRzLklOU1RBTkNFX1RZUEVfS0VZLCBjb25zdGFudHMuREVGQVVMVF9JTlNUQU5DRV9UWVBFKTtcbiAgICAgICAgY29uc3QgaW5zdGFuY2VUeXBlcyA9IG5vZGVHcm91cC5pbnN0YW5jZVR5cGVzID8/IChbdHlwZW9mIGluc3RhbmNlVHlwZUNvbnRleHQgPT09ICdzdHJpbmcnID8gbmV3IGVjMi5JbnN0YW5jZVR5cGUoaW5zdGFuY2VUeXBlQ29udGV4dCkgOiBpbnN0YW5jZVR5cGVDb250ZXh0XSk7XG4gICAgICAgIGNvbnN0IG1pblNpemUgPSBub2RlR3JvdXAubWluU2l6ZSA/PyB1dGlscy52YWx1ZUZyb21Db250ZXh0KGNsdXN0ZXIsIGNvbnN0YW50cy5NSU5fU0laRV9LRVksIGNvbnN0YW50cy5ERUZBVUxUX05HX01JTlNJWkUpO1xuICAgICAgICBjb25zdCBtYXhTaXplID0gbm9kZUdyb3VwLm1heFNpemUgPz8gdXRpbHMudmFsdWVGcm9tQ29udGV4dChjbHVzdGVyLCBjb25zdGFudHMuTUFYX1NJWkVfS0VZLCBjb25zdGFudHMuREVGQVVMVF9OR19NQVhTSVpFKTtcbiAgICAgICAgY29uc3QgZGVzaXJlZFNpemUgPSBub2RlR3JvdXAuZGVzaXJlZFNpemUgPz8gdXRpbHMudmFsdWVGcm9tQ29udGV4dChjbHVzdGVyLCBjb25zdGFudHMuREVTSVJFRF9TSVpFX0tFWSwgbWluU2l6ZSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgbWFuYWdlZCBub2RlIGdyb3VwLlxuICAgICAgICBjb25zdCBub2RlZ3JvdXBPcHRpb25zOiB1dGlscy5Xcml0ZWFibGU8ZWtzLk5vZGVncm91cE9wdGlvbnM+ID0ge1xuICAgICAgICAgICAgLi4ubm9kZUdyb3VwLFxuICAgICAgICAgICAgLi4ue1xuICAgICAgICAgICAgICAgIG5vZGVncm91cE5hbWU6IG5vZGVHcm91cC5ub2RlZ3JvdXBOYW1lID8/IG5vZGVHcm91cC5pZCxcbiAgICAgICAgICAgICAgICBjYXBhY2l0eVR5cGUsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2VUeXBlcyxcbiAgICAgICAgICAgICAgICBtaW5TaXplLFxuICAgICAgICAgICAgICAgIG1heFNpemUsXG4gICAgICAgICAgICAgICAgZGVzaXJlZFNpemUsXG4gICAgICAgICAgICAgICAgcmVsZWFzZVZlcnNpb24sXG4gICAgICAgICAgICAgICAgc3VibmV0czogbm9kZUdyb3VwLm5vZGVHcm91cFN1Ym5ldHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAobm9kZUdyb3VwLmxhdW5jaFRlbXBsYXRlKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgbGF1bmNoIHRlbXBsYXRlIHdpdGggcHJvdmlkZWQgbGF1bmNoIHRlbXBsYXRlIHByb3BlcnRpZXNcbiAgICAgICAgICAgIGNvbnN0IGx0ID0gbmV3IGVjMi5MYXVuY2hUZW1wbGF0ZShjbHVzdGVyLCBgJHtub2RlR3JvdXAuaWR9LWx0YCwge1xuICAgICAgICAgICAgICAgIGJsb2NrRGV2aWNlczogbm9kZUdyb3VwLmxhdW5jaFRlbXBsYXRlLmJsb2NrRGV2aWNlcyxcbiAgICAgICAgICAgICAgICBtYWNoaW5lSW1hZ2U6IG5vZGVHcm91cC5sYXVuY2hUZW1wbGF0ZT8ubWFjaGluZUltYWdlLFxuICAgICAgICAgICAgICAgIHNlY3VyaXR5R3JvdXA6IG5vZGVHcm91cC5sYXVuY2hUZW1wbGF0ZS5zZWN1cml0eUdyb3VwLFxuICAgICAgICAgICAgICAgIHVzZXJEYXRhOiBub2RlR3JvdXAubGF1bmNoVGVtcGxhdGU/LnVzZXJEYXRhLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVJbWRzdjI6IG5vZGVHcm91cC5sYXVuY2hUZW1wbGF0ZT8ucmVxdWlyZUltZHN2MixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdXRpbHMuc2V0UGF0aChub2RlZ3JvdXBPcHRpb25zLCBcImxhdW5jaFRlbXBsYXRlU3BlY1wiLCB7XG4gICAgICAgICAgICAgICAgaWQ6IGx0LmxhdW5jaFRlbXBsYXRlSWQhLFxuICAgICAgICAgICAgICAgIHZlcnNpb246IGx0LmxhdGVzdFZlcnNpb25OdW1iZXIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHRhZ3MgPSBPYmplY3QuZW50cmllcyhub2RlR3JvdXAubGF1bmNoVGVtcGxhdGUudGFncyA/PyB7fSk7XG4gICAgICAgICAgICB0YWdzLmZvckVhY2goKFtrZXksIG9wdGlvbnNdKSA9PiBUYWdzLm9mKGx0KS5hZGQoa2V5LG9wdGlvbnMpKTtcbiAgICAgICAgICAgIGlmIChub2RlR3JvdXAubGF1bmNoVGVtcGxhdGU/Lm1hY2hpbmVJbWFnZSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBub2RlZ3JvdXBPcHRpb25zLmFtaVR5cGU7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG5vZGVncm91cE9wdGlvbnMucmVsZWFzZVZlcnNpb247XG4gICAgICAgICAgICAgICAgZGVsZXRlIG5vZGVHcm91cC5hbWlSZWxlYXNlVmVyc2lvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGNsdXN0ZXIuYWRkTm9kZWdyb3VwQ2FwYWNpdHkobm9kZUdyb3VwLmlkICsgXCItbmdcIiwgbm9kZWdyb3VwT3B0aW9ucyk7XG5cbiAgICAgICAgaWYobm9kZUdyb3VwLmVuYWJsZVNzbVBlcm1pc3Npb25zKSB7XG4gICAgICAgICAgICByZXN1bHQucm9sZS5hZGRNYW5hZ2VkUG9saWN5KE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBbWF6b25TU01NYW5hZ2VkSW5zdGFuY2VDb3JlJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZhbGlkYXRlSW5wdXQocHJvcHM6IEdlbmVyaWNDbHVzdGVyUHJvdmlkZXJQcm9wcykge1xuXG4gICAgICAgIHV0aWxzLnZhbGlkYXRlQ29uc3RyYWludHMobmV3IEdlbmVyaWNDbHVzdGVyUHJvcHNDb25zdHJhaW50cywgR2VuZXJpY0NsdXN0ZXJQcm92aWRlci5uYW1lLCBwcm9wcyk7XG4gICAgICAgIGlmIChwcm9wcy5tYW5hZ2VkTm9kZUdyb3VwcyAhPSB1bmRlZmluZWQpXG4gICAgICAgICAgICB1dGlscy52YWxpZGF0ZUNvbnN0cmFpbnRzKG5ldyBNYW5hZ2VkTm9kZUdyb3VwQ29uc3RyYWludHMsIFwiTWFuYWdlZE5vZGVHcm91cFwiLCAuLi5wcm9wcy5tYW5hZ2VkTm9kZUdyb3Vwcyk7XG4gICAgICAgIGlmIChwcm9wcy5hdXRvc2NhbGluZ05vZGVHcm91cHMgIT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgdXRpbHMudmFsaWRhdGVDb25zdHJhaW50cyhuZXcgQXV0b3NjYWxpbmdOb2RlR3JvdXBDb25zdHJhaW50cywgXCJBdXRvc2NhbGluZ05vZGVHcm91cHNcIiwgLi4ucHJvcHMuYXV0b3NjYWxpbmdOb2RlR3JvdXBzKTtcbiAgICAgICAgaWYgKHByb3BzLmZhcmdhdGVQcm9maWxlcyBhcyBhbnkgIT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgdXRpbHMudmFsaWRhdGVDb25zdHJhaW50cyhuZXcgRmFyZ2F0ZVByb2ZpbGVDb25zdHJhaW50cywgXCJGYXJnYXRlUHJvZmlsZXNcIiwgLi4uT2JqZWN0LnZhbHVlcyhwcm9wcy5mYXJnYXRlUHJvZmlsZXMgYXMgYW55KSk7XG4gICAgfVxufVxuIl19