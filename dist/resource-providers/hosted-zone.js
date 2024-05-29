"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelegatingHostedZoneProvider = exports.ImportHostedZoneProvider = exports.LookupHostedZoneProvider = void 0;
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const r53 = require("aws-cdk-lib/aws-route53");
/**
 * Simple lookup host zone provider
 */
class LookupHostedZoneProvider {
    /**
     * @param hostedZoneName name of the host zone to lookup
     * @param id  optional id for the structure (for tracking). set to hostzonename by default
     */
    constructor(hostedZoneName, id) {
        this.hostedZoneName = hostedZoneName;
        this.id = id;
    }
    provide(context) {
        var _a;
        return r53.HostedZone.fromLookup(context.scope, (_a = this.id) !== null && _a !== void 0 ? _a : `${this.hostedZoneName}-Lookup`, { domainName: this.hostedZoneName });
    }
}
exports.LookupHostedZoneProvider = LookupHostedZoneProvider;
/**
 * Direct import hosted zone provider, based on a known hosted zone ID.
 * Recommended method if hosted zone id is known, as it avoids extra look-ups.
 */
class ImportHostedZoneProvider {
    constructor(hostedZoneId, id) {
        this.hostedZoneId = hostedZoneId;
        this.id = id;
    }
    provide(context) {
        var _a;
        return r53.HostedZone.fromHostedZoneId(context.scope, (_a = this.id) !== null && _a !== void 0 ? _a : `${this.hostedZoneId}-Import`, this.hostedZoneId);
    }
}
exports.ImportHostedZoneProvider = ImportHostedZoneProvider;
/**
 * Delegating provider is a convenience approach to have a global hosted zone record in a centralized
 * account and subdomain records in respective workload accounts.
 *
 * The delegation part allows routing subdomain entries to the child hosted zone in the workload account.
 */
