import { ServiceAccount } from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";
import * as spi from "../../spi";
import { HelmAddOnUserProps } from '../helm-addon';
import { GitRepositoryReference } from "../../spi";
/**
 * Configuration options for add-on.
 */
export interface ArgoCDAddOnProps extends HelmAddOnUserProps {
    /**
     * Namespace where add-on will be deployed.
     * @default argocd
     */
    namespace?: string;
    /**
    * Helm chart version to use to install.
    * @default 5.51.6
    */
    version?: string;
    /**
     * If provided, the addon will bootstrap the app or apps in the provided repository.
     * In general, the repo is expected to have the app of apps, which can enable to bootstrap all workloads,
     * after the infrastructure and team provisioning is complete.
     * When GitOps mode is enabled via `ArgoGitOpsFactory` for deploying the AddOns, this bootstrap
     * repository will be used for provisioning all `HelmAddOn` based AddOns.
     */
    bootstrapRepo?: spi.ApplicationRepository;
    /**
     * Optional values for the bootstrap application. These may contain values such as domain named provisioned by other add-ons, certificate, and other parameters to pass
     * to the applications.
     */
    bootstrapValues?: spi.Values;
    /**
     * Additional GitOps applications and repositories. If there is a split between infra and application repositories then
     * bootstrap repo is expected to be leveraged for infrastructure and application deployments will contain additional applications.
     */
    workloadApplications?: spi.GitOpsApplicationDeployment[];
    /**
     * Optional admin password secret name as defined in AWS Secrets Manager (plaintext).
     * This allows to control admin password across the enterprise. Password will be retrieved and
     * stored as a non-reversible bcrypt hash.
     * Note: at present, change of password may require manual restart of argocd server.
     */
    adminPasswordSecretName?: string;
    /**
     * Values to pass to the chart as per https://github.com/argoproj/argo-helm/blob/master/charts/argo-cd/values.yaml.
     */
    values?: spi.Values;
}
/**
 * Implementation of ArgoCD add-on and post deployment hook.
 */
export declare class ArgoCDAddOn implements spi.ClusterAddOn, spi.ClusterPostDeploy {
    readonly options: ArgoCDAddOnProps;
    private chartNode?;
    constructor(props?: ArgoCDAddOnProps);
    generate(clusterInfo: spi.ClusterInfo, deployment: spi.GitOpsApplicationDeployment, wave?: number): Construct;
    /**
     * Implementation of the add-on contract deploy method.
    */
    deploy(clusterInfo: spi.ClusterInfo): Promise<Construct>;
    /**
     * Post deployment step is used to create a bootstrap repository if options are provided for the add-on.
     * @param clusterInfo
     * @param teams
     * @returns
     */
    postDeploy(clusterInfo: spi.ClusterInfo, teams: spi.Team[]): void;
    /**
     * @returns bcrypt hash of the admin secret provided from the AWS secret manager.
     */
    protected createAdminSecret(region: string): Promise<string>;
    /**
     * Creates a service account that can access secrets
     * @param clusterInfo
     * @returns
     */
    protected createServiceAccount(clusterInfo: spi.ClusterInfo): ServiceAccount;
    /**
     * Returns all repositories defined in the options.
     */
    protected getAllRepositories(): GitRepositoryReference[];
}
