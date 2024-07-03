"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdotCollectorAddOn = void 0;
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const utils_1 = require("../../utils");
const cert_manager_1 = require("../cert-manager");
const core_addon_1 = require("../core-addon");
const iam_policy_1 = require("./iam-policy");
const aws_eks_2 = require("aws-cdk-lib/aws-eks");
const versionMap = new Map([
    [aws_eks_2.KubernetesVersion.V1_30, "v0.94.1-eksbuild.1"],
    [aws_eks_2.KubernetesVersion.V1_29, "v0.94.1-eksbuild.1"],
    [aws_eks_2.KubernetesVersion.V1_28, "v0.92.1-eksbuild.1"],
    [aws_eks_2.KubernetesVersion.V1_27, "v0.92.1-eksbuild.1"],
    [aws_eks_2.KubernetesVersion.V1_26, "v0.92.1-eksbuild.1"],
]);
const defaultProps = {
    addOnName: 'adot',
    version: 'auto',
    versionMap: versionMap,
    saName: 'adot-collector',
    policyDocumentProvider: iam_policy_1.getAdotCollectorPolicyDocument,
    namespace: 'default',
    configurationValues: {}
};
/**
 * Implementation of Adot Collector EKS add-on.
 */
let AdotCollectorAddOn = class AdotCollectorAddOn extends core_addon_1.CoreAddOn {
    constructor(props) {
        var _a, _b;
        super({
            ...defaultProps,
            ...props,
            namespace: (_a = props === null || props === void 0 ? void 0 : props.namespace) !== null && _a !== void 0 ? _a : defaultProps.namespace,
            version: (_b = props === null || props === void 0 ? void 0 : props.version) !== null && _b !== void 0 ? _b : defaultProps.version
        });
    }
    deploy(clusterInfo) {
        const addOnPromise = super.deploy(clusterInfo);
        return addOnPromise;
    }
    /**
     * Overriding base class method to create namespace and register permissions.
     * @param clusterInfo
     * @param name
     * @returns
     */
    createNamespace(clusterInfo, namespaceName) {
        // Create namespace if not default
        const cluster = clusterInfo.cluster;
        const ns = (0, utils_1.createNamespace)(namespaceName, cluster, true, true);
        // Applying ADOT Permission manifest
        const otelPermissionsDoc = (0, utils_1.readYamlDocument)(__dirname + '/otel-permissions.yaml');
        const otelPermissionsManifest = otelPermissionsDoc.split("---").map(e => (0, utils_1.loadYaml)(e));
        const otelPermissionsStatement = new aws_eks_1.KubernetesManifest(cluster.stack, "adot-addon-otelPermissions", {
            cluster,
            manifest: otelPermissionsManifest,
            overwrite: true,
        });
        otelPermissionsStatement.node.addDependency(ns);
        return otelPermissionsStatement;
    }
};
exports.AdotCollectorAddOn = AdotCollectorAddOn;
__decorate([
    (0, utils_1.dependable)(cert_manager_1.CertManagerAddOn.name)
], AdotCollectorAddOn.prototype, "deploy", null);
exports.AdotCollectorAddOn = AdotCollectorAddOn = __decorate([
    utils_1.supportsALL
], AdotCollectorAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2Fkb3QvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsaURBQXlEO0FBR3pELHVDQUFtRztBQUNuRyxrREFBbUQ7QUFDbkQsOENBQTBEO0FBQzFELDZDQUE4RDtBQUM5RCxpREFBd0Q7QUFFeEQsTUFBTSxVQUFVLEdBQW1DLElBQUksR0FBRyxDQUFDO0lBQ3ZELENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0NBQ2xELENBQUMsQ0FBQztBQVNILE1BQU0sWUFBWSxHQUFHO0lBQ2pCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLE9BQU8sRUFBRSxNQUFNO0lBQ2YsVUFBVSxFQUFFLFVBQVU7SUFDdEIsTUFBTSxFQUFFLGdCQUFnQjtJQUN4QixzQkFBc0IsRUFBRSwyQ0FBOEI7SUFDdEQsU0FBUyxFQUFFLFNBQVM7SUFDcEIsbUJBQW1CLEVBQUUsRUFBRTtDQUMxQixDQUFDO0FBRUY7O0dBRUc7QUFFSSxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLHNCQUFTO0lBRTdDLFlBQVksS0FBK0I7O1FBQ3ZDLEtBQUssQ0FBQztZQUNGLEdBQUcsWUFBWTtZQUNmLEdBQUcsS0FBSztZQUNSLFNBQVMsRUFBRSxNQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxTQUFTLG1DQUFJLFlBQVksQ0FBQyxTQUFTO1lBQ3JELE9BQU8sRUFBRSxNQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxPQUFPLG1DQUFJLFlBQVksQ0FBQyxPQUFPO1NBQ2xELENBQUMsQ0FBQztJQUNQLENBQUM7SUFHRCxNQUFNLENBQUMsV0FBd0I7UUFDM0IsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvQyxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxlQUFlLENBQUMsV0FBd0IsRUFBRSxhQUFxQjtRQUMzRCxrQ0FBa0M7UUFDbEMsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUNwQyxNQUFNLEVBQUUsR0FBRyxJQUFBLHVCQUFlLEVBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFL0Qsb0NBQW9DO1FBQ3BDLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx3QkFBZ0IsRUFBQyxTQUFTLEdBQUcsd0JBQXdCLENBQUMsQ0FBQztRQUNsRixNQUFNLHVCQUF1QixHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFBLGdCQUFRLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RixNQUFNLHdCQUF3QixHQUFHLElBQUksNEJBQWtCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSw0QkFBNEIsRUFBRTtZQUNqRyxPQUFPO1lBQ1AsUUFBUSxFQUFFLHVCQUF1QjtZQUNqQyxTQUFTLEVBQUUsSUFBSTtTQUNsQixDQUFDLENBQUM7UUFFSCx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELE9BQU8sd0JBQXdCLENBQUM7SUFDcEMsQ0FBQztDQUNKLENBQUE7QUF4Q1ksZ0RBQWtCO0FBWTNCO0lBREMsSUFBQSxrQkFBVSxFQUFDLCtCQUFnQixDQUFDLElBQUksQ0FBQztnREFJakM7NkJBZlEsa0JBQWtCO0lBRDlCLG1CQUFXO0dBQ0Msa0JBQWtCLENBd0M5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEt1YmVybmV0ZXNNYW5pZmVzdCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QsIElDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IENsdXN0ZXJJbmZvIH0gZnJvbSBcIi4uLy4uL3NwaVwiO1xuaW1wb3J0IHsgY3JlYXRlTmFtZXNwYWNlLCBkZXBlbmRhYmxlLCBsb2FkWWFtbCwgcmVhZFlhbWxEb2N1bWVudCwgc3VwcG9ydHNBTEwgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcbmltcG9ydCB7IENlcnRNYW5hZ2VyQWRkT24gfSBmcm9tIFwiLi4vY2VydC1tYW5hZ2VyXCI7XG5pbXBvcnQgeyBDb3JlQWRkT24sIENvcmVBZGRPblByb3BzIH0gZnJvbSBcIi4uL2NvcmUtYWRkb25cIjtcbmltcG9ydCB7IGdldEFkb3RDb2xsZWN0b3JQb2xpY3lEb2N1bWVudCB9IGZyb20gXCIuL2lhbS1wb2xpY3lcIjtcbmltcG9ydCB7IEt1YmVybmV0ZXNWZXJzaW9uIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1la3NcIjtcblxuY29uc3QgdmVyc2lvbk1hcDogTWFwPEt1YmVybmV0ZXNWZXJzaW9uLCBzdHJpbmc+ID0gbmV3IE1hcChbXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzMwLCBcInYwLjk0LjEtZWtzYnVpbGQuMVwiXSxcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjksIFwidjAuOTQuMS1la3NidWlsZC4xXCJdLFxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yOCwgXCJ2MC45Mi4xLWVrc2J1aWxkLjFcIl0sXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI3LCBcInYwLjkyLjEtZWtzYnVpbGQuMVwiXSxcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjYsIFwidjAuOTIuMS1la3NidWlsZC4xXCJdLFxuXSk7XG5cbi8qKlxuICogQ29uZmlndXJhdGlvbiBvcHRpb25zIGZvciB0aGUgQWRvdCBhZGQtb24uXG4gKi9cbmV4cG9ydCB0eXBlIEFkb3RDb2xsZWN0b3JBZGRPblByb3BzID0gUGFydGlhbDxPbWl0PENvcmVBZGRPblByb3BzLCBcImFkZE9uTmFtZVwiIHwgXCJzYU5hbWVcIj4+ICYge1xuICAgIG5hbWVzcGFjZT86IHN0cmluZztcbn07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgICBhZGRPbk5hbWU6ICdhZG90JyxcbiAgICB2ZXJzaW9uOiAnYXV0bycsXG4gICAgdmVyc2lvbk1hcDogdmVyc2lvbk1hcCxcbiAgICBzYU5hbWU6ICdhZG90LWNvbGxlY3RvcicsXG4gICAgcG9saWN5RG9jdW1lbnRQcm92aWRlcjogZ2V0QWRvdENvbGxlY3RvclBvbGljeURvY3VtZW50LFxuICAgIG5hbWVzcGFjZTogJ2RlZmF1bHQnLFxuICAgIGNvbmZpZ3VyYXRpb25WYWx1ZXM6IHt9XG59O1xuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIEFkb3QgQ29sbGVjdG9yIEVLUyBhZGQtb24uXG4gKi9cbkBzdXBwb3J0c0FMTFxuZXhwb3J0IGNsYXNzIEFkb3RDb2xsZWN0b3JBZGRPbiBleHRlbmRzIENvcmVBZGRPbiB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IEFkb3RDb2xsZWN0b3JBZGRPblByb3BzKSB7XG4gICAgICAgIHN1cGVyKHtcbiAgICAgICAgICAgIC4uLmRlZmF1bHRQcm9wcyxcbiAgICAgICAgICAgIC4uLnByb3BzLFxuICAgICAgICAgICAgbmFtZXNwYWNlOiBwcm9wcz8ubmFtZXNwYWNlID8/IGRlZmF1bHRQcm9wcy5uYW1lc3BhY2UsXG4gICAgICAgICAgICB2ZXJzaW9uOiBwcm9wcz8udmVyc2lvbiA/PyBkZWZhdWx0UHJvcHMudmVyc2lvblxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBAZGVwZW5kYWJsZShDZXJ0TWFuYWdlckFkZE9uLm5hbWUpXG4gICAgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFByb21pc2U8Q29uc3RydWN0PiB7XG4gICAgICAgIGNvbnN0IGFkZE9uUHJvbWlzZSA9IHN1cGVyLmRlcGxveShjbHVzdGVySW5mbyk7XG4gICAgICAgIHJldHVybiBhZGRPblByb21pc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3ZlcnJpZGluZyBiYXNlIGNsYXNzIG1ldGhvZCB0byBjcmVhdGUgbmFtZXNwYWNlIGFuZCByZWdpc3RlciBwZXJtaXNzaW9ucy5cbiAgICAgKiBAcGFyYW0gY2x1c3RlckluZm8gXG4gICAgICogQHBhcmFtIG5hbWUgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgY3JlYXRlTmFtZXNwYWNlKGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbywgbmFtZXNwYWNlTmFtZTogc3RyaW5nKTogSUNvbnN0cnVjdCB8IHVuZGVmaW5lZCB7XG4gICAgICAgIC8vIENyZWF0ZSBuYW1lc3BhY2UgaWYgbm90IGRlZmF1bHRcbiAgICAgICAgY29uc3QgY2x1c3RlciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXI7XG4gICAgICAgIGNvbnN0IG5zID0gY3JlYXRlTmFtZXNwYWNlKG5hbWVzcGFjZU5hbWUsIGNsdXN0ZXIsIHRydWUsIHRydWUpO1xuXG4gICAgICAgIC8vIEFwcGx5aW5nIEFET1QgUGVybWlzc2lvbiBtYW5pZmVzdFxuICAgICAgICBjb25zdCBvdGVsUGVybWlzc2lvbnNEb2MgPSByZWFkWWFtbERvY3VtZW50KF9fZGlybmFtZSArICcvb3RlbC1wZXJtaXNzaW9ucy55YW1sJyk7XG4gICAgICAgIGNvbnN0IG90ZWxQZXJtaXNzaW9uc01hbmlmZXN0ID0gb3RlbFBlcm1pc3Npb25zRG9jLnNwbGl0KFwiLS0tXCIpLm1hcChlID0+IGxvYWRZYW1sKGUpKTtcbiAgICAgICAgY29uc3Qgb3RlbFBlcm1pc3Npb25zU3RhdGVtZW50ID0gbmV3IEt1YmVybmV0ZXNNYW5pZmVzdChjbHVzdGVyLnN0YWNrLCBcImFkb3QtYWRkb24tb3RlbFBlcm1pc3Npb25zXCIsIHtcbiAgICAgICAgICAgIGNsdXN0ZXIsXG4gICAgICAgICAgICBtYW5pZmVzdDogb3RlbFBlcm1pc3Npb25zTWFuaWZlc3QsXG4gICAgICAgICAgICBvdmVyd3JpdGU6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG90ZWxQZXJtaXNzaW9uc1N0YXRlbWVudC5ub2RlLmFkZERlcGVuZGVuY3kobnMpO1xuICAgICAgICByZXR1cm4gb3RlbFBlcm1pc3Npb25zU3RhdGVtZW50O1xuICAgIH1cbn1cblxuIl19