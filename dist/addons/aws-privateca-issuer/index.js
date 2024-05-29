"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWSPrivateCAIssuerAddon = void 0;
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const ts_deepmerge_1 = require("ts-deepmerge");
const helm_addon_1 = require("../helm-addon");
const utils_1 = require("../../utils");
/**
 * Default props to be used when creating the Helm chart
 */
const defaultProps = {
    name: "blueprints-aws-pca-issuer-addon",
    chart: "aws-privateca-issuer",
    namespace: "aws-pca-issuer",
    version: "1.2.7",
    release: "aws-pca-issuer",
    repository: "https://cert-manager.github.io/aws-privateca-issuer",
    values: {},
    serviceAccountName: "aws-pca-issuer",
    iamPolicies: ["AWSCertificateManagerPrivateCAFullAccess"]
};
/**
 * Main class to instantiate the Helm chart
 */
let AWSPrivateCAIssuerAddon = class AWSPrivateCAIssuerAddon extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    // AWSPrivateCAIssuerAddon requires CertManagerAddOn as a prerequisite . Pls refer to documentation for more details
    deploy(clusterInfo) {
        var _a;
        //Create Service Account with IRSA
        const cluster = clusterInfo.cluster;
        let values = populateValues(this.options);
        values = (0, ts_deepmerge_1.merge)(values, (_a = this.props.values) !== null && _a !== void 0 ? _a : {});
        const chart = this.addHelmChart(clusterInfo, values);
        const namespace = (0, utils_1.createNamespace)(this.options.namespace, cluster);
        if (this.options.iamPolicies.length > 0) {
            //Create Service Account with IRSA
            const opts = { name: this.options.serviceAccountName, namespace: this.options.namespace };
            const sa = cluster.addServiceAccount(this.options.serviceAccountName, opts);
            setRoles(sa, this.options.iamPolicies);
            sa.node.addDependency(namespace);
            chart.node.addDependency(sa);
        }
        return Promise.resolve(chart);
    }
};
exports.AWSPrivateCAIssuerAddon = AWSPrivateCAIssuerAddon;
__decorate([
    (0, utils_1.dependable)('CertManagerAddOn')
], AWSPrivateCAIssuerAddon.prototype, "deploy", null);
exports.AWSPrivateCAIssuerAddon = AWSPrivateCAIssuerAddon = __decorate([
    utils_1.supportsX86
], AWSPrivateCAIssuerAddon);
/**
 * populateValues populates the appropriate values used to customize the Helm chart
 * @param helmOptions User provided values to customize the chart
 */
function populateValues(helmOptions) {
    var _a;
    const values = (_a = helmOptions.values) !== null && _a !== void 0 ? _a : {};
    (0, utils_1.setPath)(values, "serviceAccount.create", helmOptions.iamPolicies.length > 0 ? false : true);
    (0, utils_1.setPath)(values, "serviceAccount.name", helmOptions.serviceAccountName);
    return values;
}
/**
 * This function will set the roles to Service Account
 * @param sa - Service Account Object
 * @param irsaRoles - Array  of Managed IAM Policies
 */
