import { defineStore } from "pinia";
import type { StaticAssetEntry } from "shared";
import { ref } from "vue";

export type AssetsState =
  | { type: "Idle" }
  | { type: "Loading" }
  | { type: "Error"; error: string }
  | { type: "Success"; assets: StaticAssetEntry[] };

export const useAssetsState = defineStore("scanner.assets", () => {
  const state = ref<AssetsState>({ type: "Idle" });

  function setLoading() {
    state.value = { type: "Loading" };
  }

  function setError(error: string) {
    state.value = { type: "Error", error };
  }

  function setSuccess(assets: StaticAssetEntry[]) {
    state.value = { type: "Success", assets };
  }

  function reset() {
    state.value = { type: "Idle" };
  }

  return { state, setLoading, setError, setSuccess, reset };
});
