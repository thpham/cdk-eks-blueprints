"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupSubnetProvider = exports.DirectVpcProvider = exports.VpcProvider = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
/**
 * VPC resource provider
 */
class VpcProvider {
    constructor(vpcId, vpcProps) {
        this.vpcProps = vpcProps;
        this.vpcId = vpcId;
        this.primaryCidr = vpcProps === null || vpcProps === void 0 ? void 0 : vpcProps.primaryCidr;
        this.secondaryCidr = vpcProps === null || vpcProps === void 0 ? void 0 : vpcProps.secondaryCidr;
        this.secondarySubnetCidrs = vpcProps === null || vpcProps === void 0 ? void 0 : vpcProps.secondarySubnetCidrs;
    }
    provide(context) {
        const id = context.scope.node.id;
        let vpc = undefined;
        if (this.vpcId) {
            if (this.vpcId === "default") {
                console.log(`looking up completely default VPC`);
                vpc = ec2.Vpc.fromLookup(context.scope, id + "-vpc", { isDefault: true });
            }
            else {
                console.log(`looking up non-default ${this.vpcId} VPC`);
                vpc = ec2.Vpc.fromLookup(context.scope, id + "-vpc", { vpcId: this.vpcId });
            }
        }
        if (vpc == null) {
            // It will automatically divide the provided VPC CIDR range, and create public and private subnets per Availability Zone.
            // If VPC CIDR range is not provided, uses `10.0.0.0/16` as the range and creates public and private subnets per Availability Zone.
            // Network routing for the public subnets will be configured to allow outbound access directly via an Internet Gateway.
            // Network routing for the private subnets will be configured to allow outbound access via a set of resilient NAT Gateways (one per AZ).
            // Creates Secondary CIDR and Secondary subnets if passed.
            if (this.primaryCidr) {
                vpc = new ec2.Vpc(context.scope, id + "-vpc", {
                    ipAddresses: ec2.IpAddresses.cidr(this.primaryCidr)
                });
            }
            else {
                vpc = new ec2.Vpc(context.scope, id + "-vpc");
            }
        }
        if (this.secondaryCidr) {
            this.createSecondarySubnets(context, id, vpc);
        }
        return vpc;
    }
    createSecondarySubnets(context, id, vpc) {
        const secondarySubnets = [];
        const secondaryCidr = new ec2.CfnVPCCidrBlock(context.scope, id + "-secondaryCidr", {
            vpcId: vpc.vpcId,
            cidrBlock: this.secondaryCidr
        });
        secondaryCidr.node.addDependency(vpc);
        if (this.secondarySubnetCidrs) {
            for (let i = 0; i < vpc.availabilityZones.length; i++) {
                if (this.secondarySubnetCidrs[i]) {
                    secondarySubnets[i] = new ec2.PrivateSubnet(context.scope, id + "private-subnet-" + i, {
                        availabilityZone: vpc.availabilityZones[i],
                        cidrBlock: this.secondarySubnetCidrs[i],
                        vpcId: vpc.vpcId
                    });
                    secondarySubnets[i].node.addDependency(secondaryCidr);
                    context.add("secondary-cidr-subnet-" + i, {
                        provide(_context) { return secondarySubnets[i]; }
                    });
                }
            }
            for (let secondarySubnet of secondarySubnets) {
                aws_cdk_lib_1.Tags.of(secondarySubnet).add("kubernetes.io/role/internal-elb", "1", { applyToLaunchedInstances: true });
                aws_cdk_lib_1.Tags.of(secondarySubnet).add("Name", `blueprint-construct-dev-PrivateSubnet-${secondarySubnet}`, { applyToLaunchedInstances: true });
            }
        }
    }
}
exports.VpcProvider = VpcProvider;
class DirectVpcProvider {
    constructor(vpc) {
        this.vpc = vpc;
    }
    provide(_context) {
        return this.vpc;
    }
}
exports.DirectVpcProvider = DirectVpcProvider;
/**
 * Direct import secondary subnet provider, based on a known subnet ID.
 * Recommended method if secondary subnet id is known, as it avoids extra look-ups.
 */
