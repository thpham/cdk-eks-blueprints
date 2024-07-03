import * as cdk from 'aws-cdk-lib';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import * as eks from 'aws-cdk-lib/aws-eks';
import { Construct, IConstruct } from 'constructs';
import { ResourceProvider } from '.';
import { EksBlueprintProps } from '../stacks';
import * as constraints from '../utils/constraints-utils';
import { EbsDeviceVolumeType } from 'aws-cdk-lib/aws-ec2';
/**
 * Data type defining helm repositories for GitOps bootstrapping.
 */
export interface HelmRepository {
    repoUrl: string;
    name: string;
    username?: string;
    password?: string;
}
/**
 * Utility type for values passed to Helm or GitOps applications.
 */
export type Values = {
    [key: string]: any;
};
/**
 * Utility type for Kubernetes taints passed to Helm or GitOps applications.
 */
export type Taint = {
    key: string;
    value?: string;
    effect: "NoSchedule" | "PreferNoSchedule" | "NoExecute";
};
export type Sec = `${number}s`;
export type Min = `${number}m`;
export type Hour = `${number}h`;
export interface BlockDeviceMapping {
    deviceName?: string;
    virtualName?: string;
    ebs?: EbsVolumeMapping;
    noDevice?: string;
}
export interface EbsVolumeMapping {
    deleteOnTermination?: boolean;
    iops?: number;
    snapshotId?: string;
    volumeSize?: string;
    volumeType?: EbsDeviceVolumeType;
    kmsKeyId?: string;
    throughput?: number;
    outpostArn?: string;
    encrypted?: boolean;
}
/**
 * Interface that includes a reference to a Git repository for reuse, without credentials
 * and other access information.
 */
export interface GitRepositoryReference {
    /**
     * Expected to support helm style repo at the moment
     */
    repoUrl: string;
    /**
     * Path within the repository
     */
    path?: string;
    /**
     * Optional name for the bootstrap application
     */
    name?: string;
    /**
     * Optional target revision for the repository.
     * TargetRevision defines the revision of the source
     * to sync the application to. In case of Git, this can be
     * commit, tag, or branch. If omitted, will equal to HEAD.
     * In case of Helm, this is a semver tag for the Chart's version.
     */
    targetRevision?: string;
}
/**
 * Data type defining an application repository (git).
 */
export interface ApplicationRepository extends GitRepositoryReference {
    /**
     * Secret from AWS Secrets Manager to import credentials to access the specified git repository.
     * The secret must exist in the same region and account where the stack will run.
     */
    credentialsSecretName?: string;
    /**
     * Depending on credentials type the arn should either point to an SSH key (plain text value)
     * or a json file with username/password attributes.
     * For TOKEN type username can be any non-empty username and token value as password.
     */
    credentialsType?: "USERNAME" | "TOKEN" | "SSH";
}
/**
 * Adds Constraints to application repository
 */
export declare class ApplicationRepositoryConstraints implements constraints.ConstraintsType<ApplicationRepository> {
    credentialsSecretName: constraints.InternetHostStringConstraint;
}
/**
 * Provides API to register resource providers and get access to the provided resources.
 */
export declare class ResourceContext {
    readonly scope: Construct;
    readonly blueprintProps: EksBlueprintProps;
    private readonly resources;
    constructor(scope: Construct, blueprintProps: EksBlueprintProps);
    /**
     * Adds a new resource provider and specifies the name under which the provided resource will be registered,
     * @param name Specifies the name key under which the provided resources will be registered for subsequent look-ups.
     * @param provider Implementation of the resource provider interface
     * @returns the provided resource
     */
    add<T extends IConstruct>(name: string, provider: ResourceProvider<T>): T;
    /**
     * Gets the provided resource by the supplied name.
     * @param name under which the resource provider was registered
     * @returns the resource or undefined if the specified resource was not found
     */
    get<T extends IConstruct = IConstruct>(name: string): T | undefined;
}
export declare enum GlobalResources {
    Vpc = "vpc",
    HostedZone = "hosted-zone",
    Certificate = "certificate",
    KmsKey = "kms-key",
    Amp = "amp"
}
/**
 * Cluster info supplies required information on the cluster configuration, registered resources and add-ons
 * which could be leveraged by the framework, add-on implementations and teams.
 */
