import { Construct } from 'constructs';
import * as spi from "../../spi";
import { ClusterInfo } from "../../spi";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
/**
 * Options for a FluxCD GitRepository
 * path and name parameter within repository parameter do not have any affect in flux, may have an affect in argo
 */
export interface FluxGitRepo extends Required<spi.GitOpsApplicationDeployment> {
    /**
    * Flux SecretRef */
    secretRefName?: string;
    /**
    * Internal for Flux sync.
    * Default `5m0s` */
    syncInterval?: string;
    /**
    * List of kustomizations to create from different paths in repo. */
    kustomizations?: FluxKustomizationProps[];
}
export interface FluxKustomizationProps {
    /**
     * Flux Kustomization path within the GitRepository
     * Do not use the path in the repository field*/
    kustomizationPath: string;
    /**
    * Flux Kustomization Target Namespace.
    * Note: when set, this parameter will override all the objects that are part of the Kustomization, please see https://fluxcd.io/flux/components/kustomize/kustomization/#target-namespace */
    kustomizationTargetNamespace?: string;
    /**
    * Internal for Flux sync.
    * Default `5m0s` */
    syncInterval?: string;
    /**
    * Flux Kustomization Prune.
    * Default `true` */
    prune?: boolean;
    /**
    * Flux Kustomization Timeout.
    * Default `1m` */
    timeout?: string;
}
/**
 * User provided options for the Helm Chart
 */
export interface FluxCDAddOnProps extends HelmAddOnUserProps {
    /**
     * Namespace where add-on will be deployed.
     * @default flux-system
     */
    namespace?: string;
    /**
    * Helm chart version to use to install.
    * @default 2.12.4
    */
    version?: string;
    /**
     * Values to pass to the chart as per https://github.com/argoproj/argo-helm/blob/master/charts/argo-cd/values.yaml.
     */
    values?: spi.Values;
    /**
     * To Create Namespace using CDK
     */
    createNamespace?: boolean;
    /**
     * List of repositories to sync from.
     */
    repositories?: FluxGitRepo[];
}
/**
 * Main class to instantiate the Helm chart
 */
export declare class FluxCDAddOn extends HelmAddOn {
    readonly options: FluxCDAddOnProps;
    constructor(props?: FluxCDAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
}
