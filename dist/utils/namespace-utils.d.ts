import { KubernetesManifest } from "aws-cdk-lib/aws-eks";
import * as eks from "aws-cdk-lib/aws-eks";
import { Values } from "../spi";
/**
  * Creates namespace
  * (a prerequisite for serviceaccount and helm chart execution for many add-ons).
  * @param name
  * @param cluster
  * @param overwrite
  * @param prune
  * @returns KubernetesManifest
  */
export declare function createNamespace(name: string, cluster: eks.ICluster, overwrite?: boolean, prune?: boolean, annotations?: Values, labels?: Values): KubernetesManifest;
