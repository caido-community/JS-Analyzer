<script setup lang="ts">
import Button from "primevue/button";
import MenuBar from "primevue/menubar";
import { computed, ref } from "vue";

import Files from "@/views/Files.vue";
import Scans from "@/views/Scans.vue";
import Settings from "@/views/Settings.vue";

const page = ref<"Files" | "Scans" | "Settings">("Files");
const items = [
  {
    label: "Files",
    class: "mx-1",
    isActive: () => page.value === "Files",
    command: () => {
      page.value = "Files";
    },
  },
  {
    label: "Scans",
    class: "mx-1",
    isActive: () => page.value === "Scans",
    command: () => {
      page.value = "Scans";
    },
  },
  {
    label: "Settings",
    class: "mx-1",
    isActive: () => page.value === "Settings",
    command: () => {
      page.value = "Settings";
    },
  },
];

const component = computed(() => {
  switch (page.value) {
    case "Files":
      return Files;
    case "Scans":
      return Scans;
    case "Settings":
      return Settings;
    default:
      return undefined;
  }
});
</script>

<template>
  <div class="h-full flex flex-col gap-1">
    <MenuBar :model="items" class="h-12 gap-2 border-surface-700">
      <template #start>
        <div class="px-2 font-bold text-gray-300">JS Analyzer</div>
      </template>

      <template #item="{ item }">
        <Button
          :severity="item.isActive?.() ? 'secondary' : 'contrast'"
          :outlined="item.isActive?.()"
          size="small"
          :text="!item.isActive?.()"
          :label="item.label"
          class="!border-surface-700"
          @mousedown="item.command?.()"
        />
      </template>
    </MenuBar>
    <div class="flex-1 min-h-0">
      <component :is="component" />
    </div>
  </div>
</template>
