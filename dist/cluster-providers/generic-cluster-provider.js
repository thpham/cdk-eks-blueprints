"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericClusterProvider = exports.ClusterBuilder = exports.defaultOptions = exports.GenericClusterPropsConstraints = exports.FargateProfileConstraints = exports.AutoscalingNodeGroupConstraints = exports.ManagedNodeGroupConstraints = exports.selectKubectlLayer = exports.clusterBuilder = void 0;
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
exports.clusterBuilder = clusterBuilder;
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
exports.selectKubectlLayer = selectKubectlLayer;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJpYy1jbHVzdGVyLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NsdXN0ZXItcHJvdmlkZXJzL2dlbmVyaWMtY2x1c3Rlci1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxnRkFBb0U7QUFDcEUsZ0ZBQW9FO0FBQ3BFLGdGQUFvRTtBQUNwRSxnRkFBb0U7QUFDcEUsZ0ZBQW9FO0FBQ3BFLGdGQUFvRTtBQUNwRSxnRkFBb0U7QUFDcEUsZ0ZBQW9FO0FBRXBFLDZDQUFtQztBQUNuQywyREFBMkQ7QUFDM0QsMkNBQTJDO0FBQzNDLDJDQUEyQztBQUMzQyxpREFBZ0Y7QUFJaEYsZ0NBQXNEO0FBQ3RELGtDQUFrQztBQUNsQyx5Q0FBeUM7QUFFekMsaUNBQWtDO0FBRWxDLFNBQWdCLGNBQWM7SUFDMUIsT0FBTyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBQ2hDLENBQUM7QUFGRCx3Q0FFQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0Isa0JBQWtCLENBQUMsS0FBZ0IsRUFBRSxPQUE4QjtJQUMvRSxRQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNyQixLQUFLLE1BQU07WUFDUCxPQUFPLElBQUksMENBQWUsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN4RCxLQUFLLE1BQU07WUFDUCxPQUFPLElBQUksMENBQWUsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN4RCxLQUFLLE1BQU07WUFDUCxPQUFPLElBQUksMENBQWUsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN4RCxLQUFLLE1BQU07WUFDUCxPQUFPLElBQUksMENBQWUsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN4RCxLQUFLLE1BQU07WUFDUCxPQUFPLElBQUksMENBQWUsQ0FBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN4RCxLQUFLLE1B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RUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFFcEYsSUFBRyxTQUFTLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHVCQUFhLENBQUMsd0JBQXdCLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDO1FBQ3pHLENBQUM7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRU8sYUFBYSxDQUFDLEtBQWtDO1FBRXBELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLDhCQUE4QixFQUFFLHNCQUFzQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsRyxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsSUFBSSxTQUFTO1lBQ3BDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLDJCQUEyQixFQUFFLGtCQUFrQixFQUFFLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDL0csSUFBSSxLQUFLLENBQUMscUJBQXFCLElBQUksU0FBUztZQUN4QyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSwrQkFBK0IsRUFBRSx1QkFBdUIsRUFBRSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQzVILElBQUksS0FBSyxDQUFDLGVBQXNCLElBQUksU0FBUztZQUN6QyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSx5QkFBeUIsRUFBRSxpQkFBaUIsRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQXNCLENBQUMsQ0FBQyxDQUFDO0lBQ3BJLENBQUM7Q0FDSjtBQTdNRCx3REE2TUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7IEt1YmVjdGxWMjNMYXllciB9IGZyb20gXCJAYXdzLWNkay9sYW1iZGEtbGF5ZXIta3ViZWN0bC12MjNcIjtcbmltcG9ydCB7IEt1YmVjdGxWMjRMYXllciB9IGZyb20gXCJAYXdzLWNkay9sYW1iZGEtbGF5ZXIta3ViZWN0bC12MjRcIjtcbmltcG9ydCB7IEt1YmVjdGxWMjVMYXllciB9IGZyb20gXCJAYXdzLWNkay9sYW1iZGEtbGF5ZXIta3ViZWN0bC12MjVcIjtcbmltcG9ydCB7IEt1YmVjdGxWMjZMYXllciB9IGZyb20gXCJAYXdzLWNkay9sYW1iZGEtbGF5ZXIta3ViZWN0bC12MjZcIjtcbmltcG9ydCB7IEt1YmVjdGxWMjdMYXllciB9IGZyb20gXCJAYXdzLWNkay9sYW1iZGEtbGF5ZXIta3ViZWN0bC12MjdcIjtcbmltcG9ydCB7IEt1YmVjdGxWMjhMYXllciB9IGZyb20gXCJAYXdzLWNkay9sYW1iZGEtbGF5ZXIta3ViZWN0bC12MjhcIjtcbmltcG9ydCB7IEt1YmVjdGxWMjlMYXllciB9IGZyb20gXCJAYXdzLWNkay9sYW1iZGEtbGF5ZXIta3ViZWN0bC12MjlcIjtcbmltcG9ydCB7IEt1YmVjdGxWMzBMYXllciB9IGZyb20gXCJAYXdzLWNkay9sYW1iZGEtbGF5ZXIta3ViZWN0bC12MzBcIjtcblxuaW1wb3J0IHsgVGFncyB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgYXV0b3NjYWxpbmcgZnJvbSAnYXdzLWNkay1saWIvYXdzLWF1dG9zY2FsaW5nJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVjMlwiO1xuaW1wb3J0ICogYXMgZWtzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5pbXBvcnQgeyBBY2NvdW50Um9vdFByaW5jaXBhbCwgTWFuYWdlZFBvbGljeSwgUm9sZSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgeyBJS2V5IH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1rbXNcIjtcbmltcG9ydCB7IElMYXllclZlcnNpb24gfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IENsdXN0ZXJJbmZvLCBDbHVzdGVyUHJvdmlkZXIgfSBmcm9tIFwiLi4vc3BpXCI7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tIFwiLi4vdXRpbHNcIjtcbmltcG9ydCAqIGFzIGNvbnN0YW50cyBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBBdXRvc2NhbGluZ05vZGVHcm91cCwgTWFuYWdlZE5vZGVHcm91cCB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgYXNzZXJ0ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbHVzdGVyQnVpbGRlcigpIHtcbiAgICByZXR1cm4gbmV3IENsdXN0ZXJCdWlsZGVyKCk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBjb250YWlucyBsb2dpYyB0byBtYXAgdGhlIGNvcnJlY3Qga3VuYmVjdGwgbGF5ZXIgYmFzZWQgb24gdGhlIHBhc3NlZCBpbiB2ZXJzaW9uLiBcbiAqIEBwYXJhbSBzY29wZSBpbiB3aGNoIHRoZSBrdWJlY3RsIGxheWVyIG11c3QgYmUgY3JlYXRlZFxuICogQHBhcmFtIHZlcnNpb24gRUtTIHZlcnNpb25cbiAqIEByZXR1cm5zIElMYXllclZlcnNpb24gb3IgdW5kZWZpbmVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RLdWJlY3RsTGF5ZXIoc2NvcGU6IENvbnN0cnVjdCwgdmVyc2lvbjogZWtzLkt1YmVybmV0ZXNWZXJzaW9uKTogSUxheWVyVmVyc2lvbiB8IHVuZGVmaW5lZCB7XG4gICAgc3dpdGNoKHZlcnNpb24udmVyc2lvbikge1xuICAgICAgICBjYXNlIFwiMS4yM1wiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBLdWJlY3RsVjIzTGF5ZXIoc2NvcGUsIFwia3ViZWN0bGxheWVyMjNcIik7XG4gICAgICAgIGNhc2UgXCIxLjI0XCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEt1YmVjdGxWMjRMYXllcihzY29wZSwgXCJrdWJlY3RsbGF5ZXIyNFwiKTtcbiAgICAgICAgY2FzZSBcIjEuMjVcIjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgS3ViZWN0bFYyNUxheWVyKHNjb3BlLCBcImt1YmVjdGxsYXllcjI1XCIpO1xuICAgICAgICBjYXNlIFwiMS4yNlwiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBLdWJlY3RsVjI2TGF5ZXIoc2NvcGUsIFwia3ViZWN0bGxheWVyMjZcIik7XG4gICAgICAgIGNhc2UgXCIxLjI3XCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEt1YmVjdGxWMjdMYXllcihzY29wZSwgXCJrdWJlY3RsbGF5ZXIyN1wiKTtcbiAgICAgICAgY2FzZSBcIjEuMjhcIjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgS3ViZWN0bFYyOExheWVyKHNjb3BlLCBcImt1YmVjdGxsYXllcjI4XCIpO1xuICAgICAgICBjYXNlIFwiMS4yOVwiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBLdWJlY3RsVjI5TGF5ZXIoc2NvcGUsIFwia3ViZWN0bGxheWVyMjlcIik7XG4gICAgICAgIGNhc2UgXCIxLjMwXCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEt1YmVjdGxWMzBMYXllcihzY29wZSwgXCJrdWJlY3RsbGF5ZXIzMFwiKTtcbiAgICBcbiAgICB9XG4gICAgXG4gICAgY29uc3QgbWlub3IgPSB2ZXJzaW9uLnZlcnNpb24uc3BsaXQoJy4nKVsxXTtcblxuICAgIGlmKG1pbm9yICYmIHBhcnNlSW50KG1pbm9yLCAxMCkgPiAzMCkge1xuICAgICAgICByZXR1cm4gbmV3IEt1YmVjdGxWMzBMYXllcihzY29wZSwgXCJrdWJlY3RsbGF5ZXIzMFwiKTsgLy8gZm9yIGFsbCB2ZXJzaW9ucyBhYm92ZSAxLjMwIHVzZSAxLjMwIGt1YmVjdGwgKHVubGVzcyBleHBsaWNpdGx5IHN1cHBvcnRlZCBpbiBDREspXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG4vKipcbiAqIFByb3BlcnRpZXMgZm9yIHRoZSBnZW5lcmljIGNsdXN0ZXIgcHJvdmlkZXIsIGNvbnRhaW5pbmcgZGVmaW5pdGlvbnMgb2YgbWFuYWdlZCBub2RlIGdyb3VwcyxcbiAqIGF1dG8tc2NhbGluZyBncm91cHMsIGZhcmdhdGUgcHJvZmlsZXMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2VuZXJpY0NsdXN0ZXJQcm92aWRlclByb3BzIGV4dGVuZHMgUGFydGlhbDxla3MuQ2x1c3Rlck9wdGlvbnM+IHtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgQVBJIHNlcnZlciBpcyBwcml2YXRlLlxuICAgICAqL1xuICAgIHByaXZhdGVDbHVzdGVyPzogYm9vbGVhbixcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIG1hbmFnZWQgbm9kZSBncm91cHMuXG4gICAgICovXG4gICAgbWFuYWdlZE5vZGVHcm91cHM/OiBNYW5hZ2VkTm9kZUdyb3VwW107XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBhdXRvc2NhbGluZyBub2RlIGdyb3Vwcy5cbiAgICAgKi9cbiAgICBhdXRvc2NhbGluZ05vZGVHcm91cHM/OiBBdXRvc2NhbGluZ05vZGVHcm91cFtdO1xuXG4gICAgLyoqXG4gICAgICogRmFyZ2F0ZSBwcm9maWxlc1xuICAgICAqL1xuICAgIGZhcmdhdGVQcm9maWxlcz86IHtcbiAgICAgICAgW2tleTogc3RyaW5nXTogZWtzLkZhcmdhdGVQcm9maWxlT3B0aW9ucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUYWdzIGZvciB0aGUgY2x1c3RlclxuICAgICAqL1xuICAgIHRhZ3M/OiB7XG4gICAgICAgIFtrZXk6IHN0cmluZ106IHN0cmluZztcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNYW5hZ2VkTm9kZUdyb3VwQ29uc3RyYWludHMgaW1wbGVtZW50cyB1dGlscy5Db25zdHJhaW50c1R5cGU8TWFuYWdlZE5vZGVHcm91cD4ge1xuICAgIC8qKlxuICAgICAqIGlkIGNhbiBiZSBubyBsZXNzIHRoYW4gMSBjaGFyYWN0ZXIgbG9uZywgYW5kIG5vIGdyZWF0ZXIgdGhhbiA2MyBjaGFyYWN0ZXJzIGxvbmcgZHVlIHRvIEROUyBzeXN0ZW0gbGltaXRhdGlvbnMuXG4gICAgICogaHR0cHM6Ly9rdWJlcm5ldGVzLmlvL2RvY3MvY29uY2VwdHMvb3ZlcnZpZXcvd29ya2luZy13aXRoLW9iamVjdHMvbmFtZXMvXG4gICAgICovXG4gICAgaWQgPSBuZXcgdXRpbHMuU3RyaW5nQ29uc3RyYWludCgxLCA2Myk7XG5cbiAgICAvKipcbiAgICAqIG5vZGVzIHBlciBub2RlIGdyb3VwIGhhcyBhIHNvZnQgbGltaXQgb2YgNDUwIG5vZGVzLCBhbmQgYXMgbGl0dGxlIGFzIDAuIEJ1dCB3ZSBtdWx0aXBseSB0aGF0IGJ5IGEgZmFjdG9yIG9mIDUgdG8gMjI1MCBpbiBjYXNlXG4gICAgKiBvZiBzaXR1YXRpb25zIG9mIGEgaGFyZCBsaW1pdCByZXF1ZXN0IGJlaW5nIGFjY2VwdGVkLCBhbmQgYXMgYSByZXN1bHQgdGhlIGxpbWl0IHdvdWxkIGJlIHJhaXNlZFxuICAgICogaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2Vrcy9sYXRlc3QvdXNlcmd1aWRlL3NlcnZpY2UtcXVvdGFzLmh0bWxcbiAgICAqL1xuICAgIG1pblNpemUgPSBuZXcgdXRpbHMuTnVtYmVyQ29uc3RyYWludCgwLCAyMjUwKTtcblxuICAgIC8qKlxuICAgICAqIG5vZGVzIHBlciBub2RlIGdyb3VwIGhhcyBhIHNvZnQgbGltaXQgb2YgNDUwIG5vZGVzLCBhbmQgYXMgbGl0dGxlIGFzIDAuIEJ1dCB3ZSBtdWx0aXBseSB0aGF0IGJ5IGEgZmFjdG9yIG9mIDUgdG8gMjI1MCBpbiBjYXNlXG4gICAgICogb2Ygc2l0dWF0aW9ucyBvZiBhIGhhcmQgbGltaXQgcmVxdWVzdCBiZWluZyBhY2NlcHRlZCwgYW5kIGFzIGEgcmVzdWx0IHRoZSBsaW1pdCB3b3VsZCBiZSByYWlzZWRcbiAgICAgKiBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vZWtzL2xhdGVzdC91c2VyZ3VpZGUvc2VydmljZS1xdW90YXMuaHRtbFxuICAgICAqL1xuICAgIG1heFNpemUgPSBuZXcgdXRpbHMuTnVtYmVyQ29uc3RyYWludCgwLCAyMjUwKTtcblxuICAgIC8qKlxuICAgICAqIE5vZGVzIHBlciBub2RlIGdyb3VwIGhhcyBhIHNvZnQgbGltaXQgb2YgNDUwIG5vZGVzLCBhbmQgYXMgbGl0dGxlIGFzIDAuIEJ1dCB3ZSBtdWx0aXBseSB0aGF0IGJ5IGEgZmFjdG9yIG9mIDUgdG8gMjI1MCBpbiBjYXNlXG4gICAgICogb2Ygc2l0dWF0aW9ucyBvZiBhIGhhcmQgbGltaXQgcmVxdWVzdCBiZWluZyBhY2NlcHRlZCwgYW5kIGFzIGEgcmVzdWx0IHRoZSBsaW1pdCB3b3VsZCBiZSByYWlzZWRcbiAgICAgKiBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vZWtzL2xhdGVzdC91c2VyZ3VpZGUvc2VydmljZS1xdW90YXMuaHRtbFxuICAgICAqL1xuICAgIGRlc2lyZWRTaXplID0gbmV3IHV0aWxzLk51bWJlckNvbnN0cmFpbnQoMCwgMjI1MCk7XG5cbiAgICAvKipcbiAgICAgKiBhbWlSZWxlYXNlVmVyc2lvbiBjYW4gYmUgbm8gbGVzcyB0aGFuIDEgY2hhcmFjdGVyIGxvbmcsIGFuZCBubyBncmVhdGVyIHRoYW4gMTAyNCBjaGFyYWN0ZXJzIGxvbmcuXG4gICAgICogaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2ltYWdlYnVpbGRlci9sYXRlc3QvQVBJUmVmZXJlbmNlL0FQSV9BbWkuaHRtbFxuICAgICAqL1xuICAgIGFtaVJlbGVhc2VWZXJzaW9uID0gbmV3IHV0aWxzLlN0cmluZ0NvbnN0cmFpbnQoMSwgMTAyNCk7XG59XG5cbmV4cG9ydCBjbGFzcyBBdXRvc2NhbGluZ05vZGVHcm91cENvbnN0cmFpbnRzIGltcGxlbWVudHMgdXRpbHMuQ29uc3RyYWludHNUeXBlPEF1dG9zY2FsaW5nTm9kZUdyb3VwPiB7XG4gICAgLyoqXG4gICAgKiBpZCBjYW4gYmUgbm8gbGVzcyB0aGFuIDEgY2hhcmFjdGVyIGxvbmcsIGFuZCBubyBncmVhdGVyIHRoYW4gNjMgY2hhcmFjdGVycyBsb25nIGR1ZSB0byBETlMgc3lzdGVtIGxpbWl0YXRpb25zLlxuICAgICogaHR0cHM6Ly9rdWJlcm5ldGVzLmlvL2RvY3MvY29uY2VwdHMvb3ZlcnZpZXcvd29ya2luZy13aXRoLW9iamVjdHMvbmFtZXMvXG4gICAgKi9cbiAgICBpZCA9IG5ldyB1dGlscy5TdHJpbmdDb25zdHJhaW50KDEsIDYzKTtcblxuICAgIC8qKlxuICAgICogQWxsb3dlZCByYW5nZSBpcyAwIHRvIDUwMDAgaW5jbHVzaXZlLlxuICAgICogaHR0cHM6Ly9rdWJlcm5ldGVzLmlvL2RvY3Mvc2V0dXAvYmVzdC1wcmFjdGljZXMvY2x1c3Rlci1sYXJnZS9cbiAgICAqL1xuICAgIG1pblNpemUgPSBuZXcgdXRpbHMuTnVtYmVyQ29uc3RyYWludCgwLCA1MDAwKTtcblxuICAgIC8qKlxuICAgICogQWxsb3dlZCByYW5nZSBpcyAwIHRvIDUwMDAgaW5jbHVzaXZlLlxuICAgICogaHR0cHM6Ly9rdWJlcm5ldGVzLmlvL2RvY3Mvc2V0dXAvYmVzdC1wcmFjdGljZXMvY2x1c3Rlci1sYXJnZS9cbiAgICAqL1xuICAgIG1heFNpemUgPSBuZXcgdXRpbHMuTnVtYmVyQ29uc3RyYWludCgwLCA1MDAwKTtcblxuICAgIC8qKlxuICAgICogQWxsb3dlZCByYW5nZSBpcyAwIHRvIDUwMDAgaW5jbHVzaXZlLlxuICAgICogaHR0cHM6Ly9rdWJlcm5ldGVzLmlvL2RvY3Mvc2V0dXAvYmVzdC1wcmFjdGljZXMvY2x1c3Rlci1sYXJnZS9cbiAgICAqL1xuICAgIGRlc2lyZWRTaXplID0gbmV3IHV0aWxzLk51bWJlckNvbnN0cmFpbnQoMCwgNTAwMCk7XG59XG5cbmV4cG9ydCBjbGFzcyBGYXJnYXRlUHJvZmlsZUNvbnN0cmFpbnRzIGltcGxlbWVudHMgdXRpbHMuQ29uc3RyYWludHNUeXBlPGVrcy5GYXJnYXRlUHJvZmlsZU9wdGlvbnM+IHtcbiAgICAvKipcbiAgICAqIGZhcmdhdGVQcm9maWxlTmFtZXMgY2FuIGJlIG5vIGxlc3MgdGhhbiAxIGNoYXJhY3RlciBsb25nLCBhbmQgbm8gZ3JlYXRlciB0aGFuIDYzIGNoYXJhY3RlcnMgbG9uZyBkdWUgdG8gRE5TIHN5c3RlbSBsaW1pdGF0aW9ucy5cbiAgICAqIGh0dHBzOi8va3ViZXJuZXRlcy5pby9kb2NzL2NvbmNlcHRzL292ZXJ2aWV3L3dvcmtpbmctd2l0aC1vYmplY3RzL25hbWVzL1xuICAgICovXG4gICAgZmFyZ2F0ZVByb2ZpbGVOYW1lID0gbmV3IHV0aWxzLlN0cmluZ0NvbnN0cmFpbnQoMSwgNjMpO1xufVxuXG5leHBvcnQgY2xhc3MgR2VuZXJpY0NsdXN0ZXJQcm9wc0NvbnN0cmFpbnRzIGltcGxlbWVudHMgdXRpbHMuQ29uc3RyYWludHNUeXBlPEdlbmVyaWNDbHVzdGVyUHJvdmlkZXJQcm9wcz4ge1xuICAgIC8qKlxuICAgICogbWFuYWdlZE5vZGVHcm91cHMgcGVyIGNsdXN0ZXIgaGF2ZSBhIHNvZnQgbGltaXQgb2YgMzAgbWFuYWdlZCBub2RlIGdyb3VwcyBwZXIgRUtTIGNsdXN0ZXIsIGFuZCBhcyBsaXR0bGUgYXMgMC4gQnV0IHdlIG11bHRpcGx5IHRoYXRcbiAgICAqIGJ5IGEgZmFjdG9yIG9mIDUgdG8gMTUwIGluIGNhc2Ugb2Ygc2l0dWF0aW9ucyBvZiBhIGhhcmQgbGltaXQgcmVxdWVzdCBiZWluZyBhY2NlcHRlZCwgYW5kIGFzIGEgcmVzdWx0IHRoZSBsaW1pdCB3b3VsZCBiZSByYWlzZWQuXG4gICAgKiBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vZWtzL2xhdGVzdC91c2VyZ3VpZGUvc2VydmljZS1xdW90YXMuaHRtbFxuICAgICovXG4gICAgbWFuYWdlZE5vZGVHcm91cHMgPSBuZXcgdXRpbHMuQXJyYXlDb25zdHJhaW50KDAsIDE1MCk7XG4gICAgLyoqXG4gICAgKiBhdXRvc2NhbGluZ05vZGVHcm91cHMgcGVyIGNsdXN0ZXIgaGF2ZSBhIHNvZnQgbGltaXQgb2YgNTAwIGF1dG9zY2FsaW5nIG5vZGUgZ3JvdXBzIHBlciBFS1MgY2x1c3RlciwgYW5kIGFzIGxpdHRsZSBhcyAwLiBCdXQgd2UgbXVsdGlwbHkgdGhhdFxuICAgICogYnkgYSBmYWN0b3Igb2YgNSB0byAyNTAwIGluIGNhc2Ugb2Ygc2l0dWF0aW9ucyBvZiBhIGhhcmQgbGltaXQgcmVxdWVzdCBiZWluZyBhY2NlcHRlZCwgYW5kIGFzIGEgcmVzdWx0IHRoZSBsaW1pdCB3b3VsZCBiZSByYWlzZWQuXG4gICAgKiBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYXV0b3NjYWxpbmcvZWMyL3VzZXJndWlkZS9lYzItYXV0by1zY2FsaW5nLXF1b3Rhcy5odG1sXG4gICAgKi9cbiAgICBhdXRvc2NhbGluZ05vZGVHcm91cHMgPSBuZXcgdXRpbHMuQXJyYXlDb25zdHJhaW50KDAsIDUwMDApO1xufVxuXG5leHBvcnQgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG59O1xuXG5leHBvcnQgY2xhc3MgQ2x1c3RlckJ1aWxkZXIge1xuXG4gICAgcHJpdmF0ZSBwcm9wczogUGFydGlhbDxHZW5lcmljQ2x1c3RlclByb3ZpZGVyUHJvcHM+ID0ge307XG4gICAgcHJpdmF0ZSBwcml2YXRlQ2x1c3RlciA9IGZhbHNlO1xuICAgIHByaXZhdGUgbWFuYWdlZE5vZGVHcm91cHM6IE1hbmFnZWROb2RlR3JvdXBbXSA9IFtdO1xuICAgIHByaXZhdGUgYXV0b3NjYWxpbmdOb2RlR3JvdXBzOiBBdXRvc2NhbGluZ05vZGVHcm91cFtdID0gW107XG4gICAgcHJpdmF0ZSBmYXJnYXRlUHJvZmlsZXM6IHtcbiAgICAgICAgW2tleTogc3RyaW5nXTogZWtzLkZhcmdhdGVQcm9maWxlT3B0aW9ucztcbiAgICB9ID0ge307XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcyB9O1xuICAgIH1cblxuICAgIHdpdGhDb21tb25PcHRpb25zKG9wdGlvbnM6IFBhcnRpYWw8ZWtzLkNsdXN0ZXJPcHRpb25zPik6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi5vcHRpb25zIH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG1hbmFnZWROb2RlR3JvdXAoLi4ubm9kZUdyb3VwczogTWFuYWdlZE5vZGVHcm91cFtdKTogdGhpcyB7XG4gICAgICAgIHRoaXMubWFuYWdlZE5vZGVHcm91cHMgPSB0aGlzLm1hbmFnZWROb2RlR3JvdXBzLmNvbmNhdChub2RlR3JvdXBzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXV0b3NjYWxpbmdHcm91cCguLi5ub2RlR3JvdXBzOiBBdXRvc2NhbGluZ05vZGVHcm91cFtdKTogdGhpcyB7XG4gICAgICAgIHRoaXMuYXV0b3NjYWxpbmdOb2RlR3JvdXBzID0gdGhpcy5hdXRvc2NhbGluZ05vZGVHcm91cHMuY29uY2F0KG5vZGVHcm91cHMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmYXJnYXRlUHJvZmlsZShuYW1lOiBzdHJpbmcsIG9wdGlvbnM6IGVrcy5GYXJnYXRlUHJvZmlsZU9wdGlvbnMpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5mYXJnYXRlUHJvZmlsZXNbbmFtZV0gPSBvcHRpb25zO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB2ZXJzaW9uKHZlcnNpb246IGVrcy5LdWJlcm5ldGVzVmVyc2lvbik6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCB2ZXJzaW9uIH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGJ1aWxkKCkge1xuICAgICAgICByZXR1cm4gbmV3IEdlbmVyaWNDbHVzdGVyUHJvdmlkZXIoe1xuICAgICAgICAgICAgLi4udGhpcy5wcm9wcyxcbiAgICAgICAgICAgIHByaXZhdGVDbHVzdGVyOiB0aGlzLnByaXZhdGVDbHVzdGVyLFxuICAgICAgICAgICAgbWFuYWdlZE5vZGVHcm91cHM6IHRoaXMubWFuYWdlZE5vZGVHcm91cHMsXG4gICAgICAgICAgICBhdXRvc2NhbGluZ05vZGVHcm91cHM6IHRoaXMuYXV0b3NjYWxpbmdOb2RlR3JvdXBzLFxuICAgICAgICAgICAgZmFyZ2F0ZVByb2ZpbGVzOiB0aGlzLmZhcmdhdGVQcm9maWxlc1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogQ2x1c3RlciBwcm92aWRlciBpbXBsZW1lbnRhdGlvbiB0aGF0IHN1cHBvcnRzIG11bHRpcGxlIG5vZGUgZ3JvdXBzLlxuICovXG5leHBvcnQgY2xhc3MgR2VuZXJpY0NsdXN0ZXJQcm92aWRlciBpbXBsZW1lbnRzIENsdXN0ZXJQcm92aWRlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihyZWFkb25seSBwcm9wczogR2VuZXJpY0NsdXN0ZXJQcm92aWRlclByb3BzKSB7XG5cbiAgICAgICAgdGhpcy52YWxpZGF0ZUlucHV0KHByb3BzKTtcblxuICAgICAgICBhc3NlcnQoIShwcm9wcy5tYW5hZ2VkTm9kZUdyb3VwcyAmJiBwcm9wcy5tYW5hZ2VkTm9kZUdyb3Vwcy5sZW5ndGggPiAwXG4gICAgICAgICAgICAmJiBwcm9wcy5hdXRvc2NhbGluZ05vZGVHcm91cHMgJiYgcHJvcHMuYXV0b3NjYWxpbmdOb2RlR3JvdXBzLmxlbmd0aCA+IDApLFxuICAgICAgICAgICAgXCJNaXhpbmcgbWFuYWdlZCBhbmQgYXV0b3NjYWxpbmcgbm9kZSBncm91cHMgaXMgbm90IHN1cHBvcnRlZC4gUGxlYXNlIGZpbGUgYSByZXF1ZXN0IG9uIEdpdEh1YiB0byBhZGQgdGhpcyBzdXBwb3J0IGlmIG5lZWRlZC5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgY3JlYXRlQ2x1c3RlcihzY29wZTogQ29uc3RydWN0LCB2cGM6IGVjMi5JVnBjLCBzZWNyZXRzRW5jcnlwdGlvbktleT86IElLZXksIGt1YmVybmV0ZXNWZXJzaW9uPzogZWtzLkt1YmVybmV0ZXNWZXJzaW9uLCBjbHVzdGVyTG9nZ2luZz86IGVrcy5DbHVzdGVyTG9nZ2luZ1R5cGVzW10pIDogQ2x1c3RlckluZm8ge1xuICAgICAgICBjb25zdCBpZCA9IHNjb3BlLm5vZGUuaWQ7XG5cbiAgICAgICAgLy8gUHJvcHMgZm9yIHRoZSBjbHVzdGVyLlxuICAgICAgICBjb25zdCBjbHVzdGVyTmFtZSA9IHRoaXMucHJvcHMuY2x1c3Rlck5hbWUgPz8gaWQ7XG4gICAgICAgIGNvbnN0IG91dHB1dENsdXN0ZXJOYW1lID0gdHJ1ZTtcbiAgICAgICAgaWYoIWt1YmVybmV0ZXNWZXJzaW9uICYmICF0aGlzLnByb3BzLnZlcnNpb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlZlcnNpb24gd2FzIG5vdCBzcGVjaWZpZWQgYnkgY2x1c3RlciBidWlsZGVyIG9yIGluIGNsdXN0ZXIgcHJvdmlkZXIgcHJvcHMsIG11c3QgYmUgc3BlY2lmaWVkIGluIG9uZSBvZiB0aGVzZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2ZXJzaW9uOiBla3MuS3ViZXJuZXRlc1ZlcnNpb24gPSBrdWJlcm5ldGVzVmVyc2lvbiB8fCB0aGlzLnByb3BzLnZlcnNpb24gfHwgZWtzLkt1YmVybmV0ZXNWZXJzaW9uLlYxXzMwO1xuXG4gICAgICAgIGNvbnN0IHByaXZhdGVDbHVzdGVyID0gdGhpcy5wcm9wcy5wcml2YXRlQ2x1c3RlciA/PyB1dGlscy52YWx1ZUZyb21Db250ZXh0KHNjb3BlLCBjb25zdGFudHMuUFJJVkFURV9DTFVTVEVSLCBmYWxzZSk7XG4gICAgICAgIGNvbnN0IGVuZHBvaW50QWNjZXNzID0gKHByaXZhdGVDbHVzdGVyID09PSB0cnVlKSA/IGVrcy5FbmRwb2ludEFjY2Vzcy5QUklWQVRFIDogZWtzLkVuZHBvaW50QWNjZXNzLlBVQkxJQ19BTkRfUFJJVkFURTtcbiAgICAgICAgY29uc3QgdnBjU3VibmV0cyA9IHRoaXMucHJvcHMudnBjU3VibmV0cyA/PyAocHJpdmF0ZUNsdXN0ZXIgPT09IHRydWUgPyBbeyBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QUklWQVRFX1dJVEhfRUdSRVNTIH1dIDogdW5kZWZpbmVkKTtcbiAgICAgICAgY29uc3QgbWFzdGVyc1JvbGUgPSB0aGlzLnByb3BzLm1hc3RlcnNSb2xlID8/IG5ldyBSb2xlKHNjb3BlLCBgJHtjbHVzdGVyTmFtZX0tQWNjZXNzUm9sZWAsIHtcbiAgICAgICAgICAgIGFzc3VtZWRCeTogbmV3IEFjY291bnRSb290UHJpbmNpcGFsKCkgXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGt1YmVjdGxMYXllciA9IHRoaXMuZ2V0S3ViZWN0bExheWVyKHNjb3BlLCB2ZXJzaW9uKTtcbiAgICAgICAgY29uc3QgdGFncyA9IHRoaXMucHJvcHMudGFncztcblxuICAgICAgICBjb25zdCBkZWZhdWx0T3B0aW9uczogUGFydGlhbDxla3MuQ2x1c3RlclByb3BzPiA9IHtcbiAgICAgICAgICAgIHZwYyxcbiAgICAgICAgICAgIHNlY3JldHNFbmNyeXB0aW9uS2V5LFxuICAgICAgICAgICAgY2x1c3Rlck5hbWUsXG4gICAgICAgICAgICBjbHVzdGVyTG9nZ2luZyxcbiAgICAgICAgICAgIG91dHB1dENsdXN0ZXJOYW1lLFxuICAgICAgICAgICAgdmVyc2lvbixcbiAgICAgICAgICAgIHZwY1N1Ym5ldHMsXG4gICAgICAgICAgICBlbmRwb2ludEFjY2VzcyxcbiAgICAgICAgICAgIGt1YmVjdGxMYXllcixcbiAgICAgICAgICAgIHRhZ3MsXG4gICAgICAgICAgICBtYXN0ZXJzUm9sZSxcbiAgICAgICAgICAgIGRlZmF1bHRDYXBhY2l0eTogMCAvLyB3ZSB3YW50IHRvIG1hbmFnZSBjYXBhY2l0eSBvdXJzZWx2ZXNcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBjbHVzdGVyT3B0aW9ucyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIC4uLnRoaXMucHJvcHMsIHZlcnNpb24gfTtcbiAgICAgICAgLy8gQ3JlYXRlIGFuIEVLUyBDbHVzdGVyXG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSB0aGlzLmludGVybmFsQ3JlYXRlQ2x1c3RlcihzY29wZSwgaWQsIGNsdXN0ZXJPcHRpb25zKTtcbiAgICAgICAgY2x1c3Rlci5ub2RlLmFkZERlcGVuZGVuY3kodnBjKTtcblxuICAgICAgICBjb25zdCBub2RlR3JvdXBzOiBla3MuTm9kZWdyb3VwW10gPSBbXTtcblxuICAgICAgICB0aGlzLnByb3BzLm1hbmFnZWROb2RlR3JvdXBzPy5mb3JFYWNoKG4gPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm9kZUdyb3VwID0gdGhpcy5hZGRNYW5hZ2VkTm9kZUdyb3VwKGNsdXN0ZXIsIG4pO1xuICAgICAgICAgICAgbm9kZUdyb3Vwcy5wdXNoKG5vZGVHcm91cCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGF1dG9zY2FsaW5nR3JvdXBzOiBhdXRvc2NhbGluZy5BdXRvU2NhbGluZ0dyb3VwW10gPSBbXTtcbiAgICAgICAgdGhpcy5wcm9wcy5hdXRvc2NhbGluZ05vZGVHcm91cHM/LmZvckVhY2gobiA9PiB7XG4gICAgICAgICAgICBjb25zdCBhdXRvc2NhbGluZ0dyb3VwID0gdGhpcy5hZGRBdXRvU2NhbGluZ0dyb3VwKGNsdXN0ZXIsIG4pO1xuICAgICAgICAgICAgYXV0b3NjYWxpbmdHcm91cHMucHVzaChhdXRvc2NhbGluZ0dyb3VwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZmFyZ2F0ZVByb2ZpbGVzID0gT2JqZWN0LmVudHJpZXModGhpcy5wcm9wcy5mYXJnYXRlUHJvZmlsZXMgPz8ge30pO1xuICAgICAgICBjb25zdCBmYXJnYXRlQ29uc3RydWN0cyA6IGVrcy5GYXJnYXRlUHJvZmlsZVtdID0gW107XG4gICAgICAgIGZhcmdhdGVQcm9maWxlcz8uZm9yRWFjaCgoW2tleSwgb3B0aW9uc10pID0+IGZhcmdhdGVDb25zdHJ1Y3RzLnB1c2godGhpcy5hZGRGYXJnYXRlUHJvZmlsZShjbHVzdGVyLCBrZXksIG9wdGlvbnMpKSk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBDbHVzdGVySW5mbyhjbHVzdGVyLCB2ZXJzaW9uLCBub2RlR3JvdXBzLCBhdXRvc2NhbGluZ0dyb3VwcywgZmFyZ2F0ZUNvbnN0cnVjdHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRlbXBsYXRlIG1ldGhvZCB0aGF0IG1heSBiZSBvdmVycmlkZGVuIGJ5IHN1YmNsYXNzZXMgdG8gY3JlYXRlIGEgc3BlY2lmaWMgY2x1c3RlciBmbGF2b3IgKGUuZy4gRmFyZ2F0ZUNsdXN0ZXIgdnMgZWtzLkNsdXN0ZXIpXG4gICAgICogQHBhcmFtIHNjb3BlXG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHBhcmFtIGNsdXN0ZXJPcHRpb25zXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaW50ZXJuYWxDcmVhdGVDbHVzdGVyKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIGNsdXN0ZXJPcHRpb25zOiBhbnkpOiBla3MuQ2x1c3RlciB7XG4gICAgICAgIHJldHVybiBuZXcgZWtzLkNsdXN0ZXIoc2NvcGUsIGlkLCBjbHVzdGVyT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FuIGJlIG92ZXJyaWRkZW4gdG8gcHJvdmlkZSBhIGN1c3RvbSBrdWJlY3RsIGxheWVyLiBcbiAgICAgKiBAcGFyYW0gc2NvcGUgXG4gICAgICogQHBhcmFtIHZlcnNpb24gXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldEt1YmVjdGxMYXllcihzY29wZTogQ29uc3RydWN0LCB2ZXJzaW9uOiBla3MuS3ViZXJuZXRlc1ZlcnNpb24pIDogSUxheWVyVmVyc2lvbiB8IHVuZGVmaW5lZCB7XG4gICAgICAgcmV0dXJuIHNlbGVjdEt1YmVjdGxMYXllcihzY29wZSwgdmVyc2lvbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBhdXRvc2NhbGluZyBncm91cCB0byB0aGUgY2x1c3Rlci5cbiAgICAgKiBAcGFyYW0gY2x1c3RlclxuICAgICAqIEBwYXJhbSBub2RlR3JvdXBcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGFkZEF1dG9TY2FsaW5nR3JvdXAoY2x1c3RlcjogZWtzLkNsdXN0ZXIsIG5vZGVHcm91cDogQXV0b3NjYWxpbmdOb2RlR3JvdXApOiBhdXRvc2NhbGluZy5BdXRvU2NhbGluZ0dyb3VwIHtcbiAgICAgICAgY29uc3QgbWFjaGluZUltYWdlVHlwZSA9IG5vZGVHcm91cC5tYWNoaW5lSW1hZ2VUeXBlID8/IGVrcy5NYWNoaW5lSW1hZ2VUeXBlLkFNQVpPTl9MSU5VWF8yO1xuICAgICAgICBjb25zdCBpbnN0YW5jZVR5cGVDb250ZXh0ID0gdXRpbHMudmFsdWVGcm9tQ29udGV4dChjbHVzdGVyLCBjb25zdGFudHMuSU5TVEFOQ0VfVFlQRV9LRVksIGNvbnN0YW50cy5ERUZBVUxUX0lOU1RBTkNFX1RZUEUpO1xuICAgICAgICBjb25zdCBpbnN0YW5jZVR5cGUgPSBub2RlR3JvdXAuaW5zdGFuY2VUeXBlID8/ICh0eXBlb2YgaW5zdGFuY2VUeXBlQ29udGV4dCA9PT0gJ3N0cmluZycgPyBuZXcgZWMyLkluc3RhbmNlVHlwZShpbnN0YW5jZVR5cGVDb250ZXh0KSA6IGluc3RhbmNlVHlwZUNvbnRleHQpO1xuICAgICAgICBjb25zdCBtaW5TaXplID0gbm9kZUdyb3VwLm1pblNpemUgPz8gdXRpbHMudmFsdWVGcm9tQ29udGV4dChjbHVzdGVyLCBjb25zdGFudHMuTUlOX1NJWkVfS0VZLCBjb25zdGFudHMuREVGQVVMVF9OR19NSU5TSVpFKTtcbiAgICAgICAgY29uc3QgbWF4U2l6ZSA9IG5vZGVHcm91cC5tYXhTaXplID8/IHV0aWxzLnZhbHVlRnJvbUNvbnRleHQoY2x1c3RlciwgY29uc3RhbnRzLk1BWF9TSVpFX0tFWSwgY29uc3RhbnRzLkRFRkFVTFRfTkdfTUFYU0laRSk7XG4gICAgICAgIGNvbnN0IGRlc2lyZWRTaXplID0gbm9kZUdyb3VwLmRlc2lyZWRTaXplID8/IHV0aWxzLnZhbHVlRnJvbUNvbnRleHQoY2x1c3RlciwgY29uc3RhbnRzLkRFU0lSRURfU0laRV9LRVksIG1pblNpemUpO1xuICAgICAgICBjb25zdCB1cGRhdGVQb2xpY3kgPSBub2RlR3JvdXAudXBkYXRlUG9saWN5ID8/IGF1dG9zY2FsaW5nLlVwZGF0ZVBvbGljeS5yb2xsaW5nVXBkYXRlKCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuIGF1dG9zY2FsaW5nIGdyb3VwXG4gICAgICAgIHJldHVybiBjbHVzdGVyLmFkZEF1dG9TY2FsaW5nR3JvdXBDYXBhY2l0eShub2RlR3JvdXAuaWQsIHtcbiAgICAgICAgICAgIC4uLm5vZGVHcm91cCxcbiAgICAgICAgICAgIC4uLiB7XG4gICAgICAgICAgICAgICAgYXV0b1NjYWxpbmdHcm91cE5hbWU6IG5vZGVHcm91cC5hdXRvU2NhbGluZ0dyb3VwTmFtZSA/PyBub2RlR3JvdXAuaWQsXG4gICAgICAgICAgICAgICAgbWFjaGluZUltYWdlVHlwZSxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZVR5cGUsXG4gICAgICAgICAgICAgICAgbWluQ2FwYWNpdHk6IG1pblNpemUsXG4gICAgICAgICAgICAgICAgbWF4Q2FwYWNpdHk6IG1heFNpemUsXG4gICAgICAgICAgICAgICAgZGVzaXJlZENhcGFjaXR5OiBkZXNpcmVkU2l6ZSxcbiAgICAgICAgICAgICAgICB1cGRhdGVQb2xpY3ksXG4gICAgICAgICAgICAgICAgdnBjU3VibmV0czogbm9kZUdyb3VwLm5vZGVHcm91cFN1Ym5ldHMsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBmYXJnYXRlIHByb2ZpbGUgdG8gdGhlIGNsdXN0ZXJcbiAgICAgKi9cbiAgICBhZGRGYXJnYXRlUHJvZmlsZShjbHVzdGVyOiBla3MuQ2x1c3RlciwgbmFtZTogc3RyaW5nLCBwcm9maWxlT3B0aW9uczogZWtzLkZhcmdhdGVQcm9maWxlT3B0aW9ucyk6IGVrcy5GYXJnYXRlUHJvZmlsZSB7XG4gICAgICAgIHJldHVybiBjbHVzdGVyLmFkZEZhcmdhdGVQcm9maWxlKG5hbWUsIHByb2ZpbGVPcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbWFuYWdlZCBub2RlIGdyb3VwIHRvIHRoZSBjbHVzdGVyLlxuICAgICAqIEBwYXJhbSBjbHVzdGVyXG4gICAgICogQHBhcmFtIG5vZGVHcm91cFxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgYWRkTWFuYWdlZE5vZGVHcm91cChjbHVzdGVyOiBla3MuQ2x1c3Rlciwgbm9kZUdyb3VwOiBNYW5hZ2VkTm9kZUdyb3VwKTogZWtzLk5vZGVncm91cCB7XG4gICAgICAgIGNvbnN0IGNhcGFjaXR5VHlwZSA9IG5vZGVHcm91cC5ub2RlR3JvdXBDYXBhY2l0eVR5cGU7XG4gICAgICAgIGNvbnN0IHJlbGVhc2VWZXJzaW9uID0gbm9kZUdyb3VwLmFtaVJlbGVhc2VWZXJzaW9uO1xuICAgICAgICBjb25zdCBpbnN0YW5jZVR5cGVDb250ZXh0ID0gdXRpbHMudmFsdWVGcm9tQ29udGV4dChjbHVzdGVyLCBjb25zdGFudHMuSU5TVEFOQ0VfVFlQRV9LRVksIGNvbnN0YW50cy5ERUZBVUxUX0lOU1RBTkNFX1RZUEUpO1xuICAgICAgICBjb25zdCBpbnN0YW5jZVR5cGVzID0gbm9kZUdyb3VwLmluc3RhbmNlVHlwZXMgPz8gKFt0eXBlb2YgaW5zdGFuY2VUeXBlQ29udGV4dCA9PT0gJ3N0cmluZycgPyBuZXcgZWMyLkluc3RhbmNlVHlwZShpbnN0YW5jZVR5cGVDb250ZXh0KSA6IGluc3RhbmNlVHlwZUNvbnRleHRdKTtcbiAgICAgICAgY29uc3QgbWluU2l6ZSA9IG5vZGVHcm91cC5taW5TaXplID8/IHV0aWxzLnZhbHVlRnJvbUNvbnRleHQoY2x1c3RlciwgY29uc3RhbnRzLk1JTl9TSVpFX0tFWSwgY29uc3RhbnRzLkRFRkFVTFRfTkdfTUlOU0laRSk7XG4gICAgICAgIGNvbnN0IG1heFNpemUgPSBub2RlR3JvdXAubWF4U2l6ZSA/PyB1dGlscy52YWx1ZUZyb21Db250ZXh0KGNsdXN0ZXIsIGNvbnN0YW50cy5NQVhfU0laRV9LRVksIGNvbnN0YW50cy5ERUZBVUxUX05HX01BWFNJWkUpO1xuICAgICAgICBjb25zdCBkZXNpcmVkU2l6ZSA9IG5vZGVHcm91cC5kZXNpcmVkU2l6ZSA/PyB1dGlscy52YWx1ZUZyb21Db250ZXh0KGNsdXN0ZXIsIGNvbnN0YW50cy5ERVNJUkVEX1NJWkVfS0VZLCBtaW5TaXplKTtcblxuICAgICAgICAvLyBDcmVhdGUgYSBtYW5hZ2VkIG5vZGUgZ3JvdXAuXG4gICAgICAgIGNvbnN0IG5vZGVncm91cE9wdGlvbnM6IHV0aWxzLldyaXRlYWJsZTxla3MuTm9kZWdyb3VwT3B0aW9ucz4gPSB7XG4gICAgICAgICAgICAuLi5ub2RlR3JvdXAsXG4gICAgICAgICAgICAuLi57XG4gICAgICAgICAgICAgICAgbm9kZWdyb3VwTmFtZTogbm9kZUdyb3VwLm5vZGVncm91cE5hbWUgPz8gbm9kZUdyb3VwLmlkLFxuICAgICAgICAgICAgICAgIGNhcGFjaXR5VHlwZSxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZVR5cGVzLFxuICAgICAgICAgICAgICAgIG1pblNpemUsXG4gICAgICAgICAgICAgICAgbWF4U2l6ZSxcbiAgICAgICAgICAgICAgICBkZXNpcmVkU2l6ZSxcbiAgICAgICAgICAgICAgICByZWxlYXNlVmVyc2lvbixcbiAgICAgICAgICAgICAgICBzdWJuZXRzOiBub2RlR3JvdXAubm9kZUdyb3VwU3VibmV0c1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChub2RlR3JvdXAubGF1bmNoVGVtcGxhdGUpIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBsYXVuY2ggdGVtcGxhdGUgd2l0aCBwcm92aWRlZCBsYXVuY2ggdGVtcGxhdGUgcHJvcGVydGllc1xuICAgICAgICAgICAgY29uc3QgbHQgPSBuZXcgZWMyLkxhdW5jaFRlbXBsYXRlKGNsdXN0ZXIsIGAke25vZGVHcm91cC5pZH0tbHRgLCB7XG4gICAgICAgICAgICAgICAgYmxvY2tEZXZpY2VzOiBub2RlR3JvdXAubGF1bmNoVGVtcGxhdGUuYmxvY2tEZXZpY2VzLFxuICAgICAgICAgICAgICAgIG1hY2hpbmVJbWFnZTogbm9kZUdyb3VwLmxhdW5jaFRlbXBsYXRlPy5tYWNoaW5lSW1hZ2UsXG4gICAgICAgICAgICAgICAgc2VjdXJpdHlHcm91cDogbm9kZUdyb3VwLmxhdW5jaFRlbXBsYXRlLnNlY3VyaXR5R3JvdXAsXG4gICAgICAgICAgICAgICAgdXNlckRhdGE6IG5vZGVHcm91cC5sYXVuY2hUZW1wbGF0ZT8udXNlckRhdGEsXG4gICAgICAgICAgICAgICAgcmVxdWlyZUltZHN2Mjogbm9kZUdyb3VwLmxhdW5jaFRlbXBsYXRlPy5yZXF1aXJlSW1kc3YyLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB1dGlscy5zZXRQYXRoKG5vZGVncm91cE9wdGlvbnMsIFwibGF1bmNoVGVtcGxhdGVTcGVjXCIsIHtcbiAgICAgICAgICAgICAgICBpZDogbHQubGF1bmNoVGVtcGxhdGVJZCEsXG4gICAgICAgICAgICAgICAgdmVyc2lvbjogbHQubGF0ZXN0VmVyc2lvbk51bWJlcixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgdGFncyA9IE9iamVjdC5lbnRyaWVzKG5vZGVHcm91cC5sYXVuY2hUZW1wbGF0ZS50YWdzID8/IHt9KTtcbiAgICAgICAgICAgIHRhZ3MuZm9yRWFjaCgoW2tleSwgb3B0aW9uc10pID0+IFRhZ3Mub2YobHQpLmFkZChrZXksb3B0aW9ucykpO1xuICAgICAgICAgICAgaWYgKG5vZGVHcm91cC5sYXVuY2hUZW1wbGF0ZT8ubWFjaGluZUltYWdlKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG5vZGVncm91cE9wdGlvbnMuYW1pVHlwZTtcbiAgICAgICAgICAgICAgICBkZWxldGUgbm9kZWdyb3VwT3B0aW9ucy5yZWxlYXNlVmVyc2lvbjtcbiAgICAgICAgICAgICAgICBkZWxldGUgbm9kZUdyb3VwLmFtaVJlbGVhc2VWZXJzaW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY2x1c3Rlci5hZGROb2RlZ3JvdXBDYXBhY2l0eShub2RlR3JvdXAuaWQgKyBcIi1uZ1wiLCBub2RlZ3JvdXBPcHRpb25zKTtcblxuICAgICAgICBpZihub2RlR3JvdXAuZW5hYmxlU3NtUGVybWlzc2lvbnMpIHtcbiAgICAgICAgICAgIHJlc3VsdC5yb2xlLmFkZE1hbmFnZWRQb2xpY3koTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FtYXpvblNTTU1hbmFnZWRJbnN0YW5jZUNvcmUnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgdmFsaWRhdGVJbnB1dChwcm9wczogR2VuZXJpY0NsdXN0ZXJQcm92aWRlclByb3BzKSB7XG5cbiAgICAgICAgdXRpbHMudmFsaWRhdGVDb25zdHJhaW50cyhuZXcgR2VuZXJpY0NsdXN0ZXJQcm9wc0NvbnN0cmFpbnRzLCBHZW5lcmljQ2x1c3RlclByb3ZpZGVyLm5hbWUsIHByb3BzKTtcbiAgICAgICAgaWYgKHByb3BzLm1hbmFnZWROb2RlR3JvdXBzICE9IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHV0aWxzLnZhbGlkYXRlQ29uc3RyYWludHMobmV3IE1hbmFnZWROb2RlR3JvdXBDb25zdHJhaW50cywgXCJNYW5hZ2VkTm9kZUdyb3VwXCIsIC4uLnByb3BzLm1hbmFnZWROb2RlR3JvdXBzKTtcbiAgICAgICAgaWYgKHByb3BzLmF1dG9zY2FsaW5nTm9kZUdyb3VwcyAhPSB1bmRlZmluZWQpXG4gICAgICAgICAgICB1dGlscy52YWxpZGF0ZUNvbnN0cmFpbnRzKG5ldyBBdXRvc2NhbGluZ05vZGVHcm91cENvbnN0cmFpbnRzLCBcIkF1dG9zY2FsaW5nTm9kZUdyb3Vwc1wiLCAuLi5wcm9wcy5hdXRvc2NhbGluZ05vZGVHcm91cHMpO1xuICAgICAgICBpZiAocHJvcHMuZmFyZ2F0ZVByb2ZpbGVzIGFzIGFueSAhPSB1bmRlZmluZWQpXG4gICAgICAgICAgICB1dGlscy52YWxpZGF0ZUNvbnN0cmFpbnRzKG5ldyBGYXJnYXRlUHJvZmlsZUNvbnN0cmFpbnRzLCBcIkZhcmdhdGVQcm9maWxlc1wiLCAuLi5PYmplY3QudmFsdWVzKHByb3BzLmZhcmdhdGVQcm9maWxlcyBhcyBhbnkpKTtcbiAgICB9XG59XG4iXX0=