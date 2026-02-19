import type { SDK } from "caido:plugin";
import type { Result, UserConfig } from "shared";

import type { API, BackendEvents } from "../index";
import { getConfigStore } from "../stores";
import { configUpdateSchema } from "../validation/schemas";

export function getConfig(_sdk: SDK<API, BackendEvents>): Result<UserConfig> {
  const config = getConfigStore().get();
  return { kind: "Ok", value: config };
}

export function updateConfig(
  _sdk: SDK<API, BackendEvents>,
  update: Partial<UserConfig>,
): Result<UserConfig> {
  const parsed = configUpdateSchema.safeParse(update);
  if (!parsed.success) {
    return { kind: "Error", error: parsed.error.message };
  }

  const store = getConfigStore();
  store.update((current) => ({ ...current, ...parsed.data }));
  return { kind: "Ok", value: store.get() };
}
