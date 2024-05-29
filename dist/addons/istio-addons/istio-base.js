"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IstioBaseAddOn = exports.ISTIO_VERSION = void 0;
const helm_addon_1 = require("../helm-addon");
const namespace_utils_1 = require("../../utils/namespace-utils");
const ts_deepmerge_1 = require("ts-deepmerge");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const utils_1 = require("../../utils");
exports.ISTIO_VERSION = "1.20.3";
/**
 * Defaults options for the add-on
 */
const defaultProps = {
    name: "istio-base",
    release: "istio-base",
    namespace: "istio-system",
    chart: "base",
    version: exports.ISTIO_VERSION,
    repository: "https://istio-release.storage.googleapis.com/charts"
};
let IstioBaseAddOn = class IstioBaseAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a;
        const cluster = clusterInfo.cluster;
        // Istio Namespace
        const namespace = (0, namespace_utils_1.createNamespace)('istio-system', cluster);
        let values = {
            global: {
                istiod: {
                    enableAnalysis: this.options.enableAnalysis
                },
                configValidation: this.options.configValidation,
                externalIstiod: this.options.externalIstiod,
                base: {
                    enableIstioConfigCRDs: this.options.enableIstioConfigCRDs
                }
            }
        };
        values = (0, ts_deepmerge_1.merge)(values, (_a = this.props.values) !== null && _a !== void 0 ? _a : {});
        const chart = this.addHelmChart(clusterInfo, values, undefined, true, aws_cdk_lib_1.Duration.seconds(60));
        chart.node.addDependency(namespace);
        return Promise.resolve(chart);
    }
};
exports.IstioBaseAddOn = IstioBaseAddOn;
exports.IstioBaseAddOn = IstioBaseAddOn = __decorate([
    utils_1.supportsALL
], IstioBaseAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXN0aW8tYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9hZGRvbnMvaXN0aW8tYWRkb25zL2lzdGlvLWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsOENBQThEO0FBRzlELGlFQUE4RDtBQUM5RCwrQ0FBcUM7QUFDckMsNkNBQXVDO0FBQ3ZDLHVDQUEwQztBQUU3QixRQUFBLGFBQWEsR0FBRyxRQUFRLENBQUM7QUE0Q3RDOztHQUVHO0FBQ0gsTUFBTSxZQUFZLEdBQUc7SUFDakIsSUFBSSxFQUFFLFlBQVk7SUFDbEIsT0FBTyxFQUFFLFlBQVk7SUFDckIsU0FBUyxFQUFFLGNBQWM7SUFDekIsS0FBSyxFQUFFLE1BQU07SUFDYixPQUFPLEVBQUUscUJBQWE7SUFDdEIsVUFBVSxFQUFFLHFEQUFxRDtDQUNwRSxDQUFDO0FBR0ssSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLHNCQUFTO0lBSXpDLFlBQVksS0FBMkI7UUFDbkMsS0FBSyxDQUFDLEVBQUUsR0FBRyxZQUFZLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUM5QixDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQXdCOztRQUUzQixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBRXBDLGtCQUFrQjtRQUNsQixNQUFNLFNBQVMsR0FBRyxJQUFBLGlDQUFlLEVBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRTNELElBQUksTUFBTSxHQUFXO1lBQ2pCLE1BQU0sRUFBRTtnQkFDSixNQUFNLEVBQUU7b0JBQ0osY0FBYyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYztpQkFDOUM7Z0JBQ0QsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0I7Z0JBQy9DLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWM7Z0JBQzNDLElBQUksRUFBRTtvQkFDRixxQkFBcUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQjtpQkFDNUQ7YUFDSjtTQUNKLENBQUM7UUFFRixNQUFNLEdBQUcsSUFBQSxvQkFBSyxFQUFDLE1BQU0sRUFBRSxNQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxtQ0FBSSxFQUFFLENBQUMsQ0FBQztRQUNoRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVGLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXBDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQ0osQ0FBQTtBQW5DWSx3Q0FBYzt5QkFBZCxjQUFjO0lBRDFCLG1CQUFXO0dBQ0MsY0FBYyxDQW1DMUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIZWxtQWRkT24sIEhlbG1BZGRPblVzZXJQcm9wcyB9IGZyb20gXCIuLi9oZWxtLWFkZG9uXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgQ2x1c3RlckluZm8sIFZhbHVlcyB9IGZyb20gXCIuLi8uLi9zcGlcIjtcbmltcG9ydCB7IGNyZWF0ZU5hbWVzcGFjZSB9IGZyb20gXCIuLi8uLi91dGlscy9uYW1lc3BhY2UtdXRpbHNcIjtcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSBcInRzLWRlZXBtZXJnZVwiO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IHN1cHBvcnRzQUxMIH0gZnJvbSBcIi4uLy4uL3V0aWxzXCI7XG5cbmV4cG9ydCBjb25zdCBJU1RJT19WRVJTSU9OID0gXCIxLjIwLjNcIjtcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBhZGQtb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSXN0aW9CYXNlQWRkT25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7XG4gICAgLyoqXG4gICAgKiBFbmFibGUgaXN0aW9jdGwgYW5hbHlzaXMgd2hpY2ggcHJvdmlkZXMgcmljaCBhbmFseXNpcyBvZiBJc3RpbyBjb25maWd1cmF0aW9uIHN0YXRlIGluIG9yZGVyIHRvIGlkZW50aXR5IGludmFsaWQgb3Igc3Vib3B0aW1hbCBjb25maWd1cmF0aW9ucy5cbiAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgKi9cbiAgICBlbmFibGVBbmFseXNpcz86IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAqICBFbmFibGUgdGhlIGlzdGlvIGJhc2UgY29uZmlnIHZhbGlkYXRpb24uXG4gICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgKi9cbiAgICBjb25maWdWYWxpZGF0aW9uPzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICogIElmIHRoaXMgaXMgc2V0IHRvIHRydWUsIG9uZSBJc3Rpb2Qgd2lsbCBjb250cm9sIHJlbW90ZSBjbHVzdGVycyBpbmNsdWRpbmcgQ0EuXG4gICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICovXG4gICAgZXh0ZXJuYWxJc3Rpb2Q/OiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgKiBUaGUgYWRkcmVzcyBvciBob3N0bmFtZSBvZiB0aGUgcmVtb3RlIHBpbG90XG4gICAgKiBAZGVmYXVsdCBudWxsXG4gICAgKi9cbiAgICByZW1vdGVQaWxvdEFkZHJlc3M/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAqIFZhbGlkYXRpb24gd2ViaG9vayBjb25maWd1cmF0aW9uIHVybFxuICAgICogRm9yIGV4YW1wbGU6IGh0dHBzOi8vJHJlbW90ZVBpbG90QWRkcmVzczoxNTAxNy92YWxpZGF0ZVxuICAgICogQGRlZmF1bHQgbnVsbFxuICAgICovXG4gICAgdmFsaWRhdGlvblVSTD86IHN0cmluZztcblxuICAgIC8qKlxuICAgICogRm9yIGlzdGlvY3RsIHVzYWdlIHRvIGRpc2FibGUgaXN0aW8gY29uZmlnIGNyZHMgaW4gYmFzZS5cbiAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAqL1xuICAgIGVuYWJsZUlzdGlvQ29uZmlnQ1JEcz86IGJvb2xlYW47XG59XG5cbi8qKlxuICogRGVmYXVsdHMgb3B0aW9ucyBmb3IgdGhlIGFkZC1vblxuICovXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gICAgbmFtZTogXCJpc3Rpby1iYXNlXCIsXG4gICAgcmVsZWFzZTogXCJpc3Rpby1iYXNlXCIsXG4gICAgbmFtZXNwYWNlOiBcImlzdGlvLXN5c3RlbVwiLFxuICAgIGNoYXJ0OiBcImJhc2VcIixcbiAgICB2ZXJzaW9uOiBJU1RJT19WRVJTSU9OLFxuICAgIHJlcG9zaXRvcnk6IFwiaHR0cHM6Ly9pc3Rpby1yZWxlYXNlLnN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vY2hhcnRzXCJcbn07XG5cbkBzdXBwb3J0c0FMTFxuZXhwb3J0IGNsYXNzIElzdGlvQmFzZUFkZE9uIGV4dGVuZHMgSGVsbUFkZE9uIHtcblxuICAgIHJlYWRvbmx5IG9wdGlvbnM6IElzdGlvQmFzZUFkZE9uUHJvcHM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IElzdGlvQmFzZUFkZE9uUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoeyAuLi5kZWZhdWx0UHJvcHMsIC4uLnByb3BzIH0pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzO1xuICAgIH1cblxuICAgIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xuXG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuXG4gICAgICAgIC8vIElzdGlvIE5hbWVzcGFjZVxuICAgICAgICBjb25zdCBuYW1lc3BhY2UgPSBjcmVhdGVOYW1lc3BhY2UoJ2lzdGlvLXN5c3RlbScsIGNsdXN0ZXIpO1xuXG4gICAgICAgIGxldCB2YWx1ZXM6IFZhbHVlcyA9IHtcbiAgICAgICAgICAgIGdsb2JhbDoge1xuICAgICAgICAgICAgICAgIGlzdGlvZDoge1xuICAgICAgICAgICAgICAgICAgICBlbmFibGVBbmFseXNpczogdGhpcy5vcHRpb25zLmVuYWJsZUFuYWx5c2lzXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb25maWdWYWxpZGF0aW9uOiB0aGlzLm9wdGlvbnMuY29uZmlnVmFsaWRhdGlvbixcbiAgICAgICAgICAgICAgICBleHRlcm5hbElzdGlvZDogdGhpcy5vcHRpb25zLmV4dGVybmFsSXN0aW9kLFxuICAgICAgICAgICAgICAgIGJhc2U6IHtcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlSXN0aW9Db25maWdDUkRzOiB0aGlzLm9wdGlvbnMuZW5hYmxlSXN0aW9Db25maWdDUkRzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhbHVlcyA9IG1lcmdlKHZhbHVlcywgdGhpcy5wcm9wcy52YWx1ZXMgPz8ge30pO1xuICAgICAgICBjb25zdCBjaGFydCA9IHRoaXMuYWRkSGVsbUNoYXJ0KGNsdXN0ZXJJbmZvLCB2YWx1ZXMsIHVuZGVmaW5lZCwgdHJ1ZSwgRHVyYXRpb24uc2Vjb25kcyg2MCkpO1xuICAgICAgICBjaGFydC5ub2RlLmFkZERlcGVuZGVuY3kobmFtZXNwYWNlKTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNoYXJ0KTtcbiAgICB9XG59XG4iXX0=