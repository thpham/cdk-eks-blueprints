import { ClusterInfo } from "../../spi";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
/**
 * Configuration options for the add-on.
 * @deprecated
 */
export interface CalicoAddOnProps extends HelmAddOnUserProps {
    /**
     * Namespace where Calico will be installed
     * @default kube-system
     */
    namespace?: string;
    /**
     * Helm chart version to use to install.
     * @default 0.3.10
     */
    version?: string;
    /**
     * Values for the Helm chart.
     */
    values?: any;
}
/**
 * @deprecated use CalicoOperator add-on instead
 */
export declare class CalicoAddOn extends HelmAddOn {
    private options;
    constructor(props?: CalicoAddOnProps);
    deploy(clusterInfo: ClusterInfo): void;
}
