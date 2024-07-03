import { KubernetesManifest, ServiceAccount } from 'aws-cdk-lib/aws-eks';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CsiSecretProps } from '../addons/secrets-store/csi-driver-provider-aws-secrets';
import { ClusterInfo, Team, Values } from '../spi';
/**
 * Team properties.
 */
export declare class TeamProps {
    /**
     * Required unique name for organization.
     * May map to an OU name.
     */
    readonly name: string;
    /**
     * Defaults to team name prefixed by "team-"
     */
    readonly namespace?: string;
    /**
     *  Annotations such as necessary for GitOps engine.
     */
    readonly namespaceAnnotations?: {
        [key: string]: any;
    };
    /**
     * Labels such as necessary for AWS AppMesh
     */
    readonly namespaceLabels?: {
        [key: string]: any;
    };
    /**
     * Optional, but highly recommended setting to ensure predictable demands.
     */
    readonly namespaceHardLimits?: Values;
    /**
     * Service Account Name
     */
    readonly serviceAccountName?: string;
    /**
     * If specified, the IRSA account will be created for with the IRSA role
     * having the specified managed policies.
     *
     * @example
     * serviceAccountPolicies: [ManagedPolicy.fromAwsManagedPolicyName("")]
     *
     */
    readonly serviceAccountPolicies?: iam.IManagedPolicy[];
    /**
     *  Team members who need to get access to the cluster
     */
    readonly users?: Array<iam.ArnPrincipal>;
    /**
     * Options existing role that should be used for cluster access.
     * If userRole and users are not provided, then no IAM setup is performed.
     */
    readonly userRoleArn?: string;
    /**
     * Team Secrets
     */
    readonly teamSecrets?: CsiSecretProps[];
    /**
     * Optional, directory where a team's manifests are stored
     */
    readonly teamManifestDir?: string;
    /**
     * Optional, Use this function to add infrastructure or workloads
     * deploymentto the team
    */
    extensionFunction?(team: ApplicationTeam, clusterInfo: ClusterInfo): void;
}
export declare class ApplicationTeam implements Team {
    readonly teamProps: TeamProps;
    readonly name: string;
    namespaceManifest: KubernetesManifest;
    serviceAccount: ServiceAccount;
    constructor(teamProps: TeamProps);
    setup(clusterInfo: ClusterInfo): void;
    protected defaultSetupAccess(clusterInfo: ClusterInfo): void;
    /**
     *
     * @param clusterInfo
     */
    protected defaultSetupAdminAccess(clusterInfo: ClusterInfo): void;
    /**
     * Creates a new role with trust relationship or adds trust relationship for an existing role.
     * @param clusterInfo
     * @param users
     * @param role may be null if both role and users were not provided
     * @returns
     */
    protected getOrCreateRole(clusterInfo: ClusterInfo, users: Array<iam.ArnPrincipal>, roleArn?: string): iam.IRole | undefined;
    /**
     * Creates namespace and sets up policies.
     * @param clusterInfo
     */
    protected setupNamespace(clusterInfo: ClusterInfo): void;
    /**
     * Sets up quotas
     * @param clusterInfo
     * @param namespaceName
     */
    protected setupNamespacePolicies(clusterInfo: ClusterInfo, namespaceName: string): void;
    /**
     * Sets up ServiceAccount for the team namespace
     * @param clusterInfo
     */
    protected setupServiceAccount(clusterInfo: ClusterInfo): void;
    /**
     * Sets up secrets
     * @param clusterInfo
     */
    protected setupSecrets(clusterInfo: ClusterInfo): void;
}
/**
 * Platform team will setup all team members as admin access to the cluster by adding them to the master group.
 * The setup skips namespace/quota configuration.
 */
export declare class PlatformTeam extends ApplicationTeam {
    constructor(teamProps: TeamProps);
    /**
     * Override
     * @param clusterInfo
     */
    setup(clusterInfo: ClusterInfo): void;
}
