import type { SDK } from "caido:plugin";

import type { API, BackendEvents } from "./index";

type CaidoBackendSDK = SDK<API, BackendEvents>;

let sdkInstance: CaidoBackendSDK | undefined;

export function setSDK(sdk: CaidoBackendSDK): void {
  sdkInstance = sdk;
}

export function getSDK(): CaidoBackendSDK {
  if (sdkInstance === undefined) {
    throw new Error("SDK not initialized. Call setSDK() first.");
  }
  return sdkInstance;
}
