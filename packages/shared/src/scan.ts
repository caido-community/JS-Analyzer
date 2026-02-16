export type AnalyzerKind =
  | "secrets"
  | "subdomains"
  | "cloudUrls"
  | "apiEndpoints"
  | "dependencyConfusion"
  | "inlineSourceMap";

export type ScanStatus = "Idle" | "Scanning" | "Complete" | "Error";

export type AnalyzerMatch = {
  analyzerKind: AnalyzerKind;
  value: string;
  startOffset: number;
  endOffset: number;
  confidence: "low" | "medium" | "high";
  context: string;
};

export type ScanResultEntry = {
  requestId: string;
  url: string;
  matches: AnalyzerMatch[];
};

export type ScanResult = {
  id: string;
  status: ScanStatus;
  startedAt: string;
  completedAt: string | undefined;
  totalFiles: number;
  totalMatches: number;
  entries: ScanResultEntry[];
  analyzers: AnalyzerKind[];
};
