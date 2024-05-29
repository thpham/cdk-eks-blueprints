import * as kms from "aws-cdk-lib/aws-kms";
import { ResourceContext, ResourceProvider } from "../spi";
/**
 * Lookup or create a KMS Key to configure EKS secrets encryption.
 *
 * @example
 * ```typescript
 *     const stack = blueprints.EksBlueprint.builder()
 *       .resourceProvider(GlobalResources.KmsKey, new CreateKmsKeyProvider("my-custom-eks-key"))
 *       .account("123456789012")
 *       .region("us-east-1")
 *       .build(app, "east-test-1");
 * ```
 */
export declare class CreateKmsKeyProvider implements ResourceProvider<kms.IKey> {
    private readonly aliasName?;
    private readonly kmsKeyProps?;
    /**
     * Configuration options for the KMS Key.
     *
     * @param aliasName The alias name for the KMS Key
     * @param kmsKeyProps The key props used
     */
    constructor(aliasName?: string, kmsKeyProps?: kms.KeyProps);
    provide(context: ResourceContext): kms.IKey;
}
/**
 * Pass an aliasName to lookup an existing KMS Key.
 *
 * @param aliasName The alias name to lookup an existing KMS Key
 */
export declare class LookupKmsKeyProvider implements ResourceProvider<kms.IKey> {
    private readonly aliasName;
    constructor(aliasName: string);
    provide(context: ResourceContext): kms.IKey;
}
