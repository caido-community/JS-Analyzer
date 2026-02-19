import type { SDK } from "caido:plugin";
import type { Result } from "shared";

import type { API, BackendEvents } from "../index";
import { beautifyJs, isMinified } from "../services/beautifyService";

export async function getResponseBody(
  sdk: SDK<API, BackendEvents>,
  requestId: string,
): Promise<Result<{ body: string }>> {
  if (requestId.length === 0) {
    return { kind: "Error", error: "requestId is required" };
  }

  const reqRes = await sdk.requests.get(requestId);
  if (reqRes === undefined) {
    return { kind: "Error", error: `Request ${requestId} not found` };
  }

  const { response } = reqRes;
  if (response === undefined) {
    return { kind: "Error", error: `No response for request ${requestId}` };
  }

  const rawBody = response.getBody();
  if (rawBody === undefined) {
    return { kind: "Ok", value: { body: "" } };
  }

  const raw = rawBody.toText();
  const body = isMinified(raw) ? beautifyJs(raw) : raw;

  return { kind: "Ok", value: { body } };
}
