<script setup lang="ts">
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import Popover from "primevue/popover";
import ToggleSwitch from "primevue/toggleswitch";
import type { AnalyzerKind, JsAnalyzerFilter } from "shared";
import { ALL_ANALYZER_KINDS } from "shared";
import { ref, watch } from "vue";

import { useFilterBarForm } from "./useForm";

import {
  getAnalyzerIcon,
  getAnalyzerLabel,
} from "@/components/ScanResultDialog/useScanResults";

defineOptions({ name: "FilterBar" });

const emit = defineEmits<{
  load: [filter: JsAnalyzerFilter];
  scan: [analyzers: AnalyzerKind[]];
  "update:analyzers": [analyzers: AnalyzerKind[]];
}>();

const { inScopeOnly, httpqlFilter, selectedAnalyzers, filter } =
  useFilterBarForm();

watch(
  selectedAnalyzers,
  (analyzers) => {
    emit("update:analyzers", analyzers);
  },
  { immediate: true },
);

const popover = ref<InstanceType<typeof Popover>>();

function togglePopover(event: Event) {
  popover.value?.toggle(event);
}

function toggleAnalyzer(kind: AnalyzerKind) {
  const idx = selectedAnalyzers.value.indexOf(kind);
  if (idx === -1) {
    selectedAnalyzers.value = [...selectedAnalyzers.value, kind];
  } else {
    selectedAnalyzers.value = selectedAnalyzers.value.filter((k) => k !== kind);
  }
}

function selectAll() {
  selectedAnalyzers.value = [...ALL_ANALYZER_KINDS];
}

function deselectAll() {
  selectedAnalyzers.value = [];
}

function isChecked(kind: AnalyzerKind): boolean {
  return selectedAnalyzers.value.includes(kind);
}

function onLoad() {
  emit("load", filter.value);
}

function onScan() {
  emit("scan", selectedAnalyzers.value);
}
</script>

<template>
  <div
    class="flex items-center gap-2 px-2 py-1 border-b border-surface-700 bg-surface-900/50"
  >
    <div class="flex items-center gap-1.5">
      <label class="text-[10px] text-surface-400 whitespace-nowrap"
        >In scope</label
      >
      <ToggleSwitch v-model="inScopeOnly" />
    </div>

    <InputText
      v-model="httpqlFilter"
      placeholder="HTTPQL filter"
      class="w-48 !text-xs !py-1"
    />

    <Button
      size="small"
      severity="secondary"
      class="!text-xs !py-1"
      @click="togglePopover"
    >
      <i class="fas fa-chevron-down mr-1 text-[8px]" />
      Analyzers
      <span
        class="ml-1 bg-primary-500/20 text-primary-400 rounded-full px-1.5 py-0 text-[10px] font-medium"
      >
        {{ selectedAnalyzers.length }}
      </span>
    </Button>

    <Popover ref="popover">
      <div class="w-52 p-2">
        <div class="flex justify-between items-center mb-2 text-[10px]">
          <span class="text-surface-400 font-medium uppercase tracking-wider">
            Analyzers
          </span>
          <div class="flex gap-2">
            <button
              class="text-primary-400 hover:text-primary-300"
              @click="selectAll"
            >
              All
            </button>
            <button
              class="text-primary-400 hover:text-primary-300"
              @click="deselectAll"
            >
              None
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label
            v-for="kind in ALL_ANALYZER_KINDS"
            :key="kind"
            class="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-surface-700/50 text-[11px]"
          >
            <Checkbox
              :model-value="isChecked(kind)"
              binary
              @update:model-value="toggleAnalyzer(kind)"
            />
            <i
              :class="getAnalyzerIcon(kind)"
              class="text-[10px] text-surface-400 w-3 text-center"
            />
            <span class="text-surface-200">{{ getAnalyzerLabel(kind) }}</span>
          </label>
        </div>
      </div>
    </Popover>

    <div class="flex-1" />

    <div class="flex gap-1">
      <Button
        label="Load"
        size="small"
        class="!text-xs !py-1"
        @click="onLoad"
      />
      <Button
        label="Scan"
        size="small"
        severity="secondary"
        class="!text-xs !py-1"
        @click="onScan"
      />
    </div>
  </div>
</template>
