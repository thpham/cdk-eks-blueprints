"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeYaml = exports.loadExternalYaml = exports.loadYaml = exports.loadMultiResourceYaml = exports.readYamlDocument = exports.applyYamlFromDir = void 0;
const fs = require("fs");
const yaml = require("js-yaml");
/**
 * Applies all manifests from a directory. Note: The manifests are not checked,
 * so user must ensure the manifests have the correct namespaces.
 * @param dir
 * @param cluster
 * @param namespaceManifest
 */
function applyYamlFromDir(dir, cluster, namespaceManifest) {
    fs.readdirSync(dir, { encoding: 'utf8' }).forEach((file, index) => {
        if (file.split('.').pop() == 'yaml') {
            const data = fs.readFileSync(dir + file, 'utf8');
            if (data != undefined) {
                yaml.loadAll(data, function (item) {
                    const resources = cluster.addManifest(file.substring(0, file.length - 5) + index, item);
                    resources.node.addDependency(namespaceManifest);
                });
            }
        }
    });
}
exports.applyYamlFromDir = applyYamlFromDir;
/**
 * Reads the YAML document from a local path.
 * @param path YAML document path
 * @returns YAML document string
 */
function readYamlDocument(path) {
    try {
        const doc = fs.readFileSync(path, 'utf8');
        return doc;
    }
    catch (e) {
        console.log(e + ' for path: ' + path);
        throw e;
    }
}
exports.readYamlDocument = readYamlDocument;
/**
 * Reads the YAML document from a local path and parses them as
 * multiple YAML documents separated by `---` as expected in a Kubernetes manifest file
 * @param path YAML document path
 * @returns a list of parsed YAML documents
 */
function loadMultiResourceYaml(path) {
    const doc = readYamlDocument(path);
    return doc.split("---").map((e) => loadYaml(e));
}
exports.loadMultiResourceYaml = loadMultiResourceYaml;
/**
 * Parses the sting document into a single YAML document
 * @param document document
 * @returns yaml document
 */
function loadYaml(document) {
    return yaml.load(document);
}
exports.loadYaml = loadYaml;
/**
 * Reads the YAML document from a URL and parses
 * multiple YAML documents separated by `---` as expected in a Kubernetes manifest file Note: The file from the URL is
 * not validated, so user must ensure the URL contains a valid manifest.
 * @param url YAML document URL
 * @returns a list of parsed YAML documents
 */
function loadExternalYaml(url) {
    /* eslint-disable */
    const request = require('sync-request'); // moved away from import as it is causing open handles that prevents jest from completion
    const response = request('GET', url);
    return yaml.loadAll(response.getBody().toString());
}
exports.loadExternalYaml = loadExternalYaml;
/**
 * Serializes object as a YAML document
 * @param document document
 * @returns yaml document
 */
