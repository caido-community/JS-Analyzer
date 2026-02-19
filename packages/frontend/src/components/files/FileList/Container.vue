<script setup lang="ts">
import Failed from "./Failed.vue";
import Loading from "./Loading.vue";
import Success from "./Success.vue";

import type { AssetsState } from "@/stores/scanner/useAssetsState";

defineOptions({ name: "FileList" });

defineProps<{
  state: AssetsState;
  selectedIndex: number | undefined;
}>();

const emit = defineEmits<{
  select: [index: number];
  retry: [];
}>();
</script>

<template>
  <div class="h-full flex flex-col">
    <Loading v-if="state.type === 'Loading'" />
    <Failed
      v-else-if="state.type === 'Error'"
      :error="state.error"
      @retry="emit('retry')"
    />
    <Success
      v-else-if="state.type === 'Success'"
      :assets="state.assets"
      :selected-index="selectedIndex"
      @select="(i) => emit('select', i)"
    />
    <div
      v-else
      class="flex-1 flex items-center justify-center text-surface-500 text-xs"
    >
      <p>Load assets to get started</p>
    </div>
  </div>
</template>
