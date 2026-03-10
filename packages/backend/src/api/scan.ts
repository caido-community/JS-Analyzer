import type { SDK } from "caido:plugin";
import type { AnalyzerKind, Result, ScanResult } from "shared";

import { scanSingleFile } from "../analyzers/runPassiveScan";
import type { API, BackendEvents } from "../index";
import {
  cancelScan as cancelScanService,
  startPassiveScan,
} from "../services/scanService";
import { getScanResultsStore } from "../stores";
import { scanContentSchema, scanRequestSchema } from "../validation/schemas";

export async function runPassiveScan(
  _sdk: SDK<API, BackendEvents>,
  requestIds: string[],
  analyzers: AnalyzerKind[],
): Promise<Result<ScanResult>> {
  const parsed = scanRequestSchema.safeParse({ requestIds, analyzers });
  if (!parsed.success) {
    return { kind: "Error", error: parsed.error.message };
  }

  try {
    const result = await startPassiveScan(
      parsed.data.requestIds,
      parsed.data.analyzers as AnalyzerKind[],
    );
    return { kind: "Ok", value: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { kind: "Error", error: `Scan failed: ${message}` };
  }
}

export function runPassiveScanOnContent(
  _sdk: SDK<API, BackendEvents>,
  content: string,
  url: string,
  analyzers: AnalyzerKind[],
  requestId?: string,
): Result<ScanResult> {
  const parsed = scanContentSchema.safeParse({
    content,
    url,
    analyzers,
    requestId,
  });
  if (!parsed.success) {
    return { kind: "Error", error: parsed.error.message };
  }

  const effectiveRequestId =
    parsed.data.requestId !== undefined && parsed.data.requestId.length > 0
      ? parsed.data.requestId
      : "inline";

  const matches = scanSingleFile(
    {
      requestId: effectiveRequestId,
      url: parsed.data.url,
      content: parsed.data.content,
    },
    parsed.data.analyzers as AnalyzerKind[],
    true,
  );

  const scanResult: ScanResult = {
    id: `inline-${Date.now()}`,
    status: "Complete",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    totalFiles: 1,
    totalMatches: matches.length,
    entries:
      matches.length > 0
        ? [
            {
              requestId: effectiveRequestId,
              url: parsed.data.url,
              matches,
              responseBody: parsed.data.content,
            },
          ]
        : [],
    analyzers: parsed.data.analyzers as AnalyzerKind[],
  };

  return { kind: "Ok", value: scanResult };
}

export function getScanResults(
  _sdk: SDK<API, BackendEvents>,
): Result<ScanResult[]> {
  const results = getScanResultsStore().get();
  return { kind: "Ok", value: results };
}

export function cancelScan(
  _sdk: SDK<API, BackendEvents>,
  scanId: string,
): Result<boolean> {
  if (scanId.length === 0) {
    return { kind: "Error", error: "scanId is required" };
  }
  const cancelled = cancelScanService(scanId);
  return { kind: "Ok", value: cancelled };
}
