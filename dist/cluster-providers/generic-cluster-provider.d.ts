import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import { IKey } from "aws-cdk-lib/aws-kms";
import { ILayerVersion } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { ClusterInfo, ClusterProvider } from "../spi";
import * as utils from "../utils";
import { AutoscalingNodeGroup, ManagedNodeGroup } from "./types";
export declare function clusterBuilder(): ClusterBuilder;
/**
 * Function that contains logic to map the correct kunbectl layer based on the passed in version.
 * @param scope in whch the kubectl layer must be created
 * @param version EKS version
 * @returns ILayerVersion or undefined
 */
export declare function selectKubectlLayer(scope: Construct, version: eks.KubernetesVersion): ILayerVersion | undefined;
/**
 * Properties for the generic cluster provider, containing definitions of managed node groups,
 * auto-scaling groups, fargate profiles.
 */
export interface GenericClusterProviderProps extends Partial<eks.ClusterOptions> {
    /**
     * Whether API server is private.
     */
    privateCluster?: boolean;
    /**
     * Array of managed node groups.
     */
    managedNodeGroups?: ManagedNodeGroup[];
    /**
     * Array of autoscaling node groups.
     */
    autoscalingNodeGroups?: AutoscalingNodeGroup[];
    /**
     * Fargate profiles
     */
    fargateProfiles?: {
        [key: string]: eks.FargateProfileOptions;
    };
    /**
     * Tags for the cluster
     */
    tags?: {
        [key: string]: string;
    };
}
export declare class ManagedNodeGroupConstraints implements utils.ConstraintsType<ManagedNodeGroup> {
    /**
     * id can be no less than 1 character long, and no greater than 63 characters long due to DNS system limitations.
     * https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
     */
    id: utils.StringConstraint;
    /**
    * nodes per node group has a soft limit of 450 nodes, and as little as 0. But we multiply that by a factor of 5 to 2250 in case
    * of situations of a hard limit request being accepted, and as a result the limit would be raised
    * https://docs.aws.amazon.com/eks/latest/userguide/service-quotas.html
    */
    minSize: utils.NumberConstraint;
    /**
     * nodes per node group has a soft limit of 450 nodes, and as little as 0. But we multiply that by a factor of 5 to 2250 in case
     * of situations of a hard limit request being accepted, and as a result the limit would be raised
     * https://docs.aws.amazon.com/eks/latest/userguide/service-quotas.html
     */
    maxSize: utils.NumberConstraint;
    /**
     * Nodes per node group has a soft limit of 450 nodes, and as little as 0. But we multiply that by a factor of 5 to 2250 in case
     * of situations of a hard limit request being accepted, and as a result the limit would be raised
     * https://docs.aws.amazon.com/eks/latest/userguide/service-quotas.html
     */
    desiredSize: utils.NumberConstraint;
    /**
     * amiReleaseVersion can be no less than 1 character long, and no greater than 1024 characters long.
     * https://docs.aws.amazon.com/imagebuilder/latest/APIReference/API_Ami.html
     */
    amiReleaseVersion: utils.StringConstraint;
}
export declare class AutoscalingNodeGroupConstraints implements utils.ConstraintsType<AutoscalingNodeGroup> {
    /**
    * id can be no less than 1 character long, and no greater than 63 characters long due to DNS system limitations.
    * https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
    */
    id: utils.StringConstraint;
    /**
    * Allowed range is 0 to 5000 inclusive.
    * https://kubernetes.io/docs/setup/best-practices/cluster-large/
    */
    minSize: utils.NumberConstraint;
    /**
    * Allowed range is 0 to 5000 inclusive.
    * https://kubernetes.io/docs/setup/best-practices/cluster-large/
    */
    maxSize: utils.NumberConstraint;
    /**
    * Allowed range is 0 to 5000 inclusive.
    * https://kubernetes.io/docs/setup/best-practices/cluster-large/
    */
    desiredSize: utils.NumberConstraint;
}
export declare class FargateProfileConstraints implements utils.ConstraintsType<eks.FargateProfileOptions> {
    /**
    * fargateProfileNames can be no less than 1 character long, and no greater than 63 characters long due to DNS system limitations.
    * https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
    */
    fargateProfileName: utils.StringConstraint;
}
export declare class GenericClusterPropsConstraints implements utils.ConstraintsType<GenericClusterProviderProps> {
    /**
    * managedNodeGroups per cluster have a soft limit of 30 managed node groups per EKS cluster, and as little as 0. But we multiply that
    * by a factor of 5 to 150 in case of situations of a hard limit request being accepted, and as a result the limit would be raised.
    * https://docs.aws.amazon.com/eks/latest/userguide/service-quotas.html
    */
    managedNodeGroups: utils.ArrayConstraint;
    /**
    * autoscalingNodeGroups per cluster have a soft limit of 500 autoscaling node groups per EKS cluster, and as little as 0. But we multiply that
    * by a factor of 5 to 2500 in case of situations of a hard limit request being accepted, and as a result the limit would be raised.
    * https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-quotas.html
    */
    autoscalingNodeGroups: utils.ArrayConstraint;
}
export declare const defaultOptions: {};
export declare class ClusterBuilder {
    private props;
    private privateCluster;
    private managedNodeGroups;
    private autoscalingNodeGroups;
    private fargateProfiles;
    constructor();
    withCommonOptions(options: Partial<eks.ClusterOptions>): this;
    managedNodeGroup(...nodeGroups: ManagedNodeGroup[]): this;
    autoscalingGroup(...nodeGroups: AutoscalingNodeGroup[]): this;
    fargateProfile(name: string, options: eks.FargateProfileOptions): this;
    version(version: eks.KubernetesVersion): this;
    build(): GenericClusterProvider;
}
/**
 * Cluster provider implementation that supports multiple node groups.
 */
export declare class GenericClusterProvider implements ClusterProvider {
    readonly props: GenericClusterProviderProps;
    constructor(props: GenericClusterProviderProps);
    /**
     * @override
     */
    createCluster(scope: Construct, vpc: ec2.IVpc, secretsEncryptionKey?: IKey, kubernetesVersion?: eks.KubernetesVersion, clusterLogging?: eks.ClusterLoggingTypes[]): ClusterInfo;
    /**
     * Template method that may be overridden by subclasses to create a specific cluster flavor (e.g. FargateCluster vs eks.Cluster)
     * @param scope
     * @param id
     * @param clusterOptions
     * @returns
     */
    protected internalCreateCluster(scope: Construct, id: string, clusterOptions: any): eks.Cluster;
    /**
     * Can be overridden to provide a custom kubectl layer.
     * @param scope
     * @param version
     * @returns
     */
    protected getKubectlLayer(scope: Construct, version: eks.KubernetesVersion): ILayerVersion | undefined;
    /**
     * Adds an autoscaling group to the cluster.
     * @param cluster
     * @param nodeGroup
     * @returns
     */
    addAutoScalingGroup(cluster: eks.Cluster, nodeGroup: AutoscalingNodeGroup): autoscaling.AutoScalingGroup;
    /**
     * Adds a fargate profile to the cluster
     */
    addFargateProfile(cluster: eks.Cluster, name: string, profileOptions: eks.FargateProfileOptions): eks.FargateProfile;
    /**
     * Adds a managed node group to the cluster.
     * @param cluster
     * @param nodeGroup
     * @returns
     */
    addManagedNodeGroup(cluster: eks.Cluster, nodeGroup: ManagedNodeGroup): eks.Nodegroup;
    private validateInput;
}
