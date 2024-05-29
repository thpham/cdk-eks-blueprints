"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrometheusNodeExporterAddOn = void 0;
const ts_deepmerge_1 = require("ts-deepmerge");
const utils_1 = require("../../utils");
const helm_addon_1 = require("../helm-addon");
/**
 * Default props to be used when creating the Helm chart
 */
const defaultProps = {
    name: "prometheus-node-exporter",
    namespace: "prometheus-node-exporter",
    chart: "prometheus-node-exporter",
    version: "4.31.0",
    release: "prometheus-node-exporter",
    repository: "https://prometheus-community.github.io/helm-charts",
    values: {},
    createNamespace: true
};
/**
 * Main class to instantiate the Helm chart
 */
let PrometheusNodeExporterAddOn = class PrometheusNodeExporterAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a;
        const cluster = clusterInfo.cluster;
        let values = populateValues(this.options);
        values = (0, ts_deepmerge_1.merge)(values, (_a = this.props.values) !== null && _a !== void 0 ? _a : {});
        if (this.options.createNamespace == true) {
            // Let CDK Create the Namespace
            const namespace = (0, utils_1.createNamespace)(this.options.namespace, cluster);
            const chart = this.addHelmChart(clusterInfo, values);
            chart.node.addDependency(namespace);
            return Promise.resolve(chart);
        }
        else {
            //Namespace is already created
            const chart = this.addHelmChart(clusterInfo, values);
            return Promise.resolve(chart);
        }
    }
};
exports.PrometheusNodeExporterAddOn = PrometheusNodeExporterAddOn;
exports.PrometheusNodeExporterAddOn = PrometheusNodeExporterAddOn = __decorate([
    utils_1.supportsALL
], PrometheusNodeExporterAddOn);
/**
 * populateValues populates the appropriate values used to customize the Helm chart
 * @param helmOptions User provided values to customize the chart
 */
