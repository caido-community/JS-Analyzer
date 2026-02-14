export type ScanProgressEvent = {
  scannedFiles: number;
  totalFiles: number;
  currentFile: string;
};

export type ScanCompleteEvent = {
  totalMatches: number;
  totalFiles: number;
};

export type AssetDetectedEvent = {
  url: string;
  host: string;
  contentType: string;
};

export type BackendEventPayloads = {
  "scan-progress": ScanProgressEvent;
  "scan-complete": ScanCompleteEvent;
  "asset-detected": AssetDetectedEvent;
};
