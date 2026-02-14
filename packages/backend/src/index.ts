import type { DefineAPI, SDK } from "caido:plugin";

export type Result<T> =
  | { kind: "Ok"; value: T }
  | { kind: "Error"; error: string };

function ping(): Result<{ ok: true }> {
  return { kind: "Ok", value: { ok: true } };
}

export type API = DefineAPI<{
  ping: typeof ping;
}>;

export function init(sdk: SDK<API>) {
  sdk.api.register("ping", ping);
}
