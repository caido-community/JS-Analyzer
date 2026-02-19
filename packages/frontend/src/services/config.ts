import type { UserConfig } from "shared";
import { ref } from "vue";

import { useConfigRepository } from "@/repositories/config";

const config = ref<UserConfig | undefined>(undefined);

export function useConfigService() {
  const repo = useConfigRepository();

  async function load() {
    const result = await repo.getConfig();
    if (result.kind === "Error") return;
    config.value = result.value;
  }

  async function update(partial: Partial<UserConfig>) {
    const result = await repo.updateConfig(partial);
    if (result.kind === "Error") return;
    config.value = result.value;
  }

  return { config, load, update };
}
