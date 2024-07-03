import { HelmChartConfiguration } from "./kubectl-provider";
export type HelmChartVersion = Omit<HelmChartConfiguration, "name" | "namespace" | "release" | "values">;
/**
 * Semver comparator, simplistic implementation. Might require additional
 * logic for correct semver comparison.
 *
 * @param a
 * @param b
 * @returns
 */
export declare const semverComparator: (a: string, b: string) => number;
/**
 * Represent result of helm chart version validation against newer versions
 */
export interface CheckVersionResult {
    /**
     * Contains the highest version of the helm chart discovered in the helm chart repository.
     */
    highestVersion: string | undefined;
    /**
     * True if the provided version is the latest version in the helm chart repository. Otherwise, false.
     */
    latestVersion: boolean;
    /**
     * All discovered versions of the chart, discovered in the provided helm chart repository.
     */
    allVersions: string[];
}
/**
 * Lists chart versions for a given helm chart.
 * @param chart
 * @returns
 */
export declare function listChartVersions(chart: HelmChartVersion): string[];
/**
 * Checks the provided helm chart version against the repository.
 * Validation is successful if there is no higher version registered in the repository.
 * @param chart
 * @returns
 */
export declare function checkHelmChartVersion(chart: HelmChartVersion): CheckVersionResult;
