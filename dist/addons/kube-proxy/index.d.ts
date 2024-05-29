import { CoreAddOn, CoreAddOnProps } from "../core-addon";
/**
 * Configuration options for the coredns add-on.
 */
export type kubeProxyAddOnProps = Omit<CoreAddOnProps, "saName" | "addOnName" | "version">;
/**
 * Implementation of KubeProxy EKS add-on.
 */
export declare class KubeProxyAddOn extends CoreAddOn {
    constructor(version?: string, props?: kubeProxyAddOnProps);
}
