"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResource = exports.getNamedResource = void 0;
const proxy_utils_1 = require("../utils/proxy-utils");
const uuid_1 = require("uuid");
/**
 * Creates a proxy to the named resource provider. This proxy will resolve to the type of the
 * resource provider under the provided name.
 * It enables getting references to resources outside of the Stack construct and using them with the blueprint:
 * @example
 * const app = new cdk.App();
 * const adminRole: iam.IRole = blueprints.getNamedResource("my-admin-role""); // note, there is no stack class here
 *
 * const clusterProvider = new blueprints.GenericClusterProvider({
     mastersRole: adminRole,
     ... other props
 * });
 * @param resourceName
 * @returns
 */
function getNamedResource(resourceName) {
    return new Proxy({}, new proxy_utils_1.DummyProxy((resourceContext) => {
        return resourceContext.get(resourceName);
    }));
}
exports.getNamedResource = getNamedResource;
/**
 * Creates a proxy to an anonymous resource. This function allows passing the provider function as input.
 * It enables creating ad-hoc references outside of the Stack construct and using them with the blueprint.
 * Designed for cases when resource is defined once and needed in a single place.
 * @example
 * const app = new cdk.App();
 * const clusterProvider = new blueprints.GenericClusterProvider({
 *   mastersRole: blueprints.getResource(context => { // will generate a unique name for resource.
        return new iam.Role(context.scope, 'AdminRole', { assumedBy: new AccountRootPrincipal()});
    }),
    ... other props
});
 * @param resourceName
 * @returns
 */
