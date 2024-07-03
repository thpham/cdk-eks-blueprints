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
    constructor(parent, blueprintProps) {
        var _a, _b, _c;
        super(parent, blueprintProps.id + "-ct");
        this.validateInput(blueprintProps);
        const scope = blueprintProps.compatibilityMode ? parent : this;
        const resourceContext = this.provideNamedResources(blueprintProps, scope);
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
        this.clusterInfo = clusterProvider.createCluster(scope, vpcResource, kmsKeyResource, version, blueprintProps.enableControlPlaneLogTypes);
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
    provideNamedResources(blueprintProps, scope) {
        var _a;
        const result = new spi.ResourceContext(scope, blueprintProps);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWtzLWJsdWVwcmludC1jb25zdHJ1Y3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvc3RhY2tzL2Vrcy1ibHVlcHJpbnQtY29uc3RydWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLGlEQUFvRztBQWtCM0Ysb0dBbEJ1Qiw2QkFBbUIsT0FrQnZCO0FBakI1QiwyQ0FBdUM7QUFDdkMsb0ZBQStFO0FBQy9FLG1EQUF3RDtBQUN4RCw4QkFBOEI7QUFDOUIsMERBQTBEO0FBQzFELGtDQUFrQztBQUNsQyxvQ0FBcUM7QUFFckMsMkRBQW1FO0FBQ25FLDhFQUF5RTtBQUV6RSwyQ0FBMkM7QUFDOUIsUUFBQSxlQUFlLEdBQUcsMkJBQWlCLENBQUMsS0FBSyxDQUFDO0FBT3ZELE1BQWEsaUJBQWlCO0lBQTlCO1FBV0k7O1dBRUc7UUFDTSxXQUFNLEdBQTZCLEVBQUUsQ0FBQztRQUUvQzs7V0FFRztRQUNNLFVBQUssR0FBcUIsRUFBRSxDQUFDO1FBRXRDOzs7V0FHRztRQUNNLG9CQUFlLEdBQXlCLElBQUkseUNBQWtCLEVBQUUsQ0FBQztRQU8xRTs7OztXQUlHO1FBQ0gsc0JBQWlCLEdBQXVDLElBQUksR0FBRyxFQUFFLENBQUM7UUFRbEU7Ozs7Ozs7V0FPRztRQUNNLCtCQUEwQixHQUFlLElBQUksQ0FBQztJQVczRCxDQUFDO0NBQUE7QUFoRUQsOENBZ0VDO0FBRUQsTUFBYSx5QkFBeUI7SUFBdEM7UUFDSTs7O1dBR0c7UUFDSCxPQUFFLEdBQUcsSUFBSSxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTdDOzs7V0FHRztRQUNILFNBQUksR0FBRyxJQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDbkQsQ0FBQztDQUFBO0FBWkQsOERBWUM7QUFFRDs7OztHQUlHO0FBQ0gsTUFBYSx5QkFBeUI7SUFRbEM7UUFDSSxJQUFJLENBQUMs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LE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUM3QyxPQUFPLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7T0FHRztJQUNLLGFBQWEsQ0FBQyxjQUFpQztRQUNuRCxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQ3BDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLHlCQUF5QixFQUFFLGlCQUFpQixDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN2RyxJQUFJLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN2QixjQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDN0IsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksK0JBQStCLENBQUMsQ0FBQztnQkFDbkUsQ0FBQztnQkFDRCxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUE3SkQsc0RBNkpDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IElWcGMgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7IENsdXN0ZXJMb2dnaW5nVHlwZXMgYXMgQ29udHJvbFBsYW5lTG9nVHlwZSwgS3ViZXJuZXRlc1ZlcnNpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWtzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgTW5nQ2x1c3RlclByb3ZpZGVyIH0gZnJvbSAnLi4vY2x1c3Rlci1wcm92aWRlcnMvbW5nLWNsdXN0ZXItcHJvdmlkZXInO1xuaW1wb3J0IHsgVnBjUHJvdmlkZXIgfSBmcm9tICcuLi9yZXNvdXJjZS1wcm92aWRlcnMvdnBjJztcbmltcG9ydCAqIGFzIHNwaSBmcm9tICcuLi9zcGknO1xuaW1wb3J0ICogYXMgY29uc3RyYWludHMgZnJvbSAnLi4vdXRpbHMvY29uc3RyYWludHMtdXRpbHMnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgY2xvbmVEZWVwIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgSUtleSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mta21zXCI7XG5pbXBvcnQge0NyZWF0ZUttc0tleVByb3ZpZGVyfSBmcm9tIFwiLi4vcmVzb3VyY2UtcHJvdmlkZXJzL2ttcy1rZXlcIjtcbmltcG9ydCB7IEFyZ29HaXRPcHNGYWN0b3J5IH0gZnJvbSBcIi4uL2FkZG9ucy9hcmdvY2QvYXJnby1naXRvcHMtZmFjdG9yeVwiO1xuXG4vKiBEZWZhdWx0IEs4cyB2ZXJzaW9uIG9mIEVLUyBCbHVlcHJpbnRzICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9WRVJTSU9OID0gS3ViZXJuZXRlc1ZlcnNpb24uVjFfMjk7XG5cbi8qKlxuICogIEV4cG9ydGluZyBjb250cm9sIHBsYW5lIGxvZyB0eXBlIHNvIHRoYXQgY3VzdG9tZXJzIGRvbid0IGhhdmUgdG8gaW1wb3J0IENESyBFS1MgbW9kdWxlIGZvciBibHVlcHJpbnQgY29uZmlndXJhdGlvbi5cbiAqL1xuZXhwb3J0IHsgQ29udHJvbFBsYW5lTG9nVHlwZSB9O1xuXG5leHBvcnQgY2xhc3MgRWtzQmx1ZXByaW50UHJvcHMge1xuICAgIC8qKlxuICAgICAqIFRoZSBpZCBmb3IgdGhlIGJsdWVwcmludC5cbiAgICAgKi9cbiAgICByZWFkb25seSBpZDogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogRGVmYXVsdHMgdG8gaWQgaWYgbm90IHByb3ZpZGVkXG4gICAgICovXG4gICAgcmVhZG9ubHkgbmFtZT86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEFkZC1vbnMgaWYgYW55LlxuICAgICAqL1xuICAgIHJlYWRvbmx5IGFkZE9ucz86IEFycmF5PHNwaS5DbHVzdGVyQWRkT24+ID0gW107XG5cbiAgICAvKipcbiAgICAgKiBUZWFtcyBpZiBhbnlcbiAgICAgKi9cbiAgICByZWFkb25seSB0ZWFtcz86IEFycmF5PHNwaS5UZWFtPiA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogRUMyIG9yIEZhcmdhdGUgYXJlIHN1cHBvcnRlZCBpbiB0aGUgYmx1ZXByaW50IGJ1dCBhbnkgaW1wbGVtZW50YXRpb24gY29uZm9ybWluZyB0aGUgaW50ZXJmYWNlXG4gICAgICogd2lsbCB3b3JrXG4gICAgICovXG4gICAgcmVhZG9ubHkgY2x1c3RlclByb3ZpZGVyPzogc3BpLkNsdXN0ZXJQcm92aWRlciA9IG5ldyBNbmdDbHVzdGVyUHJvdmlkZXIoKTtcblxuICAgIC8qKlxuICAgICAqIEt1YmVybmV0ZXMgdmVyc2lvbiAobXVzdCBiZSBpbml0aWFsaXplZCBmb3IgYWRkb25zIHRvIHdvcmsgcHJvcGVybHkpXG4gICAgICovXG4gICAgcmVhZG9ubHkgdmVyc2lvbj86IEt1YmVybmV0ZXNWZXJzaW9uIHwgXCJhdXRvXCI7XG5cbiAgICAvKipcbiAgICAgKiBOYW1lZCByZXNvdXJjZSBwcm92aWRlcnMgdG8gbGV2ZXJhZ2UgZm9yIGNsdXN0ZXIgcmVzb3VyY2VzLlxuICAgICAqIFRoZSByZXNvdXJjZSBjYW4gcmVwcmVzZW50IFZwYywgSG9zdGluZyBab25lcyBvciBvdGhlciByZXNvdXJjZXMsIHNlZSB7QGxpbmsgc3BpLlJlc291cmNlVHlwZX0uXG4gICAgICogVlBDIGZvciB0aGUgY2x1c3RlciBjYW4gYmUgcmVnaXN0ZXJlZCB1bmRlciB0aGUgbmFtZSBvZiAndnBjJyBvciBhcyBhIHNpbmdsZSBwcm92aWRlciBvZiB0eXBlXG4gICAgICovXG4gICAgcmVzb3VyY2VQcm92aWRlcnM/OiBNYXA8c3RyaW5nLCBzcGkuUmVzb3VyY2VQcm92aWRlcj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBDb250cm9sIFBsYW5lIGxvZyB0eXBlcyB0byBiZSBlbmFibGVkIChpZiBub3QgcGFzc2VkLCBub25lKVxuICAgICAqIElmIHdyb25nIHR5cGVzIGFyZSBpbmNsdWRlZCwgd2lsbCB0aHJvdyBhbiBlcnJvci5cbiAgICAgKi9cbiAgICByZWFkb25seSBlbmFibGVDb250cm9sUGxhbmVMb2dUeXBlcz86IENvbnRyb2xQbGFuZUxvZ1R5cGVbXTtcblxuICAgIC8qKlxuICAgICAqIElmIHNldCB0byB0cnVlIGFuZCBubyByZXNvdWNlIHByb3ZpZGVyIGZvciBLTVMga2V5IGlzIGRlZmluZWQgKHVuZGVyIEdsb2JhbFJlc291cmNlcy5LbXNLZXkpLFxuICAgICAqIGEgZGVmYXVsdCBLTVMgZW5jcnlwdGlvbiBrZXkgd2lsbCBiZSB1c2VkIGZvciBlbnZlbG9wZSBlbmNyeXB0aW9uIG9mIEt1YmVybmV0ZXMgc2VjcmV0cyAoQVdTIG1hbmFnZWQgbmV3IEtNUyBrZXkpLlxuICAgICAqIElmIHNldCB0byBmYWxzZSwgYW5kIG5vIHJlc291Y2UgcHJvdmlkZXIgZm9yIEtNUyBrZXkgaXMgZGVmaW5lZCAodW5kZXIgR2xvYmFsUmVzb3VyY2VzLkttc0tleSksIHRoZW4gbm8gc2VjcmV0c1xuICAgICAqIGVuY3lycHRpb24gaXMgYXBwbGllZC5cbiAgICAgKlxuICAgICAqIERlZmF1bHQgaXMgdHJ1ZS5cbiAgICAgKi9cbiAgICByZWFkb25seSB1c2VEZWZhdWx0U2VjcmV0RW5jcnlwdGlvbj8gOiBib29sZWFuICA9IHRydWU7XG5cbiAgICAvKipcbiAgICAgKiBHaXRPcHMgbW9kZXMgdG8gYmUgZW5hYmxlZC4gSWYgbm90IHNwZWNpZmllZCwgR2l0T3BzIG1vZGUgaXMgbm90IGVuYWJsZWQuXG4gICAgICovXG4gICAgcmVhZG9ubHkgZW5hYmxlR2l0T3BzTW9kZT86IHNwaS5HaXRPcHNNb2RlO1xuXG4gICAgLyoqXG4gICAgICogV2hlbiBzZXQgdG8gdHJ1ZSwgd2lsbCBub3QgdXNlIGV4dHJhIG5lc3RpbmcgZm9yIGJsdWVwcmludCByZXNvdXJjZXMgYW5kIGF0dGFjaCB0aGVtIGRpcmVjdGx5IHRvIHRoZSBzdGFjay5cbiAgICAgKi9cbiAgICByZWFkb25seSBjb21wYXRpYmlsaXR5TW9kZT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBCbHVlcHJpbnRQcm9wc0NvbnN0cmFpbnRzIGltcGxlbWVudHMgY29uc3RyYWludHMuQ29uc3RyYWludHNUeXBlPEVrc0JsdWVwcmludFByb3BzPiB7XG4gICAgLyoqXG4gICAgICogaWQgY2FuIGJlIG5vIGxlc3MgdGhhbiAxIGNoYXJhY3RlciBsb25nLCBhbmQgbm8gZ3JlYXRlciB0aGFuIDYzIGNoYXJhY3RlcnMgbG9uZy5cbiAgICAgKiBodHRwczovL2t1YmVybmV0ZXMuaW8vZG9jcy9jb25jZXB0cy9vdmVydmlldy93b3JraW5nLXdpdGgtb2JqZWN0cy9uYW1lcy9cbiAgICAgKi9cbiAgICBpZCA9IG5ldyBjb25zdHJhaW50cy5TdHJpbmdDb25zdHJhaW50KDEsIDYzKTtcblxuICAgIC8qKlxuICAgICAqIG5hbWUgY2FuIGJlIG5vIGxlc3MgdGhhbiAxIGNoYXJhY3RlciBsb25nLCBhbmQgbm8gZ3JlYXRlciB0aGFuIDYzIGNoYXJhY3RlcnMgbG9uZy5cbiAgICAgKiBodHRwczovL2t1YmVybmV0ZXMuaW8vZG9jcy9jb25jZXB0cy9vdmVydmlldy93b3JraW5nLXdpdGgtb2JqZWN0cy9uYW1lcy9cbiAgICAgKi9cbiAgICBuYW1lID0gbmV3IGNvbnN0cmFpbnRzLlN0cmluZ0NvbnN0cmFpbnQoMSwgNjMpO1xufVxuXG4vKipcbiAqIEJsdWVwcmludCBidWlsZGVyIGltcGxlbWVudHMgYSBidWlsZGVyIHBhdHRlcm4gdGhhdCBpbXByb3ZlcyByZWFkYWJpbGl0eSAobm8gYmxvYXRlZCBjb25zdHJ1Y3RvcnMpXG4gKiBhbmQgYWxsb3dzIGNyZWF0aW5nIGEgYmx1ZXByaW50IGluIGFuIGFic3RyYWN0IHN0YXRlIHRoYXQgY2FuIGJlIGFwcGxpZWQgdG8gdmFyaW91cyBpbnN0YW50aWF0aW9uc1xuICogaW4gYWNjb3VudHMgYW5kIHJlZ2lvbnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCbHVlcHJpbnRDb25zdHJ1Y3RCdWlsZGVyIHtcblxuICAgIHByb3BzOiBQYXJ0aWFsPEVrc0JsdWVwcmludFByb3BzPjtcbiAgICBlbnY6IHtcbiAgICAgICAgYWNjb3VudD86IHN0cmluZyxcbiAgICAgICAgcmVnaW9uPzogc3RyaW5nXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnByb3BzID0geyBhZGRPbnM6IG5ldyBBcnJheTxzcGkuQ2x1c3RlckFkZE9uPigpLCB0ZWFtczogbmV3IEFycmF5PHNwaS5UZWFtPigpLCByZXNvdXJjZVByb3ZpZGVyczogbmV3IE1hcCgpIH07XG4gICAgICAgIHRoaXMuZW52ID0ge1xuICAgICAgICAgICAgYWNjb3VudDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCxcbiAgICAgICAgICAgIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfUkVHSU9OXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIG5hbWUobmFtZTogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLnsgbmFtZSB9IH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBhY2NvdW50KGFjY291bnQ/OiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lbnYuYWNjb3VudCA9IGFjY291bnQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyByZWdpb24ocmVnaW9uPzogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuZW52LnJlZ2lvbiA9IHJlZ2lvbjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHZlcnNpb24odmVyc2lvbjogXCJhdXRvXCIgfCBLdWJlcm5ldGVzVmVyc2lvbik6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi57IHZlcnNpb246IHZlcnNpb24gfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZW5hYmxlQ29udHJvbFBsYW5lTG9nVHlwZXMoLi4udHlwZXM6IENvbnRyb2xQbGFuZUxvZ1R5cGVbXSk6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi57IGVuYWJsZUNvbnRyb2xQbGFuZUxvZ1R5cGVzOiB0eXBlcyB9IH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBlbmFibGVHaXRPcHMobW9kZT86IHNwaS5HaXRPcHNNb2RlKTogdGhpcyB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLnsgZW5hYmxlR2l0T3BzTW9kZTogbW9kZSA/PyBzcGkuR2l0T3BzTW9kZS5BUFBfT0ZfQVBQUyB9IH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyB3aXRoQmx1ZXByaW50UHJvcHMocHJvcHM6IFBhcnRpYWw8RWtzQmx1ZXByaW50UHJvcHM+KTogdGhpcyB7XG4gICAgICAgIGNvbnN0IHJlc291cmNlUHJvdmlkZXJzID0gdGhpcy5wcm9wcy5yZXNvdXJjZVByb3ZpZGVycyE7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLmNsb25lRGVlcChwcm9wcykgfTtcbiAgICAgICAgaWYgKHByb3BzLnJlc291cmNlUHJvdmlkZXJzKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnJlc291cmNlUHJvdmlkZXJzID0gbmV3IE1hcChbLi4ucmVzb3VyY2VQcm92aWRlcnMhLmVudHJpZXMoKSwgLi4ucHJvcHMucmVzb3VyY2VQcm92aWRlcnMuZW50cmllcygpXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZE9ucyguLi5hZGRPbnM6IHNwaS5DbHVzdGVyQWRkT25bXSk6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi57IGFkZE9uczogdGhpcy5wcm9wcy5hZGRPbnM/LmNvbmNhdChhZGRPbnMpIH0gfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGNsdXN0ZXJQcm92aWRlcihjbHVzdGVyUHJvdmlkZXI6IHNwaS5DbHVzdGVyUHJvdmlkZXIpIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4ueyBjbHVzdGVyUHJvdmlkZXI6IGNsdXN0ZXJQcm92aWRlciB9IH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBpZChpZDogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLnsgaWQgfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgdGVhbXMoLi4udGVhbXM6IHNwaS5UZWFtW10pOiB0aGlzIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4ueyB0ZWFtczogdGhpcy5wcm9wcy50ZWFtcz8uY29uY2F0KHRlYW1zKSB9IH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyByZXNvdXJjZVByb3ZpZGVyKG5hbWU6IHN0cmluZywgcHJvdmlkZXI6IHNwaS5SZXNvdXJjZVByb3ZpZGVyKTogdGhpcyB7XG4gICAgICAgIHRoaXMucHJvcHMucmVzb3VyY2VQcm92aWRlcnM/LnNldChuYW1lLCBwcm92aWRlcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyB1c2VEZWZhdWx0U2VjcmV0RW5jcnlwdGlvbih1c2VEZWZhdWx0OiBib29sZWFuKTogdGhpcyB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLnsgdXNlRGVmYXVsdFNlY3JldEVuY3J5cHRpb246IHVzZURlZmF1bHQgfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgd2l0aEVudihlbnY6IGNkay5FbnZpcm9ubWVudCk6IHRoaXMge1xuICAgICAgICB0aGlzLmVudi5hY2NvdW50ID0gZW52LmFjY291bnQ7XG4gICAgICAgIHRoaXMuZW52LnJlZ2lvbiA9IGVudi5yZWdpb247XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxufVxuXG4vKipcbiAqIEVudHJ5IHBvaW50IHRvIHRoZSBwbGF0Zm9ybSBwcm92aXNpb25pbmcuIENyZWF0ZXMgYSBDRk4gc3RhY2sgYmFzZWQgb24gdGhlIHByb3ZpZGVkIGNvbmZpZ3VyYXRpb25cbiAqIGFuZCBvcmNoZXN0cmF0ZXMgcHJvdmlzaW9uaW5nIG9mIGFkZC1vbnMsIHRlYW1zIGFuZCBwb3N0IGRlcGxveW1lbnQgaG9va3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBFa3NCbHVlcHJpbnRDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuXG4gICAgcHJpdmF0ZSBhc3luY1Rhc2tzOiBQcm9taXNlPHZvaWQgfCBDb25zdHJ1Y3RbXT47XG5cbiAgICBwcml2YXRlIGNsdXN0ZXJJbmZvOiBzcGkuQ2x1c3RlckluZm87XG5cbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQ6IENvbnN0cnVjdCwgYmx1ZXByaW50UHJvcHM6IEVrc0JsdWVwcmludFByb3BzKSB7XG4gICAgICAgIHN1cGVyKHBhcmVudCwgYmx1ZXByaW50UHJvcHMuaWQgKyBcIi1jdFwiICk7XG4gICAgICAgIHRoaXMudmFsaWRhdGVJbnB1dChibHVlcHJpbnRQcm9wcyk7XG5cbiAgICAgICAgY29uc3Qgc2NvcGUgPSBibHVlcHJpbnRQcm9wcy5jb21wYXRpYmlsaXR5TW9kZSA/IHBhcmVudCA6IHRoaXM7XG5cbiAgICAgICAgY29uc3QgcmVzb3VyY2VDb250ZXh0ID0gdGhpcy5wcm92aWRlTmFtZWRSZXNvdXJjZXMoYmx1ZXByaW50UHJvcHMsIHNjb3BlKTtcblxuICAgICAgICBsZXQgdnBjUmVzb3VyY2U6IElWcGMgfCB1bmRlZmluZWQgPSByZXNvdXJjZUNvbnRleHQuZ2V0KHNwaS5HbG9iYWxSZXNvdXJjZXMuVnBjKTtcblxuICAgICAgICBpZiAoIXZwY1Jlc291cmNlKSB7XG4gICAgICAgICAgICB2cGNSZXNvdXJjZSA9IHJlc291cmNlQ29udGV4dC5hZGQoc3BpLkdsb2JhbFJlc291cmNlcy5WcGMsIG5ldyBWcGNQcm92aWRlcigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB2ZXJzaW9uID0gYmx1ZXByaW50UHJvcHMudmVyc2lvbjtcbiAgICAgICAgaWYgKHZlcnNpb24gPT0gXCJhdXRvXCIpIHtcbiAgICAgICAgICAgIHZlcnNpb24gPSBERUZBVUxUX1ZFUlNJT047XG4gICAgICAgIH1cblxuICAgICAgICBsZXQga21zS2V5UmVzb3VyY2U6IElLZXkgfCB1bmRlZmluZWQgPSByZXNvdXJjZUNvbnRleHQuZ2V0KHNwaS5HbG9iYWxSZXNvdXJjZXMuS21zS2V5KTtcblxuICAgICAgICBpZiAoIWttc0tleVJlc291cmNlICYmIGJsdWVwcmludFByb3BzLnVzZURlZmF1bHRTZWNyZXRFbmNyeXB0aW9uICE9IGZhbHNlKSB7XG4gICAgICAgICAgICBrbXNLZXlSZXNvdXJjZSA9IHJlc291cmNlQ29udGV4dC5hZGQoc3BpLkdsb2JhbFJlc291cmNlcy5LbXNLZXksIG5ldyBDcmVhdGVLbXNLZXlQcm92aWRlcigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJsdWVwcmludFByb3BzID0gdGhpcy5yZXNvbHZlRHluYW1pY1Byb3hpZXMoYmx1ZXByaW50UHJvcHMsIHJlc291cmNlQ29udGV4dCk7XG5cbiAgICAgICAgY29uc3QgY2x1c3RlclByb3ZpZGVyID0gYmx1ZXByaW50UHJvcHMuY2x1c3RlclByb3ZpZGVyID8/IG5ldyBNbmdDbHVzdGVyUHJvdmlkZXIoe1xuICAgICAgICAgICAgaWQ6IGAke2JsdWVwcmludFByb3BzLm5hbWUgPz8gYmx1ZXByaW50UHJvcHMuaWR9LW5nYCxcbiAgICAgICAgICAgIHZlcnNpb25cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jbHVzdGVySW5mbyA9IGNsdXN0ZXJQcm92aWRlci5jcmVhdGVDbHVzdGVyKHNjb3BlLCB2cGNSZXNvdXJjZSEsIGttc0tleVJlc291cmNlLCB2ZXJzaW9uLCBibHVlcHJpbnRQcm9wcy5lbmFibGVDb250cm9sUGxhbmVMb2dUeXBlcyk7XG4gICAgICAgIHRoaXMuY2x1c3RlckluZm8uc2V0UmVzb3VyY2VDb250ZXh0KHJlc291cmNlQ29udGV4dCk7XG5cbiAgICAgICAgaWYgKGJsdWVwcmludFByb3BzLmVuYWJsZUdpdE9wc01vZGUgPT0gc3BpLkdpdE9wc01vZGUuQVBQTElDQVRJT04pIHtcbiAgICAgICAgICAgIEFyZ29HaXRPcHNGYWN0b3J5LmVuYWJsZUdpdE9wcygpO1xuICAgICAgICB9IGVsc2UgaWYgKGJsdWVwcmludFByb3BzLmVuYWJsZUdpdE9wc01vZGUgPT0gc3BpLkdpdE9wc01vZGUuQVBQX09GX0FQUFMpIHtcbiAgICAgICAgICAgIEFyZ29HaXRPcHNGYWN0b3J5LmVuYWJsZUdpdE9wc0FwcE9mQXBwcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcG9zdERlcGxveW1lbnRTdGVwcyA9IEFycmF5PHNwaS5DbHVzdGVyUG9zdERlcGxveT4oKTtcblxuICAgICAgICBmb3IgKGxldCBhZGRPbiBvZiAoYmx1ZXByaW50UHJvcHMuYWRkT25zID8/IFtdKSkgeyAvLyBtdXN0IGl0ZXJhdGUgaW4gdGhlIHN0cmljdCBvcmRlclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYWRkT24uZGVwbG95KHRoaXMuY2x1c3RlckluZm8pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFkZE9uS2V5ID0gdXRpbHMuZ2V0QWRkT25OYW1lT3JJZChhZGRPbik7XG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVySW5mby5hZGRTY2hlZHVsZWRBZGRPbihhZGRPbktleSwgcmVzdWx0LCB1dGlscy5pc09yZGVyZWRBZGRPbihhZGRPbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcG9zdERlcGxveTogYW55ID0gYWRkT247XG4gICAgICAgICAgICBpZiAoKHBvc3REZXBsb3kgYXMgc3BpLkNsdXN0ZXJQb3N0RGVwbG95KS5wb3N0RGVwbG95ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBwb3N0RGVwbG95bWVudFN0ZXBzLnB1c2goPHNwaS5DbHVzdGVyUG9zdERlcGxveT5wb3N0RGVwbG95KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNjaGVkdWxlZEFkZE9ucyA9IHRoaXMuY2x1c3RlckluZm8uZ2V0QWxsU2NoZWR1bGVkQWRkb25zKCk7XG4gICAgICAgIGNvbnN0IGFkZE9uS2V5cyA9IFsuLi5zY2hlZHVsZWRBZGRPbnMua2V5cygpXTtcbiAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBzY2hlZHVsZWRBZGRPbnMudmFsdWVzKCk7XG5cbiAgICAgICAgdGhpcy5hc3luY1Rhc2tzID0gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKGNvbnN0cnVjdHMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0cnVjdHMuZm9yRWFjaCgoY29uc3RydWN0LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2x1c3RlckluZm8uYWRkUHJvdmlzaW9uZWRBZGRPbihhZGRPbktleXNbaW5kZXhdLCBjb25zdHJ1Y3QpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChibHVlcHJpbnRQcm9wcy50ZWFtcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgdGVhbSBvZiBibHVlcHJpbnRQcm9wcy50ZWFtcykge1xuICAgICAgICAgICAgICAgICAgICB0ZWFtLnNldHVwKHRoaXMuY2x1c3RlckluZm8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChsZXQgc3RlcCBvZiBwb3N0RGVwbG95bWVudFN0ZXBzKSB7XG4gICAgICAgICAgICAgICAgc3RlcC5wb3N0RGVwbG95KHRoaXMuY2x1c3RlckluZm8sIGJsdWVwcmludFByb3BzLnRlYW1zID8/IFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hc3luY1Rhc2tzLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2luY2UgY29uc3RydWN0b3IgY2Fubm90IGJlIG1hcmtlZCBhcyBhc3luYywgYWRkaW5nIGEgc2VwYXJhdGUgbWV0aG9kIHRvIHdhaXRcbiAgICAgKiBmb3IgYXN5bmMgY29kZSB0byBmaW5pc2guXG4gICAgICogQHJldHVybnMgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBibHVlcHJpbnRcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgd2FpdEZvckFzeW5jVGFza3MoKTogUHJvbWlzZTxFa3NCbHVlcHJpbnRDb25zdHJ1Y3Q+IHtcbiAgICAgICAgaWYgKHRoaXMuYXN5bmNUYXNrcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXN5bmNUYXNrcy50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcmV0dXJucyBhbGwgdGhlIGNvbnN0cnVjdHMgcHJvZHVjZWQgYnkgZHVyaW5nIHRoZSBjbHVzdGVyIGNyZWF0aW9uIChlLmcuIGFkZC1vbnMpLlxuICAgICAqIE1heSBiZSB1c2VkIGluIHRlc3RpbmcgZm9yIHZlcmlmaWNhdGlvbi5cbiAgICAgKiBAcmV0dXJucyBBc3luYyBUYXNrcyBvYmplY3RcbiAgICAgKi9cbiAgICBnZXRBc3luY1Rhc2tzKCk6IFByb21pc2U8dm9pZCB8IENvbnN0cnVjdFtdPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzeW5jVGFza3M7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcmV0dXJucyBhbGwgdGhlIGNvbnN0cnVjdHMgcHJvZHVjZWQgYnkgZHVyaW5nIHRoZSBjbHVzdGVyIGNyZWF0aW9uIChlLmcuIGFkZC1vbnMpLlxuICAgICAqIE1heSBiZSB1c2VkIGluIHRlc3RpbmcgZm9yIHZlcmlmaWNhdGlvbi5cbiAgICAgKiBAcmV0dXJucyBjbHVzdGVyIGluZm8gb2JqZWN0XG4gICAgICovXG4gICAgZ2V0Q2x1c3RlckluZm8oKTogc3BpLkNsdXN0ZXJJbmZvIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2x1c3RlckluZm87XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm92aWRlTmFtZWRSZXNvdXJjZXMoYmx1ZXByaW50UHJvcHM6IEVrc0JsdWVwcmludFByb3BzLCBzY29wZTogQ29uc3RydWN0KTogc3BpLlJlc291cmNlQ29udGV4dCB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBzcGkuUmVzb3VyY2VDb250ZXh0KHNjb3BlLCBibHVlcHJpbnRQcm9wcyk7XG5cbiAgICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIGJsdWVwcmludFByb3BzLnJlc291cmNlUHJvdmlkZXJzID8/IFtdKSB7XG4gICAgICAgICAgICByZXN1bHQuYWRkKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlcyBhbGwgZHluYW1pYyBwcm94aWVzLCB0aGF0IHN1YnN0aXR1dGVzIHJlc291cmNlIHByb3ZpZGVyIHByb3hpZXMgd2l0aCB0aGUgcmVzb2x2ZWQgdmFsdWVzLlxuICAgICAqIEBwYXJhbSBibHVlcHJpbnRQcm9wc1xuICAgICAqIEBwYXJhbSByZXNvdXJjZUNvbnRleHRcbiAgICAgKiBAcmV0dXJucyBhIGNvcHkgb2YgYmx1ZXByaW50IHByb3BzIHdpdGggcmVzb2x2ZWQgdmFsdWVzXG4gICAgICovXG4gICAgcHJpdmF0ZSByZXNvbHZlRHluYW1pY1Byb3hpZXMoYmx1ZXByaW50UHJvcHM6IEVrc0JsdWVwcmludFByb3BzLCByZXNvdXJjZUNvbnRleHQ6IHNwaS5SZXNvdXJjZUNvbnRleHQpIDogRWtzQmx1ZXByaW50UHJvcHMge1xuICAgICAgICByZXR1cm4gdXRpbHMuY2xvbmVEZWVwKGJsdWVwcmludFByb3BzLCAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB1dGlscy5yZXNvbHZlVGFyZ2V0KHZhbHVlLCByZXNvdXJjZUNvbnRleHQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZXMgaW5wdXQgYWdhaW5zdCBiYXNpYyBkZWZpbmVkIGNvbnN0cmFpbnRzLlxuICAgICAqIEBwYXJhbSBibHVlcHJpbnRQcm9wc1xuICAgICAqL1xuICAgIHByaXZhdGUgdmFsaWRhdGVJbnB1dChibHVlcHJpbnRQcm9wczogRWtzQmx1ZXByaW50UHJvcHMpIHtcbiAgICAgICAgY29uc3QgdGVhbU5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0cmFpbnRzLnZhbGlkYXRlQ29uc3RyYWludHMobmV3IEJsdWVwcmludFByb3BzQ29uc3RyYWludHMsIEVrc0JsdWVwcmludFByb3BzLm5hbWUsIGJsdWVwcmludFByb3BzKTtcbiAgICAgICAgaWYgKGJsdWVwcmludFByb3BzLnRlYW1zKSB7XG4gICAgICAgICAgICBibHVlcHJpbnRQcm9wcy50ZWFtcy5mb3JFYWNoKGUgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0ZWFtTmFtZXMuaGFzKGUubmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUZWFtICR7ZS5uYW1lfSBpcyByZWdpc3RlcmVkIG1vcmUgdGhhbiBvbmNlYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRlYW1OYW1lcy5hZGQoZS5uYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4iXX0=