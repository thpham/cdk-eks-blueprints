import { ServiceAccount } from 'aws-cdk-lib/aws-eks';
import { Construct } from "constructs";
import { ClusterInfo, Values } from '../../spi';
import { SecretProvider } from './secret-provider';
/**
 * CsiSecret Props
 */
export interface CsiSecretProps {
    /**
     * Implementation of the secret provider that returns a reference to an Secrets Manager entry or Blueprints Parameter.
     */
    secretProvider: SecretProvider;
    /**
     * For secrets containing JSON structure, an optional JMES Path (https://jmespath.org/) object to decompose individual keys as separate
     * secret object data.
     */
    jmesPath?: JmesPathObject[];
    /**
     * Kubernetes secret for cases when CSI secret should create a standard Kubernetes Secret object.
     */
    kubernetesSecret?: KubernetesSecret;
}
export interface JmesPathObject {
    objectAlias: string;
    path: string;
}
/**
 * Configuration for Kubernetes Secrets
 */
export interface KubernetesSecret {
    /**
     * Kubernetes Secret Name
     */
    secretName: string;
    /**
     * An alias for the AWS secret once it is synced as a Kubernetes secret.
     */
    secretAlias?: string;
    /**
     * Type of Kubernetes Secret
     */
    type?: KubernetesSecretType;
    /**
     * Secret Labels
     */
    labels?: Values;
    /**
     * Kubernetes SecretObject Data
     */
    data?: KubernetesSecretObjectData[];
}
/**
 * Data for Kubernetes Secrets
 */
interface KubernetesSecretObjectData {
    /**
     * Name of the AWS Secret that is synced
     */
    objectName?: string;
    /**
     * Kubernetes Secret Key
     */
    key?: string;
}
export declare enum KubernetesSecretType {
    OPAQUE = "Opaque",
    BASIC_AUTH = "kubernetes.io/basic-auth",
    TOKEN = "bootstrap.kubernetes.io/token",
    DOCKER_CONFIG_JSON = "kubernetes.io/dockerconfigjson",
    DOCKER_CONFIG = "kubernetes.io/dockercfg",
    SSH_AUTH = "kubernetes.io/ssh-auth",
    SERVICE_ACCOUNT_TOKEN = "kubernetes.io/service-account-token",
    TLS = "kubernetes.io/tls"
}
export declare class SecretProviderClass {
    private clusterInfo;
    private serviceAccount;
    private secretProviderClassName;
    private parameterObjects;
    private kubernetesSecrets;
    private csiSecrets;
    private secretProviderClassPromise;
    constructor(clusterInfo: ClusterInfo, serviceAccount: ServiceAccount, secretProviderClassName: string, ...csiSecrets: CsiSecretProps[]);
    addDependent(...constructs: Construct[]): void;
    /**
     * Optionally returns volume mounts for a pod or helm chart that supports volume mounts.
     */
    getVolumeMounts(volumeName: string, mountPath?: string): Values;
    /**
     * Setup CSI secrets
     * @param clusterInfo
     */
    protected setupSecrets(): Promise<Construct>;
    /**
     * Creates Service Account for CSI Secrets driver and sets up the IAM Policies
     * needed to access the AWS Secrets
     * @param clusterInfo
     * @param serviceAccount
     */
    protected addPolicyToServiceAccount(): void;
    /**
     * Create and apply the SecretProviderClass manifest
     * @param clusterInfo
     * @param serviceAccount
     * @param csiDriver
     */
    protected createSecretProviderClass(csiDriver: Construct): Construct;
}
export {};
