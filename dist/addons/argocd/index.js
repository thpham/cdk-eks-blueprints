"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgoCDAddOn = void 0;
const assert = require("assert");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const bcrypt = require("bcrypt");
const dot = require("dot-object");
const ts_deepmerge_1 = require("ts-deepmerge");
const __1 = require("..");
const spi = require("../../spi");
const utils_1 = require("../../utils");
const helm_addon_1 = require("../helm-addon");
const application_1 = require("./application");
const manifest_utils_1 = require("./manifest-utils");
/**
 * Defaults options for the add-on
 */
const defaultProps = {
    namespace: "argocd",
    version: '7.3.3',
    chart: "argo-cd",
    release: "blueprints-addon-argocd",
    repository: "https://argoproj.github.io/argo-helm"
};
/**
 * Implementation of ArgoCD add-on and post deployment hook.
 */
let ArgoCDAddOn = class ArgoCDAddOn {
    constructor(props) {
        this.options = { ...defaultProps, ...props };
        helm_addon_1.HelmAddOn.validateVersion({
            chart: this.options.chart,
            version: this.options.version,
            repository: this.options.repository
        });
        if (this.options.bootstrapRepo) {
            (0, utils_1.validateConstraints)(new spi.ApplicationRepositoryConstraints, "ArgoCDAddOnProps.bootstrapRepo", this.options.bootstrapRepo);
        }
    }
    generate(clusterInfo, deployment, wave = 0) {
        var _a;
        const promise = clusterInfo.getScheduledAddOn('ArgoCDAddOn');
        if (promise === undefined) {
            throw new Error("ArgoCD addon must be registered before creating Argo managed add-ons for helm applications");
        }
        const manifest = new application_1.ArgoApplication((_a = deployment.repository) !== null && _a !== void 0 ? _a : this.options.bootstrapRepo).generate(deployment, wave);
        const construct = clusterInfo.cluster.addManifest(deployment.name, manifest);
        promise.then(chart => {
            construct.node.addDependency(chart);
        });
        return construct;
    }
    /**
     * Implementation of the add-on contract deploy method.
    */
    async deploy(clusterInfo) {
        var _a, _b;
        const namespace = (0, utils_1.createNamespace)(this.options.namespace, clusterInfo.cluster, true);
        const sa = this.createServiceAccount(clusterInfo);
        sa.node.addDependency(namespace);
        const defaultValues = {};
        dot.set("server.serviceAccount.create", false, defaultValues);
        const secrets = [];
        if ((_a = this.options.bootstrapRepo) === null || _a === void 0 ? void 0 : _a.credentialsSecretName) {
            const repo = this.options.bootstrapRepo;
            secrets.push((0, manifest_utils_1.createSecretRef)(repo.credentialsType, repo.credentialsSecretName));
        }
        if (this.options.adminPasswordSecretName) {
            const adminSecret = await this.createAdminSecret(clusterInfo.cluster.stack.region);
            dot.set("configs.secret.argocdServerAdminPassword", adminSecret, defaultValues, true);
        }
        let secretProviderClass;
        if (secrets.length > 0) {
            secretProviderClass = new __1.SecretProviderClass(clusterInfo, sa, 'blueprints-secret', ...secrets);
            dot.set('server', secretProviderClass.getVolumeMounts('blueprints-secret-inline'), defaultValues, true);
        }
        this.getAllRepositories().forEach((repo, index) => {
            var _a;
            const repoName = ((_a = repo.name) !== null && _a !== void 0 ? _a : index == 0) ? "bootstrap" : `bootstrap-${index}`;
            dot.set(`configs.repositories.${repoName}`, { url: repo.repoUrl }, defaultValues, true);
        });
        let values = (0, ts_deepmerge_1.merge)(defaultValues, (_b = this.options.values) !== null && _b !== void 0 ? _b : {});
        this.chartNode = clusterInfo.cluster.addHelmChart("argocd-addon", {
            chart: this.options.chart,
            release: this.options.release,
            repository: this.options.repository,
            version: this.options.version,
            namespace: this.options.namespace,
            values: values
        });
        this.chartNode.node.addDependency(sa);
        if (secretProviderClass) {
            secretProviderClass.addDependent(this.chartNode);
        }
        return this.chartNode;
    }
    /**
     * Post deployment step is used to create a bootstrap repository if options are provided for the add-on.
     * @param clusterInfo
     * @param teams
     * @returns
     */
    postDeploy(clusterInfo, teams) {
        var _a;
        assert(teams != null);
        const appRepo = this.options.bootstrapRepo;
        const shared = {
            clusterName: clusterInfo.cluster.clusterName,
            region: aws_cdk_lib_1.Stack.of(clusterInfo.cluster).region,
            repoUrl: appRepo === null || appRepo === void 0 ? void 0 : appRepo.repoUrl,
            targetRevision: appRepo === null || appRepo === void 0 ? void 0 : appRepo.targetRevision,
        };
        if (appRepo) {
            // merge with custom bootstrapValues with AddOnContexts and common values
            const merged = { ...shared, ...Object.fromEntries(clusterInfo.getAddOnContexts().entries()), ...this.options.bootstrapValues };
            this.generate(clusterInfo, {
                name: (_a = appRepo.name) !== null && _a !== void 0 ? _a : "bootstrap-apps",
                namespace: this.options.namespace,
                repository: appRepo,
                values: merged,
            });
        }
        const workloadApps = this.options.workloadApplications;
        if (workloadApps) {
            workloadApps.forEach(app => {
                const values = { ...shared, ...app.values };
                this.generate(clusterInfo, { ...app, ...{ values } });
            });
        }
        this.chartNode = undefined;
    }
    /**
     * @returns bcrypt hash of the admin secret provided from the AWS secret manager.
     */
    async createAdminSecret(region) {
        const secretValue = await (0, utils_1.getSecretValue)(this.options.adminPasswordSecretName, region);
        return bcrypt.hash(secretValue, 10);
    }
    /**
     * Creates a service account that can access secrets
     * @param clusterInfo
     * @returns
     */
    createServiceAccount(clusterInfo) {
        const sa = clusterInfo.cluster.addServiceAccount('argo-cd-server', {
            name: "argocd-server",
            namespace: this.options.namespace
        });
        return sa;
    }
    /**
     * Returns all repositories defined in the options.
     */
    getAllRepositories() {
        var _a;
        let result = [];
        const urls = new Set();
        const bootstrapRepo = this.options.bootstrapRepo;
        if (bootstrapRepo) {
            result.push({ ...bootstrapRepo, ...{ name: (_a = bootstrapRepo.name) !== null && _a !== void 0 ? _a : "bootstrap" } });
            urls.add(bootstrapRepo.repoUrl);
        }
        if (this.options.workloadApplications) {
            this.options.workloadApplications.forEach(repo => {
                if (repo.repository && !urls.has(repo.repository.repoUrl)) {
                    result.push(repo.repository);
                    urls.add(repo.repository.repoUrl);
                }
            });
        }
        return result;
    }
};
exports.ArgoCDAddOn = ArgoCDAddOn;
exports.ArgoCDAddOn = ArgoCDAddOn = __decorate([
    utils_1.supportsALL
], ArgoCDAddOn);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2FyZ29jZC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxpQ0FBaUM7QUFFakMsNkNBQW9DO0FBQ3BDLGlDQUFpQztBQUVqQyxrQ0FBa0M7QUFDbEMsK0NBQXFDO0FBQ3JDLDBCQUF5QztBQUN6QyxpQ0FBaUM7QUFDakMsdUNBQWdHO0FBQ2hHLDhDQUE4RDtBQUM5RCwrQ0FBZ0Q7QUFDaEQscURBQW1EO0FBeURuRDs7R0FFRztBQUNILE1BQU0sWUFBWSxHQUFHO0lBQ2pCLFNBQVMsRUFBRSxRQUFRO0lBQ25CLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLEtBQUssRUFBRSxTQUFTO0lBQ2hCLE9BQU8sRUFBRSx5QkFBeUI7SUFDbEMsVUFBVSxFQUFFLHNDQUFzQztDQUNyRCxDQUFDO0FBR0Y7O0dBRUc7QUFFSSxJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFXO0lBTXBCLFlBQVksS0FBd0I7UUFDaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUcsWUFBWSxFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUM7UUFDN0Msc0JBQVMsQ0FBQyxlQUFlLENBQUM7WUFDdEIsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBTTtZQUMxQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFRO1lBQzlCLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVc7U0FDdkMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBQyxDQUFDO1lBQzVCLElBQUEsMkJBQW1CLEVBQUMsSUFBSSxHQUFHLENBQUMsZ0NBQWdDLEVBQUUsZ0NBQWdDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNoSSxDQUFDO0lBQ0wsQ0FBQztJQUVELFFBQVEsQ0FBQyxXQUE0QixF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SUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzdDLElBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO29CQUN2RCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztDQUNKLENBQUE7QUE5S1ksa0NBQVc7c0JBQVgsV0FBVztJQUR2QixtQkFBVztHQUNDLFdBQVcsQ0E4S3ZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gXCJhc3NlcnRcIjtcbmltcG9ydCB7IEhlbG1DaGFydCwgU2VydmljZUFjY291bnQgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xuaW1wb3J0IHsgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBiY3J5cHQgZnJvbSBcImJjcnlwdFwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCAqIGFzIGRvdCBmcm9tICdkb3Qtb2JqZWN0JztcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSBcInRzLWRlZXBtZXJnZVwiO1xuaW1wb3J0IHsgU2VjcmV0UHJvdmlkZXJDbGFzcyB9IGZyb20gJy4uJztcbmltcG9ydCAqIGFzIHNwaSBmcm9tIFwiLi4vLi4vc3BpXCI7XG5pbXBvcnQgeyBjcmVhdGVOYW1lc3BhY2UsIGdldFNlY3JldFZhbHVlLCBzdXBwb3J0c0FMTCwgdmFsaWRhdGVDb25zdHJhaW50cyB9IGZyb20gJy4uLy4uL3V0aWxzJztcbmltcG9ydCB7IEhlbG1BZGRPbiwgSGVsbUFkZE9uVXNlclByb3BzIH0gZnJvbSAnLi4vaGVsbS1hZGRvbic7XG5pbXBvcnQgeyBBcmdvQXBwbGljYXRpb24gfSBmcm9tICcuL2FwcGxpY2F0aW9uJztcbmltcG9ydCB7IGNyZWF0ZVNlY3JldFJlZiB9IGZyb20gJy4vbWFuaWZlc3QtdXRpbHMnO1xuaW1wb3J0IHsgR2l0UmVwb3NpdG9yeVJlZmVyZW5jZSB9IGZyb20gXCIuLi8uLi9zcGlcIjtcblxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgYWRkLW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFyZ29DREFkZE9uUHJvcHMgZXh0ZW5kcyBIZWxtQWRkT25Vc2VyUHJvcHMge1xuICAgIC8qKlxuICAgICAqIE5hbWVzcGFjZSB3aGVyZSBhZGQtb24gd2lsbCBiZSBkZXBsb3llZC4gXG4gICAgICogQGRlZmF1bHQgYXJnb2NkXG4gICAgICovXG4gICAgbmFtZXNwYWNlPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgKiBIZWxtIGNoYXJ0IHZlcnNpb24gdG8gdXNlIHRvIGluc3RhbGwuXG4gICAgKiBAZGVmYXVsdCA1LjUxLjZcbiAgICAqL1xuICAgIHZlcnNpb24/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBJZiBwcm92aWRlZCwgdGhlIGFkZG9uIHdpbGwgYm9vdHN0cmFwIHRoZSBhcHAgb3IgYXBwcyBpbiB0aGUgcHJvdmlkZWQgcmVwb3NpdG9yeS5cbiAgICAgKiBJbiBnZW5lcmFsLCB0aGUgcmVwbyBpcyBleHBlY3RlZCB0byBoYXZlIHRoZSBhcHAgb2YgYXBwcywgd2hpY2ggY2FuIGVuYWJsZSB0byBib290c3RyYXAgYWxsIHdvcmtsb2FkcyxcbiAgICAgKiBhZnRlciB0aGUgaW5mcmFzdHJ1Y3R1cmUgYW5kIHRlYW0gcHJvdmlzaW9uaW5nIGlzIGNvbXBsZXRlLlxuICAgICAqIFdoZW4gR2l0T3BzIG1vZGUgaXMgZW5hYmxlZCB2aWEgYEFyZ29HaXRPcHNGYWN0b3J5YCBmb3IgZGVwbG95aW5nIHRoZSBBZGRPbnMsIHRoaXMgYm9vdHN0cmFwXG4gICAgICogcmVwb3NpdG9yeSB3aWxsIGJlIHVzZWQgZm9yIHByb3Zpc2lvbmluZyBhbGwgYEhlbG1BZGRPbmAgYmFzZWQgQWRkT25zLlxuICAgICAqL1xuICAgIGJvb3RzdHJhcFJlcG8/OiBzcGkuQXBwbGljYXRpb25SZXBvc2l0b3J5O1xuXG4gICAgLyoqXG4gICAgICogT3B0aW9uYWwgdmFsdWVzIGZvciB0aGUgYm9vdHN0cmFwIGFwcGxpY2F0aW9uLiBUaGVzZSBtYXkgY29udGFpbiB2YWx1ZXMgc3VjaCBhcyBkb21haW4gbmFtZWQgcHJvdmlzaW9uZWQgYnkgb3RoZXIgYWRkLW9ucywgY2VydGlmaWNhdGUsIGFuZCBvdGhlciBwYXJhbWV0ZXJzIHRvIHBhc3MgXG4gICAgICogdG8gdGhlIGFwcGxpY2F0aW9ucy4gXG4gICAgICovXG4gICAgYm9vdHN0cmFwVmFsdWVzPzogc3BpLlZhbHVlcyxcblxuXG4gICAgLyoqXG4gICAgICogQWRkaXRpb25hbCBHaXRPcHMgYXBwbGljYXRpb25zIGFuZCByZXBvc2l0b3JpZXMuIElmIHRoZXJlIGlzIGEgc3BsaXQgYmV0d2VlbiBpbmZyYSBhbmQgYXBwbGljYXRpb24gcmVwb3NpdG9yaWVzIHRoZW5cbiAgICAgKiBib290c3RyYXAgcmVwbyBpcyBleHBlY3RlZCB0byBiZSBsZXZlcmFnZWQgZm9yIGluZnJhc3RydWN0dXJlIGFuZCBhcHBsaWNhdGlvbiBkZXBsb3ltZW50cyB3aWxsIGNvbnRhaW4gYWRkaXRpb25hbCBhcHBsaWNhdGlvbnMuXG4gICAgICovXG4gICAgd29ya2xvYWRBcHBsaWNhdGlvbnM/OiBzcGkuR2l0T3BzQXBwbGljYXRpb25EZXBsb3ltZW50W10sXG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbCBhZG1pbiBwYXNzd29yZCBzZWNyZXQgbmFtZSBhcyBkZWZpbmVkIGluIEFXUyBTZWNyZXRzIE1hbmFnZXIgKHBsYWludGV4dCkuXG4gICAgICogVGhpcyBhbGxvd3MgdG8gY29udHJvbCBhZG1pbiBwYXNzd29yZCBhY3Jvc3MgdGhlIGVudGVycHJpc2UuIFBhc3N3b3JkIHdpbGwgYmUgcmV0cmlldmVkIGFuZCBcbiAgICAgKiBzdG9yZWQgYXMgYSBub24tcmV2ZXJzaWJsZSBiY3J5cHQgaGFzaC4gXG4gICAgICogTm90ZTogYXQgcHJlc2VudCwgY2hhbmdlIG9mIHBhc3N3b3JkIG1heSByZXF1aXJlIG1hbnVhbCByZXN0YXJ0IG9mIGFyZ29jZCBzZXJ2ZXIuIFxuICAgICAqL1xuICAgIGFkbWluUGFzc3dvcmRTZWNyZXROYW1lPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVmFsdWVzIHRvIHBhc3MgdG8gdGhlIGNoYXJ0IGFzIHBlciBodHRwczovL2dpdGh1Yi5jb20vYXJnb3Byb2ovYXJnby1oZWxtL2Jsb2IvbWFzdGVyL2NoYXJ0cy9hcmdvLWNkL3ZhbHVlcy55YW1sLlxuICAgICAqL1xuICAgIHZhbHVlcz86IHNwaS5WYWx1ZXM7XG4gICAgXG59XG5cbi8qKlxuICogRGVmYXVsdHMgb3B0aW9ucyBmb3IgdGhlIGFkZC1vblxuICovXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gICAgbmFtZXNwYWNlOiBcImFyZ29jZFwiLFxuICAgIHZlcnNpb246ICc3LjMuMycsXG4gICAgY2hhcnQ6IFwiYXJnby1jZFwiLFxuICAgIHJlbGVhc2U6IFwiYmx1ZXByaW50cy1hZGRvbi1hcmdvY2RcIixcbiAgICByZXBvc2l0b3J5OiBcImh0dHBzOi8vYXJnb3Byb2ouZ2l0aHViLmlvL2FyZ28taGVsbVwiXG59O1xuXG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgQXJnb0NEIGFkZC1vbiBhbmQgcG9zdCBkZXBsb3ltZW50IGhvb2suXG4gKi9cbkBzdXBwb3J0c0FMTFxuZXhwb3J0IGNsYXNzIEFyZ29DREFkZE9uIGltcGxlbWVudHMgc3BpLkNsdXN0ZXJBZGRPbiwgc3BpLkNsdXN0ZXJQb3N0RGVwbG95IHtcblxuICAgIHJlYWRvbmx5IG9wdGlvbnM6IEFyZ29DREFkZE9uUHJvcHM7XG5cbiAgICBwcml2YXRlIGNoYXJ0Tm9kZT86IEhlbG1DaGFydDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogQXJnb0NEQWRkT25Qcm9wcykge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7IC4uLmRlZmF1bHRQcm9wcywgLi4ucHJvcHMgfTtcbiAgICAgICAgSGVsbUFkZE9uLnZhbGlkYXRlVmVyc2lvbih7XG4gICAgICAgICAgICBjaGFydDogdGhpcy5vcHRpb25zLmNoYXJ0ISxcbiAgICAgICAgICAgIHZlcnNpb246IHRoaXMub3B0aW9ucy52ZXJzaW9uISxcbiAgICAgICAgICAgIHJlcG9zaXRvcnk6IHRoaXMub3B0aW9ucy5yZXBvc2l0b3J5IVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5ib290c3RyYXBSZXBvKXtcbiAgICAgICAgICAgIHZhbGlkYXRlQ29uc3RyYWludHMobmV3IHNwaS5BcHBsaWNhdGlvblJlcG9zaXRvcnlDb25zdHJhaW50cywgXCJBcmdvQ0RBZGRPblByb3BzLmJvb3RzdHJhcFJlcG9cIiwgdGhpcy5vcHRpb25zLmJvb3RzdHJhcFJlcG8pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2VuZXJhdGUoY2x1c3RlckluZm86IHNwaS5DbHVzdGVySW5mbywgZGVwbG95bWVudDogc3BpLkdpdE9wc0FwcGxpY2F0aW9uRGVwbG95bWVudCwgd2F2ZSA9IDApOiBDb25zdHJ1Y3Qge1xuICAgICAgICBjb25zdCBwcm9taXNlID0gY2x1c3RlckluZm8uZ2V0U2NoZWR1bGVkQWRkT24oJ0FyZ29DREFkZE9uJyk7XG5cbiAgICAgICAgaWYgKHByb21pc2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXJnb0NEIGFkZG9uIG11c3QgYmUgcmVnaXN0ZXJlZCBiZWZvcmUgY3JlYXRpbmcgQXJnbyBtYW5hZ2VkIGFkZC1vbnMgZm9yIGhlbG0gYXBwbGljYXRpb25zXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hbmlmZXN0ID0gbmV3IEFyZ29BcHBsaWNhdGlvbihkZXBsb3ltZW50LnJlcG9zaXRvcnkgPz8gdGhpcy5vcHRpb25zLmJvb3RzdHJhcFJlcG8pLmdlbmVyYXRlKGRlcGxveW1lbnQsIHdhdmUpO1xuICAgICAgICBjb25zdCBjb25zdHJ1Y3QgPSBjbHVzdGVySW5mby5jbHVzdGVyLmFkZE1hbmlmZXN0KGRlcGxveW1lbnQubmFtZSwgbWFuaWZlc3QpO1xuICAgICAgICBwcm9taXNlLnRoZW4oY2hhcnQgPT4ge1xuICAgICAgICAgICAgY29uc3RydWN0Lm5vZGUuYWRkRGVwZW5kZW5jeShjaGFydCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW1wbGVtZW50YXRpb24gb2YgdGhlIGFkZC1vbiBjb250cmFjdCBkZXBsb3kgbWV0aG9kLlxuICAgICovXG4gICAgYXN5bmMgZGVwbG95KGNsdXN0ZXJJbmZvOiBzcGkuQ2x1c3RlckluZm8pOiBQcm9taXNlPENvbnN0cnVjdD4ge1xuICAgICAgICBjb25zdCBuYW1lc3BhY2UgPSBjcmVhdGVOYW1lc3BhY2UodGhpcy5vcHRpb25zLm5hbWVzcGFjZSEsIGNsdXN0ZXJJbmZvLmNsdXN0ZXIsIHRydWUpO1xuXG4gICAgICAgIGNvbnN0IHNhID0gdGhpcy5jcmVhdGVTZXJ2aWNlQWNjb3VudChjbHVzdGVySW5mbyk7XG4gICAgICAgIHNhLm5vZGUuYWRkRGVwZW5kZW5jeShuYW1lc3BhY2UpO1xuXG4gICAgICAgIGNvbnN0IGRlZmF1bHRWYWx1ZXM6IHNwaS5WYWx1ZXMgPSB7fTtcbiAgICAgICAgZG90LnNldChcInNlcnZlci5zZXJ2aWNlQWNjb3VudC5jcmVhdGVcIiwgZmFsc2UsIGRlZmF1bHRWYWx1ZXMpO1xuXG4gICAgICAgIGNvbnN0IHNlY3JldHMgPSBbXTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJvb3RzdHJhcFJlcG8/LmNyZWRlbnRpYWxzU2VjcmV0TmFtZSkge1xuICAgICAgICAgICAgY29uc3QgcmVwbyA9IHRoaXMub3B0aW9ucy5ib290c3RyYXBSZXBvO1xuICAgICAgICAgICAgc2VjcmV0cy5wdXNoKGNyZWF0ZVNlY3JldFJlZihyZXBvLmNyZWRlbnRpYWxzVHlwZSEsIHJlcG8uY3JlZGVudGlhbHNTZWNyZXROYW1lISkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWRtaW5QYXNzd29yZFNlY3JldE5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGFkbWluU2VjcmV0ID0gYXdhaXQgdGhpcy5jcmVhdGVBZG1pblNlY3JldChjbHVzdGVySW5mby5jbHVzdGVyLnN0YWNrLnJlZ2lvbik7XG4gICAgICAgICAgICBkb3Quc2V0KFwiY29uZmlncy5zZWNyZXQuYXJnb2NkU2VydmVyQWRtaW5QYXNzd29yZFwiLCBhZG1pblNlY3JldCwgZGVmYXVsdFZhbHVlcywgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2VjcmV0UHJvdmlkZXJDbGFzczogU2VjcmV0UHJvdmlkZXJDbGFzcyB8IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAoc2VjcmV0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzZWNyZXRQcm92aWRlckNsYXNzID0gbmV3IFNlY3JldFByb3ZpZGVyQ2xhc3MoY2x1c3RlckluZm8sIHNhLCAnYmx1ZXByaW50cy1zZWNyZXQnLCAuLi5zZWNyZXRzKTtcbiAgICAgICAgICAgIGRvdC5zZXQoJ3NlcnZlcicsIHNlY3JldFByb3ZpZGVyQ2xhc3MuZ2V0Vm9sdW1lTW91bnRzKCdibHVlcHJpbnRzLXNlY3JldC1pbmxpbmUnKSwgZGVmYXVsdFZhbHVlcywgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdldEFsbFJlcG9zaXRvcmllcygpLmZvckVhY2goKHJlcG8sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXBvTmFtZSA9IHJlcG8ubmFtZSA/PyBpbmRleCA9PSAwID8gXCJib290c3RyYXBcIiA6IGBib290c3RyYXAtJHtpbmRleH1gO1xuICAgICAgICAgICAgZG90LnNldChgY29uZmlncy5yZXBvc2l0b3JpZXMuJHtyZXBvTmFtZX1gLCB7IHVybDogcmVwby5yZXBvVXJsIH0sIGRlZmF1bHRWYWx1ZXMsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGxldCB2YWx1ZXMgPSBtZXJnZShkZWZhdWx0VmFsdWVzLCB0aGlzLm9wdGlvbnMudmFsdWVzID8/IHt9KTtcblxuICAgICAgICB0aGlzLmNoYXJ0Tm9kZSA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXIuYWRkSGVsbUNoYXJ0KFwiYXJnb2NkLWFkZG9uXCIsIHtcbiAgICAgICAgICAgIGNoYXJ0OiB0aGlzLm9wdGlvbnMuY2hhcnQhLFxuICAgICAgICAgICAgcmVsZWFzZTogdGhpcy5vcHRpb25zLnJlbGVhc2UsXG4gICAgICAgICAgICByZXBvc2l0b3J5OiB0aGlzLm9wdGlvbnMucmVwb3NpdG9yeSxcbiAgICAgICAgICAgIHZlcnNpb246IHRoaXMub3B0aW9ucy52ZXJzaW9uLFxuICAgICAgICAgICAgbmFtZXNwYWNlOiB0aGlzLm9wdGlvbnMubmFtZXNwYWNlLFxuICAgICAgICAgICAgdmFsdWVzOiB2YWx1ZXNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jaGFydE5vZGUubm9kZS5hZGREZXBlbmRlbmN5KHNhKTtcblxuICAgICAgICBpZiAoc2VjcmV0UHJvdmlkZXJDbGFzcykge1xuICAgICAgICAgICAgc2VjcmV0UHJvdmlkZXJDbGFzcy5hZGREZXBlbmRlbnQodGhpcy5jaGFydE5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuY2hhcnROb2RlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBvc3QgZGVwbG95bWVudCBzdGVwIGlzIHVzZWQgdG8gY3JlYXRlIGEgYm9vdHN0cmFwIHJlcG9zaXRvcnkgaWYgb3B0aW9ucyBhcmUgcHJvdmlkZWQgZm9yIHRoZSBhZGQtb24uXG4gICAgICogQHBhcmFtIGNsdXN0ZXJJbmZvIFxuICAgICAqIEBwYXJhbSB0ZWFtcyBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwb3N0RGVwbG95KGNsdXN0ZXJJbmZvOiBzcGkuQ2x1c3RlckluZm8sIHRlYW1zOiBzcGkuVGVhbVtdKSB7XG4gICAgICAgIGFzc2VydCh0ZWFtcyAhPSBudWxsKTtcbiAgICAgICAgY29uc3QgYXBwUmVwbyA9IHRoaXMub3B0aW9ucy5ib290c3RyYXBSZXBvO1xuICAgICAgICBjb25zdCBzaGFyZWQgPSB7XG4gICAgICAgICAgICBjbHVzdGVyTmFtZTogY2x1c3RlckluZm8uY2x1c3Rlci5jbHVzdGVyTmFtZSxcbiAgICAgICAgICAgIHJlZ2lvbjogU3RhY2sub2YoY2x1c3RlckluZm8uY2x1c3RlcikucmVnaW9uLFxuICAgICAgICAgICAgcmVwb1VybDogYXBwUmVwbz8ucmVwb1VybCxcbiAgICAgICAgICAgIHRhcmdldFJldmlzaW9uOiBhcHBSZXBvPy50YXJnZXRSZXZpc2lvbixcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoYXBwUmVwbykge1xuICAgICAgICAgICAgLy8gbWVyZ2Ugd2l0aCBjdXN0b20gYm9vdHN0cmFwVmFsdWVzIHdpdGggQWRkT25Db250ZXh0cyBhbmQgY29tbW9uIHZhbHVlc1xuICAgICAgICAgICAgY29uc3QgbWVyZ2VkID0geyAuLi5zaGFyZWQsIC4uLk9iamVjdC5mcm9tRW50cmllcyhjbHVzdGVySW5mby5nZXRBZGRPbkNvbnRleHRzKCkuZW50cmllcygpKSwgLi4udGhpcy5vcHRpb25zLmJvb3RzdHJhcFZhbHVlcyB9O1xuXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlKGNsdXN0ZXJJbmZvLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogYXBwUmVwby5uYW1lID8/IFwiYm9vdHN0cmFwLWFwcHNcIixcbiAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IHRoaXMub3B0aW9ucy5uYW1lc3BhY2UhLFxuICAgICAgICAgICAgICAgIHJlcG9zaXRvcnk6IGFwcFJlcG8sXG4gICAgICAgICAgICAgICAgdmFsdWVzOiBtZXJnZWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdvcmtsb2FkQXBwcyA9IHRoaXMub3B0aW9ucy53b3JrbG9hZEFwcGxpY2F0aW9ucztcblxuICAgICAgICBpZih3b3JrbG9hZEFwcHMpIHtcbiAgICAgICAgICAgIHdvcmtsb2FkQXBwcy5mb3JFYWNoKGFwcCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gIHsgLi4uc2hhcmVkLCAuLi5hcHAudmFsdWVzIH07XG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZShjbHVzdGVySW5mbywgeyAuLi5hcHAsIC4uLnsgdmFsdWVzIH0gfSk7XG4gICAgICAgICAgICB9KTsgXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNoYXJ0Tm9kZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyBiY3J5cHQgaGFzaCBvZiB0aGUgYWRtaW4gc2VjcmV0IHByb3ZpZGVkIGZyb20gdGhlIEFXUyBzZWNyZXQgbWFuYWdlci5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYXN5bmMgY3JlYXRlQWRtaW5TZWNyZXQocmVnaW9uOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBjb25zdCBzZWNyZXRWYWx1ZSA9IGF3YWl0IGdldFNlY3JldFZhbHVlKHRoaXMub3B0aW9ucy5hZG1pblBhc3N3b3JkU2VjcmV0TmFtZSEsIHJlZ2lvbik7XG4gICAgICAgIHJldHVybiBiY3J5cHQuaGFzaChzZWNyZXRWYWx1ZSwgMTApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzZXJ2aWNlIGFjY291bnQgdGhhdCBjYW4gYWNjZXNzIHNlY3JldHNcbiAgICAgKiBAcGFyYW0gY2x1c3RlckluZm8gXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVNlcnZpY2VBY2NvdW50KGNsdXN0ZXJJbmZvOiBzcGkuQ2x1c3RlckluZm8pOiBTZXJ2aWNlQWNjb3VudCB7XG4gICAgICAgIGNvbnN0IHNhID0gY2x1c3RlckluZm8uY2x1c3Rlci5hZGRTZXJ2aWNlQWNjb3VudCgnYXJnby1jZC1zZXJ2ZXInLCB7XG4gICAgICAgICAgICBuYW1lOiBcImFyZ29jZC1zZXJ2ZXJcIixcbiAgICAgICAgICAgIG5hbWVzcGFjZTogdGhpcy5vcHRpb25zLm5hbWVzcGFjZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHNhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYWxsIHJlcG9zaXRvcmllcyBkZWZpbmVkIGluIHRoZSBvcHRpb25zLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRBbGxSZXBvc2l0b3JpZXMoKTogR2l0UmVwb3NpdG9yeVJlZmVyZW5jZVtdIHtcbiAgICAgICAgbGV0IHJlc3VsdDogR2l0UmVwb3NpdG9yeVJlZmVyZW5jZVtdID0gW107XG4gICAgICAgIFxuICAgICAgICBjb25zdCB1cmxzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgICAgIGNvbnN0IGJvb3RzdHJhcFJlcG8gPSB0aGlzLm9wdGlvbnMuYm9vdHN0cmFwUmVwbztcblxuICAgICAgICBpZihib290c3RyYXBSZXBvKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh7Li4uYm9vdHN0cmFwUmVwbywgLi4ueyBuYW1lIDogYm9vdHN0cmFwUmVwby5uYW1lID8/IFwiYm9vdHN0cmFwXCJ9fSk7XG4gICAgICAgICAgICB1cmxzLmFkZChib290c3RyYXBSZXBvLnJlcG9VcmwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy5vcHRpb25zLndvcmtsb2FkQXBwbGljYXRpb25zKSB7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMud29ya2xvYWRBcHBsaWNhdGlvbnMuZm9yRWFjaChyZXBvID0+IHtcbiAgICAgICAgICAgICAgICBpZihyZXBvLnJlcG9zaXRvcnkgJiYgIXVybHMuaGFzKHJlcG8ucmVwb3NpdG9yeS5yZXBvVXJsKSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChyZXBvLnJlcG9zaXRvcnkpO1xuICAgICAgICAgICAgICAgICAgICB1cmxzLmFkZChyZXBvLnJlcG9zaXRvcnkucmVwb1VybCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn1cbiJdfQ==