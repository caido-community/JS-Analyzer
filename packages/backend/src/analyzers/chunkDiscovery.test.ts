import { describe, expect, it } from "vitest";

import { analyzeChunkDiscovery } from "./chunkDiscovery";

describe("analyzeChunkDiscovery", () => {
  it("detects webpackJsonp", () => {
    const content = `(window.webpackJsonp = window.webpackJsonp || []).push([[0], {}])`;
    const matches = analyzeChunkDiscovery(content);
    expect(matches.some((m) => m.value.includes("webpackJsonp"))).toBe(true);
    expect(matches.some((m) => m.value.includes("webpack"))).toBe(true);
  });

  it("detects __webpack_require__", () => {
    const content = `var module = __webpack_require__(42);`;
    const matches = analyzeChunkDiscovery(content);
    expect(matches.some((m) => m.value.includes("__webpack_require__"))).toBe(
      true,
    );
    expect(matches[0]!.confidence).toBe("high");
  });

  it("detects webpack public path", () => {
    const content = `__webpack_require__.p = "/static/bundles/"`;
    const matches = analyzeChunkDiscovery(content);
    expect(matches.some((m) => m.value.includes("/static/bundles/"))).toBe(
      true,
    );
  });

  it("detects webpack chunk URL template", () => {
    const content = `script.src = "static/chunks/main.abc123.js"`;
    const matches = analyzeChunkDiscovery(content);
    expect(
      matches.some((m) => m.value.includes("static/chunks/main.abc123.js")),
    ).toBe(true);
  });

  it("detects Vite dynamic import", () => {
    const content = `const mod = import("./chunk-abc123.js")`;
    const matches = analyzeChunkDiscovery(content);
    expect(matches.some((m) => m.value.includes("Vite dynamic import"))).toBe(
      true,
    );
  });

  it("detects __vite_ssr_dynamic_import__", () => {
    const content = `__vite_ssr_dynamic_import__("./module")`;
    const matches = analyzeChunkDiscovery(content);
    expect(
      matches.some((m) => m.value.includes("__vite_ssr_dynamic_import__")),
    ).toBe(true);
  });

  it("detects Vite asset path", () => {
    const content = `var path = "/assets/index.a1b2c3d4.js";`;
    const matches = analyzeChunkDiscovery(content);
    expect(matches.some((m) => m.value.includes("Vite asset path"))).toBe(true);
  });

  it("detects Next.js chunk path", () => {
    const content = `script.src = "/_next/static/chunks/pages/index-abc123.js";`;
    const matches = analyzeChunkDiscovery(content);
    expect(matches.some((m) => m.value.includes("Next.js chunk path"))).toBe(
      true,
    );
    expect(matches.some((m) => m.value.includes("nextjs"))).toBe(true);
  });

  it("detects Next.js _buildManifest", () => {
    const content = `self.__BUILD_MANIFEST = { _buildManifest.js: true }`;
    const matches = analyzeChunkDiscovery(content);
    expect(matches.some((m) => m.value.includes("_buildManifest"))).toBe(true);
  });

  it("detects Next.js self.__next_f", () => {
    const content = `self.__next_f.push([1, "data"])`;
    const matches = analyzeChunkDiscovery(content);
    expect(matches.some((m) => m.value.includes("self.__next_f"))).toBe(true);
  });

  it("detects Nuxt.js _nuxt path", () => {
    const content = `var url = "/_nuxt/entry.abc123.js";`;
    const matches = analyzeChunkDiscovery(content);
    expect(matches.some((m) => m.value.includes("Nuxt.js _nuxt path"))).toBe(
      true,
    );
    expect(matches.some((m) => m.value.includes("nuxtjs"))).toBe(true);
  });

  it("detects Nuxt.js __NUXT__", () => {
    const content = `window.__NUXT__ = { data: [] };`;
    const matches = analyzeChunkDiscovery(content);
    expect(matches.some((m) => m.value.includes("__NUXT__"))).toBe(true);
  });

  it("detects Next.js page data", () => {
    const content = `fetch("/_next/data/build-id/page.json")`;
    const matches = analyzeChunkDiscovery(content);
    expect(matches.some((m) => m.value.includes("Next.js page data"))).toBe(
      true,
    );
  });

  it("returns correct offsets", () => {
    const content = `x;\n__webpack_require__(1)`;
    const matches = analyzeChunkDiscovery(content);
    const wpMatch = matches.find((m) =>
      m.value.includes("__webpack_require__"),
    );
    expect(wpMatch).toBeDefined();
    expect(wpMatch!.startOffset).toBe(3);
  });

  it("deduplicates at same offset", () => {
    const content = `__webpack_require__(1);`;
    const matches = analyzeChunkDiscovery(content);
    const wpMatches = matches.filter((m) =>
      m.value.includes("__webpack_require__"),
    );
    expect(wpMatches.length).toBe(1);
  });

  it("returns empty for clean code", () => {
    const content = `var x = 1 + 2; console.log(x);`;
    const matches = analyzeChunkDiscovery(content);
    expect(matches.length).toBe(0);
  });
});
