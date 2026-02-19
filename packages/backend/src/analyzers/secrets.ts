import type { AnalyzerMatch } from "shared";

import { SECRET_PATTERNS } from "./patterns/secretPatterns";

const ENTROPY_THRESHOLD = 3.5;
const MIN_SECRET_LENGTH = 8;
const MAX_CONTEXT_LENGTH = 80;

function shannonEntropy(str: string): number {
  const freq = new Map<string, number>();
  for (const ch of str) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  let entropy = 0;
  const len = str.length;
  for (const count of freq.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

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

function isLikelyFalsePositive(value: string): boolean {
  if (/^[0-9]+$/.test(value)) return true;
  if (/^(.)\1+$/.test(value)) return true;
  if (/^[a-z]+$/i.test(value) && value.length < 20) return true;
  if (/^(test|example|sample|placeholder|dummy|xxx|todo)/i.test(value)) {
    return true;
  }
  return false;
}

export function analyzeSecrets(content: string): AnalyzerMatch[] {
  const matches: AnalyzerMatch[] = [];
  const seen = new Set<string>();

  for (const pattern of SECRET_PATTERNS) {
    pattern.regex.lastIndex = 0;
    let match = pattern.regex.exec(content);
    while (match !== null) {
      const fullMatch = match[0];
      const capturedValue = match[1] ?? fullMatch;
      const startOffset = match.index;
      const endOffset = startOffset + fullMatch.length;
      const dedupeKey = `${pattern.name}:${capturedValue}:${startOffset}`;

      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);

        if (
          capturedValue.length >= MIN_SECRET_LENGTH &&
          !isLikelyFalsePositive(capturedValue)
        ) {
          matches.push({
            analyzerKind: "secrets",
            value: `[${pattern.name}] ${capturedValue}`,
            startOffset,
            endOffset,
            rawStartOffset: undefined,
            rawEndOffset: undefined,
            confidence: pattern.confidence,
            context: extractContext(content, startOffset, endOffset),
          });
        }
      }

      match = pattern.regex.exec(content);
    }
  }

  const highEntropyRegex = /["'`]([A-Za-z0-9+/=_-]{20,})["'`]/g;
  let entropyMatch = highEntropyRegex.exec(content);
  while (entropyMatch !== null) {
    const value = entropyMatch[1]!;
    const startOffset = entropyMatch.index;
    const endOffset = startOffset + entropyMatch[0].length;
    const dedupeKey = `entropy:${value}:${startOffset}`;

    if (!seen.has(dedupeKey) && !isLikelyFalsePositive(value)) {
      const entropy = shannonEntropy(value);
      if (entropy >= ENTROPY_THRESHOLD) {
        seen.add(dedupeKey);
        matches.push({
          analyzerKind: "secrets",
          value: `[High Entropy String] ${value}`,
          startOffset,
          endOffset,
          rawStartOffset: undefined,
          rawEndOffset: undefined,
          confidence: entropy >= 4.5 ? "medium" : "low",
          context: extractContext(content, startOffset, endOffset),
        });
      }
    }

    entropyMatch = highEntropyRegex.exec(content);
  }

  return matches;
}
