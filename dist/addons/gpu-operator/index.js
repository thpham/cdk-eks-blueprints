"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GpuOperatorAddon = void 0;
const ts_deepmerge_1 = require("ts-deepmerge");
const utils_1 = require("../../utils");
const helm_addon_1 = require("../helm-addon");
/**
 * Default props to be used when creating the Helm chart
 */
const defaultProps = {
    name: "gpu-operator-addon",
    namespace: "gpu-operator",
    chart: "gpu-operator",
    version: "v24.3.0",
    release: "nvidia-gpu-operator",
    repository: "https://helm.ngc.nvidia.com/nvidia",
    createNamespace: true,
    values: {}
};
/**
 * Main class to instantiate the Helm chart for NVIDIA GPU operator
 * GPU operator manages the software and drivers needed for GPU accelerated workloads
 * It validates all requisite software is installed before scheduling GPU workload
 * Using MIG (Multi Instance GPUs) allows you to virtually split your GPU into multiple units
 */
let GpuOperatorAddon = class GpuOperatorAddon extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a, _b;
        const cluster = clusterInfo.cluster;
        let values = (_a = this.options.values) !== null && _a !== void 0 ? _a : {};
        values = (0, ts_deepmerge_1.merge)(values, (_b = this.props.values) !== null && _b !== void 0 ? _b : {});
        const chart = this.addHelmChart(clusterInfo, values);
        if (this.options.createNamespace == true) {
            // Let CDK Create the Namespace
            const namespace = (0, utils_1.createNamespace)(this.options.namespace, cluster);
            chart.node.addDependency(namespace);
        }
        return Promise.resolve(chart);
    }
};
exports.GpuOperatorAddon = GpuOperatorAddon;
exports.GpuOperatorAddon = GpuOperatorAddon = __decorate([
    utils_1.supportsALL
], GpuOperatorAddon);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2dwdS1vcGVyYXRvci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFDQSwrQ0FBcUM7QUFFckMsdUNBQTJEO0FBQzNELDhDQUE4RTtBQWM5RTs7R0FFRztBQUNILE1BQU0sWUFBWSxHQUEyQztJQUN6RCxJQUFJLEVBQUUsb0JBQW9CO0lBQzFCLFNBQVMsRUFBRSxjQUFjO0lBQ3pCLEtBQUssRUFBRSxjQUFjO0lBQ3JCLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLE9BQU8sRUFBRSxxQkFBcUI7SUFDOUIsVUFBVSxFQUFHLG9DQUFvQztJQUNqRCxlQUFlLEVBQUUsSUFBSTtJQUNyQixNQUFNLEVBQUUsRUFBRTtDQUNiLENBQUM7QUFFRjs7Ozs7R0FLRztBQUVJLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWlCLFNBQVEsc0JBQVM7SUFJN0MsWUFBWSxLQUE2QjtRQUN2QyxLQUFLLENBQUMsRUFBQyxHQUFHLFlBQVksRUFBRSxHQUFHLEtBQUssRUFBQyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBOEIsQ0FBQztJQUNyRCxDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQXdCOztRQUM3QixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3BDLElBQUksTUFBTSxHQUFXLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLG1DQUFJLEVBQUUsQ0FBQztRQUMvQyxNQUFNLEdBQUcsSUFBQSxvQkFBSyxFQUFDLE1BQU0sRUFBRSxNQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxtQ0FBSSxFQUFFLENBQUMsQ0FBQztRQUNoRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVyRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxJQUFJLElBQUksRUFBQyxDQUFDO1lBQ3hDLCtCQUErQjtZQUMvQixNQUFNLFNBQVMsR0FBRyxJQUFBLHVCQUFlLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFVLEVBQUcsT0FBTyxDQUFDLENBQUM7WUFDckUsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0YsQ0FBQTtBQXRCWSw0Q0FBZ0I7MkJBQWhCLGdCQUFnQjtJQUQ1QixtQkFBVztHQUNDLGdCQUFnQixDQXNCNUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSBcInRzLWRlZXBtZXJnZVwiO1xuaW1wb3J0IHsgQ2x1c3RlckluZm8sIFZhbHVlcyB9IGZyb20gXCIuLi8uLi9zcGlcIjtcbmltcG9ydCB7IGNyZWF0ZU5hbWVzcGFjZSwgc3VwcG9ydHNBTEwgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcbmltcG9ydCB7IEhlbG1BZGRPbiwgSGVsbUFkZE9uUHJvcHMsIEhlbG1BZGRPblVzZXJQcm9wcyB9IGZyb20gXCIuLi9oZWxtLWFkZG9uXCI7XG5pbXBvcnQgeyBWYWx1ZXNTY2hlbWEgfSBmcm9tICcuL3ZhbHVlcyc7XG4vKipcbiAqIFVzZXIgcHJvdmlkZWQgb3B0aW9ucyBmb3IgdGhlIEhlbG0gQ2hhcnRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBHcHVPcGVyYXRvckFkZG9uUHJvcHMgZXh0ZW5kcyBIZWxtQWRkT25Vc2VyUHJvcHMge1xuICAvKipcbiAgICogVG8gQ3JlYXRlIE5hbWVzcGFjZSB1c2luZyBDREtcbiAgICovICAgIFxuICBjcmVhdGVOYW1lc3BhY2U/OiBib29sZWFuO1xuXG4gIHZhbHVlcz86IFZhbHVlc1NjaGVtYTtcbn1cblxuLyoqXG4gKiBEZWZhdWx0IHByb3BzIHRvIGJlIHVzZWQgd2hlbiBjcmVhdGluZyB0aGUgSGVsbSBjaGFydFxuICovXG5jb25zdCBkZWZhdWx0UHJvcHM6IEhlbG1BZGRPblByb3BzICYgR3B1T3BlcmF0b3JBZGRvblByb3BzID0ge1xuICAgIG5hbWU6IFwiZ3B1LW9wZXJhdG9yLWFkZG9uXCIsXG4gICAgbmFtZXNwYWNlOiBcImdwdS1vcGVyYXRvclwiLFxuICAgIGNoYXJ0OiBcImdwdS1vcGVyYXRvclwiLFxuICAgIHZlcnNpb246IFwidjI0LjMuMFwiLFxuICAgIHJlbGVhc2U6IFwibnZpZGlhLWdwdS1vcGVyYXRvclwiLFxuICAgIHJlcG9zaXRvcnk6ICBcImh0dHBzOi8vaGVsbS5uZ2MubnZpZGlhLmNvbS9udmlkaWFcIixcbiAgICBjcmVhdGVOYW1lc3BhY2U6IHRydWUsXG4gICAgdmFsdWVzOiB7fVxufTtcblxuLyoqXG4gKiBNYWluIGNsYXNzIHRvIGluc3RhbnRpYXRlIHRoZSBIZWxtIGNoYXJ0IGZvciBOVklESUEgR1BVIG9wZXJhdG9yXG4gKiBHUFUgb3BlcmF0b3IgbWFuYWdlcyB0aGUgc29mdHdhcmUgYW5kIGRyaXZlcnMgbmVlZGVkIGZvciBHUFUgYWNjZWxlcmF0ZWQgd29ya2xvYWRzXG4gKiBJdCB2YWxpZGF0ZXMgYWxsIHJlcXVpc2l0ZSBzb2Z0d2FyZSBpcyBpbnN0YWxsZWQgYmVmb3JlIHNjaGVkdWxpbmcgR1BVIHdvcmtsb2FkXG4gKiBVc2luZyBNSUcgKE11bHRpIEluc3RhbmNlIEdQVXMpIGFsbG93cyB5b3UgdG8gdmlydHVhbGx5IHNwbGl0IHlvdXIgR1BVIGludG8gbXVsdGlwbGUgdW5pdHNcbiAqL1xuQHN1cHBvcnRzQUxMXG5leHBvcnQgY2xhc3MgR3B1T3BlcmF0b3JBZGRvbiBleHRlbmRzIEhlbG1BZGRPbiB7XG5cbiAgcmVhZG9ubHkgb3B0aW9uczogR3B1T3BlcmF0b3JBZGRvblByb3BzO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzPzogR3B1T3BlcmF0b3JBZGRvblByb3BzKSB7XG4gICAgc3VwZXIoey4uLmRlZmF1bHRQcm9wcywgLi4ucHJvcHN9KTtcbiAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzIGFzIEdwdU9wZXJhdG9yQWRkb25Qcm9wcztcbiAgfVxuXG4gIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xuICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xuICAgIGxldCB2YWx1ZXM6IFZhbHVlcyA9IHRoaXMub3B0aW9ucy52YWx1ZXMgPz8ge307XG4gICAgdmFsdWVzID0gbWVyZ2UodmFsdWVzLCB0aGlzLnByb3BzLnZhbHVlcyA/PyB7fSk7XG4gICAgY29uc3QgY2hhcnQgPSB0aGlzLmFkZEhlbG1DaGFydChjbHVzdGVySW5mbywgdmFsdWVzKTtcblxuICAgIGlmKCB0aGlzLm9wdGlvbnMuY3JlYXRlTmFtZXNwYWNlID09IHRydWUpe1xuICAgICAgLy8gTGV0IENESyBDcmVhdGUgdGhlIE5hbWVzcGFjZVxuICAgICAgY29uc3QgbmFtZXNwYWNlID0gY3JlYXRlTmFtZXNwYWNlKHRoaXMub3B0aW9ucy5uYW1lc3BhY2UhICwgY2x1c3Rlcik7XG4gICAgICBjaGFydC5ub2RlLmFkZERlcGVuZGVuY3kobmFtZXNwYWNlKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFydCk7XG4gIH1cbn0iXX0=