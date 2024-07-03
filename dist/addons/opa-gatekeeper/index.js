"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpaGatekeeperAddOn = void 0;
const utils_1 = require("../../utils");
const helm_addon_1 = require("../helm-addon");
/**
 * Defaults options for the gatekeeper add-on
 */
const defaultProps = {
    name: 'gatekeeper',
    release: 'blueprints-addon-opa-gatekeeper',
    namespace: 'gatekeeper-system',
    chart: 'gatekeeper',
    repository: "https://open-policy-agent.github.io/gatekeeper/charts",
    version: '3.16.3'
};
let OpaGatekeeperAddOn = class OpaGatekeeperAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(_clusterInfo) {
        return;
    }
    postDeploy(clusterInfo, _teams) {
        var _a;
        const chart = this.addHelmChart(clusterInfo, (_a = this.props.values) !== null && _a !== void 0 ? _a : {});
        for (let provisioned of clusterInfo.getAllProvisionedAddons().values()) {
            chart.node.addDependency(provisioned);
        }
    }
};
exports.OpaGatekeeperAddOn = OpaGatekeeperAddOn;
exports.OpaGatekeeperAddOn = OpaGatekeeperAddOn = __decorate([
    utils_1.supportsALL
], OpaGatekeeperAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL29wYS1nYXRla2VlcGVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLHVDQUEwQztBQUMxQyw4Q0FBOEU7QUFVOUU7O0dBRUc7QUFFSCxNQUFNLFlBQVksR0FBbUI7SUFDakMsSUFBSSxFQUFFLFlBQVk7SUFDbEIsT0FBTyxFQUFFLGlDQUFpQztJQUMxQyxTQUFTLEVBQUUsbUJBQW1CO0lBQzlCLEtBQUssRUFBRSxZQUFZO0lBQ25CLFVBQVUsRUFBRSx1REFBdUQ7SUFDbkUsT0FBTyxFQUFFLFFBQVE7Q0FDcEIsQ0FBQztBQUdLLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsc0JBQVM7SUFJN0MsWUFBWSxLQUErQjtRQUN2QyxLQUFLLENBQUMsRUFBQyxHQUFHLFlBQVksRUFBRSxHQUFHLEtBQUssRUFBQyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQzlCLENBQUM7SUFFRCxNQUFNLENBQUMsWUFBeUI7UUFDNUIsT0FBTztJQUNYLENBQUM7SUFFRCxVQUFVLENBQUMsV0FBd0IsRUFBRSxNQUFjOztRQUUvQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxNQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxtQ0FBSSxFQUFFLENBQUMsQ0FBQztRQUV0RSxLQUFLLElBQUksV0FBVyxJQUFJLFdBQVcsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFDckUsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUMsQ0FBQztJQUNMLENBQUM7Q0FFSixDQUFBO0FBdEJZLGdEQUFrQjs2QkFBbEIsa0JBQWtCO0lBRDlCLG1CQUFXO0dBQ0Msa0JBQWtCLENBc0I5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENsdXN0ZXJJbmZvLCBDbHVzdGVyUG9zdERlcGxveSwgVGVhbSB9IGZyb20gXCIuLi8uLi9zcGlcIjtcbmltcG9ydCB7IHN1cHBvcnRzQUxMIH0gZnJvbSBcIi4uLy4uL3V0aWxzXCI7XG5pbXBvcnQgeyBIZWxtQWRkT24sIEhlbG1BZGRPblByb3BzLCBIZWxtQWRkT25Vc2VyUHJvcHMgfSBmcm9tIFwiLi4vaGVsbS1hZGRvblwiO1xuXG4vKipcbiAqIFByb3BlcnRpZXMgYXZhaWxhYmxlIHRvIGNvbmZpZ3VyZSBvcGEgZ2F0ZWtlZXBlci5cbiAqIG5hbWVzcGFjZSBkZWZhdWx0IGlzIGdhdGVrZWVwZXItc3lzdGVtXG4gKiB2ZXJzaW9uIGRlZmF1bHQgaXMgMy4xMi4wXG4gKiB2YWx1ZXMgYXMgcGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9vcGVuLXBvbGljeS1hZ2VudC9nYXRla2VlcGVyL3RyZWUvbWFzdGVyL2NoYXJ0cy9nYXRla2VlcGVyXG4gKi9cbmV4cG9ydCB0eXBlIE9wYUdhdGVrZWVwZXJBZGRPblByb3BzID0gSGVsbUFkZE9uVXNlclByb3BzO1xuXG4vKipcbiAqIERlZmF1bHRzIG9wdGlvbnMgZm9yIHRoZSBnYXRla2VlcGVyIGFkZC1vblxuICovXG5cbmNvbnN0IGRlZmF1bHRQcm9wczogSGVsbUFkZE9uUHJvcHMgPSB7XG4gICAgbmFtZTogJ2dhdGVrZWVwZXInLFxuICAgIHJlbGVhc2U6ICdibHVlcHJpbnRzLWFkZG9uLW9wYS1nYXRla2VlcGVyJyxcbiAgICBuYW1lc3BhY2U6ICdnYXRla2VlcGVyLXN5c3RlbScsXG4gICAgY2hhcnQ6ICdnYXRla2VlcGVyJyxcbiAgICByZXBvc2l0b3J5OiBcImh0dHBzOi8vb3Blbi1wb2xpY3ktYWdlbnQuZ2l0aHViLmlvL2dhdGVrZWVwZXIvY2hhcnRzXCIsXG4gICAgdmVyc2lvbjogJzMuMTYuMydcbn07XG5cbkBzdXBwb3J0c0FMTFxuZXhwb3J0IGNsYXNzIE9wYUdhdGVrZWVwZXJBZGRPbiBleHRlbmRzIEhlbG1BZGRPbiBpbXBsZW1lbnRzIENsdXN0ZXJQb3N0RGVwbG95IHtcblxuICAgIHByaXZhdGUgb3B0aW9uczogT3BhR2F0ZWtlZXBlckFkZE9uUHJvcHM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IE9wYUdhdGVrZWVwZXJBZGRPblByb3BzKSB7XG4gICAgICAgIHN1cGVyKHsuLi5kZWZhdWx0UHJvcHMsIC4uLnByb3BzfSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHRoaXMucHJvcHM7XG4gICAgfVxuXG4gICAgZGVwbG95KF9jbHVzdGVySW5mbzogQ2x1c3RlckluZm8pOiB2b2lkIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHBvc3REZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvLCBfdGVhbXM6IFRlYW1bXSk6IHZvaWQge1xuXG4gICAgICAgIGNvbnN0IGNoYXJ0ID0gdGhpcy5hZGRIZWxtQ2hhcnQoY2x1c3RlckluZm8sIHRoaXMucHJvcHMudmFsdWVzID8/IHt9KTtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IHByb3Zpc2lvbmVkIG9mIGNsdXN0ZXJJbmZvLmdldEFsbFByb3Zpc2lvbmVkQWRkb25zKCkudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGNoYXJ0Lm5vZGUuYWRkRGVwZW5kZW5jeShwcm92aXNpb25lZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG59Il19