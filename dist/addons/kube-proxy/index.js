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
    [aws_eks_1.KubernetesVersion.V1_30, "v1.30.0-eksbuild.3"],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2t1YmUtcHJveHkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsaURBQXdEO0FBQ3hELDhDQUEwRDtBQUMxRCx1Q0FBMEM7QUFFMUMsTUFBTSxVQUFVLEdBQW1DLElBQUksR0FBRyxDQUFDO0lBQ3ZELENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0NBQ2xELENBQUMsQ0FBQztBQU9ILE1BQU0sWUFBWSxHQUFHO0lBQ2pCLFNBQVMsRUFBRSxZQUFZO0lBQ3ZCLE1BQU0sRUFBRSxZQUFZO0lBQ3BCLFVBQVUsRUFBRSxVQUFVO0NBQ3pCLENBQUM7QUFFRjs7R0FFRztBQUVJLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxzQkFBUztJQUV6QyxZQUFZLE9BQWdCLEVBQUUsS0FBMkI7UUFDckQsS0FBSyxDQUFDO1lBQ0YsT0FBTyxFQUFFLE9BQU8sYUFBUCxPQUFPLGNBQVAsT0FBTyxHQUFJLE1BQU07WUFDMUIsR0FBSSxZQUFZO1lBQ2hCLEdBQUksS0FBSztTQUNaLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFBO0FBVFksd0NBQWM7eUJBQWQsY0FBYztJQUQxQixtQkFBVztHQUNDLGNBQWMsQ0FTMUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBLdWJlcm5ldGVzVmVyc2lvbiB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5pbXBvcnQgeyBDb3JlQWRkT24sIENvcmVBZGRPblByb3BzIH0gZnJvbSBcIi4uL2NvcmUtYWRkb25cIjtcbmltcG9ydCB7IHN1cHBvcnRzQUxMIH0gZnJvbSBcIi4uLy4uL3V0aWxzXCI7XG5cbmNvbnN0IHZlcnNpb25NYXA6IE1hcDxLdWJlcm5ldGVzVmVyc2lvbiwgc3RyaW5nPiA9IG5ldyBNYXAoW1xuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8zMCwgXCJ2MS4zMC4wLWVrc2J1aWxkLjNcIl0sXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI5LCBcInYxLjI5LjAtZWtzYnVpbGQuMVwiXSxcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjgsIFwidjEuMjguMi1la3NidWlsZC4yXCJdLFxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNywgXCJ2MS4yNy42LWVrc2J1aWxkLjJcIl0sXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI2LCBcInYxLjI2LjktZWtzYnVpbGQuMlwiXSxcbl0pO1xuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIGNvcmVkbnMgYWRkLW9uLlxuICovXG5leHBvcnQgdHlwZSBrdWJlUHJveHlBZGRPblByb3BzID0gT21pdDxDb3JlQWRkT25Qcm9wcywgXCJzYU5hbWVcIiB8IFwiYWRkT25OYW1lXCIgfCBcInZlcnNpb25cIiA+O1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gICAgYWRkT25OYW1lOiBcImt1YmUtcHJveHlcIixcbiAgICBzYU5hbWU6IFwia3ViZS1wcm94eVwiLFxuICAgIHZlcnNpb25NYXA6IHZlcnNpb25NYXAsXG59O1xuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIEt1YmVQcm94eSBFS1MgYWRkLW9uLlxuICovXG5Ac3VwcG9ydHNBTExcbmV4cG9ydCBjbGFzcyBLdWJlUHJveHlBZGRPbiBleHRlbmRzIENvcmVBZGRPbiB7XG5cbiAgICBjb25zdHJ1Y3Rvcih2ZXJzaW9uPzogc3RyaW5nLCBwcm9wcz86IGt1YmVQcm94eUFkZE9uUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoe1xuICAgICAgICAgICAgdmVyc2lvbjogdmVyc2lvbiA/PyBcImF1dG9cIixcbiAgICAgICAgICAgIC4uLiBkZWZhdWx0UHJvcHMsXG4gICAgICAgICAgICAuLi4gcHJvcHNcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19