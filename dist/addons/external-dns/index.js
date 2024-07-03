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
    version: '1.14.5',
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
        const sources = this.options.sources;
        if (sources) {
            values.sources = sources;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2V4dGVybmFsLWRucy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxpREFBeUQ7QUFDekQsaURBQThEO0FBSTlELDhDQUE4RDtBQUM5RCwrQ0FBcUM7QUFDckMsdUNBQTBDO0FBa0IxQyxNQUFNLFlBQVksR0FBRztJQUNqQixJQUFJLEVBQUUsY0FBYztJQUNwQixLQUFLLEVBQUUsY0FBYztJQUNyQixTQUFTLEVBQUUsY0FBYztJQUN6QixVQUFVLEVBQUUsaURBQWlEO0lBQzdELE9BQU8sRUFBRSwrQkFBK0I7SUFDeEMsT0FBTyxFQUFFLFFBQVE7SUFDakIsTUFBTSxFQUFFLEVBQUU7Q0FDYixDQUFDO0FBRUY7OztHQUdHO0FBRUksSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSxzQkFBUztJQUkzQyxZQUFZLEtBQXVCO1FBQy9CLEtBQUssQ0FBQyxFQUFFLEdBQUcsWUFBWSxFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUF5QixDQUFDO0lBQ2xELENBQUM7SUFFRCxNQUFNLENBQUMsV0FBd0I7O1FBQzNCLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUNoRCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3BDLE1BQU0sU0FBUyxHQUFHLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLG1DQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBRTlELE1BQU0saUJBQWlCLEdBQUcsSUFBSSw0QkFBa0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssRUFBRTtZQUNyRixPQUFPO1lBQ1AsUUFBUSxFQUFFLENBQUM7b0JBQ1AsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLElBQUksRUFBRSxXQUFXO29CQUNqQixRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO2lCQUNoQyxDQUFDO1lBQ0YsU0FBUyxFQUFFLElBQUk7U0FDbEIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBRXBHLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFL0csRUFBRSxDQUFDLG9CQUFvQixDQUNuQixJQUFJLHlCQUFlLENBQUM7WUFDaEIsTUFBTSxFQUFFLGdCQUFNLENBQUMsS0FBSztZQUNwQixPQUFPLEVBQUUsQ0FBQyxrQ0FBa0MsRUFBRSxnQ0FBZ0MsQ0FBQztZQUMvRSxTQUFTLEVBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVcsQ0FBQyxhQUFhLENBQUM7U0FDdEUsQ0FBQyxDQUNMLENBQUM7UUFFRixFQUFFLENBQUMsb0JBQW9CLENBQ25CLElBQUkseUJBQWUsQ0FBQztZQUNoQixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxLQUFLO1lBQ3BCLE9BQU8sRUFBRSxDQUFDLHlCQUF5QixDQUFDO1lBQ3BDLFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQztTQUNuQixDQUFDLENBQ0wsQ0FBQztRQUVGLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFFekMscURBQXFEO1FBQ3JELE1BQU0sZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsb0JBQW9CLFVBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBRXpHLElBQUksTUFBTSxHQUFXO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1lBQ2YsU0FBUyxFQUFFLGdCQUFnQjtZQUMzQixHQUFHLEVBQUU7Z0JBQ0gsTUFBTTthQUNQO1lBQ0QsY0FBYyxFQUFFO2dCQUNkLE1BQU0sRUFBRSxLQUFLO2dCQUNiLElBQUksRUFBRSxFQUFFLENBQUMsa0JBQWtCO2FBQzVCO1NBQ0osQ0FBQztRQUVGLE1BQU0sR0FBRyxJQUFBLG9CQUFLLEVBQUMsTUFBTSxFQUFFLE1BQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLG1DQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRWhELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBRXJDLElBQUksT0FBTyxFQUFFLENBQUM7WUFDVixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUM3QixDQUFDO1FBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFckQsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM1QyxxRUFBcUU7UUFDckUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDSixDQUFBO0FBM0VZLDRDQUFnQjsyQkFBaEIsZ0JBQWdCO0lBRDVCLG1CQUFXO0dBQ0MsZ0JBQWdCLENBMkU1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEt1YmVybmV0ZXNNYW5pZmVzdCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xuaW1wb3J0IHsgRWZmZWN0LCBQb2xpY3lTdGF0ZW1lbnQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IElIb3N0ZWRab25lIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IENsdXN0ZXJJbmZvLCBWYWx1ZXMgfSBmcm9tICcuLi8uLi9zcGknO1xuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Vc2VyUHJvcHMgfSBmcm9tICcuLi9oZWxtLWFkZG9uJztcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSBcInRzLWRlZXBtZXJnZVwiO1xuaW1wb3J0IHsgc3VwcG9ydHNBTEwgfSBmcm9tICcuLi8uLi91dGlscyc7XG5cblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBleHRlcm5hbCBETlMgYWRkLW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVybmFsRG5zUHJvcHMgZXh0ZW5kcyBIZWxtQWRkT25Vc2VyUHJvcHMge1xuICAgIC8qKlxuICAgICAqIE5hbWVzIG9mIGhvc3RlZCB6b25lIHByb3ZpZGVyIG5hbWVkIHJlc291cmNlcyAoQHNlZSBMb29rdXBIb3N0ZWRab25lUHJvdmlkZXIpIGZvciBleHRlcm5hbCBETlMuXG4gICAgICogSG9zdGVkIHpvbmUgcHJvdmlkZXJzIGFyZSByZWdpc3RlcmVkIGFzIG5hbWVkIHJlc291cmNlIHByb3ZpZGVycyB3aXRoIHRoZSBFa3NCbHVlcHJpbnRQcm9wcy5cbiAgICAgKi9cbiAgICByZWFkb25seSBob3N0ZWRab25lUmVzb3VyY2VzOiBzdHJpbmdbXTtcbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIHNvdXJjZXMgdG8gd2F0Y2ggd2hlbiBzeW50aGVzaXppbmcgRE5TIHJlY29yZHMuICBJZiBlbXB0eSwgdGhlIGRlZmF1bHQgdHlwZXMgYXJlIFwic2VydmljZVwiIGFuZCBcImluZ3Jlc3NcIi5cbiAgICAgKi9cbiAgICByZWFkb25seSBzb3VyY2VzPzogc3RyaW5nW107XG59XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgICBuYW1lOiAnZXh0ZXJuYWwtZG5zJyxcbiAgICBjaGFydDogJ2V4dGVybmFsLWRucycsXG4gICAgbmFtZXNwYWNlOiAnZXh0ZXJuYWwtZG5zJyxcbiAgICByZXBvc2l0b3J5OiAnaHR0cHM6Ly9rdWJlcm5ldGVzLXNpZ3MuZ2l0aHViLmlvL2V4dGVybmFsLWRucy8nLFxuICAgIHJlbGVhc2U6ICdibHVlcHJpbnRzLWFkZG9uLWV4dGVybmFsLWRucycsXG4gICAgdmVyc2lvbjogJzEuMTQuNScsXG4gICAgdmFsdWVzOiB7fSxcbn07XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgdGhlIEV4dGVybmFsIEROUyBzZXJ2aWNlOiBodHRwczovL2dpdGh1Yi5jb20va3ViZXJuZXRlcy1zaWdzL2V4dGVybmFsLWRucy8uXG4gKiBJdCBpcyByZXF1aXJlZCB0byBpbnRlZ3JhdGUgd2l0aCBSb3V0ZTUzIGZvciBleHRlcm5hbCBETlMgcmVzb2x1dGlvbi4gXG4gKi9cbkBzdXBwb3J0c0FMTFxuZXhwb3J0IGNsYXNzIEV4dGVybmFsRG5zQWRkT24gZXh0ZW5kcyBIZWxtQWRkT24ge1xuXG4gICAgcHJpdmF0ZSBvcHRpb25zOiBFeHRlcm5hbERuc1Byb3BzO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IEV4dGVybmFsRG5zUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoeyAuLi5kZWZhdWx0UHJvcHMsIC4uLnByb3BzIH0pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzIGFzIEV4dGVybmFsRG5zUHJvcHM7XG4gICAgfVxuXG4gICAgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFByb21pc2U8Q29uc3RydWN0PiB7XG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2sucmVnaW9uO1xuICAgICAgICBjb25zdCBjbHVzdGVyID0gY2x1c3RlckluZm8uY2x1c3RlcjtcbiAgICAgICAgY29uc3QgbmFtZXNwYWNlID0gdGhpcy5vcHRpb25zLm5hbWVzcGFjZSA/PyB0aGlzLm9wdGlvbnMubmFtZTtcblxuICAgICAgICBjb25zdCBuYW1lc3BhY2VNYW5pZmVzdCA9IG5ldyBLdWJlcm5ldGVzTWFuaWZlc3QoY2x1c3Rlci5zdGFjaywgYCR7dGhpcy5wcm9wcy5uYW1lfS1uc2AsIHtcbiAgICAgICAgICAgIGNsdXN0ZXIsXG4gICAgICAgICAgICBtYW5pZmVzdDogW3tcbiAgICAgICAgICAgICAgICBhcGlWZXJzaW9uOiAndjEnLFxuICAgICAgICAgICAgICAgIGtpbmQ6ICdOYW1lc3BhY2UnLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7IG5hbWU6IG5hbWVzcGFjZSB9LFxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBvdmVyd3JpdGU6IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgc2EgPSBjbHVzdGVyLmFkZFNlcnZpY2VBY2NvdW50KHRoaXMucHJvcHMubmFtZSwgeyBuYW1lOiBgJHt0aGlzLnByb3BzLm5hbWV9LXNhYCwgbmFtZXNwYWNlIH0pO1xuXG4gICAgICAgIGNvbnN0IGhvc3RlZFpvbmVzID0gdGhpcy5vcHRpb25zLmhvc3RlZFpvbmVSZXNvdXJjZXMubWFwKGUgPT4gY2x1c3RlckluZm8uZ2V0UmVxdWlyZWRSZXNvdXJjZTxJSG9zdGVkWm9uZT4oZSkpO1xuXG4gICAgICAgIHNhLmFkZFRvUHJpbmNpcGFsUG9saWN5KFxuICAgICAgICAgICAgbmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgICAgYWN0aW9uczogWydyb3V0ZTUzOkNoYW5nZVJlc291cmNlUmVjb3JkU2V0cycsICdyb3V0ZTUzOkxpc3RSZXNvdXJjZVJlY29yZFNldHMnXSxcbiAgICAgICAgICAgICAgICByZXNvdXJjZXM6IGhvc3RlZFpvbmVzLm1hcChob3N0ZWRab25lID0+IGhvc3RlZFpvbmUhLmhvc3RlZFpvbmVBcm4pLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICk7XG5cbiAgICAgICAgc2EuYWRkVG9QcmluY2lwYWxQb2xpY3koXG4gICAgICAgICAgICBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbJ3JvdXRlNTM6TGlzdEhvc3RlZFpvbmVzJ10sXG4gICAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICApO1xuXG4gICAgICAgIHNhLm5vZGUuYWRkRGVwZW5kZW5jeShuYW1lc3BhY2VNYW5pZmVzdCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgLS16b25lLWlkLWZpbHRlciBhcmcgZm9yIGVhY2ggaG9zdGVkIHpvbmVcbiAgICAgICAgY29uc3Qgem9uZUlkRmlsdGVyQXJncyA9IGhvc3RlZFpvbmVzLm1hcCgoaG9zdGVkWm9uZSkgPT4gYC0tem9uZS1pZC1maWx0ZXI9JHtob3N0ZWRab25lIS5ob3N0ZWRab25lSWR9YCk7XG5cbiAgICAgICAgbGV0IHZhbHVlczogVmFsdWVzID0ge1xuICAgICAgICAgICAgcHJvdmlkZXI6IFwiYXdzXCIsXG4gICAgICAgICAgICBleHRyYUFyZ3M6IHpvbmVJZEZpbHRlckFyZ3MsXG4gICAgICAgICAgICBhd3M6IHtcbiAgICAgICAgICAgICAgcmVnaW9uLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlcnZpY2VBY2NvdW50OiB7XG4gICAgICAgICAgICAgIGNyZWF0ZTogZmFsc2UsXG4gICAgICAgICAgICAgIG5hbWU6IHNhLnNlcnZpY2VBY2NvdW50TmFtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFsdWVzID0gbWVyZ2UodmFsdWVzLCB0aGlzLnByb3BzLnZhbHVlcyA/PyB7fSk7XG5cbiAgICAgICAgY29uc3Qgc291cmNlcyA9IHRoaXMub3B0aW9ucy5zb3VyY2VzO1xuXG4gICAgICAgIGlmIChzb3VyY2VzKSB7XG4gICAgICAgICAgICB2YWx1ZXMuc291cmNlcyA9IHNvdXJjZXM7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjaGFydCA9IHRoaXMuYWRkSGVsbUNoYXJ0KGNsdXN0ZXJJbmZvLCB2YWx1ZXMpO1xuXG4gICAgICAgIGNoYXJ0Lm5vZGUuYWRkRGVwZW5kZW5jeShuYW1lc3BhY2VNYW5pZmVzdCk7XG4gICAgICAgIC8vIHJldHVybiB0aGUgUHJvbWlzZSBDb25zdHJ1Y3QgZm9yIGFueSB0ZWFtcyB0aGF0IG1heSBkZXBlbmQgb24gdGhpc1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNoYXJ0KTtcbiAgICB9XG59XG4iXX0=