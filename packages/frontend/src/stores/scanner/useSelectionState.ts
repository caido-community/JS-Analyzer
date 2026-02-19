import { defineStore } from "pinia";
import { ref } from "vue";

export const useSelectionState = defineStore("scanner.selection", () => {
  const selectedAssetIndex = ref<number | undefined>(undefined);

  function selectFile(index: number | undefined) {
    selectedAssetIndex.value = index;
  }

  function clearSelection() {
    selectedAssetIndex.value = undefined;
  }

  return { selectedAssetIndex, selectFile, clearSelection };
});
