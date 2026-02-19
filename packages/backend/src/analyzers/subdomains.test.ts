import { describe, expect, it } from "vitest";

import { analyzeSubdomains } from "./subdomains";

describe("analyzeSubdomains", () => {
  it("detects subdomain in string literal", () => {
    const content = `const url = "api.example.com";`;
    const matches = analyzeSubdomains(content);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches.some((m) => m.value === "api.example.com")).toBe(true);
  });

  it("detects multiple subdomains", () => {
    const content = `
      const a = "api.example.com";
      const b = "cdn.static.example.com";
      const c = "auth.service.internal.io";
    `;
    const matches = analyzeSubdomains(content);
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  it("gives high confidence to deep subdomains", () => {
    const content = `const url = "api.v2.staging.example.com";`;
    const matches = analyzeSubdomains(content);
    const deep = matches.find((m) => m.value.includes("api.v2.staging"));
    expect(deep).toBeDefined();
    expect(deep!.confidence).toBe("high");
  });

  it("excludes file extensions as TLDs", () => {
    const content = `const file = "bundle.min.js";`;
    const matches = analyzeSubdomains(content);
    expect(matches.length).toBe(0);
  });

  it("excludes common JS objects", () => {
    const content = `console.log("hello"); window.location.href = "/test";`;
    const matches = analyzeSubdomains(content);
    const jsObj = matches.find(
      (m) => m.value === "console.log" || m.value === "window.location",
    );
    expect(jsObj).toBeUndefined();
  });

  it("does not match pure numeric hostnames", () => {
    const content = `const ip = "192.168.1.1";`;
    const matches = analyzeSubdomains(content);
    expect(matches.length).toBe(0);
  });

  it("excludes the source host when url is provided", () => {
    const content = `const url = "example.com";`;
    const matches = analyzeSubdomains(content, "https://example.com/app.js");
    const self = matches.find((m) => m.value === "example.com");
    expect(self).toBeUndefined();
  });

  it("keeps other hosts when url is provided", () => {
    const content = `const url = "api.other.com";`;
    const matches = analyzeSubdomains(content, "https://example.com/app.js");
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches.some((m) => m.value === "api.other.com")).toBe(true);
  });

  it("deduplicates same hostname", () => {
    const content = `const a = "api.example.com"; const b = "api.example.com";`;
    const matches = analyzeSubdomains(content);
    const apiMatches = matches.filter((m) => m.value === "api.example.com");
    expect(apiMatches.length).toBe(1);
  });

  it("returns correct offsets", () => {
    const content = `const url = "api.example.com";`;
    const matches = analyzeSubdomains(content);
    const match = matches[0]!;
    expect(match.startOffset).toBeGreaterThanOrEqual(0);
    expect(match.endOffset).toBeGreaterThan(match.startOffset);
  });
});
