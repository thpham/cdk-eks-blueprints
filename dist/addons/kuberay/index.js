"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KubeRayAddOn = void 0;
const ts_deepmerge_1 = require("ts-deepmerge");
const utils_1 = require("../../utils");
const helm_addon_1 = require("../helm-addon");
/**
 * Default props to be used when creating the Helm chart
 */
const defaultProps = {
    name: "kuberay-operator",
    chart: "kuberay-operator",
    namespace: "default",
    version: "1.1.1",
    release: "kuberay-operator",
    repository: "https://ray-project.github.io/kuberay-helm",
    values: {},
    createNamespace: true
};
/**
 * Main class to instantiate the Helm chart
 */
class KubeRayAddOn extends helm_addon_1.HelmAddOn {
    constructor(props) {
        super({ ...defaultProps, ...props });
        this.options = this.props;
    }
    deploy(clusterInfo) {
        var _a, _b;
        const cluster = clusterInfo.cluster;
        let values = (_a = this.options.values) !== null && _a !== void 0 ? _a : {};
        values = (0, ts_deepmerge_1.merge)(values, (_b = this.props.values) !== null && _b !== void 0 ? _b : {});
        const chart = this.addHelmChart(clusterInfo, values);
        if (this.options.createNamespace == true) {
            const namespace = (0, utils_1.createNamespace)(this.options.namespace, cluster);
            chart.node.addDependency(namespace);
        }
        return Promise.resolve(chart);
    }
}
exports.KubeRayAddOn = KubeRayAddOn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9saWIvYWRkb25zL2t1YmVyYXkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0NBQXFDO0FBRXJDLHVDQUE4QztBQUM5Qyw4Q0FBOEU7QUFZOUU7O0dBRUc7QUFDSCxNQUFNLFlBQVksR0FBdUM7SUFDdkQsSUFBSSxFQUFFLGtCQUFrQjtJQUN4QixLQUFLLEVBQUUsa0JBQWtCO0lBQ3pCLFNBQVMsRUFBRSxTQUFTO0lBQ3BCLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLE9BQU8sRUFBRSxrQkFBa0I7SUFDM0IsVUFBVSxFQUFFLDRDQUE0QztJQUN4RCxNQUFNLEVBQUUsRUFBRTtJQUNWLGVBQWUsRUFBRSxJQUFJO0NBQ3RCLENBQUM7QUFFRjs7R0FFRztBQUNILE1BQWEsWUFBYSxTQUFRLHNCQUFTO0lBR3pDLFlBQVksS0FBeUI7UUFDbkMsS0FBSyxDQUFDLEVBQUMsR0FBRyxZQUFZLEVBQUUsR0FBRyxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQTBCLENBQUM7SUFDakQsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUF3Qjs7UUFDN0IsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUNwQyxJQUFJLE1BQU0sR0FBVyxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxtQ0FBSSxFQUFFLENBQUM7UUFDL0MsTUFBTSxHQUFHLElBQUEsb0JBQUssRUFBQyxNQUFNLEVBQUUsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sbUNBQUksRUFBRSxDQUFDLENBQUM7UUFFaEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFckQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsSUFBSSxJQUFJLEVBQUMsQ0FBQztZQUN4QyxNQUFNLFNBQVMsR0FBRyxJQUFBLHVCQUFlLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFVLEVBQUcsT0FBTyxDQUFDLENBQUM7WUFDckUsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0Y7QUFyQkQsb0NBcUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBtZXJnZSB9IGZyb20gXCJ0cy1kZWVwbWVyZ2VcIjtcbmltcG9ydCB7IENsdXN0ZXJJbmZvLCBWYWx1ZXMgfSBmcm9tIFwiLi4vLi4vc3BpXCI7XG5pbXBvcnQgeyBjcmVhdGVOYW1lc3BhY2UgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcbmltcG9ydCB7IEhlbG1BZGRPbiwgSGVsbUFkZE9uUHJvcHMsIEhlbG1BZGRPblVzZXJQcm9wcyB9IGZyb20gXCIuLi9oZWxtLWFkZG9uXCI7XG5cbi8qKlxuICogVXNlciBwcm92aWRlZCBvcHRpb25zIGZvciB0aGUgSGVsbSBDaGFydFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEt1YmVSYXlBZGRPblByb3BzIGV4dGVuZHMgSGVsbUFkZE9uVXNlclByb3BzIHtcbiAgICAvKipcbiAgICAgKiBUbyBDcmVhdGUgTmFtZXNwYWNlIHVzaW5nIENES1xuICAgICAqLyAgICBcbiAgICBjcmVhdGVOYW1lc3BhY2U/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIERlZmF1bHQgcHJvcHMgdG8gYmUgdXNlZCB3aGVuIGNyZWF0aW5nIHRoZSBIZWxtIGNoYXJ0XG4gKi9cbmNvbnN0IGRlZmF1bHRQcm9wczogSGVsbUFkZE9uUHJvcHMgJiBLdWJlUmF5QWRkT25Qcm9wcyA9IHtcbiAgbmFtZTogXCJrdWJlcmF5LW9wZXJhdG9yXCIsXG4gIGNoYXJ0OiBcImt1YmVyYXktb3BlcmF0b3JcIixcbiAgbmFtZXNwYWNlOiBcImRlZmF1bHRcIixcbiAgdmVyc2lvbjogXCIxLjEuMVwiLFxuICByZWxlYXNlOiBcImt1YmVyYXktb3BlcmF0b3JcIixcbiAgcmVwb3NpdG9yeTogXCJodHRwczovL3JheS1wcm9qZWN0LmdpdGh1Yi5pby9rdWJlcmF5LWhlbG1cIixcbiAgdmFsdWVzOiB7fSxcbiAgY3JlYXRlTmFtZXNwYWNlOiB0cnVlXG59O1xuXG4vKipcbiAqIE1haW4gY2xhc3MgdG8gaW5zdGFudGlhdGUgdGhlIEhlbG0gY2hhcnRcbiAqL1xuZXhwb3J0IGNsYXNzIEt1YmVSYXlBZGRPbiBleHRlbmRzIEhlbG1BZGRPbiB7XG5cbiAgcmVhZG9ubHkgb3B0aW9uczogS3ViZVJheUFkZE9uUHJvcHM7XG4gIGNvbnN0cnVjdG9yKHByb3BzPzogS3ViZVJheUFkZE9uUHJvcHMpIHtcbiAgICBzdXBlcih7Li4uZGVmYXVsdFByb3BzLCAuLi5wcm9wc30pO1xuICAgIHRoaXMub3B0aW9ucyA9IHRoaXMucHJvcHMgYXMgS3ViZVJheUFkZE9uUHJvcHM7XG4gIH1cblxuICBkZXBsb3koY2x1c3RlckluZm86IENsdXN0ZXJJbmZvKTogUHJvbWlzZTxDb25zdHJ1Y3Q+IHtcbiAgICBjb25zdCBjbHVzdGVyID0gY2x1c3RlckluZm8uY2x1c3RlcjtcbiAgICBsZXQgdmFsdWVzOiBWYWx1ZXMgPSB0aGlzLm9wdGlvbnMudmFsdWVzID8/IHt9O1xuICAgIHZhbHVlcyA9IG1lcmdlKHZhbHVlcywgdGhpcy5wcm9wcy52YWx1ZXMgPz8ge30pO1xuXG4gICAgY29uc3QgY2hhcnQgPSB0aGlzLmFkZEhlbG1DaGFydChjbHVzdGVySW5mbywgdmFsdWVzKTtcblxuICAgIGlmKCB0aGlzLm9wdGlvbnMuY3JlYXRlTmFtZXNwYWNlID09IHRydWUpe1xuICAgICAgY29uc3QgbmFtZXNwYWNlID0gY3JlYXRlTmFtZXNwYWNlKHRoaXMub3B0aW9ucy5uYW1lc3BhY2UhICwgY2x1c3Rlcik7XG4gICAgICBjaGFydC5ub2RlLmFkZERlcGVuZGVuY3kobmFtZXNwYWNlKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjaGFydCk7XG4gIH1cbn1cbiJdfQ==