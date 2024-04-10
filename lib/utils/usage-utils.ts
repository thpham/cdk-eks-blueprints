import { StackProps } from "aws-cdk-lib";
import { EksBlueprintProductStackProps } from "../svc-catalog";

/**
 * Adds usage tracking info to the stack props
 * @param usageIdentifier 
 * @param stackProps 
 * @returns 
 */
 export function withUsageTracking(usageIdentifier: string, stackProps?: StackProps): StackProps {
    const result =  stackProps ?? {};
    const trackableDescription = `${result.description?? ""} Blueprints tracking (${usageIdentifier})`.trimLeft();
    return { ...stackProps, ...{description: trackableDescription}};
}

/**
 * Adds usage tracking info to the stack props
 * @param usageIdentifier
 * @param stackProps
 * @returns
 */
export function withProductUsageTracking(usageIdentifier: string, stackProps?: EksBlueprintProductStackProps): EksBlueprintProductStackProps {
    const result =  stackProps ?? {};
    const trackableDescription = `${result.description?? ""} Blueprints tracking (${usageIdentifier})`.trimLeft();
    return { ...stackProps, ...{description: trackableDescription}};
}