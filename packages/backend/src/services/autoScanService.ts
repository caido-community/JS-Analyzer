import type { SDK } from "caido:plugin";
import type { Request, Response } from "caido:utils";

import { isStaticAsset } from "../constants";
import { emit } from "../events";
import type { API, BackendEvents } from "../index";
import { getConfigStore } from "../stores";

export function registerAutoScan(sdk: SDK<API, BackendEvents>): void {
  sdk.events.onInterceptResponse((_sdk, request, response) => {
    handleInterceptedResponse(sdk, request, response);
  });
}

function handleInterceptedResponse(
  sdk: SDK<API, BackendEvents>,
  request: Request,
  response: Response,
): void {
  const config = getConfigStore().get();

  if (!config.autoScanEnabled) return;

  const contentTypeHeader = response.getHeader("content-type");
  const contentType =
    contentTypeHeader !== undefined && contentTypeHeader.length > 0
      ? contentTypeHeader[0]!
      : "";

  const url = request.getUrl();

  if (!isStaticAsset(contentType, url)) return;

  if (config.inScopeOnly && !sdk.requests.inScope(request)) return;

  const host = request.getHost();

  emit("asset-detected", { url, host, contentType });

  sdk.api.send("asset-detected", { url, host, contentType });
}
