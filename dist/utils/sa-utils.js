"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceServiceAccount = void 0;
exports.createServiceAccount = createServiceAccount;
exports.createServiceAccountWithPolicy = createServiceAccountWithPolicy;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const eks = require("aws-cdk-lib/aws-eks");
const iam = require("aws-cdk-lib/aws-iam");
const constructs_1 = require("constructs");
/**
 * Creates a service account that can access secrets
 * @param clusterInfo
 * @returns sa
 */
function createServiceAccount(cluster, name, namespace, policyDocument) {
    const policy = new iam.ManagedPolicy(cluster, `${name}-managed-policy`, {
        document: policyDocument
    });
    return createServiceAccountWithPolicy(cluster, name, namespace, policy);
}
function createServiceAccountWithPolicy(cluster, name, namespace, ...policies) {
    const sa = cluster.addServiceAccount(`${name}-sa`, {
        name: name,
        namespace: namespace
    });
    policies.forEach(policy => sa.role.addManagedPolicy(policy));
    return sa;
}
/**
 * This class is a copy of the CDK ServiceAccount class with the only difference of allowing
 * to replace service account if it already exists (e.g. a case with installing VPC CNI add-on).
 * Once CDK adds support to replace an existing service account, this class should be deleted and replaced
 * with the standard eks.ServiceAccount.
 */
