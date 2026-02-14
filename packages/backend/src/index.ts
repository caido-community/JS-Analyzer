import type { DefineAPI, DefineEvents, SDK } from "caido:plugin";
import type {
  AssetDetectedEvent,
  Result,
  ScanCompleteEvent,
  ScanProgressEvent,
} from "shared";

export type BackendEvents = DefineEvents<{
  "scan-progress": (data: ScanProgressEvent) => void;
  "scan-complete": (data: ScanCompleteEvent) => void;
  "asset-detected": (data: AssetDetectedEvent) => void;
}>;

function ping(): Result<{ ok: true }> {
  return { kind: "Ok", value: { ok: true } };
}

export type API = DefineAPI<{
  ping: typeof ping;
}>;

export function init(sdk: SDK<API, BackendEvents>) {
  sdk.api.register("ping", ping);
}
