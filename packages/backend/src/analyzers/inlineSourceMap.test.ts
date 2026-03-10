import { describe, expect, it } from "vitest";

import { analyzeInlineSourceMap } from "./inlineSourceMap";

describe("analyzeInlineSourceMap", () => {
  it("detects inline base64 source map", () => {
    const base64 = btoa(JSON.stringify({ version: 3, sources: ["app.ts"] }));
    const content = `//# sourceMappingURL=data:application/json;base64,${base64}`;
    const matches = analyzeInlineSourceMap(content);
    expect(matches.length).toBe(1);
    expect(matches[0]!.value).toContain("Inline Source Map");
    expect(matches[0]!.confidence).toBe("high");
  });

  it("detects inline source map with charset", () => {
    const base64 = btoa(JSON.stringify({ version: 3, sources: ["index.ts"] }));
    const content = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${base64}`;
    const matches = analyzeInlineSourceMap(content);
    expect(matches.length).toBe(1);
    expect(matches[0]!.value).toContain("Inline Source Map");
  });

  it("detects external source map URL", () => {
    const content = `//# sourceMappingURL=app.js.map`;
    const matches = analyzeInlineSourceMap(content);
    expect(matches.length).toBe(1);
    expect(matches[0]!.value).toContain("External Source Map");
    expect(matches[0]!.value).toContain("app.js.map");
  });

  it("detects external source map with query params", () => {
    const content = `//# sourceMappingURL=bundle.min.js.map?v=123`;
    const matches = analyzeInlineSourceMap(content);
    expect(matches.length).toBe(1);
    expect(matches[0]!.value).toContain("External Source Map");
  });

  it("detects CSS inline source map", () => {
    const base64 = btoa(
      JSON.stringify({ version: 3, sources: ["styles.css"] }),
    );
    const content = `/*# sourceMappingURL=data:application/json;base64,${base64} */`;
    const matches = analyzeInlineSourceMap(content);
    expect(matches.length).toBe(1);
    expect(matches[0]!.value).toContain("Inline Source Map");
  });

  it("detects CSS external source map", () => {
    const content = `/*# sourceMappingURL=styles.css.map */`;
    const matches = analyzeInlineSourceMap(content);
    expect(matches.length).toBe(1);
    expect(matches[0]!.value).toContain("External Source Map");
  });

  it("detects both @ and # prefixed source maps", () => {
    const content = `//@ sourceMappingURL=legacy.js.map`;
    const matches = analyzeInlineSourceMap(content);
    expect(matches.length).toBe(1);
  });

  it("returns no matches when no source map is present", () => {
    const content = `const x = 1; console.log(x);`;
    const matches = analyzeInlineSourceMap(content);
    expect(matches.length).toBe(0);
  });

  it("reports approximate size for inline source maps", () => {
    const base64 = btoa(
      JSON.stringify({ version: 3, sources: ["app.ts"], mappings: "AAAA" }),
    );
    const content = `//# sourceMappingURL=data:application/json;base64,${base64}`;
    const matches = analyzeInlineSourceMap(content);
    expect(matches[0]!.value).toMatch(/~\d+KB/);
  });

  it("returns correct offsets", () => {
    const prefix = `const x = 1;\n`;
    const content = `${prefix}//# sourceMappingURL=app.js.map`;
    const matches = analyzeInlineSourceMap(content);
    expect(matches.length).toBe(1);
    expect(matches[0]!.startOffset).toBe(prefix.length);
    expect(matches[0]!.endOffset).toBe(content.length);
  });
});
