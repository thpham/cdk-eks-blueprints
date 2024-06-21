"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreAddOn = exports.CoreAddOnProps = void 0;
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const utils_1 = require("../../utils");
const sdk = require("@aws-sdk/client-eks");
const aws_cdk_lib_1 = require("aws-cdk-lib");
class CoreAddOnProps {
}
exports.CoreAddOnProps = CoreAddOnProps;
const DEFAULT_NAMESPACE = "kube-system";
/**
 * Implementation of EKS Managed add-ons.
 */
class CoreAddOn {
    constructor(coreAddOnProps) {
        this.coreAddOnProps = coreAddOnProps;
        utils_1.userLog.debug(`Core add-on ${coreAddOnProps.addOnName} is at version ${coreAddOnProps.version}`);
    }
    async deploy(clusterInfo) {
        var _a;
        let serviceAccountRoleArn = undefined;
        let serviceAccount = undefined;
        let saNamespace = undefined;
        saNamespace = DEFAULT_NAMESPACE;
        if ((_a = this.coreAddOnProps) === null || _a === void 0 ? void 0 : _a.namespace) {
            saNamespace = this.coreAddOnProps.namespace;
        }
        const ns = this.createNamespace(clusterInfo, saNamespace);
        // Create a service account if user provides namespace, PolicyDocument
        const policies = this.provideManagedPolicies(clusterInfo);
        if (policies) {
            serviceAccount = this.createServiceAccount(clusterInfo, saNamespace, policies);
            serviceAccountRoleArn = serviceAccount.role.roleArn;
            if (ns) {
                serviceAccount.node.addDependency(ns);
            }
        }
        let version = this.coreAddOnProps.version;
        if (this.coreAddOnProps.version === "auto") {
            version = await this.provideVersion(clusterInfo, this.coreAddOnProps.versionMap);
        }
        let addOnProps = {
            addonName: this.coreAddOnProps.addOnName,
            addonVersion: version,
            configurationValues: JSON.stringify(this.coreAddOnProps.configurationValues),
            clusterName: clusterInfo.cluster.clusterName,
            serviceAccountRoleArn: serviceAccountRoleArn,
            resolveConflicts: "OVERWRITE"
        };
        const cfnAddon = new aws_eks_1.CfnAddon(clusterInfo.cluster.stack, this.coreAddOnProps.addOnName + "-addOn", addOnProps);
        if (serviceAccount) {
            cfnAddon.node.addDependency(serviceAccount);
        }
        else if (ns) {
            cfnAddon.node.addDependency(ns);
        }
        if (this.coreAddOnProps.controlPlaneAddOn) {
            (0, utils_1.deployBeforeCapacity)(cfnAddon, clusterInfo);
        }
        /**
         *  Retain the addon otherwise cluster destroy will fail due to CoreDnsComputeTypePatch
         *  https://github.com/aws/aws-cdk/issues/28621
         * */
        if (clusterInfo.cluster instanceof aws_eks_1.FargateCluster && this.coreAddOnProps.addOnName === "coredns") {
            cfnAddon.applyRemovalPolicy(aws_cdk_lib_1.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE);
        }
        // Instantiate the Add-on
        return Promise.resolve(cfnAddon);
    }
    /**
     * Override this method to create namespace for the core addon. In many cases the addon is created in the kube-system namespace
     * which does not require creation as it is always there.
     * For addons that support other namespace as destinations this method should be implemented.
     * @param clusterInfo
     * @param name
     * @returns
     */
    createNamespace(_clusterInfo, _namespaceName) {
        return undefined;
    }
    /**
     * Override this method to control how service account is created.
     * @param clusterInfo
     * @param saNamespace
     * @param policies
     * @returns
     */
    createServiceAccount(clusterInfo, saNamespace, policies) {
        return (0, utils_1.createServiceAccountWithPolicy)(clusterInfo.cluster, this.coreAddOnProps.saName, saNamespace, ...policies);
    }
    /**
     * Template method with default implementation to execute the supplied function of policyDocumentProvider.
     * Allows overriding this method in subclasses for more complex cases of policies.
     * @param clusterInfo
     * @returns
     */
    providePolicyDocument(clusterInfo) {
        var _a;
        if ((_a = this.coreAddOnProps) === null || _a === void 0 ? void 0 : _a.policyDocumentProvider) {
            return this.coreAddOnProps.policyDocumentProvider(clusterInfo.cluster.stack.partition);
        }
        return undefined;
    }
    /**
     * Template method to return managed policies for the service account.
     * Allows overriding in subclasses to handle more complex cases of policies.
     */
    provideManagedPolicies(clusterInfo) {
        let result;
        const policyDocument = this.providePolicyDocument(clusterInfo);
        if (policyDocument) {
            const policy = new aws_iam_1.ManagedPolicy(clusterInfo.cluster, `${this.coreAddOnProps.addOnName}-managed-policy`, {
                document: policyDocument
            });
            result = [policy];
        }
        return result;
    }
    async provideVersion(clusterInfo, versionMap) {
        var _a, _b, _c;
        const client = new sdk.EKSClient(clusterInfo.cluster.stack.region);
        const command = new sdk.DescribeAddonVersionsCommand({
            addonName: this.coreAddOnProps.addOnName,
            kubernetesVersion: clusterInfo.version.version
        });
        try {
            const response = await client.send(command);
            if (response.addons && response.addons.length > 0) {
                const defaultVersions = (_a = response.addons) === null || _a === void 0 ? void 0 : _a.flatMap(addon => {
                    var _a;
                    return (_a = addon.addonVersions) === null || _a === void 0 ? void 0 : _a.filter(version => { var _a; return (_a = version.compatibilities) === null || _a === void 0 ? void 0 : _a.some(compatibility => compatibility.defaultVersion === true); });
                });
                const version = (_b = defaultVersions[0]) === null || _b === void 0 ? void 0 : _b.addonVersion;
                if (!version) {
                    throw new Error(`No default version found for addo-on ${this.coreAddOnProps.addOnName}`);
                }
                utils_1.userLog.debug(`Core add-on ${this.coreAddOnProps.addOnName} has autoselected version ${version}`);
                return version;
            }
            else {
                throw new Error(`No add-on versions found for addon-on ${this.coreAddOnProps.addOnName}`);
            }
        }
        catch (error) {
            utils_1.logger.warn(error);
            utils_1.logger.warn(error);
            utils_1.logger.warn(`Failed to retrieve add-on versions from EKS for add-on ${this.coreAddOnProps.addOnName}.`);
            utils_1.logger.warn("Possible reasons for failures - Unauthorized or Authentication failure or Network failure on the terminal.");
            utils_1.logger.warn(" Falling back to default version.");
            if (!versionMap) {
                throw new Error(`No version map provided and no default version found for add-on ${this.coreAddOnProps.addOnName}`);
            }
            let version = (_c = versionMap.get(clusterInfo.version)) !== null && _c !== void 0 ? _c : versionMap.values().next().value;
            utils_1.userLog.debug(`Core add-on ${this.coreAddOnProps.addOnName} has autoselected version ${version}`);
            return version;
        }
    }
}
exports.CoreAddOn = CoreAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2NvcmUtYWRkb24vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaURBQStFO0FBSS9FLGlEQUFvRjtBQUVwRix1Q0FBc0c7QUFDdEcsMkNBQTJDO0FBQzNDLDZDQUE0QztBQUU1QyxNQUFhLGNBQWM7Q0FxQzFCO0FBckNELHdDQXFDQztBQUVELE1BQU0saUJBQWlCLEdBQUcsYUFBYSxDQUFDO0FBRXhDOztHQUVHO0FBQ0gsTUFBYSxTQUFTO0lBSWxCLFlBQVksY0FBOEI7UUFDdEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDckMsZUFBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLGNBQWMsQ0FBQyxTQUFTLGtCQUFrQixjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNyRyxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUF3Qjs7UUFFakMsSUFBSSxxQkFBcUIsR0FBdUIsU0FBUyxDQUFDO1FBQzFELElBQUksY0FBYyxHQUErQixTQUFTLENBQUM7UUFDM0QsSUFBSSxXQUFXLEdBQXVCLFNBQVMsQ0FBQztRQUVoRCxXQUFXLEdBQUcsaUJBQWlCLENBQUM7UUFDaEMsSUFBSSxNQUFBLElBQUksQ0FBQyxjQUFjLDBDQUFFLFNBQVMsRUFBRSxDQUFDO1lBQ2pDLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQztRQUNoRCxDQUFDO1FBRUQsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFMUQsc0VBQXNFO1FBQ3RFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxRCxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ1gsY0FBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxX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LE9BQU8sR0FBVyxNQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxtQ0FBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQzlGLGVBQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsNkJBQTZCLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDbEcsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQXRLRCw4QkFzS0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDZm5BZGRvbiwgRmFyZ2F0ZUNsdXN0ZXIsIFNlcnZpY2VBY2NvdW50IH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1la3NcIjtcbmltcG9ydCB7IENsdXN0ZXJBZGRPbiB9IGZyb20gXCIuLi8uLlwiO1xuaW1wb3J0IHsgQ2x1c3RlckluZm8sIFZhbHVlcyB9IGZyb20gXCIuLi8uLi9zcGlcIjtcbmltcG9ydCB7IENvbnN0cnVjdCwgSUNvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBJTWFuYWdlZFBvbGljeSwgTWFuYWdlZFBvbGljeSwgUG9saWN5RG9jdW1lbnQgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0IHsgS3ViZXJuZXRlc1ZlcnNpb24gfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xuaW1wb3J0IHsgY3JlYXRlU2VydmljZUFjY291bnRXaXRoUG9saWN5LCBkZXBsb3lCZWZvcmVDYXBhY2l0eSwgbG9nZ2VyLCB1c2VyTG9nLCAgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWVrc1wiO1xuaW1wb3J0IHsgUmVtb3ZhbFBvbGljeSB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuXG5leHBvcnQgY2xhc3MgQ29yZUFkZE9uUHJvcHMge1xuICAgIC8qKlxuICAgICAqIE5hbWUgb2YgdGhlIGFkZC1vbiB0byBpbnN0YW50aWF0ZVxuICAgICAqL1xuICAgIHJlYWRvbmx5IGFkZE9uTmFtZTogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIFZlcnNpb24gb2YgdGhlIGFkZC1vbiB0byB1c2UuIE11c3QgbWF0Y2ggdGhlIHZlcnNpb24gb2YgdGhlIGNsdXN0ZXIgd2hlcmUgaXRcbiAgICAgKiB3aWxsIGJlIGRlcGxveWVkIGl0XG4gICAgICovXG4gICAgcmVhZG9ubHkgdmVyc2lvbjogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIFBvbGljeSBkb2N1bWVudCBwcm92aWRlciByZXR1cm5zIHRoZSBwb2xpY3kgcmVxdWlyZWQgYnkgdGhlIGFkZC1vbiB0byBhbGxvdyBpdCB0byBpbnRlcmFjdCB3aXRoIEFXUyByZXNvdXJjZXNcbiAgICAgKi9cbiAgICByZWFkb25seSBwb2xpY3lEb2N1bWVudFByb3ZpZGVyPzogKHBhcnRpdGlvbjogc3RyaW5nKSA9PiBQb2xpY3lEb2N1bWVudDtcbiAgICAvKipcbiAgICAgKiBTZXJ2aWNlIEFjY291bnQgTmFtZSB0byBiZSB1c2VkIHdpdGggQWRkT24uXG4gICAgICovXG4gICAgcmVhZG9ubHkgc2FOYW1lOiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogTmFtZXNwYWNlIHRvIGNyZWF0ZSB0aGUgU2VydmljZUFjY291bnQuXG4gICAgICovXG4gICAgcmVhZG9ubHkgbmFtZXNwYWNlPzogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyYXRpb25WYWx1ZXMgZmllbGQgdG8gcGFzcyBjdXN0b20gY29uZmlndXJhdGlvbnMgdG8gQWRkb25cbiAgICAgKi9cbiAgICByZWFkb25seSBjb25maWd1cmF0aW9uVmFsdWVzPzogVmFsdWVzO1xuXG4gICAgLyoqXG4gICAgICogSW5kaWNhdGVzIHRoYXQgYWRkLW9uIG11c3QgYmUgaW5zdGFsbGVkIGJlZm9yZSBhbnkgY2FwYWNpdHkgaXMgYWRkZWQgZm9yIHdvcmtlciBub2RlcyAoaW5jdWRpbmcgRmFyZ2F0ZSkuXG4gICAgICovXG4gICAgcmVhZG9ubHkgY29udHJvbFBsYW5lQWRkT24/OiBib29sZWFuO1xuXG5cbiAgICAvKipcbiAgICAgKiBNYXAgYmV0d2VlbiBrdWJlcm5ldGVzIHZlcnNpb25zIGFuZCBhZGRPbiB2ZXJzaW9ucyBmb3IgYXV0byBzZWxlY3Rpb24uXG4gICAgICovXG4gICAgcmVhZG9ubHkgdmVyc2lvbk1hcD86IE1hcDxLdWJlcm5ldGVzVmVyc2lvbiwgc3RyaW5nPjtcbn1cblxuY29uc3QgREVGQVVMVF9OQU1FU1BBQ0UgPSBcImt1YmUtc3lzdGVtXCI7XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgRUtTIE1hbmFnZWQgYWRkLW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvcmVBZGRPbiBpbXBsZW1lbnRzIENsdXN0ZXJBZGRPbiB7XG5cbiAgICByZWFkb25seSBjb3JlQWRkT25Qcm9wczogQ29yZUFkZE9uUHJvcHM7XG5cbiAgICBjb25zdHJ1Y3Rvcihjb3JlQWRkT25Qcm9wczogQ29yZUFkZE9uUHJvcHMpIHtcbiAgICAgICAgdGhpcy5jb3JlQWRkT25Qcm9wcyA9IGNvcmVBZGRPblByb3BzO1xuICAgICAgICB1c2VyTG9nLmRlYnVnKGBDb3JlIGFkZC1vbiAke2NvcmVBZGRPblByb3BzLmFkZE9uTmFtZX0gaXMgYXQgdmVyc2lvbiAke2NvcmVBZGRPblByb3BzLnZlcnNpb259YCk7XG4gICAgfVxuXG4gICAgYXN5bmMgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFByb21pc2U8Q29uc3RydWN0PiB7XG5cbiAgICAgICAgbGV0IHNlcnZpY2VBY2NvdW50Um9sZUFybjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgICBsZXQgc2VydmljZUFjY291bnQ6IFNlcnZpY2VBY2NvdW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgICBsZXQgc2FOYW1lc3BhY2U6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgICAgICBzYU5hbWVzcGFjZSA9IERFRkFVTFRfTkFNRVNQQUNFO1xuICAgICAgICBpZiAodGhpcy5jb3JlQWRkT25Qcm9wcz8ubmFtZXNwYWNlKSB7XG4gICAgICAgICAgICBzYU5hbWVzcGFjZSA9IHRoaXMuY29yZUFkZE9uUHJvcHMubmFtZXNwYWNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbnMgPSB0aGlzLmNyZWF0ZU5hbWVzcGFjZShjbHVzdGVySW5mbywgc2FOYW1lc3BhY2UpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIHNlcnZpY2UgYWNjb3VudCBpZiB1c2VyIHByb3ZpZGVzIG5hbWVzcGFjZSwgUG9saWN5RG9jdW1lbnRcbiAgICAgICAgY29uc3QgcG9saWNpZXMgPSB0aGlzLnByb3ZpZGVNYW5hZ2VkUG9saWNpZXMoY2x1c3RlckluZm8pO1xuICAgICAgICBpZiAocG9saWNpZXMpIHtcbiAgICAgICAgICAgIHNlcnZpY2VBY2NvdW50ID0gdGhpcy5jcmVhdGVTZXJ2aWNlQWNjb3VudChjbHVzdGVySW5mbywgc2FOYW1lc3BhY2UsIHBvbGljaWVzKTtcbiAgICAgICAgICAgIHNlcnZpY2VBY2NvdW50Um9sZUFybiA9IHNlcnZpY2VBY2NvdW50LnJvbGUucm9sZUFybjtcbiAgICAgICAgICAgIGlmKG5zKSB7XG4gICAgICAgICAgICAgICAgc2VydmljZUFjY291bnQubm9kZS5hZGREZXBlbmRlbmN5KG5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB2ZXJzaW9uOiBzdHJpbmcgPSB0aGlzLmNvcmVBZGRPblByb3BzLnZlcnNpb247XG5cbiAgICAgICAgaWYgKHRoaXMuY29yZUFkZE9uUHJvcHMudmVyc2lvbiA9PT0gXCJhdXRvXCIpIHtcbiAgICAgICAgICAgIHZlcnNpb24gPSBhd2FpdCB0aGlzLnByb3ZpZGVWZXJzaW9uKGNsdXN0ZXJJbmZvLCB0aGlzLmNvcmVBZGRPblByb3BzLnZlcnNpb25NYXApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGFkZE9uUHJvcHMgPSB7XG4gICAgICAgICAgICBhZGRvbk5hbWU6IHRoaXMuY29yZUFkZE9uUHJvcHMuYWRkT25OYW1lLFxuICAgICAgICAgICAgYWRkb25WZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvblZhbHVlczogSlNPTi5zdHJpbmdpZnkodGhpcy5jb3JlQWRkT25Qcm9wcy5jb25maWd1cmF0aW9uVmFsdWVzKSxcbiAgICAgICAgICAgIGNsdXN0ZXJOYW1lOiBjbHVzdGVySW5mby5jbHVzdGVyLmNsdXN0ZXJOYW1lLFxuICAgICAgICAgICAgc2VydmljZUFjY291bnRSb2xlQXJuOiBzZXJ2aWNlQWNjb3VudFJvbGVBcm4sXG4gICAgICAgICAgICByZXNvbHZlQ29uZmxpY3RzOiBcIk9WRVJXUklURVwiXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgY2ZuQWRkb24gPSBuZXcgQ2ZuQWRkb24oY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjaywgdGhpcy5jb3JlQWRkT25Qcm9wcy5hZGRPbk5hbWUgKyBcIi1hZGRPblwiLCBhZGRPblByb3BzKTtcbiAgICAgICAgaWYgKHNlcnZpY2VBY2NvdW50KSB7XG4gICAgICAgICAgICBjZm5BZGRvbi5ub2RlLmFkZERlcGVuZGVuY3koc2VydmljZUFjY291bnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYobnMpIHtcbiAgICAgICAgICAgIGNmbkFkZG9uLm5vZGUuYWRkRGVwZW5kZW5jeShucyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLmNvcmVBZGRPblByb3BzLmNvbnRyb2xQbGFuZUFkZE9uKSB7XG4gICAgICAgICAgICBkZXBsb3lCZWZvcmVDYXBhY2l0eShjZm5BZGRvbiwgY2x1c3RlckluZm8pO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgUmV0YWluIHRoZSBhZGRvbiBvdGhlcndpc2UgY2x1c3RlciBkZXN0cm95IHdpbGwgZmFpbCBkdWUgdG8gQ29yZURuc0NvbXB1dGVUeXBlUGF0Y2ggXG4gICAgICAgICAqICBodHRwczovL2dpdGh1Yi5jb20vYXdzL2F3cy1jZGsvaXNzdWVzLzI4NjIxXG4gICAgICAgICAqICovIFxuICAgICAgICBcbiAgICAgICAgaWYoY2x1c3RlckluZm8uY2x1c3RlciBpbnN0YW5jZW9mIEZhcmdhdGVDbHVzdGVyICYmIHRoaXMuY29yZUFkZE9uUHJvcHMuYWRkT25OYW1lID09PSBcImNvcmVkbnNcIil7XG4gICAgICAgICAgICBjZm5BZGRvbi5hcHBseVJlbW92YWxQb2xpY3koUmVtb3ZhbFBvbGljeS5SRVRBSU5fT05fVVBEQVRFX09SX0RFTEVURSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSW5zdGFudGlhdGUgdGhlIEFkZC1vblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNmbkFkZG9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPdmVycmlkZSB0aGlzIG1ldGhvZCB0byBjcmVhdGUgbmFtZXNwYWNlIGZvciB0aGUgY29yZSBhZGRvbi4gSW4gbWFueSBjYXNlcyB0aGUgYWRkb24gaXMgY3JlYXRlZCBpbiB0aGUga3ViZS1zeXN0ZW0gbmFtZXNwYWNlXG4gICAgICogd2hpY2ggZG9lcyBub3QgcmVxdWlyZSBjcmVhdGlvbiBhcyBpdCBpcyBhbHdheXMgdGhlcmUuIFxuICAgICAqIEZvciBhZGRvbnMgdGhhdCBzdXBwb3J0IG90aGVyIG5hbWVzcGFjZSBhcyBkZXN0aW5hdGlvbnMgdGhpcyBtZXRob2Qgc2hvdWxkIGJlIGltcGxlbWVudGVkLlxuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mbyBcbiAgICAgKiBAcGFyYW0gbmFtZSBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBjcmVhdGVOYW1lc3BhY2UoX2NsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbywgX25hbWVzcGFjZU5hbWU6IHN0cmluZyk6IElDb25zdHJ1Y3QgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGNvbnRyb2wgaG93IHNlcnZpY2UgYWNjb3VudCBpcyBjcmVhdGVkLlxuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mbyBcbiAgICAgKiBAcGFyYW0gc2FOYW1lc3BhY2UgXG4gICAgICogQHBhcmFtIHBvbGljaWVzIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGNyZWF0ZVNlcnZpY2VBY2NvdW50KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbywgc2FOYW1lc3BhY2U6IHN0cmluZywgcG9saWNpZXM6IElNYW5hZ2VkUG9saWN5W10pOiBTZXJ2aWNlQWNjb3VudCB7XG4gICAgICAgIHJldHVybiBjcmVhdGVTZXJ2aWNlQWNjb3VudFdpdGhQb2xpY3koY2x1c3RlckluZm8uY2x1c3RlciwgdGhpcy5jb3JlQWRkT25Qcm9wcy5zYU5hbWUsXG4gICAgICAgICAgICBzYU5hbWVzcGFjZSwgLi4ucG9saWNpZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRlbXBsYXRlIG1ldGhvZCB3aXRoIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gdG8gZXhlY3V0ZSB0aGUgc3VwcGxpZWQgZnVuY3Rpb24gb2YgcG9saWN5RG9jdW1lbnRQcm92aWRlci5cbiAgICAgKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGlzIG1ldGhvZCBpbiBzdWJjbGFzc2VzIGZvciBtb3JlIGNvbXBsZXggY2FzZXMgb2YgcG9saWNpZXMuXG4gICAgICogQHBhcmFtIGNsdXN0ZXJJbmZvXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBwcm92aWRlUG9saWN5RG9jdW1lbnQoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKSA6IFBvbGljeURvY3VtZW50IHwgdW5kZWZpbmVkIHtcbiAgICAgICAgaWYodGhpcy5jb3JlQWRkT25Qcm9wcz8ucG9saWN5RG9jdW1lbnRQcm92aWRlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29yZUFkZE9uUHJvcHMucG9saWN5RG9jdW1lbnRQcm92aWRlcihjbHVzdGVySW5mby5jbHVzdGVyLnN0YWNrLnBhcnRpdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUZW1wbGF0ZSBtZXRob2QgdG8gcmV0dXJuIG1hbmFnZWQgcG9saWNpZXMgZm9yIHRoZSBzZXJ2aWNlIGFjY291bnQuXG4gICAgICogQWxsb3dzIG92ZXJyaWRpbmcgaW4gc3ViY2xhc3NlcyB0byBoYW5kbGUgbW9yZSBjb21wbGV4IGNhc2VzIG9mIHBvbGljaWVzLlxuICAgICAqL1xuICAgIHByb3ZpZGVNYW5hZ2VkUG9saWNpZXMoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKSA6IElNYW5hZ2VkUG9saWN5W10gfCB1bmRlZmluZWQge1xuICAgICAgICBsZXQgcmVzdWx0IDogSU1hbmFnZWRQb2xpY3lbXSB8IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgcG9saWN5RG9jdW1lbnQgPSB0aGlzLnByb3ZpZGVQb2xpY3lEb2N1bWVudChjbHVzdGVySW5mbyk7XG5cbiAgICAgICAgaWYocG9saWN5RG9jdW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IHBvbGljeSA9IG5ldyBNYW5hZ2VkUG9saWN5KGNsdXN0ZXJJbmZvLmNsdXN0ZXIsIGAke3RoaXMuY29yZUFkZE9uUHJvcHMuYWRkT25OYW1lfS1tYW5hZ2VkLXBvbGljeWAsIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudDogcG9saWN5RG9jdW1lbnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzdWx0ID0gW3BvbGljeV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBhc3luYyBwcm92aWRlVmVyc2lvbihjbHVzdGVySW5mbzogQ2x1c3RlckluZm8sIHZlcnNpb25NYXA/OiBNYXA8S3ViZXJuZXRlc1ZlcnNpb24sIHN0cmluZz4pIDogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gbmV3IHNkay5FS1NDbGllbnQoY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjay5yZWdpb24pO1xuICAgICAgICBjb25zdCBjb21tYW5kID0gbmV3IHNkay5EZXNjcmliZUFkZG9uVmVyc2lvbnNDb21tYW5kKHtcbiAgICAgICAgICAgIGFkZG9uTmFtZTogdGhpcy5jb3JlQWRkT25Qcm9wcy5hZGRPbk5hbWUsXG4gICAgICAgICAgICBrdWJlcm5ldGVzVmVyc2lvbjogY2x1c3RlckluZm8udmVyc2lvbi52ZXJzaW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNsaWVudC5zZW5kKGNvbW1hbmQpO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmFkZG9ucyAmJiByZXNwb25zZS5hZGRvbnMubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWZhdWx0VmVyc2lvbnMgPSByZXNwb25zZS5hZGRvbnM/LmZsYXRNYXAoYWRkb24gPT5cbiAgICAgICAgICAgICAgICAgICAgYWRkb24uYWRkb25WZXJzaW9ucz8uZmlsdGVyKHZlcnNpb24gPT5cbiAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uLmNvbXBhdGliaWxpdGllcz8uc29tZShjb21wYXRpYmlsaXR5ID0+IGNvbXBhdGliaWxpdHkuZGVmYXVsdFZlcnNpb24gPT09IHRydWUpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgdmVyc2lvbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gZGVmYXVsdFZlcnNpb25zWzBdPy5hZGRvblZlcnNpb247XG4gICAgICAgICAgICAgICAgaWYgKCF2ZXJzaW9uKSB7IFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIGRlZmF1bHQgdmVyc2lvbiBmb3VuZCBmb3IgYWRkby1vbiAke3RoaXMuY29yZUFkZE9uUHJvcHMuYWRkT25OYW1lfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB1c2VyTG9nLmRlYnVnKGBDb3JlIGFkZC1vbiAke3RoaXMuY29yZUFkZE9uUHJvcHMuYWRkT25OYW1lfSBoYXMgYXV0b3NlbGVjdGVkIHZlcnNpb24gJHt2ZXJzaW9ufWApO1xuICAgICAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBhZGQtb24gdmVyc2lvbnMgZm91bmQgZm9yIGFkZG9uLW9uICR7dGhpcy5jb3JlQWRkT25Qcm9wcy5hZGRPbk5hbWV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihlcnJvcik7XG4gICAgICAgICAgICBsb2dnZXIud2FybihlcnJvcik7XG4gICAgICAgICAgICBsb2dnZXIud2FybihgRmFpbGVkIHRvIHJldHJpZXZlIGFkZC1vbiB2ZXJzaW9ucyBmcm9tIEVLUyBmb3IgYWRkLW9uICR7dGhpcy5jb3JlQWRkT25Qcm9wcy5hZGRPbk5hbWV9LmApO1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJQb3NzaWJsZSByZWFzb25zIGZvciBmYWlsdXJlcyAtIFVuYXV0aG9yaXplZCBvciBBdXRoZW50aWNhdGlvbiBmYWlsdXJlIG9yIE5ldHdvcmsgZmFpbHVyZSBvbiB0aGUgdGVybWluYWwuXCIpO1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCIgRmFsbGluZyBiYWNrIHRvIGRlZmF1bHQgdmVyc2lvbi5cIik7XG4gICAgICAgICAgICBpZiAoIXZlcnNpb25NYXApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHZlcnNpb24gbWFwIHByb3ZpZGVkIGFuZCBubyBkZWZhdWx0IHZlcnNpb24gZm91bmQgZm9yIGFkZC1vbiAke3RoaXMuY29yZUFkZE9uUHJvcHMuYWRkT25OYW1lfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHZlcnNpb246IHN0cmluZyA9IHZlcnNpb25NYXAuZ2V0KGNsdXN0ZXJJbmZvLnZlcnNpb24pID8/IHZlcnNpb25NYXAudmFsdWVzKCkubmV4dCgpLnZhbHVlO1xuICAgICAgICAgICAgdXNlckxvZy5kZWJ1ZyhgQ29yZSBhZGQtb24gJHt0aGlzLmNvcmVBZGRPblByb3BzLmFkZE9uTmFtZX0gaGFzIGF1dG9zZWxlY3RlZCB2ZXJzaW9uICR7dmVyc2lvbn1gKTtcbiAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19