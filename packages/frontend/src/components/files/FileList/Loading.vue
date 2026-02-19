<script setup lang="ts">
defineOptions({ name: "FileListLoading" });
</script>

<template>
  <div class="flex-1 flex items-center justify-center p-4">
    <div class="text-center">
      <i class="fas fa-spinner fa-spin text-surface-400 text-sm mb-1.5" />
      <p class="text-surface-500 text-xs">Loading assets...</p>
    </div>
  </div>
</template>
