"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertManagerAddOn = void 0;
const ts_deepmerge_1 = require("ts-deepmerge");
const utils_1 = require("../../utils");
const object_utils_1 = require("../../utils/object-utils");
const helm_addon_1 = require("../helm-addon");
const aws_loadbalancer_controller_1 = require("../aws-loadbalancer-controller");
/**
 * Default props to be used when creating the Helm chart
 */
const defaultProps = {
    name: "blueprints-cert-manager-addon",
    namespace: "cert-manager",
    chart: "cert-manager",
    version: "1.14.3",
    release: "cert-manager",
    repository: "https://charts.jetstack.io",
    values: {},
    installCRDs: true, //To automatically install and manage the CRDs as part of your Helm release,
    createNamespace: true
};
/**
 * Main class to instantiate the Helm chart
 */
let CertManagerAddOn = class CertManagerAddOn extends helm_addon_1.HelmAddOn {
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
exports.CertManagerAddOn = CertManagerAddOn;
__decorate([
    (0, utils_1.dependable)(aws_loadbalancer_controller_1.AwsLoadBalancerControllerAddOn.name)
], CertManagerAddOn.prototype, "deploy", null);
exports.CertManagerAddOn = CertManagerAddOn = __decorate([
    utils_1.supportsALL
], CertManagerAddOn);
/**
 * populateValues populates the appropriate values used to customize the Helm chart
 * @param helmOptions User provided values to customize the chart
 */
function populateValues(helmOptions) {
    var _a;
    const values = (_a = helmOptions.values) !== null && _a !== void 0 ? _a : {};
    (0, object_utils_1.setPath)(values, "installCRDs", helmOptions.installCRDs);
    return values;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2NlcnQtbWFuYWdlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFFQSwrQ0FBcUM7QUFFckMsdUNBQXVFO0FBQ3ZFLDJEQUFtRDtBQUNuRCw4Q0FBOEU7QUFDOUUsZ0ZBQWdGO0FBZWhGOztHQUVHO0FBQ0gsTUFBTSxZQUFZLEdBQTJDO0lBQzNELElBQUksRUFBRSwrQkFBK0I7SUFDckMsU0FBUyxFQUFFLGNBQWM7SUFDekIsS0FBSyxFQUFFLGNBQWM7SUFDckIsT0FBTyxFQUFFLFFBQVE7SUFDakIsT0FBTyxFQUFFLGNBQWM7SUFDdkIsVUFBVSxFQUFHLDRCQUE0QjtJQUN6QyxNQUFNLEVBQUUsRUFBRTtJQUNWLFdBQVcsRUFBRSxJQUFJLEVBQUUsNEVBQTRFO0lBQy9GLGVBQWUsRUFBRSxJQUFJO0NBRXRCLENBQUM7QUFFRjs7R0FFRztBQUVJLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWlCLFNBQVEsc0JBQVM7SUFJN0MsWUFBWSxLQUE2QjtRQUN2QyxLQUFLLENBQUMsRUFBQyxHQUFHLFlBQVksRUFBRSxHQUFHLEtBQUssRUFBQyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBOEIsQ0FBQztJQUNyRCxDQUFDO0lBR0QsTUFBTSxDQUFDLFdBQXdCOztRQUM3QixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3BDLElBQUksTUFBTSxHQUFXLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEQsTUFBTSxHQUFHLElBQUEsb0JBQUssRUFBQyxNQUFNLEVBQUUsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sbUNBQUksRUFBRSxDQUFDLENBQUM7UUFFaEQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsSUFBSSxJQUFJLEVBQUMsQ0FBQztZQUN4QywrQkFBK0I7WUFDL0IsTUFBTSxTQUFTLEdBQUcsSUFBQSx1QkFBZSxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBVSxFQUFHLE9BQU8sQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3JELEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVoQyxDQUFDO2FBQU0sQ0FBQztZQUNOLDhCQUE4QjtZQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNyRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEMsQ0FBQztJQUVILENBQUM7Q0FDRixDQUFBO0FBN0JZLDRDQUFnQjtBQVUzQjtJQURDLElBQUEsa0JBQVUsRUFBQyw0REFBOEIsQ0FBQyxJQUFJLENBQUM7OENBbUIvQzsyQkE1QlUsZ0JBQWdCO0lBRDVCLG1CQUFXO0dBQ0MsZ0JBQWdCLENBNkI1QjtBQUVEOzs7R0FHRztBQUNILFNBQVMsY0FBYyxDQUFDLFdBQWtDOztJQUN4RCxNQUFNLE1BQU0sR0FBRyxNQUFBLFdBQVcsQ0FBQyxNQUFNLG1DQUFJLEVBQUUsQ0FBQztJQUN4QyxJQUFBLHNCQUFPLEVBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekQsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGxpYi9jZXJ0bWFuYWdlcl9hZGRvbi50c1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcclxuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tIFwidHMtZGVlcG1lcmdlXCI7XHJcbmltcG9ydCB7IENsdXN0ZXJJbmZvLCBWYWx1ZXMgfSBmcm9tIFwiLi4vLi4vc3BpXCI7XHJcbmltcG9ydCB7IGNyZWF0ZU5hbWVzcGFjZSwgZGVwZW5kYWJsZSwgc3VwcG9ydHNBTEwgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcclxuaW1wb3J0IHsgc2V0UGF0aCB9IGZyb20gJy4uLy4uL3V0aWxzL29iamVjdC11dGlscyc7XHJcbmltcG9ydCB7IEhlbG1BZGRPbiwgSGVsbUFkZE9uUHJvcHMsIEhlbG1BZGRPblVzZXJQcm9wcyB9IGZyb20gXCIuLi9oZWxtLWFkZG9uXCI7XHJcbmltcG9ydCB7IEF3c0xvYWRCYWxhbmNlckNvbnRyb2xsZXJBZGRPbiB9IGZyb20gJy4uL2F3cy1sb2FkYmFsYW5jZXItY29udHJvbGxlcic7XHJcbi8qKlxyXG4gKiBVc2VyIHByb3ZpZGVkIG9wdGlvbnMgZm9yIHRoZSBIZWxtIENoYXJ0XHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIENlcnRNYW5hZ2VyQWRkT25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7XHJcbiAgICAvKipcclxuICAgICAqIFRvIGF1dG9tYXRpY2FsbHkgaW5zdGFsbCBhbmQgbWFuYWdlIHRoZSBDUkRzIGFzIHBhcnQgb2YgeW91ciBIZWxtIHJlbGVhc2UsXHJcbiAgICAgKi8gICAgXHJcbiAgICBpbnN0YWxsQ1JEcz86IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIFRvIENyZWF0ZSBOYW1lc3BhY2UgdXNpbmcgQ0RLXHJcbiAgICAgKi8gICAgXHJcbiAgICBjcmVhdGVOYW1lc3BhY2U/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogRGVmYXVsdCBwcm9wcyB0byBiZSB1c2VkIHdoZW4gY3JlYXRpbmcgdGhlIEhlbG0gY2hhcnRcclxuICovXHJcbmNvbnN0IGRlZmF1bHRQcm9wczogSGVsbUFkZE9uUHJvcHMgJiBDZXJ0TWFuYWdlckFkZE9uUHJvcHMgPSB7XHJcbiAgbmFtZTogXCJibHVlcHJpbnRzLWNlcnQtbWFuYWdlci1hZGRvblwiLFxyXG4gIG5hbWVzcGFjZTogXCJjZXJ0LW1hbmFnZXJcIixcclxuICBjaGFydDogXCJjZXJ0LW1hbmFnZXJcIixcclxuICB2ZXJzaW9uOiBcIjEuMTQuM1wiLFxyXG4gIHJlbGVhc2U6IFwiY2VydC1tYW5hZ2VyXCIsXHJcbiAgcmVwb3NpdG9yeTogIFwiaHR0cHM6Ly9jaGFydHMuamV0c3RhY2suaW9cIixcclxuICB2YWx1ZXM6IHt9LFxyXG4gIGluc3RhbGxDUkRzOiB0cnVlLCAvL1RvIGF1dG9tYXRpY2FsbHkgaW5zdGFsbCBhbmQgbWFuYWdlIHRoZSBDUkRzIGFzIHBhcnQgb2YgeW91ciBIZWxtIHJlbGVhc2UsXHJcbiAgY3JlYXRlTmFtZXNwYWNlOiB0cnVlXHJcblxyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1haW4gY2xhc3MgdG8gaW5zdGFudGlhdGUgdGhlIEhlbG0gY2hhcnRcclxuICovXHJcbkBzdXBwb3J0c0FMTFxyXG5leHBvcnQgY2xhc3MgQ2VydE1hbmFnZXJBZGRPbiBleHRlbmRzIEhlbG1BZGRPbiB7XHJcblxyXG4gIHJlYWRvbmx5IG9wdGlvbnM6IENlcnRNYW5hZ2VyQWRkT25Qcm9wcztcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHM/OiBDZXJ0TWFuYWdlckFkZE9uUHJvcHMpIHtcclxuICAgIHN1cGVyKHsuLi5kZWZhdWx0UHJvcHMsIC4uLnByb3BzfSk7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzIGFzIENlcnRNYW5hZ2VyQWRkT25Qcm9wcztcclxuICB9XHJcblxyXG4gIEBkZXBlbmRhYmxlKEF3c0xvYWRCYWxhbmNlckNvbnRyb2xsZXJBZGRPbi5uYW1lKVxyXG4gIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xyXG4gICAgY29uc3QgY2x1c3RlciA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXI7XHJcbiAgICBsZXQgdmFsdWVzOiBWYWx1ZXMgPSBwb3B1bGF0ZVZhbHVlcyh0aGlzLm9wdGlvbnMpO1xyXG4gICAgdmFsdWVzID0gbWVyZ2UodmFsdWVzLCB0aGlzLnByb3BzLnZhbHVlcyA/PyB7fSk7XHJcblxyXG4gICAgaWYoIHRoaXMub3B0aW9ucy5jcmVhdGVOYW1lc3BhY2UgPT0gdHJ1ZSl7XHJcbiAgICAgIC8vIExldCBDREsgQ3JlYXRlIHRoZSBOYW1lc3BhY2VcclxuICAgICAgY29uc3QgbmFtZXNwYWNlID0gY3JlYXRlTmFtZXNwYWNlKHRoaXMub3B0aW9ucy5uYW1lc3BhY2UhICwgY2x1c3Rlcik7XHJcbiAgICAgIGNvbnN0IGNoYXJ0ID0gdGhpcy5hZGRIZWxtQ2hhcnQoY2x1c3RlckluZm8sIHZhbHVlcyk7XHJcbiAgICAgIGNoYXJ0Lm5vZGUuYWRkRGVwZW5kZW5jeShuYW1lc3BhY2UpO1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNoYXJ0KTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvL05hbWVzcGFjZSBpcyBhbHJlYWR5IGNyZWF0ZWRcclxuICAgICAgY29uc3QgY2hhcnQgPSB0aGlzLmFkZEhlbG1DaGFydChjbHVzdGVySW5mbywgdmFsdWVzKTtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFydCk7XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBwb3B1bGF0ZVZhbHVlcyBwb3B1bGF0ZXMgdGhlIGFwcHJvcHJpYXRlIHZhbHVlcyB1c2VkIHRvIGN1c3RvbWl6ZSB0aGUgSGVsbSBjaGFydFxyXG4gKiBAcGFyYW0gaGVsbU9wdGlvbnMgVXNlciBwcm92aWRlZCB2YWx1ZXMgdG8gY3VzdG9taXplIHRoZSBjaGFydFxyXG4gKi9cclxuZnVuY3Rpb24gcG9wdWxhdGVWYWx1ZXMoaGVsbU9wdGlvbnM6IENlcnRNYW5hZ2VyQWRkT25Qcm9wcyk6IFZhbHVlcyB7XHJcbiAgY29uc3QgdmFsdWVzID0gaGVsbU9wdGlvbnMudmFsdWVzID8/IHt9O1xyXG4gIHNldFBhdGgodmFsdWVzLCBcImluc3RhbGxDUkRzXCIsICBoZWxtT3B0aW9ucy5pbnN0YWxsQ1JEcyk7XHJcbiAgcmV0dXJuIHZhbHVlcztcclxufVxyXG4iXX0=