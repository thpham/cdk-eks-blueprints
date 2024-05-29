import "reflect-metadata";
import { ClusterAddOn } from '../spi';
/**
 * Returns AddOn Id if defined else returns the class name
 * @param addOn
 * @returns string
 */
export declare function getAddOnNameOrId(addOn: ClusterAddOn): string;
export declare function isOrderedAddOn(addOn: ClusterAddOn): boolean;
/**
 * Decorator function that accepts a list of AddOns and
 * ensures addons are scheduled to be added as well as
 * add them as dependencies
 * @param addOns
 * @returns
 */
export declare function dependable(...addOns: string[]): (target: any, key: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Decorator function that accepts a list of AddOns and
 * throws error if those addons are scheduled to be added as well
 * As they should not be deployed with
 * @param addOns
 * @returns
 */
export declare function conflictsWith(...addOns: string[]): (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor;
