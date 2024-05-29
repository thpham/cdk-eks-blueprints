"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudWatchLogsPolicyDocument = void 0;
function getCloudWatchLogsPolicyDocument() {
    const result = [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:DescribeVolumes",
                "ec2:DescribeTags",
                "logs:PutLogEvents",
                "logs:DescribeLogStreams",
                "logs:DescribeLogGroups",
                "logs:CreateLogStream",
                "logs:CreateLogGroup",
                "logs:PutRetentionPolicy",
                "logs:DeleteRetentionPolicy"
            ],
            "Resource": "*"
        }
    ];
    return result;
}
exports.getCloudWatchLogsPolicyDocument = getCloudWatchLogsPolicyDocument;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLXBvbGljeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9hZGRvbnMvY2xvdWR3YXRjaC1sb2dzL2lhbS1wb2xpY3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBTUEsU0FBZ0IsK0JBQStCO0lBQzNDLE1BQU0sTUFBTSxHQUFnQjtRQUN4QjtZQUNJLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLFFBQVEsRUFBRTtnQkFDTixxQkFBcUI7Z0JBQ3JCLGtCQUFrQjtnQkFDbEIsbUJBQW1CO2dCQUNuQix5QkFBeUI7Z0JBQ3pCLHdCQUF3QjtnQkFDeEIsc0JBQXNCO2dCQUN0QixxQkFBcUI7Z0JBQ3JCLHlCQUF5QjtnQkFDekIsNEJBQTRCO2FBQy9CO1lBQ0QsVUFBVSxFQUFFLEdBQUc7U0FDbEI7S0FDSixDQUFDO0lBQ0YsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQW5CRCwwRUFtQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbnRlcmZhY2UgU3RhdGVtZW50IHtcbiAgICBFZmZlY3Q6IHN0cmluZztcbiAgICBBY3Rpb246IHN0cmluZyB8IHN0cmluZ1tdO1xuICAgIFJlc291cmNlOiBzdHJpbmcgfCBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENsb3VkV2F0Y2hMb2dzUG9saWN5RG9jdW1lbnQoKSA6IFN0YXRlbWVudFtdIHtcbiAgICBjb25zdCByZXN1bHQ6IFN0YXRlbWVudFtdID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICBcIkFjdGlvblwiOiBbXG4gICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVWb2x1bWVzXCIsXG4gICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVUYWdzXCIsXG4gICAgICAgICAgICAgICAgXCJsb2dzOlB1dExvZ0V2ZW50c1wiLFxuICAgICAgICAgICAgICAgIFwibG9nczpEZXNjcmliZUxvZ1N0cmVhbXNcIixcbiAgICAgICAgICAgICAgICBcImxvZ3M6RGVzY3JpYmVMb2dHcm91cHNcIixcbiAgICAgICAgICAgICAgICBcImxvZ3M6Q3JlYXRlTG9nU3RyZWFtXCIsXG4gICAgICAgICAgICAgICAgXCJsb2dzOkNyZWF0ZUxvZ0dyb3VwXCIsXG4gICAgICAgICAgICAgICAgXCJsb2dzOlB1dFJldGVudGlvblBvbGljeVwiLFxuICAgICAgICAgICAgICAgIFwibG9nczpEZWxldGVSZXRlbnRpb25Qb2xpY3lcIlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCJcbiAgICAgICAgfVxuICAgIF07XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==