class ReplaceServiceAccount extends constructs_1.Construct {
    constructor(scope, id, props) {
        var _a, _b;
        super(scope, id);
        const { cluster } = props;
        this.serviceAccountName = (_a = props.name) !== null && _a !== void 0 ? _a : aws_cdk_lib_1.Names.uniqueId(this).toLowerCase();
        this.serviceAccountNamespace = (_b = props.namespace) !== null && _b !== void 0 ? _b : 'default';
        // From K8s docs: https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/
        if (!this.isValidDnsSubdomainName(this.serviceAccountName)) {
            throw RangeError('The name of a ServiceAccount object must be a valid DNS subdomain name.');
        }
        // From K8s docs: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/#namespaces-and-dns
        if (!this.isValidDnsLabelName(this.serviceAccountNamespace)) {
            throw RangeError('All namespace names must be valid RFC 1123 DNS labels.');
        }
        /* Add conditions to the role to improve security. This prevents other pods in the same namespace to assume the role.
        * See documentation: https://docs.aws.amazon.com/eks/latest/userguide/create-service-account-iam-policy-and-role.html
        */
        const conditions = new aws_cdk_lib_1.CfnJson(this, 'ConditionJson', {
            value: {
                [`${cluster.openIdConnectProvider.openIdConnectProviderIssuer}:aud`]: 'sts.amazonaws.com',
                [`${cluster.openIdConnectProvider.openIdConnectProviderIssuer}:sub`]: `system:serviceaccount:${this.serviceAccountNamespace}:${this.serviceAccountName}`,
            },
        });
        const principal = new iam.OpenIdConnectPrincipal(cluster.openIdConnectProvider).withConditions({
            StringEquals: conditions,
        });
        this.role = new iam.Role(this, 'Role', { assumedBy: principal });
        this.assumeRoleAction = this.role.assumeRoleAction;
        this.grantPrincipal = this.role.grantPrincipal;
        this.policyFragment = this.role.policyFragment;
        // Note that we cannot use `cluster.addManifest` here because that would create the manifest
        // constrct in the scope of the cluster stack, which might be a different stack than this one.
        // This means that the cluster stack would depend on this stack because of the role,
        // and since this stack inherintely depends on the cluster stack, we will have a circular dependency.
        new eks.KubernetesManifest(this, `manifest-${id}ServiceAccountResource`, {
            cluster,
            overwrite: true,
            manifest: [{
                    apiVersion: 'v1',
                    kind: 'ServiceAccount',
                    metadata: {
                        name: this.serviceAccountName,
                        namespace: this.serviceAccountNamespace,
                        labels: {
                            'app.kubernetes.io/name': this.serviceAccountName,
                            ...props.labels,
                        },
                        annotations: {
                            'eks.amazonaws.com/role-arn': this.role.roleArn,
                            ...props.annotations,
                        },
                    },
                }],
        });
    }
    addToPrincipalPolicy(statement) {
        return this.role.addToPrincipalPolicy(statement);
    }
    /**
     * If the value is a DNS subdomain name as defined in RFC 1123, from K8s docs.
     *
     * https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-subdomain-names
     */
    isValidDnsSubdomainName(value) {
        return value.length <= 253 && /^[a-z0-9]+[a-z0-9-.]*[a-z0-9]+$/.test(value);
    }
    /**
     * If the value follows DNS label standard as defined in RFC 1123, from K8s docs.
     *
     * https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-label-names
     */
    isValidDnsLabelName(value) {
        return value.length <= 63 && /^[a-z0-9]+[a-z0-9-]*[a-z0-9]+$/.test(value);
    }
}
exports.ReplaceServiceAccount = ReplaceServiceAccount;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2EtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbHMvc2EtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBV0Esb0RBT0M7QUFFRCx3RUFRQztBQTNCRCw2Q0FBNkM7QUFDN0MsMkNBQTJDO0FBQzNDLDJDQUEyQztBQUMzQywyQ0FBdUM7QUFFdkM7Ozs7R0FJRztBQUNILFNBQWdCLG9CQUFvQixDQUFDLE9BQWlCLEVBQUUsSUFBWSxFQUFFLFNBQWlCLEVBQUUsY0FBa0M7SUFDdkgsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksaUJBQWlCLEVBQUU7UUFDcEUsUUFBUSxFQUFFLGNBQWM7S0FDM0IsQ0FBQyxDQUFDO0lBRUgsT0FBTyw4QkFBOEIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUU1RSxDQUFDO0FBRUQsU0FBZ0IsOEJBQThCLENBQUMsT0FBaUIsRUFBRSxJQUFZLEVBQUUsU0FBaUIsRUFBRSxHQUFHLFFBQThCO0lBQ2hJLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLElBQUksS0FBSyxFQUFFO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsU0FBUyxFQUFFLFNBQVM7S0FDdkIsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM3RCxPQUFPLEVBQUUsQ0FBQztBQUNkLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQWEscUJBQXNCLFNBQVEsc0JBQVM7SUFvQmhELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBOEI7O1FBQ3RFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFF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QyxPQUFPLEtBQUssQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLG1CQUFtQixDQUFDLEtBQWE7UUFDdkMsT0FBTyxLQUFLLENBQUMsTUFBTSxJQUFJLEVBQUUsSUFBSSxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUUsQ0FBQztDQUNGO0FBdEdMLHNEQXNHSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElDbHVzdGVyLCBTZXJ2aWNlQWNjb3VudCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5pbXBvcnQgeyBDZm5Kc29uLCBOYW1lcyB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgZWtzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzZXJ2aWNlIGFjY291bnQgdGhhdCBjYW4gYWNjZXNzIHNlY3JldHNcbiAqIEBwYXJhbSBjbHVzdGVySW5mbyBcbiAqIEByZXR1cm5zIHNhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTZXJ2aWNlQWNjb3VudChjbHVzdGVyOiBJQ2x1c3RlciwgbmFtZTogc3RyaW5nLCBuYW1lc3BhY2U6IHN0cmluZywgcG9saWN5RG9jdW1lbnQ6IGlhbS5Qb2xpY3lEb2N1bWVudCk6IFNlcnZpY2VBY2NvdW50IHtcbiAgICBjb25zdCBwb2xpY3kgPSBuZXcgaWFtLk1hbmFnZWRQb2xpY3koY2x1c3RlciwgYCR7bmFtZX0tbWFuYWdlZC1wb2xpY3lgLCB7XG4gICAgICAgIGRvY3VtZW50OiBwb2xpY3lEb2N1bWVudFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNyZWF0ZVNlcnZpY2VBY2NvdW50V2l0aFBvbGljeShjbHVzdGVyLCBuYW1lLCBuYW1lc3BhY2UsIHBvbGljeSk7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNlcnZpY2VBY2NvdW50V2l0aFBvbGljeShjbHVzdGVyOiBJQ2x1c3RlciwgbmFtZTogc3RyaW5nLCBuYW1lc3BhY2U6IHN0cmluZywgLi4ucG9saWNpZXM6IGlhbS5JTWFuYWdlZFBvbGljeVtdKTogU2VydmljZUFjY291bnQge1xuICAgIGNvbnN0IHNhID0gY2x1c3Rlci5hZGRTZXJ2aWNlQWNjb3VudChgJHtuYW1lfS1zYWAsIHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgbmFtZXNwYWNlOiBuYW1lc3BhY2VcbiAgICB9KTtcblxuICAgIHBvbGljaWVzLmZvckVhY2gocG9saWN5ID0+IHNhLnJvbGUuYWRkTWFuYWdlZFBvbGljeShwb2xpY3kpKTtcbiAgICByZXR1cm4gc2E7XG59XG5cbi8qKlxuICogVGhpcyBjbGFzcyBpcyBhIGNvcHkgb2YgdGhlIENESyBTZXJ2aWNlQWNjb3VudCBjbGFzcyB3aXRoIHRoZSBvbmx5IGRpZmZlcmVuY2Ugb2YgYWxsb3dpbmcgXG4gKiB0byByZXBsYWNlIHNlcnZpY2UgYWNjb3VudCBpZiBpdCBhbHJlYWR5IGV4aXN0cyAoZS5nLiBhIGNhc2Ugd2l0aCBpbnN0YWxsaW5nIFZQQyBDTkkgYWRkLW9uKS5cbiAqIE9uY2UgQ0RLIGFkZHMgc3VwcG9ydCB0byByZXBsYWNlIGFuIGV4aXN0aW5nIHNlcnZpY2UgYWNjb3VudCwgdGhpcyBjbGFzcyBzaG91bGQgYmUgZGVsZXRlZCBhbmQgcmVwbGFjZWRcbiAqIHdpdGggdGhlIHN0YW5kYXJkIGVrcy5TZXJ2aWNlQWNjb3VudC5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlcGxhY2VTZXJ2aWNlQWNjb3VudCBleHRlbmRzIENvbnN0cnVjdCBpbXBsZW1lbnRzIGlhbS5JUHJpbmNpcGFsIHtcbiAgICAvKipcbiAgICAgKiBUaGUgcm9sZSB3aGljaCBpcyBsaW5rZWQgdG8gdGhlIHNlcnZpY2UgYWNjb3VudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZG9ubHkgcm9sZTogaWFtLklSb2xlO1xuICBcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXNzdW1lUm9sZUFjdGlvbjogc3RyaW5nO1xuICAgIHB1YmxpYyByZWFkb25seSBncmFudFByaW5jaXBhbDogaWFtLklQcmluY2lwYWw7XG4gICAgcHVibGljIHJlYWRvbmx5IHBvbGljeUZyYWdtZW50OiBpYW0uUHJpbmNpcGFsUG9saWN5RnJhZ21lbnQ7XG4gIFxuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSBzZXJ2aWNlIGFjY291bnQuXG4gICAgICovXG4gICAgcHVibGljIHJlYWRvbmx5IHNlcnZpY2VBY2NvdW50TmFtZTogc3RyaW5nO1xuICBcbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZXNwYWNlIHdoZXJlIHRoZSBzZXJ2aWNlIGFjY291bnQgaXMgbG9jYXRlZCBpbi5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZG9ubHkgc2VydmljZUFjY291bnROYW1lc3BhY2U6IHN0cmluZztcbiAgXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IGVrcy5TZXJ2aWNlQWNjb3VudFByb3BzKSB7XG4gICAgICBzdXBlcihzY29wZSwgaWQpO1xuICBcbiAgICAgIGNvbnN0IHsgY2x1c3RlciB9ID0gcHJvcHM7XG4gICAgICB0aGlzLnNlcnZpY2VBY2NvdW50TmFtZSA9IHByb3BzLm5hbWUgPz8gTmFtZXMudW5pcXVlSWQodGhpcykudG9Mb3dlckNhc2UoKTtcbiAgICAgIHRoaXMuc2VydmljZUFjY291bnROYW1lc3BhY2UgPSBwcm9wcy5uYW1lc3BhY2UgPz8gJ2RlZmF1bHQnO1xuICBcbiAgICAgIC8vIEZyb20gSzhzIGRvY3M6IGh0dHBzOi8va3ViZXJuZXRlcy5pby9kb2NzL3Rhc2tzL2NvbmZpZ3VyZS1wb2QtY29udGFpbmVyL2NvbmZpZ3VyZS1zZXJ2aWNlLWFjY291bnQvXG4gICAgICBpZiAoIXRoaXMuaXNWYWxpZERuc1N1YmRvbWFpbk5hbWUodGhpcy5zZXJ2aWNlQWNjb3VudE5hbWUpKSB7XG4gICAgICAgIHRocm93IFJhbmdlRXJyb3IoJ1RoZSBuYW1lIG9mIGEgU2VydmljZUFjY291bnQgb2JqZWN0IG11c3QgYmUgYSB2YWxpZCBETlMgc3ViZG9tYWluIG5hbWUuJyk7XG4gICAgICB9XG4gIFxuICAgICAgLy8gRnJvbSBLOHMgZG9jczogaHR0cHM6Ly9rdWJlcm5ldGVzLmlvL2RvY3MvY29uY2VwdHMvb3ZlcnZpZXcvd29ya2luZy13aXRoLW9iamVjdHMvbmFtZXNwYWNlcy8jbmFtZXNwYWNlcy1hbmQtZG5zXG4gICAgICBpZiAoIXRoaXMuaXNWYWxpZERuc0xhYmVsTmFtZSh0aGlzLnNlcnZpY2VBY2NvdW50TmFtZXNwYWNlKSkge1xuICAgICAgICB0aHJvdyBSYW5nZUVycm9yKCdBbGwgbmFtZXNwYWNlIG5hbWVzIG11c3QgYmUgdmFsaWQgUkZDIDExMjMgRE5TIGxhYmVscy4nKTtcbiAgICAgIH1cbiAgXG4gICAgICAvKiBBZGQgY29uZGl0aW9ucyB0byB0aGUgcm9sZSB0byBpbXByb3ZlIHNlY3VyaXR5LiBUaGlzIHByZXZlbnRzIG90aGVyIHBvZHMgaW4gdGhlIHNhbWUgbmFtZXNwYWNlIHRvIGFzc3VtZSB0aGUgcm9sZS5cbiAgICAgICogU2VlIGRvY3VtZW50YXRpb246IGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9la3MvbGF0ZXN0L3VzZXJndWlkZS9jcmVhdGUtc2VydmljZS1hY2NvdW50LWlhbS1wb2xpY3ktYW5kLXJvbGUuaHRtbFxuICAgICAgKi9cbiAgICAgIGNvbnN0IGNvbmRpdGlvbnMgPSBuZXcgQ2ZuSnNvbih0aGlzLCAnQ29uZGl0aW9uSnNvbicsIHtcbiAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICBbYCR7Y2x1c3Rlci5vcGVuSWRDb25uZWN0UHJvdmlkZXIub3BlbklkQ29ubmVjdFByb3ZpZGVySXNzdWVyfTphdWRgXTogJ3N0cy5hbWF6b25hd3MuY29tJyxcbiAgICAgICAgICBbYCR7Y2x1c3Rlci5vcGVuSWRDb25uZWN0UHJvdmlkZXIub3BlbklkQ29ubmVjdFByb3ZpZGVySXNzdWVyfTpzdWJgXTogYHN5c3RlbTpzZXJ2aWNlYWNjb3VudDoke3RoaXMuc2VydmljZUFjY291bnROYW1lc3BhY2V9OiR7dGhpcy5zZXJ2aWNlQWNjb3VudE5hbWV9YCxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgcHJpbmNpcGFsID0gbmV3IGlhbS5PcGVuSWRDb25uZWN0UHJpbmNpcGFsKGNsdXN0ZXIub3BlbklkQ29ubmVjdFByb3ZpZGVyKS53aXRoQ29uZGl0aW9ucyh7XG4gICAgICAgIFN0cmluZ0VxdWFsczogY29uZGl0aW9ucyxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdSb2xlJywgeyBhc3N1bWVkQnk6IHByaW5jaXBhbCB9KTtcbiAgXG4gICAgICB0aGlzLmFzc3VtZVJvbGVBY3Rpb24gPSB0aGlzLnJvbGUuYXNzdW1lUm9sZUFjdGlvbjtcbiAgICAgIHRoaXMuZ3JhbnRQcmluY2lwYWwgPSB0aGlzLnJvbGUuZ3JhbnRQcmluY2lwYWw7XG4gICAgICB0aGlzLnBvbGljeUZyYWdtZW50ID0gdGhpcy5yb2xlLnBvbGljeUZyYWdtZW50O1xuICBcbiAgICAgIC8vIE5vdGUgdGhhdCB3ZSBjYW5ub3QgdXNlIGBjbHVzdGVyLmFkZE1hbmlmZXN0YCBoZXJlIGJlY2F1c2UgdGhhdCB3b3VsZCBjcmVhdGUgdGhlIG1hbmlmZXN0XG4gICAgICAvLyBjb25zdHJjdCBpbiB0aGUgc2NvcGUgb2YgdGhlIGNsdXN0ZXIgc3RhY2ssIHdoaWNoIG1pZ2h0IGJlIGEgZGlmZmVyZW50IHN0YWNrIHRoYW4gdGhpcyBvbmUuXG4gICAgICAvLyBUaGlzIG1lYW5zIHRoYXQgdGhlIGNsdXN0ZXIgc3RhY2sgd291bGQgZGVwZW5kIG9uIHRoaXMgc3RhY2sgYmVjYXVzZSBvZiB0aGUgcm9sZSxcbiAgICAgIC8vIGFuZCBzaW5jZSB0aGlzIHN0YWNrIGluaGVyaW50ZWx5IGRlcGVuZHMgb24gdGhlIGNsdXN0ZXIgc3RhY2ssIHdlIHdpbGwgaGF2ZSBhIGNpcmN1bGFyIGRlcGVuZGVuY3kuXG4gICAgICBuZXcgZWtzLkt1YmVybmV0ZXNNYW5pZmVzdCh0aGlzLCBgbWFuaWZlc3QtJHtpZH1TZXJ2aWNlQWNjb3VudFJlc291cmNlYCwge1xuICAgICAgICBjbHVzdGVyLFxuICAgICAgICBvdmVyd3JpdGU6IHRydWUsXG4gICAgICAgIG1hbmlmZXN0OiBbe1xuICAgICAgICAgIGFwaVZlcnNpb246ICd2MScsXG4gICAgICAgICAga2luZDogJ1NlcnZpY2VBY2NvdW50JyxcbiAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgbmFtZTogdGhpcy5zZXJ2aWNlQWNjb3VudE5hbWUsXG4gICAgICAgICAgICBuYW1lc3BhY2U6IHRoaXMuc2VydmljZUFjY291bnROYW1lc3BhY2UsXG4gICAgICAgICAgICBsYWJlbHM6IHtcbiAgICAgICAgICAgICAgJ2FwcC5rdWJlcm5ldGVzLmlvL25hbWUnOiB0aGlzLnNlcnZpY2VBY2NvdW50TmFtZSxcbiAgICAgICAgICAgICAgLi4ucHJvcHMubGFiZWxzLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFubm90YXRpb25zOiB7XG4gICAgICAgICAgICAgICdla3MuYW1hem9uYXdzLmNvbS9yb2xlLWFybic6IHRoaXMucm9sZS5yb2xlQXJuLFxuICAgICAgICAgICAgICAuLi5wcm9wcy5hbm5vdGF0aW9ucyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfV0sXG4gICAgICB9KTtcbiAgXG4gICAgfVxuICAgIHB1YmxpYyBhZGRUb1ByaW5jaXBhbFBvbGljeShzdGF0ZW1lbnQ6IGlhbS5Qb2xpY3lTdGF0ZW1lbnQpOiBpYW0uQWRkVG9QcmluY2lwYWxQb2xpY3lSZXN1bHQge1xuICAgICAgICByZXR1cm4gdGhpcy5yb2xlLmFkZFRvUHJpbmNpcGFsUG9saWN5KHN0YXRlbWVudCk7XG4gICAgICB9XG4gICAgXG4gICAgICAvKipcbiAgICAgICAqIElmIHRoZSB2YWx1ZSBpcyBhIEROUyBzdWJkb21haW4gbmFtZSBhcyBkZWZpbmVkIGluIFJGQyAxMTIzLCBmcm9tIEs4cyBkb2NzLlxuICAgICAgICpcbiAgICAgICAqIGh0dHBzOi8va3ViZXJuZXRlcy5pby9kb2NzL2NvbmNlcHRzL292ZXJ2aWV3L3dvcmtpbmctd2l0aC1vYmplY3RzL25hbWVzLyNkbnMtc3ViZG9tYWluLW5hbWVzXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgaXNWYWxpZERuc1N1YmRvbWFpbk5hbWUodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdmFsdWUubGVuZ3RoIDw9IDI1MyAmJiAvXlthLXowLTldK1thLXowLTktLl0qW2EtejAtOV0rJC8udGVzdCh2YWx1ZSk7XG4gICAgICB9XG4gICAgXG4gICAgICAvKipcbiAgICAgICAqIElmIHRoZSB2YWx1ZSBmb2xsb3dzIEROUyBsYWJlbCBzdGFuZGFyZCBhcyBkZWZpbmVkIGluIFJGQyAxMTIzLCBmcm9tIEs4cyBkb2NzLlxuICAgICAgICpcbiAgICAgICAqIGh0dHBzOi8va3ViZXJuZXRlcy5pby9kb2NzL2NvbmNlcHRzL292ZXJ2aWV3L3dvcmtpbmctd2l0aC1vYmplY3RzL25hbWVzLyNkbnMtbGFiZWwtbmFtZXNcbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBpc1ZhbGlkRG5zTGFiZWxOYW1lKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLmxlbmd0aCA8PSA2MyAmJiAvXlthLXowLTldK1thLXowLTktXSpbYS16MC05XSskLy50ZXN0KHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4iXX0=