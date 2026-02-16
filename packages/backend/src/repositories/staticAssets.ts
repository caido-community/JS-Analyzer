import type { SDK } from "caido:plugin";
import type { Cursor } from "caido:utils";
import type { JsAnalyzerFilter, StaticAssetEntry } from "shared";

import { isStaticAsset, QUERY_PAGE_SIZE } from "../constants";
import type { API, BackendEvents } from "../index";

export async function getStaticAssetsFromHistory(
  sdk: SDK<API, BackendEvents>,
  filter: JsAnalyzerFilter,
): Promise<StaticAssetEntry[]> {
  const assets: StaticAssetEntry[] = [];
  let cursor: Cursor | undefined;

  while (true) {
    let query = sdk.requests.query().first(QUERY_PAGE_SIZE);

    if (filter.httpqlFilter !== undefined && filter.httpqlFilter !== "") {
      query = query.filter(filter.httpqlFilter);
    }

    query = query.ascending("req", "created_at");

    if (cursor !== undefined) {
      query = query.after(cursor);
    }

    const page = await query.execute();

    for (const item of page.items) {
      const { request, response } = item;

      if (response === undefined) continue;

      if (filter.inScopeOnly && !sdk.requests.inScope(request)) {
        continue;
      }

      const contentTypeHeader = response.getHeader("content-type");
      const contentType =
        contentTypeHeader !== undefined && contentTypeHeader.length > 0
          ? contentTypeHeader[0]!
          : "";

      const url = request.getUrl();

      if (!isStaticAsset(contentType, url)) continue;

      const body = response.getBody();
      const size = body !== undefined ? body.toRaw().length : 0;

      assets.push({
        requestId: request.getId() as string,
        responseId: response.getId() as string,
        url,
        host: request.getHost(),
        path: request.getPath(),
        contentType,
        size,
      });
    }

    if (page.pageInfo.hasNextPage) {
      cursor = page.pageInfo.endCursor;
    } else {
      break;
    }
  }

  return assets;
}
