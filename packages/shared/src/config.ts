import type { AnalyzerKind } from "./scan";

export type UserConfig = {
  enabledAnalyzers: AnalyzerKind[];
  autoScanEnabled: boolean;
  inScopeOnly: boolean;
  allowNetworkRequests: boolean;
  autoLoadEnabled: boolean;
  autoLoadIntervalSeconds: number;
};
