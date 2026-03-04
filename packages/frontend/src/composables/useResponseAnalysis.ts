import type { ResponseFull } from "@caido/sdk-frontend";
import { ALL_ANALYZER_KINDS, type ScanResult } from "shared";
import { computed, onMounted, ref } from "vue";

import type { FrontendSDK } from "@/types";

type ViewState =
  | { type: "Idle" }
  | { type: "Loading" }
  | { type: "Error"; error: string }
  | { type: "Success"; data: ScanResult };

function extractResponseBody(raw: string): string {
  const separator = raw.indexOf("\r\n\r\n");
  if (separator !== -1) {
    return raw.slice(separator + 4);
  }
  const fallback = raw.indexOf("\n\n");
  if (fallback !== -1) {
    return raw.slice(fallback + 2);
  }
  return raw;
}

export function useResponseAnalysis(
  sdk: FrontendSDK,
  response: ResponseFull,
  requestId: string | undefined,
) {
  const state = ref<ViewState>({ type: "Idle" });

  const scanResult = computed<ScanResult>(() =>
    state.value.type === "Success"
      ? state.value.data
      : {
          id: "",
          status: "Complete",
          startedAt: "",
          completedAt: "",
          totalFiles: 0,
          totalMatches: 0,
          entries: [],
          analyzers: [],
        },
  );

  const totalMatches = computed(() => {
    if (state.value.type !== "Success") return 0;
    return state.value.data.totalMatches;
  });

  async function runAnalysis() {
    state.value = { type: "Loading" };
    try {
      const body = extractResponseBody(response.raw);
      if (body.length === 0) {
        state.value = { type: "Error", error: "Response body is empty" };
        return;
      }

      const result = await sdk.backend.runPassiveScanOnContent(
        body,
        "",
        ALL_ANALYZER_KINDS,
        requestId ?? "",
      );
      if (result.kind === "Error") {
        state.value = { type: "Error", error: result.error };
        return;
      }
      state.value = { type: "Success", data: result.value };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      state.value = { type: "Error", error: message };
    }
  }

  onMounted(() => {
    runAnalysis();
  });

  return {
    state,
    scanResult,
    totalMatches,
    runAnalysis,
  };
}
