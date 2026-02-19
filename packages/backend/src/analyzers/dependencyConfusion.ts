import type { AnalyzerMatch } from "shared";

const MAX_CONTEXT_LENGTH = 80;

const REQUIRE_REGEX = /require\s*\(\s*["'`]([a-z@][a-z0-9._\-/]*)["'`]\s*\)/g;

const IMPORT_FROM_REGEX =
  /import\s+(?:[\w{}\s*,]+\s+from\s+)?["'`]([a-z@][a-z0-9._\-/]*)["'`]/g;

const DYNAMIC_IMPORT_REGEX =
  /import\s*\(\s*["'`]([a-z@][a-z0-9._\-/]*)["'`]\s*\)/g;

const WEBPACK_REQUIRE_REGEX =
  /__webpack_require__\s*\(\s*["'`]([a-z@][a-z0-9._\-/]*)["'`]\s*\)/g;

const SCOPED_PACKAGE_REGEX = /^@([a-z0-9-~][a-z0-9-._~]*)\/[a-z0-9-._~]+$/;
const UNSCOPED_PACKAGE_REGEX = /^[a-z0-9-~][a-z0-9-._~]*$/;

const BUILTIN_MODULES = new Set([
  "assert",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "sys",
  "timers",
  "tls",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "worker_threads",
  "zlib",
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

function isNpmPackageName(name: string): boolean {
  const baseName = name.includes("/") ? name.split("/")[0]! : name;

  if (baseName.startsWith("@")) {
    return SCOPED_PACKAGE_REGEX.test(name);
  }

  return UNSCOPED_PACKAGE_REGEX.test(baseName);
}

function isRelativePath(name: string): boolean {
  return name.startsWith("./") || name.startsWith("../") || name === ".";
}

function getPackageName(specifier: string): string {
  if (specifier.startsWith("@")) {
    const parts = specifier.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : specifier;
  }
  return specifier.split("/")[0]!;
}

function processRegex(
  content: string,
  regex: RegExp,
  seen: Set<string>,
): AnalyzerMatch[] {
  const results: AnalyzerMatch[] = [];
  regex.lastIndex = 0;
  let match = regex.exec(content);
  while (match !== null) {
    const specifier = match[1]!;
    const packageName = getPackageName(specifier);
    const startOffset = match.index;
    const endOffset = startOffset + match[0].length;

    if (
      !seen.has(packageName) &&
      !isRelativePath(specifier) &&
      !BUILTIN_MODULES.has(packageName) &&
      isNpmPackageName(packageName)
    ) {
      seen.add(packageName);

      const isScoped = packageName.startsWith("@");
      const confidence: "low" | "medium" | "high" = isScoped ? "medium" : "low";

      results.push({
        analyzerKind: "dependencyConfusion",
        value: packageName,
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

export function analyzeDependencyConfusion(content: string): AnalyzerMatch[] {
  const seen = new Set<string>();

  return [
    ...processRegex(content, REQUIRE_REGEX, seen),
    ...processRegex(content, IMPORT_FROM_REGEX, seen),
    ...processRegex(content, DYNAMIC_IMPORT_REGEX, seen),
    ...processRegex(content, WEBPACK_REQUIRE_REGEX, seen),
  ];
}
