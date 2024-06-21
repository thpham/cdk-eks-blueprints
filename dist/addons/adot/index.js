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
    [aws_eks_2.KubernetesVersion.V1_29, "v0.92.1-eksbuild.1"],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2Fkb3QvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsaURBQXlEO0FBR3pELHVDQUFtRztBQUNuRyxrREFBbUQ7QUFDbkQsOENBQTBEO0FBQzFELDZDQUE4RDtBQUM5RCxpREFBd0Q7QUFFeEQsTUFBTSxVQUFVLEdBQW1DLElBQUksR0FBRyxDQUFDO0lBQ3ZELENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0lBQy9DLENBQUMsMkJBQWlCLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDO0NBQ2xELENBQUMsQ0FBQztBQVNILE1BQU0sWUFBWSxHQUFHO0lBQ2pCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLE9BQU8sRUFBRSxNQUFNO0lBQ2YsVUFBVSxFQUFFLFVBQVU7SUFDdEIsTUFBTSxFQUFFLGdCQUFnQjtJQUN4QixzQkFBc0IsRUFBRSwyQ0FBOEI7SUFDdEQsU0FBUyxFQUFFLFNBQVM7SUFDcEIsbUJBQW1CLEVBQUUsRUFBRTtDQUMxQixDQUFDO0FBRUY7O0dBRUc7QUFFSSxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLHNCQUFTO0lBRTdDLFlBQVksS0FBK0I7O1FBQ3ZDLEtBQUssQ0FBQztZQUNGLEdBQUcsWUFBWTtZQUNmLEdBQUcsS0FBSztZQUNSLFNBQVMsRUFBRSxNQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxTQUFTLG1DQUFJLFlBQVksQ0FBQyxTQUFTO1lBQ3JELE9BQU8sRUFBRSxNQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxPQUFPLG1DQUFJLFlBQVksQ0FBQyxPQUFPO1NBQ2xELENBQUMsQ0FBQztJQUNQLENBQUM7SUFHRCxNQUFNLENBQUMsV0FBd0I7UUFDM0IsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvQyxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxlQUFlLENBQUMsV0FBd0IsRUFBRSxhQUFxQjtRQUMzRCxrQ0FBa0M7UUFDbEMsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUNwQyxNQUFNLEVBQUUsR0FBRyxJQUFBLHVCQUFlLEVBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFL0Qsb0NBQW9DO1FBQ3BDLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx3QkFBZ0IsRUFBQyxTQUFTLEdBQUcsd0JBQXdCLENBQUMsQ0FBQztRQUNsRixNQUFNLHVCQUF1QixHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFBLGdCQUFRLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RixNQUFNLHdCQUF3QixHQUFHLElBQUksNEJBQWtCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSw0QkFBNEIsRUFBRTtZQUNqRyxPQUFPO1lBQ1AsUUFBUSxFQUFFLHVCQUF1QjtZQUNqQyxTQUFTLEVBQUUsSUFBSTtTQUNsQixDQUFDLENBQUM7UUFFSCx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELE9BQU8sd0JBQXdCLENBQUM7SUFDcEMsQ0FBQztDQUNKLENBQUE7QUF4Q1ksZ0RBQWtCO0FBWTNCO0lBREMsSUFBQSxrQkFBVSxFQUFDLCtCQUFnQixDQUFDLElBQUksQ0FBQztnREFJakM7NkJBZlEsa0JBQWtCO0lBRDlCLG1CQUFXO0dBQ0Msa0JBQWtCLENBd0M5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEt1YmVybmV0ZXNNYW5pZmVzdCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QsIElDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IENsdXN0ZXJJbmZvIH0gZnJvbSBcIi4uLy4uL3NwaVwiO1xuaW1wb3J0IHsgY3JlYXRlTmFtZXNwYWNlLCBkZXBlbmRhYmxlLCBsb2FkWWFtbCwgcmVhZFlhbWxEb2N1bWVudCwgc3VwcG9ydHNBTEwgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcbmltcG9ydCB7IENlcnRNYW5hZ2VyQWRkT24gfSBmcm9tIFwiLi4vY2VydC1tYW5hZ2VyXCI7XG5pbXBvcnQgeyBDb3JlQWRkT24sIENvcmVBZGRPblByb3BzIH0gZnJvbSBcIi4uL2NvcmUtYWRkb25cIjtcbmltcG9ydCB7IGdldEFkb3RDb2xsZWN0b3JQb2xpY3lEb2N1bWVudCB9IGZyb20gXCIuL2lhbS1wb2xpY3lcIjtcbmltcG9ydCB7IEt1YmVybmV0ZXNWZXJzaW9uIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1la3NcIjtcblxuY29uc3QgdmVyc2lvbk1hcDogTWFwPEt1YmVybmV0ZXNWZXJzaW9uLCBzdHJpbmc+ID0gbmV3IE1hcChbXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI5LCBcInYwLjkyLjEtZWtzYnVpbGQuMVwiXSxcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjgsIFwidjAuOTIuMS1la3NidWlsZC4xXCJdLFxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNywgXCJ2MC45Mi4xLWVrc2J1aWxkLjFcIl0sXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI2LCBcInYwLjkyLjEtZWtzYnVpbGQuMVwiXSxcbl0pO1xuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIEFkb3QgYWRkLW9uLlxuICovXG5leHBvcnQgdHlwZSBBZG90Q29sbGVjdG9yQWRkT25Qcm9wcyA9IFBhcnRpYWw8T21pdDxDb3JlQWRkT25Qcm9wcywgXCJhZGRPbk5hbWVcIiB8IFwic2FOYW1lXCI+PiAmIHtcbiAgICBuYW1lc3BhY2U/OiBzdHJpbmc7XG59O1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gICAgYWRkT25OYW1lOiAnYWRvdCcsXG4gICAgdmVyc2lvbjogJ2F1dG8nLFxuICAgIHZlcnNpb25NYXA6IHZlcnNpb25NYXAsXG4gICAgc2FOYW1lOiAnYWRvdC1jb2xsZWN0b3InLFxuICAgIHBvbGljeURvY3VtZW50UHJvdmlkZXI6IGdldEFkb3RDb2xsZWN0b3JQb2xpY3lEb2N1bWVudCxcbiAgICBuYW1lc3BhY2U6ICdkZWZhdWx0JyxcbiAgICBjb25maWd1cmF0aW9uVmFsdWVzOiB7fVxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBBZG90IENvbGxlY3RvciBFS1MgYWRkLW9uLlxuICovXG5Ac3VwcG9ydHNBTExcbmV4cG9ydCBjbGFzcyBBZG90Q29sbGVjdG9yQWRkT24gZXh0ZW5kcyBDb3JlQWRkT24ge1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM/OiBBZG90Q29sbGVjdG9yQWRkT25Qcm9wcykge1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICAuLi5kZWZhdWx0UHJvcHMsXG4gICAgICAgICAgICAuLi5wcm9wcyxcbiAgICAgICAgICAgIG5hbWVzcGFjZTogcHJvcHM/Lm5hbWVzcGFjZSA/PyBkZWZhdWx0UHJvcHMubmFtZXNwYWNlLFxuICAgICAgICAgICAgdmVyc2lvbjogcHJvcHM/LnZlcnNpb24gPz8gZGVmYXVsdFByb3BzLnZlcnNpb25cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgQGRlcGVuZGFibGUoQ2VydE1hbmFnZXJBZGRPbi5uYW1lKVxuICAgIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xuICAgICAgICBjb25zdCBhZGRPblByb21pc2UgPSBzdXBlci5kZXBsb3koY2x1c3RlckluZm8pO1xuICAgICAgICByZXR1cm4gYWRkT25Qcm9taXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE92ZXJyaWRpbmcgYmFzZSBjbGFzcyBtZXRob2QgdG8gY3JlYXRlIG5hbWVzcGFjZSBhbmQgcmVnaXN0ZXIgcGVybWlzc2lvbnMuXG4gICAgICogQHBhcmFtIGNsdXN0ZXJJbmZvIFxuICAgICAqIEBwYXJhbSBuYW1lIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIGNyZWF0ZU5hbWVzcGFjZShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8sIG5hbWVzcGFjZU5hbWU6IHN0cmluZyk6IElDb25zdHJ1Y3QgfCB1bmRlZmluZWQge1xuICAgICAgICAvLyBDcmVhdGUgbmFtZXNwYWNlIGlmIG5vdCBkZWZhdWx0XG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuICAgICAgICBjb25zdCBucyA9IGNyZWF0ZU5hbWVzcGFjZShuYW1lc3BhY2VOYW1lLCBjbHVzdGVyLCB0cnVlLCB0cnVlKTtcblxuICAgICAgICAvLyBBcHBseWluZyBBRE9UIFBlcm1pc3Npb24gbWFuaWZlc3RcbiAgICAgICAgY29uc3Qgb3RlbFBlcm1pc3Npb25zRG9jID0gcmVhZFlhbWxEb2N1bWVudChfX2Rpcm5hbWUgKyAnL290ZWwtcGVybWlzc2lvbnMueWFtbCcpO1xuICAgICAgICBjb25zdCBvdGVsUGVybWlzc2lvbnNNYW5pZmVzdCA9IG90ZWxQZXJtaXNzaW9uc0RvYy5zcGxpdChcIi0tLVwiKS5tYXAoZSA9PiBsb2FkWWFtbChlKSk7XG4gICAgICAgIGNvbnN0IG90ZWxQZXJtaXNzaW9uc1N0YXRlbWVudCA9IG5ldyBLdWJlcm5ldGVzTWFuaWZlc3QoY2x1c3Rlci5zdGFjaywgXCJhZG90LWFkZG9uLW90ZWxQZXJtaXNzaW9uc1wiLCB7XG4gICAgICAgICAgICBjbHVzdGVyLFxuICAgICAgICAgICAgbWFuaWZlc3Q6IG90ZWxQZXJtaXNzaW9uc01hbmlmZXN0LFxuICAgICAgICAgICAgb3ZlcndyaXRlOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBvdGVsUGVybWlzc2lvbnNTdGF0ZW1lbnQubm9kZS5hZGREZXBlbmRlbmN5KG5zKTtcbiAgICAgICAgcmV0dXJuIG90ZWxQZXJtaXNzaW9uc1N0YXRlbWVudDtcbiAgICB9XG59XG5cbiJdfQ==