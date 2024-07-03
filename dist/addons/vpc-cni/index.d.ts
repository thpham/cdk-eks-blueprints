import { ISecurityGroup, ISubnet } from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from 'constructs';
import { ClusterInfo } from "../../spi";
import { CoreAddOn } from "../core-addon";
/**
 * User provided option for the Helm Chart
 */
export interface VpcCniAddOnProps {
    /**
     * `ADDITIONAL_ENI_TAGS` Environment Variable. Type: String.
     * Metadata applied to ENI helps you categorize and organize your
     * resources for billing or other purposes.
     */
    additionalEniTags?: string;
    /**
     * `ANNOTATE_POD_IP` Environment Variable. Type: Boolean.
     * Setting ANNOTATE_POD_IP to true will allow IPAMD to add an annotation
     * vpc.amazonaws.com/pod-ips to the pod with pod IP.
     */
    annotatePodIp?: boolean;
    /**
     * `AWS_EC2_ENDPOINT` Environment Variable. Type: string.
     * Specifies the EC2 endpoint to use. This is useful if you
     * are using a custom endpoint for EC2.
     */
    awsEc2Endpoint?: string;
    /**
     * `AWS_EXTERNAL_SERVICE_CIDRS` Environment Variable. Type: string.
     * Specify a comma-separated list of IPv4 CIDRs that must be routed
     * via main routing table. This is required for secondary ENIs to reach
     * endpoints outside of VPC that are backed by a service.
     */
    awsExternalServiceCidrs?: string;
    /**
     * `AWS_MANAGE_ENIS_NON_SCHEDULABLE` Environment Variable. Type: Boolean.
     * Specifies whether IPAMD should allocate or deallocate ENIs on a non-schedulable
     * node.
     */
    awsManageEnisNonSchedulable?: boolean;
    /**
     * `AWS_VPC_CNI_NODE_PORT_SUPPORT` Environment Variable. Type: Boolean.
     * Specifies whether NodePort services are enabled on a worker node's primary
     * network interface.
     */
    awsVpcCniNodePortSupport?: boolean;
    /**
     * `AWS_VPC_ENI_MTU` Environment Variable. Type: Integer.
     * Used to configure the MTU size for attached ENIs. The valid range is
     * from 576 to 9001.
     */
    awsVpcEniMtu?: number;
    /**
    * `AWS_VPC_K8S_CNI_CUSTOM_NETWORK_CFG` Environment Variable. Type: Boolean.
    * Specifies that your pods may use subnets and security groups that are
    * independent of your worker node's VPC configuration.
    */
    awsVpcK8sCniCustomNetworkCfg?: boolean;
    /**
    * `AWS_VPC_K8S_CNI_VETHPREFIX` Environment Variable. Type: String.
    * Specifies the veth prefix used to generate the host-side veth device name
    * for the CNI.
    */
    awsVpcK8sCniVethPrefix?: string;
    /**
    * `AWS_VPC_K8S_CNI_EXCLUDE_SNAT_CIDRS` Environment Variable. Type: String.
    Specify a comma-separated list of IPv4 CIDRs to exclude from SNAT.
    */
    awsVpcK8sExcludeSnatCidrs?: string;
    /**
    * `AWS_VPC_K8S_CNI_LOGLEVEL` Environment Variable. Type: String.
    * Specifies the loglevel for ipamd and cni-metric-helper.
    */
    awsVpcK8sCniLogLevel?: string;
    /**
     * `AWS_VPC_K8S_CNI_LOG_FILE` Environment Variable. Type: String.
     * Specifies where to write the logging output of ipamd. Either to stdout
     * or to override the default file (i.e., /var/log/aws-routed-eni/ipamd.log).
     */
    awsVpcK8sCniLogFile?: string;
    /**
     * `AWS_VPC_K8S_CNI_RANDOMIZESNAT` Environment Variable. Type: String.
     * Specifies whether the SNAT iptables rule should randomize the outgoing
     * ports for connections.
     */
    awsVpcK8sCniRandomizeSnat?: string;
    /**
     * `AWS_VPC_K8S_CNI_EXTERNALSNAT` Environment Variable. Type: Boolean.
     * Specifies whether an external NAT gateway should be used to provide SNAT
     * of secondary ENI IP addresses.
     */
    awsVpcK8sCniExternalSnat?: boolean;
    /**
     * `AWS_VPC_K8S_PLUGIN_LOG_FILE` Environment Variable. Type: String.
     * Specifies where to write the logging output for aws-cni plugin.
     */
    awsVpcK8sPluginLogFile?: string;
    /**
     * `AWS_VPC_K8S_PLUGIN_LOG_LEVEL` Environment Variable. Type: String.
     * Specifies the loglevel for aws-cni plugin.
     */
    awsVpcK8sPluginLogLevel?: string;
    /**
     * `CLUSTER_ENDPOINT` Environment Variable. Type: String.
     * Specifies the cluster endpoint to use for connecting to
     * the api-server without relying on kube-proxy.
     */
    clusterEndpoint?: string;
    /**
     * CustomNetworkingConfig holding Secondary Subnet IDs for creating `ENIConfig`
     */
    customNetworkingConfig?: CustomNetworkingConfig;
    /**
     * `DISABLE_LEAKED_ENI_CLEANUP` Environment Variable. Type: Boolean.
     */
    disableLeakedEniCleanup?: boolean;
    /**
     * `DISABLE_INTROSPECTION` Environment Variable. Type: Boolean.
     */
    disableIntrospection?: boolean;
    /**
    * `DISABLE_METRICS` Environment Variable. Type: Boolean.
    * Specifies whether the prometheus metrics endpoint is disabled or not for
    * ipamd. By default metrics are published on :61678/metrics.
    */
    disableMetrics?: boolean;
    /**
    * `DISABLE_NETWORK_RESOURCE_PROVISIONING` Environment Variable. Type: Boolean.
    * Setting DISABLE_NETWORK_RESOURCE_PROVISIONING to true will make IPAMD
    * depend only on IMDS to get attached ENIs and IPs/prefixes.
    */
    disablenetworkResourceProvisioning?: boolean;
    /**
    * `DISABLE_TCP_EARLY_DEMUX` Environment Variable. Type: Boolean.
    * If ENABLE_POD_ENI is set to true, for the kubelet to connect via TCP
    * to pods that are using per pod security groups, DISABLE_TCP_EARLY_DEMUX
    * should be set to true for amazon-k8s-cni-init the container under initcontainers.
    */
    disableTcpEarlyDemux?: boolean;
    /**
    * `ENABLE_BANDWIDTH_PLUGIN` Environment Variable. Type: Boolean.
    * Setting ENABLE_BANDWIDTH_PLUGIN to true will update 10-aws.conflist to
    * include upstream bandwidth plugin as a chained plugin.
    */
    enableBandwidthPlugin?: boolean;
    /**
    * `ENABLE_NFTABLES` Environment Variable. Type: Boolean.
    * VPC CNI uses iptables-legacy by default. Setting ENABLE_NFTABLES
    * to true will update VPC CNI to use iptables-nft
    */
    enableNftables?: boolean;
    /**
     * `ENABLE_POD_ENI` Environment Variable. Type: Boolean.
    * Setting ENABLE_POD_ENI to true will allow IPAMD to add the
    * vpc.amazonaws.com/has-trunk-attached label to the node if the instance
    * has the capacity to attach an additional ENI.
    */
    enablePodEni?: boolean;
    /**
     * `ENABLE_PREFIX_DELEGATION` Environment Variable. Type: Boolean.
     * To enable prefix delegation on nitro instances. Setting
     * ENABLE_PREFIX_DELEGATION to true will start allocating a prefix (/28 for IPv4 and /80 for IPv6) instead of a secondary IP in the ENIs subnet.
    */
    enablePrefixDelegation?: boolean;
    /**
    * `ENABLE_V6_EGRESS` Environment Variable. Type: Boolean.
    * Specifies whether PODs in an IPv4 cluster support IPv6 egress.
    * If env is set to true, range fd00::ac:00/118 is reserved for IPv6 egress.
    */
    enableV6Egress?: boolean;
    /**
    * `ENI_CONFIG_LABEL_DEF` Environment Variable. Type: String.
    * Specifies node label key name. This should be used when
    * AWS_VPC_K8S_CNI_CUSTOM_NETWORK_CFG=true.
    */
    eniConfigLabelDef?: string;
    /**
     * `ENI_CONFIG_ANNOTATION_DEF` Environment Variable. Type: String.
     * Specifies node annotation key name. This should be used when
     * AWS_VPC_K8S_CNI_CUSTOM_NETWORK_CFG=true
    */
    eniConfigAnnotationDef?: string;
    /**
     * `INTROSPECTION_BIND_ADDRESS` Environment Variable. Type: String.
     * Specifies the bind address for the introspection endpoint.
    */
    introspectionBindAddress?: string;
    /**
    * `MAX_ENI` Environment Variable. Format integer.
    * Specifies the maximum number of ENIs that will be attached to the node.
    */
    maxEni?: number;
    /**
    * `MINIMUM_IP_TARGET` Environment Variable. Format integer.
    * Specifies the number of total IP addresses that the ipamd
    * daemon should attempt to allocate for pod assignment on the node.
    */
    minimumIpTarget?: number;
    /**
     * `POD_SECURITY_GROUP_ENFORCING_MODE` Environment Variable. Type: String.
     * Once ENABLE_POD_ENI is set to true, this value controls how the traffic
     * of pods with the security group behaves.
    */
    podSecurityGroupEnforcingMode?: string;
    /**
    * `WARM_ENI_TARGET` Environment Variable. Format integer.
    * Specifies the number of free elastic network interfaces (and all of their
    * available IP addresses) that the ipamd daemon should attempt to keep
    * available for pod assignment on the node.
    */
    warmEniTarget?: number;
    /**
    * `WARM_IP_TARGET` Environment Variable. Format integer.
    * Specifies the number of free IP addresses that the ipamd daemon
    * should attempt to keep available for pod assignment on the node.
    */
    warmIpTarget?: number;
    /**
    * `WARM_PREFIX_TARGET` Environment Variable. Format integer.
    * Specifies the number of free IPv4(/28) prefixes that the ipamd daemon
    * should attempt to keep available for pod assignment on the node.
    */
    warmPrefixTarget?: number;
    /**
     * If specified, an IRSA account will be created for the VPC-CNI add-on with the IRSA role
     * having the specified managed policies. When specified, the node role for the cluster provider can be configured
     * without the CNI policy.
     *
     * For IPv4 the required managed policy is AmazonEKS_CNI_Policy.
     * @example
     * serviceAccountPolicies: [ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy")]
     *
     */
    serviceAccountPolicies?: iam.IManagedPolicy[];
    /**
     * Enable kubernetes network policy in the VPC CNI introduced in vpc-cni 1.14
     * More informaton on official AWS documentation: https://docs.aws.amazon.com/eks/latest/userguide/cni-network-policy.html
     *
     */
    enableNetworkPolicy?: boolean;
    /**
     * Enable windows support for your cluster
     *
     */
    enableWindowsIpam?: boolean;
    /**
     * Version of the add-on to use. Must match the version of the cluster where it
     * will be deployed.
     */
    version?: string;
}
export interface CustomNetworkingConfig {
    /**
     * Secondary subnets of your VPC
     */
    readonly subnets?: ISubnet[];
    /**
     * Security group of secondary ENI
     */
    readonly securityGroup?: ISecurityGroup;
}
/**
 * Implementation of VpcCni EKS add-on with Advanced Configurations.
 */
export declare class VpcCniAddOn extends CoreAddOn {
    readonly vpcCniAddOnProps: VpcCniAddOnProps;
    readonly id?: string;
    constructor(props?: VpcCniAddOnProps);
    deploy(clusterInfo: ClusterInfo): Promise<Construct>;
    /**
     * Overrides the core method to provide managed policies.
     * @param _clusterInfo
     * @returns
     */
    provideManagedPolicies(_clusterInfo: ClusterInfo): iam.IManagedPolicy[] | undefined;
    /**
     * Overrides the core addon method in order to replace the SA if exists (which is the case for aws-node).
     * @param clusterInfo
     * @param saNamespace
     * @param policies
     * @returns
     */
    createServiceAccount(clusterInfo: ClusterInfo, saNamespace: string, policies: iam.IManagedPolicy[]): eks.ServiceAccount;
}
