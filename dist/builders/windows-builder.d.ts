import { BlueprintBuilder } from '../stacks';
import * as addons from '../addons';
import * as eks from "aws-cdk-lib/aws-eks";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodegroupAmiType } from 'aws-cdk-lib/aws-eks';
/**
 * Configuration options for Windows Builder.
 */
export interface WindowsOptions {
    /**
     * Required, Kubernetes version to use for the cluster.
     */
    kubernetesVersion: eks.KubernetesVersion;
    /**
     * Required, Instance class to use for the cluster.
     */
    instanceClass: ec2.InstanceClass;
    /**
     * Required, Instance size to use for the cluster.
     */
    instanceSize: ec2.InstanceSize;
    /**
     * optional, Node IAM Role to be attached to Windows
     * and Non-windows nodes.
     */
    nodeRole?: iam.Role;
    /**
     * Optional, AMI Type for Windows Nodes
     */
    windowsAmiType?: NodegroupAmiType;
    /**
     * Optional, Desired number of nodes to use for the cluster.
     */
    desiredNodeCount?: number;
    /**
     * Optional, Minimum number of nodes to use for the cluster.
     */
    minNodeSize?: number;
    /**
     * Optional, Maximum number of nodes to use for the cluster.
     */
    maxNodeSize?: number;
    /**
     * Optional, Block device size.
     */
    blockDeviceSize?: number;
    /**
     * Optional, No Schedule for Windows Nodes, this allows Windows
     * nodes to be marked as no-schedule by default to prevent any
     * linux workloads from scheduling.
     */
    noScheduleForWindowsNodes?: boolean;
    /**
     * Optional, Cluster Provider Tags.
     */
    clusterProviderTags?: {
        [key: string]: string;
    };
    genericNodeGroupOptions: eks.NodegroupOptions;
    windowsNodeGroupOptions: eks.NodegroupOptions;
}
/**
 * This builder class helps you prepare a blueprint for setting up
 * windows nodes with EKS cluster. The `WindowsBuilder` creates the following:
 * 1. An EKS Cluster` with passed k8s version and cluster tags.
 * 2. A non-windows nodegroup for standard software.
 * 3. A windows nodegroup to schedule windows workloads
 */
export declare class WindowsBuilder extends BlueprintBuilder {
    private karpenterProps;
    /**
     * This method helps you prepare a blueprint for setting up windows nodes with
     * usage tracking addon
     */
    static builder(options: WindowsOptions): WindowsBuilder;
    enableKarpenter(): WindowsBuilder;
    withKarpenterProps(props: addons.KarpenterAddOnProps): this;
}
