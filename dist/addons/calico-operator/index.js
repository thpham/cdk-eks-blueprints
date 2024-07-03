"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalicoOperatorAddOn = void 0;
const ts_deepmerge_1 = require("ts-deepmerge");
const helm_addon_1 = require("../helm-addon");
const utils_1 = require("../../utils");
/**
 * Defaults options for the add-on
 */
const defaultProps = {
    name: 'calico-operator',
    namespace: 'calico-operator',
    version: 'v3.28.0', // v3.27.2' latest is causing issues on cdk destroy
    chart: "tigera-operator",
    release: "bp-addon-calico-operator",
    repository: "https://projectcalico.docs.tigera.io/charts"
};
let CalicoOperatorAddOn = class CalicoOperatorAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a;
        const values = (_a = this.options.values) !== null && _a !== void 0 ? _a : {};
        const defaultValues = {};
        const merged = (0, ts_deepmerge_1.merge)(defaultValues, values);
        this.addHelmChart(clusterInfo, merged);
    }
};
exports.CalicoOperatorAddOn = CalicoOperatorAddOn;
exports.CalicoOperatorAddOn = CalicoOperatorAddOn = __decorate([
    utils_1.supportsALL
], CalicoOperatorAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2NhbGljby1vcGVyYXRvci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwrQ0FBcUM7QUFFckMsOENBQThEO0FBQzlELHVDQUEwQztBQXlCMUM7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBRztJQUNqQixJQUFJLEVBQUUsaUJBQWlCO0lBQ3ZCLFNBQVMsRUFBRSxpQkFBaUI7SUFDNUIsT0FBTyxFQUFFLFNBQVMsRUFBRSxtREFBbUQ7SUFDdkUsS0FBSyxFQUFFLGlCQUFpQjtJQUN4QixPQUFPLEVBQUUsMEJBQTBCO0lBQ25DLFVBQVUsRUFBRSw2Q0FBNkM7Q0FDNUQsQ0FBQztBQUdLLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVM7SUFJOUMsWUFBWSxLQUFnQztRQUN4QyxLQUFLLENBQUMsRUFBQyxHQUFHLFlBQVksRUFBRSxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQzlCLENBQUM7SUFFRCxNQUFNLENBQUMsV0FBd0I7O1FBQzNCLE1BQU0sTUFBTSxHQUFHLE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLG1DQUFJLEVBQUUsQ0FBQztRQUN6QyxNQUFNLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFFekIsTUFBTSxNQUFNLEdBQUcsSUFBQSxvQkFBSyxFQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUU1QyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzQyxDQUFDO0NBQ0osQ0FBQTtBQWpCWSxrREFBbUI7OEJBQW5CLG1CQUFtQjtJQUQvQixtQkFBVztHQUNDLG1CQUFtQixDQWlCL0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBtZXJnZSB9IGZyb20gXCJ0cy1kZWVwbWVyZ2VcIjtcbmltcG9ydCB7IENsdXN0ZXJJbmZvIH0gZnJvbSBcIi4uLy4uL3NwaVwiO1xuaW1wb3J0IHsgSGVsbUFkZE9uLCBIZWxtQWRkT25Vc2VyUHJvcHMgfSBmcm9tIFwiLi4vaGVsbS1hZGRvblwiO1xuaW1wb3J0IHsgc3VwcG9ydHNBTEwgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBhZGQtb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2FsaWNvT3BlcmF0b3JBZGRPblByb3BzIGV4dGVuZHMgSGVsbUFkZE9uVXNlclByb3BzIHtcblxuICAgIC8qKlxuICAgICAqIE5hbWVzcGFjZSB3aGVyZSBDYWxpY28gd2lsbCBiZSBpbnN0YWxsZWRcbiAgICAgKiBAZGVmYXVsdCBrdWJlLXN5c3RlbVxuICAgICAqL1xuICAgIG5hbWVzcGFjZT86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEhlbG0gY2hhcnQgdmVyc2lvbiB0byB1c2UgdG8gaW5zdGFsbC5cbiAgICAgKiBAZGVmYXVsdCAzLjI3LjJcbiAgICAgKi9cbiAgICB2ZXJzaW9uPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVmFsdWVzIGZvciB0aGUgSGVsbSBjaGFydC5cbiAgICAgKi9cbiAgICB2YWx1ZXM/OiBhbnk7XG59XG5cbi8qKlxuICogRGVmYXVsdHMgb3B0aW9ucyBmb3IgdGhlIGFkZC1vblxuICovXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gICAgbmFtZTogJ2NhbGljby1vcGVyYXRvcicsXG4gICAgbmFtZXNwYWNlOiAnY2FsaWNvLW9wZXJhdG9yJyxcbiAgICB2ZXJzaW9uOiAndjMuMjguMCcsIC8vIHYzLjI3LjInIGxhdGVzdCBpcyBjYXVzaW5nIGlzc3VlcyBvbiBjZGsgZGVzdHJveVxuICAgIGNoYXJ0OiBcInRpZ2VyYS1vcGVyYXRvclwiLFxuICAgIHJlbGVhc2U6IFwiYnAtYWRkb24tY2FsaWNvLW9wZXJhdG9yXCIsXG4gICAgcmVwb3NpdG9yeTogXCJodHRwczovL3Byb2plY3RjYWxpY28uZG9jcy50aWdlcmEuaW8vY2hhcnRzXCJcbn07XG5cbkBzdXBwb3J0c0FMTFxuZXhwb3J0IGNsYXNzIENhbGljb09wZXJhdG9yQWRkT24gZXh0ZW5kcyBIZWxtQWRkT24ge1xuXG4gICAgcHJpdmF0ZSBvcHRpb25zOiBDYWxpY29PcGVyYXRvckFkZE9uUHJvcHM7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IENhbGljb09wZXJhdG9yQWRkT25Qcm9wcykge1xuICAgICAgICBzdXBlcih7Li4uZGVmYXVsdFByb3BzLCAuLi5wcm9wcyB9KTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdGhpcy5wcm9wcztcbiAgICB9XG5cbiAgICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMub3B0aW9ucy52YWx1ZXMgPz8ge307XG4gICAgICAgIGNvbnN0IGRlZmF1bHRWYWx1ZXMgPSB7fTtcblxuICAgICAgICBjb25zdCBtZXJnZWQgPSBtZXJnZShkZWZhdWx0VmFsdWVzLCB2YWx1ZXMpO1xuXG4gICAgICAgIHRoaXMuYWRkSGVsbUNoYXJ0KGNsdXN0ZXJJbmZvLCBtZXJnZWQpO1xuICAgIH1cbn1cbiJdfQ==