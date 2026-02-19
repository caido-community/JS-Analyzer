import type { ScanResult } from "shared";

import { ProjectScopedStore } from "./projectStore";

let store: ProjectScopedStore<ScanResult[]> | undefined;

export function getScanResultsStore(): ProjectScopedStore<ScanResult[]> {
  if (store === undefined) {
    store = new ProjectScopedStore("scan-results.json", []);
  }
  return store;
}
