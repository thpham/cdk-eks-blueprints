import { ServiceAccount } from "aws-cdk-lib/aws-eks";
import { ClusterAddOn } from "../..";
import { ClusterInfo, Values } from "../../spi";
import { Construct, IConstruct } from "constructs";
import { IManagedPolicy, PolicyDocument } from "aws-cdk-lib/aws-iam";
import { KubernetesVersion } from "aws-cdk-lib/aws-eks";
export declare class CoreAddOnProps {
    /**
     * Name of the add-on to instantiate
     */
    readonly addOnName: string;
    /**
     * Version of the add-on to use. Must match the version of the cluster where it
     * will be deployed it
     */
    readonly version: string;
    /**
     * Policy document provider returns the policy required by the add-on to allow it to interact with AWS resources
     */
    readonly policyDocumentProvider?: (partition: string) => PolicyDocument;
    /**
     * Service Account Name to be used with AddOn.
     */
    readonly saName: string;
    /**
     * Namespace to create the ServiceAccount.
     */
    readonly namespace?: string;
    /**
     * ConfigurationValues field to pass custom configurations to Addon
     */
    readonly configurationValues?: Values;
    /**
     * Indicates that add-on must be installed before any capacity is added for worker nodes (incuding Fargate).
     */
    readonly controlPlaneAddOn?: boolean;
    /**
     * Map between kubernetes versions and addOn versions for auto selection.
     */
    readonly versionMap?: Map<KubernetesVersion, string>;
}
/**
 * Implementation of EKS Managed add-ons.
 */
export declare class CoreAddOn implements ClusterAddOn {
    readonly coreAddOnProps: CoreAddOnProps;
    constructor(coreAddOnProps: CoreAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
    /**
     * Override this method to create namespace for the core addon. In many cases the addon is created in the kube-system namespace
     * which does not require creation as it is always there.
     * For addons that support other namespace as destinations this method should be implemented.
     * @param clusterInfo
     * @param name
     * @returns
     */
    createNamespace(_clusterInfo: ClusterInfo, _namespaceName: string): IConstruct | undefined;
    /**
     * Override this method to control how service account is created.
     * @param clusterInfo
     * @param saNamespace
     * @param policies
     * @returns
     */
    createServiceAccount(clusterInfo: ClusterInfo, saNamespace: string, policies: IManagedPolicy[]): ServiceAccount;
    /**
     * Template method with default implementation to execute the supplied function of policyDocumentProvider.
     * Allows overriding this method in subclasses for more complex cases of policies.
     * @param clusterInfo
     * @returns
     */
    providePolicyDocument(clusterInfo: ClusterInfo): PolicyDocument | undefined;
    /**
     * Template method to return managed policies for the service account.
     * Allows overriding in subclasses to handle more complex cases of policies.
     */
    provideManagedPolicies(clusterInfo: ClusterInfo): IManagedPolicy[] | undefined;
    provideVersion(clusterInfo: ClusterInfo, versionMap?: Map<KubernetesVersion, string>): Promise<string>;
}
