import { ALL_ANALYZER_KINDS } from "shared";
import { z } from "zod";

const ANALYZER_KINDS_TUPLE = ALL_ANALYZER_KINDS as unknown as [
  string,
  ...string[],
];

export const jsAnalyzerFilterSchema = z.object({
  inScopeOnly: z.boolean(),
  httpqlFilter: z.string().optional(),
});

export const configUpdateSchema = z.object({
  enabledAnalyzers: z.array(z.enum(ANALYZER_KINDS_TUPLE)).optional(),
  autoScanEnabled: z.boolean().optional(),
  inScopeOnly: z.boolean().optional(),
  allowNetworkRequests: z.boolean().optional(),
});

export const scanRequestSchema = z.object({
  requestIds: z.array(z.string()).min(1),
  analyzers: z.array(z.enum(ANALYZER_KINDS_TUPLE)).min(1),
});

export const scanContentSchema = z.object({
  content: z.string().min(1),
  url: z.string(),
  analyzers: z.array(z.enum(ANALYZER_KINDS_TUPLE)).min(1),
  requestId: z.string().optional(),
});
