import type { AnalyzerKind, Result, ScanResult } from "shared";

import type { FrontendSDK } from "@/types";

export async function runPassiveScan(
  sdk: FrontendSDK,
  requestIds: string[],
  analyzers: AnalyzerKind[],
): Promise<Result<ScanResult>> {
  return sdk.backend.runPassiveScan(requestIds, analyzers);
}
