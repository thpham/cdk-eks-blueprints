"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalsSecretsAddOn = void 0;
const utils_1 = require("../../utils");
const iam = require("aws-cdk-lib/aws-iam");
const ts_deepmerge_1 = require("ts-deepmerge");
const helm_addon_1 = require("../helm-addon");
const aws_cdk_lib_1 = require("aws-cdk-lib");
/**
 * Default props for the add-on.
 */
const defaultProps = {
    name: "external-secrets",
    chart: "external-secrets",
    release: "blueprints-addon-external-secrets",
    version: "0.9.19",
    repository: "https://charts.external-secrets.io",
    namespace: "external-secrets",
    values: {},
};
/**
 * Default iam policy
 */
const defaultIamPolicy = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: [
        "secretsmanager:GetResourcePolicy",
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecretVersionIds",
        "secretsmanager:ListSecrets",
        "ssm:DescribeParameters",
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath",
        "ssm:GetParameterHistory",
        "kms:Decrypt"
    ],
    resources: ["*"],
});
/**
 * ExternalsSecretsAddOn deploys ExternalsSecrets into an EKS cluster using the `external-secrets` Helm chart.
 * https://github.com/external-secrets/external-secrets/
 *
 * For information on how to configure the `external-secrets` Helm chart, please view the values.yaml spec provided by the chart.
 * https://github.com/external-secrets/external-secrets/blob/main/deploy/charts/external-secrets/values.yaml
 */
