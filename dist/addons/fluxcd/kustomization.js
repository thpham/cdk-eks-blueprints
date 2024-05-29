"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxKustomization = void 0;
const utils_1 = require("../../utils");
/**
 * Flux Kustomization API defines a pipeline for fetching, decrypting, building, validating and applying Kustomize overlays or plain Kubernetes manifests.
 */
class FluxKustomization {
    constructor() { }
    generate(name, repoName, namespace, fluxSyncInterval, fluxPrune, fluxTimeout, values, fluxKustomizationPath, fluxTargetNamespace) {
        const kustomizationManifest = {
            apiVersion: "kustomize.toolkit.fluxcd.io/v1beta2",
            kind: "Kustomization",
            metadata: {
                name,
                namespace
            },
            spec: {
                interval: fluxSyncInterval,
                sourceRef: {
                    kind: "GitRepository",
                    name: repoName
                },
                path: fluxKustomizationPath,
                prune: fluxPrune,
                timeout: fluxTimeout
            }
        };
        if (values) {
            (0, utils_1.setPath)(kustomizationManifest, "spec.postBuild.substitute", values);
        }
        if (fluxTargetNamespace) {
            (0, utils_1.setPath)(kustomizationManifest, "spec.targetNamespace", fluxTargetNamespace);
        }
        return kustomizationManifest;
    }
}
exports.FluxKustomization = FluxKustomization;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3VzdG9taXphdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9hZGRvbnMvZmx1eGNkL2t1c3RvbWl6YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQXNDO0FBR3RDOztHQUVHO0FBQ0gsTUFBYSxpQkFBaUI7SUFFMUIsZ0JBQWUsQ0FBQztJQUVULFFBQVEsQ0FBQyxJQUFZLEVBQUUsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLGdCQUF3QixFQUFFLFNBQWtCLEVBQUUsV0FBbUIsRUFBRSxNQUFrQixFQUFFLHFCQUE2QixFQUFFLG1CQUE0QjtRQUVqTixNQUFNLHFCQUFxQixHQUFHO1lBQzFCLFVBQVUsRUFBRSxxQ0FBcUM7WUFDakQsSUFBSSxFQUFFLGVBQWU7WUFDckIsUUFBUSxFQUFFO2dCQUNOLElBQUk7Z0JBQ0osU0FBUzthQUNaO1lBQ0QsSUFBSSxFQUFFO2dCQUNGLFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLFNBQVMsRUFBRTtvQkFDUCxJQUFJLEVBQUUsZUFBZTtvQkFDckIsSUFBSSxFQUFFLFFBQVE7aUJBQ2pCO2dCQUNELElBQUksRUFBRSxxQkFBcUI7Z0JBQzNCLEtBQUssRUFBRSxTQUFTO2dCQUNoQixPQUFPLEVBQUUsV0FBVzthQUN2QjtTQUNKLENBQUM7UUFDRixJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1QsSUFBQSxlQUFPLEVBQUMscUJBQXFCLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUNELElBQUksbUJBQW1CLEVBQUUsQ0FBQztZQUN0QixJQUFBLGVBQU8sRUFBQyxxQkFBcUIsRUFBRSxzQkFBc0IsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFDRCxPQUFPLHFCQUFxQixDQUFDO0lBQ2pDLENBQUM7Q0FDSjtBQWhDRCw4Q0FnQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzZXRQYXRoIH0gZnJvbSBcIi4uLy4uL3V0aWxzXCI7XG5pbXBvcnQgKiBhcyBzcGkgZnJvbSBcIi4uLy4uL3NwaVwiO1xuXG4vKipcbiAqIEZsdXggS3VzdG9taXphdGlvbiBBUEkgZGVmaW5lcyBhIHBpcGVsaW5lIGZvciBmZXRjaGluZywgZGVjcnlwdGluZywgYnVpbGRpbmcsIHZhbGlkYXRpbmcgYW5kIGFwcGx5aW5nIEt1c3RvbWl6ZSBvdmVybGF5cyBvciBwbGFpbiBLdWJlcm5ldGVzIG1hbmlmZXN0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIEZsdXhLdXN0b21pemF0aW9uIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIHB1YmxpYyBnZW5lcmF0ZShuYW1lOiBzdHJpbmcsIHJlcG9OYW1lOiBzdHJpbmcsIG5hbWVzcGFjZTogc3RyaW5nLCBmbHV4U3luY0ludGVydmFsOiBzdHJpbmcsIGZsdXhQcnVuZTogYm9vbGVhbiwgZmx1eFRpbWVvdXQ6IHN0cmluZywgdmFsdWVzOiBzcGkuVmFsdWVzLCBmbHV4S3VzdG9taXphdGlvblBhdGg6IHN0cmluZywgZmx1eFRhcmdldE5hbWVzcGFjZT86IHN0cmluZykge1xuICAgICAgICBcbiAgICAgICAgY29uc3Qga3VzdG9taXphdGlvbk1hbmlmZXN0ID0ge1xuICAgICAgICAgICAgYXBpVmVyc2lvbjogXCJrdXN0b21pemUudG9vbGtpdC5mbHV4Y2QuaW8vdjFiZXRhMlwiLFxuICAgICAgICAgICAga2luZDogXCJLdXN0b21pemF0aW9uXCIsXG4gICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgbmFtZXNwYWNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3BlYzoge1xuICAgICAgICAgICAgICAgIGludGVydmFsOiBmbHV4U3luY0ludGVydmFsLFxuICAgICAgICAgICAgICAgIHNvdXJjZVJlZjoge1xuICAgICAgICAgICAgICAgICAgICBraW5kOiBcIkdpdFJlcG9zaXRvcnlcIixcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcmVwb05hbWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhdGg6IGZsdXhLdXN0b21pemF0aW9uUGF0aCxcbiAgICAgICAgICAgICAgICBwcnVuZTogZmx1eFBydW5lLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IGZsdXhUaW1lb3V0XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIHNldFBhdGgoa3VzdG9taXphdGlvbk1hbmlmZXN0LCBcInNwZWMucG9zdEJ1aWxkLnN1YnN0aXR1dGVcIiwgdmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmx1eFRhcmdldE5hbWVzcGFjZSkge1xuICAgICAgICAgICAgc2V0UGF0aChrdXN0b21pemF0aW9uTWFuaWZlc3QsIFwic3BlYy50YXJnZXROYW1lc3BhY2VcIiwgZmx1eFRhcmdldE5hbWVzcGFjZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGt1c3RvbWl6YXRpb25NYW5pZmVzdDtcbiAgICB9XG59XG4iXX0=