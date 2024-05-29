import { ClusterInfo, ClusterProvider } from "../spi";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import { IRole } from "aws-cdk-lib/aws-iam";
import { IKey } from "aws-cdk-lib/aws-kms";
import * as sdk from "@aws-sdk/client-eks";
import { Construct } from "constructs";
/**
 * Properties object for the ImportClusterProvider.
 */
export interface ImportClusterProviderProps extends Omit<eks.ClusterAttributes, "vpc"> {
    /**
     * Used for the CDK construct id for the imported cluster. Useful when passing tokens for cluster name.
     */
    id?: string;
    /**
     * This property is needed as it drives selection of certain add-on versions as well as kubectl layer.
     */
    version: eks.KubernetesVersion;
}
/**
 * Importing cluster into the blueprint enabling limited blueprinting capabilities such as adding certain addons,
 * teams.
 */
export declare class ImportClusterProvider implements ClusterProvider {
    readonly props: ImportClusterProviderProps;
    readonly id: string;
    constructor(props: ImportClusterProviderProps);
    /**
     * Implements contract method to create a cluster, by importing an existing cluster.
     * @param scope
     * @param vpc
     * @param _secretsEncryptionKey
     * @returns
     */
    createCluster(scope: Construct, vpc: IVpc, _secretsEncryptionKey?: IKey | undefined): ClusterInfo;
    /**
     * Requires iam permission to eks.DescribeCluster at build time. Retrieves the cluster information using DescribeCluster api and
     * creates an import cluster provider.
     * @param clusterName name of the cluster
     * @param region target rego
     * @param kubectlRole iam Role that provides access to the cluster API (kubectl). The CDK custom resource should be able to assume the role
     * which in some cases may require trust policy for the account root principal.
     * @returns the cluster provider with the import cluster configuration
     */
    static fromClusterLookup(clusterName: string, region: string, kubectlRole: IRole): Promise<ClusterProvider>;
    /**
     * Creates a cluster provider for an existing cluster based on the passed result of the describe cluster command.
     * @param sdkCluster
     * @param kubectlRole
     * @returns
     */
    static fromClusterAttributes(sdkCluster: sdk.Cluster, kubectlRole: IRole): ClusterProvider;
}
/**
 * Wraps API call to get the data on the eks.Cluster.
 * @param clusterName
 * @param region
 * @returns
 */
export declare function describeCluster(clusterName: string, region: string): Promise<sdk.Cluster>;
