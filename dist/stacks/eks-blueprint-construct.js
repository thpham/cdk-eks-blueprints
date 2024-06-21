"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EksBlueprintConstruct = exports.BlueprintConstructBuilder = exports.BlueprintPropsConstraints = exports.EksBlueprintProps = exports.ControlPlaneLogType = exports.DEFAULT_VERSION = void 0;
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
Object.defineProperty(exports, "ControlPlaneLogType", { enumerable: true, get: function () { return aws_eks_1.ClusterLoggingTypes; } });
const constructs_1 = require("constructs");
const mng_cluster_provider_1 = require("../cluster-providers/mng-cluster-provider");
const vpc_1 = require("../resource-providers/vpc");
const spi = require("../spi");
const constraints = require("../utils/constraints-utils");
const utils = require("../utils");
const utils_1 = require("../utils");
const kms_key_1 = require("../resource-providers/kms-key");
const argo_gitops_factory_1 = require("../addons/argocd/argo-gitops-factory");
/* Default K8s version of EKS Blueprints */
exports.DEFAULT_VERSION = aws_eks_1.KubernetesVersion.V1_29;
class EksBlueprintProps {
    constructor() {
        /**
         * Add-ons if any.
         */
        this.addOns = [];
        /**
         * Teams if any
         */
        this.teams = [];
        /**
         * EC2 or Fargate are supported in the blueprint but any implementation conforming the interface
         * will work
         */
        this.clusterProvider = new mng_cluster_provider_1.MngClusterProvider();
        /**
         * Named resource providers to leverage for cluster resources.
         * The resource can represent Vpc, Hosting Zones or other resources, see {@link spi.ResourceType}.
         * VPC for the cluster can be registered under the name of 'vpc' or as a single provider of type
         */
        this.resourceProviders = new Map();
        /**
         * If set to true and no resouce provider for KMS key is defined (under GlobalResources.KmsKey),
         * a default KMS encryption key will be used for envelope encryption of Kubernetes secrets (AWS managed new KMS key).
         * If set to false, and no resouce provider for KMS key is defined (under GlobalResources.KmsKey), then no secrets
         * encyrption is applied.
         *
         * Default is true.
         */
        this.useDefaultSecretEncryption = true;
    }
}
exports.EksBlueprintProps = EksBlueprintProps;
class BlueprintPropsConstraints {
    constructor() {
        /**
         * id can be no less than 1 character long, and no greater than 63 characters long.
         * https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
         */
        this.id = new constraints.StringConstraint(1, 63);
        /**
         * name can be no less than 1 character long, and no greater than 63 characters long.
         * https://kubernetes.io/docs/concepts/overview/working-with-objects/names/
         */
        this.name = new constraints.StringConstraint(1, 63);
    }
}
exports.BlueprintPropsConstraints = BlueprintPropsConstraints;
/**
 * Blueprint builder implements a builder pattern that improves readability (no bloated constructors)
 * and allows creating a blueprint in an abstract state that can be applied to various instantiations
 * in accounts and regions.
 */
class BlueprintConstructBuilder {
    constructor() {
        this.props = { addOns: new Array(), teams: new Array(), resourceProviders: new Map() };
        this.env = {
            account: process.env.CDK_DEFAULT_ACCOUNT,
            region: process.env.CDK_DEFAULT_REGION
        };
    }
    name(name) {
        this.props = { ...this.props, ...{ name } };
        return this;
    }
    account(account) {
        this.env.account = account;
        return this;
    }
    region(region) {
        this.env.region = region;
        return this;
    }
    version(version) {
        this.props = { ...this.props, ...{ version: version } };
        return this;
    }
    enableControlPlaneLogTypes(...types) {
        this.props = { ...this.props, ...{ enableControlPlaneLogTypes: types } };
        return this;
    }
    enableGitOps(mode) {
        this.props = { ...this.props, ...{ enableGitOpsMode: mode !== null && mode !== void 0 ? mode : spi.GitOpsMode.APP_OF_APPS } };
        return this;
    }
    withBlueprintProps(props) {
        const resourceProviders = this.props.resourceProviders;
        this.props = { ...this.props, ...(0, utils_1.cloneDeep)(props) };
        if (props.resourceProviders) {
            this.props.resourceProviders = new Map([...resourceProviders.entries(), ...props.resourceProviders.entries()]);
        }
        return this;
    }
    addOns(...addOns) {
        var _a;
        this.props = { ...this.props, ...{ addOns: (_a = this.props.addOns) === null || _a === void 0 ? void 0 : _a.concat(addOns) } };
        return this;
    }
    clusterProvider(clusterProvider) {
        this.props = { ...this.props, ...{ clusterProvider: clusterProvider } };
        return this;
    }
    id(id) {
        this.props = { ...this.props, ...{ id } };
        return this;
    }
    teams(...teams) {
        var _a;
        this.props = { ...this.props, ...{ teams: (_a = this.props.teams) === null || _a === void 0 ? void 0 : _a.concat(teams) } };
        return this;
    }
    resourceProvider(name, provider) {
        var _a;
        (_a = this.props.resourceProviders) === null || _a === void 0 ? void 0 : _a.set(name, provider);
        return this;
    }
    useDefaultSecretEncryption(useDefault) {
        this.props = { ...this.props, ...{ useDefaultSecretEncryption: useDefault } };
        return this;
    }
    withEnv(env) {
        this.env.account = env.account;
        this.env.region = env.region;
        return this;
    }
}
exports.BlueprintConstructBuilder = BlueprintConstructBuilder;
/**
 * Entry point to the platform provisioning. Creates a CFN stack based on the provided configuration
 * and orchestrates provisioning of add-ons, teams and post deployment hooks.
 */
