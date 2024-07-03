"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddOnNameOrId = getAddOnNameOrId;
exports.isOrderedAddOn = isOrderedAddOn;
exports.dependable = dependable;
exports.conflictsWith = conflictsWith;
const assert = require("assert");
require("reflect-metadata");
/**
 * Returns AddOn Id if defined else returns the class name
 * @param addOn
 * @returns string
 */
function getAddOnNameOrId(addOn) {
    var _a;
    return (_a = addOn.id) !== null && _a !== void 0 ? _a : addOn.constructor.name;
}
function isOrderedAddOn(addOn) {
    var _a, _b;
    return (_b = (_a = Reflect.getMetadata("ordered", addOn.constructor)) !== null && _a !== void 0 ? _a : Reflect.getMetadata("ordered", addOn)) !== null && _b !== void 0 ? _b : false;
}
/**
 * Decorator function that accepts a list of AddOns and
 * ensures addons are scheduled to be added as well as
 * add them as dependencies
 * @param addOns
 * @returns
 */
function dependable(...addOns) {
    return function (target, key, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const dependencies = Array();
            const clusterInfo = args[0];
            const stack = clusterInfo.cluster.stack.stackName;
            addOns.forEach((addOn) => {
                const dep = clusterInfo.getScheduledAddOn(addOn);
                assert(dep, `Missing a dependency for ${addOn} for ${stack}`);
                dependencies.push(dep);
            });
            const result = originalMethod.apply(this, args);
            Promise.all(dependencies.values()).then((constructs) => {
                constructs.forEach((construct) => {
                    result.then((resource) => {
                        resource.node.addDependency(construct);
                    });
                });
            }).catch(err => { throw new Error(err); });
            return result;
        };
        return descriptor;
    };
}
/**
 * Decorator function that accepts a list of AddOns and
 * throws error if those addons are scheduled to be added as well
 * As they should not be deployed with
 * @param addOns
 * @returns
 */
