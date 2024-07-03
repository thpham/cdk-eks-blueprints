import 'source-map-support/register';
import { Construct } from 'constructs';
import { ClusterInfo } from "../../spi";
import { IRole } from 'aws-cdk-lib/aws-iam';
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
/**
 * User provided options for the Helm Chart.
 */
export interface UpboundCrossplaneAddOnProps extends HelmAddOnUserProps {
    /**
     * To Create Namespace using CDK
     */
    createNamespace?: boolean;
    clusterAccessRole: IRole;
}
export declare class UpboundCrossplaneAddOn extends HelmAddOn {
    readonly options: UpboundCrossplaneAddOnProps;
    constructor(props?: UpboundCrossplaneAddOnProps);
    deploy(clusterInfo: ClusterInfo): void | Promise<Construct>;
}
