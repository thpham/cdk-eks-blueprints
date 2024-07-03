"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EksPodIdentityAgentAddOn = void 0;
const core_addon_1 = require("../core-addon");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const versionMap = new Map([
    [aws_eks_1.KubernetesVersion.V1_30, "v1.3.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_29, "v1.3.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_28, "v1.2.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_27, "v1.2.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_26, "v1.2.0-eksbuild.1"],
]);
/**
 * Default values for the add-on
 */
const defaultProps = {
    addOnName: 'eks-pod-identity-agent',
    version: 'auto',
    versionMap: versionMap,
    saName: "eks-pod-identity-agent-sa",
};
/**
 * Implementation of Amazon EKS Pod Identity Agent add-on.
 */
class EksPodIdentityAgentAddOn extends core_addon_1.CoreAddOn {
    constructor(version) {
        super({
            addOnName: defaultProps.addOnName,
            version: version !== null && version !== void 0 ? version : defaultProps.version,
            saName: defaultProps.saName,
            versionMap: defaultProps.versionMap
        });
    }
}
exports.EksPodIdentityAgentAddOn = EksPodIdentityAgentAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2Vrcy1wb2QtaWRlbnRpdHktYWdlbnQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOENBQTBDO0FBQzFDLGlEQUF3RDtBQUV4RCxNQUFNLFVBQVUsR0FBbUMsSUFBSSxHQUFHLENBQUM7SUFDdkQsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUM7SUFDOUMsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUM7SUFDOUMsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUM7SUFDOUMsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUM7SUFDOUMsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUM7Q0FDakQsQ0FBQyxDQUFDO0FBRUg7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBRztJQUNqQixTQUFTLEVBQUUsd0JBQXdCO0lBQ25DLE9BQU8sRUFBRSxNQUFNO0lBQ2YsVUFBVSxFQUFFLFVBQVU7SUFDdEIsTUFBTSxFQUFFLDJCQUEyQjtDQUN0QyxDQUFDO0FBRUY7O0dBRUc7QUFDSCxNQUFhLHdCQUF5QixTQUFRLHNCQUFTO0lBRW5ELFlBQVksT0FBZ0I7UUFDeEIsS0FBSyxDQUFDO1lBQ0YsU0FBUyxFQUFFLFlBQVksQ0FBQyxTQUFTO1lBQ2pDLE9BQU8sRUFBRSxPQUFPLGFBQVAsT0FBTyxjQUFQLE9BQU8sR0FBSSxZQUFZLENBQUMsT0FBTztZQUN4QyxNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDM0IsVUFBVSxFQUFFLFlBQVksQ0FBQyxVQUFVO1NBQ3RDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQVZELDREQVVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29yZUFkZE9uIH0gZnJvbSBcIi4uL2NvcmUtYWRkb25cIjtcbmltcG9ydCB7IEt1YmVybmV0ZXNWZXJzaW9uIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1la3NcIjtcblxuY29uc3QgdmVyc2lvbk1hcDogTWFwPEt1YmVybmV0ZXNWZXJzaW9uLCBzdHJpbmc+ID0gbmV3IE1hcChbXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzMwLCBcInYxLjMuMC1la3NidWlsZC4xXCJdLFxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yOSwgXCJ2MS4zLjAtZWtzYnVpbGQuMVwiXSxcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjgsIFwidjEuMi4wLWVrc2J1aWxkLjFcIl0sXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI3LCBcInYxLjIuMC1la3NidWlsZC4xXCJdLFxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNiwgXCJ2MS4yLjAtZWtzYnVpbGQuMVwiXSxcbl0pO1xuXG4vKipcbiAqIERlZmF1bHQgdmFsdWVzIGZvciB0aGUgYWRkLW9uXG4gKi9cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgICBhZGRPbk5hbWU6ICdla3MtcG9kLWlkZW50aXR5LWFnZW50JyxcbiAgICB2ZXJzaW9uOiAnYXV0bycsXG4gICAgdmVyc2lvbk1hcDogdmVyc2lvbk1hcCxcbiAgICBzYU5hbWU6IFwiZWtzLXBvZC1pZGVudGl0eS1hZ2VudC1zYVwiLFxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBBbWF6b24gRUtTIFBvZCBJZGVudGl0eSBBZ2VudCBhZGQtb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBFa3NQb2RJZGVudGl0eUFnZW50QWRkT24gZXh0ZW5kcyBDb3JlQWRkT24ge1xuXG4gICAgY29uc3RydWN0b3IodmVyc2lvbj86IHN0cmluZykge1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBhZGRPbk5hbWU6IGRlZmF1bHRQcm9wcy5hZGRPbk5hbWUsXG4gICAgICAgICAgICB2ZXJzaW9uOiB2ZXJzaW9uID8/IGRlZmF1bHRQcm9wcy52ZXJzaW9uLFxuICAgICAgICAgICAgc2FOYW1lOiBkZWZhdWx0UHJvcHMuc2FOYW1lLFxuICAgICAgICAgICAgdmVyc2lvbk1hcDogZGVmYXVsdFByb3BzLnZlcnNpb25NYXBcbiAgICAgICAgfSk7XG4gICAgfVxufSJdfQ==