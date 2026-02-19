import { defineStore } from "pinia";
import type { ScanProgressEvent, ScanResult } from "shared";
import { ref } from "vue";

export type ScanState =
  | { type: "Idle" }
  | { type: "Scanning"; scanId?: string; progress?: ScanProgressEvent }
  | { type: "Error"; error: string }
  | { type: "Complete"; result: ScanResult };

export const useScanState = defineStore("scanner.scan", () => {
  const state = ref<ScanState>({ type: "Idle" });

  function setScanning() {
    state.value = { type: "Scanning" };
  }

  function setScanId(scanId: string) {
    if (state.value.type === "Scanning") {
      state.value = { ...state.value, scanId };
    }
  }

  function setScanProgress(progress: ScanProgressEvent) {
    if (state.value.type === "Scanning") {
      state.value = { ...state.value, progress };
    }
  }

  function setError(error: string) {
    state.value = { type: "Error", error };
  }

  function setComplete(result: ScanResult) {
    state.value = { type: "Complete", result };
  }

  function reset() {
    state.value = { type: "Idle" };
  }

  return {
    state,
    setScanning,
    setScanId,
    setScanProgress,
    setError,
    setComplete,
    reset,
  };
});
