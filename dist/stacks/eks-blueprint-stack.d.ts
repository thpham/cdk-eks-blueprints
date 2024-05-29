import * as cdk from 'aws-cdk-lib';
import { ClusterLoggingTypes as ControlPlaneLogType, KubernetesVersion } from 'aws-cdk-lib/aws-eks';
import { Construct } from 'constructs';
import * as spi from '../spi';
import * as constraints from '../utils/constraints-utils';
export declare const DEFAULT_VERSION: cdk.aws_eks.KubernetesVersion;
/**
 *  Exporting control plane log type so that customers don't have to import CDK EKS module for blueprint configuration.
 */
export { ControlPlaneLogType };
export declare class EksBlueprintProps {
    /**
     * The id for the blueprint.
     */
    readonly id: string;
    /**
     * Defaults to id if not provided
     */
    readonly name?: string;
    /**
     * Add-ons if any.
     */
    readonly addOns?: Array<spi.ClusterAddOn>;
    /**
     * Teams if any
     */
    readonly teams?: Array<spi.Team>;
    /**
     * EC2 or Fargate are supported in the blueprint but any implementation conforming the interface
     * will work
     */
    readonly clusterProvider?: spi.ClusterProvider;
    /**
     * Kubernetes version (must be initialized for addons to work properly)
     */
    readonly version?: KubernetesVersion | "auto";
    /**
     * Named resource providers to leverage for cluster resources.
     * The resource can represent Vpc, Hosting Zones or other resources, see {@link spi.ResourceType}.
     * VPC for the cluster can be registered under the name of 'vpc' or as a single provider of type
     */
    resourceProviders?: Map<string, spi.ResourceProvider>;
    /**
     * Control Plane log types to be enabled (if not passed, none)
     * If wrong types are included, will throw an error.
     */
    readonly enableControlPlaneLogTypes?: ControlPlaneLogType[];
    /**
     * If set to true and no resouce provider for KMS key is defined (under GlobalResources.KmsKey),
     * a default KMS encryption key will be used for envelope encryption of Kubernetes secrets (AWS managed new KMS key).
     * If set to false, and no resouce provider for KMS key is defined (under GlobalResources.KmsKey), then no secrets
     * encyrption is applied.
     *
     * Default is true.
     */
    readonly useDefaultSecretEncryption?: boolean;
    /**
     * GitOps modes to be enabled. If not specified, GitOps mode is not enabled.
     */
    readonly enableGitOpsMode?: spi.GitOpsMode;
}
export declare class BlueprintPropsConstraints implements constraints.ConstraintsType<EksBlueprintProps> {
    /**
    * id can be no less than 1 character long, and no greater than 63 characters long.
    * https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
    */
    id: constraints.StringConstraint;
    /**
    * name can be no less than 1 character long, and no greater than 63 characters long.
    * https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
    */
    name: constraints.StringConstraint;
}
/**
 * Blueprint builder implements a builder pattern that improves readability (no bloated constructors)
 * and allows creating a blueprint in an abstract state that can be applied to various instantiations
 * in accounts and regions.
 */
export declare class BlueprintBuilder implements spi.AsyncStackBuilder {
    props: Partial<EksBlueprintProps>;
    env: {
        account?: string;
        region?: string;
    };
    constructor();
    name(name: string): this;
    account(account?: string): this;
    region(region?: string): this;
    version(version: "auto" | KubernetesVersion): this;
    enableControlPlaneLogTypes(...types: ControlPlaneLogType[]): this;
    enableGitOps(mode?: spi.GitOpsMode): this;
    withBlueprintProps(props: Partial<EksBlueprintProps>): this;
    addOns(...addOns: spi.ClusterAddOn[]): this;
    clusterProvider(clusterProvider: spi.ClusterProvider): this;
    id(id: string): this;
    teams(...teams: spi.Team[]): this;
    resourceProvider(name: string, provider: spi.ResourceProvider): this;
    useDefaultSecretEncryption(useDefault: boolean): this;
    clone(region?: string, account?: string): BlueprintBuilder;
    withEnv(env: cdk.Environment): this;
    build(scope: Construct, id: string, stackProps?: cdk.StackProps): EksBlueprint;
    buildAsync(scope: Construct, id: string, stackProps?: cdk.StackProps): Promise<EksBlueprint>;
}
/**
 * Entry point to the platform provisioning. Creates a CFN stack based on the provided configuration
 * and orchestrates provisioning of add-ons, teams and post deployment hooks.
 */
export declare class EksBlueprint extends cdk.Stack {
    static readonly USAGE_ID = "qs-1s1r465hk";
    private asyncTasks;
    private clusterInfo;
    static builder(): BlueprintBuilder;
    constructor(scope: Construct, blueprintProps: EksBlueprintProps, props?: cdk.StackProps);
    /**
     * Since constructor cannot be marked as async, adding a separate method to wait
     * for async code to finish.
     * @returns Promise that resolves to the blueprint
     */
    waitForAsyncTasks(): Promise<EksBlueprint>;
    /**
     * This method returns all the constructs produced by during the cluster creation (e.g. add-ons).
     * May be used in testing for verification.
     * @returns cluster info object
     */
    getClusterInfo(): spi.ClusterInfo;
    private provideNamedResources;
    /**
     * Resolves all dynamic proxies, that substitutes resource provider proxies with the resolved values.
     * @param blueprintProps
     * @param resourceContext
     * @returns a copy of blueprint props with resolved values
     */
    private resolveDynamicProxies;
    /**
     * Validates input against basic defined constraints.
     * @param blueprintProps
     */
    private validateInput;
}
