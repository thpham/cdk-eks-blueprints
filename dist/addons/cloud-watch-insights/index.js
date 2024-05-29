"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudWatchInsights = void 0;
const iam = require("aws-cdk-lib/aws-iam");
const utils_1 = require("../../utils");
const core_addon_1 = require("../core-addon");
const iam_policy_1 = require("./iam-policy");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const versionMap = new Map([
    [aws_eks_1.KubernetesVersion.V1_29, "v1.3.1-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_28, "v1.3.1-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_27, "v1.3.1-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_26, "v1.3.1-eksbuild.1"],
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
    createServiceAccount(clusterInfo, saNamespace, _policies) {
        const sa = clusterInfo.cluster.addServiceAccount('CloudWatchInsightsSA', {
            name: defaultProps.saName,
            namespace: saNamespace
        });
        sa.role.addManagedPolicy(aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'));
        sa.role.addManagedPolicy(aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AWSXrayWriteOnlyAccess'));
        if (this.options.ebsPerformanceLogs != undefined && this.options.ebsPerformanceLogs) {
            sa.role.attachInlinePolicy(new iam.Policy(clusterInfo.cluster.stack, "EbsPerformanceLogsPolicy", {
                document: (0, iam_policy_1.ebsCollectorPolicy)()
            }));
        }
        return sa;
    }
};
exports.CloudWatchInsights = CloudWatchInsights;
__decorate([
    (0, utils_1.conflictsWith)("AdotCollectorAddon", "CloudWatchAdotAddon", "CloudWatchLogsAddon")
], CloudWatchInsights.prototype, "deploy", null);
exports.CloudWatchInsights = CloudWatchInsights = __decorate([
    utils_1.supportsALL
], CloudWatchInsights);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2Nsb3VkLXdhdGNoLWluc2lnaHRzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLDJDQUEyQztBQUUzQyx1Q0FBdUQ7QUFDdkQsOENBQXdEO0FBQ3hELDZDQUFnRDtBQUNoRCxpREFBa0U7QUFDbEUsaURBQXNFO0FBRXRFLE1BQU0sVUFBVSxHQUFtQyxJQUFJLEdBQUcsQ0FBQztJQUN6RCxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQztJQUM5QyxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQztJQUM5QyxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQztJQUM5QyxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQztDQUMvQyxDQUFDLENBQUM7QUF3QkgsTUFBTSxZQUFZLEdBQUc7SUFDbkIsU0FBUyxFQUFFLGlDQUFpQztJQUM1QyxPQUFPLEVBQUUsTUFBTTtJQUNmLFVBQVUsRUFBRSxVQUFVO0lBQ3RCLE1BQU0sRUFBRSxrQkFBa0I7SUFDMUIsU0FBUyxFQUFFLG1CQUFtQjtDQUMvQixDQUFDO0FBRUY7O0dBRUc7QUFFSSxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLHNCQUFTO0lBSTdDLFlBQVksS0FBb0M7O1FBQzlDLEtBQUssQ0FBQztZQUNKLFNBQVMsRUFBRSxZQUFZLENBQUMsU0FBUztZQUNqQyxPQUFPLEVBQUUsTUFBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsT0FBTyxtQ0FBSSxZQUFZLENBQUMsT0FBTztZQUMvQyxVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVU7WUFDbkMsTUFBTSxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQzNCLFNBQVMsRUFBRSxZQUFZLENBQUMsU0FBUztZQUNqQyxtQkFBbUIsRUFBRSxNQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSwyQkFBMkIsbUNBQUksRUFBRTtZQUM3RCxpQkFBaUIsRUFBRSxLQUFLO1NBQ3pCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxhQUFMLEtBQUssY0FBTCxLQUFLLEdBQUksRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFHRCxNQUFNLENBQUMsV0FBd0I7UUFDN0IsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxXQUF3QixFQUFFLFdBQW1CLEVBQUUsU0FBMkI7UUFDN0YsTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxzQkFBc0IsRUFBRTtZQUN2RSxJQUFJLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDekIsU0FBUyxFQUFFLFdBQVc7U0FDdkIsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyx1QkFBYSxDQUFDLHdCQUF3QixDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQztRQUNoRyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHVCQUFhLENBQUMsd0JBQXdCLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1FBRTNGLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ3BGLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQ3hCLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSwwQkFBMEIsRUFBRTtnQkFDcEUsUUFBUSxFQUFFLElBQUEsK0JBQWtCLEdBQUU7YUFDL0IsQ0FBQyxDQUNILENBQUM7UUFDSixDQUFDO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0NBQ0osQ0FBQTtBQTFDWSxnREFBa0I7QUFtQjNCO0lBREMsSUFBQSxxQkFBYSxFQUFDLG9CQUFvQixFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixDQUFDO2dEQUdqRjs2QkFyQlEsa0JBQWtCO0lBRDlCLG1CQUFXO0dBQ0Msa0JBQWtCLENBMEM5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29uc3RydWN0fSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0IHtDbHVzdGVySW5mbywgVmFsdWVzfSBmcm9tIFwiLi4vLi4vc3BpXCI7XG5pbXBvcnQge2NvbmZsaWN0c1dpdGgsIHN1cHBvcnRzQUxMfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcbmltcG9ydCB7Q29yZUFkZE9uLCBDb3JlQWRkT25Qcm9wc30gZnJvbSBcIi4uL2NvcmUtYWRkb25cIjtcbmltcG9ydCB7ZWJzQ29sbGVjdG9yUG9saWN5fSBmcm9tIFwiLi9pYW0tcG9saWN5XCI7XG5pbXBvcnQge0lNYW5hZ2VkUG9saWN5LCBNYW5hZ2VkUG9saWN5fSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0IHtLdWJlcm5ldGVzVmVyc2lvbiwgU2VydmljZUFjY291bnR9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5cbmNvbnN0IHZlcnNpb25NYXA6IE1hcDxLdWJlcm5ldGVzVmVyc2lvbiwgc3RyaW5nPiA9IG5ldyBNYXAoW1xuICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjksIFwidjEuMy4xLWVrc2J1aWxkLjFcIl0sXG4gIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yOCwgXCJ2MS4zLjEtZWtzYnVpbGQuMVwiXSxcbiAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI3LCBcInYxLjMuMS1la3NidWlsZC4xXCJdLFxuICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjYsIFwidjEuMy4xLWVrc2J1aWxkLjFcIl0sXG5dKTtcblxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgQVdTIENvbnRhaW5lciBJbnNpZ2h0cyBhZGQtb24uXG4gKi9cbmV4cG9ydCB0eXBlIENsb3VkV2F0Y2hJbnNpZ2h0c0FkZE9uUHJvcHMgPSBPbWl0PENvcmVBZGRPblByb3BzLCBcInNhTmFtZVwiIHwgXCJhZGRPbk5hbWVcIiB8IFwidmVyc2lvblwiPiAmIHtcbiAgLyoqXG4gICAqIEdpdmVzIENsb3VkV2F0Y2ggYWdlbnQgYWNjZXNzIHRvIEVCUyBwZXJmb3JtYW5jZSBzeXN0ZW1zIGJ5IGFkZGluZyBhbiBJQU0gcm9sZSBhcyBkZWZpbmVkIGhlcmU6XG4gICAqIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9BbWF6b25DbG91ZFdhdGNoL2xhdGVzdC9tb25pdG9yaW5nL2luc3RhbGwtQ2xvdWRXYXRjaC1PYnNlcnZhYmlsaXR5LUVLUy1hZGRvbi5odG1sI2luc3RhbGwtQ2xvdWRXYXRjaC1PYnNlcnZhYmlsaXR5LUVLUy1hZGRvbi1jb25maWd1cmF0aW9uXG4gICAqL1xuICBlYnNQZXJmb3JtYW5jZUxvZ3M/OiBib29sZWFuLFxuICAvKipcbiAgICogQ3VzdG9tIENsb3VkV2F0Y2ggQWdlbnQgY29uZmlndXJhdGlvbiwgc3BlY2lmaWNzIGNhbiBiZSBmb3VuZCBoZXJlOlxuICAgKiBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vQW1hem9uQ2xvdWRXYXRjaC9sYXRlc3QvbW9uaXRvcmluZy9pbnN0YWxsLUNsb3VkV2F0Y2gtT2JzZXJ2YWJpbGl0eS1FS1MtYWRkb24uaHRtbCNpbnN0YWxsLUNsb3VkV2F0Y2gtT2JzZXJ2YWJpbGl0eS1FS1MtYWRkb24tY29uZmlndXJhdGlvblxuICAgKi9cbiAgY3VzdG9tQ2xvdWRXYXRjaEFnZW50Q29uZmlnPzogVmFsdWVzLFxuXG4gIC8qKlxuICAgKiBEZWZpbmUgdGhlIENsb3VkV2F0Y2ggQWdlbnQgY29uZmlndXJhdGlvblxuICAgKi9cbiAgdmVyc2lvbj86IHN0cmluZyxcbn07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgYWRkT25OYW1lOiBcImFtYXpvbi1jbG91ZHdhdGNoLW9ic2VydmFiaWxpdHlcIixcbiAgdmVyc2lvbjogXCJhdXRvXCIsXG4gIHZlcnNpb25NYXA6IHZlcnNpb25NYXAsXG4gIHNhTmFtZTogXCJjbG91ZHdhdGNoLWFnZW50XCIsXG4gIG5hbWVzcGFjZTogXCJhbWF6b24tY2xvdWR3YXRjaFwiXG59O1xuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIEFXUyBDbG91ZFdhdGNoIEluc2lnaHRzIEFkZG9uXG4gKi9cbkBzdXBwb3J0c0FMTFxuZXhwb3J0IGNsYXNzIENsb3VkV2F0Y2hJbnNpZ2h0cyBleHRlbmRzIENvcmVBZGRPbiB7XG5cbiAgcmVhZG9ubHkgb3B0aW9uczogQ2xvdWRXYXRjaEluc2lnaHRzQWRkT25Qcm9wcztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogQ2xvdWRXYXRjaEluc2lnaHRzQWRkT25Qcm9wcykge1xuICAgICAgc3VwZXIoe1xuICAgICAgICBhZGRPbk5hbWU6IGRlZmF1bHRQcm9wcy5hZGRPbk5hbWUsXG4gICAgICAgIHZlcnNpb246IHByb3BzPy52ZXJzaW9uID8/IGRlZmF1bHRQcm9wcy52ZXJzaW9uLFxuICAgICAgICB2ZXJzaW9uTWFwOiBkZWZhdWx0UHJvcHMudmVyc2lvbk1hcCxcbiAgICAgICAgc2FOYW1lOiBkZWZhdWx0UHJvcHMuc2FOYW1lLFxuICAgICAgICBuYW1lc3BhY2U6IGRlZmF1bHRQcm9wcy5uYW1lc3BhY2UsXG4gICAgICAgIGNvbmZpZ3VyYXRpb25WYWx1ZXM6IHByb3BzPy5jdXN0b21DbG91ZFdhdGNoQWdlbnRDb25maWcgPz8ge30sXG4gICAgICAgIGNvbnRyb2xQbGFuZUFkZE9uOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMub3B0aW9ucyA9IHByb3BzID8/IHt9O1xuICAgIH1cblxuICAgIEBjb25mbGljdHNXaXRoKFwiQWRvdENvbGxlY3RvckFkZG9uXCIsIFwiQ2xvdWRXYXRjaEFkb3RBZGRvblwiLCBcIkNsb3VkV2F0Y2hMb2dzQWRkb25cIilcbiAgICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogUHJvbWlzZTxDb25zdHJ1Y3Q+IHtcbiAgICAgIHJldHVybiBzdXBlci5kZXBsb3koY2x1c3RlckluZm8pO1xuICAgIH1cblxuICAgIGNyZWF0ZVNlcnZpY2VBY2NvdW50KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbywgc2FOYW1lc3BhY2U6IHN0cmluZywgX3BvbGljaWVzOiBJTWFuYWdlZFBvbGljeVtdKTogU2VydmljZUFjY291bnQge1xuICAgICAgY29uc3Qgc2EgPSBjbHVzdGVySW5mby5jbHVzdGVyLmFkZFNlcnZpY2VBY2NvdW50KCdDbG91ZFdhdGNoSW5zaWdodHNTQScsIHtcbiAgICAgICAgbmFtZTogZGVmYXVsdFByb3BzLnNhTmFtZSxcbiAgICAgICAgbmFtZXNwYWNlOiBzYU5hbWVzcGFjZVxuICAgICAgfSk7XG5cbiAgICAgIHNhLnJvbGUuYWRkTWFuYWdlZFBvbGljeShNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQ2xvdWRXYXRjaEFnZW50U2VydmVyUG9saWN5JykpO1xuICAgICAgc2Eucm9sZS5hZGRNYW5hZ2VkUG9saWN5KE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBV1NYcmF5V3JpdGVPbmx5QWNjZXNzJykpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmVic1BlcmZvcm1hbmNlTG9ncyAhPSB1bmRlZmluZWQgJiYgdGhpcy5vcHRpb25zLmVic1BlcmZvcm1hbmNlTG9ncykge1xuICAgICAgICBzYS5yb2xlLmF0dGFjaElubGluZVBvbGljeShcbiAgICAgICAgICBuZXcgaWFtLlBvbGljeShjbHVzdGVySW5mby5jbHVzdGVyLnN0YWNrLCBcIkVic1BlcmZvcm1hbmNlTG9nc1BvbGljeVwiLCB7XG4gICAgICAgICAgICBkb2N1bWVudDogZWJzQ29sbGVjdG9yUG9saWN5KClcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2E7XG4gICAgfVxufVxuIl19