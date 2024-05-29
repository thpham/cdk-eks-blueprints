"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalDnsAddOn = void 0;
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const helm_addon_1 = require("../helm-addon");
const ts_deepmerge_1 = require("ts-deepmerge");
const utils_1 = require("../../utils");
const defaultProps = {
    name: 'external-dns',
    chart: 'external-dns',
    namespace: 'external-dns',
    repository: 'https://kubernetes-sigs.github.io/external-dns/',
    release: 'blueprints-addon-external-dns',
    version: '1.14.3',
    values: {},
};
/**
 * Implementation of the External DNS service: https://github.com/kubernetes-sigs/external-dns/.
 * It is required to integrate with Route53 for external DNS resolution.
 */
let ExternalDnsAddOn = class ExternalDnsAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a, _b;
        const region = clusterInfo.cluster.stack.region;
        const cluster = clusterInfo.cluster;
        const namespace = (_a = this.options.namespace) !== null && _a !== void 0 ? _a : this.options.name;
        const namespaceManifest = new aws_eks_1.KubernetesManifest(cluster.stack, `${this.props.name}-ns`, {
            cluster,
            manifest: [{
                    apiVersion: 'v1',
                    kind: 'Namespace',
                    metadata: { name: namespace },
                }],
            overwrite: true
        });
        const sa = cluster.addServiceAccount(this.props.name, { name: `${this.props.name}-sa`, namespace });
        const hostedZones = this.options.hostedZoneResources.map(e => clusterInfo.getRequiredResource(e));
        sa.addToPrincipalPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: ['route53:ChangeResourceRecordSets', 'route53:ListResourceRecordSets'],
            resources: hostedZones.map(hostedZone => hostedZone.hostedZoneArn),
        }));
        sa.addToPrincipalPolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            actions: ['route53:ListHostedZones'],
            resources: ['*'],
        }));
        sa.node.addDependency(namespaceManifest);
        // Create a --zone-id-filter arg for each hosted zone
        const zoneIdFilterArgs = hostedZones.map((hostedZone) => `--zone-id-filter=${hostedZone.hostedZoneId}`);
        let values = {
            provider: "aws",
            extraArgs: zoneIdFilterArgs,
            aws: {
                region,
            },
            serviceAccount: {
                create: false,
                name: sa.serviceAccountName,
            },
        };
        values = (0, ts_deepmerge_1.merge)(values, (_b = this.props.values) !== null && _b !== void 0 ? _b : {});
        const chart = this.addHelmChart(clusterInfo, values);
        chart.node.addDependency(namespaceManifest);
        // return the Promise Construct for any teams that may depend on this
        return Promise.resolve(chart);
    }
};
exports.ExternalDnsAddOn = ExternalDnsAddOn;
exports.ExternalDnsAddOn = ExternalDnsAddOn = __decorate([
    utils_1.supportsALL
], ExternalDnsAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2V4dGVybmFsLWRucy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxpREFBeUQ7QUFDekQsaURBQThEO0FBSTlELDhDQUE4RDtBQUM5RCwrQ0FBcUM7QUFDckMsdUNBQTBDO0FBYzFDLE1BQU0sWUFBWSxHQUFHO0lBQ2pCLElBQUksRUFBRSxjQUFjO0lBQ3BCLEtBQUssRUFBRSxjQUFjO0lBQ3JCLFNBQVMsRUFBRSxjQUFjO0lBQ3pCLFVBQVUsRUFBRSxpREFBaUQ7SUFDN0QsT0FBTyxFQUFFLCtCQUErQjtJQUN4QyxPQUFPLEVBQUUsUUFBUTtJQUNqQixNQUFNLEVBQUUsRUFBRTtDQUNiLENBQUM7QUFFRjs7O0dBR0c7QUFFSSxJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLHNCQUFTO0lBSTNDLFlBQVksS0FBdUI7UUFDL0IsS0FBSyxDQUFDLEVBQUUsR0FBRyxZQUFZLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQXlCLENBQUM7SUFDbEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUF3Qjs7UUFDM0IsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ2hELE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDcEMsTUFBTSxTQUFTLEdBQUcsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsbUNBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFFOUQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLDRCQUFrQixDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxFQUFFO1lBQ3JGLE9BQU87WUFDUCxRQUFRLEVBQUUsQ0FBQztvQkFDUCxVQUFVLEVBQUUsSUFBSTtvQkFDaEIsSUFBSSxFQUFFLFdBQVc7b0JBQ2pCLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7aUJBQ2hDLENBQUM7WUFDRixTQUFTLEVBQUUsSUFBSTtTQUNsQixDQUFDLENBQUM7UUFFSCxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFFcEcsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUvRyxFQUFFLENBQUMsb0JBQW9CLENBQ25CLElBQUkseUJBQWUsQ0FBQztZQUNoQixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLO1lBQ3BCLE9BQU8sRUFBRSxDQUFDLGtDQUFrQyxFQUFFLGdDQUFnQyxDQUFDO1lBQy9FLFNBQVMsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVyxDQUFDLGFBQWEsQ0FBQztTQUN0RSxDQUFDLENBQ0wsQ0FBQztRQUVGLEVBQUUsQ0FBQyxvQkFBb0IsQ0FDbkIsSUFBSSx5QkFBZSxDQUFDO1lBQ2hCLE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7WUFDcEIsT0FBTyxFQUFFLENBQUMseUJBQXlCLENBQUM7WUFDcEMsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ25CLENBQUMsQ0FDTCxDQUFDO1FBRUYsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUV6QyxxREFBcUQ7UUFDckQsTUFBTSxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxvQkFBb0IsVUFBVyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7UUFFekcsSUFBSSxNQUFNLEdBQVc7WUFDakIsUUFBUSxFQUFFLEtBQUs7WUFDZixTQUFTLEVBQUUsZ0JBQWdCO1lBQzNCLEdBQUcsRUFBRTtnQkFDSCxNQUFNO2FBQ1A7WUFDRCxjQUFjLEVBQUU7Z0JBQ2QsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsSUFBSSxFQUFFLEVBQUUsQ0FBQyxrQkFBa0I7YUFDNUI7U0FDSixDQUFDO1FBRUYsTUFBTSxHQUFHLElBQUEsb0JBQUssRUFBQyxNQUFNLEVBQUUsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sbUNBQUksRUFBRSxDQUFDLENBQUM7UUFDaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFckQsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM1QyxxRUFBcUU7UUFDckUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDSixDQUFBO0FBcEVZLDRDQUFnQjsyQkFBaEIsZ0JBQWdCO0lBRDVCLG1CQUFXO0dBQ0MsZ0JBQWdCLENBb0U1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEt1YmVybmV0ZXNNYW5pZmVzdCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xuaW1wb3J0IHsgRWZmZWN0LCBQb2xpY3lTdGF0ZW1lbnQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IElIb3N0ZWRab25lIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IENsdXN0ZXJJbmZvLCBWYWx1ZXMgfSBmcm9tICcuLi8uLi9zcGknO1xuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Vc2VyUHJvcHMgfSBmcm9tICcuLi9oZWxtLWFkZG9uJztcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSBcInRzLWRlZXBtZXJnZVwiO1xuaW1wb3J0IHsgc3VwcG9ydHNBTEwgfSBmcm9tICcuLi8uLi91dGlscyc7XG5cblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBleHRlcm5hbCBETlMgYWRkLW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVybmFsRG5zUHJvcHMgZXh0ZW5kcyBIZWxtQWRkT25Vc2VyUHJvcHMge1xuICAgIC8qKlxuICAgICAqIE5hbWVzIG9mIGhvc3RlZCB6b25lIHByb3ZpZGVyIG5hbWVkIHJlc291cmNlcyAoQHNlZSBMb29rdXBIb3N0ZWRab25lUHJvdmlkZXIpIGZvciBleHRlcm5hbCBETlMuXG4gICAgICogSG9zdGVkIHpvbmUgcHJvdmlkZXJzIGFyZSByZWdpc3RlcmVkIGFzIG5hbWVkIHJlc291cmNlIHByb3ZpZGVycyB3aXRoIHRoZSBFa3NCbHVlcHJpbnRQcm9wcy5cbiAgICAgKi9cbiAgICByZWFkb25seSBob3N0ZWRab25lUmVzb3VyY2VzOiBzdHJpbmdbXTtcbn1cblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICAgIG5hbWU6ICdleHRlcm5hbC1kbnMnLFxuICAgIGNoYXJ0OiAnZXh0ZXJuYWwtZG5zJyxcbiAgICBuYW1lc3BhY2U6ICdleHRlcm5hbC1kbnMnLFxuICAgIHJlcG9zaXRvcnk6ICdodHRwczovL2t1YmVybmV0ZXMtc2lncy5naXRodWIuaW8vZXh0ZXJuYWwtZG5zLycsXG4gICAgcmVsZWFzZTogJ2JsdWVwcmludHMtYWRkb24tZXh0ZXJuYWwtZG5zJyxcbiAgICB2ZXJzaW9uOiAnMS4xNC4zJyxcbiAgICB2YWx1ZXM6IHt9LFxufTtcblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgRXh0ZXJuYWwgRE5TIHNlcnZpY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9rdWJlcm5ldGVzLXNpZ3MvZXh0ZXJuYWwtZG5zLy5cbiAqIEl0IGlzIHJlcXVpcmVkIHRvIGludGVncmF0ZSB3aXRoIFJvdXRlNTMgZm9yIGV4dGVybmFsIEROUyByZXNvbHV0aW9uLiBcbiAqL1xuQHN1cHBvcnRzQUxMXG5leHBvcnQgY2xhc3MgRXh0ZXJuYWxEbnNBZGRPbiBleHRlbmRzIEhlbG1BZGRPbiB7XG5cbiAgICBwcml2YXRlIG9wdGlvbnM6IEV4dGVybmFsRG5zUHJvcHM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogRXh0ZXJuYWxEbnNQcm9wcykge1xuICAgICAgICBzdXBlcih7IC4uLmRlZmF1bHRQcm9wcywgLi4ucHJvcHMgfSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHRoaXMucHJvcHMgYXMgRXh0ZXJuYWxEbnNQcm9wcztcbiAgICB9XG5cbiAgICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogUHJvbWlzZTxDb25zdHJ1Y3Q+IHtcbiAgICAgICAgY29uc3QgcmVnaW9uID0gY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjay5yZWdpb247XG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuICAgICAgICBjb25zdCBuYW1lc3BhY2UgPSB0aGlzLm9wdGlvbnMubmFtZXNwYWNlID8/IHRoaXMub3B0aW9ucy5uYW1lO1xuXG4gICAgICAgIGNvbnN0IG5hbWVzcGFjZU1hbmlmZXN0ID0gbmV3IEt1YmVybmV0ZXNNYW5pZmVzdChjbHVzdGVyLnN0YWNrLCBgJHt0aGlzLnByb3BzLm5hbWV9LW5zYCwge1xuICAgICAgICAgICAgY2x1c3RlcixcbiAgICAgICAgICAgIG1hbmlmZXN0OiBbe1xuICAgICAgICAgICAgICAgIGFwaVZlcnNpb246ICd2MScsXG4gICAgICAgICAgICAgICAga2luZDogJ05hbWVzcGFjZScsXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHsgbmFtZTogbmFtZXNwYWNlIH0sXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIG92ZXJ3cml0ZTogdHJ1ZVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBzYSA9IGNsdXN0ZXIuYWRkU2VydmljZUFjY291bnQodGhpcy5wcm9wcy5uYW1lLCB7IG5hbWU6IGAke3RoaXMucHJvcHMubmFtZX0tc2FgLCBuYW1lc3BhY2UgfSk7XG5cbiAgICAgICAgY29uc3QgaG9zdGVkWm9uZXMgPSB0aGlzLm9wdGlvbnMuaG9zdGVkWm9uZVJlc291cmNlcy5tYXAoZSA9PiBjbHVzdGVySW5mby5nZXRSZXF1aXJlZFJlc291cmNlPElIb3N0ZWRab25lPihlKSk7XG5cbiAgICAgICAgc2EuYWRkVG9QcmluY2lwYWxQb2xpY3koXG4gICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbJ3JvdXRlNTM6Q2hhbmdlUmVzb3VyY2VSZWNvcmRTZXRzJywgJ3JvdXRlNTM6TGlzdFJlc291cmNlUmVjb3JkU2V0cyddLFxuICAgICAgICAgICAgICAgIHJlc291cmNlczogaG9zdGVkWm9uZXMubWFwKGhvc3RlZFpvbmUgPT4gaG9zdGVkWm9uZSEuaG9zdGVkWm9uZUFybiksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKTtcblxuICAgICAgICBzYS5hZGRUb1ByaW5jaXBhbFBvbGljeShcbiAgICAgICAgICAgIG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFsncm91dGU1MzpMaXN0SG9zdGVkWm9uZXMnXSxcbiAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICk7XG5cbiAgICAgICAgc2Eubm9kZS5hZGREZXBlbmRlbmN5KG5hbWVzcGFjZU1hbmlmZXN0KTtcblxuICAgICAgICAvLyBDcmVhdGUgYSAtLXpvbmUtaWQtZmlsdGVyIGFyZyBmb3IgZWFjaCBob3N0ZWQgem9uZVxuICAgICAgICBjb25zdCB6b25lSWRGaWx0ZXJBcmdzID0gaG9zdGVkWm9uZXMubWFwKChob3N0ZWRab25lKSA9PiBgLS16b25lLWlkLWZpbHRlcj0ke2hvc3RlZFpvbmUhLmhvc3RlZFpvbmVJZH1gKTtcblxuICAgICAgICBsZXQgdmFsdWVzOiBWYWx1ZXMgPSB7XG4gICAgICAgICAgICBwcm92aWRlcjogXCJhd3NcIixcbiAgICAgICAgICAgIGV4dHJhQXJnczogem9uZUlkRmlsdGVyQXJncyxcbiAgICAgICAgICAgIGF3czoge1xuICAgICAgICAgICAgICByZWdpb24sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2VydmljZUFjY291bnQ6IHtcbiAgICAgICAgICAgICAgY3JlYXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgbmFtZTogc2Euc2VydmljZUFjY291bnROYW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcblxuICAgICAgICB2YWx1ZXMgPSBtZXJnZSh2YWx1ZXMsIHRoaXMucHJvcHMudmFsdWVzID8/IHt9KTtcbiAgICAgICAgY29uc3QgY2hhcnQgPSB0aGlzLmFkZEhlbG1DaGFydChjbHVzdGVySW5mbywgdmFsdWVzKTtcblxuICAgICAgICBjaGFydC5ub2RlLmFkZERlcGVuZGVuY3kobmFtZXNwYWNlTWFuaWZlc3QpO1xuICAgICAgICAvLyByZXR1cm4gdGhlIFByb21pc2UgQ29uc3RydWN0IGZvciBhbnkgdGVhbXMgdGhhdCBtYXkgZGVwZW5kIG9uIHRoaXNcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFydCk7XG4gICAgfVxufVxuIl19