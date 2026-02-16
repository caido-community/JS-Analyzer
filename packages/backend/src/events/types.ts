export type InternalEventMap = {
  "scan-started": { scanId: string; totalFiles: number };
  "scan-file-complete": {
    scanId: string;
    scannedFiles: number;
    totalFiles: number;
    currentFile: string;
  };
  "scan-finished": { scanId: string; totalMatches: number; totalFiles: number };
  "scan-error": { scanId: string; error: string };
  "asset-detected": { url: string; host: string; contentType: string };
};

export type InternalEventName = keyof InternalEventMap;
