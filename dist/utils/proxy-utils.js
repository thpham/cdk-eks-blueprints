"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTarget = exports.DummyProxy = exports.sourceFunction = exports.isDynamicProxy = void 0;
const nutil = require("node:util/types");
/**
 * Symbol that uniquely designates that a particular proxy is instance of our DummyProxy
 */
exports.isDynamicProxy = Symbol("isDynamicProxy");
/**
 * Symbol that retrieves the source function from the proxy. This function is expected to create the required target (e.g. resource).
 */
exports.sourceFunction = Symbol("sourceFunction");
/**
 * Simple proxy implementation that will require resolution at runtime (enables lazy loading).
 * Unlike dynamic proxy that can create target on the fly, this proxy
 * just a place-holder that supplies the function that can be used to resolve the target.
 * Since most CDK constructs are not idempotent (meaning you can not call a create function twice, the second will fail)
 * this design choice was the simplest to support declarative resources.
 * Customers can clone the supplied JSON structure with cloneDeep and replace proxies with the actual targets as part of that process.
 */
class DummyProxy {
    constructor(source) {
        this.source = source;
    }
    get(_, key) {
        if (key === exports.isDynamicProxy) {
            return true;
        }
        if (key === exports.sourceFunction) {
            return this.source;
        }
        return new Proxy({}, new DummyProxy((arg) => {
            return this.source(arg)[key];
        }));
    }
}
exports.DummyProxy = DummyProxy;
/**
 * Function resolves the proxy with the target, that enables lazy loading use cases.
 * @param value potential proxy to resolve
 * @param arg represents the argument that should be passed to the resolution function (sourceFunction).
 * @returns
 */
