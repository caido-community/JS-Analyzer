<script setup lang="ts">
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import type { AnalyzerKind, AnalyzerMatch, JsAnalyzerFilter } from "shared";
import { ALL_ANALYZER_KINDS } from "shared";
import { computed, ref, watch } from "vue";

import BottomBarContainer from "@/components/files/BottomBar/Container.vue";
import FileContentContainer from "@/components/files/FileContent/Container.vue";
import { useFileContent } from "@/components/files/FileContent/useFileContent";
import FileListContainer from "@/components/files/FileList/Container.vue";
import FilterBarContainer from "@/components/files/FilterBar/Container.vue";
import FindingsPanelContainer from "@/components/files/FindingsPanel/Container.vue";
import { useSDK } from "@/plugins/sdk";
import { useScannerService } from "@/services/scanner";

const sdk = useSDK();
const scanner = useScannerService();
const { highlightMatch, setHighlight, clearHighlight } = useFileContent();

const currentAnalyzers = ref<AnalyzerKind[]>([...ALL_ANALYZER_KINDS]);

const assetsCount = computed(() => {
  const s = scanner.assetsState.value;
  return s.type === "Success" ? s.assets.length : 0;
});

watch(
  () => scanner.selectedAsset.value,
  (asset) => {
    clearHighlight();
    if (asset !== undefined) {
      scanner.fetchBody(asset.requestId);
    }
  },
);

let lastFilter: JsAnalyzerFilter = {
  inScopeOnly: true,
  httpqlFilter: undefined,
};

function onLoad(filter: JsAnalyzerFilter) {
  lastFilter = filter;
  scanner.loadAssets(filter);
}

function onAnalyzersChange(analyzers: AnalyzerKind[]) {
  currentAnalyzers.value = analyzers;
}

function onScan(analyzers: AnalyzerKind[]) {
  const s = scanner.assetsState.value;
  if (s.type !== "Success") return;
  const requestIds = s.assets.map((a) => a.requestId);
  scanner.runScan(requestIds, analyzers);
}

function onScanAll() {
  const s = scanner.assetsState.value;
  if (s.type !== "Success") return;
  const requestIds = s.assets.map((a) => a.requestId);
  scanner.runScan(requestIds, currentAnalyzers.value);
}

function onCancel() {
  scanner.cancelScan();
}

async function onExport() {
  const state = scanner.scanState.value;
  if (state.type !== "Complete") return;
  const allValues = state.result.entries.flatMap((e) =>
    e.matches.map((m) => m.value),
  );
  const text = allValues.join("\n");
  await navigator.clipboard.writeText(text);
  sdk.window.showToast(`Copied ${allValues.length} matches to clipboard`, {
    variant: "info",
    duration: 1500,
  });
}

function onHighlight(match: AnalyzerMatch) {
  setHighlight(match);
}

function onRetry() {
  scanner.loadAssets(lastFilter);
}
</script>

<template>
  <div class="h-full flex flex-col">
    <FilterBarContainer
      @load="onLoad"
      @scan="onScan"
      @update:analyzers="onAnalyzersChange"
    />

    <Splitter class="flex-1 min-h-0 border-0" style="height: 100%">
      <SplitterPanel :size="20" :min-size="10">
        <FileListContainer
          :state="scanner.assetsState.value"
          :selected-index="scanner.selectedAssetIndex.value"
          @select="(i) => scanner.selectFile(i)"
          @retry="onRetry"
        />
      </SplitterPanel>
      <SplitterPanel :size="50" :min-size="25">
        <FileContentContainer
          :asset="scanner.selectedAsset.value"
          :body-state="scanner.bodyState.value"
          :highlight-match="highlightMatch"
        />
      </SplitterPanel>
      <SplitterPanel :size="30" :min-size="15">
        <FindingsPanelContainer
          :selected-asset="scanner.selectedAsset.value"
          :scan-state="scanner.scanState.value"
          @highlight="onHighlight"
        />
      </SplitterPanel>
    </Splitter>

    <BottomBarContainer
      :scan-state="scanner.scanState.value"
      :assets-count="assetsCount"
      @scan-all="onScanAll"
      @cancel="onCancel"
      @export="onExport"
    />
  </div>
</template>
