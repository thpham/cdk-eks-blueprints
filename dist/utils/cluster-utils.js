"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployBeforeCapacity = exports.tagAsg = void 0;
const customResource = require("aws-cdk-lib/custom-resources");
/**
 * Creates the node termination tag for the ASG
 * @param scope
 * @param autoScalingGroup
 */
function tagAsg(scope, autoScalingGroup, tags) {
    let tagList = [];
    tags.forEach((tag) => {
        tagList.push({
            Key: tag.Key,
            Value: tag.Value,
            PropagateAtLaunch: true,
            ResourceId: autoScalingGroup,
            ResourceType: 'auto-scaling-group'
        });
    });
    const callProps = {
        service: 'AutoScaling',
        action: 'createOrUpdateTags',
        parameters: {
            Tags: tagList
        },
        physicalResourceId: customResource.PhysicalResourceId.of(`${autoScalingGroup}-asg-tag`)
    };
    new customResource.AwsCustomResource(scope, 'asg-tag', {
        onCreate: callProps,
        onUpdate: callProps,
        policy: customResource.AwsCustomResourcePolicy.fromSdkCalls({
            resources: customResource.AwsCustomResourcePolicy.ANY_RESOURCE
        })
    });
}
exports.tagAsg = tagAsg;
/**
 * Makes the provided construct run before any capacity (worker nodes) is provisioned on the cluster.
 * Useful for control plane add-ons, such as VPC-CNI that must be provisioned before EC2 (or Fargate) capacity is added.
 * @param construct identifies construct (such as core add-on) that should be provisioned before capacity
 * @param clusterInfo cluster provisioning context
 */
