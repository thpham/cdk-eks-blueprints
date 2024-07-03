"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchEksTeam = void 0;
const cluster_providers_1 = require("../../cluster-providers");
const team_1 = require("../team");
const kubectl_provider_1 = require("../../addons/helm-addon/kubectl-provider");
const yaml_utils_1 = require("../../utils/yaml-utils");
const batch = require("aws-cdk-lib/aws-batch");
const iam = require("aws-cdk-lib/aws-iam");
const assert = require("assert");
const NAMESPACE = 'aws-batch';
const defaultProps = {
    name: NAMESPACE,
    namespace: NAMESPACE,
};
/*
 *This class define the Team that can be used with AWS Batch on EKS
 */
class BatchEksTeam extends team_1.ApplicationTeam {
    /**
     * @public
     * @param {BatchEksTeamProps} props the Batch team definition {@link BatchEksTeamProps}
     */
    constructor(props) {
        const teamProps = { ...defaultProps, ...props };
        super(teamProps);
        this.batchTeamProps = teamProps;
    }
    setup(clusterInfo) {
        const computeResources = this.batchTeamProps.computeResources;
        const priority = computeResources.priority;
        assert(computeResources.minvCpus < computeResources.maxvCpus, 'Max vCPU must be greater than Min vCPU');
        assert((priority >= 0) && (priority % 1 == 0), 'Priority must be a whole number.');
        const awsBatchAddOn = clusterInfo.getProvisionedAddOn('AwsBatchAddOn');
        if (awsBatchAddOn === undefined) {
            throw new Error("AwsBatchAddOn must be deployed before creating AWS Batch on EKS team.");
        }
        // Set AWS Batch namespace and necessary RBACs
        const statement = this.setBatchEksResources(clusterInfo, this.batchTeamProps.namespace);
        // Create compute environment
        const computeEnv = this.setComputeEnvironment(clusterInfo, this.batchTeamProps.namespace, computeResources);
        computeEnv.node.addDependency(awsBatchAddOn);
        computeEnv.node.addDependency(statement);
        // Create a job queue
        const jobQueue = new batch.CfnJobQueue(clusterInfo.cluster.stack, 'batch-eks-job-queue', {
            jobQueueName: this.batchTeamProps.jobQueueName,
            priority: priority,
            computeEnvironmentOrder: [
                {
                    order: 1,
                    computeEnvironment: computeEnv.attrComputeEnvironmentArn
                }
            ]
        });
        jobQueue.node.addDependency(computeEnv);
    }
    /**
     * method to to apply k8s RBAC to the service account used by Batch service role
     * @param ClusterInfo EKS cluster where to apply the RBAC
     * @param namespace Namespace where the RBAC are applied
     * @param createNamespace flag to create namespace if not already created
     * @returns
     */
    setBatchEksResources(clusterInfo, namespace) {
        let doc = (0, yaml_utils_1.readYamlDocument)(`${__dirname}/aws-batch-rbac-config.ytpl`);
        //Get the RBAC definition and replace with the namespace provided by the user
        const manifest = doc.split("---").map(e => (0, yaml_utils_1.loadYaml)(e));
        const values = {
            namespace: namespace
        };
        const manifestDeployment = {
            name: 'aws-batch-rbacs',
            namespace: namespace,
            manifest,
            values
        };
        const kubectlProvider = new kubectl_provider_1.KubectlProvider(clusterInfo);
        const statement = kubectlProvider.addManifest(manifestDeployment);
        return statement;
    }
    setComputeEnvironment(clusterInfo, namespace, computeResources) {
        const nodeGroups = (0, cluster_providers_1.assertEC2NodeGroup)(clusterInfo, "Batch Compute Environment");
        const ngRoleNames = nodeGroups.map((ng) => { return ng.role.roleName; });
        const cluster = clusterInfo.cluster;
        const ngRole = ngRoleNames[0];
        // Need to create instance profile for the nodegroup role
        const instanceProfile = new iam.CfnInstanceProfile(cluster, 'ng-role-instance-profile', {
            instanceProfileName: ngRole,
            roles: [ngRole]
        });
        const batchComputeEnv = new batch.CfnComputeEnvironment(cluster, "batch-eks-compute-environment", {
            type: 'MANAGED',
            computeEnvironmentName: this.batchTeamProps.envName,
            state: 'ENABLED',
            eksConfiguration: {
                eksClusterArn: cluster.clusterArn,
                kubernetesNamespace: namespace,
            },
            computeResources: {
                type: computeResources.envType,
                allocationStrategy: computeResources.allocationStrategy,
                minvCpus: computeResources.minvCpus,
                maxvCpus: computeResources.maxvCpus,
                instanceTypes: computeResources.instanceTypes,
                subnets: cluster.vpc.publicSubnets.map((e) => { return e.subnetId; }),
                securityGroupIds: [cluster.clusterSecurityGroupId],
                instanceRole: ngRole,
            }
        });
        batchComputeEnv.node.addDependency(instanceProfile);
        return batchComputeEnv;
    }
}
exports.BatchEksTeam = BatchEksTeam;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXdzLWJhdGNoLW9uLWVrcy10ZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL3RlYW1zL2F3cy1iYXRjaC9hd3MtYmF0Y2gtb24tZWtzLXRlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBQTZEO0FBRTdELGtDQUFxRDtBQUNyRCwrRUFBK0Y7QUFDL0YsdURBQW9FO0FBR3BFLCtDQUErQztBQUkvQywyQ0FBMkM7QUFFM0MsaUNBQWlDO0FBRWpDLE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQztBQTBFOUIsTUFBTSxZQUFZLEdBQWM7SUFDOUIsSUFBSSxFQUFFLFNBQVM7SUFDZixTQUFTLEVBQUUsU0FBUztDQUNyQixDQUFDO0FBRUY7O0dBRUc7QUFFSCxNQUFhLFlBQWEsU0FBUSxzQkFBZTtJQUcvQzs7O09BR0c7SUFDSCxZQUFZLEtBQXdCO1FBQ2xDLE1BQU0sU0FBUyxHQUFHLEVBQUUsR0FBRyxZQUFZLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQztRQUNoRCxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUM7SUFDbEMsQ0FBQztJQUVELEtBQUssQ0FBQyxXQUF3QjtRQUM1QixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUM7UUFDOUQsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLHdDQUF3QyxDQUFDLENBQUM7UUFDeEcsTUFBTSxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1FBRW5GLE1BQU0sYUFBYSxHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxl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QkFBcUIsQ0FBQyxPQUFPLEVBQUUsK0JBQStCLEVBQUU7WUFDaEcsSUFBSSxFQUFFLFNBQVM7WUFDZixzQkFBc0IsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU87WUFDbkQsS0FBSyxFQUFFLFNBQVM7WUFDaEIsZ0JBQWdCLEVBQUU7Z0JBQ2hCLGFBQWEsRUFBRSxPQUFPLENBQUMsVUFBVTtnQkFDakMsbUJBQW1CLEVBQUUsU0FBUzthQUMvQjtZQUNELGdCQUFnQixFQUFFO2dCQUNoQixJQUFJLEVBQUUsZ0JBQWdCLENBQUMsT0FBTztnQkFDOUIsa0JBQWtCLEVBQUUsZ0JBQWdCLENBQUMsa0JBQWtCO2dCQUN2RCxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtnQkFDbkMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLFFBQVE7Z0JBQ25DLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxhQUFhO2dCQUM3QyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBYyxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xGLGdCQUFnQixFQUFFLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDO2dCQUNsRCxZQUFZLEVBQUUsTUFBTTthQUNyQjtTQUNGLENBQUMsQ0FBQztRQUVILGVBQWUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3BELE9BQU8sZUFBZSxDQUFDO0lBQ3pCLENBQUM7Q0FDRjtBQXpIRCxvQ0F5SEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhc3NlcnRFQzJOb2RlR3JvdXAgfSBmcm9tIFwiLi4vLi4vY2x1c3Rlci1wcm92aWRlcnNcIjtcbmltcG9ydCB7IENsdXN0ZXJJbmZvLCBWYWx1ZXMgfSBmcm9tIFwiLi4vLi4vc3BpXCI7XG5pbXBvcnQgeyBBcHBsaWNhdGlvblRlYW0sIFRlYW1Qcm9wcyB9IGZyb20gXCIuLi90ZWFtXCI7XG5pbXBvcnQgeyBLdWJlY3RsUHJvdmlkZXIsIE1hbmlmZXN0RGVwbG95bWVudCB9IGZyb20gXCIuLi8uLi9hZGRvbnMvaGVsbS1hZGRvbi9rdWJlY3RsLXByb3ZpZGVyXCI7XG5pbXBvcnQgeyBsb2FkWWFtbCwgcmVhZFlhbWxEb2N1bWVudCB9IGZyb20gXCIuLi8uLi91dGlscy95YW1sLXV0aWxzXCI7XG5cbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgYmF0Y2ggZnJvbSAnYXdzLWNkay1saWIvYXdzLWJhdGNoJztcbmltcG9ydCAqIGFzIGVrcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWtzJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7IEF1dG9TY2FsaW5nR3JvdXAgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWF1dG9zY2FsaW5nXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcblxuaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gXCJhc3NlcnRcIjtcblxuY29uc3QgTkFNRVNQQUNFID0gJ2F3cy1iYXRjaCc7XG5cbi8qKlxuICogRW51bSBmb3IgQWxsb2NhdGlvbiBTdHJhdGVneTpcbiAqIEJlc3QgLSBCZXN0IEZpdCBQcm9ncmVzc2l2ZTogQVdTIEJhdGNoIHNlbGVjdHMgYWRkaXRpb25hbCBpbnN0YW5jZSB0eXBlcyB0aGF0IGFyZSBsYXJnZSBlbm91Z2ggdG8gbWVldCB0aGUgcmVxdWlyZW1lbnRzIG9mIHRoZSBqb2JzLiBcbiAqIEluc3RhbmNlIHR5cGVzIHdpdGggYSBsb3dlciBjb3N0IGZvciBlYWNoIHVuaXQgdkNQVSBhcmUgcHJlZmVycmVkLlxuICogU3BvdCAtIFNwb3QgQ2FwYWNpdHkgT3B0aW1pemVkOiBBV1MgQmF0Y2ggc2VsZWN0cyBvbmUgb3IgbW9yZSBpbnN0YW5jZSB0eXBlcyB0aGF0IGFyZSBsYXJnZSBlbm91Z2ggdG8gbWVldCB0aGUgcmVxdWlyZW1lbnRzIG9mIHRoZSBqb2JzIGluIHRoZSBxdWV1ZS4gXG4gKiBJbnN0YW5jZSB0eXBlcyB0aGF0IGFyZSBsZXNzIGxpa2VseSB0byBiZSBpbnRlcnJ1cHRlZCBhcmUgcHJlZmVycmVkLiBUaGlzIGFsbG9jYXRpb24gc3RyYXRlZ3kgaXMgb25seSBhdmFpbGFibGUgZm9yIFNwb3QgSW5zdGFuY2UgY29tcHV0ZSByZXNvdXJjZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIEJhdGNoQWxsb2NhdGlvblN0cmF0ZWd5IHtcbiAgQkVTVCA9ICdCRVNUX0ZJVF9QUk9HUkVTU0lWRScsXG4gIFNQT1QgPSAnU1BPVF9DQVBBQ0lUWV9PUFRJTUlaRUQnXG59XG5cbi8qKlxuICogRW51bSBmb3IgQmF0Y2ggQ29tcHV0ZSBFbnZpcm9ubWVudCBUeXBlXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIEJhdGNoRW52VHlwZSB7XG4gIEVDMiA9ICdFQzInLFxuICBTUE9UID0gJ1NQT1QnLFxuICBGQVJHQVRFID0gJ0ZBUkdBVEUnLFxuICBGQVJHQVRFX1NQT1QgPSAnRkFSR0FURV9TUE9UJ1xufVxuXG4vKipcbiAqIEludGVyZmFjZSB0byBkZWZpbmUgYW4gQVdTIEJhdGNoIG9uIEVLUyB0ZWFtXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmF0Y2hFa3NUZWFtUHJvcHMgZXh0ZW5kcyBUZWFtUHJvcHMge1xuICAvKipcbiAgICogQ29tcHV0ZSBFbnZpcm9ubWVudCBuYW1lXG4gICAqL1xuICBlbnZOYW1lOiBzdHJpbmdcblxuICAvKipcbiAgICogQ29tcHV0ZSBFbnZpcm9ubWVudCBjb21wdXRlIHJlc291cmNlc1xuICAgKi9cbiAgY29tcHV0ZVJlc291cmNlczoge1xuICAgIC8qKlxuICAgICAqIENvbXB1dGUgRW52aXJvbm1lbnQgcmVzb3VyY2VzIFR5cGUgLSBzZWUgZW51bSBCYXRjaEVudlR5cGUgZm9yIG9wdGlvbnNcbiAgICAgKi9cbiAgICBlbnZUeXBlOiBCYXRjaEVudlR5cGVcblxuICAgIC8qKlxuICAgICAqIEFsbG9jYXRpb24gc3RyYXRlZ2llcyBmb3IgRUtTIENvbXB1dGUgZW52aXJvbm1lbnQgLSBzZWUgZW51bSBBbGxvY2F0aW9uIGZvciBvcHRpb25zLlxuICAgICAqL1xuICAgIGFsbG9jYXRpb25TdHJhdGVneTogQmF0Y2hBbGxvY2F0aW9uU3RyYXRlZ3lcblxuICAgIC8qKlxuICAgICAqIFByaW9yaXR5IG9mIHRoZSBqb2IgcXVldWUgLSBwcmlvcml0eSBpcyBzZXQgaW4gZGVzY2VuZGluZyBvcmRlclxuICAgICAqL1xuICAgIHByaW9yaXR5OiBudW1iZXJcblxuICAgIC8qKlxuICAgICAqIFRoZSBtaW5pbXVtIG51bWJlciBvZiBBbWF6b24gRUMyIHZDUFVzIHRoYXQgYW4gZW52aXJvbm1lbnQgc2hvdWxkIG1haW50YWluLlxuICAgICAqL1xuICAgIG1pbnZDcHVzOiBudW1iZXJcblxuICAgIC8qKlxuICAgICAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBBbWF6b24gRUMyIHZDUFVzIHRoYXQgYW4gZW52aXJvbm1lbnQgY2FuIHJlYWNoLlxuICAgICAqL1xuICAgIG1heHZDcHVzOiBudW1iZXIsXG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGluc3RhbmNlIHR5cGVzIC0gY2FuIGJlIGEgbGlzdCB0aGF0IGNvbnRhaW5zIEluc3RhbmNlIFR5cGUgZmFtaWx5IChpLmUuIFwibTVcIikgb3IgYSBzcGVjaWZpYyBUeXBlIChpLmUuIFwibTUuNHhsYXJnZVwiKVxuICAgICAqL1xuICAgIGluc3RhbmNlVHlwZXM6IHN0cmluZ1tdLFxuICB9XG5cbiAgLyoqXG4gICAqIE5hbWUgb2YgdGhlIEpvYiBRdWV1ZVxuICAgKi9cbiAgam9iUXVldWVOYW1lOiBzdHJpbmdcbn1cblxuY29uc3QgZGVmYXVsdFByb3BzOiBUZWFtUHJvcHMgPSB7XG4gIG5hbWU6IE5BTUVTUEFDRSxcbiAgbmFtZXNwYWNlOiBOQU1FU1BBQ0UsXG59O1xuXG4vKlxuICpUaGlzIGNsYXNzIGRlZmluZSB0aGUgVGVhbSB0aGF0IGNhbiBiZSB1c2VkIHdpdGggQVdTIEJhdGNoIG9uIEVLU1xuICovXG5cbmV4cG9ydCBjbGFzcyBCYXRjaEVrc1RlYW0gZXh0ZW5kcyBBcHBsaWNhdGlvblRlYW0ge1xuXG4gIHJlYWRvbmx5IGJhdGNoVGVhbVByb3BzOiBCYXRjaEVrc1RlYW1Qcm9wcztcbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtCYXRjaEVrc1RlYW1Qcm9wc30gcHJvcHMgdGhlIEJhdGNoIHRlYW0gZGVmaW5pdGlvbiB7QGxpbmsgQmF0Y2hFa3NUZWFtUHJvcHN9XG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcm9wczogQmF0Y2hFa3NUZWFtUHJvcHMpIHtcbiAgICBjb25zdCB0ZWFtUHJvcHMgPSB7IC4uLmRlZmF1bHRQcm9wcywgLi4ucHJvcHMgfTtcbiAgICBzdXBlcih0ZWFtUHJvcHMpO1xuICAgIHRoaXMuYmF0Y2hUZWFtUHJvcHMgPSB0ZWFtUHJvcHM7XG4gIH1cblxuICBzZXR1cChjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiB2b2lkIHtcbiAgICBjb25zdCBjb21wdXRlUmVzb3VyY2VzID0gdGhpcy5iYXRjaFRlYW1Qcm9wcy5jb21wdXRlUmVzb3VyY2VzO1xuICAgIGNvbnN0IHByaW9yaXR5ID0gY29tcHV0ZVJlc291cmNlcy5wcmlvcml0eTtcbiAgICBhc3NlcnQoY29tcHV0ZVJlc291cmNlcy5taW52Q3B1cyA8IGNvbXB1dGVSZXNvdXJjZXMubWF4dkNwdXMsICdNYXggdkNQVSBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBNaW4gdkNQVScpO1xuICAgIGFzc2VydCgocHJpb3JpdHkgPj0gMCkgJiYgKHByaW9yaXR5ICUgMSA9PSAwKSwgJ1ByaW9yaXR5IG11c3QgYmUgYSB3aG9sZSBudW1iZXIuJyk7XG5cbiAgICBjb25zdCBhd3NCYXRjaEFkZE9uID0gY2x1c3RlckluZm8uZ2V0UHJvdmlzaW9uZWRBZGRPbignQXdzQmF0Y2hBZGRPbicpO1xuXG4gICAgaWYgKGF3c0JhdGNoQWRkT24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXdzQmF0Y2hBZGRPbiBtdXN0IGJlIGRlcGxveWVkIGJlZm9yZSBjcmVhdGluZyBBV1MgQmF0Y2ggb24gRUtTIHRlYW0uXCIpO1xuICAgIH1cblxuICAgIC8vIFNldCBBV1MgQmF0Y2ggbmFtZXNwYWNlIGFuZCBuZWNlc3NhcnkgUkJBQ3NcbiAgICBjb25zdCBzdGF0ZW1lbnQgPSB0aGlzLnNldEJhdGNoRWtzUmVzb3VyY2VzKGNsdXN0ZXJJbmZvLCB0aGlzLmJhdGNoVGVhbVByb3BzLm5hbWVzcGFjZSEpO1xuXG4gICAgLy8gQ3JlYXRlIGNvbXB1dGUgZW52aXJvbm1lbnRcbiAgICBjb25zdCBjb21wdXRlRW52ID0gdGhpcy5zZXRDb21wdXRlRW52aXJvbm1lbnQoY2x1c3RlckluZm8sIHRoaXMuYmF0Y2hUZWFtUHJvcHMubmFtZXNwYWNlISwgY29tcHV0ZVJlc291cmNlcyk7XG4gICAgY29tcHV0ZUVudi5ub2RlLmFkZERlcGVuZGVuY3koYXdzQmF0Y2hBZGRPbik7XG4gICAgY29tcHV0ZUVudi5ub2RlLmFkZERlcGVuZGVuY3koc3RhdGVtZW50KTtcblxuICAgIC8vIENyZWF0ZSBhIGpvYiBxdWV1ZVxuICAgIGNvbnN0IGpvYlF1ZXVlID0gbmV3IGJhdGNoLkNmbkpvYlF1ZXVlKGNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2ssICdiYXRjaC1la3Mtam9iLXF1ZXVlJywge1xuICAgICAgam9iUXVldWVOYW1lOiB0aGlzLmJhdGNoVGVhbVByb3BzLmpvYlF1ZXVlTmFtZSEsXG4gICAgICBwcmlvcml0eTogcHJpb3JpdHksXG4gICAgICBjb21wdXRlRW52aXJvbm1lbnRPcmRlcjogW1xuICAgICAgICB7XG4gICAgICAgICAgb3JkZXI6IDEsXG4gICAgICAgICAgY29tcHV0ZUVudmlyb25tZW50OiBjb21wdXRlRW52LmF0dHJDb21wdXRlRW52aXJvbm1lbnRBcm5cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pO1xuXG4gICAgam9iUXVldWUubm9kZS5hZGREZXBlbmRlbmN5KGNvbXB1dGVFbnYpO1xuICB9XG5cbiAgLyoqXG4gICAqIG1ldGhvZCB0byB0byBhcHBseSBrOHMgUkJBQyB0byB0aGUgc2VydmljZSBhY2NvdW50IHVzZWQgYnkgQmF0Y2ggc2VydmljZSByb2xlXG4gICAqIEBwYXJhbSBDbHVzdGVySW5mbyBFS1MgY2x1c3RlciB3aGVyZSB0byBhcHBseSB0aGUgUkJBQ1xuICAgKiBAcGFyYW0gbmFtZXNwYWNlIE5hbWVzcGFjZSB3aGVyZSB0aGUgUkJBQyBhcmUgYXBwbGllZFxuICAgKiBAcGFyYW0gY3JlYXRlTmFtZXNwYWNlIGZsYWcgdG8gY3JlYXRlIG5hbWVzcGFjZSBpZiBub3QgYWxyZWFkeSBjcmVhdGVkXG4gICAqIEByZXR1cm5zIFxuICAgKi9cbiAgcHJpdmF0ZSBzZXRCYXRjaEVrc1Jlc291cmNlcyhjbHVzdGVySW5mbzogQ2x1c3RlckluZm8sIG5hbWVzcGFjZTogc3RyaW5nKTogQ29uc3RydWN0IHtcblxuICAgIGxldCBkb2MgPSByZWFkWWFtbERvY3VtZW50KGAke19fZGlybmFtZX0vYXdzLWJhdGNoLXJiYWMtY29uZmlnLnl0cGxgKTtcblxuICAgIC8vR2V0IHRoZSBSQkFDIGRlZmluaXRpb24gYW5kIHJlcGxhY2Ugd2l0aCB0aGUgbmFtZXNwYWNlIHByb3ZpZGVkIGJ5IHRoZSB1c2VyXG4gICAgY29uc3QgbWFuaWZlc3QgPSBkb2Muc3BsaXQoXCItLS1cIikubWFwKGUgPT4gbG9hZFlhbWwoZSkpO1xuXG4gICAgY29uc3QgdmFsdWVzOiBWYWx1ZXMgPSB7XG4gICAgICBuYW1lc3BhY2U6IG5hbWVzcGFjZVxuICAgIH07XG5cbiAgICBjb25zdCBtYW5pZmVzdERlcGxveW1lbnQ6IE1hbmlmZXN0RGVwbG95bWVudCA9IHtcbiAgICAgIG5hbWU6ICdhd3MtYmF0Y2gtcmJhY3MnLFxuICAgICAgbmFtZXNwYWNlOiBuYW1lc3BhY2UsXG4gICAgICBtYW5pZmVzdCxcbiAgICAgIHZhbHVlc1xuICAgIH07XG5cbiAgICBjb25zdCBrdWJlY3RsUHJvdmlkZXIgPSBuZXcgS3ViZWN0bFByb3ZpZGVyKGNsdXN0ZXJJbmZvKTtcbiAgICBjb25zdCBzdGF0ZW1lbnQgPSBrdWJlY3RsUHJvdmlkZXIuYWRkTWFuaWZlc3QobWFuaWZlc3REZXBsb3ltZW50KTtcblxuICAgIHJldHVybiBzdGF0ZW1lbnQ7XG4gIH1cblxuICBwcml2YXRlIHNldENvbXB1dGVFbnZpcm9ubWVudChjbHVzdGVySW5mbzogQ2x1c3RlckluZm8sIG5hbWVzcGFjZTogc3RyaW5nLCBjb21wdXRlUmVzb3VyY2VzOiB7XG4gICAgZW52VHlwZTogQmF0Y2hFbnZUeXBlO1xuICAgIGFsbG9jYXRpb25TdHJhdGVneTogQmF0Y2hBbGxvY2F0aW9uU3RyYXRlZ3k7XG4gICAgcHJpb3JpdHk6IG51bWJlcjtcbiAgICBtaW52Q3B1czogbnVtYmVyO1xuICAgIG1heHZDcHVzOiBudW1iZXI7XG4gICAgaW5zdGFuY2VUeXBlczogc3RyaW5nW107XG4gIH0pOiBiYXRjaC5DZm5Db21wdXRlRW52aXJvbm1lbnQge1xuICAgIGNvbnN0IG5vZGVHcm91cHMgPSBhc3NlcnRFQzJOb2RlR3JvdXAoY2x1c3RlckluZm8sIFwiQmF0Y2ggQ29tcHV0ZSBFbnZpcm9ubWVudFwiKTtcbiAgICBjb25zdCBuZ1JvbGVOYW1lcyA9IG5vZGVHcm91cHMubWFwKChuZzogZWtzLk5vZGVncm91cCB8IEF1dG9TY2FsaW5nR3JvdXApID0+IHsgcmV0dXJuIG5nLnJvbGUucm9sZU5hbWU7IH0pO1xuICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuICAgIGNvbnN0IG5nUm9sZSA9IG5nUm9sZU5hbWVzWzBdO1xuXG4gICAgLy8gTmVlZCB0byBjcmVhdGUgaW5zdGFuY2UgcHJvZmlsZSBmb3IgdGhlIG5vZGVncm91cCByb2xlXG4gICAgY29uc3QgaW5zdGFuY2VQcm9maWxlID0gbmV3IGlhbS5DZm5JbnN0YW5jZVByb2ZpbGUoY2x1c3RlciwgJ25nLXJvbGUtaW5zdGFuY2UtcHJvZmlsZScsIHtcbiAgICAgIGluc3RhbmNlUHJvZmlsZU5hbWU6IG5nUm9sZSxcbiAgICAgIHJvbGVzOiBbbmdSb2xlXVxuICAgIH0pO1xuICBcbiAgICBjb25zdCBiYXRjaENvbXB1dGVFbnYgPSBuZXcgYmF0Y2guQ2ZuQ29tcHV0ZUVudmlyb25tZW50KGNsdXN0ZXIsIFwiYmF0Y2gtZWtzLWNvbXB1dGUtZW52aXJvbm1lbnRcIiwge1xuICAgICAgdHlwZTogJ01BTkFHRUQnLFxuICAgICAgY29tcHV0ZUVudmlyb25tZW50TmFtZTogdGhpcy5iYXRjaFRlYW1Qcm9wcy5lbnZOYW1lLFxuICAgICAgc3RhdGU6ICdFTkFCTEVEJyxcbiAgICAgIGVrc0NvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgZWtzQ2x1c3RlckFybjogY2x1c3Rlci5jbHVzdGVyQXJuLFxuICAgICAgICBrdWJlcm5ldGVzTmFtZXNwYWNlOiBuYW1lc3BhY2UsXG4gICAgICB9LFxuICAgICAgY29tcHV0ZVJlc291cmNlczoge1xuICAgICAgICB0eXBlOiBjb21wdXRlUmVzb3VyY2VzLmVudlR5cGUsXG4gICAgICAgIGFsbG9jYXRpb25TdHJhdGVneTogY29tcHV0ZVJlc291cmNlcy5hbGxvY2F0aW9uU3RyYXRlZ3ksXG4gICAgICAgIG1pbnZDcHVzOiBjb21wdXRlUmVzb3VyY2VzLm1pbnZDcHVzLFxuICAgICAgICBtYXh2Q3B1czogY29tcHV0ZVJlc291cmNlcy5tYXh2Q3B1cyxcbiAgICAgICAgaW5zdGFuY2VUeXBlczogY29tcHV0ZVJlc291cmNlcy5pbnN0YW5jZVR5cGVzLFxuICAgICAgICBzdWJuZXRzOiBjbHVzdGVyLnZwYy5wdWJsaWNTdWJuZXRzLm1hcCgoZTogZWMyLklTdWJuZXQpID0+IHsgcmV0dXJuIGUuc3VibmV0SWQ7IH0pLFxuICAgICAgICBzZWN1cml0eUdyb3VwSWRzOiBbY2x1c3Rlci5jbHVzdGVyU2VjdXJpdHlHcm91cElkXSxcbiAgICAgICAgaW5zdGFuY2VSb2xlOiBuZ1JvbGUsXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBiYXRjaENvbXB1dGVFbnYubm9kZS5hZGREZXBlbmRlbmN5KGluc3RhbmNlUHJvZmlsZSk7XG4gICAgcmV0dXJuIGJhdGNoQ29tcHV0ZUVudjtcbiAgfVxufVxuIl19