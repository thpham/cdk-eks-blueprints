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
    version: '5.51.6',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2FyZ29jZC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxpQ0FBaUM7QUFFakMsNkNBQW9DO0FBQ3BDLGlDQUFpQztBQUVqQyxrQ0FBa0M7QUFDbEMsK0NBQXFDO0FBQ3JDLDBCQUF5QztBQUN6QyxpQ0FBaUM7QUFDakMsdUNBQWdHO0FBQ2hHLDhDQUE4RDtBQUM5RCwrQ0FBZ0Q7QUFDaEQscURBQW1EO0FBeURuRDs7R0FFRztBQUNILE1BQU0sWUFBWSxHQUFHO0lBQ2pCLFNBQVMsRUFBRSxRQUFRO0lBQ25CLE9BQU8sRUFBRSxRQUFRO0lBQ2pCLEtBQUssRUFBRSxTQUFTO0lBQ2hCLE9BQU8sRUFBRSx5QkFBeUI7SUFDbEMsVUFBVSxFQUFFLHNDQUFzQztDQUNyRCxDQUFDO0FBR0Y7O0dBRUc7QUFFSSxJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFXO0lBTXBCLFlBQVksS0FBd0I7UUFDaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUcsWUFBWSxFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUM7UUFDN0Msc0JBQVMsQ0FBQyxlQUFlLENBQUM7WUFDdEIsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBTTtZQUMxQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFRO1lBQzlCLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVc7U0FDdkMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBQyxDQUFDO1lBQzVCLElBQUEsMkJBQW1CLEVBQUMsSUFBSSxHQUFHLENBQUMsZ0NBQWdDLEVBQUUsZ0NBQWdDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNoSSxDQUFDO0lBQ0wsQ0FBQztJQUVELFFBQVEsQ0FBQyxXQUE0QixF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SUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzdDLElBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO29CQUN2RCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztDQUNKLENBQUE7QUE5S1ksa0NBQVc7c0JBQVgsV0FBVztJQUR2QixtQkFBVztHQUNDLFdBQVcsQ0E4S3ZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgYXNzZXJ0IGZyb20gXCJhc3NlcnRcIjtcbmltcG9ydCB7IEhlbG1DaGFydCwgU2VydmljZUFjY291bnQgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWVrc1wiO1xuaW1wb3J0IHsgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBiY3J5cHQgZnJvbSBcImJjcnlwdFwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCAqIGFzIGRvdCBmcm9tICdkb3Qtb2JqZWN0JztcbmltcG9ydCB7IG1lcmdlIH0gZnJvbSBcInRzLWRlZXBtZXJnZVwiO1xuaW1wb3J0IHsgU2VjcmV0UHJvdmlkZXJDbGFzcyB9IGZyb20gJy4uJztcbmltcG9ydCAqIGFzIHNwaSBmcm9tIFwiLi4vLi4vc3BpXCI7XG5pbXBvcnQgeyBjcmVhdGVOYW1lc3BhY2UsIGdldFNlY3JldFZhbHVlLCBzdXBwb3J0c0FMTCwgdmFsaWRhdGVDb25zdHJhaW50cyB9IGZyb20gJy4uLy4uL3V0aWxzJztcbmltcG9ydCB7IEhlbG1BZGRPbiwgSGVsbUFkZE9uVXNlclByb3BzIH0gZnJvbSAnLi4vaGVsbS1hZGRvbic7XG5pbXBvcnQgeyBBcmdvQXBwbGljYXRpb24gfSBmcm9tICcuL2FwcGxpY2F0aW9uJztcbmltcG9ydCB7IGNyZWF0ZVNlY3JldFJlZiB9IGZyb20gJy4vbWFuaWZlc3QtdXRpbHMnO1xuaW1wb3J0IHsgR2l0UmVwb3NpdG9yeVJlZmVyZW5jZSB9IGZyb20gXCIuLi8uLi9zcGlcIjtcblxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgYWRkLW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFyZ29DREFkZE9uUHJvcHMgZXh0ZW5kcyBIZWxtQWRkT25Vc2VyUHJvcHMge1xuICAgIC8qKlxuICAgICAqIE5hbWVzcGFjZSB3aGVyZSBhZGQtb24gd2lsbCBiZSBkZXBsb3llZC4gXG4gICAgICogQGRlZmF1bHQgYXJnb2NkXG4gICAgICovXG4gICAgbmFtZXNwYWNlPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgKiBIZWxtIGNoYXJ0IHZlcnNpb24gdG8gdXNlIHRvIGluc3RhbGwuXG4gICAgKiBAZGVmYXVsdCA1LjUxLjZcbiAgICAqL1xuICAgIHZlcnNpb24/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBJZiBwcm92aWRlZCwgdGhlIGFkZG9uIHdpbGwgYm9vdHN0cmFwIHRoZSBhcHAgb3IgYXBwcyBpbiB0aGUgcHJvdmlkZWQgcmVwb3NpdG9yeS5cbiAgICAgKiBJbiBnZW5lcmFsLCB0aGUgcmVwbyBpcyBleHBlY3RlZCB0byBoYXZlIHRoZSBhcHAgb2YgYXBwcywgd2hpY2ggY2FuIGVuYWJsZSB0byBib290c3RyYXAgYWxsIHdvcmtsb2FkcyxcbiAgICAgKiBhZnRlciB0aGUgaW5mcmFzdHJ1Y3R1cmUgYW5kIHRlYW0gcHJvdmlzaW9uaW5nIGlzIGNvbXBsZXRlLlxuICAgICAqIFdoZW4gR2l0T3BzIG1vZGUgaXMgZW5hYmxlZCB2aWEgYEFyZ29HaXRPcHNGYWN0b3J5YCBmb3IgZGVwbG95aW5nIHRoZSBBZGRPbnMsIHRoaXMgYm9vdHN0cmFwXG4gICAgICogcmVwb3NpdG9yeSB3aWxsIGJlIHVzZWQgZm9yIHByb3Zpc2lvbmluZyBhbGwgYEhlbG1BZGRPbmAgYmFzZWQgQWRkT25zLlxuICAgICAqL1xuICAgIGJvb3RzdHJhcFJlcG8/OiBzcGkuQXBwbGljYXRpb25SZXBvc2l0b3J5O1xuXG4gICAgLyoqXG4gICAgICogT3B0aW9uYWwgdmFsdWVzIGZvciB0aGUgYm9vdHN0cmFwIGFwcGxpY2F0aW9uLiBUaGVzZSBtYXkgY29udGFpbiB2YWx1ZXMgc3VjaCBhcyBkb21haW4gbmFtZWQgcHJvdmlzaW9uZWQgYnkgb3RoZXIgYWRkLW9ucywgY2VydGlmaWNhdGUsIGFuZCBvdGhlciBwYXJhbWV0ZXJzIHRvIHBhc3MgXG4gICAgICogdG8gdGhlIGFwcGxpY2F0aW9ucy4gXG4gICAgICovXG4gICAgYm9vdHN0cmFwVmFsdWVzPzogc3BpLlZhbHVlcyxcblxuXG4gICAgLyoqXG4gICAgICogQWRkaXRpb25hbCBHaXRPcHMgYXBwbGljYXRpb25zIGFuZCByZXBvc2l0b3JpZXMuIElmIHRoZXJlIGlzIGEgc3BsaXQgYmV0d2VlbiBpbmZyYSBhbmQgYXBwbGljYXRpb24gcmVwb3NpdG9yaWVzIHRoZW5cbiAgICAgKiBib290c3RyYXAgcmVwbyBpcyBleHBlY3RlZCB0byBiZSBsZXZlcmFnZWQgZm9yIGluZnJhc3RydWN0dXJlIGFuZCBhcHBsaWNhdGlvbiBkZXBsb3ltZW50cyB3aWxsIGNvbnRhaW4gYWRkaXRpb25hbCBhcHBsaWNhdGlvbnMuXG4gICAgICovXG4gICAgd29ya2xvYWRBcHBsaWNhdGlvbnM/OiBzcGkuR2l0T3BzQXBwbGljYXRpb25EZXBsb3ltZW50W10sXG5cbiAgICAvKipcbiAgICAgKiBPcHRpb25hbCBhZG1pbiBwYXNzd29yZCBzZWNyZXQgbmFtZSBhcyBkZWZpbmVkIGluIEFXUyBTZWNyZXRzIE1hbmFnZXIgKHBsYWludGV4dCkuXG4gICAgICogVGhpcyBhbGxvd3MgdG8gY29udHJvbCBhZG1pbiBwYXNzd29yZCBhY3Jvc3MgdGhlIGVudGVycHJpc2UuIFBhc3N3b3JkIHdpbGwgYmUgcmV0cmlldmVkIGFuZCBcbiAgICAgKiBzdG9yZWQgYXMgYSBub24tcmV2ZXJzaWJsZSBiY3J5cHQgaGFzaC4gXG4gICAgICogTm90ZTogYXQgcHJlc2VudCwgY2hhbmdlIG9mIHBhc3N3b3JkIG1heSByZXF1aXJlIG1hbnVhbCByZXN0YXJ0IG9mIGFyZ29jZCBzZXJ2ZXIuIFxuICAgICAqL1xuICAgIGFkbWluUGFzc3dvcmRTZWNyZXROYW1lPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVmFsdWVzIHRvIHBhc3MgdG8gdGhlIGNoYXJ0IGFzIHBlciBodHRwczovL2dpdGh1Yi5jb20vYXJnb3Byb2ovYXJnby1oZWxtL2Jsb2IvbWFzdGVyL2NoYXJ0cy9hcmdvLWNkL3ZhbHVlcy55YW1sLlxuICAgICAqL1xuICAgIHZhbHVlcz86IHNwaS5WYWx1ZXM7XG4gICAgXG59XG5cbi8qKlxuICogRGVmYXVsdHMgb3B0aW9ucyBmb3IgdGhlIGFkZC1vblxuICovXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gICAgbmFtZXNwYWNlOiBcImFyZ29jZFwiLFxuICAgIHZlcnNpb246ICc1LjUxLjYnLFxuICAgIGNoYXJ0OiBcImFyZ28tY2RcIixcbiAgICByZWxlYXNlOiBcImJsdWVwcmludHMtYWRkb24tYXJnb2NkXCIsXG4gICAgcmVwb3NpdG9yeTogXCJodHRwczovL2FyZ29wcm9qLmdpdGh1Yi5pby9hcmdvLWhlbG1cIlxufTtcblxuXG4vKipcbiAqIEltcGxlbWVudGF0aW9uIG9mIEFyZ29DRCBhZGQtb24gYW5kIHBvc3QgZGVwbG95bWVudCBob29rLlxuICovXG5Ac3VwcG9ydHNBTExcbmV4cG9ydCBjbGFzcyBBcmdvQ0RBZGRPbiBpbXBsZW1lbnRzIHNwaS5DbHVzdGVyQWRkT24sIHNwaS5DbHVzdGVyUG9zdERlcGxveSB7XG5cbiAgICByZWFkb25seSBvcHRpb25zOiBBcmdvQ0RBZGRPblByb3BzO1xuXG4gICAgcHJpdmF0ZSBjaGFydE5vZGU/OiBIZWxtQ2hhcnQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IEFyZ29DREFkZE9uUHJvcHMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0geyAuLi5kZWZhdWx0UHJvcHMsIC4uLnByb3BzIH07XG4gICAgICAgIEhlbG1BZGRPbi52YWxpZGF0ZVZlcnNpb24oe1xuICAgICAgICAgICAgY2hhcnQ6IHRoaXMub3B0aW9ucy5jaGFydCEsXG4gICAgICAgICAgICB2ZXJzaW9uOiB0aGlzLm9wdGlvbnMudmVyc2lvbiEsXG4gICAgICAgICAgICByZXBvc2l0b3J5OiB0aGlzLm9wdGlvbnMucmVwb3NpdG9yeSFcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYm9vdHN0cmFwUmVwbyl7XG4gICAgICAgICAgICB2YWxpZGF0ZUNvbnN0cmFpbnRzKG5ldyBzcGkuQXBwbGljYXRpb25SZXBvc2l0b3J5Q29uc3RyYWludHMsIFwiQXJnb0NEQWRkT25Qcm9wcy5ib290c3RyYXBSZXBvXCIsIHRoaXMub3B0aW9ucy5ib290c3RyYXBSZXBvKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdlbmVyYXRlKGNsdXN0ZXJJbmZvOiBzcGkuQ2x1c3RlckluZm8sIGRlcGxveW1lbnQ6IHNwaS5HaXRPcHNBcHBsaWNhdGlvbkRlcGxveW1lbnQsIHdhdmUgPSAwKTogQ29uc3RydWN0IHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGNsdXN0ZXJJbmZvLmdldFNjaGVkdWxlZEFkZE9uKCdBcmdvQ0RBZGRPbicpO1xuXG4gICAgICAgIGlmIChwcm9taXNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFyZ29DRCBhZGRvbiBtdXN0IGJlIHJlZ2lzdGVyZWQgYmVmb3JlIGNyZWF0aW5nIEFyZ28gbWFuYWdlZCBhZGQtb25zIGZvciBoZWxtIGFwcGxpY2F0aW9uc1wiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYW5pZmVzdCA9IG5ldyBBcmdvQXBwbGljYXRpb24oZGVwbG95bWVudC5yZXBvc2l0b3J5ID8/IHRoaXMub3B0aW9ucy5ib290c3RyYXBSZXBvKS5nZW5lcmF0ZShkZXBsb3ltZW50LCB3YXZlKTtcbiAgICAgICAgY29uc3QgY29uc3RydWN0ID0gY2x1c3RlckluZm8uY2x1c3Rlci5hZGRNYW5pZmVzdChkZXBsb3ltZW50Lm5hbWUsIG1hbmlmZXN0KTtcbiAgICAgICAgcHJvbWlzZS50aGVuKGNoYXJ0ID0+IHtcbiAgICAgICAgICAgIGNvbnN0cnVjdC5ub2RlLmFkZERlcGVuZGVuY3koY2hhcnQpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gY29uc3RydWN0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSBhZGQtb24gY29udHJhY3QgZGVwbG95IG1ldGhvZC5cbiAgICAqL1xuICAgIGFzeW5jIGRlcGxveShjbHVzdGVySW5mbzogc3BpLkNsdXN0ZXJJbmZvKTogUHJvbWlzZTxDb25zdHJ1Y3Q+IHtcbiAgICAgICAgY29uc3QgbmFtZXNwYWNlID0gY3JlYXRlTmFtZXNwYWNlKHRoaXMub3B0aW9ucy5uYW1lc3BhY2UhLCBjbHVzdGVySW5mby5jbHVzdGVyLCB0cnVlKTtcblxuICAgICAgICBjb25zdCBzYSA9IHRoaXMuY3JlYXRlU2VydmljZUFjY291bnQoY2x1c3RlckluZm8pO1xuICAgICAgICBzYS5ub2RlLmFkZERlcGVuZGVuY3kobmFtZXNwYWNlKTtcblxuICAgICAgICBjb25zdCBkZWZhdWx0VmFsdWVzOiBzcGkuVmFsdWVzID0ge307XG4gICAgICAgIGRvdC5zZXQoXCJzZXJ2ZXIuc2VydmljZUFjY291bnQuY3JlYXRlXCIsIGZhbHNlLCBkZWZhdWx0VmFsdWVzKTtcblxuICAgICAgICBjb25zdCBzZWNyZXRzID0gW107XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5ib290c3RyYXBSZXBvPy5jcmVkZW50aWFsc1NlY3JldE5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlcG8gPSB0aGlzLm9wdGlvbnMuYm9vdHN0cmFwUmVwbztcbiAgICAgICAgICAgIHNlY3JldHMucHVzaChjcmVhdGVTZWNyZXRSZWYocmVwby5jcmVkZW50aWFsc1R5cGUhLCByZXBvLmNyZWRlbnRpYWxzU2VjcmV0TmFtZSEpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFkbWluUGFzc3dvcmRTZWNyZXROYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBhZG1pblNlY3JldCA9IGF3YWl0IHRoaXMuY3JlYXRlQWRtaW5TZWNyZXQoY2x1c3RlckluZm8uY2x1c3Rlci5zdGFjay5yZWdpb24pO1xuICAgICAgICAgICAgZG90LnNldChcImNvbmZpZ3Muc2VjcmV0LmFyZ29jZFNlcnZlckFkbWluUGFzc3dvcmRcIiwgYWRtaW5TZWNyZXQsIGRlZmF1bHRWYWx1ZXMsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNlY3JldFByb3ZpZGVyQ2xhc3M6IFNlY3JldFByb3ZpZGVyQ2xhc3MgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKHNlY3JldHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc2VjcmV0UHJvdmlkZXJDbGFzcyA9IG5ldyBTZWNyZXRQcm92aWRlckNsYXNzKGNsdXN0ZXJJbmZvLCBzYSwgJ2JsdWVwcmludHMtc2VjcmV0JywgLi4uc2VjcmV0cyk7XG4gICAgICAgICAgICBkb3Quc2V0KCdzZXJ2ZXInLCBzZWNyZXRQcm92aWRlckNsYXNzLmdldFZvbHVtZU1vdW50cygnYmx1ZXByaW50cy1zZWNyZXQtaW5saW5lJyksIGRlZmF1bHRWYWx1ZXMsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nZXRBbGxSZXBvc2l0b3JpZXMoKS5mb3JFYWNoKChyZXBvLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVwb05hbWUgPSByZXBvLm5hbWUgPz8gaW5kZXggPT0gMCA/IFwiYm9vdHN0cmFwXCIgOiBgYm9vdHN0cmFwLSR7aW5kZXh9YDtcbiAgICAgICAgICAgIGRvdC5zZXQoYGNvbmZpZ3MucmVwb3NpdG9yaWVzLiR7cmVwb05hbWV9YCwgeyB1cmw6IHJlcG8ucmVwb1VybCB9LCBkZWZhdWx0VmFsdWVzLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBsZXQgdmFsdWVzID0gbWVyZ2UoZGVmYXVsdFZhbHVlcywgdGhpcy5vcHRpb25zLnZhbHVlcyA/PyB7fSk7XG5cbiAgICAgICAgdGhpcy5jaGFydE5vZGUgPSBjbHVzdGVySW5mby5jbHVzdGVyLmFkZEhlbG1DaGFydChcImFyZ29jZC1hZGRvblwiLCB7XG4gICAgICAgICAgICBjaGFydDogdGhpcy5vcHRpb25zLmNoYXJ0ISxcbiAgICAgICAgICAgIHJlbGVhc2U6IHRoaXMub3B0aW9ucy5yZWxlYXNlLFxuICAgICAgICAgICAgcmVwb3NpdG9yeTogdGhpcy5vcHRpb25zLnJlcG9zaXRvcnksXG4gICAgICAgICAgICB2ZXJzaW9uOiB0aGlzLm9wdGlvbnMudmVyc2lvbixcbiAgICAgICAgICAgIG5hbWVzcGFjZTogdGhpcy5vcHRpb25zLm5hbWVzcGFjZSxcbiAgICAgICAgICAgIHZhbHVlczogdmFsdWVzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY2hhcnROb2RlLm5vZGUuYWRkRGVwZW5kZW5jeShzYSk7XG5cbiAgICAgICAgaWYgKHNlY3JldFByb3ZpZGVyQ2xhc3MpIHtcbiAgICAgICAgICAgIHNlY3JldFByb3ZpZGVyQ2xhc3MuYWRkRGVwZW5kZW50KHRoaXMuY2hhcnROb2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmNoYXJ0Tm9kZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQb3N0IGRlcGxveW1lbnQgc3RlcCBpcyB1c2VkIHRvIGNyZWF0ZSBhIGJvb3RzdHJhcCByZXBvc2l0b3J5IGlmIG9wdGlvbnMgYXJlIHByb3ZpZGVkIGZvciB0aGUgYWRkLW9uLlxuICAgICAqIEBwYXJhbSBjbHVzdGVySW5mbyBcbiAgICAgKiBAcGFyYW0gdGVhbXMgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgcG9zdERlcGxveShjbHVzdGVySW5mbzogc3BpLkNsdXN0ZXJJbmZvLCB0ZWFtczogc3BpLlRlYW1bXSkge1xuICAgICAgICBhc3NlcnQodGVhbXMgIT0gbnVsbCk7XG4gICAgICAgIGNvbnN0IGFwcFJlcG8gPSB0aGlzLm9wdGlvbnMuYm9vdHN0cmFwUmVwbztcbiAgICAgICAgY29uc3Qgc2hhcmVkID0ge1xuICAgICAgICAgICAgY2x1c3Rlck5hbWU6IGNsdXN0ZXJJbmZvLmNsdXN0ZXIuY2x1c3Rlck5hbWUsXG4gICAgICAgICAgICByZWdpb246IFN0YWNrLm9mKGNsdXN0ZXJJbmZvLmNsdXN0ZXIpLnJlZ2lvbixcbiAgICAgICAgICAgIHJlcG9Vcmw6IGFwcFJlcG8/LnJlcG9VcmwsXG4gICAgICAgICAgICB0YXJnZXRSZXZpc2lvbjogYXBwUmVwbz8udGFyZ2V0UmV2aXNpb24sXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGFwcFJlcG8pIHtcbiAgICAgICAgICAgIC8vIG1lcmdlIHdpdGggY3VzdG9tIGJvb3RzdHJhcFZhbHVlcyB3aXRoIEFkZE9uQ29udGV4dHMgYW5kIGNvbW1vbiB2YWx1ZXNcbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZCA9IHsgLi4uc2hhcmVkLCAuLi5PYmplY3QuZnJvbUVudHJpZXMoY2x1c3RlckluZm8uZ2V0QWRkT25Db250ZXh0cygpLmVudHJpZXMoKSksIC4uLnRoaXMub3B0aW9ucy5ib290c3RyYXBWYWx1ZXMgfTtcblxuICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZShjbHVzdGVySW5mbywge1xuICAgICAgICAgICAgICAgIG5hbWU6IGFwcFJlcG8ubmFtZSA/PyBcImJvb3RzdHJhcC1hcHBzXCIsXG4gICAgICAgICAgICAgICAgbmFtZXNwYWNlOiB0aGlzLm9wdGlvbnMubmFtZXNwYWNlISxcbiAgICAgICAgICAgICAgICByZXBvc2l0b3J5OiBhcHBSZXBvLFxuICAgICAgICAgICAgICAgIHZhbHVlczogbWVyZ2VkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3b3JrbG9hZEFwcHMgPSB0aGlzLm9wdGlvbnMud29ya2xvYWRBcHBsaWNhdGlvbnM7XG5cbiAgICAgICAgaWYod29ya2xvYWRBcHBzKSB7XG4gICAgICAgICAgICB3b3JrbG9hZEFwcHMuZm9yRWFjaChhcHAgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlcyA9ICB7IC4uLnNoYXJlZCwgLi4uYXBwLnZhbHVlcyB9O1xuICAgICAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGUoY2x1c3RlckluZm8sIHsgLi4uYXBwLCAuLi57IHZhbHVlcyB9IH0pO1xuICAgICAgICAgICAgfSk7IFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaGFydE5vZGUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMgYmNyeXB0IGhhc2ggb2YgdGhlIGFkbWluIHNlY3JldCBwcm92aWRlZCBmcm9tIHRoZSBBV1Mgc2VjcmV0IG1hbmFnZXIuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZUFkbWluU2VjcmV0KHJlZ2lvbjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgc2VjcmV0VmFsdWUgPSBhd2FpdCBnZXRTZWNyZXRWYWx1ZSh0aGlzLm9wdGlvbnMuYWRtaW5QYXNzd29yZFNlY3JldE5hbWUhLCByZWdpb24pO1xuICAgICAgICByZXR1cm4gYmNyeXB0Lmhhc2goc2VjcmV0VmFsdWUsIDEwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgc2VydmljZSBhY2NvdW50IHRoYXQgY2FuIGFjY2VzcyBzZWNyZXRzXG4gICAgICogQHBhcmFtIGNsdXN0ZXJJbmZvIFxuICAgICAqIEByZXR1cm5zIFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVTZXJ2aWNlQWNjb3VudChjbHVzdGVySW5mbzogc3BpLkNsdXN0ZXJJbmZvKTogU2VydmljZUFjY291bnQge1xuICAgICAgICBjb25zdCBzYSA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXIuYWRkU2VydmljZUFjY291bnQoJ2FyZ28tY2Qtc2VydmVyJywge1xuICAgICAgICAgICAgbmFtZTogXCJhcmdvY2Qtc2VydmVyXCIsXG4gICAgICAgICAgICBuYW1lc3BhY2U6IHRoaXMub3B0aW9ucy5uYW1lc3BhY2VcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzYTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFsbCByZXBvc2l0b3JpZXMgZGVmaW5lZCBpbiB0aGUgb3B0aW9ucy5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0QWxsUmVwb3NpdG9yaWVzKCk6IEdpdFJlcG9zaXRvcnlSZWZlcmVuY2VbXSB7XG4gICAgICAgIGxldCByZXN1bHQ6IEdpdFJlcG9zaXRvcnlSZWZlcmVuY2VbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdXJscyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb25zdCBib290c3RyYXBSZXBvID0gdGhpcy5vcHRpb25zLmJvb3RzdHJhcFJlcG87XG5cbiAgICAgICAgaWYoYm9vdHN0cmFwUmVwbykge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goey4uLmJvb3RzdHJhcFJlcG8sIC4uLnsgbmFtZSA6IGJvb3RzdHJhcFJlcG8ubmFtZSA/PyBcImJvb3RzdHJhcFwifX0pO1xuICAgICAgICAgICAgdXJscy5hZGQoYm9vdHN0cmFwUmVwby5yZXBvVXJsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy53b3JrbG9hZEFwcGxpY2F0aW9ucykge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLndvcmtsb2FkQXBwbGljYXRpb25zLmZvckVhY2gocmVwbyA9PiB7XG4gICAgICAgICAgICAgICAgaWYocmVwby5yZXBvc2l0b3J5ICYmICF1cmxzLmhhcyhyZXBvLnJlcG9zaXRvcnkucmVwb1VybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gocmVwby5yZXBvc2l0b3J5KTtcbiAgICAgICAgICAgICAgICAgICAgdXJscy5hZGQocmVwby5yZXBvc2l0b3J5LnJlcG9VcmwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59XG4iXX0=