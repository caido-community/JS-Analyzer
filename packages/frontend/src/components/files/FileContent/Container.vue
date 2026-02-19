<script setup lang="ts">
import type { AnalyzerMatch, StaticAssetEntry } from "shared";
import { nextTick, ref, watch } from "vue";

import { useSDK } from "@/plugins/sdk";
import type { BodyState } from "@/services/scanner";

defineOptions({ name: "FileContent" });

const props = defineProps<{
  asset: StaticAssetEntry | undefined;
  bodyState: BodyState;
  highlightMatch: AnalyzerMatch | undefined;
}>();

const sdk = useSDK();
const preRef = ref<HTMLPreElement>();
const currentContent = ref("");

function renderHighlight(match: AnalyzerMatch | undefined) {
  const el = preRef.value;
  if (el === undefined) return;

  el.textContent = currentContent.value;

  if (match === undefined) return;

  const from = match.rawStartOffset ?? match.startOffset;
  const to = match.rawEndOffset ?? match.endOffset;

  if (from < 0 || to <= from || to > currentContent.value.length) return;

  const textNode = el.firstChild;
  if (textNode === null) return;

  const range = document.createRange();
  range.setStart(textNode, from);
  range.setEnd(textNode, to);

  const mark = document.createElement("mark");
  mark.className = "js-highlight";
  range.surroundContents(mark);

  nextTick(() => {
    mark.scrollIntoView({ block: "center" });
  });
}

watch(
  () => props.bodyState,
  (newState) => {
    if (newState.type === "Ready") {
      currentContent.value = newState.body;
      nextTick(() => {
        renderHighlight(props.highlightMatch);
      });
    } else {
      currentContent.value = "";
    }
  },
);

watch(
  () => props.highlightMatch,
  (match) => {
    if (currentContent.value.length > 0) {
      renderHighlight(match);
    }
  },
);

async function copyContent() {
  if (currentContent.value.length === 0) return;
  await navigator.clipboard.writeText(currentContent.value);
  sdk.window.showToast("Copied to clipboard", {
    variant: "info",
    duration: 1500,
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<template>
  <div class="h-full flex flex-col bg-surface-900 overflow-hidden">
    <template v-if="props.asset !== undefined">
      <div
        class="px-2 py-1 bg-surface-800 text-[10px] border-b border-surface-700 shrink-0 flex items-center"
      >
        <div class="flex-1 min-w-0">
          <div class="text-surface-300 break-all leading-tight">
            {{ props.asset.url }}
          </div>
          <div class="flex items-center gap-3 mt-0.5">
            <span class="text-surface-500">{{
              formatSize(props.asset.size)
            }}</span>
            <span class="text-surface-500">{{ props.asset.contentType }}</span>
          </div>
        </div>
        <button
          v-if="props.bodyState.type === 'Ready'"
          class="text-surface-400 hover:text-surface-200 ml-2 shrink-0"
          title="Copy content"
          @click="copyContent"
        >
          <i class="fas fa-copy text-xs" />
        </button>
      </div>

      <div
        v-if="props.bodyState.type === 'Loading'"
        class="flex-1 flex items-center justify-center"
      >
        <i class="fas fa-spinner fa-spin text-surface-400 text-sm mr-1.5" />
        <span class="text-surface-500 text-xs">Loading content...</span>
      </div>

      <div
        v-else-if="props.bodyState.type === 'Error'"
        class="flex-1 flex items-center justify-center text-red-400 text-xs"
      >
        <i class="fas fa-exclamation-triangle mr-1.5" />
        {{ props.bodyState.error }}
      </div>

      <div
        v-else-if="props.bodyState.type === 'Ready'"
        class="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden"
      >
        <pre
          ref="preRef"
          class="file-pre text-[11px] font-mono text-surface-300 m-0 px-2 py-1 leading-relaxed"
        />
      </div>

      <div
        v-else
        class="flex-1 flex items-center justify-center text-surface-500 text-xs"
      >
        <p>Select a file to load its content</p>
      </div>
    </template>

    <div
      v-else
      class="flex-1 flex items-center justify-center text-surface-500 text-xs"
    >
      <div class="text-center">
        <i class="fas fa-file-code text-sm mb-1.5" />
        <p>Select a file to view its content</p>
      </div>
    </div>
  </div>
</template>

<style>
.file-pre {
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: anywhere;
}
.js-highlight {
  background-color: rgba(255, 200, 0, 0.3);
  border-radius: 2px;
  color: inherit;
}
</style>