class EksBlueprintConstruct extends constructs_1.Construct {
    constructor(scope, blueprintProps) {
        var _a, _b, _c;
        super(scope, blueprintProps.id);
        this.validateInput(blueprintProps);
        const resourceContext = this.provideNamedResources(blueprintProps);
        let vpcResource = resourceContext.get(spi.GlobalResources.Vpc);
        if (!vpcResource) {
            vpcResource = resourceContext.add(spi.GlobalResources.Vpc, new vpc_1.VpcProvider());
        }
        let version = blueprintProps.version;
        if (version == "auto") {
            version = exports.DEFAULT_VERSION;
        }
        let kmsKeyResource = resourceContext.get(spi.GlobalResources.KmsKey);
        if (!kmsKeyResource && blueprintProps.useDefaultSecretEncryption != false) {
            kmsKeyResource = resourceContext.add(spi.GlobalResources.KmsKey, new kms_key_1.CreateKmsKeyProvider());
        }
        blueprintProps = this.resolveDynamicProxies(blueprintProps, resourceContext);
        const clusterProvider = (_a = blueprintProps.clusterProvider) !== null && _a !== void 0 ? _a : new mng_cluster_provider_1.MngClusterProvider({
            id: `${(_b = blueprintProps.name) !== null && _b !== void 0 ? _b : blueprintProps.id}-ng`,
            version
        });
        this.clusterInfo = clusterProvider.createCluster(this, vpcResource, kmsKeyResource, version, blueprintProps.enableControlPlaneLogTypes);
        this.clusterInfo.setResourceContext(resourceContext);
        if (blueprintProps.enableGitOpsMode == spi.GitOpsMode.APPLICATION) {
            argo_gitops_factory_1.ArgoGitOpsFactory.enableGitOps();
        }
        else if (blueprintProps.enableGitOpsMode == spi.GitOpsMode.APP_OF_APPS) {
            argo_gitops_factory_1.ArgoGitOpsFactory.enableGitOpsAppOfApps();
        }
        const postDeploymentSteps = Array();
        for (let addOn of ((_c = blueprintProps.addOns) !== null && _c !== void 0 ? _c : [])) { // must iterate in the strict order
            const result = addOn.deploy(this.clusterInfo);
            if (result) {
                const addOnKey = utils.getAddOnNameOrId(addOn);
                this.clusterInfo.addScheduledAddOn(addOnKey, result, utils.isOrderedAddOn(addOn));
            }
            const postDeploy = addOn;
            if (postDeploy.postDeploy !== undefined) {
                postDeploymentSteps.push(postDeploy);
            }
        }
        const scheduledAddOns = this.clusterInfo.getAllScheduledAddons();
        const addOnKeys = [...scheduledAddOns.keys()];
        const promises = scheduledAddOns.values();
        this.asyncTasks = Promise.all(promises).then((constructs) => {
            var _a;
            constructs.forEach((construct, index) => {
                this.clusterInfo.addProvisionedAddOn(addOnKeys[index], construct);
            });
            if (blueprintProps.teams != null) {
                for (let team of blueprintProps.teams) {
                    team.setup(this.clusterInfo);
                }
            }
            for (let step of postDeploymentSteps) {
                step.postDeploy(this.clusterInfo, (_a = blueprintProps.teams) !== null && _a !== void 0 ? _a : []);
            }
        });
        this.asyncTasks.catch(err => {
            console.error(err);
            throw new Error(err);
        });
    }
    /**
     * Since constructor cannot be marked as async, adding a separate method to wait
     * for async code to finish.
     * @returns Promise that resolves to the blueprint
     */
    async waitForAsyncTasks() {
        if (this.asyncTasks) {
            return this.asyncTasks.then(() => {
                return this;
            });
        }
        return Promise.resolve(this);
    }
    /**
     * This method returns all the constructs produced by during the cluster creation (e.g. add-ons).
     * May be used in testing for verification.
     * @returns Async Tasks object
     */
    getAsyncTasks() {
        return this.asyncTasks;
    }
    /**
     * This method returns all the constructs produced by during the cluster creation (e.g. add-ons).
     * May be used in testing for verification.
     * @returns cluster info object
     */
    getClusterInfo() {
        return this.clusterInfo;
    }
    provideNamedResources(blueprintProps) {
        var _a;
        const result = new spi.ResourceContext(this, blueprintProps);
        for (let [key, value] of (_a = blueprintProps.resourceProviders) !== null && _a !== void 0 ? _a : []) {
            result.add(key, value);
        }
        return result;
    }
    /**
     * Resolves all dynamic proxies, that substitutes resource provider proxies with the resolved values.
     * @param blueprintProps
     * @param resourceContext
     * @returns a copy of blueprint props with resolved values
     */
    resolveDynamicProxies(blueprintProps, resourceContext) {
        return utils.cloneDeep(blueprintProps, (value) => {
            return utils.resolveTarget(value, resourceContext);
        });
    }
    /**
     * Validates input against basic defined constraints.
     * @param blueprintProps
     */
    validateInput(blueprintProps) {
        const teamNames = new Set();
        constraints.validateConstraints(new BlueprintPropsConstraints, EksBlueprintProps.name, blueprintProps);
        if (blueprintProps.teams) {
            blueprintProps.teams.forEach(e => {
                if (teamNames.has(e.name)) {
                    throw new Error(`Team ${e.name} is registered more than once`);
                }
                teamNames.add(e.name);
            });
        }
    }
}
exports.EksBlueprintConstruct = EksBlueprintConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWtzLWJsdWVwcmludC1jb25zdHJ1Y3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvc3RhY2tzL2Vrcy1ibHVlcHJpbnQtY29uc3RydWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLGlEQUFvRztBQWtCM0Ysb0dBbEJ1Qiw2QkFBbUIsT0FrQnZCO0FBakI1QiwyQ0FBdUM7QUFDdkMsb0ZBQStFO0FBQy9FLG1EQUF3RDtBQUN4RCw4QkFBOEI7QUFDOUIsMERBQTBEO0FBQzFELGtDQUFrQztBQUNsQyxvQ0FBcUM7QUFFckMsMkRBQW1FO0FBQ25FLDhFQUF5RTtBQUV6RSwyQ0FBMkM7QUFDOUIsUUFBQSxlQUFlLEdBQUcsMkJBQWlCLENBQUMsS0FBSyxDQUFDO0FBT3ZELE1BQWEsaUJBQWlCO0lBQTlCO1FBV0k7O1dBRUc7UUFDTSxXQUFNLEdBQTZCLEVBQUUsQ0FBQztRQUUvQzs7V0FFRztRQUNNLFVBQUssR0FBcUIsRUFBRSxDQUFDO1FBRXRDOzs7V0FHRztRQUNNLG9CQUFlLEdBQXlCLElBQUkseUNBQWtCLEVBQUUsQ0FBQztRQU8xRTs7OztXQUlHO1FBQ0gsc0JBQWlCLEdBQXVDLElBQUksR0FBRyxFQUFFLENBQUM7UUFRbEU7Ozs7Ozs7V0FPRztRQUNNLCtCQUEwQixHQUFlLElBQUksQ0FBQztJQU0zRCxDQUFDO0NBQUE7QUEzREQsOENBMkRDO0FBRUQsTUFBYSx5QkFBeUI7SUFBdEM7UUFDSTs7O1dBR0c7UUFDSCxPQUFFLEdBQUcsSUFBSSxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTdDOzs7V0FHRztRQUNILFNBQUksR0FBRyxJQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDbkQsQ0FBQztDQUFBO0FBWkQsOERBWUM7QUFFRDs7OztHQUlHO0FBQ0gsTUFBYSx5QkFBeUI7SUFRbEM7UUFDSSxJQUFJLENBQUMs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Q3ZELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGFBQWEsQ0FBQyxjQUFpQztRQUNuRCxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQ3BDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLHlCQUF5QixFQUFFLGlCQUFpQixDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN2RyxJQUFJLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN2QixjQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDN0IsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksK0JBQStCLENBQUMsQ0FBQztnQkFDbkUsQ0FBQztnQkFDRCxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUEzSkQsc0RBMkpDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IElWcGMgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7IENsdXN0ZXJMb2dnaW5nVHlwZXMgYXMgQ29udHJvbFBsYW5lTG9nVHlwZSwgS3ViZXJuZXRlc1ZlcnNpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWtzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgTW5nQ2x1c3RlclByb3ZpZGVyIH0gZnJvbSAnLi4vY2x1c3Rlci1wcm92aWRlcnMvbW5nLWNsdXN0ZXItcHJvdmlkZXInO1xuaW1wb3J0IHsgVnBjUHJvdmlkZXIgfSBmcm9tICcuLi9yZXNvdXJjZS1wcm92aWRlcnMvdnBjJztcbmltcG9ydCAqIGFzIHNwaSBmcm9tICcuLi9zcGknO1xuaW1wb3J0ICogYXMgY29uc3RyYWludHMgZnJvbSAnLi4vdXRpbHMvY29uc3RyYWludHMtdXRpbHMnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgY2xvbmVEZWVwIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgSUtleSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mta21zXCI7XG5pbXBvcnQge0NyZWF0ZUttc0tleVByb3ZpZGVyfSBmcm9tIFwiLi4vcmVzb3VyY2UtcHJvdmlkZXJzL2ttcy1rZXlcIjtcbmltcG9ydCB7IEFyZ29HaXRPcHNGYWN0b3J5IH0gZnJvbSBcIi4uL2FkZG9ucy9hcmdvY2QvYXJnby1naXRvcHMtZmFjdG9yeVwiO1xuXG4vKiBEZWZhdWx0IEs4cyB2ZXJzaW9uIG9mIEVLUyBCbHVlcHJpbnRzICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9WRVJTSU9OID0gS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjk7XG5cbi8qKlxuICogIEV4cG9ydGluZyBjb250cm9sIHBsYW5lIGxvZyB0eXBlIHNvIHRoYXQgY3VzdG9tZXJzIGRvbid0IGhhdmUgdG8gaW1wb3J0IENESyBFS1MgbW9kdWxlIGZvciBibHVlcHJpbnQgY29uZmlndXJhdGlvbi5cbiAqL1xuZXhwb3J0IHsgQ29udHJvbFBsYW5lTG9nVHlwZSB9O1xuXG5leHBvcnQgY2xhc3MgRWtzQmx1ZXByaW50UHJvcHMge1xuICAgIC8qKlxuICAgICAqIFRoZSBpZCBmb3IgdGhlIGJsdWVwcmludC5cbiAgICAgKi9cbiAgICByZWFkb25seSBpZDogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogRGVmYXVsdHMgdG8gaWQgaWYgbm90IHByb3ZpZGVkXG4gICAgICovXG4gICAgcmVhZG9ubHkgbmFtZT86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEFkZC1vbnMgaWYgYW55LlxuICAgICAqL1xuICAgIHJlYWRvbmx5IGFkZE9ucz86IEFycmF5PHNwaS5DbHVzdGVyQWRkT24+ID0gW107XG5cbiAgICAvKipcbiAgICAgKiBUZWFtcyBpZiBhbnlcbiAgICAgKi9cbiAgICByZWFkb25seSB0ZWFtcz86IEFycmF5PHNwaS5UZWFtPiA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogRUMyIG9yIEZhcmdhdGUgYXJlIHN1cHBvcnRlZCBpbiB0aGUgYmx1ZXByaW50IGJ1dCBhbnkgaW1wbGVtZW50YXRpb24gY29uZm9ybWluZyB0aGUgaW50ZXJmYWNlXG4gICAgICogd2lsbCB3b3JrXG4gICAgICovXG4gICAgcmVhZG9ubHkgY2x1c3RlclByb3ZpZGVyPzogc3BpLkNsdXN0ZXJQcm92aWRlciA9IG5ldyBNbmdDbHVzdGVyUHJvdmlkZXIoKTtcblxuICAgIC8qKlxuICAgICAqIEt1YmVybmV0ZXMgdmVyc2lvbiAobXVzdCBiZSBpbml0aWFsaXplZCBmb3IgYWRkb25zIHRvIHdvcmsgcHJvcGVybHkpXG4gICAgICovXG4gICAgcmVhZG9ubHkgdmVyc2lvbj86IEt1YmVybmV0ZXNWZXJzaW9uIHwgXCJhdXRvXCI7XG5cbiAgICAvKipcbiAgICAgKiBOYW1lZCByZXNvdXJjZSBwcm92aWRlcnMgdG8gbGV2ZXJhZ2UgZm9yIGNsdXN0ZXIgcmVzb3VyY2VzLlxuICAgICAqIFRoZSByZXNvdXJjZSBjYW4gcmVwcmVzZW50IFZwYywgSG9zdGluZyBab25lcyBvciBvdGhlciByZXNvdXJjZXMsIHNlZSB7QGxpbmsgc3BpLlJlc291cmNlVHlwZX0uXG4gICAgICogVlBDIGZvciB0aGUgY2x1c3RlciBjYW4gYmUgcmVnaXN0ZXJlZCB1bmRlciB0aGUgbmFtZSBvZiAndnBjJyBvciBhcyBhIHNpbmdsZSBwcm92aWRlciBvZiB0eXBlXG4gICAgICovXG4gICAgcmVzb3VyY2VQcm92aWRlcnM/OiBNYXA8c3RyaW5nLCBzcGkuUmVzb3VyY2VQcm92aWRlcj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBDb250cm9sIFBsYW5lIGxvZyB0eXBlcyB0byBiZSBlbmFibGVkIChpZiBub3QgcGFzc2VkLCBub25lKVxuICAgICAqIElmIHdyb25nIHR5cGVzIGFyZSBpbmNsdWRlZCwgd2lsbCB0aHJvdyBhbiBlcnJvci5cbiAgICAgKi9cbiAgICByZWFkb25seSBlbmFibGVDb250cm9sUGxhbmVMb2dUeXBlcz86IENvbnRyb2xQbGFuZUxvZ1R5cGVbXTtcblxuICAgIC8qKlxuICAgICAqIElmIHNldCB0byB0cnVlIGFuZCBubyByZXNvdWNlIHByb3ZpZGVyIGZvciBLTVMga2V5IGlzIGRlZmluZWQgKHVuZGVyIEdsb2JhbFJlc291cmNlcy5LbXNLZXkpLFxuICAgICAqIGEgZGVmYXVsdCBLTVMgZW5jcnlwdGlvbiBrZXkgd2lsbCBiZSB1c2VkIGZvciBlbnZlbG9wZSBlbmNyeXB0aW9uIG9mIEt1YmVybmV0ZXMgc2VjcmV0cyAoQVdTIG1hbmFnZWQgbmV3IEtNUyBrZXkpLlxuICAgICAqIElmIHNldCB0byBmYWxzZSwgYW5kIG5vIHJlc291Y2UgcHJvdmlkZXIgZm9yIEtNUyBrZXkgaXMgZGVmaW5lZCAodW5kZXIgR2xvYmFsUmVzb3VyY2VzLkttc0tleSksIHRoZW4gbm8gc2VjcmV0c1xuICAgICAqIGVuY3lycHRpb24gaXMgYXBwbGllZC5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgaXMgdHJ1ZS5cbiAgICAgKi9cbiAgICByZWFkb25seSB1c2VEZWZhdWx0U2VjcmV0RW5jcnlwdGlvbj8gOiBib29sZWFuICA9IHRydWU7XG5cbiAgICAvKipcbiAgICAgKiBHaXRPcHMgbW9kZXMgdG8gYmUgZW5hYmxlZC4gSWYgbm90IHNwZWNpZmllZCwgR2l0T3BzIG1vZGUgaXMgbm90IGVuYWJsZWQuXG4gICAgICovXG4gICAgcmVhZG9ubHkgZW5hYmxlR2l0T3BzTW9kZT86IHNwaS5HaXRPcHNNb2RlO1xufVxuXG5leHBvcnQgY2xhc3MgQmx1ZXByaW50UHJvcHNDb25zdHJhaW50cyBpbXBsZW1lbnRzIGNvbnN0cmFpbnRzLkNvbnN0cmFpbnRzVHlwZTxFa3NCbHVlcHJpbnRQcm9wcz4ge1xuICAgIC8qKlxuICAgICAqIGlkIGNhbiBiZSBubyBsZXNzIHRoYW4gMSBjaGFyYWN0ZXIgbG9uZywgYW5kIG5vIGdyZWF0ZXIgdGhhbiA2MyBjaGFyYWN0ZXJzIGxvbmcuXG4gICAgICogaHR0cHM6Ly9rdWJlcm5ldGVzLmlvL2RvY3MvY29uY2VwdHMvb3ZlcnZpZXcvd29ya2luZy13aXRoLW9iamVjdHMvbmFtZXMvXG4gICAgICovXG4gICAgaWQgPSBuZXcgY29uc3RyYWludHMuU3RyaW5nQ29uc3RyYWludCgxLCA2Myk7XG5cbiAgICAvKipcbiAgICAgKiBuYW1lIGNhbiBiZSBubyBsZXNzIHRoYW4gMSBjaGFyYWN0ZXIgbG9uZywgYW5kIG5vIGdyZWF0ZXIgdGhhbiA2MyBjaGFyYWN0ZXJzIGxvbmcuXG4gICAgICogaHR0cHM6Ly9rdWJlcm5ldGVzLmlvL2RvY3MvY29uY2VwdHMvb3ZlcnZpZXcvd29ya2luZy13aXRoLW9iamVjdHMvbmFtZXMvXG4gICAgICovXG4gICAgbmFtZSA9IG5ldyBjb25zdHJhaW50cy5TdHJpbmdDb25zdHJhaW50KDEsIDYzKTtcbn1cblxuLyoqXG4gKiBCbHVlcHJpbnQgYnVpbGRlciBpbXBsZW1lbnRzIGEgYnVpbGRlciBwYXR0ZXJuIHRoYXQgaW1wcm92ZXMgcmVhZGFiaWxpdHkgKG5vIGJsb2F0ZWQgY29uc3RydWN0b3JzKVxuICogYW5kIGFsbG93cyBjcmVhdGluZyBhIGJsdWVwcmludCBpbiBhbiBhYnN0cmFjdCBzdGF0ZSB0aGF0IGNhbiBiZSBhcHBsaWVkIHRvIHZhcmlvdXMgaW5zdGFudGlhdGlvbnNcbiAqIGluIGFjY291bnRzIGFuZCByZWdpb25zLlxuICovXG5leHBvcnQgY2xhc3MgQmx1ZXByaW50Q29uc3RydWN0QnVpbGRlciB7XG5cbiAgICBwcm9wczogUGFydGlhbDxFa3NCbHVlcHJpbnRQcm9wcz47XG4gICAgZW52OiB7XG4gICAgICAgIGFjY291bnQ/OiBzdHJpbmcsXG4gICAgICAgIHJlZ2lvbj86IHN0cmluZ1xuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgYWRkT25zOiBuZXcgQXJyYXk8c3BpLkNsdXN0ZXJBZGRPbj4oKSwgdGVhbXM6IG5ldyBBcnJheTxzcGkuVGVhbT4oKSwgcmVzb3VyY2VQcm92aWRlcnM6IG5ldyBNYXAoKSB9O1xuICAgICAgICB0aGlzLmVudiA9IHtcbiAgICAgICAgICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXG4gICAgICAgICAgICByZWdpb246IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX1JFR0lPTlxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBuYW1lKG5hbWU6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi57IG5hbWUgfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgYWNjb3VudChhY2NvdW50Pzogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZW52LmFjY291bnQgPSBhY2NvdW50O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVnaW9uKHJlZ2lvbj86IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLmVudi5yZWdpb24gPSByZWdpb247XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyB2ZXJzaW9uKHZlcnNpb246IFwiYXV0b1wiIHwgS3ViZXJuZXRlc1ZlcnNpb24pOiB0aGlzIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4ueyB2ZXJzaW9uOiB2ZXJzaW9uIH0gfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGVuYWJsZUNvbnRyb2xQbGFuZUxvZ1R5cGVzKC4uLnR5cGVzOiBDb250cm9sUGxhbmVMb2dUeXBlW10pOiB0aGlzIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4ueyBlbmFibGVDb250cm9sUGxhbmVMb2dUeXBlczogdHlwZXMgfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZW5hYmxlR2l0T3BzKG1vZGU/OiBzcGkuR2l0T3BzTW9kZSk6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi57IGVuYWJsZUdpdE9wc01vZGU6IG1vZGUgPz8gc3BpLkdpdE9wc01vZGUuQVBQX09GX0FQUFMgfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgd2l0aEJsdWVwcmludFByb3BzKHByb3BzOiBQYXJ0aWFsPEVrc0JsdWVwcmludFByb3BzPik6IHRoaXMge1xuICAgICAgICBjb25zdCByZXNvdXJjZVByb3ZpZGVycyA9IHRoaXMucHJvcHMucmVzb3VyY2VQcm92aWRlcnMhO1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi5jbG9uZURlZXAocHJvcHMpIH07XG4gICAgICAgIGlmIChwcm9wcy5yZXNvdXJjZVByb3ZpZGVycykge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5yZXNvdXJjZVByb3ZpZGVycyA9IG5ldyBNYXAoWy4uLnJlc291cmNlUHJvdmlkZXJzIS5lbnRyaWVzKCksIC4uLnByb3BzLnJlc291cmNlUHJvdmlkZXJzLmVudHJpZXMoKV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRPbnMoLi4uYWRkT25zOiBzcGkuQ2x1c3RlckFkZE9uW10pOiB0aGlzIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4ueyBhZGRPbnM6IHRoaXMucHJvcHMuYWRkT25zPy5jb25jYXQoYWRkT25zKSB9IH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbHVzdGVyUHJvdmlkZXIoY2x1c3RlclByb3ZpZGVyOiBzcGkuQ2x1c3RlclByb3ZpZGVyKSB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLnsgY2x1c3RlclByb3ZpZGVyOiBjbHVzdGVyUHJvdmlkZXIgfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgaWQoaWQ6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi57IGlkIH0gfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHRlYW1zKC4uLnRlYW1zOiBzcGkuVGVhbVtdKTogdGhpcyB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLnsgdGVhbXM6IHRoaXMucHJvcHMudGVhbXM/LmNvbmNhdCh0ZWFtcykgfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVzb3VyY2VQcm92aWRlcihuYW1lOiBzdHJpbmcsIHByb3ZpZGVyOiBzcGkuUmVzb3VyY2VQcm92aWRlcik6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzLnJlc291cmNlUHJvdmlkZXJzPy5zZXQobmFtZSwgcHJvdmlkZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgdXNlRGVmYXVsdFNlY3JldEVuY3J5cHRpb24odXNlRGVmYXVsdDogYm9vbGVhbik6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi57IHVzZURlZmF1bHRTZWNyZXRFbmNyeXB0aW9uOiB1c2VEZWZhdWx0IH0gfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHdpdGhFbnYoZW52OiBjZGsuRW52aXJvbm1lbnQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lbnYuYWNjb3VudCA9IGVudi5hY2NvdW50O1xuICAgICAgICB0aGlzLmVudi5yZWdpb24gPSBlbnYucmVnaW9uO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbn1cblxuLyoqXG4gKiBFbnRyeSBwb2ludCB0byB0aGUgcGxhdGZvcm0gcHJvdmlzaW9uaW5nLiBDcmVhdGVzIGEgQ0ZOIHN0YWNrIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBjb25maWd1cmF0aW9uXG4gKiBhbmQgb3JjaGVzdHJhdGVzIHByb3Zpc2lvbmluZyBvZiBhZGQtb25zLCB0ZWFtcyBhbmQgcG9zdCBkZXBsb3ltZW50IGhvb2tzLlxuICovXG5leHBvcnQgY2xhc3MgRWtzQmx1ZXByaW50Q29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcblxuICAgIHByaXZhdGUgYXN5bmNUYXNrczogUHJvbWlzZTx2b2lkIHwgQ29uc3RydWN0W10+O1xuXG4gICAgcHJpdmF0ZSBjbHVzdGVySW5mbzogc3BpLkNsdXN0ZXJJbmZvO1xuXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgYmx1ZXByaW50UHJvcHM6IEVrc0JsdWVwcmludFByb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBibHVlcHJpbnRQcm9wcy5pZCk7XG4gICAgICAgIHRoaXMudmFsaWRhdGVJbnB1dChibHVlcHJpbnRQcm9wcyk7XG5cbiAgICAgICAgY29uc3QgcmVzb3VyY2VDb250ZXh0ID0gdGhpcy5wcm92aWRlTmFtZWRSZXNvdXJjZXMoYmx1ZXByaW50UHJvcHMpO1xuXG4gICAgICAgIGxldCB2cGNSZXNvdXJjZTogSVZwYyB8IHVuZGVmaW5lZCA9IHJlc291cmNlQ29udGV4dC5nZXQoc3BpLkdsb2JhbFJlc291cmNlcy5WcGMpO1xuXG4gICAgICAgIGlmICghdnBjUmVzb3VyY2UpIHtcbiAgICAgICAgICAgIHZwY1Jlc291cmNlID0gcmVzb3VyY2VDb250ZXh0LmFkZChzcGkuR2xvYmFsUmVzb3VyY2VzLlZwYywgbmV3IFZwY1Byb3ZpZGVyKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHZlcnNpb24gPSBibHVlcHJpbnRQcm9wcy52ZXJzaW9uO1xuICAgICAgICBpZiAodmVyc2lvbiA9PSBcImF1dG9cIikge1xuICAgICAgICAgICAgdmVyc2lvbiA9IERFRkFVTFRfVkVSU0lPTjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBrbXNLZXlSZXNvdXJjZTogSUtleSB8IHVuZGVmaW5lZCA9IHJlc291cmNlQ29udGV4dC5nZXQoc3BpLkdsb2JhbFJlc291cmNlcy5LbXNLZXkpO1xuXG4gICAgICAgIGlmICgha21zS2V5UmVzb3VyY2UgJiYgYmx1ZXByaW50UHJvcHMudXNlRGVmYXVsdFNlY3JldEVuY3J5cHRpb24gIT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGttc0tleVJlc291cmNlID0gcmVzb3VyY2VDb250ZXh0LmFkZChzcGkuR2xvYmFsUmVzb3VyY2VzLkttc0tleSwgbmV3IENyZWF0ZUttc0tleVByb3ZpZGVyKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgYmx1ZXByaW50UHJvcHMgPSB0aGlzLnJlc29sdmVEeW5hbWljUHJveGllcyhibHVlcHJpbnRQcm9wcywgcmVzb3VyY2VDb250ZXh0KTtcblxuICAgICAgICBjb25zdCBjbHVzdGVyUHJvdmlkZXIgPSBibHVlcHJpbnRQcm9wcy5jbHVzdGVyUHJvdmlkZXIgPz8gbmV3IE1uZ0NsdXN0ZXJQcm92aWRlcih7XG4gICAgICAgICAgICBpZDogYCR7Ymx1ZXByaW50UHJvcHMubmFtZSA/PyBibHVlcHJpbnRQcm9wcy5pZH0tbmdgLFxuICAgICAgICAgICAgdmVyc2lvblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNsdXN0ZXJJbmZvID0gY2x1c3RlclByb3ZpZGVyLmNyZWF0ZUNsdXN0ZXIodGhpcywgdnBjUmVzb3VyY2UhLCBrbXNLZXlSZXNvdXJjZSwgdmVyc2lvbiwgYmx1ZXByaW50UHJvcHMuZW5hYmxlQ29udHJvbFBsYW5lTG9nVHlwZXMpO1xuICAgICAgICB0aGlzLmNsdXN0ZXJJbmZvLnNldFJlc291cmNlQ29udGV4dChyZXNvdXJjZUNvbnRleHQpO1xuXG4gICAgICAgIGlmIChibHVlcHJpbnRQcm9wcy5lbmFibGVHaXRPcHNNb2RlID09IHNwaS5HaXRPcHNNb2RlLkFQUExJQ0FUSU9OKSB7XG4gICAgICAgICAgICBBcmdvR2l0T3BzRmFjdG9yeS5lbmFibGVHaXRPcHMoKTtcbiAgICAgICAgfSBlbHNlIGlmIChibHVlcHJpbnRQcm9wcy5lbmFibGVHaXRPcHNNb2RlID09IHNwaS5HaXRPcHNNb2RlLkFQUF9PRl9BUFBTKSB7XG4gICAgICAgICAgICBBcmdvR2l0T3BzRmFjdG9yeS5lbmFibGVHaXRPcHNBcHBPZkFwcHMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBvc3REZXBsb3ltZW50U3RlcHMgPSBBcnJheTxzcGkuQ2x1c3RlclBvc3REZXBsb3k+KCk7XG5cbiAgICAgICAgZm9yIChsZXQgYWRkT24gb2YgKGJsdWVwcmludFByb3BzLmFkZE9ucyA/PyBbXSkpIHsgLy8gbXVzdCBpdGVyYXRlIGluIHRoZSBzdHJpY3Qgb3JkZXJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGFkZE9uLmRlcGxveSh0aGlzLmNsdXN0ZXJJbmZvKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhZGRPbktleSA9IHV0aWxzLmdldEFkZE9uTmFtZU9ySWQoYWRkT24pO1xuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3RlckluZm8uYWRkU2NoZWR1bGVkQWRkT24oYWRkT25LZXksIHJlc3VsdCwgdXRpbHMuaXNPcmRlcmVkQWRkT24oYWRkT24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBvc3REZXBsb3k6IGFueSA9IGFkZE9uO1xuICAgICAgICAgICAgaWYgKChwb3N0RGVwbG95IGFzIHNwaS5DbHVzdGVyUG9zdERlcGxveSkucG9zdERlcGxveSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcG9zdERlcGxveW1lbnRTdGVwcy5wdXNoKDxzcGkuQ2x1c3RlclBvc3REZXBsb3k+cG9zdERlcGxveSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzY2hlZHVsZWRBZGRPbnMgPSB0aGlzLmNsdXN0ZXJJbmZvLmdldEFsbFNjaGVkdWxlZEFkZG9ucygpO1xuICAgICAgICBjb25zdCBhZGRPbktleXMgPSBbLi4uc2NoZWR1bGVkQWRkT25zLmtleXMoKV07XG4gICAgICAgIGNvbnN0IHByb21pc2VzID0gc2NoZWR1bGVkQWRkT25zLnZhbHVlcygpO1xuXG4gICAgICAgIHRoaXMuYXN5bmNUYXNrcyA9IFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKChjb25zdHJ1Y3RzKSA9PiB7XG4gICAgICAgICAgICBjb25zdHJ1Y3RzLmZvckVhY2goKGNvbnN0cnVjdCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsdXN0ZXJJbmZvLmFkZFByb3Zpc2lvbmVkQWRkT24oYWRkT25LZXlzW2luZGV4XSwgY29uc3RydWN0KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoYmx1ZXByaW50UHJvcHMudGVhbXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHRlYW0gb2YgYmx1ZXByaW50UHJvcHMudGVhbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGVhbS5zZXR1cCh0aGlzLmNsdXN0ZXJJbmZvKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAobGV0IHN0ZXAgb2YgcG9zdERlcGxveW1lbnRTdGVwcykge1xuICAgICAgICAgICAgICAgIHN0ZXAucG9zdERlcGxveSh0aGlzLmNsdXN0ZXJJbmZvLCBibHVlcHJpbnRQcm9wcy50ZWFtcyA/PyBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYXN5bmNUYXNrcy5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNpbmNlIGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBtYXJrZWQgYXMgYXN5bmMsIGFkZGluZyBhIHNlcGFyYXRlIG1ldGhvZCB0byB3YWl0XG4gICAgICogZm9yIGFzeW5jIGNvZGUgdG8gZmluaXNoLlxuICAgICAqIEByZXR1cm5zIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgYmx1ZXByaW50XG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHdhaXRGb3JBc3luY1Rhc2tzKCk6IFByb21pc2U8RWtzQmx1ZXByaW50Q29uc3RydWN0PiB7XG4gICAgICAgIGlmICh0aGlzLmFzeW5jVGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFzeW5jVGFza3MudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHJldHVybnMgYWxsIHRoZSBjb25zdHJ1Y3RzIHByb2R1Y2VkIGJ5IGR1cmluZyB0aGUgY2x1c3RlciBjcmVhdGlvbiAoZS5nLiBhZGQtb25zKS5cbiAgICAgKiBNYXkgYmUgdXNlZCBpbiB0ZXN0aW5nIGZvciB2ZXJpZmljYXRpb24uXG4gICAgICogQHJldHVybnMgQXN5bmMgVGFza3Mgb2JqZWN0XG4gICAgICovXG4gICAgZ2V0QXN5bmNUYXNrcygpOiBQcm9taXNlPHZvaWQgfCBDb25zdHJ1Y3RbXT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hc3luY1Rhc2tzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHJldHVybnMgYWxsIHRoZSBjb25zdHJ1Y3RzIHByb2R1Y2VkIGJ5IGR1cmluZyB0aGUgY2x1c3RlciBjcmVhdGlvbiAoZS5nLiBhZGQtb25zKS5cbiAgICAgKiBNYXkgYmUgdXNlZCBpbiB0ZXN0aW5nIGZvciB2ZXJpZmljYXRpb24uXG4gICAgICogQHJldHVybnMgY2x1c3RlciBpbmZvIG9iamVjdFxuICAgICAqL1xuICAgIGdldENsdXN0ZXJJbmZvKCk6IHNwaS5DbHVzdGVySW5mbyB7XG4gICAgICAgIHJldHVybiB0aGlzLmNsdXN0ZXJJbmZvO1xuICAgIH1cblxuICAgIHByaXZhdGUgcHJvdmlkZU5hbWVkUmVzb3VyY2VzKGJsdWVwcmludFByb3BzOiBFa3NCbHVlcHJpbnRQcm9wcyk6IHNwaS5SZXNvdXJjZUNvbnRleHQge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgc3BpLlJlc291cmNlQ29udGV4dCh0aGlzLCBibHVlcHJpbnRQcm9wcyk7XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIGJsdWVwcmludFByb3BzLnJlc291cmNlUHJvdmlkZXJzID8/IFtdKSB7XG4gICAgICAgICAgICByZXN1bHQuYWRkKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlcyBhbGwgZHluYW1pYyBwcm94aWVzLCB0aGF0IHN1YnN0aXR1dGVzIHJlc291cmNlIHByb3ZpZGVyIHByb3hpZXMgd2l0aCB0aGUgcmVzb2x2ZWQgdmFsdWVzLlxuICAgICAqIEBwYXJhbSBibHVlcHJpbnRQcm9wc1xuICAgICAqIEBwYXJhbSByZXNvdXJjZUNvbnRleHRcbiAgICAgKiBAcmV0dXJucyBhIGNvcHkgb2YgYmx1ZXByaW50IHByb3BzIHdpdGggcmVzb2x2ZWQgdmFsdWVzXG4gICAgICovXG4gICAgcHJpdmF0ZSByZXNvbHZlRHluYW1pY1Byb3hpZXMoYmx1ZXByaW50UHJvcHM6IEVrc0JsdWVwcmludFByb3BzLCByZXNvdXJjZUNvbnRleHQ6IHNwaS5SZXNvdXJjZUNvbnRleHQpIDogRWtzQmx1ZXByaW50UHJvcHMge1xuICAgICAgICByZXR1cm4gdXRpbHMuY2xvbmVEZWVwKGJsdWVwcmludFByb3BzLCAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB1dGlscy5yZXNvbHZlVGFyZ2V0KHZhbHVlLCByZXNvdXJjZUNvbnRleHQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZXMgaW5wdXQgYWdhaW5zdCBiYXNpYyBkZWZpbmVkIGNvbnN0cmFpbnRzLlxuICAgICAqIEBwYXJhbSBibHVlcHJpbnRQcm9wc1xuICAgICAqL1xuICAgIHByaXZhdGUgdmFsaWRhdGVJbnB1dChibHVlcHJpbnRQcm9wczogRWtzQmx1ZXByaW50UHJvcHMpIHtcbiAgICAgICAgY29uc3QgdGVhbU5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0cmFpbnRzLnZhbGlkYXRlQ29uc3RyYWludHMobmV3IEJsdWVwcmludFByb3BzQ29uc3RyYWludHMsIEVrc0JsdWVwcmludFByb3BzLm5hbWUsIGJsdWVwcmludFByb3BzKTtcbiAgICAgICAgaWYgKGJsdWVwcmludFByb3BzLnRlYW1zKSB7XG4gICAgICAgICAgICBibHVlcHJpbnRQcm9wcy50ZWFtcy5mb3JFYWNoKGUgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0ZWFtTmFtZXMuaGFzKGUubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUZWFtICR7ZS5uYW1lfSBpcyByZWdpc3RlcmVkIG1vcmUgdGhhbiBvbmNlYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRlYW1OYW1lcy5hZGQoZS5uYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iXX0=