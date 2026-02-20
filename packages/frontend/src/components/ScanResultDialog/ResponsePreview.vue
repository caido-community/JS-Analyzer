<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";

import { getHighlightBodyParts } from "./useScanResults";

const props = defineProps<{
  body: string;
  highlightStart?: number;
  highlightEnd?: number;
  sourceUrl?: string;
}>();

defineOptions({ name: "ResponsePreview" });

const preRef = ref<HTMLPreElement>();

const parts = computed(() => {
  if (props.highlightStart !== undefined && props.highlightEnd !== undefined) {
    return getHighlightBodyParts(
      props.body,
      props.highlightStart,
      props.highlightEnd,
    );
  }
  return { escaped: props.body };
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
      class="px-2 py-1 bg-surface-800 text-surface-500 text-[10px] font-medium border-b border-surface-700 shrink-0 flex flex-col gap-0.5"
    >
      <span>Response Body</span>
      <span
        v-if="props.sourceUrl !== undefined && props.sourceUrl.length > 0"
        class="text-surface-400 truncate font-normal"
        :title="props.sourceUrl"
      >
        {{ props.sourceUrl }}
      </span>
    </div>
    <pre
      ref="preRef"
      class="flex-1 overflow-auto p-2 m-0 text-[11px] text-surface-300 leading-snug whitespace-pre-wrap break-all select-text cursor-text font-mono"
    ><template v-if="'highlight' in parts">{{ parts.before }}<mark class="js-analyzer-mark">{{ parts.highlight }}</mark>{{ parts.after }}</template><template v-else>{{ parts.escaped }}</template></pre>
  </div>
</template>

<style scoped>
:deep(.js-analyzer-mark) {
  background-color: rgba(250, 204, 21, 0.35);
  border-radius: 2px;
  padding: 1px 0;
}
</style>