class LookupSubnetProvider {
    constructor(subnetId) {
        this.subnetId = subnetId;
    }
    provide(context) {
        return ec2.Subnet.fromSubnetAttributes(context.scope, `${this.subnetId}-secondarysubnet`, { subnetId: this.subnetId });
    }
}
exports.LookupSubnetProvider = LookupSubnetProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnBjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL3Jlc291cmNlLXByb3ZpZGVycy92cGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQW1DO0FBQ25DLDJDQUEyQztBQWEzQzs7R0FFRztBQUNILE1BQWEsV0FBVztJQU1wQixZQUFZLEtBQWMsRUFBVSxRQUFtQjtRQUFuQixhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQ25ELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLFdBQVcsQ0FBQztRQUN6QyxJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxhQUFhLENBQUM7UUFDN0MsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxvQkFBb0IsQ0FBQztJQUMvRCxDQUFDO0lBRUQsT0FBTyxDQUFDLE9BQXdCO1FBQzVCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNqQyxJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUM7UUFFcEIsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsQ0FBQztnQkFDakQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzlFLENBQUM7aUJBQU0sQ0FBQztnQkFDSixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixJQUFJLENB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LENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDekcsa0JBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSx5Q0FBeUMsZUFBZSxFQUFFLEVBQUUsRUFBRSx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3pJLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBOUVELGtDQThFQztBQUVELE1BQWEsaUJBQWlCO0lBQ3pCLFlBQXFCLEdBQWE7UUFBYixRQUFHLEdBQUgsR0FBRyxDQUFVO0lBQUksQ0FBQztJQUV4QyxPQUFPLENBQUMsUUFBeUI7UUFDN0IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQ3BCLENBQUM7Q0FDSjtBQU5ELDhDQU1DO0FBRUQ7OztHQUdHO0FBQ0gsTUFBYSxvQkFBb0I7SUFDN0IsWUFBb0IsUUFBZ0I7UUFBaEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtJQUFJLENBQUM7SUFFekMsT0FBTyxDQUFDLE9BQXdCO1FBQzVCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsa0JBQWtCLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7SUFDekgsQ0FBQztDQUNKO0FBTkQsb0RBTUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUYWdzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHsgSVN1Ym5ldCwgUHJpdmF0ZVN1Ym5ldCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHsgUmVzb3VyY2VDb250ZXh0LCBSZXNvdXJjZVByb3ZpZGVyIH0gZnJvbSBcIi4uL3NwaVwiO1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgTWFwcGluZyBmb3IgZmllbGRzIHN1Y2ggYXMgUHJpbWFyeSBDSURSLCBTZWNvbmRhcnkgQ0lEUiwgU2Vjb25kYXJ5IFN1Ym5ldCBDSURSLlxuICovXG5pbnRlcmZhY2UgVnBjUHJvcHMge1xuICAgcHJpbWFyeUNpZHI6IHN0cmluZywgXG4gICBzZWNvbmRhcnlDaWRyPzogc3RyaW5nLFxuICAgc2Vjb25kYXJ5U3VibmV0Q2lkcnM/OiBzdHJpbmdbXVxufVxuXG4vKipcbiAqIFZQQyByZXNvdXJjZSBwcm92aWRlciBcbiAqL1xuZXhwb3J0IGNsYXNzIFZwY1Byb3ZpZGVyIGltcGxlbWVudHMgUmVzb3VyY2VQcm92aWRlcjxlYzIuSVZwYz4ge1xuICAgIHJlYWRvbmx5IHZwY0lkPzogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHByaW1hcnlDaWRyPzogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHNlY29uZGFyeUNpZHI/OiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgc2Vjb25kYXJ5U3VibmV0Q2lkcnM/OiBzdHJpbmdbXTtcblxuICAgIGNvbnN0cnVjdG9yKHZwY0lkPzogc3RyaW5nLCBwcml2YXRlIHZwY1Byb3BzPzogVnBjUHJvcHMpIHtcbiAgICAgICAgdGhpcy52cGNJZCA9IHZwY0lkO1xuICAgICAgICB0aGlzLnByaW1hcnlDaWRyID0gdnBjUHJvcHM/LnByaW1hcnlDaWRyO1xuICAgICAgICB0aGlzLnNlY29uZGFyeUNpZHIgPSB2cGNQcm9wcz8uc2Vjb25kYXJ5Q2lkcjtcbiAgICAgICAgdGhpcy5zZWNvbmRhcnlTdWJuZXRDaWRycyA9IHZwY1Byb3BzPy5zZWNvbmRhcnlTdWJuZXRDaWRycztcbiAgICB9XG5cbiAgICBwcm92aWRlKGNvbnRleHQ6IFJlc291cmNlQ29udGV4dCk6IGVjMi5JVnBjIHtcbiAgICAgICAgY29uc3QgaWQgPSBjb250ZXh0LnNjb3BlLm5vZGUuaWQ7XG4gICAgICAgIGxldCB2cGMgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKHRoaXMudnBjSWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnZwY0lkID09PSBcImRlZmF1bHRcIikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBsb29raW5nIHVwIGNvbXBsZXRlbHkgZGVmYXVsdCBWUENgKTtcbiAgICAgICAgICAgICAgICB2cGMgPSBlYzIuVnBjLmZyb21Mb29rdXAoY29udGV4dC5zY29wZSwgaWQgKyBcIi12cGNcIiwgeyBpc0RlZmF1bHQ6IHRydWUgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBsb29raW5nIHVwIG5vbi1kZWZhdWx0ICR7dGhpcy52cGNJZH0gVlBDYCk7XG4gICAgICAgICAgICAgICAgdnBjID0gZWMyLlZwYy5mcm9tTG9va3VwKGNvbnRleHQuc2NvcGUsIGlkICsgXCItdnBjXCIsIHsgdnBjSWQ6IHRoaXMudnBjSWQgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodnBjID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEl0IHdpbGwgYXV0b21hdGljYWxseSBkaXZpZGUgdGhlIHByb3ZpZGVkIFZQQyBDSURSIHJhbmdlLCBhbmQgY3JlYXRlIHB1YmxpYyBhbmQgcHJpdmF0ZSBzdWJuZXRzIHBlciBBdmFpbGFiaWxpdHkgWm9uZS5cbiAgICAgICAgICAgIC8vIElmIFZQQyBDSURSIHJhbmdlIGlzIG5vdCBwcm92aWRlZCwgdXNlcyBgMTAuMC4wLjAvMTZgIGFzIHRoZSByYW5nZSBhbmQgY3JlYXRlcyBwdWJsaWMgYW5kIHByaXZhdGUgc3VibmV0cyBwZXIgQXZhaWxhYmlsaXR5IFpvbmUuXG4gICAgICAgICAgICAvLyBOZXR3b3JrIHJvdXRpbmcgZm9yIHRoZSBwdWJsaWMgc3VibmV0cyB3aWxsIGJlIGNvbmZpZ3VyZWQgdG8gYWxsb3cgb3V0Ym91bmQgYWNjZXNzIGRpcmVjdGx5IHZpYSBhbiBJbnRlcm5ldCBHYXRld2F5LlxuICAgICAgICAgICAgLy8gTmV0d29yayByb3V0aW5nIGZvciB0aGUgcHJpdmF0ZSBzdWJuZXRzIHdpbGwgYmUgY29uZmlndXJlZCB0byBhbGxvdyBvdXRib3VuZCBhY2Nlc3MgdmlhIGEgc2V0IG9mIHJlc2lsaWVudCBOQVQgR2F0ZXdheXMgKG9uZSBwZXIgQVopLlxuICAgICAgICAgICAgLy8gQ3JlYXRlcyBTZWNvbmRhcnkgQ0lEUiBhbmQgU2Vjb25kYXJ5IHN1Ym5ldHMgaWYgcGFzc2VkLlxuICAgICAgICAgICAgaWYgKHRoaXMucHJpbWFyeUNpZHIpIHtcbiAgICAgICAgICAgICAgICB2cGMgPSBuZXcgZWMyLlZwYyhjb250ZXh0LnNjb3BlLCBpZCArIFwiLXZwY1wiLHtcbiAgICAgICAgICAgICAgICAgICAgaXBBZGRyZXNzZXM6IGVjMi5JcEFkZHJlc3Nlcy5jaWRyKHRoaXMucHJpbWFyeUNpZHIpXG4gICAgICAgICAgICAgICAgfSk7ICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdnBjID0gbmV3IGVjMi5WcGMoY29udGV4dC5zY29wZSwgaWQgKyBcIi12cGNcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuc2Vjb25kYXJ5Q2lkcikge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVTZWNvbmRhcnlTdWJuZXRzKGNvbnRleHQsIGlkLCB2cGMpO1xuICAgICAgICB9XG4gICAgXG4gICAgICAgIHJldHVybiB2cGM7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVNlY29uZGFyeVN1Ym5ldHMoY29udGV4dDogUmVzb3VyY2VDb250ZXh0LCBpZDogc3RyaW5nLCB2cGM6IGVjMi5JVnBjKSB7XG4gICAgICAgIGNvbnN0IHNlY29uZGFyeVN1Ym5ldHM6IEFycmF5PFByaXZhdGVTdWJuZXQ+ID0gW107XG4gICAgICAgIGNvbnN0IHNlY29uZGFyeUNpZHIgPSBuZXcgZWMyLkNmblZQQ0NpZHJCbG9jayhjb250ZXh0LnNjb3BlLCBpZCArIFwiLXNlY29uZGFyeUNpZHJcIiwge1xuICAgICAgICAgICAgdnBjSWQ6IHZwYy52cGNJZCxcbiAgICAgICAgICAgIGNpZHJCbG9jazogdGhpcy5zZWNvbmRhcnlDaWRyXG4gICAgICAgIH0pO1xuICAgICAgICBzZWNvbmRhcnlDaWRyLm5vZGUuYWRkRGVwZW5kZW5jeSh2cGMpO1xuICAgICAgICBpZiAodGhpcy5zZWNvbmRhcnlTdWJuZXRDaWRycykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2cGMuYXZhaWxhYmlsaXR5Wm9uZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWNvbmRhcnlTdWJuZXRDaWRyc1tpXSkge1xuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlTdWJuZXRzW2ldID0gbmV3IGVjMi5Qcml2YXRlU3VibmV0KGNvbnRleHQuc2NvcGUsIGlkICsgXCJwcml2YXRlLXN1Ym5ldC1cIiArIGksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eVpvbmU6IHZwYy5hdmFpbGFiaWxpdHlab25lc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpZHJCbG9jazogdGhpcy5zZWNvbmRhcnlTdWJuZXRDaWRyc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZwY0lkOiB2cGMudnBjSWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeVN1Ym5ldHNbaV0ubm9kZS5hZGREZXBlbmRlbmN5KHNlY29uZGFyeUNpZHIpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmFkZChcInNlY29uZGFyeS1jaWRyLXN1Ym5ldC1cIiArIGksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGUoX2NvbnRleHQpOiBJU3VibmV0IHsgcmV0dXJuIHNlY29uZGFyeVN1Ym5ldHNbaV07IH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChsZXQgc2Vjb25kYXJ5U3VibmV0IG9mIHNlY29uZGFyeVN1Ym5ldHMpIHtcbiAgICAgICAgICAgICAgICBUYWdzLm9mKHNlY29uZGFyeVN1Ym5ldCkuYWRkKFwia3ViZXJuZXRlcy5pby9yb2xlL2ludGVybmFsLWVsYlwiLCBcIjFcIiwgeyBhcHBseVRvTGF1bmNoZWRJbnN0YW5jZXM6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgVGFncy5vZihzZWNvbmRhcnlTdWJuZXQpLmFkZChcIk5hbWVcIiwgYGJsdWVwcmludC1jb25zdHJ1Y3QtZGV2LVByaXZhdGVTdWJuZXQtJHtzZWNvbmRhcnlTdWJuZXR9YCwgeyBhcHBseVRvTGF1bmNoZWRJbnN0YW5jZXM6IHRydWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEaXJlY3RWcGNQcm92aWRlciBpbXBsZW1lbnRzIFJlc291cmNlUHJvdmlkZXI8ZWMyLklWcGM+IHtcbiAgICAgY29uc3RydWN0b3IocmVhZG9ubHkgdnBjOiBlYzIuSVZwYykgeyB9XG5cbiAgICBwcm92aWRlKF9jb250ZXh0OiBSZXNvdXJjZUNvbnRleHQpOiBlYzIuSVZwYyB7XG4gICAgICAgIHJldHVybiB0aGlzLnZwYztcbiAgICB9ICAgIFxufVxuXG4vKipcbiAqIERpcmVjdCBpbXBvcnQgc2Vjb25kYXJ5IHN1Ym5ldCBwcm92aWRlciwgYmFzZWQgb24gYSBrbm93biBzdWJuZXQgSUQuIFxuICogUmVjb21tZW5kZWQgbWV0aG9kIGlmIHNlY29uZGFyeSBzdWJuZXQgaWQgaXMga25vd24sIGFzIGl0IGF2b2lkcyBleHRyYSBsb29rLXVwcy5cbiAqL1xuZXhwb3J0IGNsYXNzIExvb2t1cFN1Ym5ldFByb3ZpZGVyIGltcGxlbWVudHMgUmVzb3VyY2VQcm92aWRlcjxJU3VibmV0PiB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBzdWJuZXRJZDogc3RyaW5nKSB7IH1cblxuICAgIHByb3ZpZGUoY29udGV4dDogUmVzb3VyY2VDb250ZXh0KTogZWMyLklTdWJuZXQge1xuICAgICAgICByZXR1cm4gZWMyLlN1Ym5ldC5mcm9tU3VibmV0QXR0cmlidXRlcyhjb250ZXh0LnNjb3BlLCBgJHt0aGlzLnN1Ym5ldElkfS1zZWNvbmRhcnlzdWJuZXRgLCB7c3VibmV0SWQ6IHRoaXMuc3VibmV0SWR9KTtcbiAgICB9XG59XG4iXX0=