export declare class ClusterInfo {
    readonly cluster: eks.ICluster;
    readonly version: eks.KubernetesVersion;
    readonly nodeGroups?: eks.Nodegroup[] | undefined;
    readonly autoscalingGroups?: AutoScalingGroup[] | undefined;
    readonly fargateProfiles?: eks.FargateProfile[] | undefined;
    private readonly provisionedAddOns;
    private readonly scheduledAddOns;
    private readonly orderedAddOns;
    private resourceContext;
    private addonContext;
    /**
     * Constructor for ClusterInfo
     * @param props
     */
    constructor(cluster: eks.ICluster, version: eks.KubernetesVersion, nodeGroups?: eks.Nodegroup[] | undefined, autoscalingGroups?: AutoScalingGroup[] | undefined, fargateProfiles?: eks.FargateProfile[] | undefined);
    /**
     * Provides the resource context object associated with this instance of the EKS Blueprint.
     * @returns resource context object
     */
    getResourceContext(): ResourceContext;
    /**
     * Injection method to provide resource context.
     * @param resourceContext
     */
    setResourceContext(resourceContext: ResourceContext): void;
    /**
     * Update provisionedAddOns map
     * @param addOn
     * @param construct
     */
    addProvisionedAddOn(addOn: string, construct: Construct): void;
    /**
     * Given the addOn name, return the provisioned addOn construct
     * @param addOn
     * @returns undefined
     */
    getProvisionedAddOn(addOn: string): Construct | undefined;
    /**
     * Returns all provisioned addons
     * @returns scheduledAddOns: Map<string, cdk.Construct>
     */
    getAllProvisionedAddons(): Map<string, Construct>;
    /**
     * Set the preProvisionedAddOn map with the promise for the construct
     * of the addon being provisioned
     * @param addOn
     * @param promise
     * @param ordered if addon depends on previous addons for completion (runs serially)
     */
    addScheduledAddOn(addOn: string, promise: Promise<Construct>, ordered: boolean): void;
    /**
     * Indicates if strict ordering is applied to the addon
     * @param addOn addOn key
     * @returns
     */
    isOrderedAddOn(addOn: string): boolean;
    /**
     * Returns the promise for the Addon construct
     * @param addOn
     * @returns Promise<cdk.Construct>
     */
    getScheduledAddOn(addOn: string): Promise<Construct> | undefined;
    /**
     * Returns all scheduled addons
     * @returns scheduledAddOns: Map<string, Promise<cdk.Construct>>
     */
    getAllScheduledAddons(): Map<string, Promise<Construct>>;
    /**
     * Provides the resource registered under supplied name
     * @param name of the resource to be returned
     * @returns Resource object or undefined if no resource was found
     */
    getResource<T extends cdk.IResource>(name: string): T | undefined;
    /**
     * Same as {@link getResource} but will fail if the specified resource is not found
     * @param name of the resource to be returned
     * @returns Resource object (fails if not found)
     */
    getRequiredResource<T extends cdk.IResource>(name: string): T;
    /**
     * Update addonContext map
     * @param addOn
     * @param Values
     */
    addAddOnContext(addOn: string, values: Values): void;
    /**
    * Returns all addon contexts
    * @returns addonContext: Map<string, Values>
    */
    getAddOnContexts(): Map<string, Values>;
}
/**
 * Enum type for two different GitOps operating modes
 */
export declare enum GitOpsMode {
    /**
     * CDK deploys the `Application` resource for each AddOn enabled or customer workloads,
     * and ArgoCD deploys the actual AddOn and workloads via GitOps based on the `Application` resource.
     */
    APPLICATION = 0,
    /**
     * CDK deploys only one `Application` resource for the App of Apps, aka `bootstrap-apps`,
     * and ArgoCD deploys all the AddOns based on the child `Application` defined in `bootstrap-apps`.
     */
    APP_OF_APPS = 1
}
