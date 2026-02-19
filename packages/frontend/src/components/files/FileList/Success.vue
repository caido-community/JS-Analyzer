<script setup lang="ts">
import InputText from "primevue/inputtext";
import type { StaticAssetEntry } from "shared";

import { useFileList } from "./useFileList";

defineOptions({ name: "FileListSuccess" });

const props = defineProps<{
  assets: StaticAssetEntry[];
  selectedIndex: number | undefined;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();

const { searchQuery, groups, totalFileCount, isExpanded, toggleHost } =
  useFileList(() => props.assets);
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div
      class="px-1.5 py-1 border-b border-surface-700 shrink-0 flex items-center gap-1"
    >
      <InputText
        v-model="searchQuery"
        placeholder="Search files..."
        class="flex-1 !text-xs !py-1"
      />
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
      <div v-for="group in groups" :key="group.host">
        <button
          class="w-full flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-surface-400 hover:bg-surface-700/40 cursor-pointer select-none min-w-0"
          @click="toggleHost(group.host)"
        >
          <i
            class="fas text-[7px] w-2.5 text-center shrink-0"
            :class="
              isExpanded(group.host) ? 'fa-chevron-down' : 'fa-chevron-right'
            "
          />
          <i class="fas fa-globe text-[9px] shrink-0" />
          <span class="font-medium truncate">{{ group.host }}</span>
          <span class="text-surface-500 shrink-0"
            >({{ group.files.length }})</span
          >
        </button>
        <template v-if="isExpanded(group.host)">
          <button
            v-for="file in group.files"
            :key="file.index"
            class="file-row"
            :class="
              file.index === props.selectedIndex
                ? 'text-primary-400 bg-primary-500/10'
                : 'text-surface-300'
            "
            @click="emit('select', file.index)"
          >
            <i class="fas fa-file-code text-[9px] text-surface-500 shrink-0" />
            <span class="file-name break-all">{{ file.path }}</span>
          </button>
        </template>
      </div>
    </div>

    <div
      class="px-1.5 py-0.5 border-t border-surface-700 text-[10px] text-surface-500 shrink-0"
    >
      {{ totalFileCount }} files
    </div>
  </div>
</template>

<style scoped>
.file-row {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  min-width: 0;
  padding: 2px 6px;
  font-size: 11px;
  cursor: pointer;
  overflow: hidden;
}
.file-row:hover {
  background-color: rgba(255, 255, 255, 0.04);
}
.file-name {
  min-width: 0;
  line-height: 1.3;
}
</style>
