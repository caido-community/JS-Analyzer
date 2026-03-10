import type { AnalyzerKind, AnalyzerMatch, ScanResultEntry } from "shared";

import { beautifyJs, isMinified } from "../services/beautifyService";

import { runAnalyzers } from ".";

export type ScanProgress = {
  scannedFiles: number;
  totalFiles: number;
  currentFile: string;
};

export type ScanFileInput = {
  requestId: string;
  url: string;
  content: string;
};

export type PassiveScanOptions = {
  analyzers: AnalyzerKind[];
  enableBeautify?: boolean;
  onProgress?: (progress: ScanProgress) => void;
  abortSignal?: { aborted: boolean };
};

export function scanSingleFile(
  file: ScanFileInput,
  analyzers: AnalyzerKind[],
  enableBeautify: boolean,
): AnalyzerMatch[] {
  let content = file.content;

  if (enableBeautify && isMinified(content)) {
    content = beautifyJs(content);
  }

  return runAnalyzers(content, analyzers, file.url);
}

export function runPassiveScanOnFiles(
  files: ScanFileInput[],
  options: PassiveScanOptions,
): ScanResultEntry[] {
  const entries: ScanResultEntry[] = [];
  const enableBeautify = options.enableBeautify !== false;
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    if (options.abortSignal?.aborted === true) {
      break;
    }

    const file = files[i]!;

    options.onProgress?.({
      scannedFiles: i + 1,
      totalFiles,
      currentFile: file.url,
    });

    const matches = scanSingleFile(file, options.analyzers, enableBeautify);

    if (matches.length > 0) {
      entries.push({
        requestId: file.requestId,
        url: file.url,
        matches,
      });
    }
  }

  return entries;
}
