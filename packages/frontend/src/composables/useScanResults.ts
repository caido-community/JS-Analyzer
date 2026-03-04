import type {
  AnalyzerKind,
  AnalyzerMatch,
  ScanResult,
  ScanResultEntry,
} from "shared";
import { computed, type Ref } from "vue";

export type MatchWithSource = AnalyzerMatch & {
  sourceUrl: string;
  requestId: string;
  entryIndex: number;
};

export type KindGroup = {
  kind: AnalyzerKind;
  label: string;
  icon: string;
  matches: MatchWithSource[];
};

const ANALYZER_LABELS: Record<AnalyzerKind, string> = {
  secrets: "Secrets",
  subdomains: "Subdomains",
  cloudUrls: "Cloud URLs",
  apiEndpoints: "API Endpoints",
  dependencyConfusion: "Dependency Confusion",
  inlineSourceMap: "Source Maps",
  securitySinks: "Security Sinks",
  sensitiveData: "Sensitive Data",
  callPatterns: "Call Patterns",
  stringExpressions: "String Expressions",
  frameworkPatterns: "Framework Patterns",
  chunkDiscovery: "Chunk Discovery",
};

const ANALYZER_ICONS: Record<AnalyzerKind, string> = {
  secrets: "fas fa-key",
  subdomains: "fas fa-globe",
  cloudUrls: "fas fa-cloud",
  apiEndpoints: "fas fa-link",
  dependencyConfusion: "fas fa-box",
  inlineSourceMap: "fas fa-map",
  securitySinks: "fas fa-shield-alt",
  sensitiveData: "fas fa-exclamation-triangle",
  callPatterns: "fas fa-phone-alt",
  stringExpressions: "fas fa-quote-right",
  frameworkPatterns: "fas fa-layer-group",
  chunkDiscovery: "fas fa-puzzle-piece",
};

export function getAnalyzerLabel(kind: AnalyzerKind): string {
  return ANALYZER_LABELS[kind];
}

export function getAnalyzerIcon(kind: AnalyzerKind): string {
  return ANALYZER_ICONS[kind];
}

function groupByKind(entries: ScanResultEntry[]): KindGroup[] {
  const kindMap = new Map<AnalyzerKind, MatchWithSource[]>();

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    for (const match of entry.matches) {
      const existing = kindMap.get(match.analyzerKind) ?? [];
      existing.push({
        ...match,
        sourceUrl: entry.url,
        requestId: entry.requestId,
        entryIndex: i,
      });
      kindMap.set(match.analyzerKind, existing);
    }
  }

  const groups: KindGroup[] = [];
  for (const [kind, matches] of kindMap) {
    groups.push({
      kind,
      label: ANALYZER_LABELS[kind],
      icon: ANALYZER_ICONS[kind],
      matches,
    });
  }

  return groups.sort((a, b) => b.matches.length - a.matches.length);
}

export function useScanResults(scanResult: Ref<ScanResult>) {
  const grouped = computed<KindGroup[]>(() =>
    groupByKind(scanResult.value.entries),
  );

  const duration = computed(() => {
    const start = new Date(scanResult.value.startedAt).getTime();
    const end =
      scanResult.value.completedAt !== undefined
        ? new Date(scanResult.value.completedAt).getTime()
        : Date.now();
    const ms = end - start;
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  });

  return {
    grouped,
    duration,
  };
}

export function copyAllMatches(matches: MatchWithSource[]): string {
  return matches.map((m) => m.value).join("\n");
}

function escapeCsvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToCsv(grouped: KindGroup[]): string {
  const header = "kind,value,confidence,sourceUrl";
  const rows = grouped.flatMap((g) =>
    g.matches.map((m) =>
      [
        escapeCsvCell(g.kind),
        escapeCsvCell(m.value),
        escapeCsvCell(m.confidence),
        escapeCsvCell(m.sourceUrl),
      ].join(","),
    ),
  );
  return [header, ...rows].join("\n");
}

export function exportToJson(scanResult: ScanResult): string {
  return JSON.stringify(scanResult, null, 2);
}

const SENSITIVE_KINDS: Set<string> = new Set([
  "secrets",
  "dependencyConfusion",
  "sensitiveData",
]);

function normalizeValueForDedupe(value: string, kind: string): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (SENSITIVE_KINDS.has(kind) || trimmed.length > 80) {
    return `${trimmed.length}:${trimmed.slice(0, 20)}`;
  }
  return trimmed;
}

export function buildFindingDedupeKey(
  requestId: string,
  analyzerKind: string,
  value: string,
): string {
  const normalized = normalizeValueForDedupe(value, analyzerKind);
  return `${requestId}|${analyzerKind}|${normalized}`;
}

export function buildFindingDescription(
  match: MatchWithSource,
  sourceUrl: string,
): string {
  const kindLabel = ANALYZER_LABELS[match.analyzerKind] ?? match.analyzerKind;
  const value =
    match.value.length > 500
      ? `${match.value.slice(0, 500)}\n...`
      : match.value;
  const valueBlock =
    value.includes("\n") || value.length > 80
      ? `\n\`\`\`\n${value}\n\`\`\``
      : ` \`${value}\``;
  return [
    `**Type:** ${kindLabel}`,
    `**Severity:** ${match.confidence}`,
    `**Source:** ${sourceUrl}`,
    `**Offset:** ${match.startOffset}-${match.endOffset}`,
    `**Match:**${valueBlock}`,
  ].join("\n\n");
}

export function buildFindingTitle(match: MatchWithSource): string {
  const kindLabel = ANALYZER_LABELS[match.analyzerKind] ?? match.analyzerKind;
  return `JS Analyzer: ${kindLabel}`;
}

export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  /* eslint-disable compat/compat -- URL.createObjectURL/revokeObjectURL required for file download */
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
  /* eslint-enable compat/compat */
}

type HighlightBodyParts =
  | { escaped: string }
  | { before: string; highlight: string; after: string };

export function getHighlightBodyParts(
  body: string,
  startOffset: number,
  endOffset: number,
): HighlightBodyParts {
  const safeStart = Math.max(0, startOffset);
  const safeEnd = Math.min(body.length, endOffset);

  if (safeStart >= safeEnd) {
    return { escaped: body };
  }

  return {
    before: body.slice(0, safeStart),
    highlight: body.slice(safeStart, safeEnd),
    after: body.slice(safeEnd),
  };
}
