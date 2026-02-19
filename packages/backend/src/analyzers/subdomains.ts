import type { AnalyzerMatch } from "shared";

const MAX_CONTEXT_LENGTH = 80;

const SUBDOMAIN_REGEX =
  /(?:["'`]|\/\/)((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,})(?:["'`:/\s?,;)\]}])/gi;

const IGNORED_TLDS = new Set([
  "js",
  "ts",
  "css",
  "html",
  "json",
  "xml",
  "svg",
  "png",
  "jpg",
  "gif",
  "ico",
  "woff",
  "woff2",
  "ttf",
  "eot",
  "map",
  "min",
  "src",
  "dist",
  "test",
  "spec",
]);

const COMMON_JS_OBJECTS = new Set([
  "window.location",
  "document.body",
  "module.exports",
  "console.log",
  "console.error",
  "console.warn",
  "object.keys",
  "object.values",
  "object.entries",
  "array.from",
  "array.isarray",
  "promise.resolve",
  "promise.reject",
  "json.parse",
  "json.stringify",
  "math.floor",
  "math.ceil",
  "math.random",
  "date.now",
  "string.fromcharcode",
  "number.isnan",
  "error.message",
  "regexp.prototype",
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

function isLikelySubdomain(hostname: string): boolean {
  const lower = hostname.toLowerCase();

  const parts = lower.split(".");
  if (parts.length < 2) return false;

  const tld = parts[parts.length - 1]!;
  if (IGNORED_TLDS.has(tld)) return false;

  if (COMMON_JS_OBJECTS.has(lower)) return false;

  if (parts.some((p) => p.length === 0)) return false;

  if (parts.every((p) => /^\d+$/.test(p))) return false;

  if (lower.length < 4) return false;

  return true;
}

export function analyzeSubdomains(
  content: string,
  url?: string,
): AnalyzerMatch[] {
  const matches: AnalyzerMatch[] = [];
  const seen = new Set<string>();

  let sourceHost: string | undefined;
  if (url !== undefined) {
    const hostMatch = /\/\/([^/:]+)/.exec(url);
    if (hostMatch !== null) {
      sourceHost = hostMatch[1]!.toLowerCase();
    }
  }

  SUBDOMAIN_REGEX.lastIndex = 0;
  let match = SUBDOMAIN_REGEX.exec(content);
  while (match !== null) {
    const hostname = match[1]!.toLowerCase().replace(/\.$/, "");
    const startOffset = match.index + 1;
    const endOffset = startOffset + hostname.length;

    if (!seen.has(hostname) && isLikelySubdomain(hostname)) {
      if (sourceHost === undefined || hostname !== sourceHost) {
        seen.add(hostname);

        const parts = hostname.split(".");
        const confidence: "low" | "medium" | "high" =
          parts.length >= 3 ? "high" : "medium";

        matches.push({
          analyzerKind: "subdomains",
          value: hostname,
          startOffset,
          endOffset,
          rawStartOffset: undefined,
          rawEndOffset: undefined,
          confidence,
          context: extractContext(content, startOffset, endOffset),
        });
      }
    }

    match = SUBDOMAIN_REGEX.exec(content);
  }

  return matches;
}
