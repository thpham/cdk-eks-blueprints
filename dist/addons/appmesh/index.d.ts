import { Construct } from "constructs";
import { ClusterInfo } from "../../spi";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
/**
 * Configuration options for the add-on.
 */
export interface AppMeshAddOnProps extends HelmAddOnUserProps {
    /**
     * If set to true, will enable tracing through App Mesh sidecars, such as X-Ray distributed tracing.
     * Note: support for X-Ray tracing does not depend on the XRay Daemon AddOn installed.
     */
    enableTracing?: boolean;
    /**
     * Tracing provider. Supported values are x-ray, jaeger, datadog
     */
    tracingProvider?: "x-ray" | "jaeger" | "datadog";
    /**
     * Used for Datadog or Jaeger tracing. Example values: datadog.appmesh-system.
     * Refer to https://aws.github.io/aws-app-mesh-controller-for-k8s/guide/tracing/ for more information.
     * Ignored for X-Ray.
     */
    tracingAddress?: string;
    /**
     * Jaeger or Datadog agent port (ignored for X-Ray)
     */
    tracingPort?: string;
}
export declare class AppMeshAddOn extends HelmAddOn {
    readonly options: AppMeshAddOnProps;
    constructor(props?: AppMeshAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
}
