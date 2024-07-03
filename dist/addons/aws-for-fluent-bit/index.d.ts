import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from "constructs";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
import { ClusterInfo } from "../../spi/types";
/**
 * Configuration options for the FluentBit add-on.
 */
export interface AwsForFluentBitAddOnProps extends HelmAddOnUserProps {
    /**
     * Iam policies for the add-on.
     */
    iamPolicies?: PolicyStatement[];
    /**
     * Create Namespace with the provided one (will not if namespace is kube-system)
     */
    createNamespace?: boolean;
}
/**
 * AwsForFluentBitAddOn deploys FluentBit into an EKS cluster using the `aws-for-fluent-bit` Helm chart.
 * https://github.com/aws/eks-charts/tree/master/stable/aws-for-fluent-bit
 *
 * For information on how to configure the `aws-for-fluent-bit` Helm chart to forward logs and metrics to AWS services like CloudWatch or Kinesis, please view the values.yaml spec provided by the chart.
 * https://github.com/aws/eks-charts/blob/master/stable/aws-for-fluent-bit/values.yaml
 */
export declare class AwsForFluentBitAddOn extends HelmAddOn {
    readonly options: AwsForFluentBitAddOnProps;
    constructor(props?: AwsForFluentBitAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
}
