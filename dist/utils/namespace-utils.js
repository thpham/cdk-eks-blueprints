"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNamespace = createNamespace;
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
/**
  * Creates namespace
  * (a prerequisite for serviceaccount and helm chart execution for many add-ons).
  * @param name
  * @param cluster
  * @param overwrite
  * @param prune
  * @returns KubernetesManifest
  */
function createNamespace(name, cluster, overwrite, prune, annotations, labels) {
    return new aws_eks_1.KubernetesManifest(cluster.stack, `${name}-namespace-struct`, {
        cluster: cluster,
        manifest: [{
                apiVersion: 'v1',
                kind: 'Namespace',
                metadata: {
                    name: name,
                    annotations,
                    labels
                }
            }],
        overwrite: overwrite !== null && overwrite !== void 0 ? overwrite : true,
        prune: prune !== null && prune !== void 0 ? prune : true
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmFtZXNwYWNlLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3V0aWxzL25hbWVzcGFjZS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWFBLDBDQWVDO0FBNUJELGlEQUF5RDtBQUl6RDs7Ozs7Ozs7SUFRSTtBQUNKLFNBQWdCLGVBQWUsQ0FBQyxJQUFZLEVBQUUsT0FBcUIsRUFBRSxTQUFtQixFQUFFLEtBQWUsRUFBRSxXQUFvQixFQUFFLE1BQWdCO0lBQzdJLE9BQU8sSUFBSSw0QkFBa0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxtQkFBbUIsRUFBRTtRQUNyRSxPQUFPLEVBQUUsT0FBTztRQUNoQixRQUFRLEVBQUUsQ0FBQztnQkFDUCxVQUFVLEVBQUUsSUFBSTtnQkFDaEIsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLFFBQVEsRUFBRTtvQkFDTixJQUFJLEVBQUUsSUFBSTtvQkFDVixXQUFXO29CQUNYLE1BQU07aUJBQ1Q7YUFDSixDQUFDO1FBQ0YsU0FBUyxFQUFFLFNBQVMsYUFBVCxTQUFTLGNBQVQsU0FBUyxHQUFJLElBQUk7UUFDNUIsS0FBSyxFQUFFLEtBQUssYUFBTCxLQUFLLGNBQUwsS0FBSyxHQUFJLElBQUk7S0FDdkIsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEt1YmVybmV0ZXNNYW5pZmVzdCB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5pbXBvcnQgKiBhcyBla3MgZnJvbSBcImF3cy1jZGstbGliL2F3cy1la3NcIjtcbmltcG9ydCB7IFZhbHVlcyB9IGZyb20gXCIuLi9zcGlcIjtcblxuLyoqXG4gICogQ3JlYXRlcyBuYW1lc3BhY2VcbiAgKiAoYSBwcmVyZXF1aXNpdGUgZm9yIHNlcnZpY2VhY2NvdW50IGFuZCBoZWxtIGNoYXJ0IGV4ZWN1dGlvbiBmb3IgbWFueSBhZGQtb25zKS5cbiAgKiBAcGFyYW0gbmFtZVxuICAqIEBwYXJhbSBjbHVzdGVyXG4gICogQHBhcmFtIG92ZXJ3cml0ZVxuICAqIEBwYXJhbSBwcnVuZSBcbiAgKiBAcmV0dXJucyBLdWJlcm5ldGVzTWFuaWZlc3RcbiAgKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOYW1lc3BhY2UobmFtZTogc3RyaW5nLCBjbHVzdGVyOiBla3MuSUNsdXN0ZXIsIG92ZXJ3cml0ZT86IGJvb2xlYW4sIHBydW5lPzogYm9vbGVhbiwgYW5ub3RhdGlvbnM/OiBWYWx1ZXMsIGxhYmVscz8gOiBWYWx1ZXMpIHtcbiAgICByZXR1cm4gbmV3IEt1YmVybmV0ZXNNYW5pZmVzdChjbHVzdGVyLnN0YWNrLCBgJHtuYW1lfS1uYW1lc3BhY2Utc3RydWN0YCwge1xuICAgICAgICBjbHVzdGVyOiBjbHVzdGVyLFxuICAgICAgICBtYW5pZmVzdDogW3tcbiAgICAgICAgICAgIGFwaVZlcnNpb246ICd2MScsXG4gICAgICAgICAgICBraW5kOiAnTmFtZXNwYWNlJyxcbiAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICBhbm5vdGF0aW9ucyxcbiAgICAgICAgICAgICAgICBsYWJlbHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfV0sXG4gICAgICAgIG92ZXJ3cml0ZTogb3ZlcndyaXRlID8/IHRydWUsXG4gICAgICAgIHBydW5lOiBwcnVuZSA/PyB0cnVlXG4gICAgfSk7XG59Il19