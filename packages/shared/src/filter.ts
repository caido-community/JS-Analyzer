export type JsAnalyzerFilter = {
  inScopeOnly: boolean;
  httpqlFilter: string | undefined;
};

export type StaticAssetEntry = {
  requestId: string;
  responseId: string | undefined;
  url: string;
  host: string;
  path: string;
  contentType: string;
  size: number;
};
