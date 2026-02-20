import type { AnalyzerMatch } from "shared";

type CallPattern = {
  name: string;
  regex: RegExp;
  category: "http" | "storage" | "communication" | "dom";
  confidence: "low" | "medium" | "high";
};

const CALL_PATTERNS: CallPattern[] = [
  {
    name: "fetch()",
    regex: /\bfetch\s*\(\s*["'`]([^"'`]+)["'`]/g,
    category: "http",
    confidence: "high",
  },
  {
    name: "XMLHttpRequest.open()",
    regex:
      /\.open\s*\(\s*["'](?:GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)["']\s*,\s*["'`]([^"'`]+)["'`]/gi,
    category: "http",
    confidence: "high",
  },
  {
    name: "$.ajax()",
    regex: /\$\.ajax\s*\(\s*\{/g,
    category: "http",
    confidence: "high",
  },
  {
    name: "$.get()",
    regex: /\$\.get\s*\(\s*["'`]([^"'`]+)["'`]/g,
    category: "http",
    confidence: "high",
  },
  {
    name: "$.post()",
    regex: /\$\.post\s*\(\s*["'`]([^"'`]+)["'`]/g,
    category: "http",
    confidence: "high",
  },

  {
    name: "localStorage.setItem()",
    regex: /localStorage\.setItem\s*\(\s*["'`]([^"'`]+)["'`]/g,
    category: "storage",
    confidence: "medium",
  },
  {
    name: "localStorage.getItem()",
    regex: /localStorage\.getItem\s*\(\s*["'`]([^"'`]+)["'`]/g,
    category: "storage",
    confidence: "medium",
  },
  {
    name: "sessionStorage.setItem()",
    regex: /sessionStorage\.setItem\s*\(\s*["'`]([^"'`]+)["'`]/g,
    category: "storage",
    confidence: "medium",
  },
  {
    name: "sessionStorage.getItem()",
    regex: /sessionStorage\.getItem\s*\(\s*["'`]([^"'`]+)["'`]/g,
    category: "storage",
    confidence: "medium",
  },
  {
    name: "document.cookie",
    regex: /document\.cookie\b/g,
    category: "storage",
    confidence: "medium",
  },

  {
    name: "postMessage()",
    regex: /\.postMessage\s*\(/g,
    category: "communication",
    confidence: "high",
  },
  {
    name: "message event listener",
    regex: /addEventListener\s*\(\s*["']message["']/g,
    category: "communication",
    confidence: "high",
  },
  {
    name: "new WebSocket()",
    regex: /new\s+WebSocket\s*\(\s*["'`]([^"'`]+)["'`]/g,
    category: "communication",
    confidence: "high",
  },
  {
    name: "Socket.io connect",
    regex:
      /io\s*\(\s*["'`]([^"'`]+)["'`]\s*\)|io\.connect\s*\(\s*["'`]([^"'`]+)["'`]/g,
    category: "communication",
    confidence: "high",
  },
  {
    name: "EventSource (SSE)",
    regex: /new\s+EventSource\s*\(\s*["'`]([^"'`]+)["'`]/g,
    category: "communication",
    confidence: "high",
  },
  {
    name: "BroadcastChannel",
    regex: /new\s+BroadcastChannel\s*\(\s*["'`]([^"'`]+)["'`]/g,
    category: "communication",
    confidence: "medium",
  },

  {
    name: "createElement('script')",
    regex: /createElement\s*\(\s*["']script["']\s*\)/g,
    category: "dom",
    confidence: "medium",
  },
  {
    name: "createElement('iframe')",
    regex: /createElement\s*\(\s*["']iframe["']\s*\)/g,
    category: "dom",
    confidence: "medium",
  },
  {
    name: "importScripts()",
    regex: /importScripts\s*\(\s*["'`]([^"'`]+)["'`]/g,
    category: "dom",
    confidence: "medium",
  },
];

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

export function analyzeCallPatterns(content: string): AnalyzerMatch[] {
  const matches: AnalyzerMatch[] = [];
  const seen = new Set<string>();

  for (const pattern of CALL_PATTERNS) {
    pattern.regex.lastIndex = 0;
    let match = pattern.regex.exec(content);
    while (match !== null) {
      const fullMatch = match[0];
      const capturedValue = match[1] ?? match[2] ?? fullMatch;
      const startOffset = match.index;
      const endOffset = startOffset + fullMatch.length;
      const dedupeKey = `${pattern.name}:${capturedValue}:${startOffset}`;

      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        const displayValue =
          capturedValue !== fullMatch
            ? `[${pattern.category}] ${pattern.name} → ${capturedValue}`
            : `[${pattern.category}] ${pattern.name}`;

        matches.push({
          analyzerKind: "callPatterns",
          value: displayValue,
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
