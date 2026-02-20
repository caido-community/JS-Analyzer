<script setup lang="ts">
import type { ScanResult } from "shared";

import { getAnalyzerLabel } from "@/composables/useScanResults";

const props = defineProps<{
  scanResult: ScanResult;
  duration: string;
}>();

defineOptions({ name: "ResultSummary" });
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-3 px-3 py-1.5 border-b border-surface-700 text-xs"
  >
    <div class="flex items-center gap-1.5">
      <i class="fas fa-file-code text-surface-500 text-[10px]" />
      <span class="text-surface-400">
        {{ props.scanResult.totalFiles }} files
      </span>
    </div>
    <div class="flex items-center gap-1.5">
      <i class="fas fa-bullseye text-surface-500 text-[10px]" />
      <span class="text-surface-400">
        {{ props.scanResult.totalMatches }} matches
      </span>
    </div>
    <div class="flex items-center gap-1.5">
      <i class="fas fa-clock text-surface-500 text-[10px]" />
      <span class="text-surface-400">{{ props.duration }}</span>
    </div>
    <div class="flex items-center gap-1.5 ml-auto">
      <i class="fas fa-cogs text-surface-500 text-[10px]" />
      <span class="text-surface-500">
        {{ props.scanResult.analyzers.map(getAnalyzerLabel).join(", ") }}
      </span>
      <slot name="actions" />
    </div>
  </div>
</template>
