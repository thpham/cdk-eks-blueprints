"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpboundUniversalCrossplaneAddOn = void 0;
const core_addon_1 = require("../core-addon");
const utils_1 = require("../../utils");
/**
 * Default values for the add-on
 */
const defaultProps = {
    addOnName: "upbound_universal-crossplane",
    version: "v1.9.1-eksbuild.0"
};
/**
 * Implementation of Upbound Crossplane EKS add-on
 */
let UpboundUniversalCrossplaneAddOn = class UpboundUniversalCrossplaneAddOn extends core_addon_1.CoreAddOn {
    constructor(options) {
        var _a;
        super({
            addOnName: defaultProps.addOnName,
            version: (_a = options === null || options === void 0 ? void 0 : options.version) !== null && _a !== void 0 ? _a : defaultProps.version,
            saName: ""
        });
        this.options = options;
    }
};
exports.UpboundUniversalCrossplaneAddOn = UpboundUniversalCrossplaneAddOn;
exports.UpboundUniversalCrossplaneAddOn = UpboundUniversalCrossplaneAddOn = __decorate([
    utils_1.supportsX86
], UpboundUniversalCrossplaneAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL3VwYm91bmQtdW5pdmVyc2FsLWNyb3NzcGxhbmUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsOENBQTBDO0FBQzFDLHVDQUEwQztBQVkxQzs7R0FFRztBQUNILE1BQU0sWUFBWSxHQUFHO0lBQ2pCLFNBQVMsRUFBRSw4QkFBOEI7SUFDekMsT0FBTyxFQUFFLG1CQUFtQjtDQUMvQixDQUFDO0FBRUY7O0dBRUc7QUFFSSxJQUFNLCtCQUErQixHQUFyQyxNQUFNLCtCQUFnQyxTQUFRLHNCQUFTO0lBRTFELFlBQXFCLE9BQThDOztRQUMvRCxLQUFLLENBQUM7WUFDRixTQUFTLEVBQUUsWUFBWSxDQUFDLFNBQVM7WUFDakMsT0FBTyxFQUFFLE1BQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLE9BQU8sbUNBQUksWUFBWSxDQUFDLE9BQU87WUFDakQsTUFBTSxFQUFFLEVBQUU7U0FDYixDQUFDLENBQUM7UUFMYyxZQUFPLEdBQVAsT0FBTyxDQUF1QztJQU1uRSxDQUFDO0NBQ0osQ0FBQTtBQVRZLDBFQUErQjswQ0FBL0IsK0JBQStCO0lBRDNDLG1CQUFXO0dBQ0MsK0JBQStCLENBUzNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29yZUFkZE9uIH0gZnJvbSBcIi4uL2NvcmUtYWRkb25cIjtcclxuaW1wb3J0IHsgc3VwcG9ydHNYODYgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBJbnRlcmZhY2UgZm9yIFVwYm91bmQgVW5pdmVyc2FsIENyb3NzcGxhbmUgRUtTIGFkZC1vbiBvcHRpb25zXHJcbiAqL1xyXG5pbnRlcmZhY2UgVXBib3VuZFVuaXZlcnNhbENyb3NzcGxhbmVBZGRPblByb3BzIHtcclxuICAgIC8qKlxyXG4gICAgICogVmVyc2lvbiBvZiB0aGUgZHJpdmVyIHRvIGRlcGxveVxyXG4gICAgICovXHJcbiAgICB2ZXJzaW9uPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogRGVmYXVsdCB2YWx1ZXMgZm9yIHRoZSBhZGQtb25cclxuICovXHJcbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcclxuICAgIGFkZE9uTmFtZTogXCJ1cGJvdW5kX3VuaXZlcnNhbC1jcm9zc3BsYW5lXCIsXHJcbiAgICB2ZXJzaW9uOiBcInYxLjkuMS1la3NidWlsZC4wXCJcclxufTtcclxuXHJcbi8qKlxyXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBVcGJvdW5kIENyb3NzcGxhbmUgRUtTIGFkZC1vblxyXG4gKi9cclxuQHN1cHBvcnRzWDg2XHJcbmV4cG9ydCBjbGFzcyBVcGJvdW5kVW5pdmVyc2FsQ3Jvc3NwbGFuZUFkZE9uIGV4dGVuZHMgQ29yZUFkZE9uIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZWFkb25seSBvcHRpb25zPzogVXBib3VuZFVuaXZlcnNhbENyb3NzcGxhbmVBZGRPblByb3BzKSB7XHJcbiAgICAgICAgc3VwZXIoe1xyXG4gICAgICAgICAgICBhZGRPbk5hbWU6IGRlZmF1bHRQcm9wcy5hZGRPbk5hbWUsXHJcbiAgICAgICAgICAgIHZlcnNpb246IG9wdGlvbnM/LnZlcnNpb24gPz8gZGVmYXVsdFByb3BzLnZlcnNpb24sXHJcbiAgICAgICAgICAgIHNhTmFtZTogXCJcIlxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4iXX0=