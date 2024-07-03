import * as eks from 'aws-cdk-lib/aws-eks';
import { KubernetesManifest } from 'aws-cdk-lib/aws-eks';
/**
 * Applies all manifests from a directory. Note: The manifests are not checked,
 * so user must ensure the manifests have the correct namespaces.
 * @param dir
 * @param cluster
 * @param namespaceManifest
 */
export declare function applyYamlFromDir(dir: string, cluster: eks.ICluster, namespaceManifest: KubernetesManifest): void;
/**
 * Reads the YAML document from a local path.
 * @param path YAML document path
 * @returns YAML document string
 */
export declare function readYamlDocument(path: string): string;
/**
 * Reads the YAML document from a local path and parses them as
 * multiple YAML documents separated by `---` as expected in a Kubernetes manifest file
 * @param path YAML document path
 * @returns a list of parsed YAML documents
 */
export declare function loadMultiResourceYaml(path: string): any;
/**
 * Parses the sting document into a single YAML document
 * @param document document
 * @returns yaml document
 */
export declare function loadYaml(document: string): any;
/**
 * Reads the YAML document from a URL and parses
 * multiple YAML documents separated by `---` as expected in a Kubernetes manifest file Note: The file from the URL is
 * not validated, so user must ensure the URL contains a valid manifest.
 * @param url YAML document URL
 * @returns a list of parsed YAML documents
 */
export declare function loadExternalYaml(url: string): any;
/**
 * Serializes object as a YAML document
 * @param document document
 * @returns yaml document
 */
export declare function serializeYaml(document: any): string;
