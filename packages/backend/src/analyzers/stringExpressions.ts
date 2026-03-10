import type { AnalyzerMatch } from "shared";

const MAX_CONTEXT_LENGTH = 100;

const GRAPHQL_PATTERN =
  /(?:query|mutation|subscription)\s+\w*\s*(?:\([^)]*\))?\s*\{/g;

const GRAPHQL_INTROSPECTION =
  /(?:__schema|__type|__typename|IntrospectionQuery)\b/g;

const ABSOLUTE_URL_PATTERN = /["'`](https?:\/\/[^\s"'`<>{}|\\^[\]]+?)["'`]/g;

const PARAMETERIZED_PATH =
  /["'`](\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\/:[a-zA-Z_][a-zA-Z0-9_]*(?:\/[a-zA-Z0-9_:.-]*)*)\b/g;

const TEMPLATE_URL_PATTERN = /`((?:\/[a-zA-Z0-9_-]+)*\/\$\{[^}]+\}[^`]*)`/g;

const URL_SEARCH_PARAMS = /new\s+URLSearchParams\s*\(/g;

const QUERY_STRING_LITERAL =
  /["'`](\?[a-zA-Z_][a-zA-Z0-9_]*=[^"'`\s]+(?:&[a-zA-Z_][a-zA-Z0-9_]*=[^"'`\s]*)*)["'`]/g;

const STATIC_EXTENSIONS =
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|map)$/i;

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

function isStaticAssetUrl(url: string): boolean {
  const path = url.split("?")[0] ?? url;
  return STATIC_EXTENSIONS.test(path);
}

function isCommonLibraryUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("googleapis.com/ajax") ||
    lower.includes("cdnjs.cloudflare.com") ||
    lower.includes("cdn.jsdelivr.net") ||
    lower.includes("unpkg.com") ||
    lower.includes("fonts.googleapis.com")
  );
}

export function analyzeStringExpressions(content: string): AnalyzerMatch[] {
  const matches: AnalyzerMatch[] = [];
  const seen = new Set<string>();

  GRAPHQL_PATTERN.lastIndex = 0;
  let match = GRAPHQL_PATTERN.exec(content);
  while (match !== null) {
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;
    const dedupeKey = `graphql:${startOffset}`;
    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      matches.push({
        analyzerKind: "stringExpressions",
        value: `[GraphQL] ${match[0].trim()}`,
        startOffset,
        endOffset,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "high",
        context: extractContext(content, startOffset, endOffset),
      });
    }
    match = GRAPHQL_PATTERN.exec(content);
  }

  GRAPHQL_INTROSPECTION.lastIndex = 0;
  match = GRAPHQL_INTROSPECTION.exec(content);
  while (match !== null) {
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;
    const dedupeKey = `introspection:${match[0]}:${startOffset}`;
    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      matches.push({
        analyzerKind: "stringExpressions",
        value: `[GraphQL Introspection] ${match[0]}`,
        startOffset,
        endOffset,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "high",
        context: extractContext(content, startOffset, endOffset),
      });
    }
    match = GRAPHQL_INTROSPECTION.exec(content);
  }

  ABSOLUTE_URL_PATTERN.lastIndex = 0;
  match = ABSOLUTE_URL_PATTERN.exec(content);
  while (match !== null) {
    const url = match[1]!;
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;
    const dedupeKey = `url:${url.toLowerCase()}`;
    if (
      !seen.has(dedupeKey) &&
      !isStaticAssetUrl(url) &&
      !isCommonLibraryUrl(url)
    ) {
      seen.add(dedupeKey);
      matches.push({
        analyzerKind: "stringExpressions",
        value: `[Absolute URL] ${url}`,
        startOffset,
        endOffset,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "high",
        context: extractContext(content, startOffset, endOffset),
      });
    }
    match = ABSOLUTE_URL_PATTERN.exec(content);
  }

  PARAMETERIZED_PATH.lastIndex = 0;
  match = PARAMETERIZED_PATH.exec(content);
  while (match !== null) {
    const path = match[1]!;
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;
    const dedupeKey = `param-path:${path}`;
    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      matches.push({
        analyzerKind: "stringExpressions",
        value: `[Parameterized Path] ${path}`,
        startOffset,
        endOffset,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "medium",
        context: extractContext(content, startOffset, endOffset),
      });
    }
    match = PARAMETERIZED_PATH.exec(content);
  }

  TEMPLATE_URL_PATTERN.lastIndex = 0;
  match = TEMPLATE_URL_PATTERN.exec(content);
  while (match !== null) {
    const template = match[1]!;
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;
    const dedupeKey = `template:${template}:${startOffset}`;
    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      matches.push({
        analyzerKind: "stringExpressions",
        value: `[Template URL] ${template}`,
        startOffset,
        endOffset,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "medium",
        context: extractContext(content, startOffset, endOffset),
      });
    }
    match = TEMPLATE_URL_PATTERN.exec(content);
  }

  URL_SEARCH_PARAMS.lastIndex = 0;
  match = URL_SEARCH_PARAMS.exec(content);
  while (match !== null) {
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;
    const dedupeKey = `searchparams:${startOffset}`;
    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      matches.push({
        analyzerKind: "stringExpressions",
        value: `[URLSearchParams] new URLSearchParams(...)`,
        startOffset,
        endOffset,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "low",
        context: extractContext(content, startOffset, endOffset),
      });
    }
    match = URL_SEARCH_PARAMS.exec(content);
  }

  QUERY_STRING_LITERAL.lastIndex = 0;
  match = QUERY_STRING_LITERAL.exec(content);
  while (match !== null) {
    const qs = match[1]!;
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;
    const dedupeKey = `qs:${qs}:${startOffset}`;
    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      matches.push({
        analyzerKind: "stringExpressions",
        value: `[Query String] ${qs}`,
        startOffset,
        endOffset,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "medium",
        context: extractContext(content, startOffset, endOffset),
      });
    }
    match = QUERY_STRING_LITERAL.exec(content);
  }

  return matches;
}
