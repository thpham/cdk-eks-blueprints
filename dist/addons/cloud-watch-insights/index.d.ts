import { Construct } from 'constructs';
import { ClusterInfo, Values } from "../../spi";
import { CoreAddOn, CoreAddOnProps } from "../core-addon";
import { IManagedPolicy } from "aws-cdk-lib/aws-iam";
import { ServiceAccount } from "aws-cdk-lib/aws-eks";
/**
 * Configuration options for AWS Container Insights add-on.
 */
export type CloudWatchInsightsAddOnProps = Omit<CoreAddOnProps, "saName" | "addOnName" | "version"> & {
    /**
     * Gives CloudWatch agent access to EBS performance systems by adding an IAM role as defined here:
     * https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/install-CloudWatch-Observability-EKS-addon.html#install-CloudWatch-Observability-EKS-addon-configuration
     */
    ebsPerformanceLogs?: boolean;
    /**
     * Custom CloudWatch Agent configuration, specifics can be found here:
     * https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/install-CloudWatch-Observability-EKS-addon.html#install-CloudWatch-Observability-EKS-addon-configuration
     */
    customCloudWatchAgentConfig?: Values;
    /**
     * Define the CloudWatch Agent configuration
     */
    version?: string;
};
/**
 * Implementation of AWS CloudWatch Insights Addon
 */
export declare class CloudWatchInsights extends CoreAddOn {
    readonly options: CloudWatchInsightsAddOnProps;
    constructor(props?: CloudWatchInsightsAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
    createServiceAccount(clusterInfo: ClusterInfo, saNamespace: string, _policies: IManagedPolicy[]): ServiceAccount;
}
