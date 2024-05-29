import { CoreAddOn } from "../core-addon";
/**
 * Interface for Upbound Universal Crossplane EKS add-on options
 */
interface UpboundUniversalCrossplaneAddOnProps {
    /**
     * Version of the driver to deploy
     */
    version?: string;
}
/**
 * Implementation of Upbound Crossplane EKS add-on
 */
export declare class UpboundUniversalCrossplaneAddOn extends CoreAddOn {
    readonly options?: UpboundUniversalCrossplaneAddOnProps | undefined;
    constructor(options?: UpboundUniversalCrossplaneAddOnProps | undefined);
}
export {};
