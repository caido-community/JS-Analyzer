import { describe, expect, it } from "vitest";

import { analyzeApiEndpoints } from "./apiEndpoints";

describe("analyzeApiEndpoints", () => {
  it("detects API path in string literal", () => {
    const content = `const url = "/api/v1/users";`;
    const matches = analyzeApiEndpoints(content);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches.some((m) => m.value === "/api/v1/users")).toBe(true);
  });

  it("detects fetch URL", () => {
    const content = `fetch("/api/users/profile");`;
    const matches = analyzeApiEndpoints(content);
    expect(matches.some((m) => m.value === "/api/users/profile")).toBe(true);
  });

  it("detects axios URL", () => {
    const content = `axios.get("/api/v2/products");`;
    const matches = analyzeApiEndpoints(content);
    expect(matches.some((m) => m.value === "/api/v2/products")).toBe(true);
  });

  it("detects HTTP method calls", () => {
    const content = `
      app.get("/users/:id", handler);
      app.post("/users/create", createHandler);
      app.delete("/posts/:id", deleteHandler);
    `;
    const matches = analyzeApiEndpoints(content);
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  it("detects relative paths with depth", () => {
    const content = `const path = "/admin/settings/security";`;
    const matches = analyzeApiEndpoints(content);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("ignores static asset paths", () => {
    const content = `const file = "/assets/styles.css";`;
    const matches = analyzeApiEndpoints(content);
    const cssMatch = matches.find((m) => m.value.includes("styles.css"));
    expect(cssMatch).toBeUndefined();
  });

  it("ignores single-segment paths", () => {
    const content = `const path = "/";`;
    const matches = analyzeApiEndpoints(content);
    expect(matches.length).toBe(0);
  });

  it("deduplicates same endpoint", () => {
    const content = `
      fetch("/api/data");
      const url = "/api/data";
    `;
    const matches = analyzeApiEndpoints(content);
    const dataMatches = matches.filter((m) => m.value === "/api/data");
    expect(dataMatches.length).toBe(1);
  });

  it("detects GraphQL endpoint", () => {
    const content = `const gql = "/graphql/v1";`;
    const matches = analyzeApiEndpoints(content);
    expect(matches.some((m) => m.value.includes("graphql"))).toBe(true);
  });

  it("detects path with route params", () => {
    const content = `const url = "/api/users/{userId}/posts/{postId}";`;
    const matches = analyzeApiEndpoints(content);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("returns correct offsets", () => {
    const content = `fetch("/api/users")`;
    const matches = analyzeApiEndpoints(content);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    const match = matches[0]!;
    expect(match.startOffset).toBeGreaterThanOrEqual(0);
    expect(match.endOffset).toBeGreaterThan(match.startOffset);
  });

  it("assigns high confidence to HTTP method patterns", () => {
    const content = `app.get("/api/health", handler);`;
    const matches = analyzeApiEndpoints(content);
    const high = matches.filter((m) => m.confidence === "high");
    expect(high.length).toBeGreaterThanOrEqual(1);
  });
});
