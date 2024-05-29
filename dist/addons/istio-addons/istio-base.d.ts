import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
import { Construct } from "constructs";
import { ClusterInfo } from "../../spi";
export declare const ISTIO_VERSION = "1.20.3";
/**
 * Configuration options for the add-on.
 */
export interface IstioBaseAddOnProps extends HelmAddOnUserProps {
    /**
    * Enable istioctl analysis which provides rich analysis of Istio configuration state in order to identity invalid or suboptimal configurations.
    * @default false
    */
    enableAnalysis?: boolean;
    /**
    *  Enable the istio base config validation.
    * @default true
    */
    configValidation?: boolean;
    /**
    *  If this is set to true, one Istiod will control remote clusters including CA.
    * @default false
    */
    externalIstiod?: boolean;
    /**
    * The address or hostname of the remote pilot
    * @default null
    */
    remotePilotAddress?: string;
    /**
    * Validation webhook configuration url
    * For example: https://$remotePilotAddress:15017/validate
    * @default null
    */
    validationURL?: string;
    /**
    * For istioctl usage to disable istio config crds in base.
    * @default true
    */
    enableIstioConfigCRDs?: boolean;
}
export declare class IstioBaseAddOn extends HelmAddOn {
    readonly options: IstioBaseAddOnProps;
    constructor(props?: IstioBaseAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
}
