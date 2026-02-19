const JS_CONTENT_TYPES = [
  "application/javascript",
  "text/javascript",
  "application/x-javascript",
  "application/ecmascript",
  "text/ecmascript",
] as const;

const JS_EXTENSIONS = [".js", ".mjs", ".cjs"] as const;
const JSON_EXTENSIONS = [".json"] as const;
const MAP_EXTENSIONS = [".map"] as const;

const ALL_STATIC_EXTENSIONS = [
  ...JS_EXTENSIONS,
  ...JSON_EXTENSIONS,
  ...MAP_EXTENSIONS,
] as const;

function isJsContentType(contentType: string): boolean {
  const lower = contentType.toLowerCase();
  return JS_CONTENT_TYPES.some((ct) => lower.includes(ct));
}

function isStaticAssetUrl(url: string): boolean {
  const pathname = extractPathname(url);
  const lower = pathname.toLowerCase();
  return ALL_STATIC_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isTextPlainWithStaticUrl(contentType: string, url: string): boolean {
  return (
    contentType.toLowerCase().includes("text/plain") && isStaticAssetUrl(url)
  );
}

export function isStaticAsset(contentType: string, url: string): boolean {
  return (
    isJsContentType(contentType) ||
    isStaticAssetUrl(url) ||
    isTextPlainWithStaticUrl(contentType, url)
  );
}

function extractPathname(url: string): string {
  const queryIndex = url.indexOf("?");
  if (queryIndex !== -1) {
    return url.slice(0, queryIndex);
  }
  const hashIndex = url.indexOf("#");
  if (hashIndex !== -1) {
    return url.slice(0, hashIndex);
  }
  return url;
}

export const QUERY_PAGE_SIZE = 500;
