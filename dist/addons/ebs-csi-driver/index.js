"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EbsCsiDriverAddOn = void 0;
const core_addon_1 = require("../core-addon");
const iam_policy_1 = require("./iam-policy");
const utils_1 = require("../../utils");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_eks_2 = require("aws-cdk-lib/aws-eks");
/* VersioMap showing the default version for 4 supported Kubernetes versions */
const versionMap = new Map([
    [aws_eks_1.KubernetesVersion.V1_29, "v1.28.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_28, "v1.28.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_27, "v1.28.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_26, "v1.28.0-eksbuild.1"]
]);
/**
 * Default values for the add-on
 */
const defaultProps = {
    addOnName: "aws-ebs-csi-driver",
    version: "auto",
    versionMap: versionMap,
    saName: "ebs-csi-controller-sa",
    storageClass: "gp3", // Set the default StorageClass to gp3
};
/**
 * Implementation of EBS CSI Driver EKS add-on
 */
let EbsCsiDriverAddOn = class EbsCsiDriverAddOn extends core_addon_1.CoreAddOn {
    constructor(options) {
        var _a;
        super({
            addOnName: defaultProps.addOnName,
            version: (_a = options === null || options === void 0 ? void 0 : options.version) !== null && _a !== void 0 ? _a : defaultProps.version,
            versionMap: defaultProps.versionMap,
            saName: defaultProps.saName,
            configurationValues: options === null || options === void 0 ? void 0 : options.configurationValues,
        });
        this.options = options;
        this.ebsProps = {
            ...defaultProps,
            ...options,
        };
    }
    providePolicyDocument(clusterInfo) {
        var _a;
        return (0, iam_policy_1.getEbsDriverPolicyDocument)(clusterInfo.cluster.stack.partition, (_a = this.options) === null || _a === void 0 ? void 0 : _a.kmsKeys);
    }
    async deploy(clusterInfo) {
        const baseDeployment = await super.deploy(clusterInfo);
        const cluster = clusterInfo.cluster;
        let updateSc;
        if (this.ebsProps.storageClass) {
            // patch resource on cluster
            const patchSc = new aws_eks_2.KubernetesPatch(cluster.stack, `${cluster}-RemoveGP2SC`, {
                cluster: cluster,
                resourceName: "storageclass/gp2",
                applyPatch: {
                    metadata: {
                        annotations: {
                            "storageclass.kubernetes.io/is-default-class": "false",
                        },
                    },
                },
                restorePatch: {
                    metadata: {
                        annotations: {
                            "storageclass.kubernetes.io/is-default-class": "true",
                        },
                    },
                },
            });
            // Create and set gp3 StorageClass as cluster-wide default
            updateSc = new aws_eks_2.KubernetesManifest(cluster.stack, `${cluster}-SetDefaultSC`, {
                cluster: cluster,
                manifest: [
                    {
                        apiVersion: "storage.k8s.io/v1",
                        kind: "StorageClass",
                        metadata: {
                            name: "gp3",
                            annotations: {
                                "storageclass.kubernetes.io/is-default-class": "true",
                            },
                        },
                        provisioner: "ebs.csi.aws.com",
                        reclaimPolicy: "Delete",
                        volumeBindingMode: "WaitForFirstConsumer",
                        parameters: {
                            type: "gp3",
                            fsType: "ext4",
                            encrypted: "true",
                        },
                    },
                ],
            });
            patchSc.node.addDependency(baseDeployment);
            updateSc.node.addDependency(patchSc);
            return updateSc;
        }
        else {
            return baseDeployment;
        }
    }
};
exports.EbsCsiDriverAddOn = EbsCsiDriverAddOn;
exports.EbsCsiDriverAddOn = EbsCsiDriverAddOn = __decorate([
    utils_1.supportsALL
], EbsCsiDriverAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2Vicy1jc2ktZHJpdmVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUdBLDhDQUEwRDtBQUMxRCw2Q0FBMEQ7QUFDMUQsdUNBQTBDO0FBQzFDLGlEQUF3RDtBQUV4RCxpREFBMEU7QUFFMUUsK0VBQStFO0FBQy9FLE1BQU0sVUFBVSxHQUFtQyxJQUFJLEdBQUcsQ0FBQztJQUN2RCxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQztJQUMvQyxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQztJQUMvQyxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQztJQUMvQyxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQztDQUNsRCxDQUFDLENBQUM7QUFvQkg7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBNEM7SUFDNUQsU0FBUyxFQUFFLG9CQUFvQjtJQUMvQixPQUFPLEVBQUUsTUFBTTtJQUNmLFVBQVUsRUFBRSxVQUFVO0lBQ3RCLE1BQU0sRUFBRSx1QkFBdUI7SUFDL0IsWUFBWSxFQUFFLEtBQUssRUFBRSxzQ0FBc0M7Q0FDNUQsQ0FBQztBQUVGOztHQUVHO0FBRUksSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBa0IsU0FBUSxzQkFBUztJQUc5QyxZQUFxQixPQUFnQzs7UUFDbkQsS0FBSyxDQUFDO1lBQ0osU0FBUyxFQUFFLFlBQVksQ0FBQyxTQUFTO1lBQ2pDLE9BQU8sRUFBRSxNQUFBLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPLG1DQUFJLFlBQVksQ0FBQyxPQUFPO1lBQ2pELFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVTtZQUNuQyxNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDM0IsbUJBQW1CLEVBQUUsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLG1CQUFtQjtTQUNsRCxDQUFDLENBQUM7UUFQZ0IsWUFBTyxHQUFQLE9BQU8sQ0FBeUI7UUFTbkQsSUFBSSxDQUFDLFFBQVEsR0FBRztZQUNkLEdBQUcsWUFBWTtZQUNmLEdBQUcsT0FBTztTQUNYLENBQUM7SUFDSixDQUFDO0lBRUQscUJBQXFCLENBQUMsV0FBd0I7O1FBQzVDLE9BQU8sSUFBQSx1Q0FBMEIsRUFDL0IsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUNuQyxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLE9BQU8sQ0FDdEIsQ0FBQztJQUNKLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQXdCO1FBQ25DLE1BQU0sY0FBYyxHQUFHLE1BQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV2RCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3BDLElBQUksUUFBNEIsQ0FBQztRQUVqQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDL0IsNEJBQTRCO1lBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUkseUJBQWUsQ0FDakMsT0FBTyxDQUFDLEtBQUssRUFDYixHQUFHLE9BQU8sY0FBYyxFQUN4QjtnQkFDRSxPQUFPLEVBQUUsT0FBTztnQkFDaEIsWUFBWSxFQUFFLGtCQUFrQjtnQkFDaEMsVUFBVSxFQUFFO29CQUNWLFFBQVEsRUFBRTt3QkFDUixXQUFXLEVBQUU7NEJBQ1gsNkNBQTZDLEVBQUUsT0FBTzt5QkFDdkQ7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsWUFBWSxFQUFFO29CQUNaLFFBQVEsRUFBRTt3QkFDUixXQUFXLEVBQUU7NEJBQ1gsNkNBQTZDLEVBQUUsTUFBTTt5QkFDdEQ7cUJBQ0Y7aUJBQ0Y7YUFDRixDQUNGLENBQUM7WUFFRiwwREFBMEQ7WUFDMUQsUUFBUSxHQUFHLElBQUksNEJBQWtCLENBQy9CLE9BQU8sQ0FBQyxLQUFLLEVBQ2IsR0FBRyxPQUFPLGVBQWUsRUFDekI7Z0JBQ0UsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLFFBQVEsRUFBRTtvQkFDUjt3QkFDRSxVQUFVLEVBQUUsbUJBQW1CO3dCQUMvQixJQUFJLEVBQUUsY0FBYzt3QkFDcEIsUUFBUSxFQUFFOzRCQUNSLElBQUksRUFBRSxLQUFLOzRCQUNYLFdBQVcsRUFBRTtnQ0FDWCw2Q0FBNkMsRUFBRSxNQUFNOzZCQUN0RDt5QkFDRjt3QkFDRCxXQUFXLEVBQUUsaUJBQWlCO3dCQUM5QixhQUFhLEVBQUUsUUFBUTt3QkFDdkIsaUJBQWlCLEVBQUUsc0JBQXNCO3dCQUN6QyxVQUFVLEVBQUU7NEJBQ1YsSUFBSSxFQUFFLEtBQUs7NEJBQ1gsTUFBTSxFQUFFLE1BQU07NEJBQ2QsU0FBUyxFQUFFLE1BQU07eUJBQ2xCO3FCQUNGO2lCQUNGO2FBQ0YsQ0FDRixDQUFDO1lBRUYsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDM0MsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFckMsT0FBTyxRQUFRLENBQUM7UUFDbEIsQ0FBQzthQUNELENBQUM7WUFDQyxPQUFPLGNBQWMsQ0FBQztRQUN4QixDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUE7QUE5RlksOENBQWlCOzRCQUFqQixpQkFBaUI7SUFEN0IsbUJBQVc7R0FDQyxpQkFBaUIsQ0E4RjdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUG9saWN5RG9jdW1lbnQgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xyXG5pbXBvcnQgKiBhcyBrbXMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1rbXNcIjtcclxuaW1wb3J0IHsgQ2x1c3RlckluZm8gfSBmcm9tIFwiLi4vLi4vc3BpXCI7XHJcbmltcG9ydCB7IENvcmVBZGRPbiwgQ29yZUFkZE9uUHJvcHMgfSBmcm9tIFwiLi4vY29yZS1hZGRvblwiO1xyXG5pbXBvcnQgeyBnZXRFYnNEcml2ZXJQb2xpY3lEb2N1bWVudCB9IGZyb20gXCIuL2lhbS1wb2xpY3lcIjtcclxuaW1wb3J0IHsgc3VwcG9ydHNBTEwgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcclxuaW1wb3J0IHsgS3ViZXJuZXRlc1ZlcnNpb24gfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xyXG5pbXBvcnQgeyBLdWJlcm5ldGVzTWFuaWZlc3QsIEt1YmVybmV0ZXNQYXRjaCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XHJcblxyXG4vKiBWZXJzaW9NYXAgc2hvd2luZyB0aGUgZGVmYXVsdCB2ZXJzaW9uIGZvciA0IHN1cHBvcnRlZCBLdWJlcm5ldGVzIHZlcnNpb25zICovXHJcbmNvbnN0IHZlcnNpb25NYXA6IE1hcDxLdWJlcm5ldGVzVmVyc2lvbiwgc3RyaW5nPiA9IG5ldyBNYXAoW1xyXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI5LCBcInYxLjI4LjAtZWtzYnVpbGQuMVwiXSxcclxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yOCwgXCJ2MS4yOC4wLWVrc2J1aWxkLjFcIl0sXHJcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjcsIFwidjEuMjguMC1la3NidWlsZC4xXCJdLFxyXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI2LCBcInYxLjI4LjAtZWtzYnVpbGQuMVwiXVxyXG5dKTtcclxuXHJcbi8qKlxyXG4gKiBJbnRlcmZhY2UgZm9yIEVCUyBDU0kgRHJpdmVyIEVLUyBhZGQtb24gb3B0aW9uc1xyXG4gKi9cclxuZXhwb3J0IHR5cGUgRWJzQ3NpRHJpdmVyQWRkT25Qcm9wcyA9IE9taXQ8Q29yZUFkZE9uUHJvcHMsIFwicG9saWN5RG9jdW1lbnRQcm92aWRlclwiIHwgXCJzYU5hbWVcIiB8IFwiYWRkT25OYW1lXCIgfCBcImNvbnRyb2xQbGFuZUFkZE9uXCIgfCBcIm5hbWVzcGFjZVwiIHwgXCJ2ZXJzaW9uTWFwXCIgfCBcInZlcnNpb25cIj4gJiB7XHJcbiAgLyoqXHJcbiAgICogTGlzdCBvZiBLTVMga2V5cyB0byBiZSB1c2VkIGZvciBlbmNyeXB0aW9uXHJcbiAgICovXHJcbiAga21zS2V5cz86IGttcy5LZXlbXTtcclxuICAvKipcclxuICAgKiBTdG9yYWdlQ2xhc3MgdG8gYmUgdXNlZCBmb3IgdGhlIGFkZG9uXHJcbiAgICovXHJcbiAgc3RvcmFnZUNsYXNzPzogc3RyaW5nO1xyXG4gIC8qKlxyXG4gICAqIFZlcnNpb24gb2YgdGhlIEVCUyBDU0kgZHJpdmVyIHRvIGJlIHVzZWRcclxuICAgKi9cclxuICB2ZXJzaW9uPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogRGVmYXVsdCB2YWx1ZXMgZm9yIHRoZSBhZGQtb25cclxuICovXHJcbmNvbnN0IGRlZmF1bHRQcm9wczogQ29yZUFkZE9uUHJvcHMgJiBFYnNDc2lEcml2ZXJBZGRPblByb3BzID0ge1xyXG4gIGFkZE9uTmFtZTogXCJhd3MtZWJzLWNzaS1kcml2ZXJcIixcclxuICB2ZXJzaW9uOiBcImF1dG9cIixcclxuICB2ZXJzaW9uTWFwOiB2ZXJzaW9uTWFwLFxyXG4gIHNhTmFtZTogXCJlYnMtY3NpLWNvbnRyb2xsZXItc2FcIixcclxuICBzdG9yYWdlQ2xhc3M6IFwiZ3AzXCIsIC8vIFNldCB0aGUgZGVmYXVsdCBTdG9yYWdlQ2xhc3MgdG8gZ3AzXHJcbn07XHJcblxyXG4vKipcclxuICogSW1wbGVtZW50YXRpb24gb2YgRUJTIENTSSBEcml2ZXIgRUtTIGFkZC1vblxyXG4gKi9cclxuQHN1cHBvcnRzQUxMXHJcbmV4cG9ydCBjbGFzcyBFYnNDc2lEcml2ZXJBZGRPbiBleHRlbmRzIENvcmVBZGRPbiB7XHJcbiAgcmVhZG9ubHkgZWJzUHJvcHM6IEVic0NzaURyaXZlckFkZE9uUHJvcHM7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHJlYWRvbmx5IG9wdGlvbnM/OiBFYnNDc2lEcml2ZXJBZGRPblByb3BzKSB7XHJcbiAgICBzdXBlcih7XHJcbiAgICAgIGFkZE9uTmFtZTogZGVmYXVsdFByb3BzLmFkZE9uTmFtZSxcclxuICAgICAgdmVyc2lvbjogb3B0aW9ucz8udmVyc2lvbiA/PyBkZWZhdWx0UHJvcHMudmVyc2lvbixcclxuICAgICAgdmVyc2lvbk1hcDogZGVmYXVsdFByb3BzLnZlcnNpb25NYXAsXHJcbiAgICAgIHNhTmFtZTogZGVmYXVsdFByb3BzLnNhTmFtZSxcclxuICAgICAgY29uZmlndXJhdGlvblZhbHVlczogb3B0aW9ucz8uY29uZmlndXJhdGlvblZhbHVlcyxcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuZWJzUHJvcHMgPSB7XHJcbiAgICAgIC4uLmRlZmF1bHRQcm9wcyxcclxuICAgICAgLi4ub3B0aW9ucyxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcm92aWRlUG9saWN5RG9jdW1lbnQoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogUG9saWN5RG9jdW1lbnQge1xyXG4gICAgcmV0dXJuIGdldEVic0RyaXZlclBvbGljeURvY3VtZW50KFxyXG4gICAgICBjbHVzdGVySW5mby5jbHVzdGVyLnN0YWNrLnBhcnRpdGlvbixcclxuICAgICAgdGhpcy5vcHRpb25zPy5rbXNLZXlzXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFByb21pc2U8Q29uc3RydWN0PiB7XHJcbiAgICBjb25zdCBiYXNlRGVwbG95bWVudCA9IGF3YWl0IHN1cGVyLmRlcGxveShjbHVzdGVySW5mbyk7XHJcblxyXG4gICAgY29uc3QgY2x1c3RlciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXI7XHJcbiAgICBsZXQgdXBkYXRlU2M6IEt1YmVybmV0ZXNNYW5pZmVzdDtcclxuXHJcbiAgICBpZiAodGhpcy5lYnNQcm9wcy5zdG9yYWdlQ2xhc3MpIHtcclxuICAgICAgLy8gcGF0Y2ggcmVzb3VyY2Ugb24gY2x1c3RlclxyXG4gICAgICBjb25zdCBwYXRjaFNjID0gbmV3IEt1YmVybmV0ZXNQYXRjaChcclxuICAgICAgICBjbHVzdGVyLnN0YWNrLFxyXG4gICAgICAgIGAke2NsdXN0ZXJ9LVJlbW92ZUdQMlNDYCxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjbHVzdGVyOiBjbHVzdGVyLFxyXG4gICAgICAgICAgcmVzb3VyY2VOYW1lOiBcInN0b3JhZ2VjbGFzcy9ncDJcIixcclxuICAgICAgICAgIGFwcGx5UGF0Y2g6IHtcclxuICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICBhbm5vdGF0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgXCJzdG9yYWdlY2xhc3Mua3ViZXJuZXRlcy5pby9pcy1kZWZhdWx0LWNsYXNzXCI6IFwiZmFsc2VcIixcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHJlc3RvcmVQYXRjaDoge1xyXG4gICAgICAgICAgICBtZXRhZGF0YToge1xyXG4gICAgICAgICAgICAgIGFubm90YXRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBcInN0b3JhZ2VjbGFzcy5rdWJlcm5ldGVzLmlvL2lzLWRlZmF1bHQtY2xhc3NcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGFuZCBzZXQgZ3AzIFN0b3JhZ2VDbGFzcyBhcyBjbHVzdGVyLXdpZGUgZGVmYXVsdFxyXG4gICAgICB1cGRhdGVTYyA9IG5ldyBLdWJlcm5ldGVzTWFuaWZlc3QoXHJcbiAgICAgICAgY2x1c3Rlci5zdGFjayxcclxuICAgICAgICBgJHtjbHVzdGVyfS1TZXREZWZhdWx0U0NgLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGNsdXN0ZXI6IGNsdXN0ZXIsXHJcbiAgICAgICAgICBtYW5pZmVzdDogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgYXBpVmVyc2lvbjogXCJzdG9yYWdlLms4cy5pby92MVwiLFxyXG4gICAgICAgICAgICAgIGtpbmQ6IFwiU3RvcmFnZUNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiZ3AzXCIsXHJcbiAgICAgICAgICAgICAgICBhbm5vdGF0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgICBcInN0b3JhZ2VjbGFzcy5rdWJlcm5ldGVzLmlvL2lzLWRlZmF1bHQtY2xhc3NcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgcHJvdmlzaW9uZXI6IFwiZWJzLmNzaS5hd3MuY29tXCIsXHJcbiAgICAgICAgICAgICAgcmVjbGFpbVBvbGljeTogXCJEZWxldGVcIixcclxuICAgICAgICAgICAgICB2b2x1bWVCaW5kaW5nTW9kZTogXCJXYWl0Rm9yRmlyc3RDb25zdW1lclwiLFxyXG4gICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiZ3AzXCIsXHJcbiAgICAgICAgICAgICAgICBmc1R5cGU6IFwiZXh0NFwiLFxyXG4gICAgICAgICAgICAgICAgZW5jcnlwdGVkOiBcInRydWVcIixcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcblxyXG4gICAgICBwYXRjaFNjLm5vZGUuYWRkRGVwZW5kZW5jeShiYXNlRGVwbG95bWVudCk7XHJcbiAgICAgIHVwZGF0ZVNjLm5vZGUuYWRkRGVwZW5kZW5jeShwYXRjaFNjKTtcclxuXHJcbiAgICAgIHJldHVybiB1cGRhdGVTYztcclxuICAgIH0gZWxzZSBcclxuICAgIHtcclxuICAgICAgcmV0dXJuIGJhc2VEZXBsb3ltZW50O1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=