function deployBeforeCapacity(construct, clusterInfo) {
    var _a, _b, _c;
    let allCapacity = [];
    allCapacity = allCapacity.concat((_a = clusterInfo.nodeGroups) !== null && _a !== void 0 ? _a : [])
        .concat((_b = clusterInfo.autoscalingGroups) !== null && _b !== void 0 ? _b : [])
        .concat((_c = clusterInfo.fargateProfiles) !== null && _c !== void 0 ? _c : []);
    allCapacity.forEach(v => v.node.addDependency(construct));
}
exports.deployBeforeCapacity = deployBeforeCapacity;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2x1c3Rlci11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi91dGlscy9jbHVzdGVyLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQUErRDtBQVMvRDs7OztHQUlHO0FBQ0YsU0FBZ0IsTUFBTSxDQUFDLEtBQWdCLEVBQUUsZ0JBQXdCLEVBQUUsSUFBVztJQUM3RSxJQUFJLE9BQU8sR0FNTCxFQUFFLENBQUM7SUFFVCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQztZQUNYLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRztZQUNaLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSztZQUNoQixpQkFBaUIsRUFBRyxJQUFJO1lBQ3hCLFVBQVUsRUFBRSxnQkFBZ0I7WUFDNUIsWUFBWSxFQUFFLG9CQUFvQjtTQUNuQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sU0FBUyxHQUE4QjtRQUMzQyxPQUFPLEVBQUUsYUFBYTtRQUN0QixNQUFNLEVBQUUsb0JBQW9CO1FBQzVCLFVBQVUsRUFBRTtZQUNWLElBQUksRUFBRSxPQUFPO1NBQ2Q7UUFDRCxrQkFBa0IsRUFBRSxjQUFjLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUN0RCxHQUFHLGdCQUFnQixVQUFVLENBQzlCO0tBQ0YsQ0FBQztJQUVGLElBQUksY0FBYyxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUU7UUFDckQsUUFBUSxFQUFFLFNBQVM7UUFDbkIsUUFBUSxFQUFFLFNBQVM7UUFDbkIsTUFBTSxFQUFFLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUM7WUFDMUQsU0FBUyxFQUFFLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZO1NBQy9ELENBQUM7S0FDSCxDQUFDLENBQUM7QUFDTCxDQUFDO0FBckNBLHdCQXFDQTtBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0Isb0JBQW9CLENBQUMsU0FBb0IsRUFBRSxXQUF3Qjs7SUFDL0UsSUFBSSxXQUFXLEdBQWtCLEVBQUUsQ0FBQztJQUNwQyxXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFBLFdBQVcsQ0FBQyxVQUFVLG1DQUFJLEVBQUUsQ0FBQztTQUN6RCxNQUFNLENBQUMsTUFBQSxXQUFXLENBQUMsaUJBQWlCLG1DQUFJLEVBQUUsQ0FBQztTQUMzQyxNQUFNLENBQUMsTUFBQSxXQUFXLENBQUMsZUFBZSxtQ0FBSSxFQUFFLENBQUMsQ0FBQztJQUMvQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM5RCxDQUFDO0FBTkQsb0RBTUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0ICogYXMgY3VzdG9tUmVzb3VyY2UgZnJvbSAnYXdzLWNkay1saWIvY3VzdG9tLXJlc291cmNlcyc7XG5pbXBvcnQgeyBDbHVzdGVySW5mbyB9IGZyb20gXCIuLi9zcGlcIjtcblxuXG5pbnRlcmZhY2UgVGFnIHtcbiAgS2V5OiBzdHJpbmc7XG4gIFZhbHVlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgbm9kZSB0ZXJtaW5hdGlvbiB0YWcgZm9yIHRoZSBBU0dcbiAqIEBwYXJhbSBzY29wZVxuICogQHBhcmFtIGF1dG9TY2FsaW5nR3JvdXAgXG4gKi9cbiBleHBvcnQgZnVuY3Rpb24gdGFnQXNnKHNjb3BlOiBDb25zdHJ1Y3QsIGF1dG9TY2FsaW5nR3JvdXA6IHN0cmluZywgdGFnczogVGFnW10pOiB2b2lkIHtcbiAgbGV0IHRhZ0xpc3Q6IHtcbiAgICBLZXk6IHN0cmluZztcbiAgICBWYWx1ZTogc3RyaW5nO1xuICAgIFByb3BhZ2F0ZUF0TGF1bmNoOiBib29sZWFuO1xuICAgIFJlc291cmNlSWQ6IHN0cmluZztcbiAgICBSZXNvdXJjZVR5cGU6IHN0cmluZztcbiAgfVtdID0gW107XG5cbiAgdGFncy5mb3JFYWNoKCh0YWcpID0+IHtcbiAgICB0YWdMaXN0LnB1c2goe1xuICAgICAgS2V5OiB0YWcuS2V5LFxuICAgICAgVmFsdWU6IHRhZy5WYWx1ZSxcbiAgICAgIFByb3BhZ2F0ZUF0TGF1bmNoIDogdHJ1ZSxcbiAgICAgIFJlc291cmNlSWQ6IGF1dG9TY2FsaW5nR3JvdXAsXG4gICAgICBSZXNvdXJjZVR5cGU6ICdhdXRvLXNjYWxpbmctZ3JvdXAnXG4gICAgfSk7XG4gIH0pO1xuXG4gIGNvbnN0IGNhbGxQcm9wczogY3VzdG9tUmVzb3VyY2UuQXdzU2RrQ2FsbCA9IHtcbiAgICBzZXJ2aWNlOiAnQXV0b1NjYWxpbmcnLFxuICAgIGFjdGlvbjogJ2NyZWF0ZU9yVXBkYXRlVGFncycsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgVGFnczogdGFnTGlzdFxuICAgIH0sXG4gICAgcGh5c2ljYWxSZXNvdXJjZUlkOiBjdXN0b21SZXNvdXJjZS5QaHlzaWNhbFJlc291cmNlSWQub2YoXG4gICAgICBgJHthdXRvU2NhbGluZ0dyb3VwfS1hc2ctdGFnYFxuICAgIClcbiAgfTtcblxuICBuZXcgY3VzdG9tUmVzb3VyY2UuQXdzQ3VzdG9tUmVzb3VyY2Uoc2NvcGUsICdhc2ctdGFnJywge1xuICAgIG9uQ3JlYXRlOiBjYWxsUHJvcHMsXG4gICAgb25VcGRhdGU6IGNhbGxQcm9wcyxcbiAgICBwb2xpY3k6IGN1c3RvbVJlc291cmNlLkF3c0N1c3RvbVJlc291cmNlUG9saWN5LmZyb21TZGtDYWxscyh7XG4gICAgICByZXNvdXJjZXM6IGN1c3RvbVJlc291cmNlLkF3c0N1c3RvbVJlc291cmNlUG9saWN5LkFOWV9SRVNPVVJDRVxuICAgIH0pXG4gIH0pO1xufVxuXG4vKipcbiAqIE1ha2VzIHRoZSBwcm92aWRlZCBjb25zdHJ1Y3QgcnVuIGJlZm9yZSBhbnkgY2FwYWNpdHkgKHdvcmtlciBub2RlcykgaXMgcHJvdmlzaW9uZWQgb24gdGhlIGNsdXN0ZXIuXG4gKiBVc2VmdWwgZm9yIGNvbnRyb2wgcGxhbmUgYWRkLW9ucywgc3VjaCBhcyBWUEMtQ05JIHRoYXQgbXVzdCBiZSBwcm92aXNpb25lZCBiZWZvcmUgRUMyIChvciBGYXJnYXRlKSBjYXBhY2l0eSBpcyBhZGRlZC5cbiAqIEBwYXJhbSBjb25zdHJ1Y3QgaWRlbnRpZmllcyBjb25zdHJ1Y3QgKHN1Y2ggYXMgY29yZSBhZGQtb24pIHRoYXQgc2hvdWxkIGJlIHByb3Zpc2lvbmVkIGJlZm9yZSBjYXBhY2l0eVxuICogQHBhcmFtIGNsdXN0ZXJJbmZvIGNsdXN0ZXIgcHJvdmlzaW9uaW5nIGNvbnRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlcGxveUJlZm9yZUNhcGFjaXR5KGNvbnN0cnVjdDogQ29uc3RydWN0LCBjbHVzdGVySW5mbzogQ2x1c3RlckluZm8pIHtcbiAgICBsZXQgYWxsQ2FwYWNpdHkgOiBDb25zdHJ1Y3RbXSAgPSBbXTtcbiAgICBhbGxDYXBhY2l0eSA9IGFsbENhcGFjaXR5LmNvbmNhdChjbHVzdGVySW5mby5ub2RlR3JvdXBzID8/IFtdKVxuICAgICAgICAuY29uY2F0KGNsdXN0ZXJJbmZvLmF1dG9zY2FsaW5nR3JvdXBzID8/IFtdKVxuICAgICAgICAuY29uY2F0KGNsdXN0ZXJJbmZvLmZhcmdhdGVQcm9maWxlcyA/PyBbXSk7XG4gICAgYWxsQ2FwYWNpdHkuZm9yRWFjaCh2ID0+IHYubm9kZS5hZGREZXBlbmRlbmN5KGNvbnN0cnVjdCkpO1xufSJdfQ==