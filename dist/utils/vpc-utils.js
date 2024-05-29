"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagSubnets = exports.tagSecurityGroup = void 0;
const ec2 = require("aws-cdk-lib/aws-ec2");
const custom_resources_1 = require("aws-cdk-lib/custom-resources");
/**
 * Tags EC2 Security Group with given tag and value - used for EKS Security Group Tagging
 * @param stack - CDK Stack
 * @param securityGroupId - Security Group Resource ID
 * @param key - Tag Key
 * @param value - Tag Value
 */
function tagSecurityGroup(stack, securityGroupId, key, value) {
    const tags = [{
            Key: key,
            Value: value
        }];
    const arn = `arn:${stack.partition}:ec2:${stack.region}:${stack.account}:security-group/` + securityGroupId;
    const parameters = {
        Resources: [securityGroupId],
        Tags: tags
    };
    applyEC2Tag("eks-sg", stack, parameters, key, [arn]);
}
exports.tagSecurityGroup = tagSecurityGroup;
/**
 * Tags VPC Subnets with given tag and value.
 * @param stack - CDK Stack
 * @param subnets - a list of subnets
 * @param key - Tag Key
 * @param value - Tag Value
 */
function tagSubnets(stack, subnets, key, value) {
    for (const subnet of subnets) {
        if (!ec2.Subnet.isVpcSubnet(subnet)) {
            throw new Error('This is not a valid subnet.');
        }
    }
    const tags = [{
            Key: key,
            Value: value
        }];
    const arns = subnets.map(function (val, _) {
        return `arn:${stack.partition}:ec2:${stack.region}:${stack.account}:subnet/` + val.subnetId;
    });
    const parameters = {
        Resources: subnets.map((arn) => arn.subnetId),
        Tags: tags
    };
    applyEC2Tag("subnet", stack, parameters, key, arns);
}
exports.tagSubnets = tagSubnets;
function applyEC2Tag(id, stack, parameters, tag, resources) {
    const sdkCall = {
        service: 'EC2',
        action: 'createTags',
        parameters: parameters,
        physicalResourceId: { id: `${tag}-${id}-Tagger` }
    };
    new custom_resources_1.AwsCustomResource(stack, `${id}-tags-${tag}`, {
        policy: custom_resources_1.AwsCustomResourcePolicy.fromSdkCalls({
            resources: resources,
        }),
        onCreate: sdkCall,
        onUpdate: sdkCall,
        onDelete: {
            ...sdkCall,
            action: 'deleteTags',
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnBjLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3V0aWxzL3ZwYy11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBMkM7QUFFM0MsbUVBQXNHO0FBRXRHOzs7Ozs7R0FNRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLEtBQVksRUFBRSxlQUF1QixFQUFFLEdBQVcsRUFBRSxLQUFhO0lBQzlGLE1BQU0sSUFBSSxHQUFHLENBQUM7WUFDVixHQUFHLEVBQUUsR0FBRztZQUNSLEtBQUssRUFBRSxLQUFLO1NBQ2YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxHQUFHLEdBQUcsT0FBTyxLQUFLLENBQUMsU0FBUyxRQUFRLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sa0JBQWtCLEdBQUMsZUFBZSxDQUFDO0lBRTFHLE1BQU0sVUFBVSxHQUFHO1FBQ2YsU0FBUyxFQUFFLENBQUMsZUFBZSxDQUFDO1FBQzVCLElBQUksRUFBRSxJQUFJO0tBQ2IsQ0FBQztJQUVGLFdBQVcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFkRCw0Q0FjQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLFVBQVUsQ0FBQyxLQUFZLEVBQUUsT0FBc0IsRUFBRSxHQUFXLEVBQUUsS0FBYTtJQUN2RixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQ1gsNkJBQTZCLENBQ2hDLENBQUM7UUFDTixDQUFDO0lBQ0wsQ0FBQztJQUVELE1BQU0sSUFBSSxHQUFHLENBQUM7WUFDVixHQUFHLEVBQUUsR0FBRztZQUNSLEtBQUssRUFBRSxLQUFLO1NBQ2YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BDLE9BQU8sT0FBTyxLQUFLLENBQUMsU0FBUyxRQUFRLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sVUFBVSxHQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7SUFDOUYsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLFVBQVUsR0FBRztRQUNmLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQzdDLElBQUksRUFBRSxJQUFJO0tBQ2IsQ0FBQztJQUVGLFdBQVcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDeEQsQ0FBQztBQXhCRCxnQ0F3QkM7QUFFRCxTQUFTLFdBQVcsQ0FBRSxFQUFVLEVBQUUsS0FBWSxFQUFFLFVBQThCLEVBQUUsR0FBVyxFQUFFLFNBQW1CO0lBQzVHLE1BQU0sT0FBTyxHQUFlO1FBQ3hCLE9BQU8sRUFBRSxLQUFLO1FBQ2QsTUFBTSxFQUFFLFlBQVk7UUFDcEIsVUFBVSxFQUFFLFVBQVU7UUFDdEIsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxHQUFHLElBQUksRUFBRSxTQUFTLEVBQUM7S0FDbkQsQ0FBQztJQUVGLElBQUksb0NBQWlCLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxTQUFTLEdBQUcsRUFBRSxFQUFFO1FBQzlDLE1BQU0sRUFBRSwwQ0FBdUIsQ0FBQyxZQUFZLENBQUM7WUFDekMsU0FBUyxFQUFFLFNBQVM7U0FDdkIsQ0FBQztRQUVGLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLFFBQVEsRUFBRTtZQUNOLEdBQUcsT0FBTztZQUNWLE1BQU0sRUFBRSxZQUFZO1NBQ3ZCO0tBQ0osQ0FBQyxDQUFDO0FBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7IFN0YWNrIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQXdzQ3VzdG9tUmVzb3VyY2UsIEF3c0N1c3RvbVJlc291cmNlUG9saWN5LCBBd3NTZGtDYWxsIH0gZnJvbSBcImF3cy1jZGstbGliL2N1c3RvbS1yZXNvdXJjZXNcIjtcblxuLyoqXG4gKiBUYWdzIEVDMiBTZWN1cml0eSBHcm91cCB3aXRoIGdpdmVuIHRhZyBhbmQgdmFsdWUgLSB1c2VkIGZvciBFS1MgU2VjdXJpdHkgR3JvdXAgVGFnZ2luZ1xuICogQHBhcmFtIHN0YWNrIC0gQ0RLIFN0YWNrXG4gKiBAcGFyYW0gc2VjdXJpdHlHcm91cElkIC0gU2VjdXJpdHkgR3JvdXAgUmVzb3VyY2UgSURcbiAqIEBwYXJhbSBrZXkgLSBUYWcgS2V5XG4gKiBAcGFyYW0gdmFsdWUgLSBUYWcgVmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRhZ1NlY3VyaXR5R3JvdXAoc3RhY2s6IFN0YWNrLCBzZWN1cml0eUdyb3VwSWQ6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB0YWdzID0gW3tcbiAgICAgICAgS2V5OiBrZXksXG4gICAgICAgIFZhbHVlOiB2YWx1ZVxuICAgIH1dO1xuXG4gICAgY29uc3QgYXJuID0gYGFybjoke3N0YWNrLnBhcnRpdGlvbn06ZWMyOiR7c3RhY2sucmVnaW9ufToke3N0YWNrLmFjY291bnR9OnNlY3VyaXR5LWdyb3VwL2Arc2VjdXJpdHlHcm91cElkO1xuXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IHtcbiAgICAgICAgUmVzb3VyY2VzOiBbc2VjdXJpdHlHcm91cElkXSxcbiAgICAgICAgVGFnczogdGFnc1xuICAgIH07XG5cbiAgICBhcHBseUVDMlRhZyhcImVrcy1zZ1wiLCBzdGFjaywgcGFyYW1ldGVycywga2V5LCBbYXJuXSk7XG59XG5cbi8qKlxuICogVGFncyBWUEMgU3VibmV0cyB3aXRoIGdpdmVuIHRhZyBhbmQgdmFsdWUuXG4gKiBAcGFyYW0gc3RhY2sgLSBDREsgU3RhY2tcbiAqIEBwYXJhbSBzdWJuZXRzIC0gYSBsaXN0IG9mIHN1Ym5ldHNcbiAqIEBwYXJhbSBrZXkgLSBUYWcgS2V5XG4gKiBAcGFyYW0gdmFsdWUgLSBUYWcgVmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRhZ1N1Ym5ldHMoc3RhY2s6IFN0YWNrLCBzdWJuZXRzOiBlYzIuSVN1Ym5ldFtdLCBrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGZvciAoY29uc3Qgc3VibmV0IG9mIHN1Ym5ldHMpe1xuICAgICAgICBpZiAoIWVjMi5TdWJuZXQuaXNWcGNTdWJuZXQoc3VibmV0KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICdUaGlzIGlzIG5vdCBhIHZhbGlkIHN1Ym5ldC4nXG4gICAgICAgICAgICApO1xuICAgICAgICB9IFxuICAgIH1cbiAgICBcbiAgICBjb25zdCB0YWdzID0gW3tcbiAgICAgICAgS2V5OiBrZXksXG4gICAgICAgIFZhbHVlOiB2YWx1ZVxuICAgIH1dO1xuXG4gICAgY29uc3QgYXJucyA9IHN1Ym5ldHMubWFwKGZ1bmN0aW9uKHZhbCwgXyl7XG4gICAgICAgIHJldHVybiBgYXJuOiR7c3RhY2sucGFydGl0aW9ufTplYzI6JHtzdGFjay5yZWdpb259OiR7c3RhY2suYWNjb3VudH06c3VibmV0L2ArdmFsLnN1Ym5ldElkO1xuICAgIH0pO1xuXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IHtcbiAgICAgICAgUmVzb3VyY2VzOiBzdWJuZXRzLm1hcCgoYXJuKSA9PiBhcm4uc3VibmV0SWQpLFxuICAgICAgICBUYWdzOiB0YWdzXG4gICAgfTtcblxuICAgIGFwcGx5RUMyVGFnKFwic3VibmV0XCIsIHN0YWNrLCBwYXJhbWV0ZXJzLCBrZXksIGFybnMpO1xufVxuXG5mdW5jdGlvbiBhcHBseUVDMlRhZyggaWQ6IHN0cmluZywgc3RhY2s6IFN0YWNrLCBwYXJhbWV0ZXJzOiBSZWNvcmQ8c3RyaW5nLGFueT4sIHRhZzogc3RyaW5nLCByZXNvdXJjZXM6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgY29uc3Qgc2RrQ2FsbDogQXdzU2RrQ2FsbCA9IHtcbiAgICAgICAgc2VydmljZTogJ0VDMicsXG4gICAgICAgIGFjdGlvbjogJ2NyZWF0ZVRhZ3MnLFxuICAgICAgICBwYXJhbWV0ZXJzOiBwYXJhbWV0ZXJzLFxuICAgICAgICBwaHlzaWNhbFJlc291cmNlSWQ6IHsgaWQ6IGAke3RhZ30tJHtpZH0tVGFnZ2VyYH1cbiAgICB9O1xuICAgIFxuICAgIG5ldyBBd3NDdXN0b21SZXNvdXJjZShzdGFjaywgYCR7aWR9LXRhZ3MtJHt0YWd9YCwge1xuICAgICAgICBwb2xpY3k6IEF3c0N1c3RvbVJlc291cmNlUG9saWN5LmZyb21TZGtDYWxscyh7XG4gICAgICAgICAgICByZXNvdXJjZXM6IHJlc291cmNlcyxcbiAgICAgICAgfSksXG5cbiAgICAgICAgb25DcmVhdGU6IHNka0NhbGwsXG4gICAgICAgIG9uVXBkYXRlOiBzZGtDYWxsLFxuICAgICAgICBvbkRlbGV0ZTogeyBcbiAgICAgICAgICAgIC4uLnNka0NhbGwsIFxuICAgICAgICAgICAgYWN0aW9uOiAnZGVsZXRlVGFncycsXG4gICAgICAgIH0sXG4gICAgfSk7XG59Il19