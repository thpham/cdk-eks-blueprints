"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FargateClusterProvider = void 0;
const eks = require("aws-cdk-lib/aws-eks");
const generic_cluster_provider_1 = require("./generic-cluster-provider");
/**
 * FargateClusterProvider provisions an EKS cluster with Fargate capacity only.
 */
class FargateClusterProvider extends generic_cluster_provider_1.GenericClusterProvider {
    constructor(props) {
        super({ ...generic_cluster_provider_1.defaultOptions, ...props, ...{
                fargateProfiles: (props === null || props === void 0 ? void 0 : props.fargateProfiles) instanceof Map ? Object.fromEntries(props === null || props === void 0 ? void 0 : props.fargateProfiles) : props === null || props === void 0 ? void 0 : props.fargateProfiles
            }
        });
    }
    /**
     * @override
     */
    internalCreateCluster(scope, id, clusterOptions) {
        return new eks.FargateCluster(scope, id, clusterOptions);
    }
}
exports.FargateClusterProvider = FargateClusterProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFyZ2F0ZS1jbHVzdGVyLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL2NsdXN0ZXItcHJvdmlkZXJzL2ZhcmdhdGUtY2x1c3Rlci1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSwyQ0FBMkM7QUFDM0MseUVBQW9GO0FBdUNwRjs7R0FFRztBQUNILE1BQWEsc0JBQXVCLFNBQVEsaURBQXNCO0lBRTlELFlBQVksS0FBbUM7UUFDM0MsS0FBSyxDQUFDLEVBQUMsR0FBRyx5Q0FBYyxFQUFFLEdBQUcsS0FBSyxFQUFFLEdBQUc7Z0JBQy9CLGVBQWUsRUFBRSxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxlQUFlLGFBQVksR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLGVBQWU7YUFDL0g7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxxQkFBcUIsQ0FBQyxLQUFnQixFQUFFLEVBQVUsRUFBRSxjQUFtQjtRQUNuRSxPQUFPLElBQUksR0FBRyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzdELENBQUM7Q0FDSjtBQWZELHdEQWVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCAqIGFzIGVjMiBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVjMlwiO1xuaW1wb3J0ICogYXMgZWtzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtZWtzXCI7XG5pbXBvcnQgeyBkZWZhdWx0T3B0aW9ucywgR2VuZXJpY0NsdXN0ZXJQcm92aWRlciB9IGZyb20gJy4vZ2VuZXJpYy1jbHVzdGVyLXByb3ZpZGVyJztcblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIHRoZSBjbHVzdGVyIHByb3ZpZGVyLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZhcmdhdGVDbHVzdGVyUHJvdmlkZXJQcm9wcyBleHRlbmRzIFBhcnRpYWw8ZWtzLkNvbW1vbkNsdXN0ZXJPcHRpb25zPiB7XG5cbiAgICAvKipcbiAgICAqIFRoZSBuYW1lIGZvciB0aGUgY2x1c3Rlci5cbiAgICAqL1xuICAgIG5hbWU/OiBzdHJpbmdcblxuICAgIC8qKlxuICAgICAqIFRoZSBGYXJnYXRlIHByb2ZpbGVzIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2x1c3Rlci5cbiAgICAgKlxuICAgICAqIDxiPk5vdGU8L2I+IFRoZSBgTWFwPD5gIGZvcm0gaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGZyb20gYSBmdXR1cmUgcmVsZWFzZS5cbiAgICAgKi9cbiAgICBmYXJnYXRlUHJvZmlsZXM/OiB7IFtrZXk6IHN0cmluZ106IGVrcy5GYXJnYXRlUHJvZmlsZU9wdGlvbnMgfSB8IE1hcDxzdHJpbmcsIGVrcy5GYXJnYXRlUHJvZmlsZU9wdGlvbnM+LFxuXG4gICAgLyoqXG4gICAgICogU3VibmV0cyBhcmUgcGFzc2VkIHRvIHRoZSBjbHVzdGVyIGNvbmZpZ3VyYXRpb24uXG4gICAgICovXG4gICAgdnBjU3VibmV0cz86IGVjMi5TdWJuZXRTZWxlY3Rpb25bXTtcblxuICAgIC8qKlxuICAgICAqIElzIGl0IGEgcHJpdmF0ZSBvbmx5IEVLUyBDbHVzdGVyP1xuICAgICAqIERlZmF1bHRzIHRvIHByaXZhdGVfYW5kX3B1YmxpYyBjbHVzdGVyLCBzZXQgdG8gdHJ1ZSBmb3IgcHJpdmF0ZSBjbHVzdGVyXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBwcml2YXRlQ2x1c3Rlcj86IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBUYWdzIGZvciB0aGUgY2x1c3RlclxuICAgICAqL1xuICAgIHRhZ3M/OiB7XG4gICAgICAgIFtrZXk6IHN0cmluZ106IHN0cmluZztcbiAgICB9XG59XG5cbi8qKlxuICogRmFyZ2F0ZUNsdXN0ZXJQcm92aWRlciBwcm92aXNpb25zIGFuIEVLUyBjbHVzdGVyIHdpdGggRmFyZ2F0ZSBjYXBhY2l0eSBvbmx5LlxuICovXG5leHBvcnQgY2xhc3MgRmFyZ2F0ZUNsdXN0ZXJQcm92aWRlciBleHRlbmRzIEdlbmVyaWNDbHVzdGVyUHJvdmlkZXIge1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM/OiBGYXJnYXRlQ2x1c3RlclByb3ZpZGVyUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoey4uLmRlZmF1bHRPcHRpb25zLCAuLi5wcm9wcywgLi4ue1xuICAgICAgICAgICAgICAgIGZhcmdhdGVQcm9maWxlczogcHJvcHM/LmZhcmdhdGVQcm9maWxlcyBpbnN0YW5jZW9mIE1hcCA/IE9iamVjdC5mcm9tRW50cmllcyhwcm9wcz8uZmFyZ2F0ZVByb2ZpbGVzKSA6IHByb3BzPy5mYXJnYXRlUHJvZmlsZXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG92ZXJyaWRlXG4gICAgICovXG4gICAgaW50ZXJuYWxDcmVhdGVDbHVzdGVyKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIGNsdXN0ZXJPcHRpb25zOiBhbnkpOiBla3MuQ2x1c3RlciB7XG4gICAgICAgIHJldHVybiBuZXcgZWtzLkZhcmdhdGVDbHVzdGVyKHNjb3BlLCBpZCwgY2x1c3Rlck9wdGlvbnMpO1xuICAgIH0gICAgXG59XG4iXX0=