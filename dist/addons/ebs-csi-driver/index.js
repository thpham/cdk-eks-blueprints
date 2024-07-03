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
    [aws_eks_1.KubernetesVersion.V1_30, "v1.31.0-eksbuild.1"],
    [aws_eks_1.KubernetesVersion.V1_29, "v1.31.0-eksbuild.1"],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2Vicy1jc2ktZHJpdmVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUdBLDhDQUEwRDtBQUMxRCw2Q0FBMEQ7QUFDMUQsdUNBQTBDO0FBQzFDLGlEQUF3RDtBQUV4RCxpREFBMEU7QUFFMUUsK0VBQStFO0FBQy9FLE1BQU0sVUFBVSxHQUFtQyxJQUFJLEdBQUcsQ0FBQztJQUN2RCxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQztJQUMvQyxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQztJQUMvQyxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQztJQUMvQyxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQztJQUMvQyxDQUFDLDJCQUFpQixDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQztDQUNsRCxDQUFDLENBQUM7QUFvQkg7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBNEM7SUFDNUQsU0FBUyxFQUFFLG9CQUFvQjtJQUMvQixPQUFPLEVBQUUsTUFBTTtJQUNmLFVBQVUsRUFBRSxVQUFVO0lBQ3RCLE1BQU0sRUFBRSx1QkFBdUI7SUFDL0IsWUFBWSxFQUFFLEtBQUssRUFBRSxzQ0FBc0M7Q0FDNUQsQ0FBQztBQUVGOztHQUVHO0FBRUksSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBa0IsU0FBUSxzQkFBUztJQUc5QyxZQUFxQixPQUFnQzs7UUFDbkQsS0FBSyxDQUFDO1lBQ0osU0FBUyxFQUFFLFlBQVksQ0FBQyxTQUFTO1lBQ2pDLE9BQU8sRUFBRSxNQUFBLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxPQUFPLG1DQUFJLFlBQVksQ0FBQyxPQUFPO1lBQ2pELFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVTtZQUNuQyxNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDM0IsbUJBQW1CLEVBQUUsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLG1CQUFtQjtTQUNsRCxDQUFDLENBQUM7UUFQZ0IsWUFBTyxHQUFQLE9BQU8sQ0FBeUI7UUFTbkQsSUFBSSxDQUFDLFFBQVEsR0FBRztZQUNkLEdBQUcsWUFBWTtZQUNmLEdBQUcsT0FBTztTQUNYLENBQUM7SUFDSixDQUFDO0lBRUQscUJBQXFCLENBQUMsV0FBd0I7O1FBQzVDLE9BQU8sSUFBQSx1Q0FBMEIsRUFDL0IsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUNuQyxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLE9BQU8sQ0FDdEIsQ0FBQztJQUNKLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQXdCO1FBQ25DLE1BQU0sY0FBYyxHQUFHLE1BQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV2RCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3BDLElBQUksUUFBNEIsQ0FBQztRQUVqQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDL0IsNEJBQTRCO1lBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUkseUJBQWUsQ0FDakMsT0FBTyxDQUFDLEtBQUssRUFDYixHQUFHLE9BQU8sY0FBYyxFQUN4QjtnQkFDRSxPQUFPLEVBQUUsT0FBTztnQkFDaEIsWUFBWSxFQUFFLGtCQUFrQjtnQkFDaEMsVUFBVSxFQUFFO29CQUNWLFFBQVEsRUFBRTt3QkFDUixXQUFXLEVBQUU7NEJBQ1gsNkNBQTZDLEVBQUUsT0FBTzt5QkFDdkQ7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsWUFBWSxFQUFFO29CQUNaLFFBQVEsRUFBRTt3QkFDUixXQUFXLEVBQUU7NEJBQ1gsNkNBQTZDLEVBQUUsTUFBTTt5QkFDdEQ7cUJBQ0Y7aUJBQ0Y7YUFDRixDQUNGLENBQUM7WUFFRiwwREFBMEQ7WUFDMUQsUUFBUSxHQUFHLElBQUksNEJBQWtCLENBQy9CLE9BQU8sQ0FBQyxLQUFLLEVBQ2IsR0FBRyxPQUFPLGVBQWUsRUFDekI7Z0JBQ0UsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLFFBQVEsRUFBRTtvQkFDUjt3QkFDRSxVQUFVLEVBQUUsbUJBQW1CO3dCQUMvQixJQUFJLEVBQUUsY0FBYzt3QkFDcEIsUUFBUSxFQUFFOzRCQUNSLElBQUksRUFBRSxLQUFLOzRCQUNYLFdBQVcsRUFBRTtnQ0FDWCw2Q0FBNkMsRUFBRSxNQUFNOzZCQUN0RDt5QkFDRjt3QkFDRCxXQUFXLEVBQUUsaUJBQWlCO3dCQUM5QixhQUFhLEVBQUUsUUFBUTt3QkFDdkIsaUJBQWlCLEVBQUUsc0JBQXNCO3dCQUN6QyxVQUFVLEVBQUU7NEJBQ1YsSUFBSSxFQUFFLEtBQUs7NEJBQ1gsTUFBTSxFQUFFLE1BQU07NEJBQ2QsU0FBUyxFQUFFLE1BQU07eUJBQ2xCO3FCQUNGO2lCQUNGO2FBQ0YsQ0FDRixDQUFDO1lBRUYsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDM0MsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFckMsT0FBTyxRQUFRLENBQUM7UUFDbEIsQ0FBQzthQUNELENBQUM7WUFDQyxPQUFPLGNBQWMsQ0FBQztRQUN4QixDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUE7QUE5RlksOENBQWlCOzRCQUFqQixpQkFBaUI7SUFEN0IsbUJBQVc7R0FDQyxpQkFBaUIsQ0E4RjdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUG9saWN5RG9jdW1lbnQgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xyXG5pbXBvcnQgKiBhcyBrbXMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1rbXNcIjtcclxuaW1wb3J0IHsgQ2x1c3RlckluZm8gfSBmcm9tIFwiLi4vLi4vc3BpXCI7XHJcbmltcG9ydCB7IENvcmVBZGRPbiwgQ29yZUFkZE9uUHJvcHMgfSBmcm9tIFwiLi4vY29yZS1hZGRvblwiO1xyXG5pbXBvcnQgeyBnZXRFYnNEcml2ZXJQb2xpY3lEb2N1bWVudCB9IGZyb20gXCIuL2lhbS1wb2xpY3lcIjtcclxuaW1wb3J0IHsgc3VwcG9ydHNBTEwgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcclxuaW1wb3J0IHsgS3ViZXJuZXRlc1ZlcnNpb24gfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xyXG5pbXBvcnQgeyBLdWJlcm5ldGVzTWFuaWZlc3QsIEt1YmVybmV0ZXNQYXRjaCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XHJcblxyXG4vKiBWZXJzaW9NYXAgc2hvd2luZyB0aGUgZGVmYXVsdCB2ZXJzaW9uIGZvciA0IHN1cHBvcnRlZCBLdWJlcm5ldGVzIHZlcnNpb25zICovXHJcbmNvbnN0IHZlcnNpb25NYXA6IE1hcDxLdWJlcm5ldGVzVmVyc2lvbiwgc3RyaW5nPiA9IG5ldyBNYXAoW1xyXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzMwLCBcInYxLjMxLjAtZWtzYnVpbGQuMVwiXSxcclxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yOSwgXCJ2MS4zMS4wLWVrc2J1aWxkLjFcIl0sXHJcbiAgICBbS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjgsIFwidjEuMjguMC1la3NidWlsZC4xXCJdLFxyXG4gICAgW0t1YmVybmV0ZXNWZXJzaW9uLlYxXzI3LCBcInYxLjI4LjAtZWtzYnVpbGQuMVwiXSxcclxuICAgIFtLdWJlcm5ldGVzVmVyc2lvbi5WMV8yNiwgXCJ2MS4yOC4wLWVrc2J1aWxkLjFcIl1cclxuXSk7XHJcblxyXG4vKipcclxuICogSW50ZXJmYWNlIGZvciBFQlMgQ1NJIERyaXZlciBFS1MgYWRkLW9uIG9wdGlvbnNcclxuICovXHJcbmV4cG9ydCB0eXBlIEVic0NzaURyaXZlckFkZE9uUHJvcHMgPSBPbWl0PENvcmVBZGRPblByb3BzLCBcInBvbGljeURvY3VtZW50UHJvdmlkZXJcIiB8IFwic2FOYW1lXCIgfCBcImFkZE9uTmFtZVwiIHwgXCJjb250cm9sUGxhbmVBZGRPblwiIHwgXCJuYW1lc3BhY2VcIiB8IFwidmVyc2lvbk1hcFwiIHwgXCJ2ZXJzaW9uXCI+ICYge1xyXG4gIC8qKlxyXG4gICAqIExpc3Qgb2YgS01TIGtleXMgdG8gYmUgdXNlZCBmb3IgZW5jcnlwdGlvblxyXG4gICAqL1xyXG4gIGttc0tleXM/OiBrbXMuS2V5W107XHJcbiAgLyoqXHJcbiAgICogU3RvcmFnZUNsYXNzIHRvIGJlIHVzZWQgZm9yIHRoZSBhZGRvblxyXG4gICAqL1xyXG4gIHN0b3JhZ2VDbGFzcz86IHN0cmluZztcclxuICAvKipcclxuICAgKiBWZXJzaW9uIG9mIHRoZSBFQlMgQ1NJIGRyaXZlciB0byBiZSB1c2VkXHJcbiAgICovXHJcbiAgdmVyc2lvbj86IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIERlZmF1bHQgdmFsdWVzIGZvciB0aGUgYWRkLW9uXHJcbiAqL1xyXG5jb25zdCBkZWZhdWx0UHJvcHM6IENvcmVBZGRPblByb3BzICYgRWJzQ3NpRHJpdmVyQWRkT25Qcm9wcyA9IHtcclxuICBhZGRPbk5hbWU6IFwiYXdzLWVicy1jc2ktZHJpdmVyXCIsXHJcbiAgdmVyc2lvbjogXCJhdXRvXCIsXHJcbiAgdmVyc2lvbk1hcDogdmVyc2lvbk1hcCxcclxuICBzYU5hbWU6IFwiZWJzLWNzaS1jb250cm9sbGVyLXNhXCIsXHJcbiAgc3RvcmFnZUNsYXNzOiBcImdwM1wiLCAvLyBTZXQgdGhlIGRlZmF1bHQgU3RvcmFnZUNsYXNzIHRvIGdwM1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEltcGxlbWVudGF0aW9uIG9mIEVCUyBDU0kgRHJpdmVyIEVLUyBhZGQtb25cclxuICovXHJcbkBzdXBwb3J0c0FMTFxyXG5leHBvcnQgY2xhc3MgRWJzQ3NpRHJpdmVyQWRkT24gZXh0ZW5kcyBDb3JlQWRkT24ge1xyXG4gIHJlYWRvbmx5IGVic1Byb3BzOiBFYnNDc2lEcml2ZXJBZGRPblByb3BzO1xyXG5cclxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBvcHRpb25zPzogRWJzQ3NpRHJpdmVyQWRkT25Qcm9wcykge1xyXG4gICAgc3VwZXIoe1xyXG4gICAgICBhZGRPbk5hbWU6IGRlZmF1bHRQcm9wcy5hZGRPbk5hbWUsXHJcbiAgICAgIHZlcnNpb246IG9wdGlvbnM/LnZlcnNpb24gPz8gZGVmYXVsdFByb3BzLnZlcnNpb24sXHJcbiAgICAgIHZlcnNpb25NYXA6IGRlZmF1bHRQcm9wcy52ZXJzaW9uTWFwLFxyXG4gICAgICBzYU5hbWU6IGRlZmF1bHRQcm9wcy5zYU5hbWUsXHJcbiAgICAgIGNvbmZpZ3VyYXRpb25WYWx1ZXM6IG9wdGlvbnM/LmNvbmZpZ3VyYXRpb25WYWx1ZXMsXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLmVic1Byb3BzID0ge1xyXG4gICAgICAuLi5kZWZhdWx0UHJvcHMsXHJcbiAgICAgIC4uLm9wdGlvbnMsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHJvdmlkZVBvbGljeURvY3VtZW50KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFBvbGljeURvY3VtZW50IHtcclxuICAgIHJldHVybiBnZXRFYnNEcml2ZXJQb2xpY3lEb2N1bWVudChcclxuICAgICAgY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjay5wYXJ0aXRpb24sXHJcbiAgICAgIHRoaXMub3B0aW9ucz8ua21zS2V5c1xyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xyXG4gICAgY29uc3QgYmFzZURlcGxveW1lbnQgPSBhd2FpdCBzdXBlci5kZXBsb3koY2x1c3RlckluZm8pO1xyXG5cclxuICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xyXG4gICAgbGV0IHVwZGF0ZVNjOiBLdWJlcm5ldGVzTWFuaWZlc3Q7XHJcblxyXG4gICAgaWYgKHRoaXMuZWJzUHJvcHMuc3RvcmFnZUNsYXNzKSB7XHJcbiAgICAgIC8vIHBhdGNoIHJlc291cmNlIG9uIGNsdXN0ZXJcclxuICAgICAgY29uc3QgcGF0Y2hTYyA9IG5ldyBLdWJlcm5ldGVzUGF0Y2goXHJcbiAgICAgICAgY2x1c3Rlci5zdGFjayxcclxuICAgICAgICBgJHtjbHVzdGVyfS1SZW1vdmVHUDJTQ2AsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY2x1c3RlcjogY2x1c3RlcixcclxuICAgICAgICAgIHJlc291cmNlTmFtZTogXCJzdG9yYWdlY2xhc3MvZ3AyXCIsXHJcbiAgICAgICAgICBhcHBseVBhdGNoOiB7XHJcbiAgICAgICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIFwic3RvcmFnZWNsYXNzLmt1YmVybmV0ZXMuaW8vaXMtZGVmYXVsdC1jbGFzc1wiOiBcImZhbHNlXCIsXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICByZXN0b3JlUGF0Y2g6IHtcclxuICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICBhbm5vdGF0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgXCJzdG9yYWdlY2xhc3Mua3ViZXJuZXRlcy5pby9pcy1kZWZhdWx0LWNsYXNzXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSBhbmQgc2V0IGdwMyBTdG9yYWdlQ2xhc3MgYXMgY2x1c3Rlci13aWRlIGRlZmF1bHRcclxuICAgICAgdXBkYXRlU2MgPSBuZXcgS3ViZXJuZXRlc01hbmlmZXN0KFxyXG4gICAgICAgIGNsdXN0ZXIuc3RhY2ssXHJcbiAgICAgICAgYCR7Y2x1c3Rlcn0tU2V0RGVmYXVsdFNDYCxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjbHVzdGVyOiBjbHVzdGVyLFxyXG4gICAgICAgICAgbWFuaWZlc3Q6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGFwaVZlcnNpb246IFwic3RvcmFnZS5rOHMuaW8vdjFcIixcclxuICAgICAgICAgICAgICBraW5kOiBcIlN0b3JhZ2VDbGFzc1wiLFxyXG4gICAgICAgICAgICAgIG1ldGFkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBcImdwM1wiLFxyXG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgICAgXCJzdG9yYWdlY2xhc3Mua3ViZXJuZXRlcy5pby9pcy1kZWZhdWx0LWNsYXNzXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHByb3Zpc2lvbmVyOiBcImVicy5jc2kuYXdzLmNvbVwiLFxyXG4gICAgICAgICAgICAgIHJlY2xhaW1Qb2xpY3k6IFwiRGVsZXRlXCIsXHJcbiAgICAgICAgICAgICAgdm9sdW1lQmluZGluZ01vZGU6IFwiV2FpdEZvckZpcnN0Q29uc3VtZXJcIixcclxuICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcImdwM1wiLFxyXG4gICAgICAgICAgICAgICAgZnNUeXBlOiBcImV4dDRcIixcclxuICAgICAgICAgICAgICAgIGVuY3J5cHRlZDogXCJ0cnVlXCIsXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG5cclxuICAgICAgcGF0Y2hTYy5ub2RlLmFkZERlcGVuZGVuY3koYmFzZURlcGxveW1lbnQpO1xyXG4gICAgICB1cGRhdGVTYy5ub2RlLmFkZERlcGVuZGVuY3kocGF0Y2hTYyk7XHJcblxyXG4gICAgICByZXR1cm4gdXBkYXRlU2M7XHJcbiAgICB9IGVsc2UgXHJcbiAgICB7XHJcbiAgICAgIHJldHVybiBiYXNlRGVwbG95bWVudDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19