import type { AnalyzerMatch } from "shared";

import { SECURITY_SINK_PATTERNS } from "./patterns/securitySinkPatterns";

const MAX_CONTEXT_LENGTH = 100;

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

export function analyzeSecuritySinks(content: string): AnalyzerMatch[] {
  const matches: AnalyzerMatch[] = [];
  const seen = new Set<string>();

  for (const pattern of SECURITY_SINK_PATTERNS) {
    pattern.regex.lastIndex = 0;
    let match = pattern.regex.exec(content);
    while (match !== null) {
      const fullMatch = match[0];
      const startOffset = match.index;
      const endOffset = startOffset + fullMatch.length;
      const dedupeKey = `${pattern.name}:${startOffset}`;

      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        matches.push({
          analyzerKind: "securitySinks",
          value: `[${pattern.category}] ${pattern.name}: ${fullMatch.trim()}`,
          startOffset,
          endOffset,
          rawStartOffset: undefined,
          rawEndOffset: undefined,
          confidence: pattern.confidence,
          context: extractContext(content, startOffset, endOffset),
        });
      }

      match = pattern.regex.exec(content);
    }
  }

  return matches;
}
