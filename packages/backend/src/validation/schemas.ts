import { z } from "zod";

const ANALYZER_KINDS = [
  "secrets",
  "subdomains",
  "cloudUrls",
  "apiEndpoints",
  "dependencyConfusion",
  "inlineSourceMap",
] as const;

export const jsAnalyzerFilterSchema = z.object({
  inScopeOnly: z.boolean(),
  httpqlFilter: z.string().optional(),
});

export const configUpdateSchema = z.object({
  enabledAnalyzers: z.array(z.enum(ANALYZER_KINDS)).optional(),
  autoScanEnabled: z.boolean().optional(),
  inScopeOnly: z.boolean().optional(),
});
