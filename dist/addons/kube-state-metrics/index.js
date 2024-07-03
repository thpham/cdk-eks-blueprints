"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KubeStateMetricsAddOn = void 0;
const ts_deepmerge_1 = require("ts-deepmerge");
const utils_1 = require("../../utils");
const helm_addon_1 = require("../helm-addon");
/**
 * Default props to be used when creating the Helm chart
 */
const defaultProps = {
    name: "kube-state-metrics",
    namespace: "kube-system",
    chart: "kube-state-metrics",
    version: "5.21.0",
    release: "kube-state-metrics",
    repository: "https://prometheus-community.github.io/helm-charts",
    values: {},
    createNamespace: true
};
/**
 * Main class to instantiate the Helm chart
 */
let KubeStateMetricsAddOn = class KubeStateMetricsAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a;
        const cluster = clusterInfo.cluster;
        let values = populateValues(this.options);
        values = (0, ts_deepmerge_1.merge)(values, (_a = this.props.values) !== null && _a !== void 0 ? _a : {});
        const chart = this.addHelmChart(clusterInfo, values);
        if (this.options.createNamespace == true) {
            // Let CDK Create the Namespace
            const namespace = (0, utils_1.createNamespace)(this.options.namespace, cluster);
            chart.node.addDependency(namespace);
        }
        return Promise.resolve(chart);
    }
};
exports.KubeStateMetricsAddOn = KubeStateMetricsAddOn;
exports.KubeStateMetricsAddOn = KubeStateMetricsAddOn = __decorate([
    utils_1.supportsALL
], KubeStateMetricsAddOn);
/**
 * populateValues populates the appropriate values used to customize the Helm chart
 * @param helmOptions User provided values to customize the chart
 */
