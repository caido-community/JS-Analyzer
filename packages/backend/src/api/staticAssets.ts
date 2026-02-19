import type { SDK } from "caido:plugin";
import type { JsAnalyzerFilter, Result, StaticAssetEntry } from "shared";

import type { API, BackendEvents } from "../index";
import { getStaticAssetsFromHistory } from "../repositories/staticAssets";
import { jsAnalyzerFilterSchema } from "../validation/schemas";

export async function getStaticAssets(
  sdk: SDK<API, BackendEvents>,
  filter: JsAnalyzerFilter,
): Promise<Result<StaticAssetEntry[]>> {
  const parsed = jsAnalyzerFilterSchema.safeParse(filter);
  if (!parsed.success) {
    return { kind: "Error", error: parsed.error.message };
  }

  const validatedFilter: JsAnalyzerFilter = {
    inScopeOnly: parsed.data.inScopeOnly,
    httpqlFilter: parsed.data.httpqlFilter,
  };

  try {
    const assets = await getStaticAssetsFromHistory(sdk, validatedFilter);
    return { kind: "Ok", value: assets };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      kind: "Error",
      error: `Failed to fetch static assets: ${message}`,
    };
  }
}
