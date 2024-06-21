"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KubeProxyAddOn = void 0;
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const core_addon_1 = require("../core-addon");
const utils_1 = require("../../utils");
const versionMap = new Map([
    [aws_eks_1.KubernetesVersion.V1_29, "v1.29.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_28, "v1.28.2-eksbuild.2"],
    [aws_eks_1.KubernetesVersion.V1_27, "v1.27.6-eksbuild.2"],
    [aws_eks_1.KubernetesVersion.V1_26, "v1.26.9-eksbuild.2"],
]);
const defaultProps = {
    addOnName: "kube-proxy",
    saName: "kube-proxy",
    versionMap: versionMap,
};
/**
 * Implementation of KubeProxy EKS add-on.
 */
let KubeProxyAddOn = class KubeProxyAddOn extends core_addon_1.CoreAddOn {
    constructor(version, props) {
        super({
            version: version !== null && version !== void 0 ? version : "auto",
            ...defaultProps,
            ...props
        });
    }
};
exports.KubeProxyAddOn = KubeProxyAddOn;
exports.KubeProxyAddOn = KubeProxyAddOn = __decorate([
    utils_1.supportsALL
], KubeProxyAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2t1YmUtcHJveHkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsaURBQXdEO0FBQ3hELDhDQUEwRDtBQUMxRCx1Q0FBMEM7QUFFMUMsTUFBTSxVQUFVLEdBQW1DLElBQUksR0FBRyxDQUFDO0lBQ3ZELENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0NBQ2xELENBQUMsQ0FBQztBQU9ILE1BQU0sWUFBWSxHQUFHO0lBQ2pCLFNBQVMsRUFBRSxZQUFZO0lBQ3ZCLE1BQU0sRUFBRSxZQUFZO0lBQ3BCLFVBQVUsRUFBRSxVQUFVO0NBQ3pCLENBQUM7QUFFRjs7R0FFRztBQUVJLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxzQkFBUztJQUV6QyxZQUFZLE9BQWdCLEVBQUUsS0FBMkI7UUFDckQsS0FBSyxDQUFDO1lBQ0YsT0FBTyxFQUFFLE9BQU8sYUFBUCxPQUFPLGNBQVAsT0FBTyxHQUFJLE1BQU07WUFDMUIsR0FBSSxZQUFZO1lBQ2hCLEdBQUksS0FBSztTQUNaLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBVFksd0NBQWM7eUJBQWQsY0FBYztJQUQxQixtQkFBVztHQUNDLGNBQWMsQ0FTMUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBLdWJlcm5ldGVzVmVyc2lvbiB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5pbXBvcnQgeyBDb3JlQWRkT24sIENvcmVBZGRPblByb3BzIH0gZnJvbSBcIi4uL2NvcmUtYWRkb25cIjtcbmltcG9ydCB7IHN1cHBvcnRzQUxMIH0gZnJvbSBcIi4uLy4uL3V0aWxzXCI7XG5cbmNvbnN0IHZlcnNpb25NYXA6IE1hcDxLdWJlcm5ldGVzVmVyc2lvbiwgc3RyaW5nPiA9IG5ldyBNYXAoW1xuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yOSwgXCJ2MS4yOS4wLWVrc2J1aWxkLjFcIl0sXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI4LCBcInYxLjI4LjItZWtzYnVpbGQuMlwiXSxcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjcsIFwidjEuMjcuNi1la3NidWlsZC4yXCJdLFxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNiwgXCJ2MS4yNi45LWVrc2J1aWxkLjJcIl0sXG5dKTtcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBjb3JlZG5zIGFkZC1vbi5cbiAqL1xuZXhwb3J0IHR5cGUga3ViZVByb3h5QWRkT25Qcm9wcyA9IE9taXQ8Q29yZUFkZE9uUHJvcHMsIFwic2FOYW1lXCIgfCBcImFkZE9uTmFtZVwiIHwgXCJ2ZXJzaW9uXCIgPjtcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICAgIGFkZE9uTmFtZTogXCJrdWJlLXByb3h5XCIsXG4gICAgc2FOYW1lOiBcImt1YmUtcHJveHlcIixcbiAgICB2ZXJzaW9uTWFwOiB2ZXJzaW9uTWFwLFxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBLdWJlUHJveHkgRUtTIGFkZC1vbi5cbiAqL1xuQHN1cHBvcnRzQUxMXG5leHBvcnQgY2xhc3MgS3ViZVByb3h5QWRkT24gZXh0ZW5kcyBDb3JlQWRkT24ge1xuXG4gICAgY29uc3RydWN0b3IodmVyc2lvbj86IHN0cmluZywgcHJvcHM/OiBrdWJlUHJveHlBZGRPblByb3BzKSB7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIHZlcnNpb246IHZlcnNpb24gPz8gXCJhdXRvXCIsXG4gICAgICAgICAgICAuLi4gZGVmYXVsdFByb3BzLFxuICAgICAgICAgICAgLi4uIHByb3BzXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==