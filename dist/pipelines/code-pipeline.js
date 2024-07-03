"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationStage = exports.CodePipelineStack = exports.CodePipelineBuilder = exports.DEFAULT_BUILD_POLICIES = exports.GitHubTrigger = exports.cdkpipelines = void 0;
exports.isCodeCommitRepo = isCodeCommitRepo;
exports.isCodeStarConnection = isCodeStarConnection;
const assert = require("assert");
const cdk = require("aws-cdk-lib");
const codecommit = require("aws-cdk-lib/aws-codecommit");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const cdkpipelines = require("aws-cdk-lib/pipelines");
exports.cdkpipelines = cdkpipelines;
const aws_codepipeline_actions_1 = require("aws-cdk-lib/aws-codepipeline-actions");
Object.defineProperty(exports, "GitHubTrigger", { enumerable: true, get: function () { return aws_codepipeline_actions_1.GitHubTrigger; } });
const usage_utils_1 = require("../utils/usage-utils");
function isCodeCommitRepo(repo) {
    return Object.prototype.hasOwnProperty.call(repo, 'codeCommitRepoName');
}
function isCodeStarConnection(repo) {
    return Object.prototype.hasOwnProperty.call(repo, 'codeStarConnectionArn');
}
/**
 * Default policy for the CodeBuild role generated.
 * It allows look-ups, including access to AWS Secrets Manager.
 * Not recommended for production. For production use case, CodeBuild policies
 * must be restricted to particular resources. Outbound access from the build should be
 * controlled by ACL.
 */
exports.DEFAULT_BUILD_POLICIES = [new aws_iam_1.PolicyStatement({
        resources: ["*"],
        actions: [
            "sts:AssumeRole",
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret",
            "cloudformation:*",
            "eks:DescribeAddonVersions"
        ]
    })];
/**
 * Builder for CodePipeline.
 */
class CodePipelineBuilder {
    constructor() {
        this.props = { crossAccountKeys: false, stages: [], waves: [] };
    }
    application(app) {
        this.props.application = app;
        return this;
    }
    name(name) {
        this.props.name = name;
        return this;
    }
    owner(owner) {
        this.props.owner = owner;
        return this;
    }
    /**
     * For production use cases, make sure all policies are tied to concrete resources.
     * @param policies
     * @returns
     */
    codeBuildPolicies(policies) {
        this.props.codeBuildPolicies = policies;
        return this;
    }
    enableCrossAccountKeys() {
        this.props.crossAccountKeys = true;
        return this;
    }
    repository(repo) {
        this.props.repository = repo;
        if (isCodeCommitRepo(repo)) {
            this.props.repository = repo;
        }
        if (isCodeStarConnection(repo)) {
            this.props.repository = repo;
        }
        return this;
    }
    /**
     * Adds standalone pipeline stages (in the order of invocation and elements in the input array)
     * @param stackStages
     * @returns
     */
    stage(...stackStages) {
        stackStages.forEach(stage => this.props.stages.push(stage));
        return this;
    }
    /**
     * Adds wave(s) in the order specified. All stages in the wave can be executed in parallel, while standalone stages are executed sequentially.
     * @param waves
     * @returns
     */
    wave(...waves) {
        waves.forEach(wave => {
            this.props.waves.push(wave);
            wave.stages.forEach(stage => { var _a; return (_a = this.props.stages) === null || _a === void 0 ? void 0 : _a.push({ ...stage, ...{ waveId: wave.id } }); });
        });
        return this;
    }
    build(scope, id, stackProps) {
        assert(this.props.name, 'name field is required for the pipeline stack. Please provide value.');
        assert(this.props.stages, 'Stage field is required for the pipeline stack. Please provide value.');
        if (this.props.repository) {
            let gitHubRepo = this.props.repository;
            if (!isCodeCommitRepo(this.props.repository)) {
                assert(this.props.owner || gitHubRepo.owner, 'repository.owner field is required for the GitHub or CodeStar connection pipeline stack. Please provide value.');
            }
        }
        const fullProps = this.props;
        return new CodePipelineStack(scope, fullProps, id, stackProps);
    }
}
exports.CodePipelineBuilder = CodePipelineBuilder;
/**
 * Pipeline stack is generating a self-mutating pipeline to faciliate full CI/CD experience with the platform
 * for infrastructure changes.
 */
class CodePipelineStack extends cdk.Stack {
    static builder() {
        return new CodePipelineBuilder();
    }
    constructor(scope, pipelineProps, id, props) {
        if (pipelineProps.crossAccountKeys) {
            super(scope, id, (0, usage_utils_1.withUsageTracking)(CodePipelineStack.USAGE_ID_MULTI_ACCOUNT, props));
        }
        else {
            super(scope, id, (0, usage_utils_1.withUsageTracking)(CodePipelineStack.USAGE_ID, props));
        }
        const pipeline = CodePipeline.build(this, pipelineProps);
        let promises = [];
        for (let stage of pipelineProps.stages) {
            const appStage = new ApplicationStage(this, stage.id, stage.stackBuilder);
            promises.push(appStage.waitForAsyncTasks());
        }
        Promise.all(promises).then(stages => {
            let currentWave;
            for (let i in stages) {
                const stage = pipelineProps.stages[i];
                if (stage.waveId) {
                    if (currentWave == null || currentWave.id != stage.waveId) {
                        const waveProps = pipelineProps.waves.find(wave => wave.id === stage.waveId);
                        assert(waveProps, `Specified wave ${stage.waveId} is not found in the pipeline definition ${id}`);
                        currentWave = pipeline.addWave(stage.waveId, { ...waveProps.props });
                    }
                    currentWave.addStage(stages[i], stage.stageProps);
                }
                else {
                    pipeline.addStage(stages[i], stage.stageProps);
                }
            }
        });
    }
}
exports.CodePipelineStack = CodePipelineStack;
CodePipelineStack.USAGE_ID = "qs-1s1r465k6";
CodePipelineStack.USAGE_ID_MULTI_ACCOUNT = "qs-1s1r465f2";
class ApplicationStage extends cdk.Stage {
    constructor(scope, id, builder, props) {
        super(scope, id, props);
        if (builder.buildAsync !== undefined) {
            this.asyncTask = builder.buildAsync(this, `${id}-blueprint`, props);
        }
        else {
            builder.build(this, `${id}-blueprint`, props);
        }
    }
    async waitForAsyncTasks() {
        if (this.asyncTask) {
            return this.asyncTask.then(() => {
                return this;
            });
        }
        return Promise.resolve(this);
    }
}
exports.ApplicationStage = ApplicationStage;
/**
 * CodePipeline deploys a new CodePipeline resource that is integrated with a GitHub repository.
 */