function getResource(fn) {
    const uid = (0, uuid_1.v4)();
    return new Proxy({}, new proxy_utils_1.DummyProxy((resourceContext) => {
        let result = resourceContext.get(uid);
        if (result == null) {
            resourceContext.add(uid, {
                provide(context) {
                    return fn(context);
                }
            });
            result = resourceContext.get(uid);
        }
        return result;
    }));
}
exports.getResource = getResource;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvcmVzb3VyY2UtcHJvdmlkZXJzL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHNEQUFrRDtBQUVsRCwrQkFBa0M7QUFHbEM7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxTQUFnQixnQkFBZ0IsQ0FBb0MsWUFBcUI7SUFDckYsT0FBTyxJQUFJLEtBQUssQ0FBQyxFQUFPLEVBQUUsSUFBSSx3QkFBVSxDQUFDLENBQUMsZUFBZ0MsRUFBRSxFQUFFO1FBQzFFLE9BQU8sZUFBZSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQU0sQ0FBQztJQUNsRCxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1IsQ0FBQztBQUpELDRDQUlDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxTQUFnQixXQUFXLENBQWtDLEVBQW1DO0lBQzVGLE1BQU0sR0FBRyxHQUFHLElBQUEsU0FBSSxHQUFFLENBQUM7SUFDbkIsT0FBTyxJQUFJLEtBQUssQ0FBQyxFQUFPLEVBQUUsSUFBSSx3QkFBVSxDQUFDLENBQUMsZUFBZ0MsRUFBRSxFQUFFO1FBQzFFLElBQUksTUFBTSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEMsSUFBRyxNQUFNLElBQUksSUFBSSxFQUFFLENBQUM7WUFDaEIsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3JCLE9BQU8sQ0FBQyxPQUF3QjtvQkFDNUIsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZCLENBQUM7YUFDSixDQUFDLENBQUM7WUFDSCxNQUFNLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQU0sQ0FBQztRQUMzQyxDQUFDO1FBQ0QsT0FBTyxNQUFXLENBQUM7SUFDdkIsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLENBQUM7QUFkRCxrQ0FjQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElSZXNvdXJjZSB9IGZyb20gJ2F3cy1jZGstbGliL2NvcmUnO1xuaW1wb3J0IHsgRHVtbXlQcm94eSB9IGZyb20gJy4uL3V0aWxzL3Byb3h5LXV0aWxzJztcbmltcG9ydCB7IFJlc291cmNlQ29udGV4dCB9IGZyb20gJy4uL3NwaSc7XG5pbXBvcnQgeyB2NCBhcyB1dWlkIH0gZnJvbSAndXVpZCc7XG5pbXBvcnQgeyBJQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHByb3h5IHRvIHRoZSBuYW1lZCByZXNvdXJjZSBwcm92aWRlci4gVGhpcyBwcm94eSB3aWxsIHJlc29sdmUgdG8gdGhlIHR5cGUgb2YgdGhlIFxuICogcmVzb3VyY2UgcHJvdmlkZXIgdW5kZXIgdGhlIHByb3ZpZGVkIG5hbWUuIFxuICogSXQgZW5hYmxlcyBnZXR0aW5nIHJlZmVyZW5jZXMgdG8gcmVzb3VyY2VzIG91dHNpZGUgb2YgdGhlIFN0YWNrIGNvbnN0cnVjdCBhbmQgdXNpbmcgdGhlbSB3aXRoIHRoZSBibHVlcHJpbnQ6XG4gKiBAZXhhbXBsZVxuICogY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAqIGNvbnN0IGFkbWluUm9sZTogaWFtLklSb2xlID0gYmx1ZXByaW50cy5nZXROYW1lZFJlc291cmNlKFwibXktYWRtaW4tcm9sZVwiXCIpOyAvLyBub3RlLCB0aGVyZSBpcyBubyBzdGFjayBjbGFzcyBoZXJlXG4gKiBcbiAqIGNvbnN0IGNsdXN0ZXJQcm92aWRlciA9IG5ldyBibHVlcHJpbnRzLkdlbmVyaWNDbHVzdGVyUHJvdmlkZXIoe1xuICAgICBtYXN0ZXJzUm9sZTogYWRtaW5Sb2xlLFxuICAgICAuLi4gb3RoZXIgcHJvcHNcbiAqIH0pO1xuICogQHBhcmFtIHJlc291cmNlTmFtZSBcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmFtZWRSZXNvdXJjZTxUIGV4dGVuZHMgSUNvbnN0cnVjdCA9IElDb25zdHJ1Y3Q+KHJlc291cmNlTmFtZSA6IHN0cmluZykgOiBUIHtcbiAgICByZXR1cm4gbmV3IFByb3h5KHt9IGFzIFQsIG5ldyBEdW1teVByb3h5KChyZXNvdXJjZUNvbnRleHQ6IFJlc291cmNlQ29udGV4dCkgPT4ge1xuICAgICAgICByZXR1cm4gcmVzb3VyY2VDb250ZXh0LmdldChyZXNvdXJjZU5hbWUpIGFzIFQ7XG4gICAgfSkpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBwcm94eSB0byBhbiBhbm9ueW1vdXMgcmVzb3VyY2UuIFRoaXMgZnVuY3Rpb24gYWxsb3dzIHBhc3NpbmcgdGhlIHByb3ZpZGVyIGZ1bmN0aW9uIGFzIGlucHV0LiAgXG4gKiBJdCBlbmFibGVzIGNyZWF0aW5nIGFkLWhvYyByZWZlcmVuY2VzIG91dHNpZGUgb2YgdGhlIFN0YWNrIGNvbnN0cnVjdCBhbmQgdXNpbmcgdGhlbSB3aXRoIHRoZSBibHVlcHJpbnQuXG4gKiBEZXNpZ25lZCBmb3IgY2FzZXMgd2hlbiByZXNvdXJjZSBpcyBkZWZpbmVkIG9uY2UgYW5kIG5lZWRlZCBpbiBhIHNpbmdsZSBwbGFjZS5cbiAqIEBleGFtcGxlXG4gKiBjb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuICogY29uc3QgY2x1c3RlclByb3ZpZGVyID0gbmV3IGJsdWVwcmludHMuR2VuZXJpY0NsdXN0ZXJQcm92aWRlcih7XG4gKiAgIG1hc3RlcnNSb2xlOiBibHVlcHJpbnRzLmdldFJlc291cmNlKGNvbnRleHQgPT4geyAvLyB3aWxsIGdlbmVyYXRlIGEgdW5pcXVlIG5hbWUgZm9yIHJlc291cmNlLiBcbiAgICAgICAgcmV0dXJuIG5ldyBpYW0uUm9sZShjb250ZXh0LnNjb3BlLCAnQWRtaW5Sb2xlJywgeyBhc3N1bWVkQnk6IG5ldyBBY2NvdW50Um9vdFByaW5jaXBhbCgpfSk7XG4gICAgfSksXG4gICAgLi4uIG90aGVyIHByb3BzXG59KTtcbiAqIEBwYXJhbSByZXNvdXJjZU5hbWUgXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlc291cmNlPFQgZXh0ZW5kcyBJUmVzb3VyY2UgPSBJUmVzb3VyY2U+KGZuOiAoY29udGV4dDogUmVzb3VyY2VDb250ZXh0KSA9PiBUKSA6IFQge1xuICAgIGNvbnN0IHVpZCA9IHV1aWQoKTtcbiAgICByZXR1cm4gbmV3IFByb3h5KHt9IGFzIFQsIG5ldyBEdW1teVByb3h5KChyZXNvdXJjZUNvbnRleHQ6IFJlc291cmNlQ29udGV4dCkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gcmVzb3VyY2VDb250ZXh0LmdldCh1aWQpO1xuICAgICAgICBpZihyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzb3VyY2VDb250ZXh0LmFkZCh1aWQsIHtcbiAgICAgICAgICAgICAgICBwcm92aWRlKGNvbnRleHQ6IFJlc291cmNlQ29udGV4dCkgOiBUIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuKGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzb3VyY2VDb250ZXh0LmdldCh1aWQpIGFzIFQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdCBhcyBUO1xuICAgIH0pKTtcbn1cbiJdfQ==