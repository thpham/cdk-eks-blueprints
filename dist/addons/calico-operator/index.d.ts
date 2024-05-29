import { ClusterInfo } from "../../spi";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
/**
 * Configuration options for the add-on.
 */
export interface CalicoOperatorAddOnProps extends HelmAddOnUserProps {
    /**
     * Namespace where Calico will be installed
     * @default kube-system
     */
    namespace?: string;
    /**
     * Helm chart version to use to install.
     * @default 3.27.2
     */
    version?: string;
    /**
     * Values for the Helm chart.
     */
    values?: any;
}
export declare class CalicoOperatorAddOn extends HelmAddOn {
    private options;
    constructor(props?: CalicoOperatorAddOnProps);
    deploy(clusterInfo: ClusterInfo): void;
}
