import type { AnalyzerKind } from "./scan";

export type UserConfig = {
  enabledAnalyzers: AnalyzerKind[];
  autoScanEnabled: boolean;
  inScopeOnly: boolean;
};