let ExternalsSecretsAddOn = class ExternalsSecretsAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a;
        const cluster = clusterInfo.cluster;
        // Create the ExternalsSecrets namespace.
        const namespace = this.options.namespace;
        const ns = (0, utils_1.createNamespace)(this.options.namespace, cluster, true);
        // Create the ExternalsSecrets service account.
        const serviceAccountName = "external-secrets-sa";
        const sa = cluster.addServiceAccount(serviceAccountName, {
            name: serviceAccountName,
            namespace: namespace,
        });
        sa.node.addDependency(ns);
        // Apply additional IAM policies to the service account.
        const policies = this.options.iamPolicies || [defaultIamPolicy];
        policies.forEach((policy) => sa.addToPrincipalPolicy(policy));
        // Configure values.
        let values = {
            serviceAccount: {
                name: serviceAccountName,
                create: false,
            },
            ...this.options.values,
        };
        values = (0, ts_deepmerge_1.merge)(values, (_a = this.props.values) !== null && _a !== void 0 ? _a : {});
        const helmChart = this.addHelmChart(clusterInfo, values, false, true, aws_cdk_lib_1.Duration.minutes(15));
        helmChart.node.addDependency(sa);
        return Promise.resolve(helmChart);
    }
};
exports.ExternalsSecretsAddOn = ExternalsSecretsAddOn;
exports.ExternalsSecretsAddOn = ExternalsSecretsAddOn = __decorate([
    utils_1.supportsALL
], ExternalsSecretsAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2V4dGVybmFsLXNlY3JldHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsdUNBQTJEO0FBQzNELDJDQUEyQztBQUMzQywrQ0FBcUM7QUFHckMsOENBQThEO0FBQzlELDZDQUF1QztBQVl2Qzs7R0FFRztBQUNILE1BQU0sWUFBWSxHQUErQjtJQUMvQyxJQUFJLEVBQUUsa0JBQWtCO0lBQ3hCLEtBQUssRUFBRSxrQkFBa0I7SUFDekIsT0FBTyxFQUFFLG1DQUFtQztJQUM1QyxPQUFPLEVBQUUsUUFBUTtJQUNqQixVQUFVLEVBQUUsb0NBQW9DO0lBQ2hELFNBQVMsRUFBRSxrQkFBa0I7SUFDN0IsTUFBTSxFQUFFLEVBQUU7Q0FDWCxDQUFDO0FBRUY7O0dBRUc7QUFDSCxNQUFNLGdCQUFnQixHQUF3QixJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUM7SUFDcEUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSztJQUN4QixPQUFPLEVBQUU7UUFDUCxrQ0FBa0M7UUFDbEMsK0JBQStCO1FBQy9CLCtCQUErQjtRQUMvQixxQ0FBcUM7UUFDckMsNEJBQTRCO1FBQzVCLHdCQUF3QjtRQUN4QixrQkFBa0I7UUFDbEIsbUJBQW1CO1FBQ25CLHlCQUF5QjtRQUN6Qix5QkFBeUI7UUFDekIsYUFBYTtLQUNkO0lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO0NBQ2pCLENBQUMsQ0FBQztBQUVIOzs7Ozs7R0FNRztBQUVJLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsc0JBQVM7SUFHbEQsWUFBWSxLQUFrQztRQUM1QyxLQUFLLENBQUMsRUFBRSxHQUFJLFlBQW9CLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUM1QixDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQXdCOztRQUM3QixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBRXBDLHlDQUF5QztRQUN6QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUN6QyxNQUFNLEVBQUUsR0FBRyxJQUFBLHVCQUFlLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFVLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRW5FLCtDQUErQztRQUMvQyxNQUFNLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDO1FBQ2pELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRTtZQUN2RCxJQUFJLEVBQUUsa0JBQWtCO1lBQ3hCLFNBQVMsRUFBRSxTQUFTO1NBQ3JCLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTFCLHdEQUF3RDtRQUN4RCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDaEUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQTJCLEVBQUUsRUFBRSxDQUMvQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQ2hDLENBQUM7UUFFRixvQkFBb0I7UUFDcEIsSUFBSSxNQUFNLEdBQVk7WUFDcEIsY0FBYyxFQUFFO2dCQUNkLElBQUksRUFBRSxrQkFBa0I7Z0JBQ3hCLE1BQU0sRUFBRSxLQUFLO2FBQ2Q7WUFDRCxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTtTQUN2QixDQUFDO1FBRUYsTUFBTSxHQUFHLElBQUEsb0JBQUssRUFBQyxNQUFNLEVBQUUsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sbUNBQUksRUFBRSxDQUFDLENBQUM7UUFFaEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsc0JBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1RixTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVqQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsQ0FBQztDQUNGLENBQUE7QUE3Q1ksc0RBQXFCO2dDQUFyQixxQkFBcUI7SUFEakMsbUJBQVc7R0FDQyxxQkFBcUIsQ0E2Q2pDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlTmFtZXNwYWNlLCBzdXBwb3J0c0FMTCB9IGZyb20gXCIuLi8uLi91dGlsc1wiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgeyBtZXJnZSB9IGZyb20gXCJ0cy1kZWVwbWVyZ2VcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBDbHVzdGVySW5mbywgVmFsdWVzIH0gZnJvbSBcIi4uLy4uL3NwaVwiO1xuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Vc2VyUHJvcHMgfSBmcm9tIFwiLi4vaGVsbS1hZGRvblwiO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBFeHRlcm5hbHNTZWNyZXRzIGFkZC1vbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeHRlcm5hbHNTZWNyZXRzQWRkT25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7XG4gIC8qKlxuICAgKiBJYW0gcG9saWNpZXMgZm9yIHRoZSBhZGQtb24uXG4gICAqL1xuICBpYW1Qb2xpY2llcz86IGlhbS5Qb2xpY3lTdGF0ZW1lbnRbXTtcbn1cblxuLyoqXG4gKiBEZWZhdWx0IHByb3BzIGZvciB0aGUgYWRkLW9uLlxuICovXG5jb25zdCBkZWZhdWx0UHJvcHM6IEV4dGVybmFsc1NlY3JldHNBZGRPblByb3BzID0ge1xuICBuYW1lOiBcImV4dGVybmFsLXNlY3JldHNcIixcbiAgY2hhcnQ6IFwiZXh0ZXJuYWwtc2VjcmV0c1wiLFxuICByZWxlYXNlOiBcImJsdWVwcmludHMtYWRkb24tZXh0ZXJuYWwtc2VjcmV0c1wiLFxuICB2ZXJzaW9uOiBcIjAuOS4xOVwiLFxuICByZXBvc2l0b3J5OiBcImh0dHBzOi8vY2hhcnRzLmV4dGVybmFsLXNlY3JldHMuaW9cIixcbiAgbmFtZXNwYWNlOiBcImV4dGVybmFsLXNlY3JldHNcIixcbiAgdmFsdWVzOiB7fSxcbn07XG5cbi8qKlxuICogRGVmYXVsdCBpYW0gcG9saWN5XG4gKi9cbmNvbnN0IGRlZmF1bHRJYW1Qb2xpY3k6IGlhbS5Qb2xpY3lTdGF0ZW1lbnQgPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgYWN0aW9uczogW1xuICAgIFwic2VjcmV0c21hbmFnZXI6R2V0UmVzb3VyY2VQb2xpY3lcIixcbiAgICBcInNlY3JldHNtYW5hZ2VyOkdldFNlY3JldFZhbHVlXCIsXG4gICAgXCJzZWNyZXRzbWFuYWdlcjpEZXNjcmliZVNlY3JldFwiLFxuICAgIFwic2VjcmV0c21hbmFnZXI6TGlzdFNlY3JldFZlcnNpb25JZHNcIixcbiAgICBcInNlY3JldHNtYW5hZ2VyOkxpc3RTZWNyZXRzXCIsXG4gICAgXCJzc206RGVzY3JpYmVQYXJhbWV0ZXJzXCIsXG4gICAgXCJzc206R2V0UGFyYW1ldGVyXCIsXG4gICAgXCJzc206R2V0UGFyYW1ldGVyc1wiLFxuICAgIFwic3NtOkdldFBhcmFtZXRlcnNCeVBhdGhcIixcbiAgICBcInNzbTpHZXRQYXJhbWV0ZXJIaXN0b3J5XCIsXG4gICAgXCJrbXM6RGVjcnlwdFwiXG4gIF0sXG4gIHJlc291cmNlczogW1wiKlwiXSxcbn0pO1xuXG4vKipcbiAqIEV4dGVybmFsc1NlY3JldHNBZGRPbiBkZXBsb3lzIEV4dGVybmFsc1NlY3JldHMgaW50byBhbiBFS1MgY2x1c3RlciB1c2luZyB0aGUgYGV4dGVybmFsLXNlY3JldHNgIEhlbG0gY2hhcnQuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZXh0ZXJuYWwtc2VjcmV0cy9leHRlcm5hbC1zZWNyZXRzL1xuICpcbiAqIEZvciBpbmZvcm1hdGlvbiBvbiBob3cgdG8gY29uZmlndXJlIHRoZSBgZXh0ZXJuYWwtc2VjcmV0c2AgSGVsbSBjaGFydCwgcGxlYXNlIHZpZXcgdGhlIHZhbHVlcy55YW1sIHNwZWMgcHJvdmlkZWQgYnkgdGhlIGNoYXJ0LlxuICogaHR0cHM6Ly9naXRodWIuY29tL2V4dGVybmFsLXNlY3JldHMvZXh0ZXJuYWwtc2VjcmV0cy9ibG9iL21haW4vZGVwbG95L2NoYXJ0cy9leHRlcm5hbC1zZWNyZXRzL3ZhbHVlcy55YW1sXG4gKi9cbkBzdXBwb3J0c0FMTFxuZXhwb3J0IGNsYXNzIEV4dGVybmFsc1NlY3JldHNBZGRPbiBleHRlbmRzIEhlbG1BZGRPbiB7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IEV4dGVybmFsc1NlY3JldHNBZGRPblByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzPzogRXh0ZXJuYWxzU2VjcmV0c0FkZE9uUHJvcHMpIHtcbiAgICBzdXBlcih7IC4uLihkZWZhdWx0UHJvcHMgYXMgYW55KSwgLi4ucHJvcHMgfSk7XG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5wcm9wcztcbiAgfVxuXG4gIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xuICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBFeHRlcm5hbHNTZWNyZXRzIG5hbWVzcGFjZS5cbiAgICBjb25zdCBuYW1lc3BhY2UgPSB0aGlzLm9wdGlvbnMubmFtZXNwYWNlO1xuICAgIGNvbnN0IG5zID0gY3JlYXRlTmFtZXNwYWNlKHRoaXMub3B0aW9ucy5uYW1lc3BhY2UhLCBjbHVzdGVyLCB0cnVlKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgRXh0ZXJuYWxzU2VjcmV0cyBzZXJ2aWNlIGFjY291bnQuXG4gICAgY29uc3Qgc2VydmljZUFjY291bnROYW1lID0gXCJleHRlcm5hbC1zZWNyZXRzLXNhXCI7XG4gICAgY29uc3Qgc2EgPSBjbHVzdGVyLmFkZFNlcnZpY2VBY2NvdW50KHNlcnZpY2VBY2NvdW50TmFtZSwge1xuICAgICAgbmFtZTogc2VydmljZUFjY291bnROYW1lLFxuICAgICAgbmFtZXNwYWNlOiBuYW1lc3BhY2UsXG4gICAgfSk7XG4gICAgc2Eubm9kZS5hZGREZXBlbmRlbmN5KG5zKTtcblxuICAgIC8vIEFwcGx5IGFkZGl0aW9uYWwgSUFNIHBvbGljaWVzIHRvIHRoZSBzZXJ2aWNlIGFjY291bnQuXG4gICAgY29uc3QgcG9saWNpZXMgPSB0aGlzLm9wdGlvbnMuaWFtUG9saWNpZXMgfHwgW2RlZmF1bHRJYW1Qb2xpY3ldO1xuICAgIHBvbGljaWVzLmZvckVhY2goKHBvbGljeTogaWFtLlBvbGljeVN0YXRlbWVudCkgPT5cbiAgICAgIHNhLmFkZFRvUHJpbmNpcGFsUG9saWN5KHBvbGljeSlcbiAgICApO1xuXG4gICAgLy8gQ29uZmlndXJlIHZhbHVlcy5cbiAgICBsZXQgdmFsdWVzIDogVmFsdWVzID0ge1xuICAgICAgc2VydmljZUFjY291bnQ6IHtcbiAgICAgICAgbmFtZTogc2VydmljZUFjY291bnROYW1lLFxuICAgICAgICBjcmVhdGU6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIC4uLnRoaXMub3B0aW9ucy52YWx1ZXMsXG4gICAgfTtcblxuICAgIHZhbHVlcyA9IG1lcmdlKHZhbHVlcywgdGhpcy5wcm9wcy52YWx1ZXMgPz8ge30pO1xuXG4gICAgY29uc3QgaGVsbUNoYXJ0ID0gdGhpcy5hZGRIZWxtQ2hhcnQoY2x1c3RlckluZm8sIHZhbHVlcywgZmFsc2UsIHRydWUsIER1cmF0aW9uLm1pbnV0ZXMoMTUpKTtcbiAgICBoZWxtQ2hhcnQubm9kZS5hZGREZXBlbmRlbmN5KHNhKTtcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaGVsbUNoYXJ0KTtcbiAgfVxufVxuIl19