function resolveTarget(value, arg) {
    if (nutil.isProxy(value)) {
        const object = value;
        if (object[exports.isDynamicProxy]) {
            const fn = object[exports.sourceFunction];
            return fn(arg);
        }
    }
    return value;
}
exports.resolveTarget = resolveTarget;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJveHktdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbHMvcHJveHktdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUNBQXlDO0FBSXpDOztHQUVHO0FBQ1UsUUFBQSxjQUFjLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFFdkQ7O0dBRUc7QUFDVSxRQUFBLGNBQWMsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUV2RDs7Ozs7OztHQU9HO0FBQ0gsTUFBYSxVQUFVO0lBRW5CLFlBQW9CLE1BQW9CO1FBQXBCLFdBQU0sR0FBTixNQUFNLENBQWM7SUFBRyxDQUFDO0lBRXJDLEdBQUcsQ0FBQyxDQUFJLEVBQUUsR0FBZ0I7UUFDN0IsSUFBRyxHQUFHLEtBQUssc0JBQWMsRUFBRSxDQUFDO1lBQ3hCLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFRCxJQUFHLEdBQUcsS0FBSyxzQkFBYyxFQUFFLENBQUM7WUFDeEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxPQUFPLElBQUksS0FBSyxDQUFDLEVBQVMsRUFBRSxJQUFJLFVBQVUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQy9DLE9BQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUNKO0FBakJELGdDQWlCQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLEtBQVUsRUFBRSxHQUFRO0lBQzlDLElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3RCLE1BQU0sTUFBTSxHQUFTLEtBQUssQ0FBQztRQUMzQixJQUFHLE1BQU0sQ0FBQyxzQkFBYyxDQUFDLEVBQUUsQ0FBQztZQUN4QixNQUFNLEVBQUUsR0FBbUIsTUFBTSxDQUFDLHNCQUFjLENBQUMsQ0FBQztZQUNsRCxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQixDQUFDO0lBQ0wsQ0FBQztJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFURCxzQ0FTQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIG51dGlsIGZyb20gJ25vZGU6dXRpbC90eXBlcyc7XG5cbmV4cG9ydCB0eXBlIE9uZUFyZ0ZuPFQ+ID0gKGFyZzogYW55KSA9PiBUO1xuXG4vKipcbiAqIFN5bWJvbCB0aGF0IHVuaXF1ZWx5IGRlc2lnbmF0ZXMgdGhhdCBhIHBhcnRpY3VsYXIgcHJveHkgaXMgaW5zdGFuY2Ugb2Ygb3VyIER1bW15UHJveHlcbiAqL1xuZXhwb3J0IGNvbnN0IGlzRHluYW1pY1Byb3h5ID0gU3ltYm9sKFwiaXNEeW5hbWljUHJveHlcIik7XG5cbi8qKlxuICogU3ltYm9sIHRoYXQgcmV0cmlldmVzIHRoZSBzb3VyY2UgZnVuY3Rpb24gZnJvbSB0aGUgcHJveHkuIFRoaXMgZnVuY3Rpb24gaXMgZXhwZWN0ZWQgdG8gY3JlYXRlIHRoZSByZXF1aXJlZCB0YXJnZXQgKGUuZy4gcmVzb3VyY2UpLlxuICovXG5leHBvcnQgY29uc3Qgc291cmNlRnVuY3Rpb24gPSBTeW1ib2woXCJzb3VyY2VGdW5jdGlvblwiKTtcblxuLyoqXG4gKiBTaW1wbGUgcHJveHkgaW1wbGVtZW50YXRpb24gdGhhdCB3aWxsIHJlcXVpcmUgcmVzb2x1dGlvbiBhdCBydW50aW1lIChlbmFibGVzIGxhenkgbG9hZGluZykuXG4gKiBVbmxpa2UgZHluYW1pYyBwcm94eSB0aGF0IGNhbiBjcmVhdGUgdGFyZ2V0IG9uIHRoZSBmbHksIHRoaXMgcHJveHlcbiAqIGp1c3QgYSBwbGFjZS1ob2xkZXIgdGhhdCBzdXBwbGllcyB0aGUgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZXNvbHZlIHRoZSB0YXJnZXQuIFxuICogU2luY2UgbW9zdCBDREsgY29uc3RydWN0cyBhcmUgbm90IGlkZW1wb3RlbnQgKG1lYW5pbmcgeW91IGNhbiBub3QgY2FsbCBhIGNyZWF0ZSBmdW5jdGlvbiB0d2ljZSwgdGhlIHNlY29uZCB3aWxsIGZhaWwpXG4gKiB0aGlzIGRlc2lnbiBjaG9pY2Ugd2FzIHRoZSBzaW1wbGVzdCB0byBzdXBwb3J0IGRlY2xhcmF0aXZlIHJlc291cmNlcy4gXG4gKiBDdXN0b21lcnMgY2FuIGNsb25lIHRoZSBzdXBwbGllZCBKU09OIHN0cnVjdHVyZSB3aXRoIGNsb25lRGVlcCBhbmQgcmVwbGFjZSBwcm94aWVzIHdpdGggdGhlIGFjdHVhbCB0YXJnZXRzIGFzIHBhcnQgb2YgdGhhdCBwcm9jZXNzLlxuICovXG5leHBvcnQgY2xhc3MgRHVtbXlQcm94eTxUIGV4dGVuZHMgb2JqZWN0PiBpbXBsZW1lbnRzIFByb3h5SGFuZGxlcjxUPiB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNvdXJjZSA6IE9uZUFyZ0ZuPFQ+KSB7fVxuXG4gICAgcHVibGljIGdldChfOiBULCBrZXk6IFByb3BlcnR5S2V5KTogYW55IHtcbiAgICAgICAgaWYoa2V5ID09PSBpc0R5bmFtaWNQcm94eSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmKGtleSA9PT0gc291cmNlRnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJveHkoe30gYXMgYW55LCBuZXcgRHVtbXlQcm94eSgoYXJnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuc291cmNlKGFyZykgYXMgYW55KVtrZXldO1xuICAgICAgICB9KSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHJlc29sdmVzIHRoZSBwcm94eSB3aXRoIHRoZSB0YXJnZXQsIHRoYXQgZW5hYmxlcyBsYXp5IGxvYWRpbmcgdXNlIGNhc2VzLlxuICogQHBhcmFtIHZhbHVlIHBvdGVudGlhbCBwcm94eSB0byByZXNvbHZlXG4gKiBAcGFyYW0gYXJnIHJlcHJlc2VudHMgdGhlIGFyZ3VtZW50IHRoYXQgc2hvdWxkIGJlIHBhc3NlZCB0byB0aGUgcmVzb2x1dGlvbiBmdW5jdGlvbiAoc291cmNlRnVuY3Rpb24pLlxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlVGFyZ2V0KHZhbHVlOiBhbnksIGFyZzogYW55KSB7XG4gICAgaWYobnV0aWwuaXNQcm94eSh2YWx1ZSkpIHtcbiAgICAgICAgY29uc3Qgb2JqZWN0IDogYW55ID0gdmFsdWU7XG4gICAgICAgIGlmKG9iamVjdFtpc0R5bmFtaWNQcm94eV0pIHtcbiAgICAgICAgICAgIGNvbnN0IGZuOiBPbmVBcmdGbjxhbnk+ICA9IG9iamVjdFtzb3VyY2VGdW5jdGlvbl07XG4gICAgICAgICAgICByZXR1cm4gZm4oYXJnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbiJdfQ==