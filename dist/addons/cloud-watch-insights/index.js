"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudWatchInsights = void 0;
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const utils_1 = require("../../utils");
const core_addon_1 = require("../core-addon");
const iam_policy_1 = require("./iam-policy");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
// Can be easily retrived from the aws cli with:
// aws eks describe-addon-versions --kubernetes-version <kubernetes-version> --addon-name amazon-cloudwatch-observability \
//     --query 'addons[].addonVersions[].{Version: addonVersion, Defaultversion: compatibilities[0].defaultVersion}' --output table
const versionMap = new Map([
    [aws_eks_1.KubernetesVersion.V1_30, "v1.7.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_29, "v1.7.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_28, "v1.7.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_27, "v1.7.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_26, "v1.7.0-eksbuild.1"],
]);
const defaultProps = {
    addOnName: "amazon-cloudwatch-observability",
    version: "auto",
    versionMap: versionMap,
    saName: "cloudwatch-agent",
    namespace: "amazon-cloudwatch"
};
/**
 * Implementation of AWS CloudWatch Insights Addon
 */
let CloudWatchInsights = class CloudWatchInsights extends core_addon_1.CoreAddOn {
    constructor(props) {
        var _a, _b;
        super({
            addOnName: defaultProps.addOnName,
            version: (_a = props === null || props === void 0 ? void 0 : props.version) !== null && _a !== void 0 ? _a : defaultProps.version,
            versionMap: defaultProps.versionMap,
            saName: defaultProps.saName,
            namespace: defaultProps.namespace,
            configurationValues: (_b = props === null || props === void 0 ? void 0 : props.customCloudWatchAgentConfig) !== null && _b !== void 0 ? _b : {},
            controlPlaneAddOn: false
        });
        this.options = props !== null && props !== void 0 ? props : {};
    }
    deploy(clusterInfo) {
        return super.deploy(clusterInfo);
    }
    createNamespace(clusterInfo, namespaceName) {
        return (0, utils_1.createNamespace)(namespaceName, clusterInfo.cluster);
    }
    provideManagedPolicies(clusterInfo) {
        const requiredPolicies = [
            aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchAgentServerPolicy"),
            aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName("AWSXrayWriteOnlyAccess")
        ];
        if (this.options.ebsPerformanceLogs != undefined && this.options.ebsPerformanceLogs) {
            const ebsPolicy = new aws_iam_1.ManagedPolicy(clusterInfo.cluster, 'cloudwatch-agent-mangaed-policy', {
                document: (0, iam_policy_1.ebsCollectorPolicy)()
            });
            requiredPolicies.push(ebsPolicy);
        }
        return requiredPolicies;
    }
};
exports.CloudWatchInsights = CloudWatchInsights;
__decorate([
    (0, utils_1.conflictsWith)("AdotCollectorAddon", "CloudWatchAdotAddon", "CloudWatchLogsAddon")
], CloudWatchInsights.prototype, "deploy", null);
exports.CloudWatchInsights = CloudWatchInsights = __decorate([
    utils_1.supportsALL
], CloudWatchInsights);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2Nsb3VkLXdhdGNoLWluc2lnaHRzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLGlEQUFrRTtBQUVsRSx1Q0FBeUY7QUFDekYsOENBQXdEO0FBQ3hELDZDQUFnRDtBQUNoRCxpREFBc0Q7QUFFdEQsZ0RBQWdEO0FBQ2hELDJIQUEySDtBQUMzSCxtSUFBbUk7QUFDbkksTUFBTSxVQUFVLEdBQW1DLElBQUksR0FBRyxDQUFDO0lBQ3pELENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDO0lBQzlDLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDO0lBQzlDLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDO0lBQzlDLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDO0lBQzlDLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDO0NBQy9DLENBQUMsQ0FBQztBQXdCSCxNQUFNLFlBQVksR0FBRztJQUNuQixTQUFTLEVBQUUsaUNBQWlDO0lBQzVDLE9BQU8sRUFBRSxNQUFNO0lBQ2YsVUFBVSxFQUFFLFVBQVU7SUFDdEIsTUFBTSxFQUFFLGtCQUFrQjtJQUMxQixTQUFTLEVBQUUsbUJBQW1CO0NBQy9CLENBQUM7QUFFRjs7R0FFRztBQUVJLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsc0JBQVM7SUFJL0MsWUFBWSxLQUFvQzs7UUFDOUMsS0FBSyxDQUFDO1lBQ0osU0FBUyxFQUFFLFlBQVksQ0FBQyxTQUFTO1lBQ2pDLE9BQU8sRUFBRSxNQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxPQUFPLG1DQUFJLFlBQVksQ0FBQyxPQUFPO1lBQy9DLFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVTtZQUNuQyxNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDM0IsU0FBUyxFQUFFLFlBQVksQ0FBQyxTQUFTO1lBQ2pDLG1CQUFtQixFQUFFLE1BQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLDJCQUEyQixtQ0FBSSxFQUFFO1lBQzdELGlCQUFpQixFQUFFLEtBQUs7U0FDekIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLGFBQUwsS0FBSyxjQUFMLEtBQUssR0FBSSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUdELE1BQU0sQ0FBQyxXQUF3QjtRQUM3QixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELGVBQWUsQ0FBQyxXQUF3QixFQUFFLGFBQXFCO1FBQzdELE9BQU8sSUFBQSx1QkFBYSxFQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELHNCQUFzQixDQUFDLFdBQXdCO1FBQzdDLE1BQU0sZ0JBQWdCLEdBQUc7WUFDdkIsdUJBQWEsQ0FBQyx3QkFBd0IsQ0FBQyw2QkFBNkIsQ0FBQztZQUNyRSx1QkFBYSxDQUFDLHdCQUF3QixDQUFDLHdCQUF3QixDQUFDO1NBQ2pFLENBQUM7UUFFRixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLElBQUksU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUNwRixNQUFNLFNBQVMsR0FBRyxJQUFJLHVCQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxpQ0FBaUMsRUFBRTtnQkFDMUYsUUFBUSxFQUFFLElBQUEsK0JBQWtCLEdBQUU7YUFDL0IsQ0FBQyxDQUFDO1lBQ0gsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRCxPQUFPLGdCQUFnQixDQUFDO0lBQzFCLENBQUM7Q0FDRixDQUFBO0FBMUNZLGdEQUFrQjtBQW1CN0I7SUFEQyxJQUFBLHFCQUFhLEVBQUMsb0JBQW9CLEVBQUUscUJBQXFCLEVBQUUscUJBQXFCLENBQUM7Z0RBR2pGOzZCQXJCVSxrQkFBa0I7SUFEOUIsbUJBQVc7R0FDQyxrQkFBa0IsQ0EwQzlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb25zdHJ1Y3QsIElDb25zdHJ1Y3R9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHtJTWFuYWdlZFBvbGljeSwgTWFuYWdlZFBvbGljeX0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCB7Q2x1c3RlckluZm8sIFZhbHVlc30gZnJvbSBcIi4uLy4uL3NwaVwiO1xuaW1wb3J0IHtjb25mbGljdHNXaXRoLCBjcmVhdGVOYW1lc3BhY2UgYXMgbWFrZU5hbWVzcGFjZSwgc3VwcG9ydHNBTEx9IGZyb20gXCIuLi8uLi91dGlsc1wiO1xuaW1wb3J0IHtDb3JlQWRkT24sIENvcmVBZGRPblByb3BzfSBmcm9tIFwiLi4vY29yZS1hZGRvblwiO1xuaW1wb3J0IHtlYnNDb2xsZWN0b3JQb2xpY3l9IGZyb20gXCIuL2lhbS1wb2xpY3lcIjtcbmltcG9ydCB7S3ViZXJuZXRlc1ZlcnNpb259IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5cbi8vIENhbiBiZSBlYXNpbHkgcmV0cml2ZWQgZnJvbSB0aGUgYXdzIGNsaSB3aXRoOlxuLy8gYXdzIGVrcyBkZXNjcmliZS1hZGRvbi12ZXJzaW9ucyAtLWt1YmVybmV0ZXMtdmVyc2lvbiA8a3ViZXJuZXRlcy12ZXJzaW9uPiAtLWFkZG9uLW5hbWUgYW1hem9uLWNsb3Vkd2F0Y2gtb2JzZXJ2YWJpbGl0eSBcXFxuLy8gICAgIC0tcXVlcnkgJ2FkZG9uc1tdLmFkZG9uVmVyc2lvbnNbXS57VmVyc2lvbjogYWRkb25WZXJzaW9uLCBEZWZhdWx0dmVyc2lvbjogY29tcGF0aWJpbGl0aWVzWzBdLmRlZmF1bHRWZXJzaW9ufScgLS1vdXRwdXQgdGFibGVcbmNvbnN0IHZlcnNpb25NYXA6IE1hcDxLdWJlcm5ldGVzVmVyc2lvbiwgc3RyaW5nPiA9IG5ldyBNYXAoW1xuICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMzAsIFwidjEuNy4wLWVrc2J1aWxkLjFcIl0sXG4gIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yOSwgXCJ2MS43LjAtZWtzYnVpbGQuMVwiXSxcbiAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI4LCBcInYxLjcuMC1la3NidWlsZC4xXCJdLFxuICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjcsIFwidjEuNy4wLWVrc2J1aWxkLjFcIl0sXG4gIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNiwgXCJ2MS43LjAtZWtzYnVpbGQuMVwiXSxcbl0pO1xuXG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBvcHRpb25zIGZvciBBV1MgQ29udGFpbmVyIEluc2lnaHRzIGFkZC1vbi5cbiAqL1xuZXhwb3J0IHR5cGUgQ2xvdWRXYXRjaEluc2lnaHRzQWRkT25Qcm9wcyA9IE9taXQ8Q29yZUFkZE9uUHJvcHMsIFwic2FOYW1lXCIgfCBcImFkZE9uTmFtZVwiIHwgXCJ2ZXJzaW9uXCI+ICYge1xuICAvKipcbiAgICogR2l2ZXMgQ2xvdWRXYXRjaCBhZ2VudCBhY2Nlc3MgdG8gRUJTIHBlcmZvcm1hbmNlIHN5c3RlbXMgYnkgYWRkaW5nIGFuIElBTSByb2xlIGFzIGRlZmluZWQgaGVyZTpcbiAgICogaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL0FtYXpvbkNsb3VkV2F0Y2gvbGF0ZXN0L21vbml0b3JpbmcvaW5zdGFsbC1DbG91ZFdhdGNoLU9ic2VydmFiaWxpdHktRUtTLWFkZG9uLmh0bWwjaW5zdGFsbC1DbG91ZFdhdGNoLU9ic2VydmFiaWxpdHktRUtTLWFkZG9uLWNvbmZpZ3VyYXRpb25cbiAgICovXG4gIGVic1BlcmZvcm1hbmNlTG9ncz86IGJvb2xlYW4sXG4gIC8qKlxuICAgKiBDdXN0b20gQ2xvdWRXYXRjaCBBZ2VudCBjb25maWd1cmF0aW9uLCBzcGVjaWZpY3MgY2FuIGJlIGZvdW5kIGhlcmU6XG4gICAqIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9BbWF6b25DbG91ZFdhdGNoL2xhdGVzdC9tb25pdG9yaW5nL2luc3RhbGwtQ2xvdWRXYXRjaC1PYnNlcnZhYmlsaXR5LUVLUy1hZGRvbi5odG1sI2luc3RhbGwtQ2xvdWRXYXRjaC1PYnNlcnZhYmlsaXR5LUVLUy1hZGRvbi1jb25maWd1cmF0aW9uXG4gICAqL1xuICBjdXN0b21DbG91ZFdhdGNoQWdlbnRDb25maWc/OiBWYWx1ZXMsXG5cbiAgLyoqXG4gICAqIERlZmluZSB0aGUgQ2xvdWRXYXRjaCBBZ2VudCBjb25maWd1cmF0aW9uXG4gICAqL1xuICB2ZXJzaW9uPzogc3RyaW5nLFxufTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICBhZGRPbk5hbWU6IFwiYW1hem9uLWNsb3Vkd2F0Y2gtb2JzZXJ2YWJpbGl0eVwiLFxuICB2ZXJzaW9uOiBcImF1dG9cIixcbiAgdmVyc2lvbk1hcDogdmVyc2lvbk1hcCxcbiAgc2FOYW1lOiBcImNsb3Vkd2F0Y2gtYWdlbnRcIixcbiAgbmFtZXNwYWNlOiBcImFtYXpvbi1jbG91ZHdhdGNoXCJcbn07XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgQVdTIENsb3VkV2F0Y2ggSW5zaWdodHMgQWRkb25cbiAqL1xuQHN1cHBvcnRzQUxMXG5leHBvcnQgY2xhc3MgQ2xvdWRXYXRjaEluc2lnaHRzIGV4dGVuZHMgQ29yZUFkZE9uIHtcblxuICByZWFkb25seSBvcHRpb25zOiBDbG91ZFdhdGNoSW5zaWdodHNBZGRPblByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzPzogQ2xvdWRXYXRjaEluc2lnaHRzQWRkT25Qcm9wcykge1xuICAgIHN1cGVyKHtcbiAgICAgIGFkZE9uTmFtZTogZGVmYXVsdFByb3BzLmFkZE9uTmFtZSxcbiAgICAgIHZlcnNpb246IHByb3BzPy52ZXJzaW9uID8/IGRlZmF1bHRQcm9wcy52ZXJzaW9uLFxuICAgICAgdmVyc2lvbk1hcDogZGVmYXVsdFByb3BzLnZlcnNpb25NYXAsXG4gICAgICBzYU5hbWU6IGRlZmF1bHRQcm9wcy5zYU5hbWUsXG4gICAgICBuYW1lc3BhY2U6IGRlZmF1bHRQcm9wcy5uYW1lc3BhY2UsXG4gICAgICBjb25maWd1cmF0aW9uVmFsdWVzOiBwcm9wcz8uY3VzdG9tQ2xvdWRXYXRjaEFnZW50Q29uZmlnID8/IHt9LFxuICAgICAgY29udHJvbFBsYW5lQWRkT246IGZhbHNlXG4gICAgfSk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBwcm9wcyA/PyB7fTtcbiAgfVxuXG4gIEBjb25mbGljdHNXaXRoKFwiQWRvdENvbGxlY3RvckFkZG9uXCIsIFwiQ2xvdWRXYXRjaEFkb3RBZGRvblwiLCBcIkNsb3VkV2F0Y2hMb2dzQWRkb25cIilcbiAgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFByb21pc2U8Q29uc3RydWN0PiB7XG4gICAgcmV0dXJuIHN1cGVyLmRlcGxveShjbHVzdGVySW5mbyk7XG4gIH1cblxuICBjcmVhdGVOYW1lc3BhY2UoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvLCBuYW1lc3BhY2VOYW1lOiBzdHJpbmcpOiBJQ29uc3RydWN0IHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gbWFrZU5hbWVzcGFjZShuYW1lc3BhY2VOYW1lLCBjbHVzdGVySW5mby5jbHVzdGVyKTtcbiAgfVxuXG4gIHByb3ZpZGVNYW5hZ2VkUG9saWNpZXMoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogSU1hbmFnZWRQb2xpY3lbXSB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgcmVxdWlyZWRQb2xpY2llcyA9IFtcbiAgICAgIE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQ2xvdWRXYXRjaEFnZW50U2VydmVyUG9saWN5XCIpLFxuICAgICAgTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBV1NYcmF5V3JpdGVPbmx5QWNjZXNzXCIpXG4gICAgXTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZWJzUGVyZm9ybWFuY2VMb2dzICE9IHVuZGVmaW5lZCAmJiB0aGlzLm9wdGlvbnMuZWJzUGVyZm9ybWFuY2VMb2dzKSB7XG4gICAgICBjb25zdCBlYnNQb2xpY3kgPSBuZXcgTWFuYWdlZFBvbGljeShjbHVzdGVySW5mby5jbHVzdGVyLCAnY2xvdWR3YXRjaC1hZ2VudC1tYW5nYWVkLXBvbGljeScsIHtcbiAgICAgICAgZG9jdW1lbnQ6IGVic0NvbGxlY3RvclBvbGljeSgpXG4gICAgICB9KTtcbiAgICAgIHJlcXVpcmVkUG9saWNpZXMucHVzaChlYnNQb2xpY3kpO1xuICAgIH1cblxuICAgIHJldHVybiByZXF1aXJlZFBvbGljaWVzO1xuICB9XG59XG4iXX0=