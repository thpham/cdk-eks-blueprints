"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsForFluentBitAddOn = void 0;
const helm_addon_1 = require("../helm-addon");
const namespace_utils_1 = require("../../utils/namespace-utils");
const utils_1 = require("../../utils");
/**
 * Default props for the add-on.
 */
const defaultProps = {
    name: 'fluent-bit',
    chart: 'aws-for-fluent-bit',
    release: "blueprints-addon-aws-for-fluent-bit",
    version: '0.1.33',
    repository: 'https://aws.github.io/eks-charts',
    namespace: 'kube-system',
    createNamespace: false,
    values: {}
};
/**
 * AwsForFluentBitAddOn deploys FluentBit into an EKS cluster using the `aws-for-fluent-bit` Helm chart.
 * https://github.com/aws/eks-charts/tree/master/stable/aws-for-fluent-bit
 *
 * For information on how to configure the `aws-for-fluent-bit` Helm chart to forward logs and metrics to AWS services like CloudWatch or Kinesis, please view the values.yaml spec provided by the chart.
 * https://github.com/aws/eks-charts/blob/master/stable/aws-for-fluent-bit/values.yaml
 */
let AwsForFluentBitAddOn = class AwsForFluentBitAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        const cluster = clusterInfo.cluster;
        const namespace = this.options.namespace;
        // Create the FluentBut service account.
        const serviceAccountName = 'aws-for-fluent-bit-sa';
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
        const policies = this.options.iamPolicies || [];
        policies.forEach((policy) => sa.addToPrincipalPolicy(policy));
        // Configure values.
        const values = {
            serviceAccount: {
                name: serviceAccountName,
                create: false
            },
            ...this.options.values
        };
        const helmChart = this.addHelmChart(clusterInfo, values);
        helmChart.node.addDependency(sa);
        return Promise.resolve(helmChart);
    }
};
exports.AwsForFluentBitAddOn = AwsForFluentBitAddOn;
exports.AwsForFluentBitAddOn = AwsForFluentBitAddOn = __decorate([
    utils_1.supportsALL
], AwsForFluentBitAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2F3cy1mb3ItZmx1ZW50LWJpdC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFHQSw4Q0FBOEQ7QUFFOUQsaUVBQThEO0FBQzlELHVDQUEwQztBQWdCMUM7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBOEI7SUFDNUMsSUFBSSxFQUFFLFlBQVk7SUFDbEIsS0FBSyxFQUFFLG9CQUFvQjtJQUMzQixPQUFPLEVBQUUscUNBQXFDO0lBQzlDLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLFVBQVUsRUFBRSxrQ0FBa0M7SUFDOUMsU0FBUyxFQUFFLGFBQWE7SUFDeEIsZUFBZSxFQUFFLEtBQUs7SUFDdEIsTUFBTSxFQUFFLEVBQUU7Q0FDYixDQUFDO0FBRUY7Ozs7OztHQU1HO0FBRUksSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSxzQkFBUztJQUkvQyxZQUFZLEtBQWlDO1FBQ3pDLEtBQUssQ0FBQyxFQUFFLEdBQUcsWUFBbUIsRUFBRSxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQzlCLENBQUM7SUFFRCxNQUFNLENBQUMsV0FBd0I7UUFDM0IsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVUsQ0FBQztRQUUxQyx3Q0FBd0M7UUFDeEMsTUFBTSxrQkFBa0IsR0FBRyx1QkFBdUIsQ0FBQztRQUNuRCxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLEVBQUU7WUFDckQsSUFBSSxFQUFFLGtCQUFrQjtZQUN4QixTQUFTLEVBQUUsU0FBUztTQUN2QixDQUFDLENBQUM7UUFFSCxtQkFBbUI7UUFDbkIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQy9CLE1BQU0sRUFBRSxHQUFHLElBQUEsaUNBQWUsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3JELEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFRCx3REFBd0Q7UUFDeEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO1FBQ2hELFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUF1QixFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUUvRSxvQkFBb0I7UUFDcEIsTUFBTSxNQUFNLEdBQUc7WUFDWCxjQUFjLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLGtCQUFrQjtnQkFDeEIsTUFBTSxFQUFFLEtBQUs7YUFDaEI7WUFDRCxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTtTQUN6QixDQUFDO1FBRUYsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekQsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FDSixDQUFBO0FBM0NZLG9EQUFvQjsrQkFBcEIsb0JBQW9CO0lBRGhDLG1CQUFXO0dBQ0Msb0JBQW9CLENBMkNoQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBvbGljeVN0YXRlbWVudCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcblxuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Vc2VyUHJvcHMgfSBmcm9tIFwiLi4vaGVsbS1hZGRvblwiO1xuaW1wb3J0IHsgQ2x1c3RlckluZm8gfSBmcm9tIFwiLi4vLi4vc3BpL3R5cGVzXCI7XG5pbXBvcnQgeyBjcmVhdGVOYW1lc3BhY2UgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbmFtZXNwYWNlLXV0aWxzXCI7XG5pbXBvcnQgeyBzdXBwb3J0c0FMTCB9IGZyb20gJy4uLy4uL3V0aWxzJztcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBGbHVlbnRCaXQgYWRkLW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEF3c0ZvckZsdWVudEJpdEFkZE9uUHJvcHMgZXh0ZW5kcyBIZWxtQWRkT25Vc2VyUHJvcHMge1xuICAgIC8qKlxuICAgICAqIElhbSBwb2xpY2llcyBmb3IgdGhlIGFkZC1vbi5cbiAgICAgKi9cbiAgICBpYW1Qb2xpY2llcz86IFBvbGljeVN0YXRlbWVudFtdLFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIE5hbWVzcGFjZSB3aXRoIHRoZSBwcm92aWRlZCBvbmUgKHdpbGwgbm90IGlmIG5hbWVzcGFjZSBpcyBrdWJlLXN5c3RlbSlcbiAgICAgKi9cbiAgICBjcmVhdGVOYW1lc3BhY2U/OiBib29sZWFuXG59XG4vKipcbiAqIERlZmF1bHQgcHJvcHMgZm9yIHRoZSBhZGQtb24uXG4gKi9cbmNvbnN0IGRlZmF1bHRQcm9wczogQXdzRm9yRmx1ZW50Qml0QWRkT25Qcm9wcyA9IHtcbiAgICBuYW1lOiAnZmx1ZW50LWJpdCcsXG4gICAgY2hhcnQ6ICdhd3MtZm9yLWZsdWVudC1iaXQnLFxuICAgIHJlbGVhc2U6IFwiYmx1ZXByaW50cy1hZGRvbi1hd3MtZm9yLWZsdWVudC1iaXRcIixcbiAgICB2ZXJzaW9uOiAnMC4xLjMzJyxcbiAgICByZXBvc2l0b3J5OiAnaHR0cHM6Ly9hd3MuZ2l0aHViLmlvL2Vrcy1jaGFydHMnLFxuICAgIG5hbWVzcGFjZTogJ2t1YmUtc3lzdGVtJyxcbiAgICBjcmVhdGVOYW1lc3BhY2U6IGZhbHNlLFxuICAgIHZhbHVlczoge31cbn07XG5cbi8qKlxuICogQXdzRm9yRmx1ZW50Qml0QWRkT24gZGVwbG95cyBGbHVlbnRCaXQgaW50byBhbiBFS1MgY2x1c3RlciB1c2luZyB0aGUgYGF3cy1mb3ItZmx1ZW50LWJpdGAgSGVsbSBjaGFydC5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hd3MvZWtzLWNoYXJ0cy90cmVlL21hc3Rlci9zdGFibGUvYXdzLWZvci1mbHVlbnQtYml0XG4gKiBcbiAqIEZvciBpbmZvcm1hdGlvbiBvbiBob3cgdG8gY29uZmlndXJlIHRoZSBgYXdzLWZvci1mbHVlbnQtYml0YCBIZWxtIGNoYXJ0IHRvIGZvcndhcmQgbG9ncyBhbmQgbWV0cmljcyB0byBBV1Mgc2VydmljZXMgbGlrZSBDbG91ZFdhdGNoIG9yIEtpbmVzaXMsIHBsZWFzZSB2aWV3IHRoZSB2YWx1ZXMueWFtbCBzcGVjIHByb3ZpZGVkIGJ5IHRoZSBjaGFydC5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hd3MvZWtzLWNoYXJ0cy9ibG9iL21hc3Rlci9zdGFibGUvYXdzLWZvci1mbHVlbnQtYml0L3ZhbHVlcy55YW1sXG4gKi9cbkBzdXBwb3J0c0FMTFxuZXhwb3J0IGNsYXNzIEF3c0ZvckZsdWVudEJpdEFkZE9uIGV4dGVuZHMgSGVsbUFkZE9uIHtcblxuICAgIHJlYWRvbmx5IG9wdGlvbnM6IEF3c0ZvckZsdWVudEJpdEFkZE9uUHJvcHM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IEF3c0ZvckZsdWVudEJpdEFkZE9uUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoeyAuLi5kZWZhdWx0UHJvcHMgYXMgYW55LCAuLi5wcm9wcyB9KTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdGhpcy5wcm9wcztcbiAgICB9XG5cbiAgICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogUHJvbWlzZTxDb25zdHJ1Y3Q+IHtcbiAgICAgICAgY29uc3QgY2x1c3RlciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXI7XG4gICAgICAgIGNvbnN0IG5hbWVzcGFjZSA9IHRoaXMub3B0aW9ucy5uYW1lc3BhY2UhO1xuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgRmx1ZW50QnV0IHNlcnZpY2UgYWNjb3VudC5cbiAgICAgICAgY29uc3Qgc2VydmljZUFjY291bnROYW1lID0gJ2F3cy1mb3ItZmx1ZW50LWJpdC1zYSc7XG4gICAgICAgIGNvbnN0IHNhID0gY2x1c3Rlci5hZGRTZXJ2aWNlQWNjb3VudChzZXJ2aWNlQWNjb3VudE5hbWUsIHtcbiAgICAgICAgICAgIG5hbWU6IHNlcnZpY2VBY2NvdW50TmFtZSxcbiAgICAgICAgICAgIG5hbWVzcGFjZTogbmFtZXNwYWNlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZSBuYW1lc3BhY2VcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jcmVhdGVOYW1lc3BhY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IG5zID0gY3JlYXRlTmFtZXNwYWNlKG5hbWVzcGFjZSwgY2x1c3RlciwgdHJ1ZSk7XG4gICAgICAgICAgICBzYS5ub2RlLmFkZERlcGVuZGVuY3kobnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXBwbHkgYWRkaXRpb25hbCBJQU0gcG9saWNpZXMgdG8gdGhlIHNlcnZpY2UgYWNjb3VudC5cbiAgICAgICAgY29uc3QgcG9saWNpZXMgPSB0aGlzLm9wdGlvbnMuaWFtUG9saWNpZXMgfHwgW107XG4gICAgICAgIHBvbGljaWVzLmZvckVhY2goKHBvbGljeTogUG9saWN5U3RhdGVtZW50KSA9PiBzYS5hZGRUb1ByaW5jaXBhbFBvbGljeShwb2xpY3kpKTtcblxuICAgICAgICAvLyBDb25maWd1cmUgdmFsdWVzLlxuICAgICAgICBjb25zdCB2YWx1ZXMgPSB7XG4gICAgICAgICAgICBzZXJ2aWNlQWNjb3VudDoge1xuICAgICAgICAgICAgICAgIG5hbWU6IHNlcnZpY2VBY2NvdW50TmFtZSxcbiAgICAgICAgICAgICAgICBjcmVhdGU6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLi4udGhpcy5vcHRpb25zLnZhbHVlc1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGhlbG1DaGFydCA9IHRoaXMuYWRkSGVsbUNoYXJ0KGNsdXN0ZXJJbmZvLCB2YWx1ZXMpO1xuICAgICAgICBoZWxtQ2hhcnQubm9kZS5hZGREZXBlbmRlbmN5KHNhKTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShoZWxtQ2hhcnQpO1xuICAgIH1cbn1cbiJdfQ==