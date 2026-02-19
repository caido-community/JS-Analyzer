<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";

import { highlightBodyAtOffset } from "./useScanResults";

const props = defineProps<{
  body: string;
  highlightStart?: number;
  highlightEnd?: number;
}>();

defineOptions({ name: "ResponsePreview" });

const preRef = ref<HTMLPreElement>();

const rendered = computed(() => {
  if (props.highlightStart !== undefined && props.highlightEnd !== undefined) {
    return highlightBodyAtOffset(
      props.body,
      props.highlightStart,
      props.highlightEnd,
    );
  }
  return props.body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
});

watch(
  () => props.highlightStart,
  async () => {
    await nextTick();
    const mark = preRef.value?.querySelector(".js-analyzer-mark");
    if (mark !== undefined && mark !== null) {
      mark.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  },
);
</script>

<template>
  <div class="h-full flex flex-col bg-surface-900 rounded overflow-hidden">
    <div
      class="px-2 py-1 bg-surface-800 text-surface-500 text-[10px] font-medium border-b border-surface-700 shrink-0"
    >
      Response Body
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <pre
      ref="preRef"
      class="flex-1 overflow-auto p-2 m-0 text-[11px] text-surface-300 leading-snug whitespace-pre-wrap break-all select-text cursor-text font-mono"
      v-html="rendered"
    />
  </div>
</template>

<style scoped>
:deep(.js-analyzer-mark) {
  background-color: rgba(250, 204, 21, 0.35);
  border-radius: 2px;
  padding: 1px 0;
}
</style>
