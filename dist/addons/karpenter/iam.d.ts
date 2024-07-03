import { CfnJson } from "aws-cdk-lib";
import { Cluster } from "aws-cdk-lib/aws-eks";
export declare const KarpenterControllerPolicy: {
    Version: string;
    Statement: {
        Effect: string;
        Action: string[];
        Resource: string;
    }[];
};
export declare const KarpenterControllerPolicyBeta: (cluster: Cluster, partition: string, region: string) => {
    Version: string;
    Statement: ({
        Sid: string;
        Effect: string;
        Resource: string[];
        Action: string[];
        Condition?: undefined;
    } | {
        Sid: string;
        Effect: string;
        Resource: string[];
        Action: string[];
        Condition: {
            StringEquals: CfnJson;
            StringLike: {
                "aws:RequestTag/karpenter.sh/nodepool": string;
                "aws:ResourceTag/karpenter.sh/nodepool"?: undefined;
                "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass"?: undefined;
                "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass"?: undefined;
            };
            "ForAllValues:StringEquals"?: undefined;
        };
    } | {
        Sid: string;
        Effect: string;
        Resource: string[];
        Action: string;
        Condition: {
            StringEquals: CfnJson;
            StringLike: {
                "aws:RequestTag/karpenter.sh/nodepool": string;
                "aws:ResourceTag/karpenter.sh/nodepool"?: undefined;
                "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass"?: undefined;
                "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass"?: undefined;
            };
            "ForAllValues:StringEquals"?: undefined;
        };
    } | {
        Sid: string;
        Effect: string;
        Resource: string;
        Action: string;
        Condition: {
            StringEquals: CfnJson;
            StringLike: {
                "aws:ResourceTag/karpenter.sh/nodepool": string;
                "aws:RequestTag/karpenter.sh/nodepool"?: undefined;
                "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass"?: undefined;
                "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass"?: undefined;
            };
            "ForAllValues:StringEquals": {
                "aws:TagKeys": string[];
            };
        };
    } | {
        Sid: string;
        Effect: string;
        Resource: string[];
        Action: string[];
        Condition: {
            StringEquals: CfnJson;
            StringLike: {
                "aws:ResourceTag/karpenter.sh/nodepool": string;
                "aws:RequestTag/karpenter.sh/nodepool"?: undefined;
                "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass"?: undefined;
                "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass"?: undefined;
            };
            "ForAllValues:StringEquals"?: undefined;
        };
    } | {
        Sid: string;
        Effect: string;
        Resource: string;
        Action: string[];
        Condition: {
            StringEquals: {
                "aws:RequestedRegion": string;
            };
            StringLike?: undefined;
            "ForAllValues:StringEquals"?: undefined;
        };
    } | {
        Sid: string;
        Effect: string;
        Resource: string;
        Action: string;
        Condition?: undefined;
    } | {
        Sid: string;
        Effect: string;
        Resource: string;
        Action: string[];
        Condition: {
            StringEquals: CfnJson;
            StringLike: {
                "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass": string;
                "aws:RequestTag/karpenter.sh/nodepool"?: undefined;
                "aws:ResourceTag/karpenter.sh/nodepool"?: undefined;
                "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass"?: undefined;
            };
            "ForAllValues:StringEquals"?: undefined;
        };
    } | {
        Sid: string;
        Effect: string;
        Resource: string;
        Action: string[];
        Condition: {
            StringEquals: CfnJson;
            StringLike: {
                "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass": string;
                "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass": string;
                "aws:RequestTag/karpenter.sh/nodepool"?: undefined;
                "aws:ResourceTag/karpenter.sh/nodepool"?: undefined;
            };
            "ForAllValues:StringEquals"?: undefined;
        };
    } | {
        Sid: string;
        Effect: string;
        Resource: string;
        Action: string[];
        Condition: {
            StringEquals: CfnJson;
            StringLike: {
                "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass": string;
                "aws:RequestTag/karpenter.sh/nodepool"?: undefined;
                "aws:ResourceTag/karpenter.sh/nodepool"?: undefined;
                "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass"?: undefined;
            };
            "ForAllValues:StringEquals"?: undefined;
        };
    })[];
};
