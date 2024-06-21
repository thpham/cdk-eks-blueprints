"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelmAddOn = exports.HelmAddonPropsConstraints = void 0;
const helm_version_checker_1 = require("./helm-version-checker");
const kubectl_provider_1 = require("./kubectl-provider");
const utils = require("../../utils");
class HelmAddonPropsConstraints {
    constructor() {
        /**
        * chart can be no less than 1 character long, and no greater than 63 characters long due to DNS system limitations.
        * https://helm.sh/docs/chart_template_guide/getting_started/#:~:text=TIP%3A%20The%20name%3A%20field%20is,are%20limited%20to%2053%20characters
        */
        this.chart = new utils.StringConstraint(1, 63);
        /**
        * name can be no less than 1 character long, and no greater than 63 characters long due to DNS system limitations.
        * https://helm.sh/docs/chart_template_guide/getting_started/#:~:text=TIP%3A%20The%20name%3A%20field%20is,are%20limited%20to%2053%20characters
        */
        this.name = new utils.StringConstraint(1, 63);
        /**
        * namespace can be no less than 1 character long, and no greater than 63 characters long due to DNS system limitations.
        * https://helm.sh/docs/chart_template_guide/getting_started/#:~:text=TIP%3A%20The%20name%3A%20field%20is,are%20limited%20to%2053%20characters
        */
        this.namespace = new utils.StringConstraint(1, 63);
        /**
        * release can be no less than 1 character long, and no greater than 53 characters long.
        * https://helm.sh/docs/chart_template_guide/getting_started/#:~:text=TIP%3A%20The%20name%3A%20field%20is,are%20limited%20to%2053%20characters
        */
        this.release = new utils.StringConstraint(1, 53);
        /**
        * repository can be no less than 0 characters long, and no greater than 4096 characters long. It also must follow a URL format.
        * https://docs.aws.amazon.com/connect/latest/APIReference/API_UrlReference.html
        */
        this.repository = new utils.UrlStringConstraint(0, 4096);
        /**
        * version can be no less than 1 character long, and no greater than 63 characters long due to DNS system limitations.
        * https://helm.sh/docs/chart_template_guide/getting_started/#:~:text=TIP%3A%20The%20name%3A%20field%20is,are%20limited%20to%2053%20characters
        */
        this.version = new utils.StringConstraint(1, 63);
    }
}
exports.HelmAddonPropsConstraints = HelmAddonPropsConstraints;
class HelmAddOn {
    constructor(props) {
        this.props = utils.cloneDeep(props); // avoids polution when reusing the same props across stacks, such as values
        utils.validateConstraints(new HelmAddonPropsConstraints, HelmAddOn.name, props);
        HelmAddOn.validateVersion(props);
    }
    static validateVersion(helmChart) {
        if (HelmAddOn.validateHelmVersions && !helmChart.skipVersionValidation) {
            const result = (0, helm_version_checker_1.checkHelmChartVersion)(helmChart);
            if (this.failOnVersionValidation && !result.latestVersion) {
                throw new Error(`Helm version validation failed for ${helmChart.chart}. 
                    Used version ${helmChart.version}, latest version: ${result.highestVersion}`);
            }
        }
    }
    /**
     * Deploys the helm chart in the cluster.
     * @param clusterInfo
     * @param values
     * @param createNamespace
     * @param wait
     * @param timeout
     * @returns
     */
    addHelmChart(clusterInfo, values, createNamespace, wait, timeout) {
        var _a;
        const kubectlProvider = new kubectl_provider_1.KubectlProvider(clusterInfo);
        values = values !== null && values !== void 0 ? values : {};
        const dependencyMode = (_a = this.props.dependencyMode) !== null && _a !== void 0 ? _a : true;
        const chart = { ...this.props, ...{ values, dependencyMode, wait, timeout, createNamespace } };
        return kubectlProvider.addHelmChart(chart);
    }
}
exports.HelmAddOn = HelmAddOn;
HelmAddOn.validateHelmVersions = false;
HelmAddOn.failOnVersionValidation = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2hlbG0tYWRkb24vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsaUVBQWlGO0FBQ2pGLHlEQUE2RTtBQUU3RSxxQ0FBcUM7QUFLckMsTUFBYSx5QkFBeUI7SUFBdEM7UUFDSTs7O1VBR0U7UUFDRixVQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTFDOzs7VUFHRTtRQUNGLFNBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFekM7OztVQUdFO1FBQ0YsY0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU5Qzs7O1VBR0U7UUFDRixZQUFPLEdBQUcsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTVDOzs7VUFHRTtRQUNGLGVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFcEQ7OztVQUdFO1FBQ0YsWUFBTyxHQUFHLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNoRCxDQUFDO0NBQUE7QUFwQ0QsOERBb0NDO0FBRUQsTUFBc0IsU0FBUztJQU8zQixZQUFZLEtBQXFCO1FBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLDRFQUE0RTtRQUNqSCxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSx5QkFBeUIsRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hGLFNBQVMsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBMkI7UUFDckQsSUFBRyxTQUFTLENBQUMsb0JBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUNwRSxNQUFNLE1BQU0sR0FBRyxJQUFBLDRDQUFxQixFQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELElBQUcsSUFBSSxDQUFDLHVCQUF1QixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN2RCxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxTQUFTLENBQUMsS0FBSzttQ0FDbEQsU0FBUyxDQUFDLE9BQU8scUJBQXFCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQ3RGLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQVNEOzs7Ozs7OztPQVFHO0lBQ08sWUFBWSxDQUFDLFdBQTRCLEVBQUUsTUFBbUIsRUFBRSxlQUF5QixFQUFFLElBQWMsRUFBRSxPQUFrQjs7UUFDcEksTUFBTSxlQUFlLEdBQUcsSUFBSSxrQ0FBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sR0FBRyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxFQUFFLENBQUM7UUFDdEIsTUFBTSxjQUFjLEdBQUcsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsbUNBQUksSUFBSSxDQUFDO1FBQ3pELE1BQU0sS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLEVBQUUsQ0FBQztRQUMvRixPQUFPLGVBQWUsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0MsQ0FBQzs7QUE3Q0wsOEJBOENDO0FBMUNpQiw4QkFBb0IsR0FBRyxLQUFLLENBQUM7QUFDN0IsaUNBQXVCLEdBQUcsS0FBSyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBIZWxtQ2hhcnRWZXJzaW9uLCBjaGVja0hlbG1DaGFydFZlcnNpb24gfSBmcm9tIFwiLi9oZWxtLXZlcnNpb24tY2hlY2tlclwiO1xuaW1wb3J0IHsgSGVsbUNoYXJ0Q29uZmlndXJhdGlvbiwgS3ViZWN0bFByb3ZpZGVyIH0gZnJvbSBcIi4va3ViZWN0bC1wcm92aWRlclwiO1xuaW1wb3J0ICogYXMgc3BpIGZyb20gXCIuLi8uLlwiO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSBcIi4uLy4uL3V0aWxzXCI7XG5cbmV4cG9ydCB0eXBlIEhlbG1BZGRPblByb3BzID0gSGVsbUNoYXJ0Q29uZmlndXJhdGlvbjtcbmV4cG9ydCB0eXBlIEhlbG1BZGRPblVzZXJQcm9wcyA9IFBhcnRpYWw8SGVsbUNoYXJ0Q29uZmlndXJhdGlvbj47XG5cbmV4cG9ydCBjbGFzcyBIZWxtQWRkb25Qcm9wc0NvbnN0cmFpbnRzIGltcGxlbWVudHMgdXRpbHMuQ29uc3RyYWludHNUeXBlPEhlbG1BZGRPblByb3BzPiB7XG4gICAgLyoqXG4gICAgKiBjaGFydCBjYW4gYmUgbm8gbGVzcyB0aGFuIDEgY2hhcmFjdGVyIGxvbmcsIGFuZCBubyBncmVhdGVyIHRoYW4gNjMgY2hhcmFjdGVycyBsb25nIGR1ZSB0byBETlMgc3lzdGVtIGxpbWl0YXRpb25zLlxuICAgICogaHR0cHM6Ly9oZWxtLnNoL2RvY3MvY2hhcnRfdGVtcGxhdGVfZ3VpZGUvZ2V0dGluZ19zdGFydGVkLyM6fjp0ZXh0PVRJUCUzQSUyMFRoZSUyMG5hbWUlM0ElMjBmaWVsZCUyMGlzLGFyZSUyMGxpbWl0ZWQlMjB0byUyMDUzJTIwY2hhcmFjdGVyc1xuICAgICovXG4gICAgY2hhcnQgPSBuZXcgdXRpbHMuU3RyaW5nQ29uc3RyYWludCgxLCA2Myk7XG5cbiAgICAvKipcbiAgICAqIG5hbWUgY2FuIGJlIG5vIGxlc3MgdGhhbiAxIGNoYXJhY3RlciBsb25nLCBhbmQgbm8gZ3JlYXRlciB0aGFuIDYzIGNoYXJhY3RlcnMgbG9uZyBkdWUgdG8gRE5TIHN5c3RlbSBsaW1pdGF0aW9ucy5cbiAgICAqIGh0dHBzOi8vaGVsbS5zaC9kb2NzL2NoYXJ0X3RlbXBsYXRlX2d1aWRlL2dldHRpbmdfc3RhcnRlZC8jOn46dGV4dD1USVAlM0ElMjBUaGUlMjBuYW1lJTNBJTIwZmllbGQlMjBpcyxhcmUlMjBsaW1pdGVkJTIwdG8lMjA1MyUyMGNoYXJhY3RlcnNcbiAgICAqL1xuICAgIG5hbWUgPSBuZXcgdXRpbHMuU3RyaW5nQ29uc3RyYWludCgxLCA2Myk7XG5cbiAgICAvKipcbiAgICAqIG5hbWVzcGFjZSBjYW4gYmUgbm8gbGVzcyB0aGFuIDEgY2hhcmFjdGVyIGxvbmcsIGFuZCBubyBncmVhdGVyIHRoYW4gNjMgY2hhcmFjdGVycyBsb25nIGR1ZSB0byBETlMgc3lzdGVtIGxpbWl0YXRpb25zLlxuICAgICogaHR0cHM6Ly9oZWxtLnNoL2RvY3MvY2hhcnRfdGVtcGxhdGVfZ3VpZGUvZ2V0dGluZ19zdGFydGVkLyM6fjp0ZXh0PVRJUCUzQSUyMFRoZSUyMG5hbWUlM0ElMjBmaWVsZCUyMGlzLGFyZSUyMGxpbWl0ZWQlMjB0byUyMDUzJTIwY2hhcmFjdGVyc1xuICAgICovXG4gICAgbmFtZXNwYWNlID0gbmV3IHV0aWxzLlN0cmluZ0NvbnN0cmFpbnQoMSwgNjMpO1xuXG4gICAgLyoqXG4gICAgKiByZWxlYXNlIGNhbiBiZSBubyBsZXNzIHRoYW4gMSBjaGFyYWN0ZXIgbG9uZywgYW5kIG5vIGdyZWF0ZXIgdGhhbiA1MyBjaGFyYWN0ZXJzIGxvbmcuXG4gICAgKiBodHRwczovL2hlbG0uc2gvZG9jcy9jaGFydF90ZW1wbGF0ZV9ndWlkZS9nZXR0aW5nX3N0YXJ0ZWQvIzp+OnRleHQ9VElQJTNBJTIwVGhlJTIwbmFtZSUzQSUyMGZpZWxkJTIwaXMsYXJlJTIwbGltaXRlZCUyMHRvJTIwNTMlMjBjaGFyYWN0ZXJzXG4gICAgKi9cbiAgICByZWxlYXNlID0gbmV3IHV0aWxzLlN0cmluZ0NvbnN0cmFpbnQoMSwgNTMpO1xuXG4gICAgLyoqXG4gICAgKiByZXBvc2l0b3J5IGNhbiBiZSBubyBsZXNzIHRoYW4gMCBjaGFyYWN0ZXJzIGxvbmcsIGFuZCBubyBncmVhdGVyIHRoYW4gNDA5NiBjaGFyYWN0ZXJzIGxvbmcuIEl0IGFsc28gbXVzdCBmb2xsb3cgYSBVUkwgZm9ybWF0LlxuICAgICogaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2Nvbm5lY3QvbGF0ZXN0L0FQSVJlZmVyZW5jZS9BUElfVXJsUmVmZXJlbmNlLmh0bWxcbiAgICAqL1xuICAgIHJlcG9zaXRvcnkgPSBuZXcgdXRpbHMuVXJsU3RyaW5nQ29uc3RyYWludCgwLCA0MDk2KTtcblxuICAgIC8qKlxuICAgICogdmVyc2lvbiBjYW4gYmUgbm8gbGVzcyB0aGFuIDEgY2hhcmFjdGVyIGxvbmcsIGFuZCBubyBncmVhdGVyIHRoYW4gNjMgY2hhcmFjdGVycyBsb25nIGR1ZSB0byBETlMgc3lzdGVtIGxpbWl0YXRpb25zLlxuICAgICogaHR0cHM6Ly9oZWxtLnNoL2RvY3MvY2hhcnRfdGVtcGxhdGVfZ3VpZGUvZ2V0dGluZ19zdGFydGVkLyM6fjp0ZXh0PVRJUCUzQSUyMFRoZSUyMG5hbWUlM0ElMjBmaWVsZCUyMGlzLGFyZSUyMGxpbWl0ZWQlMjB0byUyMDUzJTIwY2hhcmFjdGVyc1xuICAgICovXG4gICAgdmVyc2lvbiA9IG5ldyB1dGlscy5TdHJpbmdDb25zdHJhaW50KDEsIDYzKTtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhlbG1BZGRPbiBpbXBsZW1lbnRzIHNwaS5DbHVzdGVyQWRkT24ge1xuXG4gICAgcHJvcHM6IEhlbG1BZGRPblByb3BzO1xuXG4gICAgcHVibGljIHN0YXRpYyB2YWxpZGF0ZUhlbG1WZXJzaW9ucyA9IGZhbHNlO1xuICAgIHB1YmxpYyBzdGF0aWMgZmFpbE9uVmVyc2lvblZhbGlkYXRpb24gPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBIZWxtQWRkT25Qcm9wcykge1xuICAgICAgICB0aGlzLnByb3BzID0gdXRpbHMuY2xvbmVEZWVwKHByb3BzKTsgLy8gYXZvaWRzIHBvbHV0aW9uIHdoZW4gcmV1c2luZyB0aGUgc2FtZSBwcm9wcyBhY3Jvc3Mgc3RhY2tzLCBzdWNoIGFzIHZhbHVlc1xuICAgICAgICB1dGlscy52YWxpZGF0ZUNvbnN0cmFpbnRzKG5ldyBIZWxtQWRkb25Qcm9wc0NvbnN0cmFpbnRzLCBIZWxtQWRkT24ubmFtZSwgcHJvcHMpO1xuICAgICAgICBIZWxtQWRkT24udmFsaWRhdGVWZXJzaW9uKHByb3BzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHZhbGlkYXRlVmVyc2lvbihoZWxtQ2hhcnQ6IEhlbG1DaGFydFZlcnNpb24pIHtcbiAgICAgICAgaWYoSGVsbUFkZE9uLnZhbGlkYXRlSGVsbVZlcnNpb25zICYmICFoZWxtQ2hhcnQuc2tpcFZlcnNpb25WYWxpZGF0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBjaGVja0hlbG1DaGFydFZlcnNpb24oaGVsbUNoYXJ0KTtcbiAgICAgICAgICAgIGlmKHRoaXMuZmFpbE9uVmVyc2lvblZhbGlkYXRpb24gJiYgIXJlc3VsdC5sYXRlc3RWZXJzaW9uKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBIZWxtIHZlcnNpb24gdmFsaWRhdGlvbiBmYWlsZWQgZm9yICR7aGVsbUNoYXJ0LmNoYXJ0fS4gXG4gICAgICAgICAgICAgICAgICAgIFVzZWQgdmVyc2lvbiAke2hlbG1DaGFydC52ZXJzaW9ufSwgbGF0ZXN0IHZlcnNpb246ICR7cmVzdWx0LmhpZ2hlc3RWZXJzaW9ufWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXhwZWN0ZWQgdG8gYmUgaW1wbGVtZW50ZWQgaW4gY29uY3JldGUgc3ViY2xhc3Nlcy5cbiAgICAgKiBAcGFyYW0gY2x1c3RlckluZm8gXG4gICAgICovXG4gICAgYWJzdHJhY3QgZGVwbG95KGNsdXN0ZXJJbmZvOiBzcGkuQ2x1c3RlckluZm8pOiB2b2lkIHwgUHJvbWlzZTxDb25zdHJ1Y3Q+O1xuXG4gXG4gICAgLyoqXG4gICAgICogRGVwbG95cyB0aGUgaGVsbSBjaGFydCBpbiB0aGUgY2x1c3Rlci4gXG4gICAgICogQHBhcmFtIGNsdXN0ZXJJbmZvIFxuICAgICAqIEBwYXJhbSB2YWx1ZXMgXG4gICAgICogQHBhcmFtIGNyZWF0ZU5hbWVzcGFjZSBcbiAgICAgKiBAcGFyYW0gd2FpdCBcbiAgICAgKiBAcGFyYW0gdGltZW91dCBcbiAgICAgKiBAcmV0dXJucyBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYWRkSGVsbUNoYXJ0KGNsdXN0ZXJJbmZvOiBzcGkuQ2x1c3RlckluZm8sIHZhbHVlcz86IHNwaS5WYWx1ZXMsIGNyZWF0ZU5hbWVzcGFjZT86IGJvb2xlYW4sIHdhaXQ/OiBib29sZWFuLCB0aW1lb3V0PzogRHVyYXRpb24pOiBDb25zdHJ1Y3Qge1xuICAgICAgIGNvbnN0IGt1YmVjdGxQcm92aWRlciA9IG5ldyBLdWJlY3RsUHJvdmlkZXIoY2x1c3RlckluZm8pO1xuICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMgPz8ge307XG4gICAgICAgIGNvbnN0IGRlcGVuZGVuY3lNb2RlID0gdGhpcy5wcm9wcy5kZXBlbmRlbmN5TW9kZSA/PyB0cnVlO1xuICAgICAgICBjb25zdCBjaGFydCA9IHsgLi4udGhpcy5wcm9wcywgLi4ueyB2YWx1ZXMsIGRlcGVuZGVuY3lNb2RlLCB3YWl0LCB0aW1lb3V0LCBjcmVhdGVOYW1lc3BhY2UgfSB9O1xuICAgICAgICByZXR1cm4ga3ViZWN0bFByb3ZpZGVyLmFkZEhlbG1DaGFydChjaGFydCk7XG4gICAgfVxufVxuIl19