class CodePipeline {
    static build(scope, props) {
        var _a, _b, _c, _d, _e, _f, _g;
        let codePipelineSource = undefined;
        switch (true) {
            case isCodeCommitRepo(props.repository): {
                let codeCommitRepo = props.repository;
                codePipelineSource = cdkpipelines.CodePipelineSource.codeCommit(codecommit.Repository.fromRepositoryName(scope, 'cdk-eks-blueprints', codeCommitRepo.codeCommitRepoName), (_a = codeCommitRepo.targetRevision) !== null && _a !== void 0 ? _a : 'master', codeCommitRepo.codeCommitOptions);
                break;
            }
            case isCodeStarConnection(props.repository): {
                let codeStarConnection = props.repository;
                const repoOwner = (_b = codeStarConnection.owner) !== null && _b !== void 0 ? _b : props.owner;
                codePipelineSource = cdkpipelines.CodePipelineSource.connection(`${repoOwner}/${codeStarConnection.repoUrl}`, (_c = codeStarConnection.targetRevision) !== null && _c !== void 0 ? _c : 'main', { connectionArn: codeStarConnection.codeStarConnectionArn });
                break;
            }
            default: {
                let gitHubRepo = props.repository;
                let githubProps = {};
                const gitHubOwner = (_d = gitHubRepo.owner) !== null && _d !== void 0 ? _d : props.owner;
                if (gitHubRepo.credentialsSecretName) {
                    githubProps = {
                        authentication: cdk.SecretValue.secretsManager(gitHubRepo.credentialsSecretName),
                    };
                }
                codePipelineSource = cdkpipelines.CodePipelineSource.gitHub(`${gitHubOwner}/${gitHubRepo.repoUrl}`, (_e = gitHubRepo.targetRevision) !== null && _e !== void 0 ? _e : 'main', {
                    ...githubProps,
                    trigger: (_f = gitHubRepo.trigger) !== null && _f !== void 0 ? _f : aws_codepipeline_actions_1.GitHubTrigger.WEBHOOK,
                });
                break;
            }
        }
        const app = props.application ? `--app '${props.application}'` : "";
        const path = (_g = props.repository.path) !== null && _g !== void 0 ? _g : "./";
        return new cdkpipelines.CodePipeline(scope, props.name, {
            pipelineName: props.name,
            synth: new cdkpipelines.ShellStep(`${props.name}-synth`, {
                input: codePipelineSource,
                primaryOutputDirectory: `${path}/cdk.out`,
                installCommands: [
                    'n stable',
                    'npm install -g aws-cdk@2.147.3',
                    `cd $CODEBUILD_SRC_DIR/${path} && npm install`
                ],
                commands: [`cd $CODEBUILD_SRC_DIR/${path}`, 'npm run build', 'npx cdk synth ' + app]
            }),
            crossAccountKeys: props.crossAccountKeys,
            codeBuildDefaults: {
                rolePolicy: props.codeBuildPolicies
            },
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1waXBlbGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9waXBlbGluZXMvY29kZS1waXBlbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUE2RUEsNENBT0M7QUFFRCxvREFRQztBQTlGRCxpQ0FBaUM7QUFDakMsbUNBQW1DO0FBRW5DLHlEQUF5RDtBQUN6RCxpREFBc0Q7QUFDdEQsc0RBQXNEO0FBT2xELG9DQUFZO0FBTmhCLG1GQUFxRTtBQVM1RCw4RkFUQSx3Q0FBYSxPQVNBO0FBTnRCLHNEQUF5RDtBQW9FekQsU0FBZ0IsZ0JBQWdCLENBQzlCLElBR2dDO0lBRWhDLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0FBQzFFLENBQUM7QUFFRCxTQUFnQixvQkFBb0IsQ0FDbEMsSUFHZ0M7SUFFaEMsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHVCQUF1QixDQUFDLENBQUM7QUFFN0UsQ0FBQztBQWtHRDs7Ozs7O0dBTUc7QUFDVSxRQUFBLHNCQUFzQixHQUFHLENBQUUsSUFBSSx5QkFBZSxDQUFDO1FBQ3hELFNBQVMsRUFBRSxDQUFDLEdBQUcsQ0FBQztRQUNoQixPQUFPLEVBQUU7WUFDTCxnQkFBZ0I7WUFDaEIsK0JBQStCO1lBQy9CLCtCQUErQjtZQUMvQixrQkFBa0I7WUFDbEIsMkJBQTJCO1NBQzlCO0tBQ0osQ0FBQyxDQUFDLENBQUM7QUFFSjs7R0FFRztBQUNILE1BQWEsbUJBQW1CO0lBSTVCO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRU0sV0FBVyxDQUFDLEdBQVc7UUFDNUIsSUFBSSxDQUFDLEtBQUss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IGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBTdGFja1Byb3BzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgY29kZWNvbW1pdCBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY29kZWNvbW1pdCc7XG5pbXBvcnQgeyBQb2xpY3lTdGF0ZW1lbnQgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0ICogYXMgY2RrcGlwZWxpbmVzIGZyb20gJ2F3cy1jZGstbGliL3BpcGVsaW5lcyc7XG5pbXBvcnQgeyBHaXRIdWJUcmlnZ2VyIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZGVwaXBlbGluZS1hY3Rpb25zJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBBcHBsaWNhdGlvblJlcG9zaXRvcnksIEFzeW5jU3RhY2tCdWlsZGVyLCBTdGFja0J1aWxkZXIgfSBmcm9tICcuLi9zcGknO1xuaW1wb3J0IHsgd2l0aFVzYWdlVHJhY2tpbmcgfSBmcm9tICcuLi91dGlscy91c2FnZS11dGlscyc7XG5cbmV4cG9ydCB7XG4gICAgY2RrcGlwZWxpbmVzXG59O1xuXG5leHBvcnQgeyBHaXRIdWJUcmlnZ2VyIH07XG5cbi8qKlxuICogY3JlZGVudGlhbHNUeXBlIGlzIGV4Y2x1ZGVkIGFuZCB0aGUgb25seSBzdXBwb3J0ZWQgY3JlZGVudGlhbHNTZWNyZXQgaXMgYSBwbGFpbnRleHQgR2l0SHViIE9BdXRoIHRva2VuLlxuICogcmVwb1VybFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdEh1YlNvdXJjZVJlcG9zaXRvcnkgZXh0ZW5kcyBPbWl0PEFwcGxpY2F0aW9uUmVwb3NpdG9yeSwgXCJjcmVkZW50aWFsc1R5cGVcIj4ge1xuICAgIC8qKlxuICAgICAqIEEgR2l0SHViIE9BdXRoIHRva2VuIHRvIHVzZSBmb3IgYXV0aGVudGljYXRpb24gc3RvcmVkIHdpdGggQVdTIFNlY3JldCBNYW5hZ2VyLlxuICAgICAqIFRoZSBwcm92aWRlZCBuYW1lIHdpbGwgYmUgbG9va2VkIHVwIHVzaW5nIHRoZSBmb2xsb3dpbmc6XG4gICAgICogYGBgdHNcbiAgICAgKiBjb25zdCBjcmVkZW50aWFscyA9IGNkay5TZWNyZXRWYWx1ZS5zZWNyZXRzTWFuYWdlcignbXktZ2l0aHViLXRva2VuJyk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBUaGUgR2l0SHViIFBlcnNvbmFsIEFjY2VzcyBUb2tlbiBzaG91bGQgaGF2ZSB0aGVzZSBzY29wZXM6XG4gICAgICpcbiAgICAgKiAqICoqcmVwbyoqIC0gdG8gcmVhZCB0aGUgcmVwb3NpdG9yeVxuICAgICAqICogKiphZG1pbjpyZXBvX2hvb2sqKiAtIGlmIHlvdSBwbGFuIHRvIHVzZSB3ZWJob29rcyAodHJ1ZSBieSBkZWZhdWx0KVxuICAgICAqXG4gICAgICogQHNlZSBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vY29kZXBpcGVsaW5lL2xhdGVzdC91c2VyZ3VpZGUvR2l0SHViLWNyZWF0ZS1wZXJzb25hbC10b2tlbi1DTEkuaHRtbFxuICAgICAqL1xuICAgIGNyZWRlbnRpYWxzU2VjcmV0TmFtZTogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG93bmVyIG9mIHRoZSByZXBvc2l0b3J5IGZvciB0aGUgcGlwZWxpbmUgKEdpdEh1YiBoYW5kbGUpLlxuICAgICAqL1xuICAgIG93bmVyPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogSG93IEdpdEh1YiBzb3VyY2UgYWN0aW9uIHdpbGwgYmUgdHJpZ2dlcmVkLlxuICAgICAqL1xuICAgIHRyaWdnZXI/OiBHaXRIdWJUcmlnZ2VyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvZGVDb21taXRTb3VyY2VSZXBvc2l0b3J5XG4gICAgZXh0ZW5kcyBPbWl0PEFwcGxpY2F0aW9uUmVwb3NpdG9yeSwgXCJjcmVkZW50aWFsc1R5cGVcIiB8IFwiY3JlZGVudGlhbHNTZWNyZXROYW1lIFwiIHwgXCJyZXBvVXJsXCI+IHtcbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgQ29kZUNvbW1pdCByZXBvc2l0b3J5LlxuICAgICAqL1xuICAgIGNvZGVDb21taXRSZXBvTmFtZTogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogT3B0aW9uYWwgQ29kZUNvbW1pdFNvdXJjZU9wdGlvbnMuXG4gICAgICovXG4gICAgY29kZUNvbW1pdE9wdGlvbnM/OiBjZGtwaXBlbGluZXMuQ29kZUNvbW1pdFNvdXJjZU9wdGlvbnM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29kZVN0YXJDb25uZWN0aW9uUmVwb3NpdG9yeVxuICBleHRlbmRzIE9taXQ8XG4gICAgQXBwbGljYXRpb25SZXBvc2l0b3J5LFxuICAgICdjcmVkZW50aWFsc1R5cGUnIHwgJ2NyZWRlbnRpYWxzU2VjcmV0TmFtZSAnXG4gID4ge1xuICAvKipcbiAgICogVGhlIEFSTiBvZiB0aGUgQ29kZVN0YXIgQ29ubmVjdGlvbi5cbiAgICovXG4gIGNvZGVTdGFyQ29ubmVjdGlvbkFybjogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIG93bmVyIG9mIHRoZSByZXBvc2l0b3J5IGZvciB0aGUgcGlwZWxpbmVcbiAgICovXG4gIG93bmVyPzogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb2RlQ29tbWl0UmVwbyhcbiAgcmVwbzpcbiAgICB8IEdpdEh1YlNvdXJjZVJlcG9zaXRvcnlcbiAgICB8IENvZGVDb21taXRTb3VyY2VSZXBvc2l0b3J5XG4gICAgfCBDb2RlU3RhckNvbm5lY3Rpb25SZXBvc2l0b3J5XG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyZXBvLCAnY29kZUNvbW1pdFJlcG9OYW1lJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvZGVTdGFyQ29ubmVjdGlvbihcbiAgcmVwbzpcbiAgICB8IEdpdEh1YlNvdXJjZVJlcG9zaXRvcnlcbiAgICB8IENvZGVDb21taXRTb3VyY2VSZXBvc2l0b3J5XG4gICAgfCBDb2RlU3RhckNvbm5lY3Rpb25SZXBvc2l0b3J5XG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyZXBvLCAnY29kZVN0YXJDb25uZWN0aW9uQXJuJyk7XG4gIFxufVxuXG5cblxuLyoqXG4gKiBQcm9wcyBmb3IgdGhlIFBpcGVsaW5lLlxuICovXG5leHBvcnQgdHlwZSBQaXBlbGluZVByb3BzID0ge1xuXG4gICAgLyoqXG4gICAgICogQXBwbGljYXRpb24gbmFtZSAob3B0aW9uYWwsIGRlZmF1bHQgdG8gdGhlIGFwcCBzZXQgaW4gdGhlIGNkay5qc29uKVxuICAgICAqL1xuICAgIGFwcGxpY2F0aW9uPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgZm9yIHRoZSBwaXBlbGluZS5cbiAgICAgKi9cbiAgICBuYW1lOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgb3duZXIgb2YgdGhlIHJlcG9zaXRvcnkgZm9yIHRoZSBwaXBlbGluZSAoR2l0SHViIGhhbmRsZSkuXG4gICAgICovXG4gICAgb3duZXI/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUvRGlzYWJsZSBhbGxvd2luZyBjcm9zcy1hY2NvdW50IGRlcGxveW1lbnRzLlxuICAgICAqL1xuICAgIGNyb3NzQWNjb3VudEtleXM6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBJQU0gcG9saWNpZXMgdG8gYXR0YWNoIHRvIHRoZSBjb2RlIGJ1aWxkIHJvbGUuIFxuICAgICAqIEJ5IGRlZmF1bHQgaXQgYWxsb3dzIGFjY2VzcyBmb3IgbG9va3VwcywgaW5jbHVkaW5nIHNlY3JldCBsb29rLXVwcy5cbiAgICAgKiBQYXNzaW5nIGFuIGVtcHR5IGxpc3Qgd2lsbCByZXN1bHQgaW4gbm8gZXh0cmEtcG9saWNpZXMgcGFzc2VkIHRvIHRoZSBidWlsZCByb2xlLlxuICAgICAqIExlYXZpbmcgdGhpcyB1bnNwZWNpZmllZCB3aWxsIHJlc3VsdCBpbiB0aGUgZGVmYXVsdCBwb2xpY3kgYXBwbGllZCAobm90IHJlY29tbWVuZGVkIGZvciBwcm91ZGN0aW9uKS5cbiAgICAgKi9cbiAgICBjb2RlQnVpbGRQb2xpY2llcz86IFBvbGljeVN0YXRlbWVudFtdO1xuXG4gICAgLyoqXG4gICAgICogUmVwb3NpdG9yeSBmb3IgdGhlIHBpcGVsaW5lIChHaXRIdWIgb3IgQ29kZUNvbW1pdFJlcG9zaXRvcnkpLlxuICAgICAqL1xuICAgIHJlcG9zaXRvcnk6XG4gICAgICB8IEdpdEh1YlNvdXJjZVJlcG9zaXRvcnlcbiAgICAgIHwgQ29kZUNvbW1pdFNvdXJjZVJlcG9zaXRvcnlcbiAgICAgIHwgQ29kZVN0YXJDb25uZWN0aW9uUmVwb3NpdG9yeTtcblxuICAgIC8qKlxuICAgICAqIFBpcGVsaW5lIHN0YWdlcyBhbmQgb3B0aW9ucy5cbiAgICAgKi9cbiAgICBzdGFnZXM6IFdhdmVTdGFnZVtdO1xuXG4gICAgLyoqXG4gICAgICogV2F2ZXMgZm9yIHRoZSBwaXBlbGluZS4gU3RhZ2VzIGluc2lkZSB0aGUgd2F2ZSBhcmUgZXhlY3V0ZWQgaW4gcGFyYWxsZWwuXG4gICAgICovXG4gICAgd2F2ZXM6IFBpcGVsaW5lV2F2ZVtdO1xufVxuXG4vKipcbiAqIFN0YWNrIHN0YWdlIGlzIGEgYnVpbGRlciBjb25zdHJ1Y3QgdG8gYWxsb3cgYWRkaW5nIHN0YWdlcyB0byBhIHBpcGVsaW5lLiBFYWNoIHN0YWdlIGlzIGV4cGVjdGVkIHRvIHByb2R1Y2UgYSBzdGFjay5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGFja1N0YWdlIHtcbiAgICAvKipcbiAgICAgKiBpZCBvZiB0aGUgc3RhZ2VcbiAgICAgKi9cbiAgICBpZDogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogQnVpbGRlciB0aGF0IGNhbiBwcm9kdWNlIGEgc3RhY2sgd2hpY2ggd2lsbCBiZSBkZXBsb3llZCBhcyBwYXJ0IG9mIHRoZSBzdGFnZVxuICAgICAqL1xuICAgIHN0YWNrQnVpbGRlcjogU3RhY2tCdWlsZGVyO1xuXG4gICAgLyoqXG4gICAgICogT3B0aW9uYWwgc3RhZ2UgcHJvcGVydGllcywgc3VjaCBhcyB7bWFudWFsQXBwcm92YWxzOiB0cnVlfSB3aGljaCBjYW4gY29udHJvbCBzdGFnZSB0cmFuc2l0aW9ucy5cbiAgICAgKi9cbiAgICBzdGFnZVByb3BzPzogY2RrcGlwZWxpbmVzLkFkZFN0YWdlT3B0cztcbn1cblxuLyoqXG4gKiBJbnRlcm5hbCBpbnRlcmZhY2UgZm9yIHdhdmUgc3RhZ2VzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV2F2ZVN0YWdlIGV4dGVuZHMgU3RhY2tTdGFnZSB7XG4gICAgLyoqXG4gICAgICogV2F2ZSBpZCBpZiB0aGlzIHN0YWdlIGlzIHBhcnQgb2YgYSB3YXZlLiBOb3QgcmVxdWlyZWQgaWYgc3RhZ2UgaXMgc3VwcGxpZWRcbiAgICAgKi9cbiAgICB3YXZlSWQ/OiBzdHJpbmcsXG59XG5cbi8qKlxuICogUmVwcmVzZW50cyB3YXZlIGNvbmZpZ3VyYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQaXBlbGluZVdhdmUge1xuXG4gICAgaWQ6IHN0cmluZyxcblxuICAgIHN0YWdlczogU3RhY2tTdGFnZVtdLFxuXG4gICAgcHJvcHM/OiBjZGtwaXBlbGluZXMuV2F2ZVByb3BzXG59XG5cbi8qKlxuICogRGVmYXVsdCBwb2xpY3kgZm9yIHRoZSBDb2RlQnVpbGQgcm9sZSBnZW5lcmF0ZWQuIFxuICogSXQgYWxsb3dzIGxvb2stdXBzLCBpbmNsdWRpbmcgYWNjZXNzIHRvIEFXUyBTZWNyZXRzIE1hbmFnZXIuIFxuICogTm90IHJlY29tbWVuZGVkIGZvciBwcm9kdWN0aW9uLiBGb3IgcHJvZHVjdGlvbiB1c2UgY2FzZSwgQ29kZUJ1aWxkIHBvbGljaWVzIFxuICogbXVzdCBiZSByZXN0cmljdGVkIHRvIHBhcnRpY3VsYXIgcmVzb3VyY2VzLiBPdXRib3VuZCBhY2Nlc3MgZnJvbSB0aGUgYnVpbGQgc2hvdWxkIGJlIFxuICogY29udHJvbGxlZCBieSBBQ0wuXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0JVSUxEX1BPTElDSUVTID0gWyBuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gICAgYWN0aW9uczogWyAgICBcbiAgICAgICAgXCJzdHM6QXNzdW1lUm9sZVwiLFxuICAgICAgICBcInNlY3JldHNtYW5hZ2VyOkdldFNlY3JldFZhbHVlXCIsXG4gICAgICAgIFwic2VjcmV0c21hbmFnZXI6RGVzY3JpYmVTZWNyZXRcIixcbiAgICAgICAgXCJjbG91ZGZvcm1hdGlvbjoqXCIsXG4gICAgICAgIFwiZWtzOkRlc2NyaWJlQWRkb25WZXJzaW9uc1wiXG4gICAgXVxufSldO1xuXG4vKipcbiAqIEJ1aWxkZXIgZm9yIENvZGVQaXBlbGluZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvZGVQaXBlbGluZUJ1aWxkZXIgaW1wbGVtZW50cyBTdGFja0J1aWxkZXIge1xuXG4gICAgcHJpdmF0ZSBwcm9wczogUGFydGlhbDxQaXBlbGluZVByb3BzPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnByb3BzID0geyBjcm9zc0FjY291bnRLZXlzOiBmYWxzZSwgc3RhZ2VzOiBbXSwgd2F2ZXM6IFtdfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXBwbGljYXRpb24oYXBwOiBzdHJpbmcpOiBDb2RlUGlwZWxpbmVCdWlsZGVyIHtcbiAgICAgIHRoaXMucHJvcHMuYXBwbGljYXRpb24gPSBhcHA7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgbmFtZShuYW1lOiBzdHJpbmcpOiBDb2RlUGlwZWxpbmVCdWlsZGVyIHtcbiAgICAgICAgdGhpcy5wcm9wcy5uYW1lID0gbmFtZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIG93bmVyKG93bmVyOiBzdHJpbmcpIDogQ29kZVBpcGVsaW5lQnVpbGRlciB7XG4gICAgICAgIHRoaXMucHJvcHMub3duZXIgPSBvd25lcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRm9yIHByb2R1Y3Rpb24gdXNlIGNhc2VzLCBtYWtlIHN1cmUgYWxsIHBvbGljaWVzIGFyZSB0aWVkIHRvIGNvbmNyZXRlIHJlc291cmNlcy5cbiAgICAgKiBAcGFyYW0gcG9saWNpZXMgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHVibGljIGNvZGVCdWlsZFBvbGljaWVzKHBvbGljaWVzOiBQb2xpY3lTdGF0ZW1lbnRbXSkgOiBDb2RlUGlwZWxpbmVCdWlsZGVyIHtcbiAgICAgICAgdGhpcy5wcm9wcy5jb2RlQnVpbGRQb2xpY2llcyA9IHBvbGljaWVzO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gXG4gICAgcHVibGljIGVuYWJsZUNyb3NzQWNjb3VudEtleXMoKSA6IENvZGVQaXBlbGluZUJ1aWxkZXIge1xuICAgICAgICB0aGlzLnByb3BzLmNyb3NzQWNjb3VudEtleXMgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgcHVibGljIHJlcG9zaXRvcnkoXG4gICAgcmVwbzpcbiAgICAgIHwgR2l0SHViU291cmNlUmVwb3NpdG9yeVxuICAgICAgfCBDb2RlQ29tbWl0U291cmNlUmVwb3NpdG9yeVxuICAgICAgfCBDb2RlU3RhckNvbm5lY3Rpb25SZXBvc2l0b3J5XG4gICk6IENvZGVQaXBlbGluZUJ1aWxkZXIge1xuICAgIHRoaXMucHJvcHMucmVwb3NpdG9yeSA9IHJlcG8gYXMgR2l0SHViU291cmNlUmVwb3NpdG9yeTtcbiAgICBpZiAoaXNDb2RlQ29tbWl0UmVwbyhyZXBvKSkge1xuICAgICAgdGhpcy5wcm9wcy5yZXBvc2l0b3J5ID0gcmVwbyBhcyBDb2RlQ29tbWl0U291cmNlUmVwb3NpdG9yeTtcbiAgICB9XG4gICAgaWYgKGlzQ29kZVN0YXJDb25uZWN0aW9uKHJlcG8pKSB7XG4gICAgICB0aGlzLnByb3BzLnJlcG9zaXRvcnkgPSByZXBvIGFzIENvZGVTdGFyQ29ubmVjdGlvblJlcG9zaXRvcnk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHN0YW5kYWxvbmUgcGlwZWxpbmUgc3RhZ2VzIChpbiB0aGUgb3JkZXIgb2YgaW52b2NhdGlvbiBhbmQgZWxlbWVudHMgaW4gdGhlIGlucHV0IGFycmF5KVxuICAgICAqIEBwYXJhbSBzdGFja1N0YWdlc1xuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHVibGljIHN0YWdlKC4uLnN0YWNrU3RhZ2VzOiBTdGFja1N0YWdlW10pIDogQ29kZVBpcGVsaW5lQnVpbGRlciB7XG4gICAgICAgIHN0YWNrU3RhZ2VzLmZvckVhY2goc3RhZ2UgPT4gdGhpcy5wcm9wcy5zdGFnZXMhLnB1c2goc3RhZ2UpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyB3YXZlKHMpIGluIHRoZSBvcmRlciBzcGVjaWZpZWQuIEFsbCBzdGFnZXMgaW4gdGhlIHdhdmUgY2FuIGJlIGV4ZWN1dGVkIGluIHBhcmFsbGVsLCB3aGlsZSBzdGFuZGFsb25lIHN0YWdlcyBhcmUgZXhlY3V0ZWQgc2VxdWVudGlhbGx5LlxuICAgICAqIEBwYXJhbSB3YXZlc1xuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgcHVibGljIHdhdmUoLi4ud2F2ZXM6IFBpcGVsaW5lV2F2ZVtdKSA6IENvZGVQaXBlbGluZUJ1aWxkZXIge1xuICAgICAgICB3YXZlcy5mb3JFYWNoKHdhdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy53YXZlcyEucHVzaCh3YXZlKTtcbiAgICAgICAgICAgIHdhdmUuc3RhZ2VzLmZvckVhY2goc3RhZ2UgPT4gdGhpcy5wcm9wcy5zdGFnZXM/LnB1c2goey4uLnN0YWdlLCAuLi57IHdhdmVJZDogd2F2ZS5pZH19KSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBidWlsZChzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBzdGFja1Byb3BzPzogY2RrLlN0YWNrUHJvcHMpOiBjZGsuU3RhY2sge1xuICAgICAgYXNzZXJ0KFxuICAgICAgICB0aGlzLnByb3BzLm5hbWUsXG4gICAgICAgICduYW1lIGZpZWxkIGlzIHJlcXVpcmVkIGZvciB0aGUgcGlwZWxpbmUgc3RhY2suIFBsZWFzZSBwcm92aWRlIHZhbHVlLidcbiAgICAgICk7XG4gICAgICBhc3NlcnQoXG4gICAgICAgIHRoaXMucHJvcHMuc3RhZ2VzLFxuICAgICAgICAnU3RhZ2UgZmllbGQgaXMgcmVxdWlyZWQgZm9yIHRoZSBwaXBlbGluZSBzdGFjay4gUGxlYXNlIHByb3ZpZGUgdmFsdWUuJ1xuICAgICAgKTtcbiAgICAgIGlmICh0aGlzLnByb3BzLnJlcG9zaXRvcnkpIHtcbiAgICAgICAgbGV0IGdpdEh1YlJlcG8gPSB0aGlzLnByb3BzLnJlcG9zaXRvcnkgYXMgR2l0SHViU291cmNlUmVwb3NpdG9yeTtcbiAgICAgICAgaWYgKCFpc0NvZGVDb21taXRSZXBvKHRoaXMucHJvcHMucmVwb3NpdG9yeSkpIHtcbiAgICAgICAgICBhc3NlcnQoXG4gICAgICAgICAgICB0aGlzLnByb3BzLm93bmVyIHx8IGdpdEh1YlJlcG8ub3duZXIsXG4gICAgICAgICAgICAncmVwb3NpdG9yeS5vd25lciBmaWVsZCBpcyByZXF1aXJlZCBmb3IgdGhlIEdpdEh1YiBvciBDb2RlU3RhciBjb25uZWN0aW9uIHBpcGVsaW5lIHN0YWNrLiBQbGVhc2UgcHJvdmlkZSB2YWx1ZS4nXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgZnVsbFByb3BzID0gdGhpcy5wcm9wcyBhcyBQaXBlbGluZVByb3BzO1xuICAgICAgcmV0dXJuIG5ldyBDb2RlUGlwZWxpbmVTdGFjayhzY29wZSwgZnVsbFByb3BzLCBpZCwgc3RhY2tQcm9wcyk7XG4gICAgfVxufVxuXG5cbi8qKlxuICogUGlwZWxpbmUgc3RhY2sgaXMgZ2VuZXJhdGluZyBhIHNlbGYtbXV0YXRpbmcgcGlwZWxpbmUgdG8gZmFjaWxpYXRlIGZ1bGwgQ0kvQ0QgZXhwZXJpZW5jZSB3aXRoIHRoZSBwbGF0Zm9ybVxuICogZm9yIGluZnJhc3RydWN0dXJlIGNoYW5nZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb2RlUGlwZWxpbmVTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG5cbiAgICBzdGF0aWMgcmVhZG9ubHkgVVNBR0VfSUQgPSBcInFzLTFzMXI0NjVrNlwiO1xuICAgIHN0YXRpYyByZWFkb25seSBVU0FHRV9JRF9NVUxUSV9BQ0NPVU5UID0gXCJxcy0xczFyNDY1ZjJcIjtcblxuICAgIHN0YXRpYyBidWlsZGVyKCkge1xuICAgICAgICByZXR1cm4gbmV3IENvZGVQaXBlbGluZUJ1aWxkZXIoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBwaXBlbGluZVByb3BzOiBQaXBlbGluZVByb3BzLCBpZDogc3RyaW5nLCAgcHJvcHM/OiBTdGFja1Byb3BzKSB7XG4gICAgICAgIGlmIChwaXBlbGluZVByb3BzLmNyb3NzQWNjb3VudEtleXMpe1xuICAgICAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCB3aXRoVXNhZ2VUcmFja2luZyhDb2RlUGlwZWxpbmVTdGFjay5VU0FHRV9JRF9NVUxUSV9BQ0NPVU5ULCBwcm9wcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCB3aXRoVXNhZ2VUcmFja2luZyhDb2RlUGlwZWxpbmVTdGFjay5VU0FHRV9JRCwgcHJvcHMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBpcGVsaW5lID0gQ29kZVBpcGVsaW5lLmJ1aWxkKHRoaXMsIHBpcGVsaW5lUHJvcHMpO1xuXG4gICAgICAgIGxldCBwcm9taXNlcyA6IFByb21pc2U8QXBwbGljYXRpb25TdGFnZT5bXSA9IFtdO1xuXG4gICAgICAgIGZvcihsZXQgc3RhZ2Ugb2YgcGlwZWxpbmVQcm9wcy5zdGFnZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGFwcFN0YWdlID0gbmV3IEFwcGxpY2F0aW9uU3RhZ2UodGhpcywgc3RhZ2UuaWQsIHN0YWdlLnN0YWNrQnVpbGRlcik7XG4gICAgICAgICAgICBwcm9taXNlcy5wdXNoKGFwcFN0YWdlLndhaXRGb3JBc3luY1Rhc2tzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oc3RhZ2VzID0+IHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50V2F2ZSA6IGNka3BpcGVsaW5lcy5XYXZlIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBmb3IobGV0IGkgaW4gc3RhZ2VzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhZ2UgPSBwaXBlbGluZVByb3BzLnN0YWdlc1tpXTtcbiAgICAgICAgICAgICAgICBpZihzdGFnZS53YXZlSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoY3VycmVudFdhdmUgPT0gbnVsbCB8fCBjdXJyZW50V2F2ZS5pZCAhPSBzdGFnZS53YXZlSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHdhdmVQcm9wcyA9IHBpcGVsaW5lUHJvcHMud2F2ZXMuZmluZCh3YXZlID0+IHdhdmUuaWQgPT09IHN0YWdlLndhdmVJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQod2F2ZVByb3BzLCBgU3BlY2lmaWVkIHdhdmUgJHtzdGFnZS53YXZlSWR9IGlzIG5vdCBmb3VuZCBpbiB0aGUgcGlwZWxpbmUgZGVmaW5pdGlvbiAke2lkfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFdhdmUgPSBwaXBlbGluZS5hZGRXYXZlKHN0YWdlLndhdmVJZCwgeyAuLi53YXZlUHJvcHMucHJvcHMgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFdhdmUuYWRkU3RhZ2Uoc3RhZ2VzW2ldLCBzdGFnZS5zdGFnZVByb3BzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVsaW5lLmFkZFN0YWdlKHN0YWdlc1tpXSwgc3RhZ2Uuc3RhZ2VQcm9wcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uU3RhZ2UgZXh0ZW5kcyBjZGsuU3RhZ2Uge1xuXG4gICAgcHJpdmF0ZSBhc3luY1Rhc2s6IFByb21pc2U8YW55PjtcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuU3RhY2ssIGlkOiBzdHJpbmcsIGJ1aWxkZXI6IFN0YWNrQnVpbGRlciB8IEFzeW5jU3RhY2tCdWlsZGVyLCBwcm9wcz86IGNkay5TdGFnZVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuICAgICAgICBpZigoPEFzeW5jU3RhY2tCdWlsZGVyPmJ1aWxkZXIpLmJ1aWxkQXN5bmMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5hc3luY1Rhc2sgPSAoPEFzeW5jU3RhY2tCdWlsZGVyPmJ1aWxkZXIpLmJ1aWxkQXN5bmModGhpcywgYCR7aWR9LWJsdWVwcmludGAsIHByb3BzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGJ1aWxkZXIuYnVpbGQodGhpcywgYCR7aWR9LWJsdWVwcmludGAsIHByb3BzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyB3YWl0Rm9yQXN5bmNUYXNrcygpIDogUHJvbWlzZTxBcHBsaWNhdGlvblN0YWdlPiB7XG4gICAgICAgIGlmKHRoaXMuYXN5bmNUYXNrKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hc3luY1Rhc2sudGhlbigoKT0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcyk7XG4gICAgfVxufVxuXG4vKipcbiAqIENvZGVQaXBlbGluZSBkZXBsb3lzIGEgbmV3IENvZGVQaXBlbGluZSByZXNvdXJjZSB0aGF0IGlzIGludGVncmF0ZWQgd2l0aCBhIEdpdEh1YiByZXBvc2l0b3J5LlxuICovXG5jbGFzcyBDb2RlUGlwZWxpbmUge1xuXG4gICAgcHVibGljIHN0YXRpYyBidWlsZChzY29wZTogQ29uc3RydWN0LCBwcm9wczogUGlwZWxpbmVQcm9wcykgOiBjZGtwaXBlbGluZXMuQ29kZVBpcGVsaW5lIHtcbiAgICAgICAgbGV0IGNvZGVQaXBlbGluZVNvdXJjZSA6IGNka3BpcGVsaW5lcy5Db2RlUGlwZWxpbmVTb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICAgICAgY2FzZSBpc0NvZGVDb21taXRSZXBvKHByb3BzLnJlcG9zaXRvcnkpOntcbiAgICAgICAgICAgIGxldCBjb2RlQ29tbWl0UmVwbyA9IHByb3BzLnJlcG9zaXRvcnkgYXMgQ29kZUNvbW1pdFNvdXJjZVJlcG9zaXRvcnk7XG4gICAgICAgICAgICBjb2RlUGlwZWxpbmVTb3VyY2UgPSBjZGtwaXBlbGluZXMuQ29kZVBpcGVsaW5lU291cmNlLmNvZGVDb21taXQoXG4gICAgICAgICAgICAgIGNvZGVjb21taXQuUmVwb3NpdG9yeS5mcm9tUmVwb3NpdG9yeU5hbWUoXG4gICAgICAgICAgICAgICAgc2NvcGUsXG4gICAgICAgICAgICAgICAgJ2Nkay1la3MtYmx1ZXByaW50cycsXG4gICAgICAgICAgICAgICAgY29kZUNvbW1pdFJlcG8uY29kZUNvbW1pdFJlcG9OYW1lXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIGNvZGVDb21taXRSZXBvLnRhcmdldFJldmlzaW9uID8/ICdtYXN0ZXInLFxuICAgICAgICAgICAgICBjb2RlQ29tbWl0UmVwby5jb2RlQ29tbWl0T3B0aW9uc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIGlzQ29kZVN0YXJDb25uZWN0aW9uKHByb3BzLnJlcG9zaXRvcnkpOntcbiAgICAgICAgICAgIGxldCBjb2RlU3RhckNvbm5lY3Rpb24gPVxuICAgICAgICAgICAgICBwcm9wcy5yZXBvc2l0b3J5IGFzIENvZGVTdGFyQ29ubmVjdGlvblJlcG9zaXRvcnk7XG4gICAgICAgICAgICBjb25zdCByZXBvT3duZXIgPSBjb2RlU3RhckNvbm5lY3Rpb24ub3duZXIgPz8gcHJvcHMub3duZXI7XG4gICAgICAgICAgICBjb2RlUGlwZWxpbmVTb3VyY2UgPSBjZGtwaXBlbGluZXMuQ29kZVBpcGVsaW5lU291cmNlLmNvbm5lY3Rpb24oXG4gICAgICAgICAgICAgIGAke3JlcG9Pd25lcn0vJHtjb2RlU3RhckNvbm5lY3Rpb24ucmVwb1VybH1gLFxuICAgICAgICAgICAgICBjb2RlU3RhckNvbm5lY3Rpb24udGFyZ2V0UmV2aXNpb24gPz8gJ21haW4nLFxuICAgICAgICAgICAgICB7IGNvbm5lY3Rpb25Bcm46IGNvZGVTdGFyQ29ubmVjdGlvbi5jb2RlU3RhckNvbm5lY3Rpb25Bcm4gfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRlZmF1bHQ6e1xuICAgICAgICAgICAgbGV0IGdpdEh1YlJlcG8gPSBwcm9wcy5yZXBvc2l0b3J5IGFzIEdpdEh1YlNvdXJjZVJlcG9zaXRvcnk7XG4gICAgICAgICAgICBsZXQgZ2l0aHViUHJvcHM6IGNka3BpcGVsaW5lcy5HaXRIdWJTb3VyY2VPcHRpb25zID0ge307XG4gICAgICAgICAgICBjb25zdCBnaXRIdWJPd25lciA9IGdpdEh1YlJlcG8ub3duZXIgPz8gcHJvcHMub3duZXI7XG5cbiAgICAgICAgICAgIGlmIChnaXRIdWJSZXBvLmNyZWRlbnRpYWxzU2VjcmV0TmFtZSkge1xuICAgICAgICAgICAgICBnaXRodWJQcm9wcyA9IHtcbiAgICAgICAgICAgICAgICBhdXRoZW50aWNhdGlvbjogY2RrLlNlY3JldFZhbHVlLnNlY3JldHNNYW5hZ2VyKFxuICAgICAgICAgICAgICAgICAgZ2l0SHViUmVwby5jcmVkZW50aWFsc1NlY3JldE5hbWUhXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvZGVQaXBlbGluZVNvdXJjZSA9IGNka3BpcGVsaW5lcy5Db2RlUGlwZWxpbmVTb3VyY2UuZ2l0SHViKFxuICAgICAgICAgICAgICBgJHtnaXRIdWJPd25lcn0vJHtnaXRIdWJSZXBvLnJlcG9Vcmx9YCxcbiAgICAgICAgICAgICAgZ2l0SHViUmVwby50YXJnZXRSZXZpc2lvbiA/PyAnbWFpbicsXG4gICAgICAgICAgICAgIHsgXG4gICAgICAgICAgICAgICAgLi4uZ2l0aHViUHJvcHMsXG4gICAgICAgICAgICAgICAgdHJpZ2dlcjogZ2l0SHViUmVwby50cmlnZ2VyID8/IEdpdEh1YlRyaWdnZXIuV0VCSE9PSyxcblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXBwID0gcHJvcHMuYXBwbGljYXRpb24gPyBgLS1hcHAgJyR7cHJvcHMuYXBwbGljYXRpb259J2AgOiBcIlwiO1xuXG4gICAgICAgIGNvbnN0IHBhdGggPSBwcm9wcy5yZXBvc2l0b3J5LnBhdGggPz8gXCIuL1wiO1xuXG4gICAgICAgIHJldHVybiBuZXcgY2RrcGlwZWxpbmVzLkNvZGVQaXBlbGluZShzY29wZSwgcHJvcHMubmFtZSwge1xuICAgICAgICAgICAgcGlwZWxpbmVOYW1lOiBwcm9wcy5uYW1lLFxuICAgICAgICAgICAgc3ludGg6IG5ldyBjZGtwaXBlbGluZXMuU2hlbGxTdGVwKGAke3Byb3BzLm5hbWV9LXN5bnRoYCwge1xuICAgICAgICAgICAgICBpbnB1dDogY29kZVBpcGVsaW5lU291cmNlLFxuICAgICAgICAgICAgICBwcmltYXJ5T3V0cHV0RGlyZWN0b3J5OiBgJHtwYXRofS9jZGsub3V0YCxcbiAgICAgICAgICAgICAgaW5zdGFsbENvbW1hbmRzOiBbXG4gICAgICAgICAgICAgICAgJ24gc3RhYmxlJyxcbiAgICAgICAgICAgICAgICAnbnBtIGluc3RhbGwgLWcgYXdzLWNka0AyLjE0Ny4zJyxcbiAgICAgICAgICAgICAgICBgY2QgJENPREVCVUlMRF9TUkNfRElSLyR7cGF0aH0gJiYgbnBtIGluc3RhbGxgXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIGNvbW1hbmRzOiBbYGNkICRDT0RFQlVJTERfU1JDX0RJUi8ke3BhdGh9YCwgJ25wbSBydW4gYnVpbGQnLCAnbnB4IGNkayBzeW50aCAnICsgYXBwXVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjcm9zc0FjY291bnRLZXlzOiBwcm9wcy5jcm9zc0FjY291bnRLZXlzLFxuICAgICAgICAgICAgY29kZUJ1aWxkRGVmYXVsdHM6IHtcbiAgICAgICAgICAgICAgICByb2xlUG9saWN5OiBwcm9wcy5jb2RlQnVpbGRQb2xpY2llcyAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcbiAgICAgICAgICB9KTtcbiAgICB9XG59Il19