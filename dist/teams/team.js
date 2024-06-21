"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformTeam = exports.ApplicationTeam = exports.TeamProps = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const iam = require("aws-cdk-lib/aws-iam");
const csi_driver_provider_aws_secrets_1 = require("../addons/secrets-store/csi-driver-provider-aws-secrets");
const yaml_utils_1 = require("../utils/yaml-utils");
const default_team_roles_1 = require("./default-team-roles");
const utils_1 = require("../utils");
/**
 * Team properties.
 */
class TeamProps {
    constructor() {
        /**
         *  Annotations such as necessary for GitOps engine.
         */
        this.namespaceAnnotations = { "argocd.argoproj.io/sync-wave": "-1" };
        /**
         * Optional, but highly recommended setting to ensure predictable demands.
         */
        this.namespaceHardLimits = {
            'requests.cpu': '10', // TODO verify sane defaults
            'requests.memory': '10Gi',
            'limits.cpu': '20',
            'limits.memory': '20Gi'
        };
    }
}
exports.TeamProps = TeamProps;
class ApplicationTeam {
    constructor(teamProps) {
        var _a;
        this.name = teamProps.name;
        this.teamProps = {
            name: teamProps.name,
            namespace: (_a = teamProps.namespace) !== null && _a !== void 0 ? _a : "team-" + teamProps.name,
            users: teamProps.users,
            namespaceAnnotations: teamProps.namespaceAnnotations,
            namespaceLabels: teamProps.namespaceLabels,
            namespaceHardLimits: teamProps.namespaceHardLimits,
            serviceAccountName: teamProps.serviceAccountName,
            serviceAccountPolicies: teamProps.serviceAccountPolicies,
            userRoleArn: teamProps.userRoleArn,
            teamSecrets: teamProps.teamSecrets,
            teamManifestDir: teamProps.teamManifestDir,
            extensionFunction: teamProps.extensionFunction
        };
    }
    setup(clusterInfo) {
        this.defaultSetupAccess(clusterInfo);
        this.setupNamespace(clusterInfo);
        this.setupServiceAccount(clusterInfo);
        this.setupSecrets(clusterInfo);
        if (this.teamProps.extensionFunction) {
            this.teamProps.extensionFunction(this, clusterInfo);
        }
    }
    defaultSetupAccess(clusterInfo) {
        var _a;
        const props = this.teamProps;
        if (!(clusterInfo.cluster instanceof aws_eks_1.Cluster)) {
            utils_1.logger.warn(`Team ${props.name} has cluster access updates that are not supported with imported clusters`);
            return;
        }
        const eksCluster = clusterInfo.cluster;
        const awsAuth = eksCluster.awsAuth;
        const users = (_a = this.teamProps.users) !== null && _a !== void 0 ? _a : [];
        const teamRole = this.getOrCreateRole(clusterInfo, users, props.userRoleArn);
        if (teamRole) {
            awsAuth.addRoleMapping(teamRole, { groups: [props.namespace + "-team-group"], username: props.name });
            new aws_cdk_lib_1.CfnOutput(clusterInfo.cluster.stack, props.name + ' team role ', { value: teamRole ? teamRole.roleArn : "none" });
        }
    }
    /**
     *
     * @param clusterInfo
     */
    defaultSetupAdminAccess(clusterInfo) {
        var _a;
        const props = this.teamProps;
        if (!(clusterInfo.cluster instanceof aws_eks_1.Cluster)) {
            utils_1.logger.warn(`Team ${props.name} has cluster access updates that are not supported with imported clusters`);
            return;
        }
        const admins = (_a = this.teamProps.users) !== null && _a !== void 0 ? _a : [];
        const adminRole = this.getOrCreateRole(clusterInfo, admins, props.userRoleArn);
        new aws_cdk_lib_1.CfnOutput(clusterInfo.cluster.stack, props.name + ' team admin ', { value: adminRole ? adminRole.roleArn : "none" });
        if (adminRole) {
            const eksCluster = clusterInfo.cluster;
            eksCluster.awsAuth.addMastersRole(adminRole, this.teamProps.name);
        }
    }
    /**
     * Creates a new role with trust relationship or adds trust relationship for an existing role.
     * @param clusterInfo
     * @param users
     * @param role may be null if both role and users were not provided
     * @returns
     */
    getOrCreateRole(clusterInfo, users, roleArn) {
        let role = undefined;
        if (roleArn) {
            role = iam.Role.fromRoleArn(clusterInfo.cluster.stack, `${this.name}-team-role`, roleArn);
            users.forEach(user => role === null || role === void 0 ? void 0 : role.grant(user, "sts:assumeRole"));
        }
        else if (users && users.length > 0) {
            role = new iam.Role(clusterInfo.cluster.stack, this.teamProps.namespace + 'AccessRole', {
                assumedBy: new iam.CompositePrincipal(...users)
            });
            role.addToPrincipalPolicy(new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: [clusterInfo.cluster.clusterArn],
                actions: [
                    "eks:DescribeNodegroup",
                    "eks:ListNodegroups",
                    "eks:DescribeCluster",
                    "eks:ListClusters",
                    "eks:AccessKubernetesApi",
                    "ssm:GetParameter",
                    "eks:ListUpdates",
                    "eks:ListFargateProfiles"
                ]
            }));
            role.addToPrincipalPolicy(new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: ["*"],
                actions: [
                    "eks:ListClusters"
                ]
            }));
        }
        return role;
    }
    /**
     * Creates namespace and sets up policies.
     * @param clusterInfo
     */
    setupNamespace(clusterInfo) {
        const props = this.teamProps;
        const namespaceName = props.namespace;
        const teamManifestDir = props.teamManifestDir;
        this.namespaceManifest = new aws_eks_1.KubernetesManifest(clusterInfo.cluster.stack, props.name, {
            cluster: clusterInfo.cluster,
            manifest: [{
                    apiVersion: 'v1',
                    kind: 'Namespace',
                    metadata: {
                        name: namespaceName,
                        annotations: props.namespaceAnnotations,
                        labels: props.namespaceLabels
                    }
                }],
            overwrite: true,
            prune: true
        });
        if (props.namespaceHardLimits) {
            this.setupNamespacePolicies(clusterInfo, namespaceName);
        }
        const defaultRoles = new default_team_roles_1.DefaultTeamRoles().createManifest(namespaceName); //TODO: add support for custom RBAC
        const rbacManifest = new aws_eks_1.KubernetesManifest(clusterInfo.cluster.stack, namespaceName + "-rbac", {
            cluster: clusterInfo.cluster,
            manifest: defaultRoles,
            overwrite: true,
            prune: true
        });
        rbacManifest.node.addDependency(this.namespaceManifest);
        if (teamManifestDir) {
            (0, yaml_utils_1.applyYamlFromDir)(teamManifestDir, clusterInfo.cluster, this.namespaceManifest);
        }
    }
    /**
     * Sets up quotas
     * @param clusterInfo
     * @param namespaceName
     */
    setupNamespacePolicies(clusterInfo, namespaceName) {
        const quotaName = this.teamProps.name + "-quota";
        const quotaManifest = clusterInfo.cluster.addManifest(quotaName, {
            apiVersion: 'v1',
            kind: 'ResourceQuota',
            metadata: {
                name: quotaName,
                namespace: namespaceName
            },
            spec: {
                hard: this.teamProps.namespaceHardLimits
            }
        });
        quotaManifest.node.addDependency(this.namespaceManifest);
    }
    /**
     * Sets up ServiceAccount for the team namespace
     * @param clusterInfo
     */
    setupServiceAccount(clusterInfo) {
        const serviceAccountName = this.teamProps.serviceAccountName ? this.teamProps.serviceAccountName : `${this.teamProps.name}-sa`;
        const cluster = clusterInfo.cluster;
        this.serviceAccount = cluster.addServiceAccount(`${this.teamProps.name}-service-account`, {
            name: serviceAccountName,
            namespace: this.teamProps.namespace
        });
        this.serviceAccount.node.addDependency(this.namespaceManifest);
        if (this.teamProps.serviceAccountPolicies) {
            this.teamProps.serviceAccountPolicies.forEach(policy => this.serviceAccount.role.addManagedPolicy(policy));
        }
        const serviceAccountOutput = new aws_cdk_lib_1.CfnOutput(clusterInfo.cluster.stack, `${this.teamProps.name}-sa`, {
            value: serviceAccountName
        });
        serviceAccountOutput.node.addDependency(this.namespaceManifest);
    }
    /**
     * Sets up secrets
     * @param clusterInfo
     */
    setupSecrets(clusterInfo) {
        if (this.teamProps.teamSecrets) {
            const secretProviderClassName = this.teamProps.name + '-aws-secrets';
            new csi_driver_provider_aws_secrets_1.SecretProviderClass(clusterInfo, this.serviceAccount, secretProviderClassName, ...this.teamProps.teamSecrets);
        }
    }
}
exports.ApplicationTeam = ApplicationTeam;
/**
 * Platform team will setup all team members as admin access to the cluster by adding them to the master group.
 * The setup skips namespace/quota configuration.
 */
