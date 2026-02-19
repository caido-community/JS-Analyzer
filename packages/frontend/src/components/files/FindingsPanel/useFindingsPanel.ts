import type {
  AnalyzerKind,
  AnalyzerMatch,
  ScanResult,
  StaticAssetEntry,
} from "shared";
import { computed, type Ref } from "vue";

import {
  getAnalyzerIcon,
  getAnalyzerLabel,
} from "@/components/ScanResultDialog/useScanResults";

export type FindingsGroup = {
  kind: AnalyzerKind;
  label: string;
  icon: string;
  matches: AnalyzerMatch[];
};

export function useFindingsPanel(
  selectedAsset: Ref<StaticAssetEntry | undefined>,
  scanState: Ref<{ type: string; result?: ScanResult }>,
) {
  const entryMatches = computed(() => {
    const asset = selectedAsset.value;
    if (asset === undefined) return [];
    const state = scanState.value;
    if (state.type !== "Complete" || state.result === undefined) return [];
    const entry = state.result.entries.find(
      (e) => e.requestId === asset.requestId,
    );
    return entry?.matches ?? [];
  });

  const grouped = computed<FindingsGroup[]>(() => {
    const kindMap = new Map<AnalyzerKind, AnalyzerMatch[]>();
    for (const match of entryMatches.value) {
      const existing = kindMap.get(match.analyzerKind) ?? [];
      existing.push(match);
      kindMap.set(match.analyzerKind, existing);
    }
    const groups: FindingsGroup[] = [];
    for (const [kind, matches] of kindMap) {
      groups.push({
        kind,
        label: getAnalyzerLabel(kind),
        icon: getAnalyzerIcon(kind),
        matches,
      });
    }
    return groups.sort((a, b) => b.matches.length - a.matches.length);
  });

  const totalMatches = computed(() => entryMatches.value.length);

  return { grouped, totalMatches };
}
