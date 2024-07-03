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
    [aws_eks_2.KubernetesVersion.V1_30, "v1.11.1-eksbuild.8"],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2NvcmVkbnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBRUEsdUNBQXlDO0FBQ3pDLDhDQUEwRDtBQUMxRCxpREFBK0Q7QUFDL0QsNkNBQTRDO0FBQzVDLGlEQUF3RDtBQUN4RCxNQUFNLFVBQVUsR0FBbUMsSUFBSSxHQUFHLENBQUM7SUFDdkQsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUM7SUFDL0MsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUM7SUFDL0MsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUM7SUFDL0MsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUM7SUFDL0MsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUM7Q0FDakQsQ0FBQyxDQUFDO0FBUUgsTUFBTSxZQUFZLEdBQUc7SUFDakIsU0FBUyxFQUFFLFNBQVM7SUFDcEIsVUFBVSxFQUFFLFVBQVU7SUFDdEIsTUFBTSxFQUFFLFNBQVM7SUFDakIsbUJBQW1CLEVBQUUsRUFBRTtDQUMxQixDQUFDO0FBRUY7O0dBRUc7QUFFSSxJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsc0JBQVM7SUFFdkMsWUFBWSxPQUFnQixFQUFFLEtBQXlCO1FBQ25ELEtBQUssQ0FBQztZQUNGLE9BQU8sRUFBRSxPQUFPLGFBQVAsT0FBTyxjQUFQLE9BQU8sR0FBSSxNQUFNO1lBQzFCLEdBQUksWUFBWTtZQUNoQixHQUFJLEtBQUs7U0FDWixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQXdCO1FBRTNCLE1BQU0sWUFBWSxHQUF1QixLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRW5FLElBQUcsV0FBVyxDQUFDLE9BQU8sWUFBWSx3QkFBYyxFQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFDRCxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsa0JBQWtCLENBQUUsWUFBZ0M7UUFDaEQsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN0QixJQUFHLEtBQUssWUFBWSxrQkFBUSxFQUFDLENBQUM7Z0JBQzFCLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywyQkFBYSxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDdkUsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKLENBQUE7QUEvQlksb0NBQVk7dUJBQVosWUFBWTtJQUR4QixtQkFBVztHQUNDLFlBQVksQ0ErQnhCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IENsdXN0ZXJJbmZvIH0gZnJvbSBcIi4uLy4uL3NwaVwiO1xuaW1wb3J0IHtzdXBwb3J0c0FMTCB9IGZyb20gXCIuLi8uLi91dGlsc1wiO1xuaW1wb3J0IHsgQ29yZUFkZE9uLCBDb3JlQWRkT25Qcm9wcyB9IGZyb20gXCIuLi9jb3JlLWFkZG9uXCI7XG5pbXBvcnQgeyBDZm5BZGRvbiwgRmFyZ2F0ZUNsdXN0ZXIgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xuaW1wb3J0IHsgUmVtb3ZhbFBvbGljeSB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHsgS3ViZXJuZXRlc1ZlcnNpb24gfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xuY29uc3QgdmVyc2lvbk1hcDogTWFwPEt1YmVybmV0ZXNWZXJzaW9uLCBzdHJpbmc+ID0gbmV3IE1hcChbXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzMwLCBcInYxLjExLjEtZWtzYnVpbGQuOFwiXSxcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjksIFwidjEuMTEuMS1la3NidWlsZC40XCJdLFxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yOCwgXCJ2MS4xMC4xLWVrc2J1aWxkLjRcIl0sXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI3LCBcInYxLjEwLjEtZWtzYnVpbGQuNFwiXSxcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjYsIFwidjEuOS4zLWVrc2J1aWxkLjdcIl0sXG5dKTtcblxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIGNvcmVkbnMgYWRkLW9uLlxuICovXG5leHBvcnQgdHlwZSBDb3JlRG5zQWRkT25Qcm9wcyA9IE9taXQ8Q29yZUFkZE9uUHJvcHMsIFwic2FOYW1lXCIgfCBcImFkZE9uTmFtZVwiIHwgXCJ2ZXJzaW9uXCIgPjtcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICAgIGFkZE9uTmFtZTogJ2NvcmVkbnMnLFxuICAgIHZlcnNpb25NYXA6IHZlcnNpb25NYXAsXG4gICAgc2FOYW1lOiAnY29yZWRucycsXG4gICAgY29uZmlndXJhdGlvblZhbHVlczoge31cbn07XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgQ29yZURucyBFS1MgYWRkLW9uLlxuICovXG5Ac3VwcG9ydHNBTExcbmV4cG9ydCBjbGFzcyBDb3JlRG5zQWRkT24gZXh0ZW5kcyBDb3JlQWRkT24ge1xuXG4gICAgY29uc3RydWN0b3IodmVyc2lvbj86IHN0cmluZywgcHJvcHM/OiBDb3JlRG5zQWRkT25Qcm9wcykge1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICB2ZXJzaW9uOiB2ZXJzaW9uID8/IFwiYXV0b1wiLFxuICAgICAgICAgICAgLi4uIGRlZmF1bHRQcm9wcyxcbiAgICAgICAgICAgIC4uLiBwcm9wc1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogUHJvbWlzZTxDb25zdHJ1Y3Q+IHtcblxuICAgICAgICBjb25zdCBhZGRvblByb21pc2U6IFByb21pc2U8Q29uc3RydWN0PiA9IHN1cGVyLmRlcGxveShjbHVzdGVySW5mbyk7XG5cbiAgICAgICAgaWYoY2x1c3RlckluZm8uY2x1c3RlciBpbnN0YW5jZW9mIEZhcmdhdGVDbHVzdGVyKXtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlRmFyZ2F0ZVBhdGNoKGFkZG9uUHJvbWlzZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFkZG9uUHJvbWlzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAgUmV0YWluIHRoZSBhZGRvbiBvdGhlcndpc2UgY2x1c3RlciBkZXN0cm95IHdpbGwgZmFpbCBkdWUgdG8gQ29yZURuc0NvbXB1dGVUeXBlUGF0Y2ggXG4gICAgICogIGh0dHBzOi8vZ2l0aHViLmNvbS9hd3MvYXdzLWNkay9pc3N1ZXMvMjg2MjFcbiAgICAgKi8gXG4gICAgaGFuZGxlRmFyZ2F0ZVBhdGNoKCBhZGRvblByb21pc2U6IFByb21pc2U8Q29uc3RydWN0PiApe1xuICAgICAgICBhZGRvblByb21pc2UudGhlbihhZGRvbiA9PiB7XG4gICAgICAgICAgICBpZihhZGRvbiBpbnN0YW5jZW9mIENmbkFkZG9uKXtcbiAgICAgICAgICAgICAgICBhZGRvbi5hcHBseVJlbW92YWxQb2xpY3koUmVtb3ZhbFBvbGljeS5SRVRBSU5fT05fVVBEQVRFX09SX0RFTEVURSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0gICBcbn1cbiJdfQ==