class PlatformTeam extends ApplicationTeam {
    constructor(teamProps) {
        super(teamProps);
    }
    /**
     * Override
     * @param clusterInfo
     */
    setup(clusterInfo) {
        this.defaultSetupAdminAccess(clusterInfo);
    }
}
exports.PlatformTeam = PlatformTeam;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi90ZWFtcy90ZWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUF3QztBQUN4QyxpREFBa0Y7QUFDbEYsMkNBQTJDO0FBRTNDLDZHQUE4RztBQUU5RyxvREFBdUQ7QUFDdkQsNkRBQXdEO0FBQ3hELG9DQUFrQztBQUVsQzs7R0FFRztBQUNILE1BQWEsU0FBUztJQUF0QjtRQWFJOztXQUVHO1FBQ00seUJBQW9CLEdBQThCLEVBQUUsOEJBQThCLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFPcEc7O1dBRUc7UUFDTSx3QkFBbUIsR0FBWTtZQUNwQyxjQUFjLEVBQUUsSUFBSSxFQUFFLDRCQUE0QjtZQUNsRCxpQkFBaUIsRUFBRSxNQUFNO1lBQ3pCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLGVBQWUsRUFBRSxNQUFNO1NBQzFCLENBQUM7SUEyQ04sQ0FBQztDQUFBO0FBMUVELDhCQTBFQztBQUVELE1BQWEsZUFBZTtJQVV4QixZQUFZLFNBQW9COztRQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRztZQUNiLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSTtZQUNwQixTQUFTLEVBQUUsTUFBQSxTQUFTLENBQUMsU0FBUyxtQ0FBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLElBQUk7WUFDMUQsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLO1lBQ3RCLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxvQkFBb0I7WUFDcEQsZUFBZSxFQUFFLFNBQVMsQ0FBQyxlQUFlO1lBQzFDLG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxtQkFBbUI7WUFDbEQsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLGtCQUFrQjtZQUNoRCxzQkFBc0IsRUFBRSxTQUFTLENBQUMsc0JBQXNCO1lBQ3hELFdBQVcsRUFBRSxTQUFTLENBQUMsV0FBVztZQUNs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QUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7O09BR0c7SUFDTyxZQUFZLENBQUMsV0FBd0I7UUFDM0MsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzdCLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDO1lBQ3JFLElBQUkscURBQW1CLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsdUJBQXVCLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RILENBQUM7SUFDTCxDQUFDO0NBQ0o7QUFoT0QsMENBZ09DO0FBRUQ7OztHQUdHO0FBQ0gsTUFBYSxZQUFhLFNBQVEsZUFBZTtJQUU3QyxZQUFZLFNBQW9CO1FBQzVCLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLFdBQXdCO1FBQzFCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM5QyxDQUFDO0NBQ0o7QUFiRCxvQ0FhQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENmbk91dHB1dCB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENsdXN0ZXIsIEt1YmVybmV0ZXNNYW5pZmVzdCwgU2VydmljZUFjY291bnQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWtzJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IElSb2xlIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCB7IENzaVNlY3JldFByb3BzLCBTZWNyZXRQcm92aWRlckNsYXNzIH0gZnJvbSAnLi4vYWRkb25zL3NlY3JldHMtc3RvcmUvY3NpLWRyaXZlci1wcm92aWRlci1hd3Mtc2VjcmV0cyc7XG5pbXBvcnQgeyBDbHVzdGVySW5mbywgVGVhbSwgVmFsdWVzIH0gZnJvbSAnLi4vc3BpJztcbmltcG9ydCB7IGFwcGx5WWFtbEZyb21EaXIgfSBmcm9tICcuLi91dGlscy95YW1sLXV0aWxzJztcbmltcG9ydCB7IERlZmF1bHRUZWFtUm9sZXMgfSBmcm9tICcuL2RlZmF1bHQtdGVhbS1yb2xlcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscyc7XG5cbi8qKlxuICogVGVhbSBwcm9wZXJ0aWVzLlxuICovXG5leHBvcnQgY2xhc3MgVGVhbVByb3BzIHtcblxuICAgIC8qKlxuICAgICAqIFJlcXVpcmVkIHVuaXF1ZSBuYW1lIGZvciBvcmdhbml6YXRpb24uXG4gICAgICogTWF5IG1hcCB0byBhbiBPVSBuYW1lLiBcbiAgICAgKi9cbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0cyB0byB0ZWFtIG5hbWUgcHJlZml4ZWQgYnkgXCJ0ZWFtLVwiXG4gICAgICovXG4gICAgcmVhZG9ubHkgbmFtZXNwYWNlPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogIEFubm90YXRpb25zIHN1Y2ggYXMgbmVjZXNzYXJ5IGZvciBHaXRPcHMgZW5naW5lLiBcbiAgICAgKi9cbiAgICByZWFkb25seSBuYW1lc3BhY2VBbm5vdGF0aW9ucz8gOiB7IFtrZXk6IHN0cmluZ106IGFueTsgfSA9IHsgXCJhcmdvY2QuYXJnb3Byb2ouaW8vc3luYy13YXZlXCI6IFwiLTFcIiB9O1xuXG4gICAgLyoqXG4gICAgICogTGFiZWxzIHN1Y2ggYXMgbmVjZXNzYXJ5IGZvciBBV1MgQXBwTWVzaCBcbiAgICAgKi9cbiAgICByZWFkb25seSBuYW1lc3BhY2VMYWJlbHM/IDogeyBba2V5OiBzdHJpbmddOiBhbnk7IH07XG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbCwgYnV0IGhpZ2hseSByZWNvbW1lbmRlZCBzZXR0aW5nIHRvIGVuc3VyZSBwcmVkaWN0YWJsZSBkZW1hbmRzLlxuICAgICAqL1xuICAgIHJlYWRvbmx5IG5hbWVzcGFjZUhhcmRMaW1pdHM/OiBWYWx1ZXMgPSB7XG4gICAgICAgICdyZXF1ZXN0cy5jcHUnOiAnMTAnLCAvLyBUT0RPIHZlcmlmeSBzYW5lIGRlZmF1bHRzXG4gICAgICAgICdyZXF1ZXN0cy5tZW1vcnknOiAnMTBHaScsXG4gICAgICAgICdsaW1pdHMuY3B1JzogJzIwJyxcbiAgICAgICAgJ2xpbWl0cy5tZW1vcnknOiAnMjBHaSdcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2VydmljZSBBY2NvdW50IE5hbWVcbiAgICAgKi9cbiAgICByZWFkb25seSBzZXJ2aWNlQWNjb3VudE5hbWU/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBJZiBzcGVjaWZpZWQsIHRoZSBJUlNBIGFjY291bnQgd2lsbCBiZSBjcmVhdGVkIGZvciB3aXRoIHRoZSBJUlNBIHJvbGVcbiAgICAgKiBoYXZpbmcgdGhlIHNwZWNpZmllZCBtYW5hZ2VkIHBvbGljaWVzLiBcbiAgICAgKiBcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHNlcnZpY2VBY2NvdW50UG9saWNpZXM6IFtNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIlwiKV1cbiAgICAgKiBcbiAgICAgKi9cbiAgICByZWFkb25seSBzZXJ2aWNlQWNjb3VudFBvbGljaWVzPzogaWFtLklNYW5hZ2VkUG9saWN5W107XG5cbiAgICAvKipcbiAgICAgKiAgVGVhbSBtZW1iZXJzIHdobyBuZWVkIHRvIGdldCBhY2Nlc3MgdG8gdGhlIGNsdXN0ZXJcbiAgICAgKi9cbiAgICByZWFkb25seSB1c2Vycz86IEFycmF5PGlhbS5Bcm5QcmluY2lwYWw+O1xuXG4gICAgLyoqXG4gICAgICogT3B0aW9ucyBleGlzdGluZyByb2xlIHRoYXQgc2hvdWxkIGJlIHVzZWQgZm9yIGNsdXN0ZXIgYWNjZXNzLiBcbiAgICAgKiBJZiB1c2VyUm9sZSBhbmQgdXNlcnMgYXJlIG5vdCBwcm92aWRlZCwgdGhlbiBubyBJQU0gc2V0dXAgaXMgcGVyZm9ybWVkLiBcbiAgICAgKi9cbiAgICByZWFkb25seSB1c2VyUm9sZUFybj86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFRlYW0gU2VjcmV0c1xuICAgICAqL1xuICAgIHJlYWRvbmx5IHRlYW1TZWNyZXRzPzogQ3NpU2VjcmV0UHJvcHNbXTtcblxuICAgIC8qKlxuICAgICAqIE9wdGlvbmFsLCBkaXJlY3Rvcnkgd2hlcmUgYSB0ZWFtJ3MgbWFuaWZlc3RzIGFyZSBzdG9yZWRcbiAgICAgKi9cbiAgICByZWFkb25seSB0ZWFtTWFuaWZlc3REaXI/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbCwgVXNlIHRoaXMgZnVuY3Rpb24gdG8gYWRkIGluZnJhc3RydWN0dXJlIG9yIHdvcmtsb2FkcyBcbiAgICAgKiBkZXBsb3ltZW50dG8gdGhlIHRlYW1cbiAgICAqL1xuICAgIGV4dGVuc2lvbkZ1bmN0aW9uPyAodGVhbTogQXBwbGljYXRpb25UZWFtLCBjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb25UZWFtIGltcGxlbWVudHMgVGVhbSB7XG5cbiAgICByZWFkb25seSB0ZWFtUHJvcHM6IFRlYW1Qcm9wcztcblxuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcblxuICAgIHB1YmxpYyBuYW1lc3BhY2VNYW5pZmVzdDogS3ViZXJuZXRlc01hbmlmZXN0O1xuXG4gICAgcHVibGljIHNlcnZpY2VBY2NvdW50OiBTZXJ2aWNlQWNjb3VudDtcblxuICAgIGNvbnN0cnVjdG9yKHRlYW1Qcm9wczogVGVhbVByb3BzKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IHRlYW1Qcm9wcy5uYW1lO1xuICAgICAgICB0aGlzLnRlYW1Qcm9wcyA9IHtcbiAgICAgICAgICAgIG5hbWU6IHRlYW1Qcm9wcy5uYW1lLFxuICAgICAgICAgICAgbmFtZXNwYWNlOiB0ZWFtUHJvcHMubmFtZXNwYWNlID8/IFwidGVhbS1cIiArIHRlYW1Qcm9wcy5uYW1lLFxuICAgICAgICAgICAgdXNlcnM6IHRlYW1Qcm9wcy51c2VycyxcbiAgICAgICAgICAgIG5hbWVzcGFjZUFubm90YXRpb25zOiB0ZWFtUHJvcHMubmFtZXNwYWNlQW5ub3RhdGlvbnMsXG4gICAgICAgICAgICBuYW1lc3BhY2VMYWJlbHM6IHRlYW1Qcm9wcy5uYW1lc3BhY2VMYWJlbHMsXG4gICAgICAgICAgICBuYW1lc3BhY2VIYXJkTGltaXRzOiB0ZWFtUHJvcHMubmFtZXNwYWNlSGFyZExpbWl0cyxcbiAgICAgICAgICAgIHNlcnZpY2VBY2NvdW50TmFtZTogdGVhbVByb3BzLnNlcnZpY2VBY2NvdW50TmFtZSxcbiAgICAgICAgICAgIHNlcnZpY2VBY2NvdW50UG9saWNpZXM6IHRlYW1Qcm9wcy5zZXJ2aWNlQWNjb3VudFBvbGljaWVzLFxuICAgICAgICAgICAgdXNlclJvbGVBcm46IHRlYW1Qcm9wcy51c2VyUm9sZUFybixcbiAgICAgICAgICAgIHRlYW1TZWNyZXRzOiB0ZWFtUHJvcHMudGVhbVNlY3JldHMsXG4gICAgICAgICAgICB0ZWFtTWFuaWZlc3REaXI6IHRlYW1Qcm9wcy50ZWFtTWFuaWZlc3REaXIsXG4gICAgICAgICAgICBleHRlbnNpb25GdW5jdGlvbjogdGVhbVByb3BzLmV4dGVuc2lvbkZ1bmN0aW9uXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIHNldHVwKGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IHZvaWQge1xuICAgICAgICB0aGlzLmRlZmF1bHRTZXR1cEFjY2VzcyhjbHVzdGVySW5mbyk7XG4gICAgICAgIHRoaXMuc2V0dXBOYW1lc3BhY2UoY2x1c3RlckluZm8pO1xuICAgICAgICB0aGlzLnNldHVwU2VydmljZUFjY291bnQoY2x1c3RlckluZm8pO1xuICAgICAgICB0aGlzLnNldHVwU2VjcmV0cyhjbHVzdGVySW5mbyk7XG4gICAgICAgIGlmICh0aGlzLnRlYW1Qcm9wcy5leHRlbnNpb25GdW5jdGlvbikge1xuICAgICAgICAgICAgdGhpcy50ZWFtUHJvcHMuZXh0ZW5zaW9uRnVuY3Rpb24odGhpcywgY2x1c3RlckluZm8pO1xuICAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBkZWZhdWx0U2V0dXBBY2Nlc3MoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKSB7XG4gICAgICAgIGNvbnN0IHByb3BzID0gdGhpcy50ZWFtUHJvcHM7ICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmKCEoY2x1c3RlckluZm8uY2x1c3RlciBpbnN0YW5jZW9mIENsdXN0ZXIpKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihgVGVhbSAke3Byb3BzLm5hbWV9IGhhcyBjbHVzdGVyIGFjY2VzcyB1cGRhdGVzIHRoYXQgYXJlIG5vdCBzdXBwb3J0ZWQgd2l0aCBpbXBvcnRlZCBjbHVzdGVyc2AgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBla3NDbHVzdGVyIDogQ2x1c3RlciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXI7XG4gICAgICAgIGNvbnN0IGF3c0F1dGggPSBla3NDbHVzdGVyLmF3c0F1dGg7XG5cbiAgICAgICAgY29uc3QgdXNlcnMgPSB0aGlzLnRlYW1Qcm9wcy51c2VycyA/PyBbXTtcbiAgICAgICAgY29uc3QgdGVhbVJvbGUgPSB0aGlzLmdldE9yQ3JlYXRlUm9sZShjbHVzdGVySW5mbywgdXNlcnMsIHByb3BzLnVzZXJSb2xlQXJuKTtcblxuICAgICAgICBpZiAodGVhbVJvbGUpIHtcbiAgICAgICAgICAgIGF3c0F1dGguYWRkUm9sZU1hcHBpbmcodGVhbVJvbGUsIHsgZ3JvdXBzOiBbcHJvcHMubmFtZXNwYWNlISArIFwiLXRlYW0tZ3JvdXBcIl0sIHVzZXJuYW1lOiBwcm9wcy5uYW1lIH0pO1xuICAgICAgICAgICAgbmV3IENmbk91dHB1dChjbHVzdGVySW5mby5jbHVzdGVyLnN0YWNrLCBwcm9wcy5uYW1lICsgJyB0ZWFtIHJvbGUgJywgeyB2YWx1ZTogdGVhbVJvbGUgPyB0ZWFtUm9sZS5yb2xlQXJuIDogXCJub25lXCIgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gY2x1c3RlckluZm8gXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGRlZmF1bHRTZXR1cEFkbWluQWNjZXNzKGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbykge1xuICAgICAgICBjb25zdCBwcm9wcyA9IHRoaXMudGVhbVByb3BzOyAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZighKGNsdXN0ZXJJbmZvLmNsdXN0ZXIgaW5zdGFuY2VvZiBDbHVzdGVyKSkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFRlYW0gJHtwcm9wcy5uYW1lfSBoYXMgY2x1c3RlciBhY2Nlc3MgdXBkYXRlcyB0aGF0IGFyZSBub3Qgc3VwcG9ydGVkIHdpdGggaW1wb3J0ZWQgY2x1c3RlcnNgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYWRtaW5zID0gdGhpcy50ZWFtUHJvcHMudXNlcnMgPz8gW107XG4gICAgICAgIGNvbnN0IGFkbWluUm9sZSA9IHRoaXMuZ2V0T3JDcmVhdGVSb2xlKGNsdXN0ZXJJbmZvLCBhZG1pbnMsIHByb3BzLnVzZXJSb2xlQXJuKTtcblxuICAgICAgICBuZXcgQ2ZuT3V0cHV0KGNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2ssIHByb3BzLm5hbWUgKyAnIHRlYW0gYWRtaW4gJywgeyB2YWx1ZTogYWRtaW5Sb2xlID8gYWRtaW5Sb2xlLnJvbGVBcm4gOiBcIm5vbmVcIiB9KTtcblxuICAgICAgICBpZiAoYWRtaW5Sb2xlKSB7XG4gICAgICAgICAgICBjb25zdCBla3NDbHVzdGVyOiBDbHVzdGVyID0gY2x1c3RlckluZm8uY2x1c3RlcjtcbiAgICAgICAgICAgIGVrc0NsdXN0ZXIuYXdzQXV0aC5hZGRNYXN0ZXJzUm9sZShhZG1pblJvbGUsIHRoaXMudGVhbVByb3BzLm5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyByb2xlIHdpdGggdHJ1c3QgcmVsYXRpb25zaGlwIG9yIGFkZHMgdHJ1c3QgcmVsYXRpb25zaGlwIGZvciBhbiBleGlzdGluZyByb2xlLlxuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mbyBcbiAgICAgKiBAcGFyYW0gdXNlcnMgXG4gICAgICogQHBhcmFtIHJvbGUgbWF5IGJlIG51bGwgaWYgYm90aCByb2xlIGFuZCB1c2VycyB3ZXJlIG5vdCBwcm92aWRlZFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRPckNyZWF0ZVJvbGUoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvLCB1c2VyczogQXJyYXk8aWFtLkFyblByaW5jaXBhbD4sIHJvbGVBcm4/OiBzdHJpbmcpOiBpYW0uSVJvbGUgfCB1bmRlZmluZWQge1xuICAgICAgICBsZXQgcm9sZTogSVJvbGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIFxuICAgICAgICBpZiAocm9sZUFybikge1xuICAgICAgICAgICAgcm9sZSA9IGlhbS5Sb2xlLmZyb21Sb2xlQXJuKGNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2ssIGAke3RoaXMubmFtZX0tdGVhbS1yb2xlYCwgcm9sZUFybik7XG4gICAgICAgICAgICB1c2Vycy5mb3JFYWNoKHVzZXIgPT4gcm9sZT8uZ3JhbnQodXNlciwgXCJzdHM6YXNzdW1lUm9sZVwiKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih1c2VycyAmJiB1c2Vycy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgIHJvbGUgPSBuZXcgaWFtLlJvbGUoY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjaywgdGhpcy50ZWFtUHJvcHMubmFtZXNwYWNlICsgJ0FjY2Vzc1JvbGUnLCB7XG4gICAgICAgICAgICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLkNvbXBvc2l0ZVByaW5jaXBhbCguLi51c2VycylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcm9sZS5hZGRUb1ByaW5jaXBhbFBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICAgIHJlc291cmNlczogW2NsdXN0ZXJJbmZvLmNsdXN0ZXIuY2x1c3RlckFybl0sXG4gICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICBcImVrczpEZXNjcmliZU5vZGVncm91cFwiLFxuICAgICAgICAgICAgICAgICAgICBcImVrczpMaXN0Tm9kZWdyb3Vwc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVrczpEZXNjcmliZUNsdXN0ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgXCJla3M6TGlzdENsdXN0ZXJzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWtzOkFjY2Vzc0t1YmVybmV0ZXNBcGlcIixcbiAgICAgICAgICAgICAgICAgICAgXCJzc206R2V0UGFyYW1ldGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWtzOkxpc3RVcGRhdGVzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWtzOkxpc3RGYXJnYXRlUHJvZmlsZXNcIlxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJvbGUuYWRkVG9QcmluY2lwYWxQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICBcImVrczpMaXN0Q2x1c3RlcnNcIlxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcm9sZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIG5hbWVzcGFjZSBhbmQgc2V0cyB1cCBwb2xpY2llcy5cbiAgICAgKiBAcGFyYW0gY2x1c3RlckluZm8gXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNldHVwTmFtZXNwYWNlKGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbykge1xuICAgICAgICBjb25zdCBwcm9wcyA9IHRoaXMudGVhbVByb3BzO1xuICAgICAgICBjb25zdCBuYW1lc3BhY2VOYW1lID0gcHJvcHMubmFtZXNwYWNlITtcbiAgICAgICAgY29uc3QgdGVhbU1hbmlmZXN0RGlyID0gcHJvcHMudGVhbU1hbmlmZXN0RGlyO1xuXG4gICAgICAgIHRoaXMubmFtZXNwYWNlTWFuaWZlc3QgPSBuZXcgS3ViZXJuZXRlc01hbmlmZXN0KGNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2ssIHByb3BzLm5hbWUsIHtcbiAgICAgICAgICAgIGNsdXN0ZXI6IGNsdXN0ZXJJbmZvLmNsdXN0ZXIsXG4gICAgICAgICAgICBtYW5pZmVzdDogW3tcbiAgICAgICAgICAgICAgICBhcGlWZXJzaW9uOiAndjEnLFxuICAgICAgICAgICAgICAgIGtpbmQ6ICdOYW1lc3BhY2UnLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVzcGFjZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25zOiBwcm9wcy5uYW1lc3BhY2VBbm5vdGF0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBwcm9wcy5uYW1lc3BhY2VMYWJlbHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIG92ZXJ3cml0ZTogdHJ1ZSxcbiAgICAgICAgICAgIHBydW5lOiB0cnVlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChwcm9wcy5uYW1lc3BhY2VIYXJkTGltaXRzKSB7XG4gICAgICAgICAgICB0aGlzLnNldHVwTmFtZXNwYWNlUG9saWNpZXMoY2x1c3RlckluZm8sIG5hbWVzcGFjZU5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVmYXVsdFJvbGVzID0gbmV3IERlZmF1bHRUZWFtUm9sZXMoKS5jcmVhdGVNYW5pZmVzdChuYW1lc3BhY2VOYW1lKTsgLy9UT0RPOiBhZGQgc3VwcG9ydCBmb3IgY3VzdG9tIFJCQUNcblxuICAgICAgICBjb25zdCByYmFjTWFuaWZlc3QgPSBuZXcgS3ViZXJuZXRlc01hbmlmZXN0KGNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2ssIG5hbWVzcGFjZU5hbWUgKyBcIi1yYmFjXCIsIHtcbiAgICAgICAgICAgIGNsdXN0ZXI6IGNsdXN0ZXJJbmZvLmNsdXN0ZXIsXG4gICAgICAgICAgICBtYW5pZmVzdDogZGVmYXVsdFJvbGVzLFxuICAgICAgICAgICAgb3ZlcndyaXRlOiB0cnVlLFxuICAgICAgICAgICAgcHJ1bmU6IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmJhY01hbmlmZXN0Lm5vZGUuYWRkRGVwZW5kZW5jeSh0aGlzLm5hbWVzcGFjZU1hbmlmZXN0KTtcblxuICAgICAgICBpZiAodGVhbU1hbmlmZXN0RGlyKXtcbiAgICAgICAgICAgIGFwcGx5WWFtbEZyb21EaXIodGVhbU1hbmlmZXN0RGlyLCBjbHVzdGVySW5mby5jbHVzdGVyLCB0aGlzLm5hbWVzcGFjZU1hbmlmZXN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgcXVvdGFzXG4gICAgICogQHBhcmFtIGNsdXN0ZXJJbmZvIFxuICAgICAqIEBwYXJhbSBuYW1lc3BhY2VOYW1lIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzZXR1cE5hbWVzcGFjZVBvbGljaWVzKGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbywgbmFtZXNwYWNlTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHF1b3RhTmFtZSA9IHRoaXMudGVhbVByb3BzLm5hbWUgKyBcIi1xdW90YVwiO1xuICAgICAgICBjb25zdCBxdW90YU1hbmlmZXN0ID0gY2x1c3RlckluZm8uY2x1c3Rlci5hZGRNYW5pZmVzdChxdW90YU5hbWUsIHtcbiAgICAgICAgICAgIGFwaVZlcnNpb246ICd2MScsXG4gICAgICAgICAgICBraW5kOiAnUmVzb3VyY2VRdW90YScsXG4gICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgIG5hbWU6IHF1b3RhTmFtZSxcbiAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IG5hbWVzcGFjZU5hbWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzcGVjOiB7XG4gICAgICAgICAgICAgICAgaGFyZDogdGhpcy50ZWFtUHJvcHMubmFtZXNwYWNlSGFyZExpbWl0c1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcXVvdGFNYW5pZmVzdC5ub2RlLmFkZERlcGVuZGVuY3kodGhpcy5uYW1lc3BhY2VNYW5pZmVzdCk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgU2VydmljZUFjY291bnQgZm9yIHRoZSB0ZWFtIG5hbWVzcGFjZVxuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mbyBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0dXBTZXJ2aWNlQWNjb3VudChjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pIHtcbiAgICAgICAgY29uc3Qgc2VydmljZUFjY291bnROYW1lID0gdGhpcy50ZWFtUHJvcHMuc2VydmljZUFjY291bnROYW1lPyB0aGlzLnRlYW1Qcm9wcy5zZXJ2aWNlQWNjb3VudE5hbWUgOiBgJHt0aGlzLnRlYW1Qcm9wcy5uYW1lfS1zYWA7XG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5zZXJ2aWNlQWNjb3VudCA9IGNsdXN0ZXIuYWRkU2VydmljZUFjY291bnQoYCR7dGhpcy50ZWFtUHJvcHMubmFtZX0tc2VydmljZS1hY2NvdW50YCwge1xuICAgICAgICAgICAgbmFtZTogc2VydmljZUFjY291bnROYW1lLFxuICAgICAgICAgICAgbmFtZXNwYWNlOiB0aGlzLnRlYW1Qcm9wcy5uYW1lc3BhY2VcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2VydmljZUFjY291bnQubm9kZS5hZGREZXBlbmRlbmN5KHRoaXMubmFtZXNwYWNlTWFuaWZlc3QpO1xuXG4gICAgICAgIGlmKHRoaXMudGVhbVByb3BzLnNlcnZpY2VBY2NvdW50UG9saWNpZXMpIHtcbiAgICAgICAgICAgIHRoaXMudGVhbVByb3BzLnNlcnZpY2VBY2NvdW50UG9saWNpZXMuZm9yRWFjaChwb2xpY3kgPT4gdGhpcy5zZXJ2aWNlQWNjb3VudC5yb2xlLmFkZE1hbmFnZWRQb2xpY3kocG9saWN5KSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXJ2aWNlQWNjb3VudE91dHB1dCA9IG5ldyBDZm5PdXRwdXQoY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjaywgYCR7dGhpcy50ZWFtUHJvcHMubmFtZX0tc2FgLCB7XG4gICAgICAgICAgICB2YWx1ZTogc2VydmljZUFjY291bnROYW1lXG4gICAgICAgIH0pO1xuICAgICAgICBzZXJ2aWNlQWNjb3VudE91dHB1dC5ub2RlLmFkZERlcGVuZGVuY3kodGhpcy5uYW1lc3BhY2VNYW5pZmVzdCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCBzZWNyZXRzXG4gICAgICogQHBhcmFtIGNsdXN0ZXJJbmZvXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNldHVwU2VjcmV0cyhjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pIHtcbiAgICAgICAgaWYgKHRoaXMudGVhbVByb3BzLnRlYW1TZWNyZXRzKSB7XG4gICAgICAgICAgICBjb25zdCBzZWNyZXRQcm92aWRlckNsYXNzTmFtZSA9IHRoaXMudGVhbVByb3BzLm5hbWUgKyAnLWF3cy1zZWNyZXRzJztcbiAgICAgICAgICAgIG5ldyBTZWNyZXRQcm92aWRlckNsYXNzKGNsdXN0ZXJJbmZvLCB0aGlzLnNlcnZpY2VBY2NvdW50LCBzZWNyZXRQcm92aWRlckNsYXNzTmFtZSwgLi4udGhpcy50ZWFtUHJvcHMudGVhbVNlY3JldHMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFBsYXRmb3JtIHRlYW0gd2lsbCBzZXR1cCBhbGwgdGVhbSBtZW1iZXJzIGFzIGFkbWluIGFjY2VzcyB0byB0aGUgY2x1c3RlciBieSBhZGRpbmcgdGhlbSB0byB0aGUgbWFzdGVyIGdyb3VwLlxuICogVGhlIHNldHVwIHNraXBzIG5hbWVzcGFjZS9xdW90YSBjb25maWd1cmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUGxhdGZvcm1UZWFtIGV4dGVuZHMgQXBwbGljYXRpb25UZWFtIHtcblxuICAgIGNvbnN0cnVjdG9yKHRlYW1Qcm9wczogVGVhbVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHRlYW1Qcm9wcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGVcbiAgICAgKiBAcGFyYW0gY2x1c3RlckluZm9cbiAgICAgKi9cbiAgICBzZXR1cChjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kZWZhdWx0U2V0dXBBZG1pbkFjY2VzcyhjbHVzdGVySW5mbyk7XG4gICAgfVxufSJdfQ==