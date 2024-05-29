"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EksBlueprint = exports.BlueprintBuilder = exports.BlueprintPropsConstraints = exports.EksBlueprintProps = exports.ControlPlaneLogType = exports.DEFAULT_VERSION = void 0;
const cdk = require("aws-cdk-lib");
const aws_eks_1 = require("aws-cdk-lib/aws-eks");
Object.defineProperty(exports, "ControlPlaneLogType", { enumerable: true, get: function () { return aws_eks_1.ClusterLoggingTypes; } });
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
class BlueprintBuilder {
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
    clone(region, account) {
        return new BlueprintBuilder().withBlueprintProps(this.props)
            .account(account !== null && account !== void 0 ? account : this.env.account).region(region !== null && region !== void 0 ? region : this.env.region);
    }
    withEnv(env) {
        this.env.account = env.account;
        this.env.region = env.region;
        return this;
    }
    build(scope, id, stackProps) {
        return new EksBlueprint(scope, { ...this.props, ...{ id } }, { ...{ env: this.env }, ...stackProps });
    }
    async buildAsync(scope, id, stackProps) {
        return this.build(scope, id, stackProps).waitForAsyncTasks();
    }
}
exports.BlueprintBuilder = BlueprintBuilder;
/**
 * Entry point to the platform provisioning. Creates a CFN stack based on the provided configuration
 * and orchestrates provisioning of add-ons, teams and post deployment hooks.
 */
