import type { AnalyzerMatch } from "shared";

const MAX_CONTEXT_LENGTH = 80;

const INLINE_SOURCEMAP_REGEX =
  /\/\/[#@]\s*sourceMappingURL\s*=\s*data:application\/json;(?:charset=[^;]+;)?base64,([A-Za-z0-9+/=]+)/g;

const EXTERNAL_SOURCEMAP_REGEX =
  /\/\/[#@]\s*sourceMappingURL\s*=\s*(\S+\.map(?:\?[^\s]*)?)/g;

const CSS_INLINE_SOURCEMAP_REGEX =
  /\/\*[#@]\s*sourceMappingURL\s*=\s*data:application\/json;(?:charset=[^;]+;)?base64,([A-Za-z0-9+/=]+)\s*\*\//g;

const CSS_EXTERNAL_SOURCEMAP_REGEX =
  /\/\*[#@]\s*sourceMappingURL\s*=\s*(\S+\.map(?:\?[^\s]*)?)\s*\*\//g;

type SourceMapInfo = {
  version: number | undefined;
  sources: string[];
  sourceCount: number;
};

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

function parseSourceMapBase64(base64Data: string): SourceMapInfo | undefined {
  try {
    const decoded = atob(base64Data);
    const parsed = JSON.parse(decoded) as Record<string, unknown>;

    const version =
      typeof parsed.version === "number" ? parsed.version : undefined;
    const sources = Array.isArray(parsed.sources)
      ? (parsed.sources as unknown[]).filter(
          (s): s is string => typeof s === "string",
        )
      : [];

    return {
      version,
      sources: sources.slice(0, 20),
      sourceCount: sources.length,
    };
  } catch {
    return undefined;
  }
}

function formatSourceMapValue(
  sizeKb: number,
  info: SourceMapInfo | undefined,
): string {
  if (info === undefined) {
    return `[Inline Source Map] ~${sizeKb}KB base64 encoded`;
  }

  const parts = [`[Inline Source Map] ~${sizeKb}KB`];

  if (info.sourceCount > 0) {
    parts.push(`${info.sourceCount} source files`);
    const preview = info.sources.slice(0, 5).join(", ");
    if (info.sourceCount > 5) {
      parts.push(`(${preview}, ...)`);
    } else {
      parts.push(`(${preview})`);
    }
  }

  return parts.join(" | ");
}

export function analyzeInlineSourceMap(content: string): AnalyzerMatch[] {
  const matches: AnalyzerMatch[] = [];

  const inlineRegexes = [INLINE_SOURCEMAP_REGEX, CSS_INLINE_SOURCEMAP_REGEX];
  for (const regex of inlineRegexes) {
    regex.lastIndex = 0;
    let match = regex.exec(content);
    while (match !== null) {
      const base64Data = match[1]!;
      const startOffset = match.index;
      const endOffset = startOffset + match[0].length;

      const sizeKb = Math.round((base64Data.length * 3) / 4 / 1024);
      const info = parseSourceMapBase64(base64Data);

      matches.push({
        analyzerKind: "inlineSourceMap",
        value: formatSourceMapValue(sizeKb, info),
        startOffset,
        endOffset,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "high",
        context: extractContext(content, startOffset, endOffset),
      });

      match = regex.exec(content);
    }
  }

  const externalRegexes = [
    EXTERNAL_SOURCEMAP_REGEX,
    CSS_EXTERNAL_SOURCEMAP_REGEX,
  ];
  for (const regex of externalRegexes) {
    regex.lastIndex = 0;
    let match = regex.exec(content);
    while (match !== null) {
      const mapUrl = match[1]!;
      const startOffset = match.index;
      const endOffset = startOffset + match[0].length;

      matches.push({
        analyzerKind: "inlineSourceMap",
        value: `[External Source Map] ${mapUrl}`,
        startOffset,
        endOffset,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "high",
        context: extractContext(content, startOffset, endOffset),
      });

      match = regex.exec(content);
    }
  }

  return matches;
}
