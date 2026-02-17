import { Classic } from "@caido/primevue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import { ALL_ANALYZER_KINDS } from "shared";
import { createApp } from "vue";

import ResponseViewModeContainer from "./components/ResponseViewMode/Container.vue";
import ScanResultDialogContainer from "./components/ScanResultDialog/Container.vue";
import { highlightMatchesExtension } from "./extensions/highlightMatches";
import { SDKPlugin } from "./plugins/sdk";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import App from "./views/App.vue";

const Commands = {
  runPassiveScan: "js-analyzer.run-passive-scan",
} as const;

function isJsResponse(contentType: string, path: string): boolean {
  const ct = contentType.toLowerCase();
  if (
    ct.includes("javascript") ||
    ct.includes("application/json") ||
    ct.includes("text/json")
  ) {
    return true;
  }
  const cleanPath = path.split("?")[0] ?? path;
  return /\.(js|mjs|cjs|json|map)$/i.test(cleanPath);
}

export const init = (sdk: FrontendSDK) => {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  });
  app.use(SDKPlugin, sdk);

  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });
  root.id = "plugin--frontend-vue";

  app.mount(root);

  sdk.navigation.addPage("/js-analyzer", {
    body: root,
  });

  sdk.sidebar.registerItem("JS Analyzer", "/js-analyzer", {
    icon: "fas fa-file-code",
  });

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

  sdk.httpHistory.addResponseViewMode({
    label: "JS Analysis",
    view: { component: ResponseViewModeContainer },
    when: (_response, request) => {
      const path = request.path ?? "";
      return isJsResponse("", path);
    },
  });

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
