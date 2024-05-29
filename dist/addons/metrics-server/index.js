"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsServerAddOn = void 0;
const ts_deepmerge_1 = require("ts-deepmerge");
const helm_addon_1 = require("../helm-addon");
const utils_1 = require("../../utils");
/**
 * Defaults options for the add-on
 */
const defaultProps = {
    chart: 'metrics-server',
    repository: 'https://kubernetes-sigs.github.io/metrics-server',
    version: '3.12.0',
    release: 'blueprints-addon-metrics-server',
    name: 'metrics-server',
    namespace: 'kube-system',
    createNamespace: false,
};
let MetricsServerAddOn = class MetricsServerAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a, _b;
        const cluster = clusterInfo.cluster;
        let values = (_a = this.options) !== null && _a !== void 0 ? _a : {};
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
exports.MetricsServerAddOn = MetricsServerAddOn;
exports.MetricsServerAddOn = MetricsServerAddOn = __decorate([
    utils_1.supportsALL
], MetricsServerAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL21ldHJpY3Mtc2VydmVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLCtDQUFxQztBQUVyQyw4Q0FBOEU7QUFDOUUsdUNBQTJEO0FBYTNEOztHQUVHO0FBQ0gsTUFBTSxZQUFZLEdBQTZDO0lBQzNELEtBQUssRUFBRSxnQkFBZ0I7SUFDdkIsVUFBVSxFQUFFLGtEQUFrRDtJQUM5RCxPQUFPLEVBQUUsUUFBUTtJQUNqQixPQUFPLEVBQUUsaUNBQWlDO0lBQzFDLElBQUksRUFBRSxnQkFBZ0I7SUFDdEIsU0FBUyxFQUFFLGFBQWE7SUFDeEIsZUFBZSxFQUFFLEtBQUs7Q0FDekIsQ0FBQztBQUdLLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsc0JBQVM7SUFHN0MsWUFBWSxLQUErQjtRQUN2QyxLQUFLLENBQUMsRUFBRSxHQUFHLFlBQVksRUFBRSxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBZ0MsQ0FBQztJQUN6RCxDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQXdCOztRQUMzQixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3BDLElBQUksTUFBTSxHQUFXLE1BQUEsSUFBSSxDQUFDLE9BQU8sbUNBQUksRUFBRSxDQUFDO1FBQ3hDLE1BQU0sR0FBRyxJQUFBLG9CQUFLLEVBQUMsTUFBTSxFQUFFLE1BQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLG1DQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXJELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLElBQUksSUFBSSxFQUFFLENBQUM7WUFDdkMsK0JBQStCO1lBQy9CLE1BQU0sU0FBUyxHQUFHLElBQUEsdUJBQWUsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNwRSxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDSixDQUFBO0FBckJZLGdEQUFrQjs2QkFBbEIsa0JBQWtCO0lBRDlCLG1CQUFXO0dBQ0Msa0JBQWtCLENBcUI5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgbWVyZ2UgfSBmcm9tIFwidHMtZGVlcG1lcmdlXCI7XG5pbXBvcnQgeyBDbHVzdGVySW5mbywgVmFsdWVzIH0gZnJvbSAnLi4vLi4vc3BpJztcbmltcG9ydCB7IEhlbG1BZGRPbiwgSGVsbUFkZE9uUHJvcHMsIEhlbG1BZGRPblVzZXJQcm9wcyB9IGZyb20gJy4uL2hlbG0tYWRkb24nO1xuaW1wb3J0IHsgY3JlYXRlTmFtZXNwYWNlLCBzdXBwb3J0c0FMTCB9IGZyb20gJy4uLy4uL3V0aWxzJztcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBhZGQtb24uXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBNZXRyaWNzU2VydmVyQWRkT25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7XG4gICAgLyoqXG4gICAgICogVG8gQ3JlYXRlIE5hbWVzcGFjZSB1c2luZyBDREtcbiAgICAgKi9cbiAgICBjcmVhdGVOYW1lc3BhY2U/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIERlZmF1bHRzIG9wdGlvbnMgZm9yIHRoZSBhZGQtb25cbiAqL1xuY29uc3QgZGVmYXVsdFByb3BzOiBIZWxtQWRkT25Qcm9wcyAmIE1ldHJpY3NTZXJ2ZXJBZGRPblByb3BzID0ge1xuICAgIGNoYXJ0OiAnbWV0cmljcy1zZXJ2ZXInLFxuICAgIHJlcG9zaXRvcnk6ICdodHRwczovL2t1YmVybmV0ZXMtc2lncy5naXRodWIuaW8vbWV0cmljcy1zZXJ2ZXInLFxuICAgIHZlcnNpb246ICczLjEyLjAnLFxuICAgIHJlbGVhc2U6ICdibHVlcHJpbnRzLWFkZG9uLW1ldHJpY3Mtc2VydmVyJyxcbiAgICBuYW1lOiAnbWV0cmljcy1zZXJ2ZXInLFxuICAgIG5hbWVzcGFjZTogJ2t1YmUtc3lzdGVtJyxcbiAgICBjcmVhdGVOYW1lc3BhY2U6IGZhbHNlLFxufTtcblxuQHN1cHBvcnRzQUxMXG5leHBvcnQgY2xhc3MgTWV0cmljc1NlcnZlckFkZE9uIGV4dGVuZHMgSGVsbUFkZE9uIHtcbiAgICByZWFkb25seSBvcHRpb25zOiBNZXRyaWNzU2VydmVyQWRkT25Qcm9wcztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogTWV0cmljc1NlcnZlckFkZE9uUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoeyAuLi5kZWZhdWx0UHJvcHMsIC4uLnByb3BzIH0pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzIGFzIE1ldHJpY3NTZXJ2ZXJBZGRPblByb3BzO1xuICAgIH1cblxuICAgIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xuICAgICAgICBjb25zdCBjbHVzdGVyID0gY2x1c3RlckluZm8uY2x1c3RlcjtcbiAgICAgICAgbGV0IHZhbHVlczogVmFsdWVzID0gdGhpcy5vcHRpb25zID8/IHt9O1xuICAgICAgICB2YWx1ZXMgPSBtZXJnZSh2YWx1ZXMsIHRoaXMucHJvcHMudmFsdWVzID8/IHt9KTtcbiAgICAgICAgY29uc3QgY2hhcnQgPSB0aGlzLmFkZEhlbG1DaGFydChjbHVzdGVySW5mbywgdmFsdWVzKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNyZWF0ZU5hbWVzcGFjZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAvLyBMZXQgQ0RLIENyZWF0ZSB0aGUgTmFtZXNwYWNlXG4gICAgICAgICAgICBjb25zdCBuYW1lc3BhY2UgPSBjcmVhdGVOYW1lc3BhY2UodGhpcy5vcHRpb25zLm5hbWVzcGFjZSEsIGNsdXN0ZXIpO1xuICAgICAgICAgICAgY2hhcnQubm9kZS5hZGREZXBlbmRlbmN5KG5hbWVzcGFjZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFydCk7XG4gICAgfVxufVxuIl19