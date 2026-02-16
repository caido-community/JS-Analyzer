import type { AnalyzerKind, UserConfig } from "shared";

import { GlobalStore } from "./projectStore";

const DEFAULT_USER_CONFIG: UserConfig = {
  enabledAnalyzers: [
    "secrets",
    "subdomains",
    "cloudUrls",
    "apiEndpoints",
    "dependencyConfusion",
    "inlineSourceMap",
  ] satisfies AnalyzerKind[],
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