function populateValues(helmOptions) {
    var _a;
    const values = (_a = helmOptions.values) !== null && _a !== void 0 ? _a : {};
    return values;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2t1YmUtc3RhdGUtbWV0cmljcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFFQSwrQ0FBcUM7QUFFckMsdUNBQTJEO0FBQzNELDhDQUE4RTtBQVc5RTs7R0FFRztBQUNILE1BQU0sWUFBWSxHQUFnRDtJQUNoRSxJQUFJLEVBQUUsb0JBQW9CO0lBQzFCLFNBQVMsRUFBRSxhQUFhO0lBQ3hCLEtBQUssRUFBRSxvQkFBb0I7SUFDM0IsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLG9CQUFvQjtJQUM3QixVQUFVLEVBQUcsb0RBQW9EO0lBQ2pFLE1BQU0sRUFBRSxFQUFFO0lBQ1YsZUFBZSxFQUFFLElBQUk7Q0FFdEIsQ0FBQztBQUVGOztHQUVHO0FBRUksSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBc0IsU0FBUSxzQkFBUztJQUlsRCxZQUFZLEtBQWtDO1FBQzVDLEtBQUssQ0FBQyxFQUFDLEdBQUcsWUFBWSxFQUFFLEdBQUcsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFtQyxDQUFDO0lBQzFELENBQUM7SUFFRCxNQUFNLENBQUMsV0FBd0I7O1FBQzdCLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDcEMsSUFBSSxNQUFNLEdBQVcsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxNQUFNLEdBQUcsSUFBQSxvQkFBSyxFQUFDLE1BQU0sRUFBRSxNQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxtQ0FBSSxFQUFFLENBQUMsQ0FBQztRQUNoRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNyRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ3ZDLCtCQUErQjtZQUMvQixNQUFNLFNBQVMsR0FBRyxJQUFBLHVCQUFlLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDcEUsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0YsQ0FBQTtBQXJCWSxzREFBcUI7Z0NBQXJCLHFCQUFxQjtJQURqQyxtQkFBVztHQUNDLHFCQUFxQixDQXFCakM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGNBQWMsQ0FBQyxXQUF1Qzs7SUFDN0QsTUFBTSxNQUFNLEdBQUcsTUFBQSxXQUFXLENBQUMsTUFBTSxtQ0FBSSxFQUFFLENBQUM7SUFDeEMsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGxpYi9jZXJ0bWFuYWdlcl9hZGRvbi50c1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcclxuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tIFwidHMtZGVlcG1lcmdlXCI7XHJcbmltcG9ydCB7IENsdXN0ZXJJbmZvLCBWYWx1ZXMgfSBmcm9tIFwiLi4vLi4vc3BpXCI7XHJcbmltcG9ydCB7IGNyZWF0ZU5hbWVzcGFjZSwgc3VwcG9ydHNBTEwgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcclxuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Qcm9wcywgSGVsbUFkZE9uVXNlclByb3BzIH0gZnJvbSBcIi4uL2hlbG0tYWRkb25cIjtcclxuLyoqXHJcbiAqIFVzZXIgcHJvdmlkZWQgb3B0aW9uIGZvciB0aGUgSGVsbSBDaGFydFxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBLdWJlU3RhdGVNZXRyaWNzQWRkT25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7XHJcbiAgICAvKipcclxuICAgICAqIFRvIENyZWF0ZSBOYW1lc3BhY2UgdXNpbmcgQ0RLXHJcbiAgICAgKi8gICAgXHJcbiAgICBjcmVhdGVOYW1lc3BhY2U/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogRGVmYXVsdCBwcm9wcyB0byBiZSB1c2VkIHdoZW4gY3JlYXRpbmcgdGhlIEhlbG0gY2hhcnRcclxuICovXHJcbmNvbnN0IGRlZmF1bHRQcm9wczogSGVsbUFkZE9uUHJvcHMgJiBLdWJlU3RhdGVNZXRyaWNzQWRkT25Qcm9wcyA9IHtcclxuICBuYW1lOiBcImt1YmUtc3RhdGUtbWV0cmljc1wiLFxyXG4gIG5hbWVzcGFjZTogXCJrdWJlLXN5c3RlbVwiLFxyXG4gIGNoYXJ0OiBcImt1YmUtc3RhdGUtbWV0cmljc1wiLFxyXG4gIHZlcnNpb246IFwiNS4yMS4wXCIsXHJcbiAgcmVsZWFzZTogXCJrdWJlLXN0YXRlLW1ldHJpY3NcIixcclxuICByZXBvc2l0b3J5OiAgXCJodHRwczovL3Byb21ldGhldXMtY29tbXVuaXR5LmdpdGh1Yi5pby9oZWxtLWNoYXJ0c1wiLFxyXG4gIHZhbHVlczoge30sXHJcbiAgY3JlYXRlTmFtZXNwYWNlOiB0cnVlXHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1haW4gY2xhc3MgdG8gaW5zdGFudGlhdGUgdGhlIEhlbG0gY2hhcnRcclxuICovXHJcbkBzdXBwb3J0c0FMTFxyXG5leHBvcnQgY2xhc3MgS3ViZVN0YXRlTWV0cmljc0FkZE9uIGV4dGVuZHMgSGVsbUFkZE9uIHtcclxuXHJcbiAgcmVhZG9ubHkgb3B0aW9uczogS3ViZVN0YXRlTWV0cmljc0FkZE9uUHJvcHM7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzPzogS3ViZVN0YXRlTWV0cmljc0FkZE9uUHJvcHMpIHtcclxuICAgIHN1cGVyKHsuLi5kZWZhdWx0UHJvcHMsIC4uLnByb3BzfSk7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzIGFzIEt1YmVTdGF0ZU1ldHJpY3NBZGRPblByb3BzO1xyXG4gIH1cclxuXHJcbiAgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFByb21pc2U8Q29uc3RydWN0PiB7XHJcbiAgICBjb25zdCBjbHVzdGVyID0gY2x1c3RlckluZm8uY2x1c3RlcjtcclxuICAgIGxldCB2YWx1ZXM6IFZhbHVlcyA9IHBvcHVsYXRlVmFsdWVzKHRoaXMub3B0aW9ucyk7XHJcbiAgICB2YWx1ZXMgPSBtZXJnZSh2YWx1ZXMsIHRoaXMucHJvcHMudmFsdWVzID8/IHt9KTtcclxuICAgIGNvbnN0IGNoYXJ0ID0gdGhpcy5hZGRIZWxtQ2hhcnQoY2x1c3RlckluZm8sIHZhbHVlcyk7XHJcbiAgICBpZiAodGhpcy5vcHRpb25zLmNyZWF0ZU5hbWVzcGFjZSA9PSB0cnVlKSB7XHJcbiAgICAgICAgLy8gTGV0IENESyBDcmVhdGUgdGhlIE5hbWVzcGFjZVxyXG4gICAgICAgIGNvbnN0IG5hbWVzcGFjZSA9IGNyZWF0ZU5hbWVzcGFjZSh0aGlzLm9wdGlvbnMubmFtZXNwYWNlISwgY2x1c3Rlcik7XHJcbiAgICAgICAgY2hhcnQubm9kZS5hZGREZXBlbmRlbmN5KG5hbWVzcGFjZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNoYXJ0KTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBwb3B1bGF0ZVZhbHVlcyBwb3B1bGF0ZXMgdGhlIGFwcHJvcHJpYXRlIHZhbHVlcyB1c2VkIHRvIGN1c3RvbWl6ZSB0aGUgSGVsbSBjaGFydFxyXG4gKiBAcGFyYW0gaGVsbU9wdGlvbnMgVXNlciBwcm92aWRlZCB2YWx1ZXMgdG8gY3VzdG9taXplIHRoZSBjaGFydFxyXG4gKi9cclxuZnVuY3Rpb24gcG9wdWxhdGVWYWx1ZXMoaGVsbU9wdGlvbnM6IEt1YmVTdGF0ZU1ldHJpY3NBZGRPblByb3BzKTogVmFsdWVzIHtcclxuICBjb25zdCB2YWx1ZXMgPSBoZWxtT3B0aW9ucy52YWx1ZXMgPz8ge307XHJcbiAgcmV0dXJuIHZhbHVlcztcclxufVxyXG4iXX0=