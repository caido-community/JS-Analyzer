import { ALL_ANALYZER_KINDS } from "shared";
import type { AnalyzerKind, UserConfig } from "shared";

import { GlobalStore } from "./projectStore";

const DEFAULT_USER_CONFIG: UserConfig = {
  enabledAnalyzers: [...ALL_ANALYZER_KINDS] as AnalyzerKind[],
  autoScanEnabled: false,
  inScopeOnly: false,
  allowNetworkRequests: false,
};

let store: GlobalStore<UserConfig> | undefined;

export function getConfigStore(): GlobalStore<UserConfig> {
  if (store === undefined) {
    store = new GlobalStore("config.json", DEFAULT_USER_CONFIG);
  }
  return store;
}
