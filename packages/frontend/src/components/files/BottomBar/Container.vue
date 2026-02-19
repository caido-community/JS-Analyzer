<script setup lang="ts">
import Button from "primevue/button";
import { computed } from "vue";

import type { ScanState } from "@/stores/scanner/useScanState";

defineOptions({ name: "BottomBar" });

const props = defineProps<{
  scanState: ScanState;
  assetsCount: number;
}>();

const emit = defineEmits<{
  scanAll: [];
  cancel: [];
  export: [];
}>();

const isScanning = computed(() => props.scanState.type === "Scanning");

const progressPercent = computed(() => {
  if (
    props.scanState.type !== "Scanning" ||
    props.scanState.progress === undefined
  ) {
    return 0;
  }
  const { scannedFiles, totalFiles } = props.scanState.progress;
  if (totalFiles === 0) return 0;
  return Math.round((scannedFiles / totalFiles) * 100);
});

const statusText = computed(() => {
  switch (props.scanState.type) {
    case "Idle":
      return "Ready";
    case "Scanning": {
      const p = props.scanState.progress;
      if (p === undefined) return "Starting scan...";
      return `Scanning ${p.scannedFiles}/${p.totalFiles}...`;
    }
    case "Error":
      return `Error: ${props.scanState.error}`;
    case "Complete":
      return `${props.scanState.result.totalMatches} matches in ${props.scanState.result.totalFiles} files`;
    default:
      return "";
  }
});
</script>

<template>
  <div class="relative shrink-0 border-t border-surface-700 bg-surface-900/50">
    <div
      v-if="isScanning"
      class="absolute top-0 left-0 h-[2px] bg-primary-500 transition-all duration-300"
      :style="{ width: `${progressPercent}%` }"
    />
    <div class="flex items-center gap-2 px-2 h-7">
      <span class="text-[10px] text-surface-400 truncate flex-1">
        {{ statusText }}
      </span>

      <Button
        v-if="!isScanning && props.assetsCount > 0"
        label="Scan All"
        size="small"
        text
        class="!text-[10px] !py-0 !px-1.5 !h-5"
        @click="emit('scanAll')"
      />
      <Button
        v-if="isScanning"
        label="Cancel"
        size="small"
        text
        severity="danger"
        class="!text-[10px] !py-0 !px-1.5 !h-5"
        @click="emit('cancel')"
      />
      <Button
        v-if="props.scanState.type === 'Complete'"
        icon="fas fa-download"
        size="small"
        text
        severity="secondary"
        class="!text-[10px] !py-0 !px-1 !h-5"
        @click="emit('export')"
      />
    </div>
  </div>
</template>
