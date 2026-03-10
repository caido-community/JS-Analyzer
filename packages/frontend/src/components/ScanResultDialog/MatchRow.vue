<script setup lang="ts">
import Button from "primevue/button";
import Tag from "primevue/tag";
import type { AnalyzerMatch } from "shared";
import { ref } from "vue";

import type { MatchWithSource } from "@/composables/useScanResults";

const props = defineProps<{
  match: MatchWithSource;
  sourceUrl?: string;
  showNavigate?: boolean;
  showReport?: boolean;
}>();

const emit = defineEmits<{
  showInResponse: [match: AnalyzerMatch];
  report: [match: MatchWithSource];
}>();

defineOptions({ name: "MatchRow" });

const copied = ref(false);

function confidenceSeverity(
  confidence: string,
): "danger" | "warn" | "secondary" {
  switch (confidence) {
    case "high":
      return "danger";
    case "medium":
      return "warn";
    default:
      return "secondary";
  }
}

async function copyValue() {
  await navigator.clipboard.writeText(props.match.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
}
</script>

<template>
  <div
    class="flex items-center gap-2 px-2 py-1 border-b border-surface-700/50 hover:bg-surface-700/30 select-text text-xs"
  >
    <div class="flex-1 min-w-0">
      <code
        class="text-[11px] text-surface-200 break-all select-text cursor-text leading-tight"
      >
        {{ props.match.value }}
      </code>
      <div
        v-if="props.sourceUrl !== undefined && props.sourceUrl.length > 0"
        class="text-[10px] text-surface-500 truncate"
      >
        {{ props.sourceUrl }}
      </div>
    </div>
    <Tag
      :value="props.match.confidence"
      :severity="confidenceSeverity(props.match.confidence)"
      class="text-[10px] shrink-0 !py-0 !px-1.5"
    />
    <Button
      v-tooltip.top="copied ? 'Copied!' : 'Copy'"
      :icon="copied ? 'fas fa-check' : 'fas fa-copy'"
      text
      size="small"
      :severity="copied ? 'success' : 'secondary'"
      class="shrink-0 !w-6 !h-6"
      @click="copyValue"
    />
    <Button
      v-if="props.showNavigate === true"
      v-tooltip.top="'Show in Response'"
      icon="fas fa-crosshairs"
      text
      size="small"
      severity="secondary"
      class="shrink-0 !w-6 !h-6"
      @click="emit('showInResponse', props.match)"
    />
    <Button
      v-if="props.showReport === true"
      v-tooltip.top="'Report to Findings'"
      icon="fas fa-flag"
      text
      size="small"
      severity="secondary"
      class="shrink-0 !w-6 !h-6"
      @click="emit('report', props.match)"
    />
  </div>
</template>