function populateValues(helmOptions) {
    var _a;
    const values = (_a = helmOptions.values) !== null && _a !== void 0 ? _a : {};
    return values;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL3Byb21ldGhldXMtbm9kZS1leHBvcnRlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFFQSwrQ0FBcUM7QUFFckMsdUNBQTJEO0FBQzNELDhDQUE4RTtBQVc5RTs7R0FFRztBQUNILE1BQU0sWUFBWSxHQUFzRDtJQUN0RSxJQUFJLEVBQUUsMEJBQTBCO0lBQ2hDLFNBQVMsRUFBRSwwQkFBMEI7SUFDckMsS0FBSyxFQUFFLDBCQUEwQjtJQUNqQyxPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsMEJBQTBCO0lBQ25DLFVBQVUsRUFBRyxvREFBb0Q7SUFDakUsTUFBTSxFQUFFLEVBQUU7SUFDVixlQUFlLEVBQUUsSUFBSTtDQUV0QixDQUFDO0FBRUY7O0dBRUc7QUFFSSxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFTO0lBSXhELFlBQVksS0FBd0M7UUFDbEQsS0FBSyxDQUFDLEVBQUMsR0FBRyxZQUFZLEVBQUUsR0FBRyxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQXlDLENBQUM7SUFDaEUsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUF3Qjs7UUFDN0IsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUNwQyxJQUFJLE1BQU0sR0FBVyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELE1BQU0sR0FBRyxJQUFBLG9CQUFLLEVBQUMsTUFBTSxFQUFFLE1BQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLG1DQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRWhELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLElBQUksSUFBSSxFQUFDLENBQUM7WUFDeEMsK0JBQStCO1lBQy9CLE1BQU0sU0FBUyxHQUFHLElBQUEsdUJBQWUsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVUsRUFBRyxPQUFPLENBQUMsQ0FBQztZQUNyRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNyRCxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFaEMsQ0FBQzthQUFNLENBQUM7WUFDTiw4QkFBOEI7WUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDckQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLENBQUM7SUFFSCxDQUFDO0NBQ0YsQ0FBQTtBQTVCWSxrRUFBMkI7c0NBQTNCLDJCQUEyQjtJQUR2QyxtQkFBVztHQUNDLDJCQUEyQixDQTRCdkM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGNBQWMsQ0FBQyxXQUE2Qzs7SUFDbkUsTUFBTSxNQUFNLEdBQUcsTUFBQSxXQUFXLENBQUMsTUFBTSxtQ0FBSSxFQUFFLENBQUM7SUFDeEMsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGxpYi9jZXJ0bWFuYWdlcl9hZGRvbi50c1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcclxuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tIFwidHMtZGVlcG1lcmdlXCI7XHJcbmltcG9ydCB7IENsdXN0ZXJJbmZvLCBWYWx1ZXMgfSBmcm9tIFwiLi4vLi4vc3BpXCI7XHJcbmltcG9ydCB7IGNyZWF0ZU5hbWVzcGFjZSwgc3VwcG9ydHNBTEwgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcclxuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Qcm9wcywgSGVsbUFkZE9uVXNlclByb3BzIH0gZnJvbSBcIi4uL2hlbG0tYWRkb25cIjtcclxuLyoqXHJcbiAqIFVzZXIgcHJvdmlkZWQgb3B0aW9uIGZvciB0aGUgSGVsbSBDaGFydFxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBQcm9tZXRoZXVzTm9kZUV4cG9ydGVyQWRkT25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7XHJcbiAgICAvKipcclxuICAgICAqIFRvIENyZWF0ZSBOYW1lc3BhY2UgdXNpbmcgQ0RLXHJcbiAgICAgKi8gICAgXHJcbiAgICBjcmVhdGVOYW1lc3BhY2U/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogRGVmYXVsdCBwcm9wcyB0byBiZSB1c2VkIHdoZW4gY3JlYXRpbmcgdGhlIEhlbG0gY2hhcnRcclxuICovXHJcbmNvbnN0IGRlZmF1bHRQcm9wczogSGVsbUFkZE9uUHJvcHMgJiBQcm9tZXRoZXVzTm9kZUV4cG9ydGVyQWRkT25Qcm9wcyA9IHtcclxuICBuYW1lOiBcInByb21ldGhldXMtbm9kZS1leHBvcnRlclwiLFxyXG4gIG5hbWVzcGFjZTogXCJwcm9tZXRoZXVzLW5vZGUtZXhwb3J0ZXJcIixcclxuICBjaGFydDogXCJwcm9tZXRoZXVzLW5vZGUtZXhwb3J0ZXJcIixcclxuICB2ZXJzaW9uOiBcIjQuMzEuMFwiLFxyXG4gIHJlbGVhc2U6IFwicHJvbWV0aGV1cy1ub2RlLWV4cG9ydGVyXCIsXHJcbiAgcmVwb3NpdG9yeTogIFwiaHR0cHM6Ly9wcm9tZXRoZXVzLWNvbW11bml0eS5naXRodWIuaW8vaGVsbS1jaGFydHNcIixcclxuICB2YWx1ZXM6IHt9LFxyXG4gIGNyZWF0ZU5hbWVzcGFjZTogdHJ1ZVxyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBNYWluIGNsYXNzIHRvIGluc3RhbnRpYXRlIHRoZSBIZWxtIGNoYXJ0XHJcbiAqL1xyXG5Ac3VwcG9ydHNBTExcclxuZXhwb3J0IGNsYXNzIFByb21ldGhldXNOb2RlRXhwb3J0ZXJBZGRPbiBleHRlbmRzIEhlbG1BZGRPbiB7XHJcblxyXG4gIHJlYWRvbmx5IG9wdGlvbnM6IFByb21ldGhldXNOb2RlRXhwb3J0ZXJBZGRPblByb3BzO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcz86IFByb21ldGhldXNOb2RlRXhwb3J0ZXJBZGRPblByb3BzKSB7XHJcbiAgICBzdXBlcih7Li4uZGVmYXVsdFByb3BzLCAuLi5wcm9wc30pO1xyXG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5wcm9wcyBhcyBQcm9tZXRoZXVzTm9kZUV4cG9ydGVyQWRkT25Qcm9wcztcclxuICB9XHJcblxyXG4gIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xyXG4gICAgY29uc3QgY2x1c3RlciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXI7XHJcbiAgICBsZXQgdmFsdWVzOiBWYWx1ZXMgPSBwb3B1bGF0ZVZhbHVlcyh0aGlzLm9wdGlvbnMpO1xyXG4gICAgdmFsdWVzID0gbWVyZ2UodmFsdWVzLCB0aGlzLnByb3BzLnZhbHVlcyA/PyB7fSk7XHJcblxyXG4gICAgaWYoIHRoaXMub3B0aW9ucy5jcmVhdGVOYW1lc3BhY2UgPT0gdHJ1ZSl7XHJcbiAgICAgIC8vIExldCBDREsgQ3JlYXRlIHRoZSBOYW1lc3BhY2VcclxuICAgICAgY29uc3QgbmFtZXNwYWNlID0gY3JlYXRlTmFtZXNwYWNlKHRoaXMub3B0aW9ucy5uYW1lc3BhY2UhICwgY2x1c3Rlcik7XHJcbiAgICAgIGNvbnN0IGNoYXJ0ID0gdGhpcy5hZGRIZWxtQ2hhcnQoY2x1c3RlckluZm8sIHZhbHVlcyk7XHJcbiAgICAgIGNoYXJ0Lm5vZGUuYWRkRGVwZW5kZW5jeShuYW1lc3BhY2UpO1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNoYXJ0KTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvL05hbWVzcGFjZSBpcyBhbHJlYWR5IGNyZWF0ZWRcclxuICAgICAgY29uc3QgY2hhcnQgPSB0aGlzLmFkZEhlbG1DaGFydChjbHVzdGVySW5mbywgdmFsdWVzKTtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFydCk7XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBwb3B1bGF0ZVZhbHVlcyBwb3B1bGF0ZXMgdGhlIGFwcHJvcHJpYXRlIHZhbHVlcyB1c2VkIHRvIGN1c3RvbWl6ZSB0aGUgSGVsbSBjaGFydFxyXG4gKiBAcGFyYW0gaGVsbU9wdGlvbnMgVXNlciBwcm92aWRlZCB2YWx1ZXMgdG8gY3VzdG9taXplIHRoZSBjaGFydFxyXG4gKi9cclxuZnVuY3Rpb24gcG9wdWxhdGVWYWx1ZXMoaGVsbU9wdGlvbnM6IFByb21ldGhldXNOb2RlRXhwb3J0ZXJBZGRPblByb3BzKTogVmFsdWVzIHtcclxuICBjb25zdCB2YWx1ZXMgPSBoZWxtT3B0aW9ucy52YWx1ZXMgPz8ge307XHJcbiAgcmV0dXJuIHZhbHVlcztcclxufVxyXG4iXX0=