function conflictsWith(...addOns) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target, key, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            // const dependencies: (Promise<Construct> | undefined)[] = [];
            const clusterInfo = args[0];
            const stack = clusterInfo.cluster.stack.stackName;
            addOns.forEach((addOn) => {
                const dep = clusterInfo.getScheduledAddOn(addOn);
                if (dep) {
                    throw new Error(`Deploying ${stack} failed due to conflicting add-on: ${addOn}.`);
                }
            });
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkb24tdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbHMvYWRkb24tdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFVQSw0Q0FFQztBQUVELHdDQUVDO0FBU0QsZ0NBK0JDO0FBU0Qsc0NBc0JDO0FBdkZELGlDQUFpQztBQUVqQyw0QkFBMEI7QUFHMUI7Ozs7R0FJRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLEtBQW1COztJQUNsRCxPQUFPLE1BQUEsS0FBSyxDQUFDLEVBQUUsbUNBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7QUFDNUMsQ0FBQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxLQUFtQjs7SUFDOUMsT0FBTyxNQUFBLE1BQUEsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxtQ0FBSSxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsbUNBQUksS0FBSyxDQUFDO0FBQy9HLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixVQUFVLENBQUMsR0FBRyxNQUFnQjtJQUU1QyxPQUFPLFVBQVUsTUFBVyxFQUFFLEdBQW9CLEVBQUUsVUFBOEI7UUFDaEYsTUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUV4QyxVQUFVLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxJQUFXO1lBQ3pDLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBc0IsQ0FBQztZQUNqRCxNQUFNLFdBQVcsR0FBZ0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUVsRCxNQUFNLENBQUMsT0FBTyxDQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ3hCLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDakQsTUFBTSxDQUFDLEdBQUcsRUFBRSw0QkFBNEIsS0FBSyxRQUFRLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQzlELFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBSSxDQUFDLENBQUM7WUFDMUIsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLE1BQU0sR0FBdUIsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDckQsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO29CQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7d0JBQ3ZCLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUN6QyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUzQyxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDLENBQUM7UUFFRixPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLEdBQUcsTUFBZ0I7SUFDL0Msd0RBQXdEO0lBQ3hELE9BQU8sVUFBVSxNQUFjLEVBQUUsR0FBb0IsRUFBRSxVQUE4QjtRQUNuRixNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO1FBRXhDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLElBQVc7WUFDekMsK0RBQStEO1lBQy9ELE1BQU0sV0FBVyxHQUFnQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO1lBRWxELE1BQU0sQ0FBQyxPQUFPLENBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDeEIsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLEdBQUcsRUFBQyxDQUFDO29CQUNQLE1BQU0sSUFBSSxLQUFLLENBQUMsYUFBYSxLQUFLLHNDQUFzQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUNwRixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQztRQUVGLE9BQU8sVUFBVSxDQUFDO0lBQ3BCLENBQUMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhc3NlcnQgZnJvbSBcImFzc2VydFwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCBcInJlZmxlY3QtbWV0YWRhdGFcIjtcbmltcG9ydCB7IENsdXN0ZXJBZGRPbiwgQ2x1c3RlckluZm8gfSBmcm9tICcuLi9zcGknO1xuXG4vKipcbiAqIFJldHVybnMgQWRkT24gSWQgaWYgZGVmaW5lZCBlbHNlIHJldHVybnMgdGhlIGNsYXNzIG5hbWVcbiAqIEBwYXJhbSBhZGRPblxuICogQHJldHVybnMgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBZGRPbk5hbWVPcklkKGFkZE9uOiBDbHVzdGVyQWRkT24pOiBzdHJpbmcge1xuICByZXR1cm4gYWRkT24uaWQgPz8gYWRkT24uY29uc3RydWN0b3IubmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzT3JkZXJlZEFkZE9uKGFkZE9uOiBDbHVzdGVyQWRkT24pIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFJlZmxlY3QuZ2V0TWV0YWRhdGEoXCJvcmRlcmVkXCIsIGFkZE9uLmNvbnN0cnVjdG9yKSA/PyBSZWZsZWN0LmdldE1ldGFkYXRhKFwib3JkZXJlZFwiLCBhZGRPbikgPz8gZmFsc2U7XG59XG5cbi8qKlxuICogRGVjb3JhdG9yIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyBhIGxpc3Qgb2YgQWRkT25zIGFuZFxuICogZW5zdXJlcyBhZGRvbnMgYXJlIHNjaGVkdWxlZCB0byBiZSBhZGRlZCBhcyB3ZWxsIGFzXG4gKiBhZGQgdGhlbSBhcyBkZXBlbmRlbmNpZXNcbiAqIEBwYXJhbSBhZGRPbnMgXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlcGVuZGFibGUoLi4uYWRkT25zOiBzdHJpbmdbXSkge1xuICBcbiAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IGFueSwga2V5OiBzdHJpbmcgfCBzeW1ib2wsIGRlc2NyaXB0b3I6IFByb3BlcnR5RGVzY3JpcHRvcikge1xuICAgIGNvbnN0IG9yaWdpbmFsTWV0aG9kID0gZGVzY3JpcHRvci52YWx1ZTtcblxuICAgIGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiggLi4uYXJnczogYW55W10pIHtcbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IEFycmF5PFByb21pc2U8Q29uc3RydWN0Pj4oKTtcbiAgICAgIGNvbnN0IGNsdXN0ZXJJbmZvOiBDbHVzdGVySW5mbyA9IGFyZ3NbMF07XG4gICAgICBjb25zdCBzdGFjayA9IGNsdXN0ZXJJbmZvLmNsdXN0ZXIuc3RhY2suc3RhY2tOYW1lO1xuXG4gICAgICBhZGRPbnMuZm9yRWFjaCggKGFkZE9uKSA9PiB7XG4gICAgICAgIGNvbnN0IGRlcCA9IGNsdXN0ZXJJbmZvLmdldFNjaGVkdWxlZEFkZE9uKGFkZE9uKTtcbiAgICAgICAgYXNzZXJ0KGRlcCwgYE1pc3NpbmcgYSBkZXBlbmRlbmN5IGZvciAke2FkZE9ufSBmb3IgJHtzdGFja31gKTsgXG4gICAgICAgIGRlcGVuZGVuY2llcy5wdXNoKGRlcCEpO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxDb25zdHJ1Y3Q+ID0gb3JpZ2luYWxNZXRob2QuYXBwbHkodGhpcywgYXJncyk7XG5cbiAgICAgIFByb21pc2UuYWxsKGRlcGVuZGVuY2llcy52YWx1ZXMoKSkudGhlbigoY29uc3RydWN0cykgPT4ge1xuICAgICAgICBjb25zdHJ1Y3RzLmZvckVhY2goKGNvbnN0cnVjdCkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0LnRoZW4oKHJlc291cmNlKSA9PiB7XG4gICAgICAgICAgICAgIHJlc291cmNlLm5vZGUuYWRkRGVwZW5kZW5jeShjb25zdHJ1Y3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSkuY2F0Y2goZXJyID0+IHsgdGhyb3cgbmV3IEVycm9yKGVycik7IH0pO1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgfTtcbn1cblxuLyoqXG4gKiBEZWNvcmF0b3IgZnVuY3Rpb24gdGhhdCBhY2NlcHRzIGEgbGlzdCBvZiBBZGRPbnMgYW5kXG4gKiB0aHJvd3MgZXJyb3IgaWYgdGhvc2UgYWRkb25zIGFyZSBzY2hlZHVsZWQgdG8gYmUgYWRkZWQgYXMgd2VsbFxuICogQXMgdGhleSBzaG91bGQgbm90IGJlIGRlcGxveWVkIHdpdGhcbiAqIEBwYXJhbSBhZGRPbnMgXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmZsaWN0c1dpdGgoLi4uYWRkT25zOiBzdHJpbmdbXSkge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10eXBlc1xuICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogT2JqZWN0LCBrZXk6IHN0cmluZyB8IHN5bWJvbCwgZGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxNZXRob2QgPSBkZXNjcmlwdG9yLnZhbHVlO1xuXG4gICAgZGVzY3JpcHRvci52YWx1ZSA9IGZ1bmN0aW9uKCAuLi5hcmdzOiBhbnlbXSkge1xuICAgICAgLy8gY29uc3QgZGVwZW5kZW5jaWVzOiAoUHJvbWlzZTxDb25zdHJ1Y3Q+IHwgdW5kZWZpbmVkKVtdID0gW107XG4gICAgICBjb25zdCBjbHVzdGVySW5mbzogQ2x1c3RlckluZm8gPSBhcmdzWzBdO1xuICAgICAgY29uc3Qgc3RhY2sgPSBjbHVzdGVySW5mby5jbHVzdGVyLnN0YWNrLnN0YWNrTmFtZTtcblxuICAgICAgYWRkT25zLmZvckVhY2goIChhZGRPbikgPT4ge1xuICAgICAgICBjb25zdCBkZXAgPSBjbHVzdGVySW5mby5nZXRTY2hlZHVsZWRBZGRPbihhZGRPbik7XG4gICAgICAgIGlmIChkZXApe1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRGVwbG95aW5nICR7c3RhY2t9IGZhaWxlZCBkdWUgdG8gY29uZmxpY3RpbmcgYWRkLW9uOiAke2FkZE9ufS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gIH07XG59XG4iXX0=