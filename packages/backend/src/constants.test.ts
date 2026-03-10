import { describe, expect, it } from "vitest";

import { isStaticAsset } from "./constants";

describe("isStaticAsset", () => {
  it("matches JavaScript content types", () => {
    expect(isStaticAsset("application/javascript", "/app.js")).toBe(true);
    expect(isStaticAsset("text/javascript", "/bundle.js")).toBe(true);
    expect(isStaticAsset("application/x-javascript", "/lib.js")).toBe(true);
  });

  it("matches JSON content type", () => {
    expect(isStaticAsset("application/json", "/data.json")).toBe(true);
  });

  it("matches by URL extension even with unknown content type", () => {
    expect(isStaticAsset("text/html", "/app.js")).toBe(true);
    expect(isStaticAsset("text/html", "/module.mjs")).toBe(true);
    expect(isStaticAsset("text/html", "/common.cjs")).toBe(true);
    expect(isStaticAsset("text/html", "/config.json")).toBe(true);
    expect(isStaticAsset("text/html", "/app.js.map")).toBe(true);
  });

  it("matches text/plain when URL suggests static asset", () => {
    expect(isStaticAsset("text/plain", "/bundle.js")).toBe(true);
    expect(isStaticAsset("text/plain", "/data.json")).toBe(true);
  });

  it("rejects non-static assets", () => {
    expect(isStaticAsset("text/html", "/index.html")).toBe(false);
    expect(isStaticAsset("text/css", "/styles.css")).toBe(false);
    expect(isStaticAsset("image/png", "/logo.png")).toBe(false);
    expect(isStaticAsset("text/plain", "/readme.txt")).toBe(false);
  });

  it("handles content type with charset", () => {
    expect(
      isStaticAsset("application/javascript; charset=utf-8", "/app.js"),
    ).toBe(true);
  });

  it("strips query strings from URL for extension check", () => {
    expect(isStaticAsset("text/html", "/app.js?v=123")).toBe(true);
    expect(isStaticAsset("text/html", "/index.html?v=123")).toBe(false);
  });

  it("strips hash from URL for extension check", () => {
    expect(isStaticAsset("text/html", "/app.js#section")).toBe(true);
  });
});
