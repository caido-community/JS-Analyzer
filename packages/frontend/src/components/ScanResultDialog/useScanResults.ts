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

type KindGroup = {
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
};

const ANALYZER_ICONS: Record<AnalyzerKind, string> = {
  secrets: "fas fa-key",
  subdomains: "fas fa-globe",
  cloudUrls: "fas fa-cloud",
  apiEndpoints: "fas fa-link",
  dependencyConfusion: "fas fa-box",
  inlineSourceMap: "fas fa-map",
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function highlightBodyAtOffset(
  body: string,
  startOffset: number,
  endOffset: number,
): string {
  const safeStart = Math.max(0, startOffset);
  const safeEnd = Math.min(body.length, endOffset);

  if (safeStart >= safeEnd) return escapeHtml(body);

  const before = escapeHtml(body.slice(0, safeStart));
  const matched = escapeHtml(body.slice(safeStart, safeEnd));
  const after = escapeHtml(body.slice(safeEnd));

  return `${before}<mark class="js-analyzer-mark">${matched}</mark>${after}`;
}
