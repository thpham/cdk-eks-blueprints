"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EksPodIdentityAgentAddOn = void 0;
const core_addon_1 = require("../core-addon");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const versionMap = new Map([
    [aws_eks_1.KubernetesVersion.V1_29, "v1.2.0-eksbuild.1"],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2Vrcy1wb2QtaWRlbnRpdHktYWdlbnQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOENBQTBDO0FBQzFDLGlEQUF3RDtBQUV4RCxNQUFNLFVBQVUsR0FBbUMsSUFBSSxHQUFHLENBQUM7SUFDdkQsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUM7SUFDOUMsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUM7SUFDOUMsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUM7SUFDOUMsQ0FBQywyQkFBaUIsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUM7Q0FDakQsQ0FBQyxDQUFDO0FBRUg7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBRztJQUNqQixTQUFTLEVBQUUsd0JBQXdCO0lBQ25DLE9BQU8sRUFBRSxNQUFNO0lBQ2YsVUFBVSxFQUFFLFVBQVU7SUFDdEIsTUFBTSxFQUFFLDJCQUEyQjtDQUN0QyxDQUFDO0FBRUY7O0dBRUc7QUFDSCxNQUFhLHdCQUF5QixTQUFRLHNCQUFTO0lBRW5ELFlBQVksT0FBZ0I7UUFDeEIsS0FBSyxDQUFDO1lBQ0YsU0FBUyxFQUFFLFlBQVksQ0FBQyxTQUFTO1lBQ2pDLE9BQU8sRUFBRSxPQUFPLGFBQVAsT0FBTyxjQUFQLE9BQU8sR0FBSSxZQUFZLENBQUMsT0FBTztZQUN4QyxNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDM0IsVUFBVSxFQUFFLFlBQVksQ0FBQyxVQUFVO1NBQ3RDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQVZELDREQVVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29yZUFkZE9uIH0gZnJvbSBcIi4uL2NvcmUtYWRkb25cIjtcbmltcG9ydCB7IEt1YmVybmV0ZXNWZXJzaW9uIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1la3NcIjtcblxuY29uc3QgdmVyc2lvbk1hcDogTWFwPEt1YmVybmV0ZXNWZXJzaW9uLCBzdHJpbmc+ID0gbmV3IE1hcChbXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI5LCBcInYxLjIuMC1la3NidWlsZC4xXCJdLFxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yOCwgXCJ2MS4yLjAtZWtzYnVpbGQuMVwiXSxcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjcsIFwidjEuMi4wLWVrc2J1aWxkLjFcIl0sXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI2LCBcInYxLjIuMC1la3NidWlsZC4xXCJdLFxuXSk7XG5cbi8qKlxuICogRGVmYXVsdCB2YWx1ZXMgZm9yIHRoZSBhZGQtb25cbiAqL1xuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICAgIGFkZE9uTmFtZTogJ2Vrcy1wb2QtaWRlbnRpdHktYWdlbnQnLFxuICAgIHZlcnNpb246ICdhdXRvJyxcbiAgICB2ZXJzaW9uTWFwOiB2ZXJzaW9uTWFwLFxuICAgIHNhTmFtZTogXCJla3MtcG9kLWlkZW50aXR5LWFnZW50LXNhXCIsXG59O1xuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIEFtYXpvbiBFS1MgUG9kIElkZW50aXR5IEFnZW50IGFkZC1vbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEVrc1BvZElkZW50aXR5QWdlbnRBZGRPbiBleHRlbmRzIENvcmVBZGRPbiB7XG5cbiAgICBjb25zdHJ1Y3Rvcih2ZXJzaW9uPzogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIGFkZE9uTmFtZTogZGVmYXVsdFByb3BzLmFkZE9uTmFtZSxcbiAgICAgICAgICAgIHZlcnNpb246IHZlcnNpb24gPz8gZGVmYXVsdFByb3BzLnZlcnNpb24sXG4gICAgICAgICAgICBzYU5hbWU6IGRlZmF1bHRQcm9wcy5zYU5hbWUsXG4gICAgICAgICAgICB2ZXJzaW9uTWFwOiBkZWZhdWx0UHJvcHMudmVyc2lvbk1hcFxuICAgICAgICB9KTtcbiAgICB9XG59Il19