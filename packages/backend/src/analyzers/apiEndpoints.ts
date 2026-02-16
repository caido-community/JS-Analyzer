import type { AnalyzerMatch } from "shared";

const MAX_CONTEXT_LENGTH = 80;

const API_PATH_REGEX =
  /["'`](\/(?:api|v[0-9]+|graphql|rest|auth|oauth|admin|internal|public|private|webhook|callback)(?:\/[a-zA-Z0-9_{}:.-]+)*\/?(?:\?[^"'`]*)?)["'`]/g;

const RELATIVE_PATH_REGEX =
  /["'`](\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_{}\-:.]+){1,}\/?)["'`]/g;

const HTTP_METHOD_PATH_REGEX =
  /(?:(?:get|post|put|delete|patch|head|options)\s*\(\s*)["'`](\/[a-zA-Z0-9_/{}\-:.]+\/?(?:\?[^"'`]*)?)["'`]/gi;

const FETCH_URL_REGEX =
  /fetch\s*\(\s*["'`](\/[a-zA-Z0-9_/{}\-:.]+\/?(?:\?[^"'`]*)?)["'`]/g;

const AXIOS_URL_REGEX =
  /axios\s*\.\s*(?:get|post|put|delete|patch|head|options|request)\s*\(\s*["'`](\/[a-zA-Z0-9_/{}\-:.]+\/?(?:\?[^"'`]*)?)["'`]/gi;

const IGNORED_EXTENSIONS = new Set([
  ".js",
  ".css",
  ".html",
  ".htm",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".map",
  ".json",
  ".xml",
  ".txt",
  ".md",
  ".ts",
  ".tsx",
  ".jsx",
  ".vue",
  ".scss",
  ".less",
  ".mp4",
  ".webm",
  ".mp3",
  ".pdf",
]);

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

function isStaticAssetPath(path: string): boolean {
  const lower = path.toLowerCase();
  const dotIndex = lower.lastIndexOf(".");
  if (dotIndex === -1) return false;
  const ext = lower.slice(dotIndex);
  return IGNORED_EXTENSIONS.has(ext);
}

function isLikelyEndpoint(path: string): boolean {
  if (path.length < 2 || path.length > 500) return false;
  if (isStaticAssetPath(path)) return false;
  if (/^\/[/#@!]/.test(path)) return false;
  if (/\s/.test(path)) return false;
  return true;
}

function collectMatches(
  content: string,
  regex: RegExp,
  seen: Set<string>,
  confidence: "low" | "medium" | "high",
): AnalyzerMatch[] {
  const results: AnalyzerMatch[] = [];
  regex.lastIndex = 0;
  let match = regex.exec(content);
  while (match !== null) {
    const path = match[1]!;
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;

    if (!seen.has(path) && isLikelyEndpoint(path)) {
      seen.add(path);
      results.push({
        analyzerKind: "apiEndpoints",
        value: path,
        startOffset,
        endOffset,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence,
        context: extractContext(content, startOffset, endOffset),
      });
    }

    match = regex.exec(content);
  }
  return results;
}

export function analyzeApiEndpoints(content: string): AnalyzerMatch[] {
  const seen = new Set<string>();

  const httpMethodMatches = collectMatches(
    content,
    HTTP_METHOD_PATH_REGEX,
    seen,
    "high",
  );

  const fetchMatches = collectMatches(content, FETCH_URL_REGEX, seen, "high");
  const axiosMatches = collectMatches(content, AXIOS_URL_REGEX, seen, "high");

  const apiPathMatches = collectMatches(
    content,
    API_PATH_REGEX,
    seen,
    "medium",
  );

  const relativePathMatches = collectMatches(
    content,
    RELATIVE_PATH_REGEX,
    seen,
    "low",
  );

  return [
    ...httpMethodMatches,
    ...fetchMatches,
    ...axiosMatches,
    ...apiPathMatches,
    ...relativePathMatches,
  ];
}
