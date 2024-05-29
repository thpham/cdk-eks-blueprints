"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEfsDriverPolicyStatements = void 0;
function getEfsDriverPolicyStatements(kmsKeys) {
    const result = [
        {
            "Effect": "Allow",
            "Action": [
                "elasticfilesystem:DescribeAccessPoints",
                "elasticfilesystem:DescribeFileSystems",
                "elasticfilesystem:DescribeMountTargets",
                "ec2:DescribeAvailabilityZones"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "elasticfilesystem:CreateAccessPoint",
                "elasticfilesystem:TagResource",
            ],
            "Resource": "*",
            "Condition": {
                "StringLike": {
                    "aws:RequestTag/efs.csi.aws.com/cluster": "true"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": "elasticfilesystem:DeleteAccessPoint",
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "aws:ResourceTag/efs.csi.aws.com/cluster": "true"
                }
            }
        }
    ];
    if (kmsKeys) {
        const kmsKeysArns = kmsKeys.map((k) => k.keyArn);
        const kmsPolicy = [
            {
                Effect: "Allow",
                Action: ["kms:CreateGrant", "kms:ListGrants", "kms:RevokeGrant"],
                Resource: kmsKeysArns,
                Condition: {
                    Bool: {
                        "kms:GrantIsForAWSResource": "true",
                    },
                },
            },
            {
                Effect: "Allow",
                Action: [
                    "kms:Encrypt",
                    "kms:Decrypt",
                    "kms:ReEncrypt*",
                    "kms:GenerateDataKey*",
                    "kms:DescribeKey",
                ],
                Resource: kmsKeysArns,
            },
        ];
        result.push(...kmsPolicy);
    }
    return result;
}
exports.getEfsDriverPolicyStatements = getEfsDriverPolicyStatements;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLXBvbGljeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9hZGRvbnMvZWZzLWNzaS1kcml2ZXIvaWFtLXBvbGljeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFhQSxTQUFnQiw0QkFBNEIsQ0FDMUMsT0FBbUI7SUFFbkIsTUFBTSxNQUFNLEdBQWdCO1FBQzFCO1lBQ0UsUUFBUSxFQUFFLE9BQU87WUFDakIsUUFBUSxFQUFFO2dCQUNSLHdDQUF3QztnQkFDeEMsdUNBQXVDO2dCQUN2Qyx3Q0FBd0M7Z0JBQ3hDLCtCQUErQjthQUNoQztZQUNELFVBQVUsRUFBRSxHQUFHO1NBQ2hCO1FBQ0Q7WUFDRSxRQUFRLEVBQUUsT0FBTztZQUNqQixRQUFRLEVBQUU7Z0JBQ1IscUNBQXFDO2dCQUNyQywrQkFBK0I7YUFDaEM7WUFDRCxVQUFVLEVBQUUsR0FBRztZQUNmLFdBQVcsRUFBRTtnQkFDWCxZQUFZLEVBQUU7b0JBQ1osd0NBQXdDLEVBQUUsTUFBTTtpQkFDakQ7YUFDRjtTQUNGO1FBQ0Q7WUFDRSxRQUFRLEVBQUUsT0FBTztZQUNqQixRQUFRLEVBQUUscUNBQXFDO1lBQy9DLFVBQVUsRUFBRSxHQUFHO1lBQ2YsV0FBVyxFQUFFO2dCQUNYLGNBQWMsRUFBRTtvQkFDZCx5Q0FBeUMsRUFBRSxNQUFNO2lCQUNsRDthQUNGO1NBQ0Y7S0FDRixDQUFDO0lBQ0YsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNaLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRCxNQUFNLFNBQVMsR0FBZ0I7WUFDN0I7Z0JBQ0UsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsTUFBTSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUM7Z0JBQ2hFLFFBQVEsRUFBRSxXQUFXO2dCQUNyQixTQUFTLEVBQUU7b0JBQ1QsSUFBSSxFQUFFO3dCQUNKLDJCQUEyQixFQUFFLE1BQU07cUJBQ3BDO2lCQUNGO2FBQ0Y7WUFDRDtnQkFDRSxNQUFNLEVBQUUsT0FBTztnQkFDZixNQUFNLEVBQUU7b0JBQ04sYUFBYTtvQkFDYixhQUFhO29CQUNiLGdCQUFnQjtvQkFDaEIsc0JBQXNCO29CQUN0QixpQkFBaUI7aUJBQ2xCO2dCQUNELFFBQVEsRUFBRSxXQUFXO2FBQ3RCO1NBQ0YsQ0FBQztRQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQWxFRCxvRUFrRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBrbXMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1rbXNcIjtcblxuaW50ZXJmYWNlIFN0YXRlbWVudCB7XG4gIEVmZmVjdDogc3RyaW5nO1xuICBBY3Rpb246IHN0cmluZyB8IHN0cmluZ1tdO1xuICBSZXNvdXJjZTogc3RyaW5nIHwgc3RyaW5nW107XG4gIENvbmRpdGlvbj86IHtcbiAgICBTdHJpbmdFcXVhbHM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIHwgc3RyaW5nIH07XG4gICAgU3RyaW5nTGlrZT86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG4gICAgQm9vbD86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFZnNEcml2ZXJQb2xpY3lTdGF0ZW1lbnRzKFxuICBrbXNLZXlzPzoga21zLktleVtdXG4pOiBTdGF0ZW1lbnRbXSB7XG4gIGNvbnN0IHJlc3VsdDogU3RhdGVtZW50W10gPSBbXG4gICAge1xuICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICBcImVsYXN0aWNmaWxlc3lzdGVtOkRlc2NyaWJlQWNjZXNzUG9pbnRzXCIsXG4gICAgICAgIFwiZWxhc3RpY2ZpbGVzeXN0ZW06RGVzY3JpYmVGaWxlU3lzdGVtc1wiLFxuICAgICAgICBcImVsYXN0aWNmaWxlc3lzdGVtOkRlc2NyaWJlTW91bnRUYXJnZXRzXCIsXG4gICAgICAgIFwiZWMyOkRlc2NyaWJlQXZhaWxhYmlsaXR5Wm9uZXNcIlxuICAgICAgXSxcbiAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgXCJlbGFzdGljZmlsZXN5c3RlbTpDcmVhdGVBY2Nlc3NQb2ludFwiLFxuICAgICAgICBcImVsYXN0aWNmaWxlc3lzdGVtOlRhZ1Jlc291cmNlXCIsXG4gICAgICBdLFxuICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIixcbiAgICAgIFwiQ29uZGl0aW9uXCI6IHtcbiAgICAgICAgXCJTdHJpbmdMaWtlXCI6IHtcbiAgICAgICAgICBcImF3czpSZXF1ZXN0VGFnL2Vmcy5jc2kuYXdzLmNvbS9jbHVzdGVyXCI6IFwidHJ1ZVwiXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgIFwiQWN0aW9uXCI6IFwiZWxhc3RpY2ZpbGVzeXN0ZW06RGVsZXRlQWNjZXNzUG9pbnRcIixcbiAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCIsXG4gICAgICBcIkNvbmRpdGlvblwiOiB7XG4gICAgICAgIFwiU3RyaW5nRXF1YWxzXCI6IHtcbiAgICAgICAgICBcImF3czpSZXNvdXJjZVRhZy9lZnMuY3NpLmF3cy5jb20vY2x1c3RlclwiOiBcInRydWVcIlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICBdO1xuICBpZiAoa21zS2V5cykge1xuICAgIGNvbnN0IGttc0tleXNBcm5zID0ga21zS2V5cy5tYXAoKGspID0+IGsua2V5QXJuKTtcbiAgICBjb25zdCBrbXNQb2xpY3k6IFN0YXRlbWVudFtdID0gW1xuICAgICAge1xuICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIixcbiAgICAgICAgQWN0aW9uOiBbXCJrbXM6Q3JlYXRlR3JhbnRcIiwgXCJrbXM6TGlzdEdyYW50c1wiLCBcImttczpSZXZva2VHcmFudFwiXSxcbiAgICAgICAgUmVzb3VyY2U6IGttc0tleXNBcm5zLFxuICAgICAgICBDb25kaXRpb246IHtcbiAgICAgICAgICBCb29sOiB7XG4gICAgICAgICAgICBcImttczpHcmFudElzRm9yQVdTUmVzb3VyY2VcIjogXCJ0cnVlXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIEVmZmVjdDogXCJBbGxvd1wiLFxuICAgICAgICBBY3Rpb246IFtcbiAgICAgICAgICBcImttczpFbmNyeXB0XCIsXG4gICAgICAgICAgXCJrbXM6RGVjcnlwdFwiLFxuICAgICAgICAgIFwia21zOlJlRW5jcnlwdCpcIixcbiAgICAgICAgICBcImttczpHZW5lcmF0ZURhdGFLZXkqXCIsXG4gICAgICAgICAgXCJrbXM6RGVzY3JpYmVLZXlcIixcbiAgICAgICAgXSxcbiAgICAgICAgUmVzb3VyY2U6IGttc0tleXNBcm5zLFxuICAgICAgfSxcbiAgICBdO1xuICAgIHJlc3VsdC5wdXNoKC4uLmttc1BvbGljeSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiJdfQ==