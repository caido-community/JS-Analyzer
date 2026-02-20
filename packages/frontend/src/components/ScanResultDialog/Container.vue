<script setup lang="ts">
import Button from "primevue/button";
import Panel from "primevue/panel";
import type { ScanResult } from "shared";
import { computed, ref, toRef } from "vue";

import MatchRow from "./MatchRow.vue";
import ResponsePreview from "./ResponsePreview.vue";
import ResultSummary from "./ResultSummary.vue";
import {
  copyAllMatches,
  type MatchWithSource,
  useScanResults,
} from "./useScanResults";

import type { FrontendSDK } from "@/types";

const props = defineProps<{
  scanResult: ScanResult;
  sdk: FrontendSDK;
}>();

const emit = defineEmits<{
  close: [];
}>();

defineOptions({ name: "ScanResultDialog" });

const { grouped, duration } = useScanResults(toRef(props, "scanResult"));

const activeMatch = ref<MatchWithSource>();
const splitPercent = ref(45);
const isDragging = ref(false);

const activeBody = computed(() => {
  if (activeMatch.value === undefined) return undefined;
  const entry = props.scanResult.entries[activeMatch.value.entryIndex];
  return entry?.responseBody;
});

const hasAnyBody = computed(() =>
  props.scanResult.entries.some(
    (e) => e.responseBody !== undefined && e.responseBody.length > 0,
  ),
);

function handleMatchClick(match: MatchWithSource) {
  activeMatch.value = match;
  props.sdk.httpHistory.scrollTo(match.requestId);
}

async function handleCopyAll(matches: MatchWithSource[]) {
  const text = copyAllMatches(matches);
  await navigator.clipboard.writeText(text);
  props.sdk.window.showToast(`Copied ${matches.length} values to clipboard`, {
    variant: "info",
    duration: 1500,
  });
}

function onDragStart(e: MouseEvent) {
  e.preventDefault();
  isDragging.value = true;
  const container = (e.target as HTMLElement).parentElement;
  if (container === null) return;
  const rect = container.getBoundingClientRect();

  const onMove = (moveEvent: MouseEvent) => {
    const x = moveEvent.clientX - rect.left;
    const percent = Math.round((x / rect.width) * 100);
    splitPercent.value = Math.max(25, Math.min(75, percent));
  };

  const onUp = () => {
    isDragging.value = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}
</script>

<template>
  <div
    class="flex flex-col"
    style="width: 90vw; max-width: 1200px; max-height: 80vh"
  >
    <ResultSummary :scan-result="props.scanResult" :duration="duration" />

    <div class="flex flex-1 min-h-0">
      <div
        class="overflow-y-auto p-2"
        :style="{ width: hasAnyBody ? `${splitPercent}%` : '100%' }"
      >
        <div v-if="grouped.length === 0" class="text-center py-6">
          <i class="fas fa-check-circle text-green-500 text-lg mb-1" />
          <p class="text-surface-400 text-xs">No matches found.</p>
        </div>

        <Panel
          v-for="group in grouped"
          :key="group.kind"
          toggleable
          class="mb-1"
        >
          <template #header>
            <div class="flex items-center gap-1.5 flex-1">
              <i :class="group.icon" class="text-surface-400 text-[11px]" />
              <span class="text-xs text-surface-200">
                {{ group.label }}
              </span>
              <span class="text-[10px] text-surface-500">
                ({{ group.matches.length }})
              </span>
              <div class="ml-auto">
                <Button
                  v-tooltip.top="'Copy All'"
                  icon="fas fa-copy"
                  text
                  size="small"
                  severity="secondary"
                  class="!w-6 !h-6"
                  @click.stop="handleCopyAll(group.matches)"
                />
              </div>
            </div>
          </template>
          <MatchRow
            v-for="(match, idx) in group.matches"
            :key="idx"
            :match="match"
            :source-url="
              props.scanResult.entries.length > 1 ? match.sourceUrl : undefined
            "
            :show-navigate="hasAnyBody"
            @show-in-response="handleMatchClick(match)"
          />
        </Panel>
      </div>

      <template v-if="hasAnyBody">
        <div
          class="w-1 shrink-0 cursor-col-resize hover:bg-primary-500/50 transition-colors"
          :class="isDragging ? 'bg-primary-500/50' : 'bg-surface-700'"
          @mousedown="onDragStart"
        />

        <div
          class="flex flex-col min-h-0"
          :style="{ width: `${100 - splitPercent}%` }"
        >
          <template
            v-if="activeBody !== undefined && activeMatch !== undefined"
          >
            <ResponsePreview
              :body="activeBody"
              :highlight-start="
                activeMatch.rawStartOffset ?? activeMatch.startOffset
              "
              :highlight-end="activeMatch.rawEndOffset ?? activeMatch.endOffset"
              :source-url="
                props.scanResult.entries.length > 1
                  ? activeMatch.sourceUrl
                  : undefined
              "
            />
          </template>
          <div
            v-else
            class="flex-1 flex items-center justify-center text-surface-500 text-xs"
          >
            <div class="text-center">
              <i class="fas fa-crosshairs text-sm mb-1.5" />
              <p>Click a match to preview it in the response</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
