<script setup lang="ts">
import type { Caido, ResponseFull } from "@caido/sdk-frontend";
import Button from "primevue/button";
import Panel from "primevue/panel";
import { ALL_ANALYZER_KINDS, type ScanResult } from "shared";
import { computed, onMounted, ref } from "vue";

import MatchRow from "@/components/ScanResultDialog/MatchRow.vue";
import {
  copyAllMatches,
  type MatchWithSource,
  useScanResults,
} from "@/composables/useScanResults";
import type { FrontendSDK } from "@/types";

const props = defineProps<{
  sdk: Caido;
  response: ResponseFull;
  request?: { id?: string };
}>();

defineOptions({ name: "ResponseViewMode" });

type ViewState =
  | { type: "Idle" }
  | { type: "Loading" }
  | { type: "Error"; error: string }
  | { type: "Success"; data: ScanResult };

const state = ref<ViewState>({ type: "Idle" });
const typedSdk = computed(() => props.sdk as unknown as FrontendSDK);

const scanResultRef = computed<ScanResult>(() =>
  state.value.type === "Success"
    ? state.value.data
    : {
        id: "",
        status: "Complete",
        startedAt: "",
        completedAt: "",
        totalFiles: 0,
        totalMatches: 0,
        entries: [],
        analyzers: [],
      },
);

const { grouped } = useScanResults(scanResultRef);

const totalMatches = computed(() => {
  if (state.value.type !== "Success") return 0;
  return state.value.data.totalMatches;
});

function extractResponseBody(raw: string): string {
  const separator = raw.indexOf("\r\n\r\n");
  if (separator !== -1) {
    return raw.slice(separator + 4);
  }
  const fallback = raw.indexOf("\n\n");
  if (fallback !== -1) {
    return raw.slice(fallback + 2);
  }
  return raw;
}

async function runAnalysis() {
  state.value = { type: "Loading" };
  try {
    const body = extractResponseBody(props.response.raw);
    if (body.length === 0) {
      state.value = { type: "Error", error: "Response body is empty" };
      return;
    }

    const requestId = props.request?.id ?? "";
    const result = await typedSdk.value.backend.runPassiveScanOnContent(
      body,
      "",
      ALL_ANALYZER_KINDS,
      requestId,
    );
    if (result.kind === "Error") {
      state.value = { type: "Error", error: result.error };
      return;
    }
    state.value = { type: "Success", data: result.value };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    state.value = { type: "Error", error: message };
  }
}

async function handleCopyAll(matches: MatchWithSource[]) {
  const text = copyAllMatches(matches);
  await navigator.clipboard.writeText(text);
}

onMounted(() => {
  runAnalysis();
});
</script>

<template>
  <div class="h-full w-full flex flex-col p-3 overflow-y-auto">
    <div
      v-if="state.type === 'Idle'"
      class="flex-1 flex items-center justify-center"
    >
      <Button label="Run Analysis" icon="fas fa-play" @click="runAnalysis" />
    </div>

    <div
      v-else-if="state.type === 'Loading'"
      class="flex-1 flex items-center justify-center"
    >
      <i class="fas fa-spinner fa-spin text-surface-400 text-xl mr-2" />
      <span class="text-surface-400">Analyzing...</span>
    </div>

    <div
      v-else-if="state.type === 'Error'"
      class="flex-1 flex flex-col items-center justify-center gap-2"
    >
      <i class="fas fa-exclamation-triangle text-red-400 text-xl" />
      <span class="text-red-400 text-sm break-all select-text">{{
        state.error
      }}</span>
      <Button
        label="Retry"
        icon="fas fa-redo"
        size="small"
        severity="contrast"
        @click="runAnalysis"
      />
    </div>

    <template v-else-if="state.type === 'Success'">
      <div class="flex items-center gap-3 mb-3 text-sm text-surface-300">
        <span>{{ totalMatches }} matches found</span>
        <Button
          label="Re-analyze"
          icon="fas fa-redo"
          text
          size="small"
          severity="secondary"
          @click="runAnalysis"
        />
      </div>

      <div v-if="grouped.length === 0" class="text-center py-4">
        <i class="fas fa-check-circle text-green-500 text-lg mb-1" />
        <p class="text-surface-400 text-sm">No matches found.</p>
      </div>

      <Panel v-for="group in grouped" :key="group.kind" toggleable class="mb-2">
        <template #header>
          <div class="flex items-center gap-2 flex-1">
            <i :class="group.icon" class="text-surface-400" />
            <span class="text-sm text-surface-200">{{ group.label }}</span>
            <span class="text-xs text-surface-500">
              ({{ group.matches.length }})
            </span>
            <div class="ml-auto">
              <Button
                v-tooltip.top="'Copy All'"
                icon="fas fa-copy"
                text
                size="small"
                severity="secondary"
                @click.stop="handleCopyAll(group.matches)"
              />
            </div>
          </div>
        </template>
        <MatchRow
          v-for="(match, idx) in group.matches"
          :key="idx"
          :match="match"
        />
      </Panel>
    </template>
  </div>
</template>
