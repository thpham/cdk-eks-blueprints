import { Construct } from "constructs";
import { ClusterInfo, Values } from "../../spi";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
/**
 * Properties available to configure the nginx ingress controller.
 * Values to pass to the chart as per https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/
 */
export interface IngressNginxAddOnProps extends HelmAddOnUserProps {
    /**
     * The name of the Kubernetes Ingress Helm release.
     */
    name?: string;
    /**
     * The name of the chart within the Helm release.
     */
    chart?: string;
    /**
     * Unique identifier for the release.
     */
    release?: string;
    /**
     * Specific version of the chart to be deployed.
     */
    version?: string;
    /**
     * URL of the chart repository.
     */
    repository?: string;
    /**
     * Kubernetes namespace where the ingress controller will be installed.
     * @default 'kube-system'
     */
    namespace?: string;
    /**
     * Custom values passed to the Helm chart.
     */
    values?: Values;
    /**
     * Specifies the protocol used by the load balancer.
     * HTTP, HTTPS, AUTO_HTTP, GRPC, GRPCS, and FCGI are supported.
     * @default 'http'
     */
    backendProtocol?: string;
    /**
     * Determines whether cross-zone load balancing is enabled for the load balancer.
     * @default true
     */
    crossZoneEnabled?: boolean;
    /**
     * Indicates whether the load balancer is exposed to the internet.
     * Set to false for an internal load balancer.
     * @default true
     */
    internetFacing?: boolean;
    /**
     * Specifies how traffic is routed to pods. Can be either 'ip' or 'instance'.
     * 'ip' mode is more performant and requires VPC-CNI.
     * @default 'ip'
     */
    targetType?: string;
    /**
     * Hostname to be used with external DNS services for automatic DNS configuration.
     */
    externalDnsHostname?: string;
    /**
     * Specifies the class of the ingress controller. Used to differentiate between multiple ingress controllers.
     * @default 'nginx'
     */
    ingressClassName?: string;
    /**
     * Specifies the controller class used for handling ingress in a cluster.
     */
    controllerClass?: string;
    /**
     * Identifier used for leader election during the deployment of multiple ingress controllers.
     */
    electionId?: string;
    /**
     * Determines if the ingress controller should be set as the default controller for handling ingress resources.
     * @default false
     */
    isDefaultClass?: boolean;
    /**
     * Name of the certificate {@link NamedResourceProvider} to be used for certificate look up.
     * @see {@link ImportCertificateProvider} and {@link CreateCertificateProvider} for examples of certificate providers.
     */
    certificateResourceName?: string;
    /**
     * ARN of the AWS Certificate Manager certificate to be used for HTTPS.
     */
    certificateResourceARN?: string;
    /**
     * Protocol for the load balancer SSL port.
     * @default 'https'
     */
    sslPort?: string;
    /**
     * Protocol for the load balancer HTTP target port.
     * @default 'http'
     */
    httpTargetPort?: string;
    /**
     * Protocol for the load balancer HTTPS target port.
     * @default 'https'
     */
    httpsTargetPort?: string;
    /**
     * Determines if SSL redirection should be forced.
     * @default true
     */
    forceSSLRedirect?: boolean;
    /**
     * Type of the load balancer.
     * @default 'external'
     */
    loadBalancerType?: string;
    /**
     * ARN of the AWS Certificate Manager certificate to be used for HTTPS.
     * @default "3600"
     */
    idleTimeout?: string;
    /**
     * Kubernetes service type for the ingress controller. Supported values are 'ClusterIP', 'LoadBalancer' and 'NodePort'.
     * @default 'LoadBalancer'
     */
    serviceType?: string;
}
export declare class IngressNginxAddOn extends HelmAddOn {
    private readonly options;
    constructor(props?: IngressNginxAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
}
