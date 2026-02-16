import type { DefineAPI, DefineEvents, SDK } from "caido:plugin";
import type {
  AssetDetectedEvent,
  Result,
  ScanCompleteEvent,
  ScanProgressEvent,
} from "shared";

import { getConfig, updateConfig } from "./api/config";
import { cancelScan, getScanResults, runPassiveScan } from "./api/scan";
import { getStaticAssets } from "./api/staticAssets";
import { setSDK } from "./sdk";
import { registerAutoScan } from "./services/autoScanService";
import { getScanResultsStore } from "./stores";

export type BackendEvents = DefineEvents<{
  "scan-progress": (data: ScanProgressEvent) => void;
  "scan-complete": (data: ScanCompleteEvent) => void;
  "asset-detected": (data: AssetDetectedEvent) => void;
}>;

function ping(): Result<{ ok: true }> {
  return { kind: "Ok", value: { ok: true } };
}

export type API = DefineAPI<{
  ping: typeof ping;
  getStaticAssets: typeof getStaticAssets;
  getConfig: typeof getConfig;
  updateConfig: typeof updateConfig;
  runPassiveScan: typeof runPassiveScan;
  getScanResults: typeof getScanResults;
  cancelScan: typeof cancelScan;
}>;

export function init(sdk: SDK<API, BackendEvents>) {
  setSDK(sdk);

  sdk.api.register("ping", ping);
  sdk.api.register("getStaticAssets", getStaticAssets);
  sdk.api.register("getConfig", getConfig);
  sdk.api.register("updateConfig", updateConfig);
  sdk.api.register("runPassiveScan", runPassiveScan);
  sdk.api.register("getScanResults", getScanResults);
  sdk.api.register("cancelScan", cancelScan);

  registerAutoScan(sdk);

  const scanResultsStore = getScanResultsStore();
  scanResultsStore.initialize().catch((err) => {
    sdk.console.error(`Failed to initialize scan results store: ${err}`);
  });

  sdk.events.onProjectChange((_eventSdk, project) => {
    const projectId = project !== null ? project.getId() : undefined;
    scanResultsStore.switchProject(projectId as string | undefined);
  });
}
