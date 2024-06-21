"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceServiceAccount = exports.createServiceAccountWithPolicy = exports.createServiceAccount = void 0;
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
exports.createServiceAccount = createServiceAccount;
function createServiceAccountWithPolicy(cluster, name, namespace, ...policies) {
    const sa = cluster.addServiceAccount(`${name}-sa`, {
        name: name,
        namespace: namespace
    });
    policies.forEach(policy => sa.role.addManagedPolicy(policy));
    return sa;
}
exports.createServiceAccountWithPolicy = createServiceAccountWithPolicy;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2EtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbHMvc2EtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNkNBQTZDO0FBQzdDLDJDQUEyQztBQUMzQywyQ0FBMkM7QUFDM0MsMkNBQXVDO0FBRXZDOzs7O0dBSUc7QUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxPQUFpQixFQUFFLElBQVksRUFBRSxTQUFpQixFQUFFLGNBQWtDO0lBQ3ZILE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLGlCQUFpQixFQUFFO1FBQ3BFLFFBQVEsRUFBRSxjQUFjO0tBQzNCLENBQUMsQ0FBQztJQUVILE9BQU8sOEJBQThCLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFNUUsQ0FBQztBQVBELG9EQU9DO0FBRUQsU0FBZ0IsOEJBQThCLENBQUMsT0FBaUIsRUFBRSxJQUFZLEVBQUUsU0FBaUIsRUFBRSxHQUFHLFFBQThCO0lBQ2hJLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLElBQUksS0FBSyxFQUFFO1FBQy9DLElBQUksRUFBRSxJQUFJO1FBQ1YsU0FBUyxFQUFFLFNBQVM7S0FDdkIsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM3RCxPQUFPLEVBQUUsQ0FBQztBQUNkLENBQUM7QUFSRCx3RUFRQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBYSxxQkFBc0IsU0FBUSxzQkFBUztJQW9CaEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUE4Qjs7UUFDdEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVq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LE9BQU8sS0FBSyxDQUFDLE1BQU0sSUFBSSxHQUFHLElBQUksaUNBQWlDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssbUJBQW1CLENBQUMsS0FBYTtRQUN2QyxPQUFPLEtBQUssQ0FBQyxNQUFNLElBQUksRUFBRSxJQUFJLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1RSxDQUFDO0NBQ0Y7QUF0R0wsc0RBc0dLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSUNsdXN0ZXIsIFNlcnZpY2VBY2NvdW50IH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1la3NcIjtcbmltcG9ydCB7IENmbkpzb24sIE5hbWVzIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgKiBhcyBla3MgZnJvbSBcImF3cy1jZGstbGliL2F3cy1la3NcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHNlcnZpY2UgYWNjb3VudCB0aGF0IGNhbiBhY2Nlc3Mgc2VjcmV0c1xuICogQHBhcmFtIGNsdXN0ZXJJbmZvIFxuICogQHJldHVybnMgc2FcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNlcnZpY2VBY2NvdW50KGNsdXN0ZXI6IElDbHVzdGVyLCBuYW1lOiBzdHJpbmcsIG5hbWVzcGFjZTogc3RyaW5nLCBwb2xpY3lEb2N1bWVudDogaWFtLlBvbGljeURvY3VtZW50KTogU2VydmljZUFjY291bnQge1xuICAgIGNvbnN0IHBvbGljeSA9IG5ldyBpYW0uTWFuYWdlZFBvbGljeShjbHVzdGVyLCBgJHtuYW1lfS1tYW5hZ2VkLXBvbGljeWAsIHtcbiAgICAgICAgZG9jdW1lbnQ6IHBvbGljeURvY3VtZW50XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY3JlYXRlU2VydmljZUFjY291bnRXaXRoUG9saWN5KGNsdXN0ZXIsIG5hbWUsIG5hbWVzcGFjZSwgcG9saWN5KTtcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2VydmljZUFjY291bnRXaXRoUG9saWN5KGNsdXN0ZXI6IElDbHVzdGVyLCBuYW1lOiBzdHJpbmcsIG5hbWVzcGFjZTogc3RyaW5nLCAuLi5wb2xpY2llczogaWFtLklNYW5hZ2VkUG9saWN5W10pOiBTZXJ2aWNlQWNjb3VudCB7XG4gICAgY29uc3Qgc2EgPSBjbHVzdGVyLmFkZFNlcnZpY2VBY2NvdW50KGAke25hbWV9LXNhYCwge1xuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBuYW1lc3BhY2U6IG5hbWVzcGFjZVxuICAgIH0pO1xuXG4gICAgcG9saWNpZXMuZm9yRWFjaChwb2xpY3kgPT4gc2Eucm9sZS5hZGRNYW5hZ2VkUG9saWN5KHBvbGljeSkpO1xuICAgIHJldHVybiBzYTtcbn1cblxuLyoqXG4gKiBUaGlzIGNsYXNzIGlzIGEgY29weSBvZiB0aGUgQ0RLIFNlcnZpY2VBY2NvdW50IGNsYXNzIHdpdGggdGhlIG9ubHkgZGlmZmVyZW5jZSBvZiBhbGxvd2luZyBcbiAqIHRvIHJlcGxhY2Ugc2VydmljZSBhY2NvdW50IGlmIGl0IGFscmVhZHkgZXhpc3RzIChlLmcuIGEgY2FzZSB3aXRoIGluc3RhbGxpbmcgVlBDIENOSSBhZGQtb24pLlxuICogT25jZSBDREsgYWRkcyBzdXBwb3J0IHRvIHJlcGxhY2UgYW4gZXhpc3Rpbmcgc2VydmljZSBhY2NvdW50LCB0aGlzIGNsYXNzIHNob3VsZCBiZSBkZWxldGVkIGFuZCByZXBsYWNlZFxuICogd2l0aCB0aGUgc3RhbmRhcmQgZWtzLlNlcnZpY2VBY2NvdW50LlxuICovXG5leHBvcnQgY2xhc3MgUmVwbGFjZVNlcnZpY2VBY2NvdW50IGV4dGVuZHMgQ29uc3RydWN0IGltcGxlbWVudHMgaWFtLklQcmluY2lwYWwge1xuICAgIC8qKlxuICAgICAqIFRoZSByb2xlIHdoaWNoIGlzIGxpbmtlZCB0byB0aGUgc2VydmljZSBhY2NvdW50LlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkb25seSByb2xlOiBpYW0uSVJvbGU7XG4gIFxuICAgIHB1YmxpYyByZWFkb25seSBhc3N1bWVSb2xlQWN0aW9uOiBzdHJpbmc7XG4gICAgcHVibGljIHJlYWRvbmx5IGdyYW50UHJpbmNpcGFsOiBpYW0uSVByaW5jaXBhbDtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcG9saWN5RnJhZ21lbnQ6IGlhbS5QcmluY2lwYWxQb2xpY3lGcmFnbWVudDtcbiAgXG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIHNlcnZpY2UgYWNjb3VudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZG9ubHkgc2VydmljZUFjY291bnROYW1lOiBzdHJpbmc7XG4gIFxuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lc3BhY2Ugd2hlcmUgdGhlIHNlcnZpY2UgYWNjb3VudCBpcyBsb2NhdGVkIGluLlxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkb25seSBzZXJ2aWNlQWNjb3VudE5hbWVzcGFjZTogc3RyaW5nO1xuICBcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogZWtzLlNlcnZpY2VBY2NvdW50UHJvcHMpIHtcbiAgICAgIHN1cGVyKHNjb3BlLCBpZCk7XG4gIFxuICAgICAgY29uc3QgeyBjbHVzdGVyIH0gPSBwcm9wcztcbiAgICAgIHRoaXMuc2VydmljZUFjY291bnROYW1lID0gcHJvcHMubmFtZSA/PyBOYW1lcy51bmlxdWVJZCh0aGlzKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgdGhpcy5zZXJ2aWNlQWNjb3VudE5hbWVzcGFjZSA9IHByb3BzLm5hbWVzcGFjZSA/PyAnZGVmYXVsdCc7XG4gIFxuICAgICAgLy8gRnJvbSBLOHMgZG9jczogaHR0cHM6Ly9rdWJlcm5ldGVzLmlvL2RvY3MvdGFza3MvY29uZmlndXJlLXBvZC1jb250YWluZXIvY29uZmlndXJlLXNlcnZpY2UtYWNjb3VudC9cbiAgICAgIGlmICghdGhpcy5pc1ZhbGlkRG5zU3ViZG9tYWluTmFtZSh0aGlzLnNlcnZpY2VBY2NvdW50TmFtZSkpIHtcbiAgICAgICAgdGhyb3cgUmFuZ2VFcnJvcignVGhlIG5hbWUgb2YgYSBTZXJ2aWNlQWNjb3VudCBvYmplY3QgbXVzdCBiZSBhIHZhbGlkIEROUyBzdWJkb21haW4gbmFtZS4nKTtcbiAgICAgIH1cbiAgXG4gICAgICAvLyBGcm9tIEs4cyBkb2NzOiBodHRwczovL2t1YmVybmV0ZXMuaW8vZG9jcy9jb25jZXB0cy9vdmVydmlldy93b3JraW5nLXdpdGgtb2JqZWN0cy9uYW1lc3BhY2VzLyNuYW1lc3BhY2VzLWFuZC1kbnNcbiAgICAgIGlmICghdGhpcy5pc1ZhbGlkRG5zTGFiZWxOYW1lKHRoaXMuc2VydmljZUFjY291bnROYW1lc3BhY2UpKSB7XG4gICAgICAgIHRocm93IFJhbmdlRXJyb3IoJ0FsbCBuYW1lc3BhY2UgbmFtZXMgbXVzdCBiZSB2YWxpZCBSRkMgMTEyMyBETlMgbGFiZWxzLicpO1xuICAgICAgfVxuICBcbiAgICAgIC8qIEFkZCBjb25kaXRpb25zIHRvIHRoZSByb2xlIHRvIGltcHJvdmUgc2VjdXJpdHkuIFRoaXMgcHJldmVudHMgb3RoZXIgcG9kcyBpbiB0aGUgc2FtZSBuYW1lc3BhY2UgdG8gYXNzdW1lIHRoZSByb2xlLlxuICAgICAgKiBTZWUgZG9jdW1lbnRhdGlvbjogaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2Vrcy9sYXRlc3QvdXNlcmd1aWRlL2NyZWF0ZS1zZXJ2aWNlLWFjY291bnQtaWFtLXBvbGljeS1hbmQtcm9sZS5odG1sXG4gICAgICAqL1xuICAgICAgY29uc3QgY29uZGl0aW9ucyA9IG5ldyBDZm5Kc29uKHRoaXMsICdDb25kaXRpb25Kc29uJywge1xuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgIFtgJHtjbHVzdGVyLm9wZW5JZENvbm5lY3RQcm92aWRlci5vcGVuSWRDb25uZWN0UHJvdmlkZXJJc3N1ZXJ9OmF1ZGBdOiAnc3RzLmFtYXpvbmF3cy5jb20nLFxuICAgICAgICAgIFtgJHtjbHVzdGVyLm9wZW5JZENvbm5lY3RQcm92aWRlci5vcGVuSWRDb25uZWN0UHJvdmlkZXJJc3N1ZXJ9OnN1YmBdOiBgc3lzdGVtOnNlcnZpY2VhY2NvdW50OiR7dGhpcy5zZXJ2aWNlQWNjb3VudE5hbWVzcGFjZX06JHt0aGlzLnNlcnZpY2VBY2NvdW50TmFtZX1gLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICBjb25zdCBwcmluY2lwYWwgPSBuZXcgaWFtLk9wZW5JZENvbm5lY3RQcmluY2lwYWwoY2x1c3Rlci5vcGVuSWRDb25uZWN0UHJvdmlkZXIpLndpdGhDb25kaXRpb25zKHtcbiAgICAgICAgU3RyaW5nRXF1YWxzOiBjb25kaXRpb25zLFxuICAgICAgfSk7XG4gICAgICB0aGlzLnJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ1JvbGUnLCB7IGFzc3VtZWRCeTogcHJpbmNpcGFsIH0pO1xuICBcbiAgICAgIHRoaXMuYXNzdW1lUm9sZUFjdGlvbiA9IHRoaXMucm9sZS5hc3N1bWVSb2xlQWN0aW9uO1xuICAgICAgdGhpcy5ncmFudFByaW5jaXBhbCA9IHRoaXMucm9sZS5ncmFudFByaW5jaXBhbDtcbiAgICAgIHRoaXMucG9saWN5RnJhZ21lbnQgPSB0aGlzLnJvbGUucG9saWN5RnJhZ21lbnQ7XG4gIFxuICAgICAgLy8gTm90ZSB0aGF0IHdlIGNhbm5vdCB1c2UgYGNsdXN0ZXIuYWRkTWFuaWZlc3RgIGhlcmUgYmVjYXVzZSB0aGF0IHdvdWxkIGNyZWF0ZSB0aGUgbWFuaWZlc3RcbiAgICAgIC8vIGNvbnN0cmN0IGluIHRoZSBzY29wZSBvZiB0aGUgY2x1c3RlciBzdGFjaywgd2hpY2ggbWlnaHQgYmUgYSBkaWZmZXJlbnQgc3RhY2sgdGhhbiB0aGlzIG9uZS5cbiAgICAgIC8vIFRoaXMgbWVhbnMgdGhhdCB0aGUgY2x1c3RlciBzdGFjayB3b3VsZCBkZXBlbmQgb24gdGhpcyBzdGFjayBiZWNhdXNlIG9mIHRoZSByb2xlLFxuICAgICAgLy8gYW5kIHNpbmNlIHRoaXMgc3RhY2sgaW5oZXJpbnRlbHkgZGVwZW5kcyBvbiB0aGUgY2x1c3RlciBzdGFjaywgd2Ugd2lsbCBoYXZlIGEgY2lyY3VsYXIgZGVwZW5kZW5jeS5cbiAgICAgIG5ldyBla3MuS3ViZXJuZXRlc01hbmlmZXN0KHRoaXMsIGBtYW5pZmVzdC0ke2lkfVNlcnZpY2VBY2NvdW50UmVzb3VyY2VgLCB7XG4gICAgICAgIGNsdXN0ZXIsXG4gICAgICAgIG92ZXJ3cml0ZTogdHJ1ZSxcbiAgICAgICAgbWFuaWZlc3Q6IFt7XG4gICAgICAgICAgYXBpVmVyc2lvbjogJ3YxJyxcbiAgICAgICAgICBraW5kOiAnU2VydmljZUFjY291bnQnLFxuICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICBuYW1lOiB0aGlzLnNlcnZpY2VBY2NvdW50TmFtZSxcbiAgICAgICAgICAgIG5hbWVzcGFjZTogdGhpcy5zZXJ2aWNlQWNjb3VudE5hbWVzcGFjZSxcbiAgICAgICAgICAgIGxhYmVsczoge1xuICAgICAgICAgICAgICAnYXBwLmt1YmVybmV0ZXMuaW8vbmFtZSc6IHRoaXMuc2VydmljZUFjY291bnROYW1lLFxuICAgICAgICAgICAgICAuLi5wcm9wcy5sYWJlbHMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYW5ub3RhdGlvbnM6IHtcbiAgICAgICAgICAgICAgJ2Vrcy5hbWF6b25hd3MuY29tL3JvbGUtYXJuJzogdGhpcy5yb2xlLnJvbGVBcm4sXG4gICAgICAgICAgICAgIC4uLnByb3BzLmFubm90YXRpb25zLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9XSxcbiAgICAgIH0pO1xuICBcbiAgICB9XG4gICAgcHVibGljIGFkZFRvUHJpbmNpcGFsUG9saWN5KHN0YXRlbWVudDogaWFtLlBvbGljeVN0YXRlbWVudCk6IGlhbS5BZGRUb1ByaW5jaXBhbFBvbGljeVJlc3VsdCB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvbGUuYWRkVG9QcmluY2lwYWxQb2xpY3koc3RhdGVtZW50KTtcbiAgICAgIH1cbiAgICBcbiAgICAgIC8qKlxuICAgICAgICogSWYgdGhlIHZhbHVlIGlzIGEgRE5TIHN1YmRvbWFpbiBuYW1lIGFzIGRlZmluZWQgaW4gUkZDIDExMjMsIGZyb20gSzhzIGRvY3MuXG4gICAgICAgKlxuICAgICAgICogaHR0cHM6Ly9rdWJlcm5ldGVzLmlvL2RvY3MvY29uY2VwdHMvb3ZlcnZpZXcvd29ya2luZy13aXRoLW9iamVjdHMvbmFtZXMvI2Rucy1zdWJkb21haW4tbmFtZXNcbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBpc1ZhbGlkRG5zU3ViZG9tYWluTmFtZSh2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPD0gMjUzICYmIC9eW2EtejAtOV0rW2EtejAtOS0uXSpbYS16MC05XSskLy50ZXN0KHZhbHVlKTtcbiAgICAgIH1cbiAgICBcbiAgICAgIC8qKlxuICAgICAgICogSWYgdGhlIHZhbHVlIGZvbGxvd3MgRE5TIGxhYmVsIHN0YW5kYXJkIGFzIGRlZmluZWQgaW4gUkZDIDExMjMsIGZyb20gSzhzIGRvY3MuXG4gICAgICAgKlxuICAgICAgICogaHR0cHM6Ly9rdWJlcm5ldGVzLmlvL2RvY3MvY29uY2VwdHMvb3ZlcnZpZXcvd29ya2luZy13aXRoLW9iamVjdHMvbmFtZXMvI2Rucy1sYWJlbC1uYW1lc1xuICAgICAgICovXG4gICAgICBwcml2YXRlIGlzVmFsaWREbnNMYWJlbE5hbWUodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdmFsdWUubGVuZ3RoIDw9IDYzICYmIC9eW2EtejAtOV0rW2EtejAtOS1dKlthLXowLTldKyQvLnRlc3QodmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiJdfQ==