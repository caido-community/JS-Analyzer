import type { AnalyzerKind, AnalyzerMatch } from "shared";

import { analyzeApiEndpoints } from "./apiEndpoints";
import { analyzeCallPatterns } from "./callPatterns";
import { analyzeChunkDiscovery } from "./chunkDiscovery";
import { analyzeCloudUrls } from "./cloudUrls";
import { analyzeDependencyConfusion } from "./dependencyConfusion";
import { analyzeFrameworkPatterns } from "./frameworkPatterns";
import { analyzeInlineSourceMap } from "./inlineSourceMap";
import { analyzeSecrets } from "./secrets";
import { analyzeSecuritySinks } from "./securitySinks";
import { analyzeSensitiveData } from "./sensitiveData";
import { analyzeStringExpressions } from "./stringExpressions";
import { analyzeSubdomains } from "./subdomains";
import type { AnalyzerRegistry } from "./types";

export { analyzeApiEndpoints } from "./apiEndpoints";
export { analyzeCallPatterns } from "./callPatterns";
export { analyzeChunkDiscovery } from "./chunkDiscovery";
export { analyzeCloudUrls } from "./cloudUrls";
export { analyzeDependencyConfusion } from "./dependencyConfusion";
export { analyzeFrameworkPatterns } from "./frameworkPatterns";
export { analyzeInlineSourceMap } from "./inlineSourceMap";
export { analyzeSecrets } from "./secrets";
export { analyzeSecuritySinks } from "./securitySinks";
export { analyzeSensitiveData } from "./sensitiveData";
export { analyzeStringExpressions } from "./stringExpressions";
export { analyzeSubdomains } from "./subdomains";
export type { AnalyzerFn, AnalyzerMeta, AnalyzerRegistry } from "./types";

const ANALYZER_MAP: AnalyzerRegistry = {
  secrets: analyzeSecrets,
  subdomains: analyzeSubdomains,
  cloudUrls: analyzeCloudUrls,
  apiEndpoints: analyzeApiEndpoints,
  dependencyConfusion: analyzeDependencyConfusion,
  inlineSourceMap: analyzeInlineSourceMap,
  securitySinks: analyzeSecuritySinks,
  sensitiveData: analyzeSensitiveData,
  callPatterns: analyzeCallPatterns,
  stringExpressions: analyzeStringExpressions,
  frameworkPatterns: analyzeFrameworkPatterns,
  chunkDiscovery: analyzeChunkDiscovery,
};

export function runAnalyzers(
  content: string,
  kinds: AnalyzerKind[],
  url?: string,
): AnalyzerMatch[] {
  const results: AnalyzerMatch[] = [];

  for (const kind of kinds) {
    const analyzer = ANALYZER_MAP[kind];
    const matches = analyzer(content, url);
    results.push(...matches);
  }

  return results;
}
