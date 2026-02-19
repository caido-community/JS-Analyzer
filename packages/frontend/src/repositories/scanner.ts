import type {
  AnalyzerKind,
  JsAnalyzerFilter,
  Result,
  ScanResult,
  StaticAssetEntry,
} from "shared";

import { useSDK } from "@/plugins/sdk";

export function useScannerRepository() {
  const sdk = useSDK();

  async function getStaticAssets(
    filter: JsAnalyzerFilter,
  ): Promise<Result<StaticAssetEntry[]>> {
    return await sdk.backend.getStaticAssets(filter);
  }

  async function runPassiveScan(
    requestIds: string[],
    analyzers: AnalyzerKind[],
  ): Promise<Result<ScanResult>> {
    return await sdk.backend.runPassiveScan(requestIds, analyzers);
  }

  async function getScanResults(): Promise<Result<ScanResult[]>> {
    return await sdk.backend.getScanResults();
  }

  async function cancelScan(scanId: string): Promise<Result<boolean>> {
    return await sdk.backend.cancelScan(scanId);
  }

  async function getResponseBody(
    requestId: string,
  ): Promise<Result<{ body: string }>> {
    return await sdk.backend.getResponseBody(requestId);
  }

  return {
    getStaticAssets,
    runPassiveScan,
    getScanResults,
    cancelScan,
    getResponseBody,
  };
}