class DelegatingHostedZoneProvider {
    constructor(options) {
        this.options = options;
    }
    provide(context) {
        const stack = context.scope;
        const subZone = new r53.PublicHostedZone(stack, `${this.options.subdomain}-SubZone`, {
            zoneName: this.options.subdomain
        });
        if (this.options.wildcardSubdomain) {
            new r53.CnameRecord(stack, `${this.options.subdomain}-cname`, {
                zone: subZone,
                domainName: `${this.options.subdomain}`,
                recordName: `*.${this.options.subdomain}`
            });
        }
        // 
        // import the delegation role by constructing the roleArn.
        // Assuming the parent account has the delegating role with 
        // trust relationship setup to the child account.
        //
        const delegationRoleArn = stack.formatArn({
            region: '', // IAM is global in each partition
            service: 'iam',
            account: this.options.parentDnsAccountId,
            resource: 'role',
            resourceName: this.options.delegatingRoleName
        });
        const delegationRole = aws_iam_1.Role.fromRoleArn(stack, `${this.options.subdomain}-DelegationRole`, delegationRoleArn);
        // create the record
        new r53.CrossAccountZoneDelegationRecord(stack, `${this.options.subdomain}-delegate`, {
            delegatedZone: subZone,
            parentHostedZoneName: this.options.parentDomain, // or you can use parentHostedZoneId
            delegationRole
        });
        return subZone;
    }
}
exports.DelegatingHostedZoneProvider = DelegatingHostedZoneProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9zdGVkLXpvbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvcmVzb3VyY2UtcHJvdmlkZXJzL2hvc3RlZC16b25lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlEQUEyQztBQUMzQywrQ0FBK0M7QUFHL0M7O0dBRUc7QUFDSCxNQUFhLHdCQUF3QjtJQUVqQzs7O09BR0c7SUFDSCxZQUFvQixjQUFzQixFQUFVLEVBQVc7UUFBM0MsbUJBQWMsR0FBZCxjQUFjLENBQVE7UUFBVSxPQUFFLEdBQUYsRUFBRSxDQUFTO0lBQUksQ0FBQztJQUVwRSxPQUFPLENBQUMsT0FBd0I7O1FBQzVCLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFBLElBQUksQ0FBQyxFQUFFLG1DQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsU0FBUyxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3JJLENBQUM7Q0FDSjtBQVhELDREQVdDO0FBQ0Q7OztHQUdHO0FBQ0gsTUFBYSx3QkFBd0I7SUFFakMsWUFBb0IsWUFBb0IsRUFBVSxFQUFXO1FBQXpDLGlCQUFZLEdBQVosWUFBWSxDQUFRO1FBQVUsT0FBRSxHQUFGLEVBQUUsQ0FBUztJQUFJLENBQUM7SUFFbEUsT0FBTyxDQUFDLE9BQXdCOztRQUM1QixPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFBLElBQUksQ0FBQyxFQUFFLG1DQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksU0FBUyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN2SCxDQUFDO0NBRUo7QUFSRCw0REFRQztBQStCRDs7Ozs7R0FLRztBQUNILE1BQWEsNEJBQTRCO0lBQ3JDLFlBQW9CLE9BQTBDO1FBQTFDLFlBQU8sR0FBUCxPQUFPLENBQW1DO0lBQUksQ0FBQztJQUVuRSxPQUFPLENBQUMsT0FBd0I7UUFDNUIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUU1QixNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsVUFBVSxFQUFFO1lBQ2pGLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVM7U0FDbkMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDakMsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxRQUFRLEVBQUU7Z0JBQzFELElBQUksRUFBRSxPQUFPO2dCQUNiLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO2dCQUN2QyxVQUFVLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTthQUM1QyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRUQsR0FBRztRQUNILDBEQUEwRDtRQUMxRCw0REFBNEQ7UUFDNUQsaURBQWlEO1FBQ2pELEVBQUU7UUFDRixNQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDdEMsTUFBTSxFQUFFLEVBQUUsRUFBRSxrQ0FBa0M7WUFDOUMsT0FBTyxFQUFFLEtBQUs7WUFDZCxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0I7WUFDeEMsUUFBUSxFQUFFLE1BQU07WUFDaEIsWUFBWSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCO1NBQ2hELENBQUMsQ0FBQztRQUVILE1BQU0sY0FBYyxHQUFHLGNBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFOUcsb0JBQW9CO1FBQ3BCLElBQUksR0FBRyxDQUFDLGdDQUFnQyxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxXQUFXLEVBQUU7WUFDbEYsYUFBYSxFQUFFLE9BQU87WUFDdEIsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsb0NBQW9DO1lBQ3JGLGNBQWM7U0FDakIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztDQUNKO0FBMUNELG9FQTBDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJvbGUgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0ICogYXMgcjUzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yb3V0ZTUzJztcbmltcG9ydCB7IFJlc291cmNlQ29udGV4dCwgUmVzb3VyY2VQcm92aWRlciB9IGZyb20gXCIuLi9zcGlcIjtcblxuLyoqXG4gKiBTaW1wbGUgbG9va3VwIGhvc3Qgem9uZSBwcm92aWRlclxuICovXG5leHBvcnQgY2xhc3MgTG9va3VwSG9zdGVkWm9uZVByb3ZpZGVyIGltcGxlbWVudHMgUmVzb3VyY2VQcm92aWRlcjxyNTMuSUhvc3RlZFpvbmU+IHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBob3N0ZWRab25lTmFtZSBuYW1lIG9mIHRoZSBob3N0IHpvbmUgdG8gbG9va3VwXG4gICAgICogQHBhcmFtIGlkICBvcHRpb25hbCBpZCBmb3IgdGhlIHN0cnVjdHVyZSAoZm9yIHRyYWNraW5nKS4gc2V0IHRvIGhvc3R6b25lbmFtZSBieSBkZWZhdWx0XG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBob3N0ZWRab25lTmFtZTogc3RyaW5nLCBwcml2YXRlIGlkPzogc3RyaW5nKSB7IH1cblxuICAgIHByb3ZpZGUoY29udGV4dDogUmVzb3VyY2VDb250ZXh0KTogcjUzLklIb3N0ZWRab25lIHtcbiAgICAgICAgcmV0dXJuIHI1My5Ib3N0ZWRab25lLmZyb21Mb29rdXAoY29udGV4dC5zY29wZSwgdGhpcy5pZCA/PyBgJHt0aGlzLmhvc3RlZFpvbmVOYW1lfS1Mb29rdXBgLCB7IGRvbWFpbk5hbWU6IHRoaXMuaG9zdGVkWm9uZU5hbWUgfSk7XG4gICAgfVxufVxuLyoqXG4gKiBEaXJlY3QgaW1wb3J0IGhvc3RlZCB6b25lIHByb3ZpZGVyLCBiYXNlZCBvbiBhIGtub3duIGhvc3RlZCB6b25lIElELiBcbiAqIFJlY29tbWVuZGVkIG1ldGhvZCBpZiBob3N0ZWQgem9uZSBpZCBpcyBrbm93biwgYXMgaXQgYXZvaWRzIGV4dHJhIGxvb2stdXBzLlxuICovXG5leHBvcnQgY2xhc3MgSW1wb3J0SG9zdGVkWm9uZVByb3ZpZGVyIGltcGxlbWVudHMgUmVzb3VyY2VQcm92aWRlcjxyNTMuSUhvc3RlZFpvbmU+IHtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaG9zdGVkWm9uZUlkOiBzdHJpbmcsIHByaXZhdGUgaWQ/OiBzdHJpbmcpIHsgfVxuXG4gICAgcHJvdmlkZShjb250ZXh0OiBSZXNvdXJjZUNvbnRleHQpOiByNTMuSUhvc3RlZFpvbmUge1xuICAgICAgICByZXR1cm4gcjUzLkhvc3RlZFpvbmUuZnJvbUhvc3RlZFpvbmVJZChjb250ZXh0LnNjb3BlLCB0aGlzLmlkID8/IGAke3RoaXMuaG9zdGVkWm9uZUlkfS1JbXBvcnRgLCB0aGlzLmhvc3RlZFpvbmVJZCk7XG4gICAgfVxuXG59XG5cblxuZXhwb3J0IGludGVyZmFjZSBEZWxlZ2F0aW5nSG9zdGVkWm9uZVByb3ZpZGVyUHJvcHMge1xuXG4gICAgLyoqXG4gICAgICogUGFyZW50IGRvbWFpbiBuYW1lLlxuICAgICAqL1xuICAgIHBhcmVudERvbWFpbjogc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIE5hbWUgZm9yIHRoZSBjaGlsZCB6b25lIChleHBlY3RlZCB0byBiZSBhIHN1YmRvbWFpbiBvZiB0aGUgcGFyZW50IGhvc3RlZCB6b25lKS5cbiAgICAgKi9cbiAgICBzdWJkb21haW46IHN0cmluZyxcblxuICAgIC8qKlxuICAgICAqIEFjY291bnQgSWQgZm9yIHRoZSBwYXJlbnQgaG9zdGVkIHpvbmUuXG4gICAgICovXG4gICAgcGFyZW50RG5zQWNjb3VudElkOiBzdHJpbmcsXG5cbiAgICAvKipcbiAgICAgKiBSb2xlIG5hbWUgaW4gdGhlIHBhcmVudCBhY2NvdW50IGZvciBkZWxlZ2F0aW9uLiBNdXN0IGhhdmUgdHJ1c3QgcmVsYXRpb25zaGlwIHNldCB1cCB3aXRoIHRoZSB3b3JrbG9hZCBhY2NvdW50IHdoZXJlXG4gICAgICogdGhlIEVLUyBDbHVzdGVyIEJsdWVwcmludCBpcyBwcm92aXNpb25lZCAoYWNjb3VudCBsZXZlbCB0cnVzdCkuXG4gICAgICovXG4gICAgZGVsZWdhdGluZ1JvbGVOYW1lOiBzdHJpbmcsXG5cbiAgICAvKipcbiAgICAgKiBXaGVyZSBhIHdpbGQtY2FyZCBlbnRyeSBzaG91bGQgYmUgY3JlYXRlZCBmb3IgdGhlIHN1YmRvbWFpbi4gSW4gdGhpcyBjYXNlIGEgd2lsZGNhcmQgQ05BTUUgcmVjb3JkIGlzIGNyZWF0ZWQgYWxvbmcgd2l0aCB0aGUgc3ViZG9tYWluLlxuICAgICAqL1xuICAgIHdpbGRjYXJkU3ViZG9tYWluPzogYm9vbGVhblxufVxuXG4vKipcbiAqIERlbGVnYXRpbmcgcHJvdmlkZXIgaXMgYSBjb252ZW5pZW5jZSBhcHByb2FjaCB0byBoYXZlIGEgZ2xvYmFsIGhvc3RlZCB6b25lIHJlY29yZCBpbiBhIGNlbnRyYWxpemVkIFxuICogYWNjb3VudCBhbmQgc3ViZG9tYWluIHJlY29yZHMgaW4gcmVzcGVjdGl2ZSB3b3JrbG9hZCBhY2NvdW50cy4gXG4gKiBcbiAqIFRoZSBkZWxlZ2F0aW9uIHBhcnQgYWxsb3dzIHJvdXRpbmcgc3ViZG9tYWluIGVudHJpZXMgdG8gdGhlIGNoaWxkIGhvc3RlZCB6b25lIGluIHRoZSB3b3JrbG9hZCBhY2NvdW50LlxuICovXG5leHBvcnQgY2xhc3MgRGVsZWdhdGluZ0hvc3RlZFpvbmVQcm92aWRlciBpbXBsZW1lbnRzIFJlc291cmNlUHJvdmlkZXI8cjUzLklIb3N0ZWRab25lPiB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBvcHRpb25zOiBEZWxlZ2F0aW5nSG9zdGVkWm9uZVByb3ZpZGVyUHJvcHMpIHsgfVxuXG4gICAgcHJvdmlkZShjb250ZXh0OiBSZXNvdXJjZUNvbnRleHQpOiByNTMuSUhvc3RlZFpvbmUge1xuICAgICAgICBjb25zdCBzdGFjayA9IGNvbnRleHQuc2NvcGU7XG5cbiAgICAgICAgY29uc3Qgc3ViWm9uZSA9IG5ldyByNTMuUHVibGljSG9zdGVkWm9uZShzdGFjaywgYCR7dGhpcy5vcHRpb25zLnN1YmRvbWFpbn0tU3ViWm9uZWAsIHtcbiAgICAgICAgICAgIHpvbmVOYW1lOiB0aGlzLm9wdGlvbnMuc3ViZG9tYWluXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMud2lsZGNhcmRTdWJkb21haW4pIHtcbiAgICAgICAgICAgIG5ldyByNTMuQ25hbWVSZWNvcmQoc3RhY2ssIGAke3RoaXMub3B0aW9ucy5zdWJkb21haW59LWNuYW1lYCwge1xuICAgICAgICAgICAgICAgIHpvbmU6IHN1YlpvbmUsXG4gICAgICAgICAgICAgICAgZG9tYWluTmFtZTogYCR7dGhpcy5vcHRpb25zLnN1YmRvbWFpbn1gLFxuICAgICAgICAgICAgICAgIHJlY29yZE5hbWU6IGAqLiR7dGhpcy5vcHRpb25zLnN1YmRvbWFpbn1gXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFxuICAgICAgICAvLyBpbXBvcnQgdGhlIGRlbGVnYXRpb24gcm9sZSBieSBjb25zdHJ1Y3RpbmcgdGhlIHJvbGVBcm4uXG4gICAgICAgIC8vIEFzc3VtaW5nIHRoZSBwYXJlbnQgYWNjb3VudCBoYXMgdGhlIGRlbGVnYXRpbmcgcm9sZSB3aXRoIFxuICAgICAgICAvLyB0cnVzdCByZWxhdGlvbnNoaXAgc2V0dXAgdG8gdGhlIGNoaWxkIGFjY291bnQuXG4gICAgICAgIC8vXG4gICAgICAgIGNvbnN0IGRlbGVnYXRpb25Sb2xlQXJuID0gc3RhY2suZm9ybWF0QXJuKHtcbiAgICAgICAgICAgIHJlZ2lvbjogJycsIC8vIElBTSBpcyBnbG9iYWwgaW4gZWFjaCBwYXJ0aXRpb25cbiAgICAgICAgICAgIHNlcnZpY2U6ICdpYW0nLFxuICAgICAgICAgICAgYWNjb3VudDogdGhpcy5vcHRpb25zLnBhcmVudERuc0FjY291bnRJZCxcbiAgICAgICAgICAgIHJlc291cmNlOiAncm9sZScsXG4gICAgICAgICAgICByZXNvdXJjZU5hbWU6IHRoaXMub3B0aW9ucy5kZWxlZ2F0aW5nUm9sZU5hbWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZGVsZWdhdGlvblJvbGUgPSBSb2xlLmZyb21Sb2xlQXJuKHN0YWNrLCBgJHt0aGlzLm9wdGlvbnMuc3ViZG9tYWlufS1EZWxlZ2F0aW9uUm9sZWAsIGRlbGVnYXRpb25Sb2xlQXJuKTtcblxuICAgICAgICAvLyBjcmVhdGUgdGhlIHJlY29yZFxuICAgICAgICBuZXcgcjUzLkNyb3NzQWNjb3VudFpvbmVEZWxlZ2F0aW9uUmVjb3JkKHN0YWNrLCBgJHt0aGlzLm9wdGlvbnMuc3ViZG9tYWlufS1kZWxlZ2F0ZWAsIHtcbiAgICAgICAgICAgIGRlbGVnYXRlZFpvbmU6IHN1YlpvbmUsXG4gICAgICAgICAgICBwYXJlbnRIb3N0ZWRab25lTmFtZTogdGhpcy5vcHRpb25zLnBhcmVudERvbWFpbiwgLy8gb3IgeW91IGNhbiB1c2UgcGFyZW50SG9zdGVkWm9uZUlkXG4gICAgICAgICAgICBkZWxlZ2F0aW9uUm9sZVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc3ViWm9uZTtcbiAgICB9XG59XG4iXX0=