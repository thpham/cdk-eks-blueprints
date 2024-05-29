"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudWatchLogsAddon = void 0;
const iam = require("aws-cdk-lib/aws-iam");
const ts_deepmerge_1 = require("ts-deepmerge");
const utils_1 = require("../../utils");
const helm_addon_1 = require("../helm-addon");
const namespace_utils_1 = require("../../utils/namespace-utils");
const iam_policy_1 = require("./iam-policy");
/**
 * Default props for the add-on.
 */
const defaultProps = {
    name: 'aws-for-fluent-bit',
    chart: 'aws-for-fluent-bit',
    release: "blueprints-addon-aws-fluent-bit-for-cw",
    version: '0.1.32',
    repository: 'https://aws.github.io/eks-charts',
    namespace: 'aws-for-fluent-bit',
    createNamespace: true,
    serviceAccountName: 'aws-fluent-bit-for-cw-sa',
    logGroupPrefix: '/aws/eks/blueprints-construct-dev',
    logRetentionDays: 90,
    values: {}
};
/**
 * CloudWatchLogsAddon deploys FluentBit into an EKS cluster using the `aws-for-fluent-bit` Helm chart.
 * https://github.com/aws/eks-charts/tree/master/stable/aws-for-fluent-bit
 *
 */
let CloudWatchLogsAddon = class CloudWatchLogsAddon extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = { ...defaultProps, ...this.props };
    }
    deploy(clusterInfo) {
        var _a;
        let values = populateValues(clusterInfo, this.options);
        values = (0, ts_deepmerge_1.merge)(values, (_a = this.props.values) !== null && _a !== void 0 ? _a : {});
        const cluster = clusterInfo.cluster;
        const namespace = this.options.namespace;
        // Create the FluentBut service account.
        const serviceAccountName = this.options.serviceAccountName;
        const sa = cluster.addServiceAccount(serviceAccountName, {
            name: serviceAccountName,
            namespace: namespace
        });
        // Create namespace
        if (this.options.createNamespace) {
            const ns = (0, namespace_utils_1.createNamespace)(namespace, cluster, true);
            sa.node.addDependency(ns);
        }
        // Apply additional IAM policies to the service account.
        (0, iam_policy_1.getCloudWatchLogsPolicyDocument)().forEach((statement) => {
            sa.addToPrincipalPolicy(iam.PolicyStatement.fromJson(statement));
        });
        const helmChart = this.addHelmChart(clusterInfo, values);
        helmChart.node.addDependency(sa);
        return Promise.resolve(helmChart);
    }
};
exports.CloudWatchLogsAddon = CloudWatchLogsAddon;
__decorate([
    (0, utils_1.conflictsWith)('AwsForFluentBitAddOn')
], CloudWatchLogsAddon.prototype, "deploy", null);
exports.CloudWatchLogsAddon = CloudWatchLogsAddon = __decorate([
    utils_1.supportsALL
], CloudWatchLogsAddon);
/**
 * populateValues populates the appropriate values used to customize the Helm chart
 * @param helmOptions User provided values to customize the chart
 */
