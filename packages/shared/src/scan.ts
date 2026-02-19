export type AnalyzerKind =
  | "secrets"
  | "subdomains"
  | "cloudUrls"
  | "apiEndpoints"
  | "dependencyConfusion"
  | "inlineSourceMap";

export const ALL_ANALYZER_KINDS: AnalyzerKind[] = [
  "secrets",
  "subdomains",
  "cloudUrls",
  "apiEndpoints",
  "dependencyConfusion",
  "inlineSourceMap",
];

export type ScanStatus = "Idle" | "Scanning" | "Complete" | "Error";

export type AnalyzerMatch = {
  analyzerKind: AnalyzerKind;
  value: string;
  startOffset: number;
  endOffset: number;
  rawStartOffset: number | undefined;
  rawEndOffset: number | undefined;
  confidence: "low" | "medium" | "high";
  context: string;
};

export type NpmVerificationResult = {
  packageName: string;
  exists: boolean;
  isOrgClaimed: boolean | undefined;
};

export type ScanResultEntry = {
  requestId: string;
  url: string;
  matches: AnalyzerMatch[];
  responseBody?: string;
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