function setRoles(sa, irsaRoles) {
    irsaRoles.forEach((policyName) => {
        const policy = aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName(policyName);
        sa.role.addManagedPolicy(policy);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2F3cy1wcml2YXRlY2EtaXNzdWVyL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUVBLGlEQUFvRDtBQUNwRCwrQ0FBcUM7QUFFckMsOENBQThFO0FBQzlFLHVDQUFnRjtBQW1CaEY7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBa0Q7SUFDbEUsSUFBSSxFQUFFLGlDQUFpQztJQUN2QyxLQUFLLEVBQUUsc0JBQXNCO0lBQzdCLFNBQVMsRUFBQyxnQkFBZ0I7SUFDMUIsT0FBTyxFQUFFLE9BQU87SUFDaEIsT0FBTyxFQUFFLGdCQUFnQjtJQUN6QixVQUFVLEVBQUcscURBQXFEO0lBQ2xFLE1BQU0sRUFBRSxFQUFFO0lBQ1Ysa0JBQWtCLEVBQUUsZ0JBQWdCO0lBQ3BDLFdBQVcsRUFBRSxDQUFDLDBDQUEwQyxDQUFDO0NBRTFELENBQUM7QUFFRjs7R0FFRztBQUVJLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXdCLFNBQVEsc0JBQVM7SUFJcEQsWUFBWSxLQUFvQztRQUM5QyxLQUFLLENBQUMsRUFBQyxHQUFHLFlBQVksRUFBRSxHQUFHLEtBQUssRUFBQyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBcUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsb0hBQW9IO0lBRXBILE1BQU0sQ0FBQyxXQUF3Qjs7UUFDN0Isa0NBQWtDO1FBQ2xDLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDcEMsSUFBSSxNQUFNLEdBQVcsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxNQUFNLEdBQUcsSUFBQSxvQkFBSyxFQUFDLE1BQU0sRUFBRSxNQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxtQ0FBSSxFQUFFLENBQUMsQ0FBQztRQUVoRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNyRCxNQUFNLFNBQVMsR0FBRyxJQUFBLHVCQUFlLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFVLEVBQUcsT0FBTyxDQUFDLENBQUM7UUFFckUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFHLENBQUM7WUFDMUMsa0NBQWtDO1lBQ2xDLE1BQU0sSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDMUYsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0UsUUFBUSxDQUFDLEVBQUUsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVksQ0FBQyxDQUFDO1lBQ3ZDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2pDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUNGLENBQUE7QUE5QlksMERBQXVCO0FBV2xDO0lBREMsSUFBQSxrQkFBVSxFQUFDLGtCQUFrQixDQUFDO3FEQW1COUI7a0NBN0JVLHVCQUF1QjtJQURuQyxtQkFBVztHQUNDLHVCQUF1QixDQThCbkM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGNBQWMsQ0FBQyxXQUF5Qzs7SUFDL0QsTUFBTSxNQUFNLEdBQUcsTUFBQSxXQUFXLENBQUMsTUFBTSxtQ0FBSSxFQUFFLENBQUM7SUFDeEMsSUFBQSxlQUFPLEVBQUMsTUFBTSxFQUFFLHVCQUF1QixFQUFHLFdBQVcsQ0FBQyxXQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5RixJQUFBLGVBQU8sRUFBQyxNQUFNLEVBQUUscUJBQXFCLEVBQUcsV0FBVyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDeEUsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVEOzs7O0dBSUc7QUFDRixTQUFTLFFBQVEsQ0FBQyxFQUFpQixFQUFFLFNBQW1CO0lBQ3ZELFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtRQUM3QixNQUFNLE1BQU0sR0FBRyx1QkFBYSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gbGliL2t1YmV2aW91c19hZGRvbi50c1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcclxuaW1wb3J0IHsgTWFuYWdlZFBvbGljeSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XHJcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSBcInRzLWRlZXBtZXJnZVwiO1xyXG5pbXBvcnQgeyBTZXJ2aWNlQWNjb3VudCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xyXG5pbXBvcnQgeyBIZWxtQWRkT24sIEhlbG1BZGRPblVzZXJQcm9wcywgSGVsbUFkZE9uUHJvcHMgfSBmcm9tIFwiLi4vaGVsbS1hZGRvblwiO1xyXG5pbXBvcnQgeyBkZXBlbmRhYmxlLCBzZXRQYXRoLCBjcmVhdGVOYW1lc3BhY2UsIHN1cHBvcnRzWDg2IH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBDbHVzdGVySW5mbywgVmFsdWVzIH0gZnJvbSBcIi4uLy4uL3NwaVwiO1xyXG5cclxuLyoqXHJcbiAqIFVzZXIgcHJvdmlkZWQgb3B0aW9ucyBmb3IgdGhlIEhlbG0gQ2hhcnRcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQVdTUHJpdmF0ZUNBSXNzdWVyQWRkb25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgc2VydmljZSBhY2NvdW50IHRvIHVzZS4gSWYgY3JlYXRlU2VydmljZUFjY291bnQgaXMgdHJ1ZSwgYSBzZXJ2aWNlQWNjb3VudE5hbWUgaXMgZ2VuZXJhdGVkLlxyXG4gICAgICovXHJcbiAgICBzZXJ2aWNlQWNjb3VudE5hbWU/OiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIEFuIGFycmF5IG9mIE1hbmFnZWQgSUFNIFBvbGljaWVzIHdoaWNoIFNlcnZpY2UgQWNjb3VudCBuZWVkcyBmb3IgSVJTQSBFZzogaXJzYVJvbGVzOltcIkFXU0NlcnRpZmljYXRlTWFuYWdlclByaXZhdGVDQUZ1bGxBY2Nlc3NcIl0uIElmIG5vdCBlbXB0eVxyXG4gICAgICogU2VydmljZSBBY2NvdW50IHdpbGwgYmUgQ3JlYXRlZCBieSBDREsgd2l0aCBJQU0gUm9sZXMgTWFwcGVkIChJUlNBKS4gSW4gY2FzZSBpZiBpdHMgZW1wdHksIFNlcnZpY2UgQWNjb3VudCB3aWxsIGJlIGNyZWF0ZWQgd2l0aCBkZWZhdWx0IElBTSBQb2xpY3kgQVdTQ2VydGlmaWNhdGVNYW5hZ2VyUHJpdmF0ZUNBRnVsbEFjY2Vzc1xyXG4gICAgICovICAgXHJcbiAgICAgaWFtUG9saWNpZXM/OiBzdHJpbmdbXTsgICAgXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZWZhdWx0IHByb3BzIHRvIGJlIHVzZWQgd2hlbiBjcmVhdGluZyB0aGUgSGVsbSBjaGFydFxyXG4gKi9cclxuY29uc3QgZGVmYXVsdFByb3BzOiBIZWxtQWRkT25Qcm9wcyAmIEFXU1ByaXZhdGVDQUlzc3VlckFkZG9uUHJvcHMgPSB7XHJcbiAgbmFtZTogXCJibHVlcHJpbnRzLWF3cy1wY2EtaXNzdWVyLWFkZG9uXCIsXHJcbiAgY2hhcnQ6IFwiYXdzLXByaXZhdGVjYS1pc3N1ZXJcIixcclxuICBuYW1lc3BhY2U6XCJhd3MtcGNhLWlzc3VlclwiLFxyXG4gIHZlcnNpb246IFwiMS4yLjdcIixcclxuICByZWxlYXNlOiBcImF3cy1wY2EtaXNzdWVyXCIsXHJcbiAgcmVwb3NpdG9yeTogIFwiaHR0cHM6Ly9jZXJ0LW1hbmFnZXIuZ2l0aHViLmlvL2F3cy1wcml2YXRlY2EtaXNzdWVyXCIsXHJcbiAgdmFsdWVzOiB7fSxcclxuICBzZXJ2aWNlQWNjb3VudE5hbWU6IFwiYXdzLXBjYS1pc3N1ZXJcIixcclxuICBpYW1Qb2xpY2llczogW1wiQVdTQ2VydGlmaWNhdGVNYW5hZ2VyUHJpdmF0ZUNBRnVsbEFjY2Vzc1wiXVxyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBNYWluIGNsYXNzIHRvIGluc3RhbnRpYXRlIHRoZSBIZWxtIGNoYXJ0XHJcbiAqL1xyXG5Ac3VwcG9ydHNYODZcclxuZXhwb3J0IGNsYXNzIEFXU1ByaXZhdGVDQUlzc3VlckFkZG9uIGV4dGVuZHMgSGVsbUFkZE9uIHtcclxuXHJcbiAgcmVhZG9ubHkgb3B0aW9uczogQVdTUHJpdmF0ZUNBSXNzdWVyQWRkb25Qcm9wcztcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHM/OiBBV1NQcml2YXRlQ0FJc3N1ZXJBZGRvblByb3BzKSB7XHJcbiAgICBzdXBlcih7Li4uZGVmYXVsdFByb3BzLCAuLi5wcm9wc30pO1xyXG4gICAgdGhpcy5vcHRpb25zID0gdGhpcy5wcm9wcyBhcyBBV1NQcml2YXRlQ0FJc3N1ZXJBZGRvblByb3BzO1xyXG4gIH1cclxuXHJcbiAgLy8gQVdTUHJpdmF0ZUNBSXNzdWVyQWRkb24gcmVxdWlyZXMgQ2VydE1hbmFnZXJBZGRPbiBhcyBhIHByZXJlcXVpc2l0ZSAuIFBscyByZWZlciB0byBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGRldGFpbHNcclxuICBAZGVwZW5kYWJsZSgnQ2VydE1hbmFnZXJBZGRPbicpXHJcbiAgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IFByb21pc2U8Q29uc3RydWN0PiB7XHJcbiAgICAvL0NyZWF0ZSBTZXJ2aWNlIEFjY291bnQgd2l0aCBJUlNBXHJcbiAgICBjb25zdCBjbHVzdGVyID0gY2x1c3RlckluZm8uY2x1c3RlcjtcclxuICAgIGxldCB2YWx1ZXM6IFZhbHVlcyA9IHBvcHVsYXRlVmFsdWVzKHRoaXMub3B0aW9ucyk7XHJcbiAgICB2YWx1ZXMgPSBtZXJnZSh2YWx1ZXMsIHRoaXMucHJvcHMudmFsdWVzID8/IHt9KTtcclxuXHJcbiAgICBjb25zdCBjaGFydCA9IHRoaXMuYWRkSGVsbUNoYXJ0KGNsdXN0ZXJJbmZvLCB2YWx1ZXMpO1xyXG4gICAgY29uc3QgbmFtZXNwYWNlID0gY3JlYXRlTmFtZXNwYWNlKHRoaXMub3B0aW9ucy5uYW1lc3BhY2UhICwgY2x1c3Rlcik7XHJcblxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5pYW1Qb2xpY2llcyEubGVuZ3RoID4gMCApIHtcclxuICAgICAgLy9DcmVhdGUgU2VydmljZSBBY2NvdW50IHdpdGggSVJTQVxyXG4gICAgICBjb25zdCBvcHRzID0geyBuYW1lOiB0aGlzLm9wdGlvbnMuc2VydmljZUFjY291bnROYW1lLCBuYW1lc3BhY2U6IHRoaXMub3B0aW9ucy5uYW1lc3BhY2UgfTtcclxuICAgICAgY29uc3Qgc2EgPSBjbHVzdGVyLmFkZFNlcnZpY2VBY2NvdW50KHRoaXMub3B0aW9ucy5zZXJ2aWNlQWNjb3VudE5hbWUhLCBvcHRzKTtcclxuICAgICAgc2V0Um9sZXMoc2EsdGhpcy5vcHRpb25zLmlhbVBvbGljaWVzISk7XHJcbiAgICAgIHNhLm5vZGUuYWRkRGVwZW5kZW5jeShuYW1lc3BhY2UpO1xyXG4gICAgICBjaGFydC5ub2RlLmFkZERlcGVuZGVuY3koc2EpO1xyXG4gICAgIH0gXHJcbiAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFydCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogcG9wdWxhdGVWYWx1ZXMgcG9wdWxhdGVzIHRoZSBhcHByb3ByaWF0ZSB2YWx1ZXMgdXNlZCB0byBjdXN0b21pemUgdGhlIEhlbG0gY2hhcnRcclxuICogQHBhcmFtIGhlbG1PcHRpb25zIFVzZXIgcHJvdmlkZWQgdmFsdWVzIHRvIGN1c3RvbWl6ZSB0aGUgY2hhcnRcclxuICovXHJcbmZ1bmN0aW9uIHBvcHVsYXRlVmFsdWVzKGhlbG1PcHRpb25zOiBBV1NQcml2YXRlQ0FJc3N1ZXJBZGRvblByb3BzKTogVmFsdWVzIHtcclxuICBjb25zdCB2YWx1ZXMgPSBoZWxtT3B0aW9ucy52YWx1ZXMgPz8ge307XHJcbiAgc2V0UGF0aCh2YWx1ZXMsIFwic2VydmljZUFjY291bnQuY3JlYXRlXCIsICBoZWxtT3B0aW9ucy5pYW1Qb2xpY2llcyEubGVuZ3RoID4gMCA/IGZhbHNlIDogdHJ1ZSk7IFxyXG4gIHNldFBhdGgodmFsdWVzLCBcInNlcnZpY2VBY2NvdW50Lm5hbWVcIiwgIGhlbG1PcHRpb25zLnNlcnZpY2VBY2NvdW50TmFtZSk7IFxyXG4gIHJldHVybiB2YWx1ZXM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgc2V0IHRoZSByb2xlcyB0byBTZXJ2aWNlIEFjY291bnRcclxuICogQHBhcmFtIHNhIC0gU2VydmljZSBBY2NvdW50IE9iamVjdFxyXG4gKiBAcGFyYW0gaXJzYVJvbGVzIC0gQXJyYXkgIG9mIE1hbmFnZWQgSUFNIFBvbGljaWVzXHJcbiAqL1xyXG4gZnVuY3Rpb24gc2V0Um9sZXMoc2E6U2VydmljZUFjY291bnQsIGlyc2FSb2xlczogc3RyaW5nW10pe1xyXG4gIGlyc2FSb2xlcy5mb3JFYWNoKChwb2xpY3lOYW1lKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBvbGljeSA9IE1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKHBvbGljeU5hbWUpO1xyXG4gICAgICBzYS5yb2xlLmFkZE1hbmFnZWRQb2xpY3kocG9saWN5KTtcclxuICAgIH0pO1xyXG59Il19