class EksBlueprint extends cdk.Stack {
    static builder() {
        return new BlueprintBuilder();
    }
    constructor(scope, blueprintProps, props) {
        var _a, _b, _c;
        super(scope, blueprintProps.id, utils.withUsageTracking(EksBlueprint.USAGE_ID, props));
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
exports.EksBlueprint = EksBlueprint;
EksBlueprint.USAGE_ID = "qs-1s1r465hk";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWtzLWJsdWVwcmludC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9zdGFja3MvZWtzLWJsdWVwcmludC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFFbkMsaURBQW9HO0FBa0IzRixvR0FsQnVCLDZCQUFtQixPQWtCdkI7QUFoQjVCLG9GQUErRTtBQUMvRSxtREFBd0Q7QUFDeEQsOEJBQThCO0FBQzlCLDBEQUEwRDtBQUMxRCxrQ0FBa0M7QUFDbEMsb0NBQXFDO0FBRXJDLDJEQUFtRTtBQUNuRSw4RUFBeUU7QUFFekUsMkNBQTJDO0FBQzlCLFFBQUEsZUFBZSxHQUFHLDJCQUFpQixDQUFDLEtBQUssQ0FBQztBQU92RCxNQUFhLGlCQUFpQjtJQUE5QjtRQVdJOztXQUVHO1FBQ00sV0FBTSxHQUE2QixFQUFFLENBQUM7UUFFL0M7O1dBRUc7UUFDTSxVQUFLLEdBQXFCLEVBQUUsQ0FBQztRQUV0Qzs7O1dBR0c7UUFDTSxvQkFBZSxHQUF5QixJQUFJLHlDQUFrQixFQUFFLENBQUM7UUFPMUU7Ozs7V0FJRztRQUNILHNCQUFpQixHQUF1QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBUWxFOzs7Ozs7O1dBT0c7UUFDTSwrQkFBMEIsR0FBZSxJQUFJLENBQUM7SUFNM0QsQ0FBQztDQUFBO0FBM0RELDhDQTJEQztBQUVELE1BQWEseUJBQXlCO0lBQXRDO1FBQ0k7OztVQUdFO1FBQ0YsT0FBRSxHQUFHLElBQUksV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU3Qzs7O1VBR0U7UUFDRixTQUFJLEdBQUcsSUFBSSxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELENBQUM7Q0FBQTtBQVpELDhEQVlDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQWEsZ0JBQWdCO0lBUXpCO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FB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YyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3ZCLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUM3QixJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSwrQkFBK0IsQ0FBQyxDQUFDO2dCQUNuRSxDQUFDO2dCQUNELFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUM7O0FBdkpMLG9DQXdKQztBQXRKbUIscUJBQVEsR0FBRyxjQUFjLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgSVZwYyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0IHsgQ2x1c3RlckxvZ2dpbmdUeXBlcyBhcyBDb250cm9sUGxhbmVMb2dUeXBlLCBLdWJlcm5ldGVzVmVyc2lvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBNbmdDbHVzdGVyUHJvdmlkZXIgfSBmcm9tICcuLi9jbHVzdGVyLXByb3ZpZGVycy9tbmctY2x1c3Rlci1wcm92aWRlcic7XG5pbXBvcnQgeyBWcGNQcm92aWRlciB9IGZyb20gJy4uL3Jlc291cmNlLXByb3ZpZGVycy92cGMnO1xuaW1wb3J0ICogYXMgc3BpIGZyb20gJy4uL3NwaSc7XG5pbXBvcnQgKiBhcyBjb25zdHJhaW50cyBmcm9tICcuLi91dGlscy9jb25zdHJhaW50cy11dGlscyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBjbG9uZURlZXAgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBJS2V5IH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1rbXNcIjtcbmltcG9ydCB7Q3JlYXRlS21zS2V5UHJvdmlkZXJ9IGZyb20gXCIuLi9yZXNvdXJjZS1wcm92aWRlcnMva21zLWtleVwiO1xuaW1wb3J0IHsgQXJnb0dpdE9wc0ZhY3RvcnkgfSBmcm9tIFwiLi4vYWRkb25zL2FyZ29jZC9hcmdvLWdpdG9wcy1mYWN0b3J5XCI7XG5cbi8qIERlZmF1bHQgSzhzIHZlcnNpb24gb2YgRUtTIEJsdWVwcmludHMgKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1ZFUlNJT04gPSBLdWJlcm5ldGVzVmVyc2lvbi5WMV8yOTtcblxuLyoqXG4gKiAgRXhwb3J0aW5nIGNvbnRyb2wgcGxhbmUgbG9nIHR5cGUgc28gdGhhdCBjdXN0b21lcnMgZG9uJ3QgaGF2ZSB0byBpbXBvcnQgQ0RLIEVLUyBtb2R1bGUgZm9yIGJsdWVwcmludCBjb25maWd1cmF0aW9uLiBcbiAqLyAgXG5leHBvcnQgeyBDb250cm9sUGxhbmVMb2dUeXBlIH07XG5cbmV4cG9ydCBjbGFzcyBFa3NCbHVlcHJpbnRQcm9wcyB7XG4gICAgLyoqXG4gICAgICogVGhlIGlkIGZvciB0aGUgYmx1ZXByaW50LlxuICAgICAqL1xuICAgIHJlYWRvbmx5IGlkOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0cyB0byBpZCBpZiBub3QgcHJvdmlkZWRcbiAgICAgKi9cbiAgICByZWFkb25seSBuYW1lPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogQWRkLW9ucyBpZiBhbnkuXG4gICAgICovXG4gICAgcmVhZG9ubHkgYWRkT25zPzogQXJyYXk8c3BpLkNsdXN0ZXJBZGRPbj4gPSBbXTtcblxuICAgIC8qKlxuICAgICAqIFRlYW1zIGlmIGFueVxuICAgICAqL1xuICAgIHJlYWRvbmx5IHRlYW1zPzogQXJyYXk8c3BpLlRlYW0+ID0gW107XG5cbiAgICAvKipcbiAgICAgKiBFQzIgb3IgRmFyZ2F0ZSBhcmUgc3VwcG9ydGVkIGluIHRoZSBibHVlcHJpbnQgYnV0IGFueSBpbXBsZW1lbnRhdGlvbiBjb25mb3JtaW5nIHRoZSBpbnRlcmZhY2VcbiAgICAgKiB3aWxsIHdvcmtcbiAgICAgKi9cbiAgICByZWFkb25seSBjbHVzdGVyUHJvdmlkZXI/OiBzcGkuQ2x1c3RlclByb3ZpZGVyID0gbmV3IE1uZ0NsdXN0ZXJQcm92aWRlcigpO1xuXG4gICAgLyoqXG4gICAgICogS3ViZXJuZXRlcyB2ZXJzaW9uIChtdXN0IGJlIGluaXRpYWxpemVkIGZvciBhZGRvbnMgdG8gd29yayBwcm9wZXJseSlcbiAgICAgKi9cbiAgICByZWFkb25seSB2ZXJzaW9uPzogS3ViZXJuZXRlc1ZlcnNpb24gfCBcImF1dG9cIjtcblxuICAgIC8qKlxuICAgICAqIE5hbWVkIHJlc291cmNlIHByb3ZpZGVycyB0byBsZXZlcmFnZSBmb3IgY2x1c3RlciByZXNvdXJjZXMuXG4gICAgICogVGhlIHJlc291cmNlIGNhbiByZXByZXNlbnQgVnBjLCBIb3N0aW5nIFpvbmVzIG9yIG90aGVyIHJlc291cmNlcywgc2VlIHtAbGluayBzcGkuUmVzb3VyY2VUeXBlfS5cbiAgICAgKiBWUEMgZm9yIHRoZSBjbHVzdGVyIGNhbiBiZSByZWdpc3RlcmVkIHVuZGVyIHRoZSBuYW1lIG9mICd2cGMnIG9yIGFzIGEgc2luZ2xlIHByb3ZpZGVyIG9mIHR5cGVcbiAgICAgKi9cbiAgICByZXNvdXJjZVByb3ZpZGVycz86IE1hcDxzdHJpbmcsIHNwaS5SZXNvdXJjZVByb3ZpZGVyPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIENvbnRyb2wgUGxhbmUgbG9nIHR5cGVzIHRvIGJlIGVuYWJsZWQgKGlmIG5vdCBwYXNzZWQsIG5vbmUpXG4gICAgICogSWYgd3JvbmcgdHlwZXMgYXJlIGluY2x1ZGVkLCB3aWxsIHRocm93IGFuIGVycm9yLlxuICAgICAqL1xuICAgIHJlYWRvbmx5IGVuYWJsZUNvbnRyb2xQbGFuZUxvZ1R5cGVzPzogQ29udHJvbFBsYW5lTG9nVHlwZVtdO1xuXG4gICAgLyoqXG4gICAgICogSWYgc2V0IHRvIHRydWUgYW5kIG5vIHJlc291Y2UgcHJvdmlkZXIgZm9yIEtNUyBrZXkgaXMgZGVmaW5lZCAodW5kZXIgR2xvYmFsUmVzb3VyY2VzLkttc0tleSksXG4gICAgICogYSBkZWZhdWx0IEtNUyBlbmNyeXB0aW9uIGtleSB3aWxsIGJlIHVzZWQgZm9yIGVudmVsb3BlIGVuY3J5cHRpb24gb2YgS3ViZXJuZXRlcyBzZWNyZXRzIChBV1MgbWFuYWdlZCBuZXcgS01TIGtleSkuXG4gICAgICogSWYgc2V0IHRvIGZhbHNlLCBhbmQgbm8gcmVzb3VjZSBwcm92aWRlciBmb3IgS01TIGtleSBpcyBkZWZpbmVkICh1bmRlciBHbG9iYWxSZXNvdXJjZXMuS21zS2V5KSwgdGhlbiBubyBzZWNyZXRzIFxuICAgICAqIGVuY3lycHRpb24gaXMgYXBwbGllZC5cbiAgICAgKiBcbiAgICAgKiBEZWZhdWx0IGlzIHRydWUuXG4gICAgICovXG4gICAgcmVhZG9ubHkgdXNlRGVmYXVsdFNlY3JldEVuY3J5cHRpb24/IDogYm9vbGVhbiAgPSB0cnVlO1xuXG4gICAgLyoqXG4gICAgICogR2l0T3BzIG1vZGVzIHRvIGJlIGVuYWJsZWQuIElmIG5vdCBzcGVjaWZpZWQsIEdpdE9wcyBtb2RlIGlzIG5vdCBlbmFibGVkLlxuICAgICAqL1xuICAgIHJlYWRvbmx5IGVuYWJsZUdpdE9wc01vZGU/OiBzcGkuR2l0T3BzTW9kZTtcbn1cblxuZXhwb3J0IGNsYXNzIEJsdWVwcmludFByb3BzQ29uc3RyYWludHMgaW1wbGVtZW50cyBjb25zdHJhaW50cy5Db25zdHJhaW50c1R5cGU8RWtzQmx1ZXByaW50UHJvcHM+IHtcbiAgICAvKipcbiAgICAqIGlkIGNhbiBiZSBubyBsZXNzIHRoYW4gMSBjaGFyYWN0ZXIgbG9uZywgYW5kIG5vIGdyZWF0ZXIgdGhhbiA2MyBjaGFyYWN0ZXJzIGxvbmcuXG4gICAgKiBodHRwczovL2t1YmVybmV0ZXMuaW8vZG9jcy9jb25jZXB0cy9vdmVydmlldy93b3JraW5nLXdpdGgtb2JqZWN0cy9uYW1lcy9cbiAgICAqL1xuICAgIGlkID0gbmV3IGNvbnN0cmFpbnRzLlN0cmluZ0NvbnN0cmFpbnQoMSwgNjMpO1xuXG4gICAgLyoqXG4gICAgKiBuYW1lIGNhbiBiZSBubyBsZXNzIHRoYW4gMSBjaGFyYWN0ZXIgbG9uZywgYW5kIG5vIGdyZWF0ZXIgdGhhbiA2MyBjaGFyYWN0ZXJzIGxvbmcuXG4gICAgKiBodHRwczovL2t1YmVybmV0ZXMuaW8vZG9jcy9jb25jZXB0cy9vdmVydmlldy93b3JraW5nLXdpdGgtb2JqZWN0cy9uYW1lcy9cbiAgICAqL1xuICAgIG5hbWUgPSBuZXcgY29uc3RyYWludHMuU3RyaW5nQ29uc3RyYWludCgxLCA2Myk7XG59XG5cbi8qKlxuICogQmx1ZXByaW50IGJ1aWxkZXIgaW1wbGVtZW50cyBhIGJ1aWxkZXIgcGF0dGVybiB0aGF0IGltcHJvdmVzIHJlYWRhYmlsaXR5IChubyBibG9hdGVkIGNvbnN0cnVjdG9ycylcbiAqIGFuZCBhbGxvd3MgY3JlYXRpbmcgYSBibHVlcHJpbnQgaW4gYW4gYWJzdHJhY3Qgc3RhdGUgdGhhdCBjYW4gYmUgYXBwbGllZCB0byB2YXJpb3VzIGluc3RhbnRpYXRpb25zXG4gKiBpbiBhY2NvdW50cyBhbmQgcmVnaW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIEJsdWVwcmludEJ1aWxkZXIgaW1wbGVtZW50cyBzcGkuQXN5bmNTdGFja0J1aWxkZXIge1xuXG4gICAgcHJvcHM6IFBhcnRpYWw8RWtzQmx1ZXByaW50UHJvcHM+O1xuICAgIGVudjoge1xuICAgICAgICBhY2NvdW50Pzogc3RyaW5nLFxuICAgICAgICByZWdpb24/OiBzdHJpbmdcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IGFkZE9uczogbmV3IEFycmF5PHNwaS5DbHVzdGVyQWRkT24+KCksIHRlYW1zOiBuZXcgQXJyYXk8c3BpLlRlYW0+KCksIHJlc291cmNlUHJvdmlkZXJzOiBuZXcgTWFwKCkgfTtcbiAgICAgICAgdGhpcy5lbnYgPSB7XG4gICAgICAgICAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxuICAgICAgICAgICAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT05cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmFtZShuYW1lOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4ueyBuYW1lIH0gfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGFjY291bnQoYWNjb3VudD86IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLmVudi5hY2NvdW50ID0gYWNjb3VudDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHJlZ2lvbihyZWdpb24/OiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5lbnYucmVnaW9uID0gcmVnaW9uO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgdmVyc2lvbih2ZXJzaW9uOiBcImF1dG9cIiB8IEt1YmVybmV0ZXNWZXJzaW9uKTogdGhpcyB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLnsgdmVyc2lvbjogdmVyc2lvbiB9IH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBlbmFibGVDb250cm9sUGxhbmVMb2dUeXBlcyguLi50eXBlczogQ29udHJvbFBsYW5lTG9nVHlwZVtdKTogdGhpcyB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLnsgZW5hYmxlQ29udHJvbFBsYW5lTG9nVHlwZXM6IHR5cGVzIH0gfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGVuYWJsZUdpdE9wcyhtb2RlPzogc3BpLkdpdE9wc01vZGUpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4ueyBlbmFibGVHaXRPcHNNb2RlOiBtb2RlID8/IHNwaS5HaXRPcHNNb2RlLkFQUF9PRl9BUFBTIH0gfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHdpdGhCbHVlcHJpbnRQcm9wcyhwcm9wczogUGFydGlhbDxFa3NCbHVlcHJpbnRQcm9wcz4pOiB0aGlzIHtcbiAgICAgICAgY29uc3QgcmVzb3VyY2VQcm92aWRlcnMgPSB0aGlzLnByb3BzLnJlc291cmNlUHJvdmlkZXJzITtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4uY2xvbmVEZWVwKHByb3BzKSB9O1xuICAgICAgICBpZiAocHJvcHMucmVzb3VyY2VQcm92aWRlcnMpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucmVzb3VyY2VQcm92aWRlcnMgPSBuZXcgTWFwKFsuLi5yZXNvdXJjZVByb3ZpZGVycyEuZW50cmllcygpLCAuLi5wcm9wcy5yZXNvdXJjZVByb3ZpZGVycy5lbnRyaWVzKCldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkT25zKC4uLmFkZE9uczogc3BpLkNsdXN0ZXJBZGRPbltdKTogdGhpcyB7XG4gICAgICAgIHRoaXMucHJvcHMgPSB7IC4uLnRoaXMucHJvcHMsIC4uLnsgYWRkT25zOiB0aGlzLnByb3BzLmFkZE9ucz8uY29uY2F0KGFkZE9ucykgfSB9O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgY2x1c3RlclByb3ZpZGVyKGNsdXN0ZXJQcm92aWRlcjogc3BpLkNsdXN0ZXJQcm92aWRlcikge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi57IGNsdXN0ZXJQcm92aWRlcjogY2x1c3RlclByb3ZpZGVyIH0gfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGlkKGlkOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4ueyBpZCB9IH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyB0ZWFtcyguLi50ZWFtczogc3BpLlRlYW1bXSk6IHRoaXMge1xuICAgICAgICB0aGlzLnByb3BzID0geyAuLi50aGlzLnByb3BzLCAuLi57IHRlYW1zOiB0aGlzLnByb3BzLnRlYW1zPy5jb25jYXQodGVhbXMpIH0gfTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHJlc291cmNlUHJvdmlkZXIobmFtZTogc3RyaW5nLCBwcm92aWRlcjogc3BpLlJlc291cmNlUHJvdmlkZXIpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5wcm9wcy5yZXNvdXJjZVByb3ZpZGVycz8uc2V0KG5hbWUsIHByb3ZpZGVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHVzZURlZmF1bHRTZWNyZXRFbmNyeXB0aW9uKHVzZURlZmF1bHQ6IGJvb2xlYW4pOiB0aGlzIHtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHsgLi4udGhpcy5wcm9wcywgLi4ueyB1c2VEZWZhdWx0U2VjcmV0RW5jcnlwdGlvbjogdXNlRGVmYXVsdCB9IH07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBjbG9uZShyZWdpb24/OiBzdHJpbmcsIGFjY291bnQ/OiBzdHJpbmcpOiBCbHVlcHJpbnRCdWlsZGVyIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCbHVlcHJpbnRCdWlsZGVyKCkud2l0aEJsdWVwcmludFByb3BzKHRoaXMucHJvcHMpXG4gICAgICAgICAgICAuYWNjb3VudChhY2NvdW50ID8/IHRoaXMuZW52LmFjY291bnQpLnJlZ2lvbihyZWdpb24gPz8gdGhpcy5lbnYucmVnaW9uKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgd2l0aEVudihlbnY6IGNkay5FbnZpcm9ubWVudCk6IHRoaXMge1xuICAgICAgICB0aGlzLmVudi5hY2NvdW50ID0gZW52LmFjY291bnQ7XG4gICAgICAgIHRoaXMuZW52LnJlZ2lvbiA9IGVudi5yZWdpb247XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBidWlsZChzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBzdGFja1Byb3BzPzogY2RrLlN0YWNrUHJvcHMpOiBFa3NCbHVlcHJpbnQge1xuICAgICAgICByZXR1cm4gbmV3IEVrc0JsdWVwcmludChzY29wZSwgeyAuLi50aGlzLnByb3BzLCAuLi57IGlkIH0gfSxcbiAgICAgICAgICAgIHsgLi4ueyBlbnY6IHRoaXMuZW52IH0sIC4uLnN0YWNrUHJvcHMgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGJ1aWxkQXN5bmMoc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgc3RhY2tQcm9wcz86IGNkay5TdGFja1Byb3BzKTogUHJvbWlzZTxFa3NCbHVlcHJpbnQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVpbGQoc2NvcGUsIGlkLCBzdGFja1Byb3BzKS53YWl0Rm9yQXN5bmNUYXNrcygpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBFbnRyeSBwb2ludCB0byB0aGUgcGxhdGZvcm0gcHJvdmlzaW9uaW5nLiBDcmVhdGVzIGEgQ0ZOIHN0YWNrIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBjb25maWd1cmF0aW9uXG4gKiBhbmQgb3JjaGVzdHJhdGVzIHByb3Zpc2lvbmluZyBvZiBhZGQtb25zLCB0ZWFtcyBhbmQgcG9zdCBkZXBsb3ltZW50IGhvb2tzLlxuICovXG5leHBvcnQgY2xhc3MgRWtzQmx1ZXByaW50IGV4dGVuZHMgY2RrLlN0YWNrIHtcblxuICAgIHN0YXRpYyByZWFkb25seSBVU0FHRV9JRCA9IFwicXMtMXMxcjQ2NWhrXCI7XG5cbiAgICBwcml2YXRlIGFzeW5jVGFza3M6IFByb21pc2U8dm9pZCB8IENvbnN0cnVjdFtdPjtcblxuICAgIHByaXZhdGUgY2x1c3RlckluZm86IHNwaS5DbHVzdGVySW5mbztcblxuICAgIHB1YmxpYyBzdGF0aWMgYnVpbGRlcigpOiBCbHVlcHJpbnRCdWlsZGVyIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCbHVlcHJpbnRCdWlsZGVyKCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgYmx1ZXByaW50UHJvcHM6IEVrc0JsdWVwcmludFByb3BzLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBibHVlcHJpbnRQcm9wcy5pZCwgdXRpbHMud2l0aFVzYWdlVHJhY2tpbmcoRWtzQmx1ZXByaW50LlVTQUdFX0lELCBwcm9wcykpO1xuICAgICAgICB0aGlzLnZhbGlkYXRlSW5wdXQoYmx1ZXByaW50UHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IHJlc291cmNlQ29udGV4dCA9IHRoaXMucHJvdmlkZU5hbWVkUmVzb3VyY2VzKGJsdWVwcmludFByb3BzKTtcblxuICAgICAgICBsZXQgdnBjUmVzb3VyY2U6IElWcGMgfCB1bmRlZmluZWQgPSByZXNvdXJjZUNvbnRleHQuZ2V0KHNwaS5HbG9iYWxSZXNvdXJjZXMuVnBjKTtcblxuICAgICAgICBpZiAoIXZwY1Jlc291cmNlKSB7XG4gICAgICAgICAgICB2cGNSZXNvdXJjZSA9IHJlc291cmNlQ29udGV4dC5hZGQoc3BpLkdsb2JhbFJlc291cmNlcy5WcGMsIG5ldyBWcGNQcm92aWRlcigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB2ZXJzaW9uID0gYmx1ZXByaW50UHJvcHMudmVyc2lvbjtcbiAgICAgICAgaWYgKHZlcnNpb24gPT0gXCJhdXRvXCIpIHtcbiAgICAgICAgICAgIHZlcnNpb24gPSBERUZBVUxUX1ZFUlNJT047XG4gICAgICAgIH1cblxuICAgICAgICBsZXQga21zS2V5UmVzb3VyY2U6IElLZXkgfCB1bmRlZmluZWQgPSByZXNvdXJjZUNvbnRleHQuZ2V0KHNwaS5HbG9iYWxSZXNvdXJjZXMuS21zS2V5KTtcblxuICAgICAgICBpZiAoIWttc0tleVJlc291cmNlICYmIGJsdWVwcmludFByb3BzLnVzZURlZmF1bHRTZWNyZXRFbmNyeXB0aW9uICE9IGZhbHNlKSB7XG4gICAgICAgICAgICBrbXNLZXlSZXNvdXJjZSA9IHJlc291cmNlQ29udGV4dC5hZGQoc3BpLkdsb2JhbFJlc291cmNlcy5LbXNLZXksIG5ldyBDcmVhdGVLbXNLZXlQcm92aWRlcigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJsdWVwcmludFByb3BzID0gdGhpcy5yZXNvbHZlRHluYW1pY1Byb3hpZXMoYmx1ZXByaW50UHJvcHMsIHJlc291cmNlQ29udGV4dCk7XG5cbiAgICAgICAgY29uc3QgY2x1c3RlclByb3ZpZGVyID0gYmx1ZXByaW50UHJvcHMuY2x1c3RlclByb3ZpZGVyID8/IG5ldyBNbmdDbHVzdGVyUHJvdmlkZXIoe1xuICAgICAgICAgICAgaWQ6IGAke2JsdWVwcmludFByb3BzLm5hbWUgPz8gYmx1ZXByaW50UHJvcHMuaWR9LW5nYCxcbiAgICAgICAgICAgIHZlcnNpb25cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jbHVzdGVySW5mbyA9IGNsdXN0ZXJQcm92aWRlci5jcmVhdGVDbHVzdGVyKHRoaXMsIHZwY1Jlc291cmNlISwga21zS2V5UmVzb3VyY2UsIHZlcnNpb24sIGJsdWVwcmludFByb3BzLmVuYWJsZUNvbnRyb2xQbGFuZUxvZ1R5cGVzKTtcbiAgICAgICAgdGhpcy5jbHVzdGVySW5mby5zZXRSZXNvdXJjZUNvbnRleHQocmVzb3VyY2VDb250ZXh0KTtcblxuICAgICAgICBpZiAoYmx1ZXByaW50UHJvcHMuZW5hYmxlR2l0T3BzTW9kZSA9PSBzcGkuR2l0T3BzTW9kZS5BUFBMSUNBVElPTikge1xuICAgICAgICAgICAgQXJnb0dpdE9wc0ZhY3RvcnkuZW5hYmxlR2l0T3BzKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYmx1ZXByaW50UHJvcHMuZW5hYmxlR2l0T3BzTW9kZSA9PSBzcGkuR2l0T3BzTW9kZS5BUFBfT0ZfQVBQUykge1xuICAgICAgICAgICAgQXJnb0dpdE9wc0ZhY3RvcnkuZW5hYmxlR2l0T3BzQXBwT2ZBcHBzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwb3N0RGVwbG95bWVudFN0ZXBzID0gQXJyYXk8c3BpLkNsdXN0ZXJQb3N0RGVwbG95PigpO1xuXG4gICAgICAgIGZvciAobGV0IGFkZE9uIG9mIChibHVlcHJpbnRQcm9wcy5hZGRPbnMgPz8gW10pKSB7IC8vIG11c3QgaXRlcmF0ZSBpbiB0aGUgc3RyaWN0IG9yZGVyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhZGRPbi5kZXBsb3kodGhpcy5jbHVzdGVySW5mbyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWRkT25LZXkgPSB1dGlscy5nZXRBZGRPbk5hbWVPcklkKGFkZE9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsdXN0ZXJJbmZvLmFkZFNjaGVkdWxlZEFkZE9uKGFkZE9uS2V5LCByZXN1bHQsIHV0aWxzLmlzT3JkZXJlZEFkZE9uKGFkZE9uKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwb3N0RGVwbG95OiBhbnkgPSBhZGRPbjtcbiAgICAgICAgICAgIGlmICgocG9zdERlcGxveSBhcyBzcGkuQ2x1c3RlclBvc3REZXBsb3kpLnBvc3REZXBsb3kgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHBvc3REZXBsb3ltZW50U3RlcHMucHVzaCg8c3BpLkNsdXN0ZXJQb3N0RGVwbG95PnBvc3REZXBsb3kpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2NoZWR1bGVkQWRkT25zID0gdGhpcy5jbHVzdGVySW5mby5nZXRBbGxTY2hlZHVsZWRBZGRvbnMoKTtcbiAgICAgICAgY29uc3QgYWRkT25LZXlzID0gWy4uLnNjaGVkdWxlZEFkZE9ucy5rZXlzKCldO1xuICAgICAgICBjb25zdCBwcm9taXNlcyA9IHNjaGVkdWxlZEFkZE9ucy52YWx1ZXMoKTtcblxuICAgICAgICB0aGlzLmFzeW5jVGFza3MgPSBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigoY29uc3RydWN0cykgPT4ge1xuICAgICAgICAgICAgY29uc3RydWN0cy5mb3JFYWNoKChjb25zdHJ1Y3QsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbHVzdGVySW5mby5hZGRQcm92aXNpb25lZEFkZE9uKGFkZE9uS2V5c1tpbmRleF0sIGNvbnN0cnVjdCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGJsdWVwcmludFByb3BzLnRlYW1zICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0ZWFtIG9mIGJsdWVwcmludFByb3BzLnRlYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIHRlYW0uc2V0dXAodGhpcy5jbHVzdGVySW5mbyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGxldCBzdGVwIG9mIHBvc3REZXBsb3ltZW50U3RlcHMpIHtcbiAgICAgICAgICAgICAgICBzdGVwLnBvc3REZXBsb3kodGhpcy5jbHVzdGVySW5mbywgYmx1ZXByaW50UHJvcHMudGVhbXMgPz8gW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFzeW5jVGFza3MuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaW5jZSBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgbWFya2VkIGFzIGFzeW5jLCBhZGRpbmcgYSBzZXBhcmF0ZSBtZXRob2QgdG8gd2FpdFxuICAgICAqIGZvciBhc3luYyBjb2RlIHRvIGZpbmlzaC5cbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGJsdWVwcmludFxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyB3YWl0Rm9yQXN5bmNUYXNrcygpOiBQcm9taXNlPEVrc0JsdWVwcmludD4ge1xuICAgICAgICBpZiAodGhpcy5hc3luY1Rhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hc3luY1Rhc2tzLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCByZXR1cm5zIGFsbCB0aGUgY29uc3RydWN0cyBwcm9kdWNlZCBieSBkdXJpbmcgdGhlIGNsdXN0ZXIgY3JlYXRpb24gKGUuZy4gYWRkLW9ucykuXG4gICAgICogTWF5IGJlIHVzZWQgaW4gdGVzdGluZyBmb3IgdmVyaWZpY2F0aW9uLlxuICAgICAqIEByZXR1cm5zIGNsdXN0ZXIgaW5mbyBvYmplY3RcbiAgICAgKi9cbiAgICBnZXRDbHVzdGVySW5mbygpOiBzcGkuQ2x1c3RlckluZm8ge1xuICAgICAgICByZXR1cm4gdGhpcy5jbHVzdGVySW5mbztcbiAgICB9XG5cbiAgICBwcml2YXRlIHByb3ZpZGVOYW1lZFJlc291cmNlcyhibHVlcHJpbnRQcm9wczogRWtzQmx1ZXByaW50UHJvcHMpOiBzcGkuUmVzb3VyY2VDb250ZXh0IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IHNwaS5SZXNvdXJjZUNvbnRleHQodGhpcywgYmx1ZXByaW50UHJvcHMpO1xuXG4gICAgICAgIGZvciAobGV0IFtrZXksIHZhbHVlXSBvZiBibHVlcHJpbnRQcm9wcy5yZXNvdXJjZVByb3ZpZGVycyA/PyBbXSkge1xuICAgICAgICAgICAgcmVzdWx0LmFkZChrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzb2x2ZXMgYWxsIGR5bmFtaWMgcHJveGllcywgdGhhdCBzdWJzdGl0dXRlcyByZXNvdXJjZSBwcm92aWRlciBwcm94aWVzIHdpdGggdGhlIHJlc29sdmVkIHZhbHVlcy4gXG4gICAgICogQHBhcmFtIGJsdWVwcmludFByb3BzIFxuICAgICAqIEBwYXJhbSByZXNvdXJjZUNvbnRleHQgXG4gICAgICogQHJldHVybnMgYSBjb3B5IG9mIGJsdWVwcmludCBwcm9wcyB3aXRoIHJlc29sdmVkIHZhbHVlc1xuICAgICAqL1xuICAgIHByaXZhdGUgcmVzb2x2ZUR5bmFtaWNQcm94aWVzKGJsdWVwcmludFByb3BzOiBFa3NCbHVlcHJpbnRQcm9wcywgcmVzb3VyY2VDb250ZXh0OiBzcGkuUmVzb3VyY2VDb250ZXh0KSA6IEVrc0JsdWVwcmludFByb3BzIHtcbiAgICAgICAgcmV0dXJuIHV0aWxzLmNsb25lRGVlcChibHVlcHJpbnRQcm9wcywgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdXRpbHMucmVzb2x2ZVRhcmdldCh2YWx1ZSwgcmVzb3VyY2VDb250ZXh0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGVzIGlucHV0IGFnYWluc3QgYmFzaWMgZGVmaW5lZCBjb25zdHJhaW50cy5cbiAgICAgKiBAcGFyYW0gYmx1ZXByaW50UHJvcHMgXG4gICAgICovXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZUlucHV0KGJsdWVwcmludFByb3BzOiBFa3NCbHVlcHJpbnRQcm9wcykge1xuICAgICAgICBjb25zdCB0ZWFtTmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgY29uc3RyYWludHMudmFsaWRhdGVDb25zdHJhaW50cyhuZXcgQmx1ZXByaW50UHJvcHNDb25zdHJhaW50cywgRWtzQmx1ZXByaW50UHJvcHMubmFtZSwgYmx1ZXByaW50UHJvcHMpO1xuICAgICAgICBpZiAoYmx1ZXByaW50UHJvcHMudGVhbXMpIHtcbiAgICAgICAgICAgIGJsdWVwcmludFByb3BzLnRlYW1zLmZvckVhY2goZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRlYW1OYW1lcy5oYXMoZS5uYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRlYW0gJHtlLm5hbWV9IGlzIHJlZ2lzdGVyZWQgbW9yZSB0aGFuIG9uY2VgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGVhbU5hbWVzLmFkZChlLm5hbWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiJdfQ==