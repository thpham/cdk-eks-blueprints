import { Construct } from "constructs";
import { ClusterInfo } from "../../spi";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
/**
 * Configuration options for the add-on.
 */
export interface ClusterAutoScalerAddOnProps extends HelmAddOnUserProps {
    /**
     * Version of the Cluster Autoscaler
     * @default auto discovered based on EKS version.
     */
    version?: string;
    /**
     * Create namespace
     */
    createNamespace?: boolean;
}
export declare class ClusterAutoScalerAddOn extends HelmAddOn {
    private options;
    constructor(props?: ClusterAutoScalerAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
}
