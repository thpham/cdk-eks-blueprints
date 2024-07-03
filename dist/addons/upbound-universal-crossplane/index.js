"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var UpboundCrossplaneAddOn_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpboundCrossplaneAddOn = void 0;
require("source-map-support/register");
const ts_deepmerge_1 = require("ts-deepmerge");
const utils_1 = require("../../utils");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const cdk = require("aws-cdk-lib");
const helm_addon_1 = require("../helm-addon");
const defaultProps = {
    name: 'uxp',
    release: 'blueprints-addon-uxp',
    namespace: 'upbound-system',
    chart: 'universal-crossplane',
    version: '1.14.5-up.1',
    repository: 'https://charts.upbound.io/stable',
    values: {}
};
let UpboundCrossplaneAddOn = UpboundCrossplaneAddOn_1 = class UpboundCrossplaneAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a;
        const cluster = clusterInfo.cluster;
        // Create the `upbound-system` namespace.
        const ns = (0, utils_1.createNamespace)(this.options.namespace, cluster, true);
        // Create the CrossPlane AWS Provider IRSA.
        const serviceAccountName = "provider-aws";
        const sa = cluster.addServiceAccount(serviceAccountName, {
            name: serviceAccountName,
            namespace: this.options.namespace,
        });
        sa.node.addDependency(ns);
        sa.role.attachInlinePolicy(new aws_iam_1.Policy(cluster.stack, 'eks-connect-policy', {
            document: aws_iam_1.PolicyDocument.fromJson({
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": ["sts:AssumeRole"],
                        "Resource": `${this.options.clusterAccessRole.roleArn}`
                    },
                    {
                        "Effect": "Allow",
                        "Action": ["eks:*"],
                        "Resource": `*`
                    }
                ]
            })
        }));
        clusterInfo.addAddOnContext(UpboundCrossplaneAddOn_1.name, {
            arn: sa.role.roleArn
        });
        new cdk.CfnOutput(cluster.stack, 'providerawssaiamrole', {
            value: sa.role.roleArn,
            description: 'provider AWS IAM role',
            exportName: 'providerawssaiamrole'
        });
        let values = (_a = this.options.values) !== null && _a !== void 0 ? _a : {};
        values = (0, ts_deepmerge_1.merge)(values, values);
        const chart = this.addHelmChart(clusterInfo, values, false, true);
        chart.node.addDependency(sa);
        return Promise.resolve(chart);
    }
};
exports.UpboundCrossplaneAddOn = UpboundCrossplaneAddOn;
exports.UpboundCrossplaneAddOn = UpboundCrossplaneAddOn = UpboundCrossplaneAddOn_1 = __decorate([
    utils_1.supportsALL
], UpboundCrossplaneAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL3VwYm91bmQtdW5pdmVyc2FsLWNyb3NzcGxhbmUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHVDQUFxQztBQUdyQywrQ0FBcUM7QUFDckMsdUNBQXlEO0FBQ3pELGlEQUFrRTtBQUNsRSxtQ0FBbUM7QUFDbkMsOENBQTREO0FBa0I1RCxNQUFNLFlBQVksR0FBRztJQUNqQixJQUFJLEVBQUUsS0FBSztJQUNYLE9BQU8sRUFBRSxzQkFBc0I7SUFDL0IsU0FBUyxFQUFFLGdCQUFnQjtJQUMzQixLQUFLLEVBQUUsc0JBQXNCO0lBQzdCLE9BQU8sRUFBRSxhQUFhO0lBQ3RCLFVBQVUsRUFBRSxrQ0FBa0M7SUFDOUMsTUFBTSxFQUFFLEVBQUU7Q0FDYixDQUFDO0FBR0ssSUFBTSxzQkFBc0IsOEJBQTVCLE1BQU0sc0JBQXVCLFNBQVEsc0JBQVM7SUFJakQsWUFBYSxLQUFtQztRQUM1QyxLQUFLLENBQUMsRUFBQyxHQUFHLFlBQVksRUFBRSxHQUFHLEtBQUssRUFBQyxDQUFDLENBQUM7UUFFbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBb0MsQ0FBQztJQUM3RCxDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQXdCOztRQUMzQixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBRXBDLHlDQUF5QztRQUN6QyxNQUFNLEVBQUUsR0FBRyxJQUFBLHVCQUFlLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFVLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRW5FLDJDQUEyQztRQUMzQyxNQUFNLGtCQUFrQixHQUFHLGNBQWMsQ0FBQztRQUMxQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLEVBQUU7WUFDckQsSUFBSSxFQUFFLGtCQUFrQjtZQUN4QixTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFVO1NBRXJDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFCLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLEVBQUc7WUFDeEUsUUFBUSxFQUFFLHdCQUFjLENBQUMsUUFBUSxDQUFDO2dCQUM5QixTQUFTLEVBQUUsWUFBWTtnQkFDdkIsV0FBVyxFQUFFO29CQUNUO3dCQUNJLFFBQVEsRUFBRSxPQUFPO3dCQUNqQixRQUFRLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQzt3QkFDNUIsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUU7cUJBQzFEO29CQUNEO3dCQUNJLFFBQVEsRUFBRSxPQUFPO3dCQUNqQixRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUM7d0JBQ25CLFVBQVUsRUFBRSxHQUFHO3FCQUNsQjtpQkFDSjthQUNKLENBQUM7U0FBQyxDQUFDLENBQUMsQ0FBQztRQUVWLFdBQVcsQ0FBQyxlQUFlLENBQUMsd0JBQXNCLENBQUMsSUFBSSxFQUFFO1lBQ3JELEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU87U0FDdkIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsc0JBQXNCLEVBQ25EO1lBQ0ksS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTztZQUN0QixXQUFXLEVBQUUsdUJBQXVCO1lBQ3BDLFVBQVUsRUFBRyxzQkFBc0I7U0FDdEMsQ0FBQyxDQUFDO1FBRVAsSUFBSSxNQUFNLEdBQVcsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sbUNBQUksRUFBRSxDQUFDO1FBQy9DLE1BQU0sR0FBRyxJQUFBLG9CQUFLLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRS9CLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEUsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0IsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDSixDQUFBO0FBNURZLHdEQUFzQjtpQ0FBdEIsc0JBQXNCO0lBRGxDLG1CQUFXO0dBQ0Msc0JBQXNCLENBNERsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XHJcbmltcG9ydCB7Q2x1c3RlckluZm8sIFZhbHVlc30gZnJvbSBcIi4uLy4uL3NwaVwiO1xyXG5pbXBvcnQgeyBtZXJnZSB9IGZyb20gXCJ0cy1kZWVwbWVyZ2VcIjtcclxuaW1wb3J0IHtjcmVhdGVOYW1lc3BhY2UsIHN1cHBvcnRzQUxMfSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCB7SVJvbGUsIFBvbGljeSwgUG9saWN5RG9jdW1lbnR9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xyXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQge0hlbG1BZGRPbiwgSGVsbUFkZE9uVXNlclByb3BzfSBmcm9tIFwiLi4vaGVsbS1hZGRvblwiO1xyXG5cclxuLyoqXHJcbiAqIFVzZXIgcHJvdmlkZWQgb3B0aW9ucyBmb3IgdGhlIEhlbG0gQ2hhcnQuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFVwYm91bmRDcm9zc3BsYW5lQWRkT25Qcm9wcyBleHRlbmRzIEhlbG1BZGRPblVzZXJQcm9wcyB7XHJcbiAgICAvKipcclxuICAgICAqIFRvIENyZWF0ZSBOYW1lc3BhY2UgdXNpbmcgQ0RLXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZU5hbWVzcGFjZT86IGJvb2xlYW47XHJcbiAgICAvKlxyXG4gICAgICogRUtTIENsdXN0ZXIgQWNjZXNzIFJvbGUuXHJcbiAgICAgKiBUaGlzIGlzIGEgcm9sZSB3aXRoIHJpZ2h0IHBlcm1pc3Npb25zIHRoYXQgd2lsbCBiZSB1c2VkIGJ5IENyb3NzUGxhbmUgQVdTIHByb3ZpZGVyXHJcbiAgICAgKiB0byBwcm92aXNpb24gQVdTIHJlc291cmNlcy5cclxuICAgICAqL1xyXG4gICAgY2x1c3RlckFjY2Vzc1JvbGU6IElSb2xlO1xyXG59XHJcblxyXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XHJcbiAgICBuYW1lOiAndXhwJyxcclxuICAgIHJlbGVhc2U6ICdibHVlcHJpbnRzLWFkZG9uLXV4cCcsXHJcbiAgICBuYW1lc3BhY2U6ICd1cGJvdW5kLXN5c3RlbScsXHJcbiAgICBjaGFydDogJ3VuaXZlcnNhbC1jcm9zc3BsYW5lJyxcclxuICAgIHZlcnNpb246ICcxLjE0LjUtdXAuMScsXHJcbiAgICByZXBvc2l0b3J5OiAnaHR0cHM6Ly9jaGFydHMudXBib3VuZC5pby9zdGFibGUnLFxyXG4gICAgdmFsdWVzOiB7fVxyXG59O1xyXG5cclxuQHN1cHBvcnRzQUxMXHJcbmV4cG9ydCBjbGFzcyBVcGJvdW5kQ3Jvc3NwbGFuZUFkZE9uIGV4dGVuZHMgSGVsbUFkZE9uIHtcclxuXHJcbiAgICByZWFkb25seSBvcHRpb25zOiBVcGJvdW5kQ3Jvc3NwbGFuZUFkZE9uUHJvcHM7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIHByb3BzPzogVXBib3VuZENyb3NzcGxhbmVBZGRPblByb3BzKSB7XHJcbiAgICAgICAgc3VwZXIoey4uLmRlZmF1bHRQcm9wcywgLi4ucHJvcHN9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdGhpcy5wcm9wcyBhcyBVcGJvdW5kQ3Jvc3NwbGFuZUFkZE9uUHJvcHM7XHJcbiAgICB9XHJcblxyXG4gICAgZGVwbG95KGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyk6IHZvaWQgfCBQcm9taXNlPENvbnN0cnVjdD4ge1xyXG4gICAgICAgIGNvbnN0IGNsdXN0ZXIgPSBjbHVzdGVySW5mby5jbHVzdGVyO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGB1cGJvdW5kLXN5c3RlbWAgbmFtZXNwYWNlLlxyXG4gICAgICAgIGNvbnN0IG5zID0gY3JlYXRlTmFtZXNwYWNlKHRoaXMub3B0aW9ucy5uYW1lc3BhY2UhLCBjbHVzdGVyLCB0cnVlKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBDcm9zc1BsYW5lIEFXUyBQcm92aWRlciBJUlNBLlxyXG4gICAgICAgIGNvbnN0IHNlcnZpY2VBY2NvdW50TmFtZSA9IFwicHJvdmlkZXItYXdzXCI7XHJcbiAgICAgICAgY29uc3Qgc2EgPSBjbHVzdGVyLmFkZFNlcnZpY2VBY2NvdW50KHNlcnZpY2VBY2NvdW50TmFtZSwge1xyXG4gICAgICAgICAgICBuYW1lOiBzZXJ2aWNlQWNjb3VudE5hbWUsXHJcbiAgICAgICAgICAgIG5hbWVzcGFjZTogdGhpcy5vcHRpb25zLm5hbWVzcGFjZSEsXHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBzYS5ub2RlLmFkZERlcGVuZGVuY3kobnMpO1xyXG4gICAgICAgIHNhLnJvbGUuYXR0YWNoSW5saW5lUG9saWN5KG5ldyBQb2xpY3koY2x1c3Rlci5zdGFjaywgJ2Vrcy1jb25uZWN0LXBvbGljeScsICB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50OiBQb2xpY3lEb2N1bWVudC5mcm9tSnNvbih7XHJcbiAgICAgICAgICAgICAgICBcIlZlcnNpb25cIjogXCIyMDEyLTEwLTE3XCIsXHJcbiAgICAgICAgICAgICAgICBcIlN0YXRlbWVudFwiOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcInN0czpBc3N1bWVSb2xlXCJdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlJlc291cmNlXCI6IGAke3RoaXMub3B0aW9ucy5jbHVzdGVyQWNjZXNzUm9sZS5yb2xlQXJufWBcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBbXCJla3M6KlwiXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBgKmBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0pfSkpO1xyXG5cclxuICAgICAgICBjbHVzdGVySW5mby5hZGRBZGRPbkNvbnRleHQoVXBib3VuZENyb3NzcGxhbmVBZGRPbi5uYW1lLCB7XHJcbiAgICAgICAgICAgIGFybjogc2Eucm9sZS5yb2xlQXJuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KGNsdXN0ZXIuc3RhY2ssICdwcm92aWRlcmF3c3NhaWFtcm9sZScsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBzYS5yb2xlLnJvbGVBcm4sXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ3Byb3ZpZGVyIEFXUyBJQU0gcm9sZScsXHJcbiAgICAgICAgICAgICAgICBleHBvcnROYW1lIDogJ3Byb3ZpZGVyYXdzc2FpYW1yb2xlJ1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IHZhbHVlczogVmFsdWVzID0gdGhpcy5vcHRpb25zLnZhbHVlcyA/PyB7fTtcclxuICAgICAgICB2YWx1ZXMgPSBtZXJnZSh2YWx1ZXMsIHZhbHVlcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNoYXJ0ID0gdGhpcy5hZGRIZWxtQ2hhcnQoY2x1c3RlckluZm8sIHZhbHVlcywgZmFsc2UsIHRydWUpO1xyXG4gICAgICAgIGNoYXJ0Lm5vZGUuYWRkRGVwZW5kZW5jeShzYSk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFydCk7XHJcbiAgICB9XHJcbn0iXX0=