function populateValues(clusterInfo, helmOptions) {
    var _a;
    const values = (_a = helmOptions.values) !== null && _a !== void 0 ? _a : {};
    (0, utils_1.setPath)(values, "serviceAccount.name", helmOptions.serviceAccountName);
    (0, utils_1.setPath)(values, "serviceAccount.create", false);
    (0, utils_1.setPath)(values, "cloudWatch.enabled", false);
    (0, utils_1.setPath)(values, "cloudWatchLogs.enabled", true);
    (0, utils_1.setPath)(values, "cloudWatchLogs.region", clusterInfo.cluster.stack.region);
    (0, utils_1.setPath)(values, "cloudWatchLogs.logGroupName", `${helmOptions.logGroupPrefix}/workloads`);
    (0, utils_1.setPath)(values, "cloudWatchLogs.logGroupTemplate", `${helmOptions.logGroupPrefix}/$kubernetes['namespace_name']`);
    (0, utils_1.setPath)(values, "cloudWatchLogs.logStreamTemplate", "$kubernetes['container_name'].$kubernetes['pod_name']");
    (0, utils_1.setPath)(values, "cloudWatchLogs.logKey", "log");
    (0, utils_1.setPath)(values, "cloudWatchLogs.logRetentionDays", helmOptions.logRetentionDays);
    return values;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2Nsb3Vkd2F0Y2gtbG9ncy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFDQSwyQ0FBMkM7QUFDM0MsK0NBQXFDO0FBQ3JDLHVDQUFrRTtBQUNsRSw4Q0FBOEQ7QUFFOUQsaUVBQThEO0FBQzlELDZDQUErRDtBQTBCL0Q7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBNkI7SUFDM0MsSUFBSSxFQUFFLG9CQUFvQjtJQUMxQixLQUFLLEVBQUUsb0JBQW9CO0lBQzNCLE9BQU8sRUFBRSx3Q0FBd0M7SUFDakQsT0FBTyxFQUFFLFFBQVE7SUFDakIsVUFBVSxFQUFFLGtDQUFrQztJQUM5QyxTQUFTLEVBQUUsb0JBQW9CO0lBQy9CLGVBQWUsRUFBRSxJQUFJO0lBQ3JCLGtCQUFrQixFQUFFLDBCQUEwQjtJQUM5QyxjQUFjLEVBQUUsbUNBQW1DO0lBQ25ELGdCQUFnQixFQUFFLEVBQUU7SUFDcEIsTUFBTSxFQUFFLEVBQUU7Q0FDYixDQUFDO0FBRUY7Ozs7R0FJRztBQUVJLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVM7SUFJOUMsWUFBWSxLQUErQjtRQUN2QyxLQUFLLENBQUMsRUFBRSxHQUFHLFlBQW1CLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxHQUFHLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN0RCxDQUFDO0lBR0QsTUFBTSxDQUFDLFdBQXdCOztRQUMzQixJQUFJLE1BQU0sR0FBVyxjQUFjLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvRCxNQUFNLEdBQUcsSUFBQSxvQkFBSyxFQUFDLE1BQU0sRUFBRSxNQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxtQ0FBSSxF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IFwiY29uc3RydWN0c1wiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgeyBtZXJnZSB9IGZyb20gXCJ0cy1kZWVwbWVyZ2VcIjtcbmltcG9ydCB7IGNvbmZsaWN0c1dpdGgsIHNldFBhdGgsIHN1cHBvcnRzQUxMIH0gZnJvbSBcIi4uLy4uL3V0aWxzXCI7XG5pbXBvcnQgeyBIZWxtQWRkT24sIEhlbG1BZGRPblVzZXJQcm9wcyB9IGZyb20gXCIuLi9oZWxtLWFkZG9uXCI7XG5pbXBvcnQgeyBDbHVzdGVySW5mbywgVmFsdWVzIH0gZnJvbSBcIi4uLy4uL3NwaS90eXBlc1wiO1xuaW1wb3J0IHsgY3JlYXRlTmFtZXNwYWNlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL25hbWVzcGFjZS11dGlsc1wiO1xuaW1wb3J0IHsgZ2V0Q2xvdWRXYXRjaExvZ3NQb2xpY3lEb2N1bWVudCB9IGZyb20gXCIuL2lhbS1wb2xpY3lcIjtcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBGbHVlbnRCaXQgYWRkLW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENsb3VkV2F0Y2hMb2dzQWRkb25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIE5hbWVzcGFjZSB3aXRoIHRoZSBwcm92aWRlZCBvbmUgKHdpbGwgbm90IGlmIG5hbWVzcGFjZSBpcyBrdWJlLXN5c3RlbSlcbiAgICAgKi9cbiAgICBjcmVhdGVOYW1lc3BhY2U/OiBib29sZWFuXG5cbiAgICAvKipcbiAgICAgKiBOYW1lIG9mIHRoZSBzZXJ2aWNlIGFjY291bnQgZm9yIGZsdWVudCBiaXQuXG4gICAgICovXG4gICAgc2VydmljZUFjY291bnROYW1lPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogQ2xvdWRXYXRjaCBMb2cgR3JvdXAgTmFtZS5cbiAgICAgKi9cbiAgICBsb2dHcm91cFByZWZpeDogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogQ2xvdWRXYXRjaCBMb2cgcmV0ZW50aW9uIGRheXNcbiAgICAgKi9cbiAgICBsb2dSZXRlbnRpb25EYXlzPzogbnVtYmVyO1xufVxuLyoqXG4gKiBEZWZhdWx0IHByb3BzIGZvciB0aGUgYWRkLW9uLlxuICovXG5jb25zdCBkZWZhdWx0UHJvcHM6IENsb3VkV2F0Y2hMb2dzQWRkb25Qcm9wcyA9IHtcbiAgICBuYW1lOiAnYXdzLWZvci1mbHVlbnQtYml0JyxcbiAgICBjaGFydDogJ2F3cy1mb3ItZmx1ZW50LWJpdCcsXG4gICAgcmVsZWFzZTogXCJibHVlcHJpbnRzLWFkZG9uLWF3cy1mbHVlbnQtYml0LWZvci1jd1wiLFxuICAgIHZlcnNpb246ICcwLjEuMzInLFxuICAgIHJlcG9zaXRvcnk6ICdodHRwczovL2F3cy5naXRodWIuaW8vZWtzLWNoYXJ0cycsXG4gICAgbmFtZXNwYWNlOiAnYXdzLWZvci1mbHVlbnQtYml0JyxcbiAgICBjcmVhdGVOYW1lc3BhY2U6IHRydWUsXG4gICAgc2VydmljZUFjY291bnROYW1lOiAnYXdzLWZsdWVudC1iaXQtZm9yLWN3LXNhJyxcbiAgICBsb2dHcm91cFByZWZpeDogJy9hd3MvZWtzL2JsdWVwcmludHMtY29uc3RydWN0LWRldicsIFxuICAgIGxvZ1JldGVudGlvbkRheXM6IDkwLFxuICAgIHZhbHVlczoge31cbn07XG5cbi8qKlxuICogQ2xvdWRXYXRjaExvZ3NBZGRvbiBkZXBsb3lzIEZsdWVudEJpdCBpbnRvIGFuIEVLUyBjbHVzdGVyIHVzaW5nIHRoZSBgYXdzLWZvci1mbHVlbnQtYml0YCBIZWxtIGNoYXJ0LlxuICogaHR0cHM6Ly9naXRodWIuY29tL2F3cy9la3MtY2hhcnRzL3RyZWUvbWFzdGVyL3N0YWJsZS9hd3MtZm9yLWZsdWVudC1iaXRcbiAqIFxuICovXG5Ac3VwcG9ydHNBTExcbmV4cG9ydCBjbGFzcyBDbG91ZFdhdGNoTG9nc0FkZG9uIGV4dGVuZHMgSGVsbUFkZE9uIHtcblxuICAgIHJlYWRvbmx5IG9wdGlvbnM6IENsb3VkV2F0Y2hMb2dzQWRkb25Qcm9wcztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBDbG91ZFdhdGNoTG9nc0FkZG9uUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoeyAuLi5kZWZhdWx0UHJvcHMgYXMgYW55LCAuLi5wcm9wcyB9KTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0geyAuLi5kZWZhdWx0UHJvcHMsIC4uLnRoaXMucHJvcHMgfTtcbiAgICB9XG5cbiAgICBAY29uZmxpY3RzV2l0aCgnQXdzRm9yRmx1ZW50Qml0QWRkT24nKVxuICAgIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xuICAgICAgICBsZXQgdmFsdWVzOiBWYWx1ZXMgPSBwb3B1bGF0ZVZhbHVlcyhjbHVzdGVySW5mbywgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgdmFsdWVzID0gbWVyZ2UodmFsdWVzLCB0aGlzLnByb3BzLnZhbHVlcyA/PyB7fSk7XG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuICAgICAgICBjb25zdCBuYW1lc3BhY2UgPSB0aGlzLm9wdGlvbnMubmFtZXNwYWNlITtcblxuICAgICAgICAvLyBDcmVhdGUgdGhlIEZsdWVudEJ1dCBzZXJ2aWNlIGFjY291bnQuXG4gICAgICAgIGNvbnN0IHNlcnZpY2VBY2NvdW50TmFtZSA9IHRoaXMub3B0aW9ucy5zZXJ2aWNlQWNjb3VudE5hbWUhO1xuICAgICAgICBjb25zdCBzYSA9IGNsdXN0ZXIuYWRkU2VydmljZUFjY291bnQoc2VydmljZUFjY291bnROYW1lLCB7XG4gICAgICAgICAgICBuYW1lOiBzZXJ2aWNlQWNjb3VudE5hbWUsXG4gICAgICAgICAgICBuYW1lc3BhY2U6IG5hbWVzcGFjZVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDcmVhdGUgbmFtZXNwYWNlXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3JlYXRlTmFtZXNwYWNlKSB7XG4gICAgICAgICAgICBjb25zdCBucyA9IGNyZWF0ZU5hbWVzcGFjZShuYW1lc3BhY2UsIGNsdXN0ZXIsIHRydWUpO1xuICAgICAgICAgICAgc2Eubm9kZS5hZGREZXBlbmRlbmN5KG5zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFwcGx5IGFkZGl0aW9uYWwgSUFNIHBvbGljaWVzIHRvIHRoZSBzZXJ2aWNlIGFjY291bnQuXG4gICAgICAgIGdldENsb3VkV2F0Y2hMb2dzUG9saWN5RG9jdW1lbnQoKS5mb3JFYWNoKChzdGF0ZW1lbnQpID0+IHtcbiAgICAgICAgICAgIHNhLmFkZFRvUHJpbmNpcGFsUG9saWN5KGlhbS5Qb2xpY3lTdGF0ZW1lbnQuZnJvbUpzb24oc3RhdGVtZW50KSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGhlbG1DaGFydCA9IHRoaXMuYWRkSGVsbUNoYXJ0KGNsdXN0ZXJJbmZvLCB2YWx1ZXMpO1xuICAgICAgICBoZWxtQ2hhcnQubm9kZS5hZGREZXBlbmRlbmN5KHNhKTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShoZWxtQ2hhcnQpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBwb3B1bGF0ZVZhbHVlcyBwb3B1bGF0ZXMgdGhlIGFwcHJvcHJpYXRlIHZhbHVlcyB1c2VkIHRvIGN1c3RvbWl6ZSB0aGUgSGVsbSBjaGFydFxuICogQHBhcmFtIGhlbG1PcHRpb25zIFVzZXIgcHJvdmlkZWQgdmFsdWVzIHRvIGN1c3RvbWl6ZSB0aGUgY2hhcnRcbiAqL1xuZnVuY3Rpb24gcG9wdWxhdGVWYWx1ZXMoY2x1c3RlckluZm86IENsdXN0ZXJJbmZvLCBoZWxtT3B0aW9uczogQ2xvdWRXYXRjaExvZ3NBZGRvblByb3BzKTogVmFsdWVzIHtcbiAgICBjb25zdCB2YWx1ZXMgPSBoZWxtT3B0aW9ucy52YWx1ZXMgPz8ge307XG4gICAgc2V0UGF0aCh2YWx1ZXMsIFwic2VydmljZUFjY291bnQubmFtZVwiLCBoZWxtT3B0aW9ucy5zZXJ2aWNlQWNjb3VudE5hbWUpO1xuICAgIHNldFBhdGgodmFsdWVzLCBcInNlcnZpY2VBY2NvdW50LmNyZWF0ZVwiLCBmYWxzZSk7XG4gICAgc2V0UGF0aCh2YWx1ZXMsIFwiY2xvdWRXYXRjaC5lbmFibGVkXCIsIGZhbHNlKTtcbiAgICBzZXRQYXRoKHZhbHVlcywgXCJjbG91ZFdhdGNoTG9ncy5lbmFibGVkXCIsIHRydWUpO1xuICAgIHNldFBhdGgodmFsdWVzLCBcImNsb3VkV2F0Y2hMb2dzLnJlZ2lvblwiLCBjbHVzdGVySW5mby5jbHVzdGVyLnN0YWNrLnJlZ2lvbik7XG4gICAgc2V0UGF0aCh2YWx1ZXMsIFwiY2xvdWRXYXRjaExvZ3MubG9nR3JvdXBOYW1lXCIsIGAke2hlbG1PcHRpb25zLmxvZ0dyb3VwUHJlZml4fS93b3JrbG9hZHNgKTtcbiAgICBzZXRQYXRoKHZhbHVlcywgXCJjbG91ZFdhdGNoTG9ncy5sb2dHcm91cFRlbXBsYXRlXCIsIGAke2hlbG1PcHRpb25zLmxvZ0dyb3VwUHJlZml4fS8ka3ViZXJuZXRlc1snbmFtZXNwYWNlX25hbWUnXWApO1xuICAgIHNldFBhdGgodmFsdWVzLCBcImNsb3VkV2F0Y2hMb2dzLmxvZ1N0cmVhbVRlbXBsYXRlXCIsIFwiJGt1YmVybmV0ZXNbJ2NvbnRhaW5lcl9uYW1lJ10uJGt1YmVybmV0ZXNbJ3BvZF9uYW1lJ11cIik7XG4gICAgc2V0UGF0aCh2YWx1ZXMsIFwiY2xvdWRXYXRjaExvZ3MubG9nS2V5XCIsIFwibG9nXCIpO1xuICAgIHNldFBhdGgodmFsdWVzLCBcImNsb3VkV2F0Y2hMb2dzLmxvZ1JldGVudGlvbkRheXNcIiwgaGVsbU9wdGlvbnMubG9nUmV0ZW50aW9uRGF5cyk7XG4gICAgcmV0dXJuIHZhbHVlcztcbn0iXX0=