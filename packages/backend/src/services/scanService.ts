import type {
  AnalyzerKind,
  AnalyzerMatch,
  ScanResult,
  ScanResultEntry,
} from "shared";

import {
  runPassiveScanOnFiles,
  type ScanFileInput,
} from "../analyzers/runPassiveScan";
import { ScanError } from "../errors";
import { emit } from "../events";
import { getSDK } from "../sdk";
import { getConfigStore, getScanResultsStore } from "../stores";

import { verifyPackagesOnNpm } from "./npmVerifier";
import { mapBeautifiedOffsetsToRaw } from "./offsetMapper";

type AbortSignal = { aborted: boolean };

const activeScans = new Map<string, AbortSignal>();

function generateScanId(): string {
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractPathname(url: string): string {
  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");
  const end =
    queryIndex !== -1 ? queryIndex : hashIndex !== -1 ? hashIndex : url.length;
  return url.slice(0, end);
}

function isJsOrJsonUrl(url: string): boolean {
  const path = extractPathname(url);
  const lower = path.toLowerCase();
  return lower.endsWith(".js") || lower.endsWith(".json");
}

function getUrlDedupeKey(url: string): string {
  const path = extractPathname(url);
  const match = path.match(/^(?:https?:\/\/)?([^/?#]+)(\/[^?#]*)?/);
  if (match !== null) {
    const host = match[1] ?? "";
    const pathPart = match[2] ?? "/";
    return `${host}${pathPart}`;
  }
  return path;
}

export async function startPassiveScan(
  requestIds: string[],
  analyzers: AnalyzerKind[],
): Promise<ScanResult> {
  const sdk = getSDK();
  const scanId = generateScanId();
  const abortSignal: AbortSignal = { aborted: false };
  activeScans.set(scanId, abortSignal);

  const scanResult: ScanResult = {
    id: scanId,
    status: "Scanning",
    startedAt: new Date().toISOString(),
    completedAt: undefined,
    totalFiles: requestIds.length,
    totalMatches: 0,
    entries: [],
    analyzers,
  };

  const files: ScanFileInput[] = [];
  const rawContents = new Map<string, string>();
  const seenUrls = new Set<string>();

  for (const requestId of requestIds) {
    if (abortSignal.aborted) break;

    const reqRes = await sdk.requests.get(requestId);
    if (reqRes === undefined) continue;

    const { request, response } = reqRes;
    if (response === undefined) continue;

    const url = request.getUrl();
    if (!isJsOrJsonUrl(url)) continue;

    const dedupeKey = getUrlDedupeKey(url);
    if (seenUrls.has(dedupeKey)) continue;
    seenUrls.add(dedupeKey);

    const body = response.getBody();
    if (body === undefined) continue;

    const content = body.toText();
    if (content.length === 0) continue;

    rawContents.set(requestId, content);

    files.push({
      requestId,
      url,
      content,
    });
  }

  emit("scan-started", { scanId, totalFiles: files.length });

  let entries: ScanResultEntry[];

  try {
    entries = runPassiveScanOnFiles(files, {
      analyzers,
      enableBeautify: true,
      abortSignal,
      onProgress: (progress) => {
        emit("scan-file-complete", {
          scanId,
          scannedFiles: progress.scannedFiles,
          totalFiles: progress.totalFiles,
          currentFile: progress.currentFile,
        });

        sdk.api.send("scan-progress", {
          scannedFiles: progress.scannedFiles,
          totalFiles: progress.totalFiles,
          currentFile: progress.currentFile,
        });
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    activeScans.delete(scanId);

    emit("scan-error", { scanId, error: message });

    scanResult.status = "Error";
    scanResult.completedAt = new Date().toISOString();
    persistScanResult(scanResult);

    throw new ScanError(message);
  }

  entries = entries.map((entry) => {
    const rawContent = rawContents.get(entry.requestId);
    if (rawContent === undefined) return entry;
    return {
      ...entry,
      responseBody: rawContent,
      matches: mapBeautifiedOffsetsToRaw(rawContent, entry.matches),
    };
  });

  if (analyzers.includes("dependencyConfusion") && !abortSignal.aborted) {
    entries = await enrichDependencyConfusion(entries);
  }

  const totalMatches = entries.reduce(
    (sum, entry) => sum + entry.matches.length,
    0,
  );

  scanResult.status = abortSignal.aborted ? "Error" : "Complete";
  scanResult.completedAt = new Date().toISOString();
  scanResult.totalMatches = totalMatches;
  scanResult.entries = entries;
  scanResult.totalFiles = files.length;

  persistScanResult(scanResult);
  activeScans.delete(scanId);

  emit("scan-finished", {
    scanId,
    totalMatches,
    totalFiles: files.length,
  });

  sdk.api.send("scan-complete", {
    totalMatches,
    totalFiles: files.length,
  });

  return scanResult;
}

export function cancelScan(scanId: string): boolean {
  const signal = activeScans.get(scanId);
  if (signal === undefined) return false;
  signal.aborted = true;
  activeScans.delete(scanId);
  return true;
}

export function getActiveScanIds(): string[] {
  return Array.from(activeScans.keys());
}

async function enrichDependencyConfusion(
  entries: ScanResultEntry[],
): Promise<ScanResultEntry[]> {
  const config = getConfigStore().get();
  if (!config.allowNetworkRequests) return entries;

  const depMatches: AnalyzerMatch[] = [];
  for (const entry of entries) {
    for (const match of entry.matches) {
      if (match.analyzerKind === "dependencyConfusion") {
        depMatches.push(match);
      }
    }
  }

  if (depMatches.length === 0) return entries;

  const packageNames = [
    ...new Set(depMatches.map((m) => extractPackageName(m.value))),
  ];

  let verificationResults;
  try {
    verificationResults = await verifyPackagesOnNpm(packageNames);
  } catch {
    return entries;
  }

  const npmStatus = new Map(verificationResults.map((r) => [r.packageName, r]));

  return entries.map((entry) => ({
    ...entry,
    matches: entry.matches.map((match) => {
      if (match.analyzerKind !== "dependencyConfusion") return match;

      const pkgName = extractPackageName(match.value);
      const status = npmStatus.get(pkgName);
      if (status === undefined) return match;

      if (!status.exists) {
        const prefix =
          status.isOrgClaimed === false
            ? "[CRITICAL: Package AND org not found on NPM]"
            : "[CRITICAL: Package not found on NPM]";
        return {
          ...match,
          value: `${prefix} ${pkgName}`,
          confidence: "high" as const,
        };
      }

      return {
        ...match,
        value: `[Verified on NPM] ${pkgName}`,
      };
    }),
  }));
}

function extractPackageName(value: string): string {
  const bracketEnd = value.indexOf("] ");
  if (bracketEnd !== -1) {
    return value.slice(bracketEnd + 2);
  }
  return value;
}

function stripResponseBodies(result: ScanResult): ScanResult {
  return {
    ...result,
    entries: result.entries.map(({ responseBody: _, ...entry }) => entry),
  };
}

function persistScanResult(result: ScanResult): void {
  const store = getScanResultsStore();
  const stripped = stripResponseBodies(result);
  store.update((current) => {
    const existing = current.findIndex((r) => r.id === result.id);
    if (existing !== -1) {
      const updated = [...current];
      updated[existing] = stripped;
      return updated;
    }
    return [...current, stripped];
  });
}
