import { BlueprintBuilder } from '../stacks';
import * as eks from "aws-cdk-lib/aws-eks";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { ValuesSchema } from '../addons/gpu-operator/values';
/**
 * Configuration options for GPU Builder.
 */
export interface GpuOptions {
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
     * Optional, Desired number of nodes to use for the cluster.
     */
    desiredNodeSize?: number;
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
     * Optional, Cluster Provider Tags.
     */
    clusterProviderTags?: {
        [key: string]: string;
    };
    /**
     * Optional, Node Group Tags for AL2 nodes
     * which run standard cluster software.
     */
    nodeGroupTags?: {
        [key: string]: string;
    };
}
export declare class GpuBuilder extends BlueprintBuilder {
    /**
     * This method helps you prepare a blueprint for setting up observability
     * returning an array of blueprint addons for AWS managed open source services
     */
    enableGpu(values?: ValuesSchema): GpuBuilder;
    /**
    * This method helps you prepare a blueprint for setting up windows nodes with
    * usage tracking addon
    */
    static builder(options: GpuOptions): GpuBuilder;
}
