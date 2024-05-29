"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NginxAddOn = void 0;
const ts_deepmerge_1 = require("ts-deepmerge");
const __1 = require("..");
const utils_1 = require("../../utils");
const object_utils_1 = require("../../utils/object-utils");
const dot = require("dot-object");
const helm_addon_1 = require("../helm-addon");
/**
 * Defaults options for the add-on
 */
const defaultProps = {
    name: "nginx-ingress",
    chart: "nginx-ingress",
    release: "blueprints-addon-nginx",
    version: "1.1.3",
    repository: "https://helm.nginx.com/stable",
    backendProtocol: 'tcp',
    crossZoneEnabled: true,
    internetFacing: true,
    targetType: 'ip',
    namespace: 'kube-system'
};
let NginxAddOn = class NginxAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a, _b, _c, _d;
        const props = this.options;
        const presetAnnotations = {
            'service.beta.kubernetes.io/aws-load-balancer-backend-protocol': props.backendProtocol,
            'service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled': `${props.crossZoneEnabled}`,
            'service.beta.kubernetes.io/aws-load-balancer-scheme': props.internetFacing ? 'internet-facing' : 'internal',
            'service.beta.kubernetes.io/aws-load-balancer-type': 'external',
            'service.beta.kubernetes.io/aws-load-balancer-nlb-target-type': props.targetType,
            'external-dns.alpha.kubernetes.io/hostname': props.externalDnsHostname,
        };
        const values = {};
        if (props.certificateResourceName) {
            presetAnnotations['service.beta.kubernetes.io/aws-load-balancer-ssl-ports'] = 'https';
            const certificate = clusterInfo.getResource(props.certificateResourceName);
            presetAnnotations['service.beta.kubernetes.io/aws-load-balancer-ssl-cert'] = certificate === null || certificate === void 0 ? void 0 : certificate.certificateArn;
            (0, object_utils_1.setPath)(values, "controller.service.httpPort.enable", false);
            const httpPort = dot.pick("controller.service.httpsPort.targetPort", (_a = props.values) !== null && _a !== void 0 ? _a : {});
            if (httpPort === undefined) {
                (0, object_utils_1.setPath)(values, "controller.service.httpsPort.targetPort", 80);
            }
        }
        const serviceAnnotations = { ...(_c = (_b = values.controller) === null || _b === void 0 ? void 0 : _b.service) === null || _c === void 0 ? void 0 : _c.annotations, ...presetAnnotations };
        (0, object_utils_1.setPath)(values, 'controller.service.annotations', serviceAnnotations);
        const merged = (0, ts_deepmerge_1.merge)(values, (_d = this.props.values) !== null && _d !== void 0 ? _d : {});
        const nginxHelmChart = this.addHelmChart(clusterInfo, merged);
        return Promise.resolve(nginxHelmChart);
    }
};
exports.NginxAddOn = NginxAddOn;
__decorate([
    (0, utils_1.dependable)(__1.AwsLoadBalancerControllerAddOn.name)
], NginxAddOn.prototype, "deploy", null);
exports.NginxAddOn = NginxAddOn = __decorate([
    utils_1.supportsALL
], NginxAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL25naW54L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUVBLCtDQUFxQztBQUNyQywwQkFBb0Q7QUFFcEQsdUNBQXNEO0FBQ3RELDJEQUFtRDtBQUNuRCxrQ0FBa0M7QUFDbEMsOENBQThEO0FBZ0Q5RDs7R0FFRztBQUNILE1BQU0sWUFBWSxHQUFvQjtJQUNsQyxJQUFJLEVBQUUsZUFBZTtJQUNyQixLQUFLLEVBQUUsZUFBZTtJQUN0QixPQUFPLEVBQUUsd0JBQXdCO0lBQ2pDLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFVBQVUsRUFBRSwrQkFBK0I7SUFDM0MsZUFBZSxFQUFFLEtBQUs7SUFDdEIsZ0JBQWdCLEVBQUUsSUFBSTtJQUN0QixjQUFjLEVBQUUsSUFBSTtJQUNwQixVQUFVLEVBQUUsSUFBSTtJQUNoQixTQUFTLEVBQUUsYUFBYTtDQUMzQixDQUFDO0FBR0ssSUFBTSxVQUFVLEdBQWhCLE1BQU0sVUFBVyxTQUFRLHNCQUFTO0lBSXJDLFlBQVksS0FBdUI7UUFDL0IsS0FBSyxDQUFDLEVBQUUsR0FBRyxZQUFtQixFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDOUIsQ0FBQztJQUdELE1BQU0sQ0FBQyxXQUF3Qjs7UUFFM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUUzQixNQUFNLGlCQUFpQixHQUFRO1lBQzNCLCtEQUErRCxFQUFFLEtBQUssQ0FBQyxlQUFlO1lBQ3RGLGdGQUFnRixFQUFFLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixFQUFFO1lBQzdHLHFEQUFxRCxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQzVHLG1EQUFtRCxFQUFFLFVBQVU7WUFDL0QsOERBQThELEVBQUUsS0FBSyxDQUFDLFVBQVU7WUFDaEYsMkNBQTJDLEVBQUUsS0FBSyxDQUFDLG1CQUFtQjtTQUN6RSxDQUFDO1FBRUYsTUFBTSxNQUFNLEdBQVcsRUFBRSxDQUFDO1FBRTFCLElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDaEMsaUJBQWlCLENBQUMsd0RBQXdELENBQUMsR0FBRyxPQUFPLENBQUM7WUFDdEYsTUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBZSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUN6RixpQkFBaUIsQ0FBQyx1REFBdUQsQ0FBQyxHQUFHLFdBQVcsYUFBWCxXQUFXLHVCQUFYLFdBQVcsQ0FBRSxjQUFjLENBQUM7WUFDekcsSUFBQSxzQkFBTyxFQUFDLE1BQU0sRUFBRSxvQ0FBb0MsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3RCxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxFQUFFLE1BQUEsS0FBSyxDQUFDLE1BQU0sbUNBQUksRUFBRSxDQUFDLENBQUM7WUFDekYsSUFBRyxRQUFRLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ3pCLElBQUEsc0JBQU8sRUFBQyxNQUFNLEVBQUUseUNBQXlDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbEUsQ0FBQztRQUNMLENBQUM7UUFFRCxNQUFNLGtCQUFrQixHQUFHLEVBQUUsR0FBRyxNQUFBLE1BQUEsTUFBTSxDQUFDLFVBQVUsMENBQUUsT0FBTywwQ0FBRSxXQUFXLEVBQUUsR0FBRyxpQkFBaUIsRUFBRSxDQUFDO1FBQ2hHLElBQUEsc0JBQU8sRUFBQyxNQUFNLEVBQUUsZ0NBQWdDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUV0RSxNQUFNLE1BQU0sR0FBRyxJQUFBLG9CQUFLLEVBQUMsTUFBTSxFQUFFLE1BQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLG1DQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTlELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUMzQyxDQUFDO0NBQ0osQ0FBQTtBQTVDWSxnQ0FBVTtBQVVuQjtJQURDLElBQUEsa0JBQVUsRUFBQyxrQ0FBOEIsQ0FBQyxJQUFJLENBQUM7d0NBa0MvQztxQkEzQ1EsVUFBVTtJQUR0QixtQkFBVztHQUNDLFVBQVUsQ0E0Q3RCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSUNlcnRpZmljYXRlIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXJcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBtZXJnZSB9IGZyb20gXCJ0cy1kZWVwbWVyZ2VcIjtcbmltcG9ydCB7IEF3c0xvYWRCYWxhbmNlckNvbnRyb2xsZXJBZGRPbiB9IGZyb20gXCIuLlwiO1xuaW1wb3J0IHsgQ2x1c3RlckluZm8sIFZhbHVlcyB9IGZyb20gXCIuLi8uLi9zcGlcIjtcbmltcG9ydCB7IGRlcGVuZGFibGUsIHN1cHBvcnRzQUxMIH0gZnJvbSBcIi4uLy4uL3V0aWxzXCI7XG5pbXBvcnQgeyBzZXRQYXRoIH0gZnJvbSBcIi4uLy4uL3V0aWxzL29iamVjdC11dGlsc1wiO1xuaW1wb3J0ICogYXMgZG90IGZyb20gJ2RvdC1vYmplY3QnO1xuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Vc2VyUHJvcHMgfSBmcm9tIFwiLi4vaGVsbS1hZGRvblwiO1xuXG5cbi8qKlxuICogUHJvcGVydGllcyBhdmFpbGFibGUgdG8gY29uZmlndXJlIHRoZSBuZ2lueCBpbmdyZXNzIGNvbnRyb2xsZXIuXG4gKiBWYWx1ZXMgdG8gcGFzcyB0byB0aGUgY2hhcnQgYXMgcGVyIGh0dHBzOi8vZG9jcy5uZ2lueC5jb20vbmdpbngtaW5ncmVzcy1jb250cm9sbGVyL2luc3RhbGxhdGlvbi9pbnN0YWxsYXRpb24td2l0aC1oZWxtLyNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBOZ2lueEFkZE9uUHJvcHMgZXh0ZW5kcyBIZWxtQWRkT25Vc2VyUHJvcHMge1xuIFxuICAgIC8qKlxuICAgICAqIHRjcCwgaHR0cFxuICAgICAqIEBkZWZhdWx0IHRjcFxuICAgICAqL1xuICAgIGJhY2tlbmRQcm90b2NvbD86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEVuYWJsaW5nIGNyb3NzIEFaIGxvYWRiYWxhbmNpbmcgZm9yIFxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBjcm9zc1pvbmVFbmFibGVkPzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIElmIHRoZSBsb2FkIGJhbGFuY2VyIGNyZWF0ZWQgZm9yIHRoZSBpbmdyZXNzIGlzIGludGVybmV0IGZhY2luZy5cbiAgICAgKiBJbnRlcm5hbCBpZiBzZXQgdG8gZmFsc2UuXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIGludGVybmV0RmFjaW5nPzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIElQIG9yIGluc3RhbmNlIG1vZGUuIERlZmF1bHQ6IElQLCByZXF1aXJlcyBWUEMtQ05JLCBoYXMgYmV0dGVyIHBlcmZvcm1hbmNlIGVsaW1pbmF0aW5nIGEgaG9wIHRocm91Z2gga3ViZXByb3h5XG4gICAgICogSW5zdGFuY2UgbW9kZTogdHJhZGl0aW9uYWwgTm9kZVBvcnQgbW9kZSBvbiB0aGUgaW5zdGFuY2UuIFxuICAgICAqIEBkZWZhdWx0IGlwXG4gICAgICovXG4gICAgdGFyZ2V0VHlwZT86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBleHRlcm5hbCBETlMgYWRkLW9uIHRvIGhhbmRsZSBhdXRvbWF0aWMgcmVnaXN0cmF0aW9uIG9mIHRoZSBzZXJ2aWNlIHdpdGggUm91dGU1My4gIFxuICAgICAqL1xuICAgIGV4dGVybmFsRG5zSG9zdG5hbWU/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBOYW1lIG9mIHRoZSBjZXJ0aWZpY2F0ZSB7QGxpbmsgTmFtZWRSZXNvdXJjZVByb3ZpZGVyfSB0byBiZSB1c2VkIGZvciBjZXJ0aWZpY2F0ZSBsb29rIHVwLiBcbiAgICAgKiBAc2VlIHtAbGluayBJbXBvcnRDZXJ0aWZpY2F0ZVByb3ZpZGVyfSBhbmQge0BsaW5rIENyZWF0ZUNlcnRpZmljYXRlUHJvdmlkZXJ9IGZvciBleGFtcGxlcyBvZiBjZXJ0aWZpY2F0ZSBwcm92aWRlcnMuXG4gICAgICovXG4gICAgY2VydGlmaWNhdGVSZXNvdXJjZU5hbWU/OiBzdHJpbmcsXG59XG5cblxuLyoqXG4gKiBEZWZhdWx0cyBvcHRpb25zIGZvciB0aGUgYWRkLW9uXG4gKi9cbmNvbnN0IGRlZmF1bHRQcm9wczogTmdpbnhBZGRPblByb3BzID0ge1xuICAgIG5hbWU6IFwibmdpbngtaW5ncmVzc1wiLFxuICAgIGNoYXJ0OiBcIm5naW54LWluZ3Jlc3NcIixcbiAgICByZWxlYXNlOiBcImJsdWVwcmludHMtYWRkb24tbmdpbnhcIixcbiAgICB2ZXJzaW9uOiBcIjEuMS4zXCIsXG4gICAgcmVwb3NpdG9yeTogXCJodHRwczovL2hlbG0ubmdpbnguY29tL3N0YWJsZVwiLFxuICAgIGJhY2tlbmRQcm90b2NvbDogJ3RjcCcsXG4gICAgY3Jvc3Nab25lRW5hYmxlZDogdHJ1ZSxcbiAgICBpbnRlcm5ldEZhY2luZzogdHJ1ZSxcbiAgICB0YXJnZXRUeXBlOiAnaXAnLFxuICAgIG5hbWVzcGFjZTogJ2t1YmUtc3lzdGVtJ1xufTtcblxuQHN1cHBvcnRzQUxMXG5leHBvcnQgY2xhc3MgTmdpbnhBZGRPbiBleHRlbmRzIEhlbG1BZGRPbiB7XG5cbiAgICByZWFkb25seSBvcHRpb25zOiBOZ2lueEFkZE9uUHJvcHM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IE5naW54QWRkT25Qcm9wcykge1xuICAgICAgICBzdXBlcih7IC4uLmRlZmF1bHRQcm9wcyBhcyBhbnksIC4uLnByb3BzIH0pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB0aGlzLnByb3BzO1xuICAgIH1cblxuICAgIEBkZXBlbmRhYmxlKEF3c0xvYWRCYWxhbmNlckNvbnRyb2xsZXJBZGRPbi5uYW1lKVxuICAgIGRlcGxveShjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xuXG4gICAgICAgIGNvbnN0IHByb3BzID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICAgIGNvbnN0IHByZXNldEFubm90YXRpb25zOiBhbnkgPSB7XG4gICAgICAgICAgICAnc2VydmljZS5iZXRhLmt1YmVybmV0ZXMuaW8vYXdzLWxvYWQtYmFsYW5jZXItYmFja2VuZC1wcm90b2NvbCc6IHByb3BzLmJhY2tlbmRQcm90b2NvbCxcbiAgICAgICAgICAgICdzZXJ2aWNlLmJldGEua3ViZXJuZXRlcy5pby9hd3MtbG9hZC1iYWxhbmNlci1jcm9zcy16b25lLWxvYWQtYmFsYW5jaW5nLWVuYWJsZWQnOiBgJHtwcm9wcy5jcm9zc1pvbmVFbmFibGVkfWAsXG4gICAgICAgICAgICAnc2VydmljZS5iZXRhLmt1YmVybmV0ZXMuaW8vYXdzLWxvYWQtYmFsYW5jZXItc2NoZW1lJzogcHJvcHMuaW50ZXJuZXRGYWNpbmcgPyAnaW50ZXJuZXQtZmFjaW5nJyA6ICdpbnRlcm5hbCcsXG4gICAgICAgICAgICAnc2VydmljZS5iZXRhLmt1YmVybmV0ZXMuaW8vYXdzLWxvYWQtYmFsYW5jZXItdHlwZSc6ICdleHRlcm5hbCcsXG4gICAgICAgICAgICAnc2VydmljZS5iZXRhLmt1YmVybmV0ZXMuaW8vYXdzLWxvYWQtYmFsYW5jZXItbmxiLXRhcmdldC10eXBlJzogcHJvcHMudGFyZ2V0VHlwZSxcbiAgICAgICAgICAgICdleHRlcm5hbC1kbnMuYWxwaGEua3ViZXJuZXRlcy5pby9ob3N0bmFtZSc6IHByb3BzLmV4dGVybmFsRG5zSG9zdG5hbWUsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgdmFsdWVzOiBWYWx1ZXMgPSB7fTtcblxuICAgICAgICBpZiAocHJvcHMuY2VydGlmaWNhdGVSZXNvdXJjZU5hbWUpIHtcbiAgICAgICAgICAgIHByZXNldEFubm90YXRpb25zWydzZXJ2aWNlLmJldGEua3ViZXJuZXRlcy5pby9hd3MtbG9hZC1iYWxhbmNlci1zc2wtcG9ydHMnXSA9ICdodHRwcyc7XG4gICAgICAgICAgICBjb25zdCBjZXJ0aWZpY2F0ZSA9IGNsdXN0ZXJJbmZvLmdldFJlc291cmNlPElDZXJ0aWZpY2F0ZT4ocHJvcHMuY2VydGlmaWNhdGVSZXNvdXJjZU5hbWUpO1xuICAgICAgICAgICAgcHJlc2V0QW5ub3RhdGlvbnNbJ3NlcnZpY2UuYmV0YS5rdWJlcm5ldGVzLmlvL2F3cy1sb2FkLWJhbGFuY2VyLXNzbC1jZXJ0J10gPSBjZXJ0aWZpY2F0ZT8uY2VydGlmaWNhdGVBcm47XG4gICAgICAgICAgICBzZXRQYXRoKHZhbHVlcywgXCJjb250cm9sbGVyLnNlcnZpY2UuaHR0cFBvcnQuZW5hYmxlXCIsIGZhbHNlKTtcbiAgICAgICAgICAgIGNvbnN0IGh0dHBQb3J0ID0gZG90LnBpY2soXCJjb250cm9sbGVyLnNlcnZpY2UuaHR0cHNQb3J0LnRhcmdldFBvcnRcIiwgcHJvcHMudmFsdWVzID8/IHt9KTtcbiAgICAgICAgICAgIGlmKGh0dHBQb3J0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgIHNldFBhdGgodmFsdWVzLCBcImNvbnRyb2xsZXIuc2VydmljZS5odHRwc1BvcnQudGFyZ2V0UG9ydFwiLCA4MCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXJ2aWNlQW5ub3RhdGlvbnMgPSB7IC4uLnZhbHVlcy5jb250cm9sbGVyPy5zZXJ2aWNlPy5hbm5vdGF0aW9ucywgLi4ucHJlc2V0QW5ub3RhdGlvbnMgfTtcbiAgICAgICAgc2V0UGF0aCh2YWx1ZXMsICdjb250cm9sbGVyLnNlcnZpY2UuYW5ub3RhdGlvbnMnLCBzZXJ2aWNlQW5ub3RhdGlvbnMpO1xuXG4gICAgICAgIGNvbnN0IG1lcmdlZCA9IG1lcmdlKHZhbHVlcywgdGhpcy5wcm9wcy52YWx1ZXMgPz8ge30pO1xuICAgICAgICBjb25zdCBuZ2lueEhlbG1DaGFydCA9IHRoaXMuYWRkSGVsbUNoYXJ0KGNsdXN0ZXJJbmZvLCBtZXJnZWQpO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmdpbnhIZWxtQ2hhcnQpO1xuICAgIH1cbn0iXX0=