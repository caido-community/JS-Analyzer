import type { Result, UserConfig } from "shared";

import { useSDK } from "@/plugins/sdk";

export function useConfigRepository() {
  const sdk = useSDK();

  async function getConfig(): Promise<Result<UserConfig>> {
    return await sdk.backend.getConfig();
  }

  async function updateConfig(
    update: Partial<UserConfig>,
  ): Promise<Result<UserConfig>> {
    return await sdk.backend.updateConfig(update);
  }

  return {
    getConfig,
    updateConfig,
  };
}
