import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { ProductStack, ProductStackProps } from "aws-cdk-lib/aws-servicecatalog";
import { BlueprintBuilder, BlueprintPropsConstraints, DEFAULT_VERSION, EksBlueprintGeneric, EksBlueprintProps } from "../stacks";
import * as spi from '../spi';
import * as constraints from '../utils/constraints-utils';
import * as utils from '../utils';
import { VpcProvider } from '../resource-providers/vpc';
import { IKey } from 'aws-cdk-lib/aws-kms';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { CreateKmsKeyProvider } from '../resource-providers';
import { ArgoGitOpsFactory } from "../addons/argocd/argo-gitops-factory";
import { MngClusterProvider } from '../cluster-providers/mng-cluster-provider';

export interface EksBlueprintProductStackProps extends ProductStackProps {
  /**
     * A description of the stack.
     *
     * @default - No description.
     */
  readonly description?: string;
}

export class EksBlueprintProduct extends ProductStack implements EksBlueprintGeneric {
    static readonly USAGE_ID = "qs-1s1r465hk";

    private asyncTasks: Promise<void | Construct[]>;

    private clusterInfo: spi.ClusterInfo;

    public static builder(): BlueprintBuilder {
        return new BlueprintBuilder();
    }

    constructor(scope: Construct, blueprintProps: EksBlueprintProps, props?: cdk.StackProps) {
        super(scope, blueprintProps.id, utils.withProductUsageTracking(EksBlueprintProduct.USAGE_ID, props));
        this.validateInput(blueprintProps);

        const resourceContext = this.provideNamedResources(blueprintProps);

        let vpcResource: IVpc | undefined = resourceContext.get(spi.GlobalResources.Vpc);

        if (!vpcResource) {
            vpcResource = resourceContext.add(spi.GlobalResources.Vpc, new VpcProvider());
        }

        let version = blueprintProps.version;
        if (version == "auto") {
            version = DEFAULT_VERSION;
        }

        let kmsKeyResource: IKey | undefined = resourceContext.get(spi.GlobalResources.KmsKey);

        if (!kmsKeyResource && blueprintProps.useDefaultSecretEncryption != false) {
            kmsKeyResource = resourceContext.add(spi.GlobalResources.KmsKey, new CreateKmsKeyProvider());
        }

        blueprintProps = this.resolveDynamicProxies(blueprintProps, resourceContext);

        const clusterProvider = blueprintProps.clusterProvider ?? new MngClusterProvider({
            id: `${blueprintProps.name ?? blueprintProps.id}-ng`,
            version
        });

        this.clusterInfo = clusterProvider.createCluster(this, vpcResource!, kmsKeyResource, version);
        this.clusterInfo.setResourceContext(resourceContext);

        let enableLogTypes: string[] | undefined = blueprintProps.enableControlPlaneLogTypes;
        if (enableLogTypes) {
            utils.setupClusterLogging(this.clusterInfo.cluster.stack, this.clusterInfo.cluster, enableLogTypes);
        }

        if (blueprintProps.enableGitOpsMode == spi.GitOpsMode.APPLICATION) {
            ArgoGitOpsFactory.enableGitOps();
        } else if (blueprintProps.enableGitOpsMode == spi.GitOpsMode.APP_OF_APPS) {
            ArgoGitOpsFactory.enableGitOpsAppOfApps();
        }

        const postDeploymentSteps = Array<spi.ClusterPostDeploy>();

        for (let addOn of (blueprintProps.addOns ?? [])) { // must iterate in the strict order
            const result = addOn.deploy(this.clusterInfo);
            if (result) {
                const addOnKey = utils.getAddOnNameOrId(addOn);
                this.clusterInfo.addScheduledAddOn(addOnKey, result, utils.isOrderedAddOn(addOn));
            }
            const postDeploy: any = addOn;
            if ((postDeploy as spi.ClusterPostDeploy).postDeploy !== undefined) {
                postDeploymentSteps.push(<spi.ClusterPostDeploy>postDeploy);
            }
        }

        const scheduledAddOns = this.clusterInfo.getAllScheduledAddons();
        const addOnKeys = [...scheduledAddOns.keys()];
        const promises = scheduledAddOns.values();

        this.asyncTasks = Promise.all(promises).then((constructs) => {
            constructs.forEach((construct, index) => {
                this.clusterInfo.addProvisionedAddOn(addOnKeys[index], construct);
            });

            if (blueprintProps.teams != null) {
                for (let team of blueprintProps.teams) {
                    team.setup(this.clusterInfo);
                }
            }

            for (let step of postDeploymentSteps) {
                step.postDeploy(this.clusterInfo, blueprintProps.teams ?? []);
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
    public async waitForAsyncTasks(): Promise<EksBlueprintProduct> {
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
    getClusterInfo(): spi.ClusterInfo {
        return this.clusterInfo;
    }

    private provideNamedResources(blueprintProps: EksBlueprintProps): spi.ResourceContext {
        const result = new spi.ResourceContext(this, blueprintProps);

        for (let [key, value] of blueprintProps.resourceProviders ?? []) {
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
    private resolveDynamicProxies(blueprintProps: EksBlueprintProps, resourceContext: spi.ResourceContext) : EksBlueprintProps {
        return utils.cloneDeep(blueprintProps, (value) => {
            return utils.resolveTarget(value, resourceContext);
        });
    }

    /**
     * Validates input against basic defined constraints.
     * @param blueprintProps 
     */
    private validateInput(blueprintProps: EksBlueprintProps) {
        const teamNames = new Set<string>();
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
