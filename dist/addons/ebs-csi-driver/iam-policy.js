"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEbsDriverPolicyDocument = getEbsDriverPolicyDocument;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLXBvbGljeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9hZGRvbnMvZWJzLWNzaS1kcml2ZXIvaWFtLXBvbGljeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWNBLGdFQTBKQztBQXhLRCxpREFBcUQ7QUFjckQsU0FBZ0IsMEJBQTBCLENBQ3hDLFNBQWlCLEVBQ2pCLE9BQW1CO0lBRW5CLE1BQU0sTUFBTSxHQUFnRDtRQUMxRCxPQUFPLEVBQUUsWUFBWTtRQUNyQixTQUFTLEVBQUU7WUFDVDtnQkFDRSxNQUFNLEVBQUUsT0FBTztnQkFDZixNQUFNLEVBQUU7b0JBQ04sb0JBQW9CO29CQUNwQixrQkFBa0I7b0JBQ2xCLGtCQUFrQjtvQkFDbEIsa0JBQWtCO29CQUNsQiwrQkFBK0I7b0JBQy9CLHVCQUF1QjtvQkFDdkIsdUJBQXVCO29CQUN2QixrQkFBa0I7b0JBQ2xCLHFCQUFxQjtvQkFDckIsa0NBQWtDO2lCQUNuQztnQkFDRCxRQUFRLEVBQUUsR0FBRzthQUNkO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsTUFBTSxFQUFFLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzFCLFFBQVEsRUFBRTtvQkFDUixPQUFPLFNBQVMsbUJBQW1CO29CQUNuQyxPQUFPLFNBQVMscUJBQXFCO2lCQUN0QztnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsWUFBWSxFQUFFO3dCQUNaLGtCQUFrQixFQUFFLENBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDO3FCQUN2RDtpQkFDRjthQUNGO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsTUFBTSxFQUFFLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzFCLFFBQVEsRUFBRTtvQkFDUixPQUFPLFNBQVMsbUJBQW1CO29CQUNuQyxPQUFPLFNBQVMscUJBQXFCO2lCQUN0QzthQUNGO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsTUFBTSxFQUFFLENBQUMsa0JBQWtCLENBQUM7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b3J0IHsgUG9saWN5RG9jdW1lbnQgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xyXG5pbXBvcnQgKiBhcyBrbXMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1rbXNcIjtcclxuXHJcbmludGVyZmFjZSBTdGF0ZW1lbnQge1xyXG4gIEVmZmVjdDogc3RyaW5nO1xyXG4gIEFjdGlvbjogc3RyaW5nW107XHJcbiAgUmVzb3VyY2U6IHN0cmluZyB8IHN0cmluZ1tdO1xyXG4gIENvbmRpdGlvbj86IHtcclxuICAgIFN0cmluZ0VxdWFscz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nW10gfTtcclxuICAgIFN0cmluZ0xpa2U/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xyXG4gICAgQm9vbD86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEVic0RyaXZlclBvbGljeURvY3VtZW50KFxyXG4gIHBhcnRpdGlvbjogc3RyaW5nLFxyXG4gIGttc0tleXM/OiBrbXMuS2V5W11cclxuKTogUG9saWN5RG9jdW1lbnQge1xyXG4gIGNvbnN0IHJlc3VsdDogeyBWZXJzaW9uOiBzdHJpbmc7IFN0YXRlbWVudDogU3RhdGVtZW50W10gfSA9IHtcclxuICAgIFZlcnNpb246IFwiMjAxMi0xMC0xN1wiLFxyXG4gICAgU3RhdGVtZW50OiBbXHJcbiAgICAgIHtcclxuICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIixcclxuICAgICAgICBBY3Rpb246IFtcclxuICAgICAgICAgIFwiZWMyOkNyZWF0ZVNuYXBzaG90XCIsXHJcbiAgICAgICAgICBcImVjMjpBdHRhY2hWb2x1bWVcIixcclxuICAgICAgICAgIFwiZWMyOkRldGFjaFZvbHVtZVwiLFxyXG4gICAgICAgICAgXCJlYzI6TW9kaWZ5Vm9sdW1lXCIsXHJcbiAgICAgICAgICBcImVjMjpEZXNjcmliZUF2YWlsYWJpbGl0eVpvbmVzXCIsXHJcbiAgICAgICAgICBcImVjMjpEZXNjcmliZUluc3RhbmNlc1wiLFxyXG4gICAgICAgICAgXCJlYzI6RGVzY3JpYmVTbmFwc2hvdHNcIixcclxuICAgICAgICAgIFwiZWMyOkRlc2NyaWJlVGFnc1wiLFxyXG4gICAgICAgICAgXCJlYzI6RGVzY3JpYmVWb2x1bWVzXCIsXHJcbiAgICAgICAgICBcImVjMjpEZXNjcmliZVZvbHVtZXNNb2RpZmljYXRpb25zXCIsXHJcbiAgICAgICAgXSxcclxuICAgICAgICBSZXNvdXJjZTogXCIqXCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIixcclxuICAgICAgICBBY3Rpb246IFtcImVjMjpDcmVhdGVUYWdzXCJdLFxyXG4gICAgICAgIFJlc291cmNlOiBbXHJcbiAgICAgICAgICBgYXJuOiR7cGFydGl0aW9ufTplYzI6KjoqOnZvbHVtZS8qYCxcclxuICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVjMjoqOio6c25hcHNob3QvKmAsXHJcbiAgICAgICAgXSxcclxuICAgICAgICBDb25kaXRpb246IHtcclxuICAgICAgICAgIFN0cmluZ0VxdWFsczoge1xyXG4gICAgICAgICAgICBcImVjMjpDcmVhdGVBY3Rpb25cIjogW1wiQ3JlYXRlVm9sdW1lXCIsIFwiQ3JlYXRlU25hcHNob3RcIl0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIixcclxuICAgICAgICBBY3Rpb246IFtcImVjMjpEZWxldGVUYWdzXCJdLFxyXG4gICAgICAgIFJlc291cmNlOiBbXHJcbiAgICAgICAgICBgYXJuOiR7cGFydGl0aW9ufTplYzI6KjoqOnZvbHVtZS8qYCxcclxuICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVjMjoqOio6c25hcHNob3QvKmAsXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIEVmZmVjdDogXCJBbGxvd1wiLFxyXG4gICAgICAgIEFjdGlvbjogW1wiZWMyOkNyZWF0ZVZvbHVtZVwiXSxcclxuICAgICAgICBSZXNvdXJjZTogXCIqXCIsXHJcbiAgICAgICAgQ29uZGl0aW9uOiB7XHJcbiAgICAgICAgICBTdHJpbmdMaWtlOiB7XHJcbiAgICAgICAgICAgIFwiYXdzOlJlcXVlc3RUYWcvZWJzLmNzaS5hd3MuY29tL2NsdXN0ZXJcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIixcclxuICAgICAgICBBY3Rpb246IFtcImVjMjpDcmVhdGVWb2x1bWVcIl0sXHJcbiAgICAgICAgUmVzb3VyY2U6IFwiKlwiLFxyXG4gICAgICAgIENvbmRpdGlvbjoge1xyXG4gICAgICAgICAgU3RyaW5nTGlrZToge1xyXG4gICAgICAgICAgICBcImF3czpSZXF1ZXN0VGFnL0NTSVZvbHVtZU5hbWVcIjogXCIqXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIixcclxuICAgICAgICBBY3Rpb246IFtcImVjMjpDcmVhdGVWb2x1bWVcIl0sXHJcbiAgICAgICAgUmVzb3VyY2U6IFwiKlwiLFxyXG4gICAgICAgIENvbmRpdGlvbjoge1xyXG4gICAgICAgICAgU3RyaW5nTGlrZToge1xyXG4gICAgICAgICAgICBcImF3czpSZXF1ZXN0VGFnL2t1YmVybmV0ZXMuaW8vY2x1c3Rlci8qXCI6IFwib3duZWRcIixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIEVmZmVjdDogXCJBbGxvd1wiLFxyXG4gICAgICAgIEFjdGlvbjogW1wiZWMyOkRlbGV0ZVZvbHVtZVwiXSxcclxuICAgICAgICBSZXNvdXJjZTogXCIqXCIsXHJcbiAgICAgICAgQ29uZGl0aW9uOiB7XHJcbiAgICAgICAgICBTdHJpbmdMaWtlOiB7XHJcbiAgICAgICAgICAgIFwiZWMyOlJlc291cmNlVGFnL2Vicy5jc2kuYXdzLmNvbS9jbHVzdGVyXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgRWZmZWN0OiBcIkFsbG93XCIsXHJcbiAgICAgICAgQWN0aW9uOiBbXCJlYzI6RGVsZXRlVm9sdW1lXCJdLFxyXG4gICAgICAgIFJlc291cmNlOiBcIipcIixcclxuICAgICAgICBDb25kaXRpb246IHtcclxuICAgICAgICAgIFN0cmluZ0xpa2U6IHtcclxuICAgICAgICAgICAgXCJlYzI6UmVzb3VyY2VUYWcvQ1NJVm9sdW1lTmFtZVwiOiBcIipcIixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIEVmZmVjdDogXCJBbGxvd1wiLFxyXG4gICAgICAgIEFjdGlvbjogW1wiZWMyOkRlbGV0ZVZvbHVtZVwiXSxcclxuICAgICAgICBSZXNvdXJjZTogXCIqXCIsXHJcbiAgICAgICAgQ29uZGl0aW9uOiB7XHJcbiAgICAgICAgICBTdHJpbmdMaWtlOiB7XHJcbiAgICAgICAgICAgIFwiZWMyOlJlc291cmNlVGFnL2t1YmVybmV0ZXMuaW8vY2x1c3Rlci8qXCI6IFwib3duZWRcIixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIEVmZmVjdDogXCJBbGxvd1wiLFxyXG4gICAgICAgIEFjdGlvbjogW1wiZWMyOkRlbGV0ZVNuYXBzaG90XCJdLFxyXG4gICAgICAgIFJlc291cmNlOiBcIipcIixcclxuICAgICAgICBDb25kaXRpb246IHtcclxuICAgICAgICAgIFN0cmluZ0xpa2U6IHtcclxuICAgICAgICAgICAgXCJlYzI6UmVzb3VyY2VUYWcvQ1NJVm9sdW1lU25hcHNob3ROYW1lXCI6IFwiKlwiLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgRWZmZWN0OiBcIkFsbG93XCIsXHJcbiAgICAgICAgQWN0aW9uOiBbXCJlYzI6RGVsZXRlU25hcHNob3RcIl0sXHJcbiAgICAgICAgUmVzb3VyY2U6IFwiKlwiLFxyXG4gICAgICAgIENvbmRpdGlvbjoge1xyXG4gICAgICAgICAgU3RyaW5nTGlrZToge1xyXG4gICAgICAgICAgICBcImVjMjpSZXNvdXJjZVRhZy9lYnMuY3NpLmF3cy5jb20vY2x1c3RlclwiOiBcInRydWVcIixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgfTtcclxuICBpZiAoa21zS2V5cykge1xyXG4gICAgY29uc3Qga21zS2V5c0FybnMgPSBrbXNLZXlzLm1hcCgoaykgPT4gay5rZXlBcm4pO1xyXG4gICAgY29uc3Qga21zUG9saWN5OiBTdGF0ZW1lbnRbXSA9IFtcclxuICAgICAge1xyXG4gICAgICAgIEVmZmVjdDogXCJBbGxvd1wiLFxyXG4gICAgICAgIEFjdGlvbjogW1wia21zOkNyZWF0ZUdyYW50XCIsIFwia21zOkxpc3RHcmFudHNcIiwgXCJrbXM6UmV2b2tlR3JhbnRcIl0sXHJcbiAgICAgICAgUmVzb3VyY2U6IGttc0tleXNBcm5zLFxyXG4gICAgICAgIENvbmRpdGlvbjoge1xyXG4gICAgICAgICAgQm9vbDoge1xyXG4gICAgICAgICAgICBcImttczpHcmFudElzRm9yQVdTUmVzb3VyY2VcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIixcclxuICAgICAgICBBY3Rpb246IFtcclxuICAgICAgICAgIFwia21zOkVuY3J5cHRcIixcclxuICAgICAgICAgIFwia21zOkRlY3J5cHRcIixcclxuICAgICAgICAgIFwia21zOlJlRW5jcnlwdCpcIixcclxuICAgICAgICAgIFwia21zOkdlbmVyYXRlRGF0YUtleSpcIixcclxuICAgICAgICAgIFwia21zOkRlc2NyaWJlS2V5XCIsXHJcbiAgICAgICAgXSxcclxuICAgICAgICBSZXNvdXJjZToga21zS2V5c0FybnMsXHJcbiAgICAgIH0sXHJcbiAgICBdO1xyXG4gICAgcmVzdWx0LlN0YXRlbWVudC5wdXNoKC4uLmttc1BvbGljeSk7XHJcbiAgfVxyXG4gIHJldHVybiBQb2xpY3lEb2N1bWVudC5mcm9tSnNvbihyZXN1bHQpO1xyXG59XHJcbiJdfQ==