function serializeYaml(document) {
    return yaml.dump(document);
}
exports.serializeYaml = serializeYaml;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWFtbC11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi91dGlscy95YW1sLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHlCQUF5QjtBQUN6QixnQ0FBZ0M7QUFHaEM7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQXFCLEVBQUUsaUJBQXFDO0lBQ3RHLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQzlELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNsQyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakQsSUFBSSxJQUFJLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQVUsSUFBSTtvQkFDN0IsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssRUFBeUIsSUFBSSxDQUFDLENBQUM7b0JBQy9HLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3BELENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFaRCw0Q0FZQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixnQkFBZ0IsQ0FBQyxJQUFZO0lBQ3pDLElBQUksQ0FBQztRQUNELE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDdEMsTUFBTSxDQUFDLENBQUM7SUFDWixDQUFDO0FBQ0wsQ0FBQztBQVJELDRDQVFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixxQkFBcUIsQ0FBQyxJQUFZO0lBQzlDLE1BQU0sR0FBRyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFIRCxzREFHQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixRQUFRLENBQUMsUUFBZ0I7SUFDckMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCw0QkFFQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLEdBQVc7SUFDeEMsb0JBQW9CO0lBQ3BCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLDBGQUEwRjtJQUNuSSxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3JDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBTEQsNENBS0M7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLFFBQWE7SUFDdkMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFGRCxzQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGVrcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWtzJztcbmltcG9ydCB7IEt1YmVybmV0ZXNNYW5pZmVzdCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1la3MnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgeWFtbCBmcm9tICdqcy15YW1sJztcblxuXG4vKipcbiAqIEFwcGxpZXMgYWxsIG1hbmlmZXN0cyBmcm9tIGEgZGlyZWN0b3J5LiBOb3RlOiBUaGUgbWFuaWZlc3RzIGFyZSBub3QgY2hlY2tlZCwgXG4gKiBzbyB1c2VyIG11c3QgZW5zdXJlIHRoZSBtYW5pZmVzdHMgaGF2ZSB0aGUgY29ycmVjdCBuYW1lc3BhY2VzLiBcbiAqIEBwYXJhbSBkaXIgXG4gKiBAcGFyYW0gY2x1c3RlciBcbiAqIEBwYXJhbSBuYW1lc3BhY2VNYW5pZmVzdCBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5WWFtbEZyb21EaXIoZGlyOiBzdHJpbmcsIGNsdXN0ZXI6IGVrcy5JQ2x1c3RlciwgbmFtZXNwYWNlTWFuaWZlc3Q6IEt1YmVybmV0ZXNNYW5pZmVzdCk6IHZvaWQge1xuICAgIGZzLnJlYWRkaXJTeW5jKGRpciwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pLmZvckVhY2goKGZpbGUsIGluZGV4KSA9PiB7XG4gICAgICAgIGlmIChmaWxlLnNwbGl0KCcuJykucG9wKCkgPT0gJ3lhbWwnKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKGRpciArIGZpbGUsICd1dGY4Jyk7XG4gICAgICAgICAgICBpZiAoZGF0YSAhPSB1bmRlZmluZWQpIHsgIFxuICAgICAgICAgICAgICAgIHlhbWwubG9hZEFsbChkYXRhLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNvdXJjZXMgPSBjbHVzdGVyLmFkZE1hbmlmZXN0KGZpbGUuc3Vic3RyaW5nKDAsIGZpbGUubGVuZ3RoIC0gNSkgKyBpbmRleCwgPFJlY29yZDxzdHJpbmcsIGFueT5bXT5pdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzLm5vZGUuYWRkRGVwZW5kZW5jeShuYW1lc3BhY2VNYW5pZmVzdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBSZWFkcyB0aGUgWUFNTCBkb2N1bWVudCBmcm9tIGEgbG9jYWwgcGF0aC4gXG4gKiBAcGFyYW0gcGF0aCBZQU1MIGRvY3VtZW50IHBhdGhcbiAqIEByZXR1cm5zIFlBTUwgZG9jdW1lbnQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkWWFtbERvY3VtZW50KHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZG9jID0gZnMucmVhZEZpbGVTeW5jKHBhdGgsICd1dGY4Jyk7XG4gICAgICAgIHJldHVybiBkb2M7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlICsgJyBmb3IgcGF0aDogJyArIHBhdGgpO1xuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZWFkcyB0aGUgWUFNTCBkb2N1bWVudCBmcm9tIGEgbG9jYWwgcGF0aCBhbmQgcGFyc2VzIHRoZW0gYXMgXG4gKiBtdWx0aXBsZSBZQU1MIGRvY3VtZW50cyBzZXBhcmF0ZWQgYnkgYC0tLWAgYXMgZXhwZWN0ZWQgaW4gYSBLdWJlcm5ldGVzIG1hbmlmZXN0IGZpbGVcbiAqIEBwYXJhbSBwYXRoIFlBTUwgZG9jdW1lbnQgcGF0aFxuICogQHJldHVybnMgYSBsaXN0IG9mIHBhcnNlZCBZQU1MIGRvY3VtZW50c1xuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZE11bHRpUmVzb3VyY2VZYW1sKHBhdGg6IHN0cmluZyk6IGFueSB7XG4gICAgY29uc3QgZG9jID0gcmVhZFlhbWxEb2N1bWVudChwYXRoKTtcbiAgICByZXR1cm4gZG9jLnNwbGl0KFwiLS0tXCIpLm1hcCgoZTogYW55KSA9PiBsb2FkWWFtbChlKSk7XG59XG5cbi8qKlxuICogUGFyc2VzIHRoZSBzdGluZyBkb2N1bWVudCBpbnRvIGEgc2luZ2xlIFlBTUwgZG9jdW1lbnRcbiAqIEBwYXJhbSBkb2N1bWVudCBkb2N1bWVudCBcbiAqIEByZXR1cm5zIHlhbWwgZG9jdW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRZYW1sKGRvY3VtZW50OiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiB5YW1sLmxvYWQoZG9jdW1lbnQpO1xufVxuXG4vKipcbiAqIFJlYWRzIHRoZSBZQU1MIGRvY3VtZW50IGZyb20gYSBVUkwgYW5kIHBhcnNlcyBcbiAqIG11bHRpcGxlIFlBTUwgZG9jdW1lbnRzIHNlcGFyYXRlZCBieSBgLS0tYCBhcyBleHBlY3RlZCBpbiBhIEt1YmVybmV0ZXMgbWFuaWZlc3QgZmlsZSBOb3RlOiBUaGUgZmlsZSBmcm9tIHRoZSBVUkwgaXNcbiAqIG5vdCB2YWxpZGF0ZWQsIHNvIHVzZXIgbXVzdCBlbnN1cmUgdGhlIFVSTCBjb250YWlucyBhIHZhbGlkIG1hbmlmZXN0LlxuICogQHBhcmFtIHVybCBZQU1MIGRvY3VtZW50IFVSTFxuICogQHJldHVybnMgYSBsaXN0IG9mIHBhcnNlZCBZQU1MIGRvY3VtZW50c1xuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZEV4dGVybmFsWWFtbCh1cmw6IHN0cmluZyk6IGFueSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgKi9cbiAgICBjb25zdCByZXF1ZXN0ID0gcmVxdWlyZSgnc3luYy1yZXF1ZXN0Jyk7IC8vIG1vdmVkIGF3YXkgZnJvbSBpbXBvcnQgYXMgaXQgaXMgY2F1c2luZyBvcGVuIGhhbmRsZXMgdGhhdCBwcmV2ZW50cyBqZXN0IGZyb20gY29tcGxldGlvblxuICAgIGNvbnN0IHJlc3BvbnNlID0gcmVxdWVzdCgnR0VUJywgdXJsKTtcbiAgICByZXR1cm4geWFtbC5sb2FkQWxsKHJlc3BvbnNlLmdldEJvZHkoKS50b1N0cmluZygpKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIG9iamVjdCBhcyBhIFlBTUwgZG9jdW1lbnRcbiAqIEBwYXJhbSBkb2N1bWVudCBkb2N1bWVudCBcbiAqIEByZXR1cm5zIHlhbWwgZG9jdW1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZVlhbWwoZG9jdW1lbnQ6IGFueSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHlhbWwuZHVtcChkb2N1bWVudCk7XG59Il19