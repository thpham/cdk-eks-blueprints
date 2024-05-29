import { Construct } from "constructs";
import { ClusterInfo } from "../../spi";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
import * as kms from "aws-cdk-lib/aws-kms";
/**
 * Configuration options for the add-on.
 */
export interface EfsCsiDriverProps extends HelmAddOnUserProps {
    /**
     * Version of the driver to deploy. Uses chart version 2.2.3 by default if this value is not provided
     */
    version?: string;
    /***
     * Number of replicas to be deployed. If not provided, it defaults to 2. Note that the number of replicas
     * should be less than or equal to the number of nodes in the cluster otherwise some
     * pods will be left of pending state
     */
    replicaCount?: number;
    /**
     * List of KMS keys to be used for encryption
     */
    kmsKeys?: kms.Key[];
}
export declare class EfsCsiDriverAddOn extends HelmAddOn {
    readonly options: EfsCsiDriverProps;
    constructor(props?: EfsCsiDriverProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
}
