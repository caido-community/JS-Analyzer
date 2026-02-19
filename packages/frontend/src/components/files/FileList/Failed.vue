<script setup lang="ts">
import Button from "primevue/button";

defineOptions({ name: "FileListFailed" });

defineProps<{
  error: string;
}>();

const emit = defineEmits<{
  retry: [];
}>();
</script>

<template>
  <div class="flex-1 flex items-center justify-center p-4">
    <div class="text-center">
      <i class="fas fa-exclamation-triangle text-red-400 text-sm mb-1.5" />
      <p class="text-surface-400 text-xs mb-2">{{ error }}</p>
      <Button
        label="Retry"
        size="small"
        severity="secondary"
        icon="fas fa-redo"
        class="!text-xs"
        @click="emit('retry')"
      />
    </div>
  </div>
</template>
