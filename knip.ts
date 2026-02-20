import type { RawConfigurationOrFn } from "knip/dist/types/config.js";

const config: RawConfigurationOrFn = {
  ignoreIssues: {
    "packages/frontend/src/composables/useScanResults.ts": ["exports", "types"],
    "packages/backend/src/analyzers/index.ts": ["exports", "types"],
    "packages/backend/src/analyzers/runPassiveScan.ts": ["exports", "types"],
    "packages/backend/src/analyzers/types.ts": ["exports", "types"],
    "packages/backend/src/analyzers/patterns/cloudPatterns.ts": ["exports", "types"],
    "packages/backend/src/analyzers/patterns/secretPatterns.ts": ["exports", "types"],
    "packages/backend/src/events/eventBus.ts": ["exports"],
    "packages/backend/src/events/index.ts": ["exports"],
    "packages/backend/src/errors/index.ts": ["exports"],
    "packages/backend/src/services/autoScanService.ts": ["exports"],
    "packages/backend/src/services/scanService.ts": ["exports"],
    "packages/backend/src/services/npmVerifier.ts": ["exports"],
  },
  workspaces: {
    ".": {
      entry: ["caido.config.ts", "eslint.config.mjs"],
    },
    "packages/backend": {
      entry: ["src/index.ts"],
      project: ["src/**/*.ts"],
      ignoreDependencies: ["caido"],
    },
    "packages/frontend": {
      entry: ["src/index.ts"],
      project: ["src/**/*.{ts,tsx,vue}"],
      ignoreDependencies: ["@caido/primevue"],
    },
    "packages/shared": {
      entry: ["src/index.ts"],
      project: ["src/**/*.ts"],
    },
  },
};

export default config;
