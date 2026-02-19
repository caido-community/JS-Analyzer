import type { AnalyzerKind, AnalyzerMatch } from "shared";

import { analyzeApiEndpoints } from "./apiEndpoints";
import { analyzeCloudUrls } from "./cloudUrls";
import { analyzeDependencyConfusion } from "./dependencyConfusion";
import { analyzeInlineSourceMap } from "./inlineSourceMap";
import { analyzeSecrets } from "./secrets";
import { analyzeSubdomains } from "./subdomains";
import type { AnalyzerRegistry } from "./types";

export { analyzeApiEndpoints } from "./apiEndpoints";
export { analyzeCloudUrls } from "./cloudUrls";
export { analyzeDependencyConfusion } from "./dependencyConfusion";
export { analyzeInlineSourceMap } from "./inlineSourceMap";
export { analyzeSecrets } from "./secrets";
export { analyzeSubdomains } from "./subdomains";
export type { AnalyzerFn, AnalyzerMeta, AnalyzerRegistry } from "./types";

const ANALYZER_MAP: AnalyzerRegistry = {
  secrets: analyzeSecrets,
  subdomains: analyzeSubdomains,
  cloudUrls: analyzeCloudUrls,
  apiEndpoints: analyzeApiEndpoints,
  dependencyConfusion: analyzeDependencyConfusion,
  inlineSourceMap: analyzeInlineSourceMap,
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
