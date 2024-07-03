import { ClusterInfo, ClusterPostDeploy, Team } from "../../spi";
import { HelmAddOn, HelmAddOnUserProps } from "../helm-addon";
/**
 * Properties available to configure opa gatekeeper.
 * namespace default is gatekeeper-system
 * version default is 3.12.0
 * values as per https://github.com/open-policy-agent/gatekeeper/tree/master/charts/gatekeeper
 */
export type OpaGatekeeperAddOnProps = HelmAddOnUserProps;
export declare class OpaGatekeeperAddOn extends HelmAddOn implements ClusterPostDeploy {
    private options;
    constructor(props?: OpaGatekeeperAddOnProps);
    deploy(_clusterInfo: ClusterInfo): void;
    postDeploy(clusterInfo: ClusterInfo, _teams: Team[]): void;
}
