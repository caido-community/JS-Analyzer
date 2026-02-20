<script setup lang="ts">
import Button from "primevue/button";
import Panel from "primevue/panel";
import SplitButton from "primevue/splitbutton";
import type { ScanResult } from "shared";
import { computed, ref, toRef } from "vue";

import MatchRow from "./MatchRow.vue";
import ResponsePreview from "./ResponsePreview.vue";
import ResultSummary from "./ResultSummary.vue";

import {
  buildFindingDedupeKey,
  buildFindingDescription,
  buildFindingTitle,
  copyAllMatches,
  downloadFile,
  exportToCsv,
  exportToJson,
  type MatchWithSource,
  useScanResults,
} from "@/composables/useScanResults";
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

const exportMenuItems = [
  {
    label: "Export CSV",
    icon: "fas fa-file-csv",
    command: () => {
      const csv = exportToCsv(grouped.value);
      downloadFile(csv, `js-analyzer-${props.scanResult.id}.csv`);
      props.sdk.window.showToast("Exported to CSV", {
        variant: "success",
        duration: 1500,
      });
    },
  },
  {
    label: "Export JSON",
    icon: "fas fa-file-code",
    command: () => {
      const json = exportToJson(props.scanResult);
      downloadFile(json, `js-analyzer-${props.scanResult.id}.json`);
      props.sdk.window.showToast("Exported to JSON", {
        variant: "success",
        duration: 1500,
      });
    },
  },
];

function onExportCsv() {
  const csv = exportToCsv(grouped.value);
  downloadFile(csv, `js-analyzer-${props.scanResult.id}.csv`);
  props.sdk.window.showToast("Exported to CSV", {
    variant: "success",
    duration: 1500,
  });
}

async function handleReport(match: MatchWithSource) {
  if (match.requestId === "inline") return;
  const title = buildFindingTitle(match);
  const description = buildFindingDescription(match, match.sourceUrl);
  const dedupeKey = buildFindingDedupeKey(
    match.requestId,
    match.analyzerKind,
    match.value,
  );
  const result = await props.sdk.findings.createFinding(match.requestId, {
    title,
    description,
    reporter: "JS Analyzer",
    dedupeKey,
  });
  if (result !== undefined) {
    props.sdk.window.showToast("Reported to Findings", {
      variant: "success",
      duration: 1500,
    });
  } else {
    props.sdk.window.showToast("Finding already exists", {
      variant: "info",
      duration: 1500,
    });
  }
}

async function handleReportAll(matches: MatchWithSource[]) {
  const reportable = matches.filter((m) => m.requestId !== "inline");
  if (reportable.length === 0) {
    props.sdk.window.showToast("No reportable matches (inline scan)", {
      variant: "info",
      duration: 1500,
    });
    return;
  }
  let reported = 0;
  let skipped = 0;
  for (const match of reportable) {
    const dedupeKey = buildFindingDedupeKey(
      match.requestId,
      match.analyzerKind,
      match.value,
    );
    const result = await props.sdk.findings.createFinding(match.requestId, {
      title: buildFindingTitle(match),
      description: buildFindingDescription(match, match.sourceUrl),
      reporter: "JS Analyzer",
      dedupeKey,
    });
    if (result !== undefined) {
      reported++;
    } else {
      skipped++;
    }
  }
  const msg =
    skipped > 0
      ? `Reported ${reported} to Findings (${skipped} already existed)`
      : `Reported ${reported} to Findings`;
  props.sdk.window.showToast(msg, {
    variant: "success",
    duration: 2000,
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
    <ResultSummary :scan-result="props.scanResult" :duration="duration">
      <template #actions>
        <SplitButton
          v-if="grouped.length > 0"
          label="Export"
          icon="fas fa-download"
          :model="exportMenuItems"
          size="small"
          :base-z-index="10000"
          class="ml-2"
          @click="onExportCsv"
        />
      </template>
    </ResultSummary>

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
              <div class="ml-auto flex items-center gap-0.5">
                <Button
                  v-tooltip.top="'Copy All'"
                  icon="fas fa-copy"
                  text
                  size="small"
                  severity="secondary"
                  class="!w-6 !h-6"
                  @click.stop="handleCopyAll(group.matches)"
                />
                <Button
                  v-if="group.matches.some((m) => m.requestId !== 'inline')"
                  v-tooltip.top="'Report All to Findings'"
                  icon="fas fa-flag"
                  text
                  size="small"
                  severity="secondary"
                  class="!w-6 !h-6"
                  @click.stop="handleReportAll(group.matches)"
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
            :show-report="match.requestId !== 'inline'"
            @show-in-response="handleMatchClick(match)"
            @report="handleReport"
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
