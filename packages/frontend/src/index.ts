import { ALL_ANALYZER_KINDS } from "shared";

import ResponseViewModeContainer from "./components/ResponseViewMode/Container.vue";
import ScanResultDialogContainer from "./components/ScanResultDialog/Container.vue";
import { highlightMatchesExtension } from "./extensions/highlightMatches";
import "./styles/index.css";
import type { FrontendSDK } from "./types";

const Commands = {
  runPassiveScan: "js-analyzer.run-passive-scan",
} as const;

function isJsResponse(path: string): boolean {
  const cleanPath = path.split("?")[0] ?? path;
  return /\.(js|mjs|cjs|json|map)$/i.test(cleanPath);
}

export const init = (sdk: FrontendSDK) => {
  sdk.commands.register(Commands.runPassiveScan, {
    name: "Run JS Analyzer - Passive scan",
    group: "JS Analyzer",
    run: async (context) => {
      const requestIds = collectRequestIds(context);
      if (requestIds.length === 0) {
        sdk.window.showToast("No requests selected", { variant: "warning" });
        return;
      }

      sdk.window.showToast(`Scanning ${requestIds.length} request(s)...`, {
        variant: "info",
        duration: 2000,
      });

      const result = await sdk.backend.runPassiveScan(
        requestIds,
        ALL_ANALYZER_KINDS,
      );

      if (result.kind === "Error") {
        sdk.window.showToast(result.error, { variant: "error" });
        return;
      }

      sdk.window.showToast(
        `Found ${result.value.totalMatches} matches in ${result.value.totalFiles} files`,
        { variant: "success" },
      );

      const dialog = sdk.window.showDialog(
        {
          component: ScanResultDialogContainer,
          props: { scanResult: result.value, sdk },
          events: { close: () => dialog.close() },
        },
        {
          title: "JS Analysis Results",
        },
      );
    },
  });

  sdk.menu.registerItem({
    type: "RequestRow",
    commandId: Commands.runPassiveScan,
    leadingIcon: "fas fa-file-code",
  });

  sdk.menu.registerItem({
    type: "Request",
    commandId: Commands.runPassiveScan,
    leadingIcon: "fas fa-file-code",
  });

  sdk.commandPalette.register(Commands.runPassiveScan);

  const jsAnalysisViewMode = {
    label: "JS Analysis",
    view: { component: ResponseViewModeContainer },
    when: (_response: unknown, request: { path?: string }) => {
      const path = request.path ?? "";
      return isJsResponse(path);
    },
  };

  sdk.httpHistory.addResponseViewMode(jsAnalysisViewMode);
  sdk.intercept.addResponseViewMode(jsAnalysisViewMode);
  sdk.replay.addResponseViewMode(jsAnalysisViewMode);
  sdk.sitemap.addResponseViewMode(jsAnalysisViewMode);

  sdk.httpHistory.addResponseEditorExtension(highlightMatchesExtension);
};

function collectRequestIds(context: unknown): string[] {
  const ctx = context as {
    type: string;
    requests?: Array<{ id: string }>;
    request?: { type?: string; id?: string };
  };
  if (ctx.type === "RequestRowContext" && ctx.requests !== undefined) {
    return ctx.requests.map((r) => r.id);
  }
  if (ctx.type === "RequestContext" && ctx.request !== undefined) {
    if (ctx.request.id !== undefined) {
      return [ctx.request.id];
    }
  }
  if (ctx.type === "ResponseContext" && ctx.request !== undefined) {
    if (ctx.request.id !== undefined) {
      return [ctx.request.id];
    }
  }
  return [];
}
