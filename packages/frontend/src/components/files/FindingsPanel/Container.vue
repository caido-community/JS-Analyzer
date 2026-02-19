<script setup lang="ts">
import type { AnalyzerMatch, StaticAssetEntry } from "shared";
import { toRef } from "vue";

import Success from "./Success.vue";
import { useFindingsPanel } from "./useFindingsPanel";

import type { ScanState } from "@/stores/scanner/useScanState";

defineOptions({ name: "FindingsPanel" });

const props = defineProps<{
  selectedAsset: StaticAssetEntry | undefined;
  scanState: ScanState;
}>();

const emit = defineEmits<{
  highlight: [match: AnalyzerMatch];
}>();

const { grouped, totalMatches } = useFindingsPanel(
  toRef(props, "selectedAsset"),
  toRef(props, "scanState"),
);
</script>

<template>
  <div class="h-full flex flex-col">
    <div
      v-if="props.scanState.type === 'Scanning'"
      class="px-2 py-0.5 border-b border-surface-700 text-[10px] text-surface-400 shrink-0 flex items-center gap-1.5"
    >
      <i class="fas fa-spinner fa-spin text-[9px]" />
      <span>Scanning...</span>
    </div>
    <div
      v-if="props.selectedAsset === undefined"
      class="flex-1 flex items-center justify-center text-surface-500 text-xs"
    >
      <p>Select a file to see findings</p>
    </div>
    <Success
      v-else-if="props.scanState.type === 'Complete'"
      :groups="grouped"
      :total-matches="totalMatches"
      @highlight="(m) => emit('highlight', m)"
    />
    <div
      v-else-if="props.scanState.type !== 'Scanning'"
      class="flex-1 flex items-center justify-center text-surface-500 text-xs"
    >
      <p>Run a scan to see findings</p>
    </div>
    <div
      v-else
      class="flex-1 flex items-center justify-center text-surface-500 text-xs"
    >
      <p>Scan in progress...</p>
    </div>
  </div>
</template>
