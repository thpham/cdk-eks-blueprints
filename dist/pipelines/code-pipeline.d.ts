import * as cdk from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as cdkpipelines from 'aws-cdk-lib/pipelines';
import { GitHubTrigger } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from "constructs";
import { ApplicationRepository, AsyncStackBuilder, StackBuilder } from '../spi';
export { cdkpipelines };
export { GitHubTrigger };
/**
 * credentialsType is excluded and the only supported credentialsSecret is a plaintext GitHub OAuth token.
 * repoUrl
 */
export interface GitHubSourceRepository extends Omit<ApplicationRepository, "credentialsType"> {
    /**
     * A GitHub OAuth token to use for authentication stored with AWS Secret Manager.
     * The provided name will be looked up using the following:
     * ```ts
     * const credentials = cdk.SecretValue.secretsManager('my-github-token');
     * ```
     *
     * The GitHub Personal Access Token should have these scopes:
     *
     * * **repo** - to read the repository
     * * **admin:repo_hook** - if you plan to use webhooks (true by default)
     *
     * @see https://docs.aws.amazon.com/codepipeline/latest/userguide/GitHub-create-personal-token-CLI.html
     */
    credentialsSecretName: string;
    /**
     * The owner of the repository for the pipeline (GitHub handle).
     */
    owner?: string;
    /**
     * How GitHub source action will be triggered.
     */
    trigger?: GitHubTrigger;
}
export interface CodeCommitSourceRepository extends Omit<ApplicationRepository, "credentialsType" | "credentialsSecretName " | "repoUrl"> {
    /**
     * The name of the CodeCommit repository.
     */
    codeCommitRepoName: string;
    /**
     * Optional CodeCommitSourceOptions.
     */
    codeCommitOptions?: cdkpipelines.CodeCommitSourceOptions;
}
export interface CodeStarConnectionRepository extends Omit<ApplicationRepository, 'credentialsType' | 'credentialsSecretName '> {
    /**
     * The ARN of the CodeStar Connection.
     */
    codeStarConnectionArn: string;
    /**
     * The owner of the repository for the pipeline
     */
    owner?: string;
}
export declare function isCodeCommitRepo(repo: GitHubSourceRepository | CodeCommitSourceRepository | CodeStarConnectionRepository): boolean;
export declare function isCodeStarConnection(repo: GitHubSourceRepository | CodeCommitSourceRepository | CodeStarConnectionRepository): boolean;
/**
 * Props for the Pipeline.
 */
export type PipelineProps = {
    /**
     * Application name (optional, default to the app set in the cdk.json)
     */
    application?: string;
    /**
     * The name for the pipeline.
     */
    name: string;
    /**
     * The owner of the repository for the pipeline (GitHub handle).
     */
    owner?: string;
    /**
     * Enable/Disable allowing cross-account deployments.
     */
    crossAccountKeys: boolean;
    /**
     * IAM policies to attach to the code build role.
     * By default it allows access for lookups, including secret look-ups.
     * Passing an empty list will result in no extra-policies passed to the build role.
     * Leaving this unspecified will result in the default policy applied (not recommended for proudction).
     */
    codeBuildPolicies?: PolicyStatement[];
    /**
     * Repository for the pipeline (GitHub or CodeCommitRepository).
     */
    repository: GitHubSourceRepository | CodeCommitSourceRepository | CodeStarConnectionRepository;
    /**
     * Pipeline stages and options.
     */
    stages: WaveStage[];
    /**
     * Waves for the pipeline. Stages inside the wave are executed in parallel.
     */
    waves: PipelineWave[];
};
/**
 * Stack stage is a builder construct to allow adding stages to a pipeline. Each stage is expected to produce a stack.
 */
export interface StackStage {
    /**
     * id of the stage
     */
    id: string;
    /**
     * Builder that can produce a stack which will be deployed as part of the stage
     */
    stackBuilder: StackBuilder;
    /**
     * Optional stage properties, such as {manualApprovals: true} which can control stage transitions.
     */
    stageProps?: cdkpipelines.AddStageOpts;
}
/**
 * Internal interface for wave stages
 */
export interface WaveStage extends StackStage {
    /**
     * Wave id if this stage is part of a wave. Not required if stage is supplied
     */
    waveId?: string;
}
/**
 * Represents wave configuration
 */
export interface PipelineWave {
    id: string;
    stages: StackStage[];
    props?: cdkpipelines.WaveProps;
}
/**
 * Default policy for the CodeBuild role generated.
 * It allows look-ups, including access to AWS Secrets Manager.
 * Not recommended for production. For production use case, CodeBuild policies
 * must be restricted to particular resources. Outbound access from the build should be
 * controlled by ACL.
 */
export declare const DEFAULT_BUILD_POLICIES: cdk.aws_iam.PolicyStatement[];
/**
 * Builder for CodePipeline.
 */
export declare class CodePipelineBuilder implements StackBuilder {
    private props;
    constructor();
    application(app: string): CodePipelineBuilder;
    name(name: string): CodePipelineBuilder;
    owner(owner: string): CodePipelineBuilder;
    /**
     * For production use cases, make sure all policies are tied to concrete resources.
     * @param policies
     * @returns
     */
    codeBuildPolicies(policies: PolicyStatement[]): CodePipelineBuilder;
    enableCrossAccountKeys(): CodePipelineBuilder;
    repository(repo: GitHubSourceRepository | CodeCommitSourceRepository | CodeStarConnectionRepository): CodePipelineBuilder;
    /**
     * Adds standalone pipeline stages (in the order of invocation and elements in the input array)
     * @param stackStages
     * @returns
     */
    stage(...stackStages: StackStage[]): CodePipelineBuilder;
    /**
     * Adds wave(s) in the order specified. All stages in the wave can be executed in parallel, while standalone stages are executed sequentially.
     * @param waves
     * @returns
     */
    wave(...waves: PipelineWave[]): CodePipelineBuilder;
    build(scope: Construct, id: string, stackProps?: cdk.StackProps): cdk.Stack;
}
/**
 * Pipeline stack is generating a self-mutating pipeline to faciliate full CI/CD experience with the platform
 * for infrastructure changes.
 */
export declare class CodePipelineStack extends cdk.Stack {
    static readonly USAGE_ID = "qs-1s1r465k6";
    static readonly USAGE_ID_MULTI_ACCOUNT = "qs-1s1r465f2";
    static builder(): CodePipelineBuilder;
    constructor(scope: Construct, pipelineProps: PipelineProps, id: string, props?: StackProps);
}
export declare class ApplicationStage extends cdk.Stage {
    private asyncTask;
    constructor(scope: cdk.Stack, id: string, builder: StackBuilder | AsyncStackBuilder, props?: cdk.StageProps);
    waitForAsyncTasks(): Promise<ApplicationStage>;
}
