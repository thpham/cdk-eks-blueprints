export declare const AwsLoadbalancerControllerIamPolicy: (partition: string) => {
    Version: string;
    Statement: ({
        Effect: string;
        Action: string;
        Resource: string;
        Condition: {
            StringEquals: {
                "iam:AWSServiceName": string;
                "ec2:CreateAction"?: undefined;
                "elasticloadbalancing:CreateAction"?: undefined;
            };
            Null?: undefined;
        };
    } | {
        Effect: string;
        Action: string[];
        Resource: string;
        Condition?: undefined;
    } | {
        Effect: string;
        Action: string[];
        Resource: string;
        Condition: {
            StringEquals: {
                "ec2:CreateAction": string;
                "iam:AWSServiceName"?: undefined;
                "elasticloadbalancing:CreateAction"?: undefined;
            };
            Null: {
                "aws:RequestTag/elbv2.k8s.aws/cluster": string;
                "aws:ResourceTag/elbv2.k8s.aws/cluster"?: undefined;
            };
        };
    } | {
        Effect: string;
        Action: string[];
        Resource: string;
        Condition: {
            Null: {
                "aws:RequestTag/elbv2.k8s.aws/cluster": string;
                "aws:ResourceTag/elbv2.k8s.aws/cluster": string;
            };
            StringEquals?: undefined;
        };
    } | {
        Effect: string;
        Action: string[];
        Resource: string;
        Condition: {
            Null: {
                "aws:ResourceTag/elbv2.k8s.aws/cluster": string;
                "aws:RequestTag/elbv2.k8s.aws/cluster"?: undefined;
            };
            StringEquals?: undefined;
        };
    } | {
        Effect: string;
        Action: string[];
        Resource: string;
        Condition: {
            Null: {
                "aws:RequestTag/elbv2.k8s.aws/cluster": string;
                "aws:ResourceTag/elbv2.k8s.aws/cluster"?: undefined;
            };
            StringEquals?: undefined;
        };
    } | {
        Effect: string;
        Action: string[];
        Resource: string[];
        Condition: {
            Null: {
                "aws:RequestTag/elbv2.k8s.aws/cluster": string;
                "aws:ResourceTag/elbv2.k8s.aws/cluster": string;
            };
            StringEquals?: undefined;
        };
    } | {
        Effect: string;
        Action: string[];
        Resource: string[];
        Condition?: undefined;
    } | {
        Effect: string;
        Action: string[];
        Resource: string[];
        Condition: {
            StringEquals: {
                "elasticloadbalancing:CreateAction": string[];
                "iam:AWSServiceName"?: undefined;
                "ec2:CreateAction"?: undefined;
            };
            Null: {
                "aws:RequestTag/elbv2.k8s.aws/cluster": string;
                "aws:ResourceTag/elbv2.k8s.aws/cluster"?: undefined;
            };
        };
    })[];
};
