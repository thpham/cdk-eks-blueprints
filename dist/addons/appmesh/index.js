"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppMeshAddOn = void 0;
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const ts_deepmerge_1 = require("ts-deepmerge");
const cluster_providers_1 = require("../../cluster-providers");
const namespace_utils_1 = require("../../utils/namespace-utils");
const helm_addon_1 = require("../helm-addon");
const utils_1 = require("../../utils");
/**
 * Defaults options for the add-on
 */
const defaultProps = {
    enableTracing: false,
    tracingProvider: "x-ray",
    name: "appmesh-controller",
    namespace: "appmesh-system",
    chart: "appmesh-controller",
    version: "1.12.7",
    release: "appmesh-release",
    repository: "https://aws.github.io/eks-charts"
};
let AppMeshAddOn = class AppMeshAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a;
        const cluster = clusterInfo.cluster;
        // App Mesh service account.
        const opts = { name: 'appmesh-controller', namespace: "appmesh-system" };
        const sa = cluster.addServiceAccount('appmesh-controller', opts);
        // Cloud Map Full Access policy.
        const cloudMapPolicy = aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName("AWSCloudMapFullAccess");
        sa.role.addManagedPolicy(cloudMapPolicy);
        // App Mesh Full Access policy.
        const appMeshPolicy = aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName("AWSAppMeshFullAccess");
        sa.role.addManagedPolicy(appMeshPolicy);
        if (this.options.enableTracing && this.options.tracingProvider === "x-ray") {
            const xrayPolicy = aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName("AWSXRayDaemonWriteAccess");
            const nodeGroups = (0, cluster_providers_1.assertEC2NodeGroup)(clusterInfo, "App Mesh X-Ray integration");
            nodeGroups.forEach(ng => ng.role.addManagedPolicy(xrayPolicy));
        }
        // App Mesh Namespace
        const namespace = (0, namespace_utils_1.createNamespace)('appmesh-system', cluster);
        sa.node.addDependency(namespace);
        let values = {
            region: cluster.stack.region,
            serviceAccount: {
                create: false,
                name: 'appmesh-controller'
            },
            tracing: {
                enabled: this.options.enableTracing,
                provider: this.options.tracingProvider,
                address: this.options.tracingAddress,
                port: this.options.tracingPort
            }
        };
        values = (0, ts_deepmerge_1.merge)(values, (_a = this.props.values) !== null && _a !== void 0 ? _a : {});
        const chart = this.addHelmChart(clusterInfo, values);
        chart.node.addDependency(sa);
        return Promise.resolve(chart);
    }
};
exports.AppMeshAddOn = AppMeshAddOn;
exports.AppMeshAddOn = AppMeshAddOn = __decorate([
    utils_1.supportsX86
], AppMeshAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2FwcG1lc2gvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsaURBQW9EO0FBRXBELCtDQUFxQztBQUNyQywrREFBNkQ7QUFFN0QsaUVBQThEO0FBQzlELDhDQUE4RDtBQUM5RCx1Q0FBMEM7QUErQjFDOztHQUVHO0FBQ0gsTUFBTSxZQUFZLEdBQUc7SUFDakIsYUFBYSxFQUFFLEtBQUs7SUFDcEIsZUFBZSxFQUFFLE9BQU87SUFDeEIsSUFBSSxFQUFFLG9CQUFvQjtJQUMxQixTQUFTLEVBQUUsZ0JBQWdCO0lBQzNCLEtBQUssRUFBRSxvQkFBb0I7SUFDM0IsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLGlCQUFpQjtJQUMxQixVQUFVLEVBQUUsa0NBQWtDO0NBQ2pELENBQUM7QUFHSyxJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFhLFNBQVEsc0JBQVM7SUFJdkMsWUFBWSxLQUF5QjtRQUNqQyxLQUFLLENBQUMsRUFBRSxHQUFHLFlBQVksRUFBRSxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQzlCLENBQUM7SUFFUSxNQUFNLENBQUMsV0FBd0I7O1FBRXBDLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFFcEMsNEJBQTRCO1FBQzVCLE1BQU0sSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3pFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVqRSxnQ0FBZ0M7UUFDaEMsTUFBTSxjQUFjLEdBQUcsdUJBQWEsQ0FBQyx3QkFBd0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3ZGLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFekMsK0JBQStCO1FBQy9CLE1BQU0sYUFBYSxHQUFHLHVCQUFhLENBQUMsd0JBQXdCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNyRixFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRXhDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEtBQUssT0FBTyxFQUFFLENBQUM7WUFDekUsTUFBTSxVQUFVLEdBQUcsdUJBQWEsQ0FBQyx3QkFBd0IsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sVUFBVSxHQUFHLElBQUEsc0NBQWtCLEVBQUMsV0FBVyxFQUFFLDRCQUE0QixDQUFDLENBQUM7WUFDakYsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRUQscUJBQXFCO1FBQ3JCLE1BQU0sU0FBUyxHQUFHLElBQUEsaUNBQWUsRUFBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3RCxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVqQyxJQUFJLE1BQU0sR0FBVztZQUNqQixNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNO1lBQzVCLGNBQWMsRUFBRTtnQkFDWixNQUFNLEVBQUUsS0FBSztnQkFDYixJQUFJLEVBQUUsb0JBQW9CO2FBQzdCO1lBQ0QsT0FBTyxFQUFFO2dCQUNMLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWE7Z0JBQ25DLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWU7Z0JBQ3RDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWM7Z0JBQ3BDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVc7YUFDakM7U0FDSixDQUFDO1FBRUYsTUFBTSxHQUFHLElBQUEsb0JBQUssRUFBQyxNQUFNLEVBQUUsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sbUNBQUksRUFBRSxDQUFDLENBQUM7UUFFaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDckQsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0IsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDSixDQUFBO0FBdkRZLG9DQUFZO3VCQUFaLFlBQVk7SUFEeEIsbUJBQVc7R0FDQyxZQUFZLENBdUR4QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1hbmFnZWRQb2xpY3kgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSBcInRzLWRlZXBtZXJnZVwiO1xuaW1wb3J0IHsgYXNzZXJ0RUMyTm9kZUdyb3VwIH0gZnJvbSBcIi4uLy4uL2NsdXN0ZXItcHJvdmlkZXJzXCI7XG5pbXBvcnQgeyBDbHVzdGVySW5mbywgVmFsdWVzIH0gZnJvbSBcIi4uLy4uL3NwaVwiO1xuaW1wb3J0IHsgY3JlYXRlTmFtZXNwYWNlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL25hbWVzcGFjZS11dGlsc1wiO1xuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Vc2VyUHJvcHMgfSBmcm9tIFwiLi4vaGVsbS1hZGRvblwiO1xuaW1wb3J0IHsgc3VwcG9ydHNYODYgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcblxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgdGhlIGFkZC1vbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcHBNZXNoQWRkT25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7XG4gICAgLyoqXG4gICAgICogSWYgc2V0IHRvIHRydWUsIHdpbGwgZW5hYmxlIHRyYWNpbmcgdGhyb3VnaCBBcHAgTWVzaCBzaWRlY2Fycywgc3VjaCBhcyBYLVJheSBkaXN0cmlidXRlZCB0cmFjaW5nLlxuICAgICAqIE5vdGU6IHN1cHBvcnQgZm9yIFgtUmF5IHRyYWNpbmcgZG9lcyBub3QgZGVwZW5kIG9uIHRoZSBYUmF5IERhZW1vbiBBZGRPbiBpbnN0YWxsZWQuXG4gICAgICovXG4gICAgZW5hYmxlVHJhY2luZz86IGJvb2xlYW4sXG5cbiAgICAvKipcbiAgICAgKiBUcmFjaW5nIHByb3ZpZGVyLiBTdXBwb3J0ZWQgdmFsdWVzIGFyZSB4LXJheSwgamFlZ2VyLCBkYXRhZG9nXG4gICAgICovXG4gICAgdHJhY2luZ1Byb3ZpZGVyPzogXCJ4LXJheVwiIHwgXCJqYWVnZXJcIiB8IFwiZGF0YWRvZ1wiXG5cbiAgICAvKipcbiAgICAgKiBVc2VkIGZvciBEYXRhZG9nIG9yIEphZWdlciB0cmFjaW5nLiBFeGFtcGxlIHZhbHVlczogZGF0YWRvZy5hcHBtZXNoLXN5c3RlbS4gXG4gICAgICogUmVmZXIgdG8gaHR0cHM6Ly9hd3MuZ2l0aHViLmlvL2F3cy1hcHAtbWVzaC1jb250cm9sbGVyLWZvci1rOHMvZ3VpZGUvdHJhY2luZy8gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICogSWdub3JlZCBmb3IgWC1SYXkuXG4gICAgICovXG4gICAgdHJhY2luZ0FkZHJlc3M/OiBzdHJpbmcsXG5cbiAgICAvKipcbiAgICAgKiBKYWVnZXIgb3IgRGF0YWRvZyBhZ2VudCBwb3J0IChpZ25vcmVkIGZvciBYLVJheSlcbiAgICAgKi9cbiAgICB0cmFjaW5nUG9ydD86IHN0cmluZ1xufVxuXG4vKipcbiAqIERlZmF1bHRzIG9wdGlvbnMgZm9yIHRoZSBhZGQtb25cbiAqL1xuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICAgIGVuYWJsZVRyYWNpbmc6IGZhbHNlLFxuICAgIHRyYWNpbmdQcm92aWRlcjogXCJ4LXJheVwiLFxuICAgIG5hbWU6IFwiYXBwbWVzaC1jb250cm9sbGVyXCIsXG4gICAgbmFtZXNwYWNlOiBcImFwcG1lc2gtc3lzdGVtXCIsXG4gICAgY2hhcnQ6IFwiYXBwbWVzaC1jb250cm9sbGVyXCIsXG4gICAgdmVyc2lvbjogXCIxLjEyLjdcIixcbiAgICByZWxlYXNlOiBcImFwcG1lc2gtcmVsZWFzZVwiLFxuICAgIHJlcG9zaXRvcnk6IFwiaHR0cHM6Ly9hd3MuZ2l0aHViLmlvL2Vrcy1jaGFydHNcIlxufTtcblxuQHN1cHBvcnRzWDg2XG5leHBvcnQgY2xhc3MgQXBwTWVzaEFkZE9uIGV4dGVuZHMgSGVsbUFkZE9uIHtcblxuICAgIHJlYWRvbmx5IG9wdGlvbnM6IEFwcE1lc2hBZGRPblByb3BzO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM/OiBBcHBNZXNoQWRkT25Qcm9wcykge1xuICAgICAgICBzdXBlcih7IC4uLmRlZmF1bHRQcm9wcywgLi4ucHJvcHMgfSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHRoaXMucHJvcHM7XG4gICAgfVxuXG4gICAgb3ZlcnJpZGUgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFByb21pc2U8Q29uc3RydWN0PiB7XG5cbiAgICAgICAgY29uc3QgY2x1c3RlciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXI7XG5cbiAgICAgICAgLy8gQXBwIE1lc2ggc2VydmljZSBhY2NvdW50LlxuICAgICAgICBjb25zdCBvcHRzID0geyBuYW1lOiAnYXBwbWVzaC1jb250cm9sbGVyJywgbmFtZXNwYWNlOiBcImFwcG1lc2gtc3lzdGVtXCIgfTtcbiAgICAgICAgY29uc3Qgc2EgPSBjbHVzdGVyLmFkZFNlcnZpY2VBY2NvdW50KCdhcHBtZXNoLWNvbnRyb2xsZXInLCBvcHRzKTtcblxuICAgICAgICAvLyBDbG91ZCBNYXAgRnVsbCBBY2Nlc3MgcG9saWN5LlxuICAgICAgICBjb25zdCBjbG91ZE1hcFBvbGljeSA9IE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQVdTQ2xvdWRNYXBGdWxsQWNjZXNzXCIpO1xuICAgICAgICBzYS5yb2xlLmFkZE1hbmFnZWRQb2xpY3koY2xvdWRNYXBQb2xpY3kpO1xuXG4gICAgICAgIC8vIEFwcCBNZXNoIEZ1bGwgQWNjZXNzIHBvbGljeS5cbiAgICAgICAgY29uc3QgYXBwTWVzaFBvbGljeSA9IE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQVdTQXBwTWVzaEZ1bGxBY2Nlc3NcIik7XG4gICAgICAgIHNhLnJvbGUuYWRkTWFuYWdlZFBvbGljeShhcHBNZXNoUG9saWN5KTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmVuYWJsZVRyYWNpbmcgJiYgdGhpcy5vcHRpb25zLnRyYWNpbmdQcm92aWRlciA9PT0gXCJ4LXJheVwiKSB7XG4gICAgICAgICAgICBjb25zdCB4cmF5UG9saWN5ID0gTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBV1NYUmF5RGFlbW9uV3JpdGVBY2Nlc3NcIik7XG4gICAgICAgICAgICBjb25zdCBub2RlR3JvdXBzID0gYXNzZXJ0RUMyTm9kZUdyb3VwKGNsdXN0ZXJJbmZvLCBcIkFwcCBNZXNoIFgtUmF5IGludGVncmF0aW9uXCIpO1xuICAgICAgICAgICAgbm9kZUdyb3Vwcy5mb3JFYWNoKG5nID0+IG5nLnJvbGUuYWRkTWFuYWdlZFBvbGljeSh4cmF5UG9saWN5KSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBcHAgTWVzaCBOYW1lc3BhY2VcbiAgICAgICAgY29uc3QgbmFtZXNwYWNlID0gY3JlYXRlTmFtZXNwYWNlKCdhcHBtZXNoLXN5c3RlbScsIGNsdXN0ZXIpO1xuICAgICAgICBzYS5ub2RlLmFkZERlcGVuZGVuY3kobmFtZXNwYWNlKTtcblxuICAgICAgICBsZXQgdmFsdWVzOiBWYWx1ZXMgPSB7XG4gICAgICAgICAgICByZWdpb246IGNsdXN0ZXIuc3RhY2sucmVnaW9uLFxuICAgICAgICAgICAgc2VydmljZUFjY291bnQ6IHtcbiAgICAgICAgICAgICAgICBjcmVhdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdhcHBtZXNoLWNvbnRyb2xsZXInXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdHJhY2luZzoge1xuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRoaXMub3B0aW9ucy5lbmFibGVUcmFjaW5nLFxuICAgICAgICAgICAgICAgIHByb3ZpZGVyOiB0aGlzLm9wdGlvbnMudHJhY2luZ1Byb3ZpZGVyLFxuICAgICAgICAgICAgICAgIGFkZHJlc3M6IHRoaXMub3B0aW9ucy50cmFjaW5nQWRkcmVzcyxcbiAgICAgICAgICAgICAgICBwb3J0OiB0aGlzLm9wdGlvbnMudHJhY2luZ1BvcnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YWx1ZXMgPSBtZXJnZSh2YWx1ZXMsIHRoaXMucHJvcHMudmFsdWVzID8/IHt9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGNoYXJ0ID0gdGhpcy5hZGRIZWxtQ2hhcnQoY2x1c3RlckluZm8sIHZhbHVlcyk7XG4gICAgICAgIGNoYXJ0Lm5vZGUuYWRkRGVwZW5kZW5jeShzYSk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2hhcnQpO1xuICAgIH1cbn0iXX0=