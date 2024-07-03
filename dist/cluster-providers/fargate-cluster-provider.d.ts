import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import { GenericClusterProvider } from './generic-cluster-provider';
/**
 * Configuration options for the cluster provider.
 */
export interface FargateClusterProviderProps extends Partial<eks.CommonClusterOptions> {
    /**
    * The name for the cluster.
    */
    name?: string;
    /**
     * The Fargate profiles associated with the cluster.
     *
     * <b>Note</b> The `Map<>` form is deprecated and will be removed from a future release.
     */
    fargateProfiles?: {
        [key: string]: eks.FargateProfileOptions;
    } | Map<string, eks.FargateProfileOptions>;
    /**
     * Subnets are passed to the cluster configuration.
     */
    vpcSubnets?: ec2.SubnetSelection[];
    /**
     * Is it a private only EKS Cluster?
     * Defaults to private_and_public cluster, set to true for private cluster
     * @default false
     */
    privateCluster?: boolean;
    /**
     * Tags for the cluster
     */
    tags?: {
        [key: string]: string;
    };
}
/**
 * FargateClusterProvider provisions an EKS cluster with Fargate capacity only.
 */
export declare class FargateClusterProvider extends GenericClusterProvider {
    constructor(props?: FargateClusterProviderProps);
    /**
     * @override
     */
    internalCreateCluster(scope: Construct, id: string, clusterOptions: any): eks.Cluster;
}
