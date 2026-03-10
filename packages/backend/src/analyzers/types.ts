import type { AnalyzerKind, AnalyzerMatch } from "shared";

export type AnalyzerMeta = {
  contentType?: string;
};

export type AnalyzerFn = (
  content: string,
  url?: string,
  meta?: AnalyzerMeta,
) => AnalyzerMatch[];

export type AnalyzerRegistry = Record<AnalyzerKind, AnalyzerFn>;
