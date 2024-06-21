"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarpenterControllerPolicyBeta = exports.KarpenterControllerPolicy = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
// IAM Policy for Alpha CRD Karpenter addons
exports.KarpenterControllerPolicy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                // Write Operations
                "ec2:CreateLaunchTemplate",
                "ec2:CreateFleet",
                "ec2:RunInstances",
                "ec2:CreateTags",
                "ec2:TerminateInstances",
                "ec2:DeleteLaunchTemplate",
                // Read Operations
                "ec2:DescribeLaunchTemplates",
                "ec2:DescribeInstances",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeSubnets",
                "ec2:DescribeImages",
                "ec2:DescribeInstanceTypes",
                "ec2:DescribeInstanceTypeOfferings",
                "ec2:DescribeAvailabilityZones",
                "ec2:DescribeSpotPriceHistory",
                "ssm:GetParameter",
                "pricing:GetProducts",
            ],
            "Resource": "*"
        }
    ]
};
// IAM Policy for Beta CRD Karpenter addons
const KarpenterControllerPolicyBeta = (cluster, partition, region) => {
    const condition1 = new aws_cdk_lib_1.CfnJson(cluster.stack, 'condition-owned-request-tag', {
        value: {
            [`aws:RequestTag/kubernetes.io/cluster/${cluster.clusterName}`]: "owned"
        },
    });
    const condition2 = new aws_cdk_lib_1.CfnJson(cluster.stack, 'condition-owned-resource-tag', {
        value: {
            [`aws:ResourceTag/kubernetes.io/cluster/${cluster.clusterName}`]: "owned"
        },
    });
    const condition3 = new aws_cdk_lib_1.CfnJson(cluster.stack, 'condition-owned-request-tag-topology', {
        value: {
            [`aws:RequestTag/kubernetes.io/cluster/${cluster.clusterName}`]: "owned",
            "aws:RequestTag/topology.kubernetes.io/region": `${region}`
        },
    });
    const condition4 = new aws_cdk_lib_1.CfnJson(cluster.stack, 'condition-request-resource-tags', {
        value: {
            [`aws:ResourceTag/kubernetes.io/cluster/${cluster.clusterName}`]: "owned",
            [`aws:RequestTag/kubernetes.io/cluster/${cluster.clusterName}`]: "owned",
            "aws:ResourceTag/topology.kubernetes.io/region": `${region}`,
            "aws:RequestTag/topology.kubernetes.io/region": `${region}`
        }
    });
    const condition5 = new aws_cdk_lib_1.CfnJson(cluster.stack, 'condition-owned-resource-tag-topology', {
        value: {
            [`aws:ResourceTag/kubernetes.io/cluster/${cluster.clusterName}`]: "owned",
            "aws:ResourceTag/topology.kubernetes.io/region": `${region}`
        }
    });
    const condition6 = new aws_cdk_lib_1.CfnJson(cluster.stack, 'condition-owned-cluster-tag-ec2-actions', {
        value: {
            [`aws:RequestTag/kubernetes.io/cluster/${cluster.clusterName}`]: "owned",
            "ec2:CreateAction": ["RunInstances", "CreateFleet", "CreateLaunchTemplate"]
        },
    });
    return {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "AllowScopedEC2InstanceActions",
                "Effect": "Allow",
                "Resource": [
                    `arn:${partition}:ec2:${region}::image/*`,
                    `arn:${partition}:ec2:${region}::snapshot/*`,
                    `arn:${partition}:ec2:${region}:*:spot-instances-request/*`,
                    `arn:${partition}:ec2:${region}:*:security-group/*`,
                    `arn:${partition}:ec2:${region}:*:subnet/*`,
                    `arn:${partition}:ec2:${region}:*:launch-template/*`
                ],
                "Action": [
                    "ec2:RunInstances",
                    "ec2:CreateFleet"
                ]
            },
            {
                "Sid": "AllowScopedEC2InstanceActionsWithTags",
                "Effect": "Allow",
                "Resource": [
                    `arn:${partition}:ec2:${region}:*:fleet/*`,
                    `arn:${partition}:ec2:${region}:*:instance/*`,
                    `arn:${partition}:ec2:${region}:*:volume/*`,
                    `arn:${partition}:ec2:${region}:*:network-interface/*`,
                    `arn:${partition}:ec2:${region}:*:launch-template/*`,
                    `arn:${partition}:ec2:${region}:*:spot-instances-request/*`
                ],
                "Action": [
                    "ec2:RunInstances",
                    "ec2:CreateFleet",
                    "ec2:CreateLaunchTemplate"
                ],
                "Condition": {
                    "StringEquals": condition1,
                    "StringLike": {
                        "aws:RequestTag/karpenter.sh/nodepool": "*"
                    }
                },
            },
            {
                "Sid": "AllowScopedResourceCreationTagging",
                "Effect": "Allow",
                "Resource": [
                    `arn:${partition}:ec2:${region}:*:fleet/*`,
                    `arn:${partition}:ec2:${region}:*:instance/*`,
                    `arn:${partition}:ec2:${region}:*:volume/*`,
                    `arn:${partition}:ec2:${region}:*:network-interface/*`,
                    `arn:${partition}:ec2:${region}:*:launch-template/*`,
                    `arn:${partition}:ec2:${region}:*:spot-instances-request/*`
                ],
                "Action": "ec2:CreateTags",
                "Condition": {
                    "StringEquals": condition6,
                    "StringLike": {
                        "aws:RequestTag/karpenter.sh/nodepool": "*"
                    }
                }
            },
            {
                "Sid": "AllowScopedResourceTagging",
                "Effect": "Allow",
                "Resource": `arn:${partition}:ec2:${region}:*:instance/*`,
                "Action": "ec2:CreateTags",
                "Condition": {
                    "StringEquals": condition2,
                    "StringLike": {
                        "aws:ResourceTag/karpenter.sh/nodepool": "*"
                    },
                    "ForAllValues:StringEquals": {
                        "aws:TagKeys": [
                            "karpenter.sh/nodeclaim",
                            "Name"
                        ]
                    }
                }
            },
            {
                "Sid": "AllowScopedDeletion",
                "Effect": "Allow",
                "Resource": [
                    `arn:${partition}:ec2:${region}:*:instance/*`,
                    `arn:${partition}:ec2:${region}:*:launch-template/*`
                ],
                "Action": [
                    "ec2:TerminateInstances",
                    "ec2:DeleteLaunchTemplate"
                ],
                "Condition": {
                    "StringEquals": condition2,
                    "StringLike": {
                        "aws:ResourceTag/karpenter.sh/nodepool": "*"
                    }
                }
            },
            {
                "Sid": "AllowRegionalReadActions",
                "Effect": "Allow",
                "Resource": "*",
                "Action": [
                    "ec2:DescribeAvailabilityZones",
                    "ec2:DescribeImages",
                    "ec2:DescribeInstances",
                    "ec2:DescribeInstanceTypeOfferings",
                    "ec2:DescribeInstanceTypes",
                    "ec2:DescribeLaunchTemplates",
                    "ec2:DescribeSecurityGroups",
                    "ec2:DescribeSpotPriceHistory",
                    "ec2:DescribeSubnets"
                ],
                "Condition": {
                    "StringEquals": {
                        "aws:RequestedRegion": `${region}`
                    }
                }
            },
            {
                "Sid": "AllowSSMReadActions",
                "Effect": "Allow",
                "Resource": `arn:${partition}:ssm:${region}::parameter/aws/service/*`,
                "Action": "ssm:GetParameter"
            },
            {
                "Sid": "AllowPricingReadActions",
                "Effect": "Allow",
                "Resource": "*",
                "Action": "pricing:GetProducts"
            },
            {
                "Sid": "AllowScopedInstanceProfileCreationActions",
                "Effect": "Allow",
                "Resource": "*",
                "Action": [
                    "iam:CreateInstanceProfile"
                ],
                "Condition": {
                    "StringEquals": condition3,
                    "StringLike": {
                        "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass": "*"
                    }
                }
            },
            {
                "Sid": "AllowScopedInstanceProfileTagActions",
                "Effect": "Allow",
                "Resource": "*",
                "Action": [
                    "iam:TagInstanceProfile"
                ],
                "Condition": {
                    "StringEquals": condition4,
                    "StringLike": {
                        "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass": "*",
                        "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass": "*"
                    }
                }
            },
            {
                "Sid": "AllowScopedInstanceProfileActions",
                "Effect": "Allow",
                "Resource": "*",
                "Action": [
                    "iam:AddRoleToInstanceProfile",
                    "iam:RemoveRoleFromInstanceProfile",
                    "iam:DeleteInstanceProfile"
                ],
                "Condition": {
                    "StringEquals": condition5,
                    "StringLike": {
                        "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass": "*"
                    }
                }
            },
            {
                "Sid": "AllowInstanceProfileReadActions",
                "Effect": "Allow",
                "Resource": "*",
                "Action": "iam:GetInstanceProfile"
            },
            {
                "Sid": "AllowAPIServerEndpointDiscovery",
                "Effect": "Allow",
                "Resource": `${cluster.clusterArn}`,
                "Action": "eks:DescribeCluster"
            }
        ]
    };
};
exports.KarpenterControllerPolicyBeta = KarpenterControllerPolicyBeta;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL2FkZG9ucy9rYXJwZW50ZXIvaWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFzQztBQUd0Qyw0Q0FBNEM7QUFDL0IsUUFBQSx5QkFBeUIsR0FBRztJQUNyQyxTQUFTLEVBQUUsWUFBWTtJQUN2QixXQUFXLEVBQUU7UUFDVDtZQUNJLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLFFBQVEsRUFBRTtnQkFDVixtQkFBbUI7Z0JBQ2YsMEJBQTBCO2dCQUMxQixpQkFBaUI7Z0JBQ2pCLGtCQUFrQjtnQkFDbEIsZ0JBQWdCO2dCQUNoQix3QkFBd0I7Z0JBQ3hCLDBCQUEwQjtnQkFDOUIsa0JBQWtCO2dCQUNkLDZCQUE2QjtnQkFDN0IsdUJBQXVCO2dCQUN2Qiw0QkFBNEI7Z0JBQzVCLHFCQUFxQjtnQkFDckIsb0JBQW9CO2dCQUNwQiwyQkFBMkI7Z0JBQzNCLG1DQUFtQztnQkFDbkMsK0JBQStCO2dCQUMvQiw4QkFBOEI7Z0JBQzlCLGtCQUFrQjtnQkFDbEIscUJBQXFCO2FBQ3hCO1lBQ0QsVUFBVSxFQUFFLEdBQUc7U0FDbEI7S0FDSjtDQUNKLENBQUM7QUFFRiwyQ0FBMkM7QUFDcEMsTUFBTSw2QkFBNkIsR0FBRyxDQUFDLE9BQWdCLEVBQUUsU0FBaUIsRUFBRSxNQUFjLEVBQUUsRUFBRTtJQUNqRyxNQUFNLFVBQVUsR0FBRyxJQUFJLHFCQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSw2QkFBNkIsRUFBRTtRQUN6RSxLQUFLLEVBQUU7WUFDSCxDQUFDLHdDQUF3QyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxPQUFPO1NBQzNFO0tBQ0osQ0FBQyxDQUFDO0lBQ0gsTUFBTSxVQUFVLEdBQUcsSUFBSSxxQkFBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsOEJBQThCLEVBQUU7UUFDMUUsS0FBSyxFQUFFO1lBQ0gsQ0FBQyx5Q0FBeUMsT0FBTyxD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LCtDQUErQyxFQUFFLEdBQUc7cUJBQ3ZEO2lCQUNKO2FBQ0o7WUFDRDtnQkFDSSxLQUFLLEVBQUUsbUNBQW1DO2dCQUMxQyxRQUFRLEVBQUUsT0FBTztnQkFDakIsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsUUFBUSxFQUFFO29CQUNOLDhCQUE4QjtvQkFDOUIsbUNBQW1DO29CQUNuQywyQkFBMkI7aUJBQzlCO2dCQUNELFdBQVcsRUFBRTtvQkFDVCxjQUFjLEVBQUUsVUFBVTtvQkFDMUIsWUFBWSxFQUFFO3dCQUNWLGdEQUFnRCxFQUFFLEdBQUc7cUJBQ3hEO2lCQUNKO2FBQ0o7WUFDRDtnQkFDSSxLQUFLLEVBQUUsaUNBQWlDO2dCQUN4QyxRQUFRLEVBQUUsT0FBTztnQkFDakIsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsUUFBUSxFQUFFLHdCQUF3QjthQUNyQztZQUNEO2dCQUNJLEtBQUssRUFBRSxpQ0FBaUM7Z0JBQ3hDLFFBQVEsRUFBRSxPQUFPO2dCQUNqQixVQUFVLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFO2dCQUNuQyxRQUFRLEVBQUUscUJBQXFCO2FBQ2xDO1NBQ0o7S0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBcE9XLFFBQUEsNkJBQTZCLGlDQW9PeEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDZm5Kc29uIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgeyBDbHVzdGVyIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1la3NcIjtcblxuLy8gSUFNIFBvbGljeSBmb3IgQWxwaGEgQ1JEIEthcnBlbnRlciBhZGRvbnNcbmV4cG9ydCBjb25zdCBLYXJwZW50ZXJDb250cm9sbGVyUG9saWN5ID0ge1xuICAgIFwiVmVyc2lvblwiOiBcIjIwMTItMTAtMTdcIixcbiAgICBcIlN0YXRlbWVudFwiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgIC8vIFdyaXRlIE9wZXJhdGlvbnNcbiAgICAgICAgICAgICAgICBcImVjMjpDcmVhdGVMYXVuY2hUZW1wbGF0ZVwiLFxuICAgICAgICAgICAgICAgIFwiZWMyOkNyZWF0ZUZsZWV0XCIsXG4gICAgICAgICAgICAgICAgXCJlYzI6UnVuSW5zdGFuY2VzXCIsXG4gICAgICAgICAgICAgICAgXCJlYzI6Q3JlYXRlVGFnc1wiLFxuICAgICAgICAgICAgICAgIFwiZWMyOlRlcm1pbmF0ZUluc3RhbmNlc1wiLFxuICAgICAgICAgICAgICAgIFwiZWMyOkRlbGV0ZUxhdW5jaFRlbXBsYXRlXCIsXG4gICAgICAgICAgICAvLyBSZWFkIE9wZXJhdGlvbnNcbiAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZUxhdW5jaFRlbXBsYXRlc1wiLFxuICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlSW5zdGFuY2VzXCIsXG4gICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVTZWN1cml0eUdyb3Vwc1wiLFxuICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlU3VibmV0c1wiLFxuICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlSW1hZ2VzXCIsXG4gICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVJbnN0YW5jZVR5cGVzXCIsXG4gICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVJbnN0YW5jZVR5cGVPZmZlcmluZ3NcIixcbiAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZUF2YWlsYWJpbGl0eVpvbmVzXCIsXG4gICAgICAgICAgICAgICAgXCJlYzI6RGVzY3JpYmVTcG90UHJpY2VIaXN0b3J5XCIsXG4gICAgICAgICAgICAgICAgXCJzc206R2V0UGFyYW1ldGVyXCIsXG4gICAgICAgICAgICAgICAgXCJwcmljaW5nOkdldFByb2R1Y3RzXCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIlxuICAgICAgICB9XG4gICAgXVxufTtcblxuLy8gSUFNIFBvbGljeSBmb3IgQmV0YSBDUkQgS2FycGVudGVyIGFkZG9uc1xuZXhwb3J0IGNvbnN0IEthcnBlbnRlckNvbnRyb2xsZXJQb2xpY3lCZXRhID0gKGNsdXN0ZXI6IENsdXN0ZXIsIHBhcnRpdGlvbjogc3RyaW5nLCByZWdpb246IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGNvbmRpdGlvbjEgPSBuZXcgQ2ZuSnNvbihjbHVzdGVyLnN0YWNrLCAnY29uZGl0aW9uLW93bmVkLXJlcXVlc3QtdGFnJywge1xuICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgW2Bhd3M6UmVxdWVzdFRhZy9rdWJlcm5ldGVzLmlvL2NsdXN0ZXIvJHtjbHVzdGVyLmNsdXN0ZXJOYW1lfWBdOiBcIm93bmVkXCJcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBjb25kaXRpb24yID0gbmV3IENmbkpzb24oY2x1c3Rlci5zdGFjaywgJ2NvbmRpdGlvbi1vd25lZC1yZXNvdXJjZS10YWcnLCB7XG4gICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBbYGF3czpSZXNvdXJjZVRhZy9rdWJlcm5ldGVzLmlvL2NsdXN0ZXIvJHtjbHVzdGVyLmNsdXN0ZXJOYW1lfWBdOiBcIm93bmVkXCJcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBjb25kaXRpb24zID0gbmV3IENmbkpzb24oY2x1c3Rlci5zdGFjaywgJ2NvbmRpdGlvbi1vd25lZC1yZXF1ZXN0LXRhZy10b3BvbG9neScsIHtcbiAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIFtgYXdzOlJlcXVlc3RUYWcva3ViZXJuZXRlcy5pby9jbHVzdGVyLyR7Y2x1c3Rlci5jbHVzdGVyTmFtZX1gXTogXCJvd25lZFwiLFxuICAgICAgICAgICAgXCJhd3M6UmVxdWVzdFRhZy90b3BvbG9neS5rdWJlcm5ldGVzLmlvL3JlZ2lvblwiOiBgJHtyZWdpb259YFxuICAgICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGNvbmRpdGlvbjQgPSBuZXcgQ2ZuSnNvbihjbHVzdGVyLnN0YWNrLCAnY29uZGl0aW9uLXJlcXVlc3QtcmVzb3VyY2UtdGFncycsIHtcbiAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgIFtgYXdzOlJlc291cmNlVGFnL2t1YmVybmV0ZXMuaW8vY2x1c3Rlci8ke2NsdXN0ZXIuY2x1c3Rlck5hbWV9YF06IFwib3duZWRcIixcbiAgICAgICAgICAgIFtgYXdzOlJlcXVlc3RUYWcva3ViZXJuZXRlcy5pby9jbHVzdGVyLyR7Y2x1c3Rlci5jbHVzdGVyTmFtZX1gXTogXCJvd25lZFwiLFxuICAgICAgICAgICAgXCJhd3M6UmVzb3VyY2VUYWcvdG9wb2xvZ3kua3ViZXJuZXRlcy5pby9yZWdpb25cIjogYCR7cmVnaW9ufWAsXG4gICAgICAgICAgICBcImF3czpSZXF1ZXN0VGFnL3RvcG9sb2d5Lmt1YmVybmV0ZXMuaW8vcmVnaW9uXCI6IGAke3JlZ2lvbn1gXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBjb25kaXRpb241ID0gbmV3IENmbkpzb24oY2x1c3Rlci5zdGFjaywgJ2NvbmRpdGlvbi1vd25lZC1yZXNvdXJjZS10YWctdG9wb2xvZ3knLCB7XG4gICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBbYGF3czpSZXNvdXJjZVRhZy9rdWJlcm5ldGVzLmlvL2NsdXN0ZXIvJHtjbHVzdGVyLmNsdXN0ZXJOYW1lfWBdOiBcIm93bmVkXCIsXG4gICAgICAgICAgICBcImF3czpSZXNvdXJjZVRhZy90b3BvbG9neS5rdWJlcm5ldGVzLmlvL3JlZ2lvblwiOiBgJHtyZWdpb259YFxuICAgICAgICB9XG4gICAgfSk7XG4gICAgY29uc3QgY29uZGl0aW9uNiA9IG5ldyBDZm5Kc29uKGNsdXN0ZXIuc3RhY2ssICdjb25kaXRpb24tb3duZWQtY2x1c3Rlci10YWctZWMyLWFjdGlvbnMnLCB7XG4gICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICBbYGF3czpSZXF1ZXN0VGFnL2t1YmVybmV0ZXMuaW8vY2x1c3Rlci8ke2NsdXN0ZXIuY2x1c3Rlck5hbWV9YF06IFwib3duZWRcIixcbiAgICAgICAgICAgIFwiZWMyOkNyZWF0ZUFjdGlvblwiOiBbXCJSdW5JbnN0YW5jZXNcIiwgXCJDcmVhdGVGbGVldFwiLCBcIkNyZWF0ZUxhdW5jaFRlbXBsYXRlXCJdXG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgXG5cbiAgICByZXR1cm4ge1xuICAgICAgICBcIlZlcnNpb25cIjogXCIyMDEyLTEwLTE3XCIsXG4gICAgICAgIFwiU3RhdGVtZW50XCI6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIlNpZFwiOiBcIkFsbG93U2NvcGVkRUMySW5zdGFuY2VBY3Rpb25zXCIsXG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogW1xuICAgICAgICAgICAgICAgICAgICBgYXJuOiR7cGFydGl0aW9ufTplYzI6JHtyZWdpb259OjppbWFnZS8qYCxcbiAgICAgICAgICAgICAgICAgICAgYGFybjoke3BhcnRpdGlvbn06ZWMyOiR7cmVnaW9ufTo6c25hcHNob3QvKmAsXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVjMjoke3JlZ2lvbn06KjpzcG90LWluc3RhbmNlcy1yZXF1ZXN0LypgLFxuICAgICAgICAgICAgICAgICAgICBgYXJuOiR7cGFydGl0aW9ufTplYzI6JHtyZWdpb259Oio6c2VjdXJpdHktZ3JvdXAvKmAsXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVjMjoke3JlZ2lvbn06KjpzdWJuZXQvKmAsXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVjMjoke3JlZ2lvbn06KjpsYXVuY2gtdGVtcGxhdGUvKmBcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6UnVuSW5zdGFuY2VzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkNyZWF0ZUZsZWV0XCJcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwiU2lkXCI6IFwiQWxsb3dTY29wZWRFQzJJbnN0YW5jZUFjdGlvbnNXaXRoVGFnc1wiLFxuICAgICAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgICAgICBcIlJlc291cmNlXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgYGFybjoke3BhcnRpdGlvbn06ZWMyOiR7cmVnaW9ufToqOmZsZWV0LypgLFxuICAgICAgICAgICAgICAgICAgICBgYXJuOiR7cGFydGl0aW9ufTplYzI6JHtyZWdpb259Oio6aW5zdGFuY2UvKmAsXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVjMjoke3JlZ2lvbn06Kjp2b2x1bWUvKmAsXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVjMjoke3JlZ2lvbn06KjpuZXR3b3JrLWludGVyZmFjZS8qYCxcbiAgICAgICAgICAgICAgICAgICAgYGFybjoke3BhcnRpdGlvbn06ZWMyOiR7cmVnaW9ufToqOmxhdW5jaC10ZW1wbGF0ZS8qYCxcbiAgICAgICAgICAgICAgICAgICAgYGFybjoke3BhcnRpdGlvbn06ZWMyOiR7cmVnaW9ufToqOnNwb3QtaW5zdGFuY2VzLXJlcXVlc3QvKmBcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6UnVuSW5zdGFuY2VzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkNyZWF0ZUZsZWV0XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkNyZWF0ZUxhdW5jaFRlbXBsYXRlXCJcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFwiQ29uZGl0aW9uXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJTdHJpbmdFcXVhbHNcIjogY29uZGl0aW9uMSxcbiAgICAgICAgICAgICAgICAgICAgXCJTdHJpbmdMaWtlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYXdzOlJlcXVlc3RUYWcva2FycGVudGVyLnNoL25vZGVwb29sXCI6IFwiKlwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIlNpZFwiOiBcIkFsbG93U2NvcGVkUmVzb3VyY2VDcmVhdGlvblRhZ2dpbmdcIixcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBbXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVjMjoke3JlZ2lvbn06KjpmbGVldC8qYCxcbiAgICAgICAgICAgICAgICAgICAgYGFybjoke3BhcnRpdGlvbn06ZWMyOiR7cmVnaW9ufToqOmluc3RhbmNlLypgLFxuICAgICAgICAgICAgICAgICAgICBgYXJuOiR7cGFydGl0aW9ufTplYzI6JHtyZWdpb259Oio6dm9sdW1lLypgLFxuICAgICAgICAgICAgICAgICAgICBgYXJuOiR7cGFydGl0aW9ufTplYzI6JHtyZWdpb259Oio6bmV0d29yay1pbnRlcmZhY2UvKmAsXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVjMjoke3JlZ2lvbn06KjpsYXVuY2gtdGVtcGxhdGUvKmAsXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVjMjoke3JlZ2lvbn06KjpzcG90LWluc3RhbmNlcy1yZXF1ZXN0LypgXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBcImVjMjpDcmVhdGVUYWdzXCIsXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0VxdWFsc1wiOiBjb25kaXRpb242LFxuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0xpa2VcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhd3M6UmVxdWVzdFRhZy9rYXJwZW50ZXIuc2gvbm9kZXBvb2xcIjogXCIqXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJTaWRcIjogXCJBbGxvd1Njb3BlZFJlc291cmNlVGFnZ2luZ1wiLFxuICAgICAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgICAgICBcIlJlc291cmNlXCI6IGBhcm46JHtwYXJ0aXRpb259OmVjMjoke3JlZ2lvbn06KjppbnN0YW5jZS8qYCxcbiAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBcImVjMjpDcmVhdGVUYWdzXCIsXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0VxdWFsc1wiOiBjb25kaXRpb24yLFxuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0xpa2VcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhd3M6UmVzb3VyY2VUYWcva2FycGVudGVyLnNoL25vZGVwb29sXCI6IFwiKlwiXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiRm9yQWxsVmFsdWVzOlN0cmluZ0VxdWFsc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImF3czpUYWdLZXlzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImthcnBlbnRlci5zaC9ub2RlY2xhaW1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIk5hbWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIlNpZFwiOiBcIkFsbG93U2NvcGVkRGVsZXRpb25cIixcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBbXG4gICAgICAgICAgICAgICAgICAgIGBhcm46JHtwYXJ0aXRpb259OmVjMjoke3JlZ2lvbn06KjppbnN0YW5jZS8qYCxcbiAgICAgICAgICAgICAgICAgICAgYGFybjoke3BhcnRpdGlvbn06ZWMyOiR7cmVnaW9ufToqOmxhdW5jaC10ZW1wbGF0ZS8qYFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImVjMjpUZXJtaW5hdGVJbnN0YW5jZXNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlYzI6RGVsZXRlTGF1bmNoVGVtcGxhdGVcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0VxdWFsc1wiOiBjb25kaXRpb24yLFxuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0xpa2VcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhd3M6UmVzb3VyY2VUYWcva2FycGVudGVyLnNoL25vZGVwb29sXCI6IFwiKlwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwiU2lkXCI6IFwiQWxsb3dSZWdpb25hbFJlYWRBY3Rpb25zXCIsXG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZUF2YWlsYWJpbGl0eVpvbmVzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlSW1hZ2VzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlSW5zdGFuY2VzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlSW5zdGFuY2VUeXBlT2ZmZXJpbmdzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlSW5zdGFuY2VUeXBlc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZUxhdW5jaFRlbXBsYXRlc1wiLFxuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZVNlY3VyaXR5R3JvdXBzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZWMyOkRlc2NyaWJlU3BvdFByaWNlSGlzdG9yeVwiLFxuICAgICAgICAgICAgICAgICAgICBcImVjMjpEZXNjcmliZVN1Ym5ldHNcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0VxdWFsc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImF3czpSZXF1ZXN0ZWRSZWdpb25cIjogYCR7cmVnaW9ufWBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJTaWRcIjogXCJBbGxvd1NTTVJlYWRBY3Rpb25zXCIsXG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogYGFybjoke3BhcnRpdGlvbn06c3NtOiR7cmVnaW9ufTo6cGFyYW1ldGVyL2F3cy9zZXJ2aWNlLypgLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFwic3NtOkdldFBhcmFtZXRlclwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwiU2lkXCI6IFwiQWxsb3dQcmljaW5nUmVhZEFjdGlvbnNcIixcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIixcbiAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBcInByaWNpbmc6R2V0UHJvZHVjdHNcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIlNpZFwiOiBcIkFsbG93U2NvcGVkSW5zdGFuY2VQcm9maWxlQ3JlYXRpb25BY3Rpb25zXCIsXG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICBcImlhbTpDcmVhdGVJbnN0YW5jZVByb2ZpbGVcIlxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgXCJDb25kaXRpb25cIjoge1xuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0VxdWFsc1wiOiBjb25kaXRpb24zLFxuICAgICAgICAgICAgICAgICAgICBcIlN0cmluZ0xpa2VcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhd3M6UmVxdWVzdFRhZy9rYXJwZW50ZXIuazhzLmF3cy9lYzJub2RlY2xhc3NcIjogXCIqXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJTaWRcIjogXCJBbGxvd1Njb3BlZEluc3RhbmNlUHJvZmlsZVRhZ0FjdGlvbnNcIixcbiAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgXCJSZXNvdXJjZVwiOiBcIipcIixcbiAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiaWFtOlRhZ0luc3RhbmNlUHJvZmlsZVwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBcIkNvbmRpdGlvblwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiU3RyaW5nRXF1YWxzXCI6IGNvbmRpdGlvbjQsXG4gICAgICAgICAgICAgICAgICAgIFwiU3RyaW5nTGlrZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImF3czpSZXNvdXJjZVRhZy9rYXJwZW50ZXIuazhzLmF3cy9lYzJub2RlY2xhc3NcIjogXCIqXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImF3czpSZXF1ZXN0VGFnL2thcnBlbnRlci5rOHMuYXdzL2VjMm5vZGVjbGFzc1wiOiBcIipcIlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcIlNpZFwiOiBcIkFsbG93U2NvcGVkSW5zdGFuY2VQcm9maWxlQWN0aW9uc1wiLFxuICAgICAgICAgICAgICAgIFwiRWZmZWN0XCI6IFwiQWxsb3dcIixcbiAgICAgICAgICAgICAgICBcIlJlc291cmNlXCI6IFwiKlwiLFxuICAgICAgICAgICAgICAgIFwiQWN0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJpYW06QWRkUm9sZVRvSW5zdGFuY2VQcm9maWxlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiaWFtOlJlbW92ZVJvbGVGcm9tSW5zdGFuY2VQcm9maWxlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiaWFtOkRlbGV0ZUluc3RhbmNlUHJvZmlsZVwiXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBcIkNvbmRpdGlvblwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiU3RyaW5nRXF1YWxzXCI6IGNvbmRpdGlvbjUsXG4gICAgICAgICAgICAgICAgICAgIFwiU3RyaW5nTGlrZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImF3czpSZXNvdXJjZVRhZy9rYXJwZW50ZXIuazhzLmF3cy9lYzJub2RlY2xhc3NcIjogXCIqXCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJTaWRcIjogXCJBbGxvd0luc3RhbmNlUHJvZmlsZVJlYWRBY3Rpb25zXCIsXG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogXCIqXCIsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogXCJpYW06R2V0SW5zdGFuY2VQcm9maWxlXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJTaWRcIjogXCJBbGxvd0FQSVNlcnZlckVuZHBvaW50RGlzY292ZXJ5XCIsXG4gICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogYCR7Y2x1c3Rlci5jbHVzdGVyQXJufWAsXG4gICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogXCJla3M6RGVzY3JpYmVDbHVzdGVyXCJcbiAgICAgICAgICAgIH0gICAgXG4gICAgICAgIF1cbiAgICB9O1xufTsiXX0=