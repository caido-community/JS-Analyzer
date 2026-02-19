import type { AnalyzerMatch } from "shared";

import { CLOUD_PATTERNS } from "./patterns/cloudPatterns";

const MAX_CONTEXT_LENGTH = 80;

function extractContext(content: string, start: number, end: number): string {
  const lineStart = content.lastIndexOf("\n", start) + 1;
  const lineEnd = content.indexOf("\n", end);
  const line = content.slice(
    lineStart,
    lineEnd === -1 ? content.length : lineEnd,
  );
  if (line.length > MAX_CONTEXT_LENGTH) {
    return `${line.slice(0, MAX_CONTEXT_LENGTH)}...`;
  }
  return line;
}

export function analyzeCloudUrls(content: string): AnalyzerMatch[] {
  const matches: AnalyzerMatch[] = [];
  const seen = new Set<string>();

  for (const pattern of CLOUD_PATTERNS) {
    pattern.regex.lastIndex = 0;
    let match = pattern.regex.exec(content);
    while (match !== null) {
      const value = match[0];
      const startOffset = match.index;
      const endOffset = startOffset + value.length;
      const dedupeKey = `${value.toLowerCase()}`;

      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        matches.push({
          analyzerKind: "cloudUrls",
          value: `[${pattern.provider}] ${value}`,
          startOffset,
          endOffset,
          rawStartOffset: undefined,
          rawEndOffset: undefined,
          confidence: "high",
          context: extractContext(content, startOffset, endOffset),
        });
      }

      match = pattern.regex.exec(content);
    }
  }

  return matches;
}
