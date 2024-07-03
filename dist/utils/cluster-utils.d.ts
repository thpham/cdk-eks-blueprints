import { Construct } from "constructs";
import { ClusterInfo } from "../spi";
interface Tag {
    Key: string;
    Value: string;
}
/**
 * Creates the node termination tag for the ASG
 * @param scope
 * @param autoScalingGroup
 */
export declare function tagAsg(scope: Construct, autoScalingGroup: string, tags: Tag[]): void;
/**
 * Makes the provided construct run before any capacity (worker nodes) is provisioned on the cluster.
 * Useful for control plane add-ons, such as VPC-CNI that must be provisioned before EC2 (or Fargate) capacity is added.
 * @param construct identifies construct (such as core add-on) that should be provisioned before capacity
 * @param clusterInfo cluster provisioning context
 */
export declare function deployBeforeCapacity(construct: Construct, clusterInfo: ClusterInfo): void;
export {};
