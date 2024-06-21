"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEbsDriverPolicyDocument = void 0;
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
function getEbsDriverPolicyDocument(partition, kmsKeys) {
    const result = {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Action: [
                    "ec2:CreateSnapshot",
                    "ec2:AttachVolume",
                    "ec2:DetachVolume",
                    "ec2:ModifyVolume",
                    "ec2:DescribeAvailabilityZones",
                    "ec2:DescribeInstances",
                    "ec2:DescribeSnapshots",
                    "ec2:DescribeTags",
                    "ec2:DescribeVolumes",
                    "ec2:DescribeVolumesModifications",
                ],
                Resource: "*",
            },
            {
                Effect: "Allow",
                Action: ["ec2:CreateTags"],
                Resource: [
                    `arn:${partition}:ec2:*:*:volume/*`,
                    `arn:${partition}:ec2:*:*:snapshot/*`,
                ],
                Condition: {
                    StringEquals: {
                        "ec2:CreateAction": ["CreateVolume", "CreateSnapshot"],
                    },
                },
            },
            {
                Effect: "Allow",
                Action: ["ec2:DeleteTags"],
                Resource: [
                    `arn:${partition}:ec2:*:*:volume/*`,
                    `arn:${partition}:ec2:*:*:snapshot/*`,
                ],
            },
            {
                Effect: "Allow",
                Action: ["ec2:CreateVolume"],
                Resource: "*",
                Condition: {
                    StringLike: {
                        "aws:RequestTag/ebs.csi.aws.com/cluster": "true",
                    },
                },
            },
            {
                Effect: "Allow",
                Action: ["ec2:CreateVolume"],
                Resource: "*",
                Condition: {
                    StringLike: {
                        "aws:RequestTag/CSIVolumeName": "*",
                    },
                },
            },
            {
                Effect: "Allow",
                Action: ["ec2:CreateVolume"],
                Resource: "*",
                Condition: {
                    StringLike: {
                        "aws:RequestTag/kubernetes.io/cluster/*": "owned",
                    },
                },
            },
            {
                Effect: "Allow",
                Action: ["ec2:DeleteVolume"],
                Resource: "*",
                Condition: {
                    StringLike: {
                        "ec2:ResourceTag/ebs.csi.aws.com/cluster": "true",
                    },
                },
            },
            {
                Effect: "Allow",
                Action: ["ec2:DeleteVolume"],
                Resource: "*",
                Condition: {
                    StringLike: {
                        "ec2:ResourceTag/CSIVolumeName": "*",
                    },
                },
            },
            {
                Effect: "Allow",
                Action: ["ec2:DeleteVolume"],
                Resource: "*",
                Condition: {
                    StringLike: {
                        "ec2:ResourceTag/kubernetes.io/cluster/*": "owned",
                    },
                },
            },
            {
                Effect: "Allow",
                Action: ["ec2:DeleteSnapshot"],
                Resource: "*",
                Condition: {
                    StringLike: {
                        "ec2:ResourceTag/CSIVolumeSnapshotName": "*",
                    },
                },
            },
            {
                Effect: "Allow",
                Action: ["ec2:DeleteSnapshot"],
                Resource: "*",
                Condition: {
                    StringLike: {
                        "ec2:ResourceTag/ebs.csi.aws.com/cluster": "true",
                    },
                },
            },
        ],
    };
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
        result.Statement.push(...kmsPolicy);
    }
    return aws_iam_1.PolicyDocument.fromJson(result);
}
exports.getEbsDriverPolicyDocument = getEbsDriverPolicyDocument;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLXBvbGljeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9hZGRvbnMvZWJzLWNzaS1kcml2ZXIvaWFtLXBvbGljeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBcUQ7QUFjckQsU0FBZ0IsMEJBQTBCLENBQ3hDLFNBQWlCLEVBQ2pCLE9BQW1CO0lBRW5CLE1BQU0sTUFBTSxHQUFnRDtRQUMxRCxPQUFPLEVBQUUsWUFBWTtRQUNyQixTQUFTLEVBQUU7WUFDVDtnQkFDRSxNQUFNLEVBQUUsT0FBTztnQkFDZixNQUFNLEVBQUU7b0JBQ04sb0JBQW9CO29CQUNwQixrQkFBa0I7b0JBQ2xCLGtCQUFrQjtvQkFDbEIsa0JBQWtCO29CQUNsQiwrQkFBK0I7b0JBQy9CLHVCQUF1QjtvQkFDdkIsdUJBQXVCO29CQUN2QixrQkFBa0I7b0JBQ2xCLHFCQUFxQjtvQkFDckIsa0NBQWtDO2lCQUNuQztnQkFDRCxRQUFRLEVBQUUsR0FBRzthQUNkO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsTUFBTSxFQUFFLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzFCLFFBQVEsRUFBRTtvQkFDUixPQUFPLFNBQVMsbUJBQW1CO29CQUNuQyxPQUFPLFNBQVMscUJBQXFCO2lCQUN0QztnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsWUFBWSxFQUFFO3dCQUNaLGtCQUFrQixFQUFFLENBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDO3FCQUN2RDtpQkFDRjthQUNGO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsTUFBTSxFQUFFLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzFCLFFBQVEsRUFBRTtvQkFDUixPQUFPLFNBQVMsbUJBQW1CO29CQUNuQyxPQUFPLFNBQVMscUJBQXFCO2lCQUN0QzthQUNGO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsTUFBTSxFQUFFLENBQUMsa0JBQWtCLENBQUM7Z0JBQzVCLFFBQVEs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cG9ydCB7IFBvbGljeURvY3VtZW50IH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcclxuaW1wb3J0ICogYXMga21zIGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mta21zXCI7XHJcblxyXG5pbnRlcmZhY2UgU3RhdGVtZW50IHtcclxuICBFZmZlY3Q6IHN0cmluZztcclxuICBBY3Rpb246IHN0cmluZ1tdO1xyXG4gIFJlc291cmNlOiBzdHJpbmcgfCBzdHJpbmdbXTtcclxuICBDb25kaXRpb24/OiB7XHJcbiAgICBTdHJpbmdFcXVhbHM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZ1tdIH07XHJcbiAgICBTdHJpbmdMaWtlPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcclxuICAgIEJvb2w/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRFYnNEcml2ZXJQb2xpY3lEb2N1bWVudChcclxuICBwYXJ0aXRpb246IHN0cmluZyxcclxuICBrbXNLZXlzPzoga21zLktleVtdXHJcbik6IFBvbGljeURvY3VtZW50IHtcclxuICBjb25zdCByZXN1bHQ6IHsgVmVyc2lvbjogc3RyaW5nOyBTdGF0ZW1lbnQ6IFN0YXRlbWVudFtdIH0gPSB7XHJcbiAgICBWZXJzaW9uOiBcIjIwMTItMTAtMTdcIixcclxuICAgIFN0YXRlbWVudDogW1xyXG4gICAgICB7XHJcbiAgICAgICAgRWZmZWN0OiBcIkFsbG93XCIsXHJcbiAgICAgICAgQWN0aW9uOiBbXHJcbiAgICAgICAgICBcImVjMjpDcmVhdGVTbmFwc2hvdFwiLFxyXG4gICAgICAgICAgXCJlYzI6QXR0YWNoVm9sdW1lXCIsXHJcbiAgICAgICAgICBcImVjMjpEZXRhY2hWb2x1bWVcIixcclxuICAgICAgICAgIFwiZWMyOk1vZGlmeVZvbHVtZVwiLFxyXG4gICAgICAgICAgXCJlYzI6RGVzY3JpYmVBdmFpbGFiaWxpdHlab25lc1wiLFxyXG4gICAgICAgICAgXCJlYzI6RGVzY3JpYmVJbnN0YW5jZXNcIixcclxuICAgICAgICAgIFwiZWMyOkRlc2NyaWJlU25hcHNob3RzXCIsXHJcbiAgICAgICAgICBcImVjMjpEZXNjcmliZVRhZ3NcIixcclxuICAgICAgICAgIFwiZWMyOkRlc2NyaWJlVm9sdW1lc1wiLFxyXG4gICAgICAgICAgXCJlYzI6RGVzY3JpYmVWb2x1bWVzTW9kaWZpY2F0aW9uc1wiLFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgUmVzb3VyY2U6IFwiKlwiLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgRWZmZWN0OiBcIkFsbG93XCIsXHJcbiAgICAgICAgQWN0aW9uOiBbXCJlYzI6Q3JlYXRlVGFnc1wiXSxcclxuICAgICAgICBSZXNvdXJjZTogW1xyXG4gICAgICAgICAgYGFybjoke3BhcnRpdGlvbn06ZWMyOio6Kjp2b2x1bWUvKmAsXHJcbiAgICAgICAgICBgYXJuOiR7cGFydGl0aW9ufTplYzI6KjoqOnNuYXBzaG90LypgLFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgQ29uZGl0aW9uOiB7XHJcbiAgICAgICAgICBTdHJpbmdFcXVhbHM6IHtcclxuICAgICAgICAgICAgXCJlYzI6Q3JlYXRlQWN0aW9uXCI6IFtcIkNyZWF0ZVZvbHVtZVwiLCBcIkNyZWF0ZVNuYXBzaG90XCJdLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgRWZmZWN0OiBcIkFsbG93XCIsXHJcbiAgICAgICAgQWN0aW9uOiBbXCJlYzI6RGVsZXRlVGFnc1wiXSxcclxuICAgICAgICBSZXNvdXJjZTogW1xyXG4gICAgICAgICAgYGFybjoke3BhcnRpdGlvbn06ZWMyOio6Kjp2b2x1bWUvKmAsXHJcbiAgICAgICAgICBgYXJuOiR7cGFydGl0aW9ufTplYzI6KjoqOnNuYXBzaG90LypgLFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIixcclxuICAgICAgICBBY3Rpb246IFtcImVjMjpDcmVhdGVWb2x1bWVcIl0sXHJcbiAgICAgICAgUmVzb3VyY2U6IFwiKlwiLFxyXG4gICAgICAgIENvbmRpdGlvbjoge1xyXG4gICAgICAgICAgU3RyaW5nTGlrZToge1xyXG4gICAgICAgICAgICBcImF3czpSZXF1ZXN0VGFnL2Vicy5jc2kuYXdzLmNvbS9jbHVzdGVyXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgRWZmZWN0OiBcIkFsbG93XCIsXHJcbiAgICAgICAgQWN0aW9uOiBbXCJlYzI6Q3JlYXRlVm9sdW1lXCJdLFxyXG4gICAgICAgIFJlc291cmNlOiBcIipcIixcclxuICAgICAgICBDb25kaXRpb246IHtcclxuICAgICAgICAgIFN0cmluZ0xpa2U6IHtcclxuICAgICAgICAgICAgXCJhd3M6UmVxdWVzdFRhZy9DU0lWb2x1bWVOYW1lXCI6IFwiKlwiLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgRWZmZWN0OiBcIkFsbG93XCIsXHJcbiAgICAgICAgQWN0aW9uOiBbXCJlYzI6Q3JlYXRlVm9sdW1lXCJdLFxyXG4gICAgICAgIFJlc291cmNlOiBcIipcIixcclxuICAgICAgICBDb25kaXRpb246IHtcclxuICAgICAgICAgIFN0cmluZ0xpa2U6IHtcclxuICAgICAgICAgICAgXCJhd3M6UmVxdWVzdFRhZy9rdWJlcm5ldGVzLmlvL2NsdXN0ZXIvKlwiOiBcIm93bmVkXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIixcclxuICAgICAgICBBY3Rpb246IFtcImVjMjpEZWxldGVWb2x1bWVcIl0sXHJcbiAgICAgICAgUmVzb3VyY2U6IFwiKlwiLFxyXG4gICAgICAgIENvbmRpdGlvbjoge1xyXG4gICAgICAgICAgU3RyaW5nTGlrZToge1xyXG4gICAgICAgICAgICBcImVjMjpSZXNvdXJjZVRhZy9lYnMuY3NpLmF3cy5jb20vY2x1c3RlclwiOiBcInRydWVcIixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIEVmZmVjdDogXCJBbGxvd1wiLFxyXG4gICAgICAgIEFjdGlvbjogW1wiZWMyOkRlbGV0ZVZvbHVtZVwiXSxcclxuICAgICAgICBSZXNvdXJjZTogXCIqXCIsXHJcbiAgICAgICAgQ29uZGl0aW9uOiB7XHJcbiAgICAgICAgICBTdHJpbmdMaWtlOiB7XHJcbiAgICAgICAgICAgIFwiZWMyOlJlc291cmNlVGFnL0NTSVZvbHVtZU5hbWVcIjogXCIqXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIixcclxuICAgICAgICBBY3Rpb246IFtcImVjMjpEZWxldGVWb2x1bWVcIl0sXHJcbiAgICAgICAgUmVzb3VyY2U6IFwiKlwiLFxyXG4gICAgICAgIENvbmRpdGlvbjoge1xyXG4gICAgICAgICAgU3RyaW5nTGlrZToge1xyXG4gICAgICAgICAgICBcImVjMjpSZXNvdXJjZVRhZy9rdWJlcm5ldGVzLmlvL2NsdXN0ZXIvKlwiOiBcIm93bmVkXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIixcclxuICAgICAgICBBY3Rpb246IFtcImVjMjpEZWxldGVTbmFwc2hvdFwiXSxcclxuICAgICAgICBSZXNvdXJjZTogXCIqXCIsXHJcbiAgICAgICAgQ29uZGl0aW9uOiB7XHJcbiAgICAgICAgICBTdHJpbmdMaWtlOiB7XHJcbiAgICAgICAgICAgIFwiZWMyOlJlc291cmNlVGFnL0NTSVZvbHVtZVNuYXBzaG90TmFtZVwiOiBcIipcIixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIEVmZmVjdDogXCJBbGxvd1wiLFxyXG4gICAgICAgIEFjdGlvbjogW1wiZWMyOkRlbGV0ZVNuYXBzaG90XCJdLFxyXG4gICAgICAgIFJlc291cmNlOiBcIipcIixcclxuICAgICAgICBDb25kaXRpb246IHtcclxuICAgICAgICAgIFN0cmluZ0xpa2U6IHtcclxuICAgICAgICAgICAgXCJlYzI6UmVzb3VyY2VUYWcvZWJzLmNzaS5hd3MuY29tL2NsdXN0ZXJcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH07XHJcbiAgaWYgKGttc0tleXMpIHtcclxuICAgIGNvbnN0IGttc0tleXNBcm5zID0ga21zS2V5cy5tYXAoKGspID0+IGsua2V5QXJuKTtcclxuICAgIGNvbnN0IGttc1BvbGljeTogU3RhdGVtZW50W10gPSBbXHJcbiAgICAgIHtcclxuICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIixcclxuICAgICAgICBBY3Rpb246IFtcImttczpDcmVhdGVHcmFudFwiLCBcImttczpMaXN0R3JhbnRzXCIsIFwia21zOlJldm9rZUdyYW50XCJdLFxyXG4gICAgICAgIFJlc291cmNlOiBrbXNLZXlzQXJucyxcclxuICAgICAgICBDb25kaXRpb246IHtcclxuICAgICAgICAgIEJvb2w6IHtcclxuICAgICAgICAgICAgXCJrbXM6R3JhbnRJc0ZvckFXU1Jlc291cmNlXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgRWZmZWN0OiBcIkFsbG93XCIsXHJcbiAgICAgICAgQWN0aW9uOiBbXHJcbiAgICAgICAgICBcImttczpFbmNyeXB0XCIsXHJcbiAgICAgICAgICBcImttczpEZWNyeXB0XCIsXHJcbiAgICAgICAgICBcImttczpSZUVuY3J5cHQqXCIsXHJcbiAgICAgICAgICBcImttczpHZW5lcmF0ZURhdGFLZXkqXCIsXHJcbiAgICAgICAgICBcImttczpEZXNjcmliZUtleVwiLFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgUmVzb3VyY2U6IGttc0tleXNBcm5zLFxyXG4gICAgICB9LFxyXG4gICAgXTtcclxuICAgIHJlc3VsdC5TdGF0ZW1lbnQucHVzaCguLi5rbXNQb2xpY3kpO1xyXG4gIH1cclxuICByZXR1cm4gUG9saWN5RG9jdW1lbnQuZnJvbUpzb24ocmVzdWx0KTtcclxufVxyXG4iXX0=