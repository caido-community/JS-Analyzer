<script setup lang="ts">
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import InputNumber from "primevue/inputnumber";
import ToggleSwitch from "primevue/toggleswitch";
import type { AnalyzerKind } from "shared";
import { ALL_ANALYZER_KINDS } from "shared";
import { computed, onMounted } from "vue";

import {
  getAnalyzerIcon,
  getAnalyzerLabel,
} from "@/components/ScanResultDialog/useScanResults";
import { useConfigService } from "@/services/config";

defineOptions({ name: "SettingsView" });

const configService = useConfigService();

onMounted(() => {
  configService.load();
});

const enabledAnalyzers = computed({
  get: () =>
    configService.config.value?.enabledAnalyzers ?? [...ALL_ANALYZER_KINDS],
  set: (val: AnalyzerKind[]) => {
    if (configService.config.value !== undefined) {
      configService.update({ enabledAnalyzers: val });
    }
  },
});

const autoLoadEnabled = computed({
  get: () => configService.config.value?.autoLoadEnabled ?? false,
  set: (val: boolean) => {
    configService.update({ autoLoadEnabled: val });
  },
});

const autoLoadIntervalSeconds = computed({
  get: () => configService.config.value?.autoLoadIntervalSeconds ?? 30,
  set: (val: number) => {
    if (val >= 5) {
      configService.update({ autoLoadIntervalSeconds: val });
    }
  },
});

const inScopeOnly = computed({
  get: () => configService.config.value?.inScopeOnly ?? false,
  set: (val: boolean) => {
    configService.update({ inScopeOnly: val });
  },
});

const autoScanEnabled = computed({
  get: () => configService.config.value?.autoScanEnabled ?? false,
  set: (val: boolean) => {
    configService.update({ autoScanEnabled: val });
  },
});

function isAnalyzerEnabled(kind: AnalyzerKind): boolean {
  return enabledAnalyzers.value.includes(kind);
}

function toggleAnalyzer(kind: AnalyzerKind) {
  const current = enabledAnalyzers.value;
  if (current.includes(kind)) {
    enabledAnalyzers.value = current.filter((k) => k !== kind);
  } else {
    enabledAnalyzers.value = [...current, kind];
  }
}
</script>

<template>
  <div class="flex flex-col h-full gap-1 overflow-y-auto">
    <Card
      class="h-fit"
      :pt="{
        body: { class: 'h-fit p-0' },
        content: { class: 'h-fit flex flex-col' },
      }"
    >
      <template #content>
        <div class="flex justify-between items-center p-4">
          <div>
            <h3 class="text-lg font-semibold">Settings</h3>
            <p class="text-sm text-surface-300">
              Configure JS Analyzer default settings
            </p>
          </div>
        </div>
      </template>
    </Card>

    <div
      v-if="configService.config.value === undefined"
      class="flex-1 flex items-center justify-center"
    >
      <span class="text-gray-400">Loading...</span>
    </div>

    <Card
      v-else
      class="h-full"
      :pt="{
        body: { class: 'h-full p-0' },
        content: { class: 'h-full flex flex-col' },
      }"
    >
      <template #content>
        <div class="flex flex-col gap-6 p-4">
          <div class="flex flex-col gap-4">
            <h4 class="text-md font-medium text-surface-300">Analyzers</h4>

            <div class="flex items-start justify-between gap-4">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm font-medium">Enabled Analyzers</label>
                <p class="text-xs text-surface-400">
                  Select which analyzers run by default for context menu scans,
                  response view mode, and the FilterBar initial selection.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-1 pl-1">
              <label
                v-for="kind in ALL_ANALYZER_KINDS"
                :key="kind"
                class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-surface-700/50"
              >
                <Checkbox
                  :model-value="isAnalyzerEnabled(kind)"
                  binary
                  @update:model-value="toggleAnalyzer(kind)"
                />
                <i
                  :class="getAnalyzerIcon(kind)"
                  class="text-[11px] text-surface-400 w-4 text-center"
                />
                <span class="text-sm text-surface-200">{{
                  getAnalyzerLabel(kind)
                }}</span>
              </label>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <h4 class="text-md font-medium text-surface-300">General</h4>

            <div class="flex items-start justify-between gap-4">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm font-medium">In-Scope Only</label>
                <p class="text-xs text-surface-400">
                  When enabled, the Files view will only show assets from
                  in-scope requests by default
                </p>
              </div>
              <div class="flex-shrink-0">
                <ToggleSwitch v-model="inScopeOnly" />
              </div>
            </div>

            <div class="flex items-start justify-between gap-4">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm font-medium"
                  >Auto-Scan New Requests</label
                >
                <p class="text-xs text-surface-400">
                  Automatically run analysis on new intercepted requests
                  matching JavaScript content types
                </p>
              </div>
              <div class="flex-shrink-0">
                <ToggleSwitch v-model="autoScanEnabled" />
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <h4 class="text-md font-medium text-surface-300">Auto-Load</h4>

            <div class="flex items-start justify-between gap-4">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm font-medium">Enable Auto-Load</label>
                <p class="text-xs text-surface-400">
                  Automatically refresh the file list in the Files view at a set
                  interval
                </p>
              </div>
              <div class="flex-shrink-0">
                <ToggleSwitch v-model="autoLoadEnabled" />
              </div>
            </div>

            <div class="flex items-start justify-between gap-4">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm font-medium"
                  >Refresh Interval (seconds)</label
                >
                <p class="text-xs text-surface-400">
                  How often to refresh the file list when auto-load is enabled
                </p>
              </div>
              <div class="flex-shrink-0">
                <InputNumber
                  v-model="autoLoadIntervalSeconds"
                  :min="5"
                  :max="3600"
                  :disabled="!autoLoadEnabled"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
