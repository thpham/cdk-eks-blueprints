"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreDnsAddOn = void 0;
const utils_1 = require("../../utils");
const core_addon_1 = require("../core-addon");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_eks_2 = require("aws-cdk-lib/aws-eks");
const versionMap = new Map([
    [aws_eks_2.KubernetesVersion.V1_29, "v1.11.1-eksbuild.4"],
    [aws_eks_2.KubernetesVersion.V1_28, "v1.10.1-eksbuild.4"],
    [aws_eks_2.KubernetesVersion.V1_27, "v1.10.1-eksbuild.4"],
    [aws_eks_2.KubernetesVersion.V1_26, "v1.9.3-eksbuild.7"],
]);
const defaultProps = {
    addOnName: 'coredns',
    versionMap: versionMap,
    saName: 'coredns',
    configurationValues: {}
};
/**
 * Implementation of CoreDns EKS add-on.
 */
let CoreDnsAddOn = class CoreDnsAddOn extends core_addon_1.CoreAddOn {
    constructor(version, props) {
        super({
            version: version !== null && version !== void 0 ? version : "auto",
            ...defaultProps,
            ...props
        });
    }
    deploy(clusterInfo) {
        const addonPromise = super.deploy(clusterInfo);
        if (clusterInfo.cluster instanceof aws_eks_1.FargateCluster) {
            this.handleFargatePatch(addonPromise);
        }
        return addonPromise;
    }
    /**
     *  Retain the addon otherwise cluster destroy will fail due to CoreDnsComputeTypePatch
     *  https://github.com/aws/aws-cdk/issues/28621
     */
    handleFargatePatch(addonPromise) {
        addonPromise.then(addon => {
            if (addon instanceof aws_eks_1.CfnAddon) {
                addon.applyRemovalPolicy(aws_cdk_lib_1.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE);
            }
        });
    }
};
exports.CoreDnsAddOn = CoreDnsAddOn;
exports.CoreDnsAddOn = CoreDnsAddOn = __decorate([
    utils_1.supportsALL
], CoreDnsAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2NvcmVkbnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBRUEsdUNBQXlDO0FBQ3pDLDhDQUEwRDtBQUMxRCxpREFBK0Q7QUFDL0QsNkNBQTRDO0FBQzVDLGlEQUF3RDtBQUN4RCxNQUFNLFVBQVUsR0FBbUMsSUFBSSxHQUFHLENBQUM7SUFDdkQsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUM7SUFDL0MsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUM7SUFDL0MsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUM7SUFDL0MsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUM7Q0FDakQsQ0FBQyxDQUFDO0FBUUgsTUFBTSxZQUFZLEdBQUc7SUFDakIsU0FBUyxFQUFFLFNBQVM7SUFDcEIsVUFBVSxFQUFFLFVBQVU7SUFDdEIsTUFBTSxFQUFFLFNBQVM7SUFDakIsbUJBQW1CLEVBQUUsRUFBRTtDQUMxQixDQUFDO0FBRUY7O0dBRUc7QUFFSSxJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsc0JBQVM7SUFFdkMsWUFBWSxPQUFnQixFQUFFLEtBQXlCO1FBQ25ELEtBQUssQ0FBQztZQUNGLE9BQU8sRUFBRSxPQUFPLGFBQVAsT0FBTyxjQUFQLE9BQU8sR0FBSSxNQUFNO1lBQzFCLEdBQUksWUFBWTtZQUNoQixHQUFJLEtBQUs7U0FDWixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQXdCO1FBRTNCLE1BQU0sWUFBWSxHQUF1QixLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRW5FLElBQUcsV0FBVyxDQUFDLE9BQU8sWUFBWSx3QkFBYyxFQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFDRCxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsa0JBQWtCLENBQUUsWUFBZ0M7UUFDaEQsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0QixJQUFHLEtBQUssWUFBWSxrQkFBUSxFQUFDLENBQUM7Z0JBQzFCLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywyQkFBYSxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDdkUsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUE7QUEvQlksb0NBQVk7dUJBQVosWUFBWTtJQUR4QixtQkFBVztHQUNDLFlBQVksQ0ErQnhCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IENsdXN0ZXJJbmZvIH0gZnJvbSBcIi4uLy4uL3NwaVwiO1xuaW1wb3J0IHtzdXBwb3J0c0FMTCB9IGZyb20gXCIuLi8uLi91dGlsc1wiO1xuaW1wb3J0IHsgQ29yZUFkZE9uLCBDb3JlQWRkT25Qcm9wcyB9IGZyb20gXCIuLi9jb3JlLWFkZG9uXCI7XG5pbXBvcnQgeyBDZm5BZGRvbiwgRmFyZ2F0ZUNsdXN0ZXIgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xuaW1wb3J0IHsgUmVtb3ZhbFBvbGljeSB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHsgS3ViZXJuZXRlc1ZlcnNpb24gfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xuY29uc3QgdmVyc2lvbk1hcDogTWFwPEt1YmVybmV0ZXNWZXJzaW9uLCBzdHJpbmc+ID0gbmV3IE1hcChbXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI5LCBcInYxLjExLjEtZWtzYnVpbGQuNFwiXSxcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjgsIFwidjEuMTAuMS1la3NidWlsZC40XCJdLFxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNywgXCJ2MS4xMC4xLWVrc2J1aWxkLjRcIl0sXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI2LCBcInYxLjkuMy1la3NidWlsZC43XCJdLFxuXSk7XG5cblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBjb3JlZG5zIGFkZC1vbi5cbiAqL1xuZXhwb3J0IHR5cGUgQ29yZURuc0FkZE9uUHJvcHMgPSBPbWl0PENvcmVBZGRPblByb3BzLCBcInNhTmFtZVwiIHwgXCJhZGRPbk5hbWVcIiB8IFwidmVyc2lvblwiID47XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgICBhZGRPbk5hbWU6ICdjb3JlZG5zJyxcbiAgICB2ZXJzaW9uTWFwOiB2ZXJzaW9uTWFwLFxuICAgIHNhTmFtZTogJ2NvcmVkbnMnLFxuICAgIGNvbmZpZ3VyYXRpb25WYWx1ZXM6IHt9XG59O1xuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIENvcmVEbnMgRUtTIGFkZC1vbi5cbiAqL1xuQHN1cHBvcnRzQUxMXG5leHBvcnQgY2xhc3MgQ29yZURuc0FkZE9uIGV4dGVuZHMgQ29yZUFkZE9uIHtcblxuICAgIGNvbnN0cnVjdG9yKHZlcnNpb24/OiBzdHJpbmcsIHByb3BzPzogQ29yZURuc0FkZE9uUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgdmVyc2lvbjogdmVyc2lvbiA/PyBcImF1dG9cIixcbiAgICAgICAgICAgIC4uLiBkZWZhdWx0UHJvcHMsXG4gICAgICAgICAgICAuLi4gcHJvcHNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFByb21pc2U8Q29uc3RydWN0PiB7XG5cbiAgICAgICAgY29uc3QgYWRkb25Qcm9taXNlOiBQcm9taXNlPENvbnN0cnVjdD4gPSBzdXBlci5kZXBsb3koY2x1c3RlckluZm8pO1xuXG4gICAgICAgIGlmKGNsdXN0ZXJJbmZvLmNsdXN0ZXIgaW5zdGFuY2VvZiBGYXJnYXRlQ2x1c3Rlcil7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUZhcmdhdGVQYXRjaChhZGRvblByb21pc2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhZGRvblByb21pc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIFJldGFpbiB0aGUgYWRkb24gb3RoZXJ3aXNlIGNsdXN0ZXIgZGVzdHJveSB3aWxsIGZhaWwgZHVlIHRvIENvcmVEbnNDb21wdXRlVHlwZVBhdGNoIFxuICAgICAqICBodHRwczovL2dpdGh1Yi5jb20vYXdzL2F3cy1jZGsvaXNzdWVzLzI4NjIxXG4gICAgICovIFxuICAgIGhhbmRsZUZhcmdhdGVQYXRjaCggYWRkb25Qcm9taXNlOiBQcm9taXNlPENvbnN0cnVjdD4gKXtcbiAgICAgICAgYWRkb25Qcm9taXNlLnRoZW4oYWRkb24gPT4ge1xuICAgICAgICAgICAgaWYoYWRkb24gaW5zdGFuY2VvZiBDZm5BZGRvbil7XG4gICAgICAgICAgICAgICAgYWRkb24uYXBwbHlSZW1vdmFsUG9saWN5KFJlbW92YWxQb2xpY3kuUkVUQUlOX09OX1VQREFURV9PUl9ERUxFVEUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9ICAgXG59XG4iXX0=