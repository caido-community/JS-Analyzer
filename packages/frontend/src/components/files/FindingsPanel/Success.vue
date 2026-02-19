<script setup lang="ts">
import Button from "primevue/button";
import Panel from "primevue/panel";
import type { AnalyzerMatch } from "shared";

import type { FindingsGroup } from "./useFindingsPanel";

import MatchRow from "@/components/ScanResultDialog/MatchRow.vue";
import { copyAllMatches } from "@/components/ScanResultDialog/useScanResults";
import { useSDK } from "@/plugins/sdk";

defineOptions({ name: "FindingsPanelSuccess" });

const props = defineProps<{
  groups: FindingsGroup[];
  totalMatches: number;
}>();

const emit = defineEmits<{
  highlight: [match: AnalyzerMatch];
}>();

const sdk = useSDK();

async function handleCopyAll(matches: AnalyzerMatch[]) {
  const text = copyAllMatches(
    matches.map((m) => ({
      ...m,
      sourceUrl: "",
      requestId: "",
      entryIndex: 0,
    })),
  );
  await navigator.clipboard.writeText(text);
  sdk.window.showToast(`Copied ${matches.length} values`, {
    variant: "info",
    duration: 1500,
  });
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div
      v-if="props.groups.length === 0"
      class="flex-1 flex items-center justify-center text-surface-500 text-xs"
    >
      <div class="text-center">
        <i class="fas fa-check-circle text-green-500 text-sm mb-1" />
        <p>No matches found for this file</p>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto p-1">
      <Panel
        v-for="group in props.groups"
        :key="group.kind"
        toggleable
        class="mb-1"
      >
        <template #header>
          <div class="flex items-center gap-1.5 flex-1">
            <i :class="group.icon" class="text-surface-400 text-[11px]" />
            <span class="text-xs text-surface-200">{{ group.label }}</span>
            <span class="text-[10px] text-surface-500"
              >({{ group.matches.length }})</span
            >
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
          :show-navigate="true"
          @show-in-response="emit('highlight', match)"
        />
      </Panel>
    </div>

    <div
      class="px-2 py-1 border-t border-surface-700 text-[10px] text-surface-500 shrink-0"
    >
      {{ props.totalMatches }} matches
    </div>
  </div>
</template>
