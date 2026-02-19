import { storeToRefs } from "pinia";
import type { AnalyzerKind, JsAnalyzerFilter } from "shared";
import { computed, ref } from "vue";

import { useSDK } from "@/plugins/sdk";
import { useScannerRepository } from "@/repositories/scanner";
import { useAssetsState } from "@/stores/scanner/useAssetsState";
import { useScanState } from "@/stores/scanner/useScanState";
import { useSelectionState } from "@/stores/scanner/useSelectionState";

export type BodyState =
  | { type: "Idle" }
  | { type: "Loading" }
  | { type: "Error"; error: string }
  | { type: "Ready"; body: string };

export function useScannerService() {
  const sdk = useSDK();
  const repo = useScannerRepository();
  const assetsStore = useAssetsState();
  const scanStore = useScanState();
  const selectionStore = useSelectionState();

  const assetsState = storeToRefs(assetsStore).state;
  const scanState = storeToRefs(scanStore).state;
  const selectedAssetIndex = storeToRefs(selectionStore).selectedAssetIndex;

  const bodyState = ref<BodyState>({ type: "Idle" });
  let scanGeneration = 0;

  const selectedAsset = computed(() => {
    const s = assetsState.value;
    if (s.type !== "Success") return undefined;
    const idx = selectedAssetIndex.value;
    if (idx === undefined) return undefined;
    return s.assets[idx];
  });

  async function loadAssets(filter: JsAnalyzerFilter) {
    assetsStore.setLoading();
    selectionStore.clearSelection();
    bodyState.value = { type: "Idle" };
    const result = await repo.getStaticAssets(filter);
    if (result.kind === "Error") {
      assetsStore.setError(result.error);
      return;
    }
    assetsStore.setSuccess(result.value);
  }

  async function fetchBody(requestId: string) {
    bodyState.value = { type: "Loading" };
    const result = await repo.getResponseBody(requestId);
    if (result.kind === "Error") {
      bodyState.value = { type: "Error", error: result.error };
      return;
    }
    bodyState.value = { type: "Ready", body: result.value.body };
  }

  async function runScan(requestIds: string[], analyzers: AnalyzerKind[]) {
    const myGeneration = ++scanGeneration;
    scanStore.setScanning();
    const subscription = sdk.backend.onEvent("scan-progress", (data) => {
      if (myGeneration !== scanGeneration) return;
      if (data.scanId !== undefined) {
        scanStore.setScanId(data.scanId);
      }
      scanStore.setScanProgress(data);
    });
    const result = await repo.runPassiveScan(requestIds, analyzers);
    subscription.stop();
    if (myGeneration !== scanGeneration) return;
    if (result.kind === "Error") {
      scanStore.setError(result.error);
      return;
    }
    scanStore.setComplete(result.value);
  }

  async function cancelScan() {
    const s = scanState.value;
    if (s.type !== "Scanning") return;
    const scanId = s.scanId;
    scanGeneration++;
    scanStore.reset();
    if (scanId !== undefined) {
      await repo.cancelScan(scanId);
    }
  }

  function selectFile(index: number | undefined) {
    selectionStore.selectFile(index);
  }

  return {
    assetsState,
    scanState,
    bodyState,
    selectedAsset,
    selectedAssetIndex,
    loadAssets,
    fetchBody,
    runScan,
    cancelScan,
    selectFile,
  };
}
