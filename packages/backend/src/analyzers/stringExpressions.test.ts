import { describe, expect, it } from "vitest";

import { analyzeStringExpressions } from "./stringExpressions";

describe("analyzeStringExpressions", () => {
  it("detects GraphQL query", () => {
    const content = `const q = \`query GetUser($id: ID!) { user(id: $id) { name } }\``;
    const matches = analyzeStringExpressions(content);
    expect(matches.some((m) => m.value.includes("GraphQL"))).toBe(true);
    expect(matches.some((m) => m.confidence === "high")).toBe(true);
  });

  it("detects GraphQL mutation", () => {
    const content = `gql\`mutation CreateUser { createUser(input: $input) { id } }\``;
    const matches = analyzeStringExpressions(content);
    expect(matches.some((m) => m.value.includes("GraphQL"))).toBe(true);
  });

  it("detects GraphQL introspection", () => {
    const content = `const q = "{ __schema { types { name } } }";`;
    const matches = analyzeStringExpressions(content);
    expect(matches.some((m) => m.value.includes("GraphQL Introspection"))).toBe(
      true,
    );
  });

  it("detects absolute HTTP URLs", () => {
    const content = `var api = "https://api.internal.company.com/v2/data";`;
    const matches = analyzeStringExpressions(content);
    expect(matches.some((m) => m.value.includes("Absolute URL"))).toBe(true);
    expect(
      matches.some((m) => m.value.includes("api.internal.company.com")),
    ).toBe(true);
  });

  it("filters out static asset URLs", () => {
    const content = `var img = "https://cdn.example.com/logo.png";`;
    const matches = analyzeStringExpressions(content);
    expect(matches.some((m) => m.value.includes("logo.png"))).toBe(false);
  });

  it("filters out common CDN library URLs", () => {
    const content = `var lib = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js";`;
    const matches = analyzeStringExpressions(content);
    expect(matches.some((m) => m.value.includes("cdnjs.cloudflare.com"))).toBe(
      false,
    );
  });

  it("detects parameterized paths", () => {
    const content = `var url = "/users/:userId/posts/:postId";`;
    const matches = analyzeStringExpressions(content);
    expect(matches.some((m) => m.value.includes("Parameterized Path"))).toBe(
      true,
    );
    expect(matches.some((m) => m.value.includes(":userId"))).toBe(true);
  });

  it("detects template literal URLs", () => {
    const content = "const url = `/api/users/${userId}/profile`";
    const matches = analyzeStringExpressions(content);
    expect(matches.some((m) => m.value.includes("Template URL"))).toBe(true);
  });

  it("detects URLSearchParams", () => {
    const content = `var params = new URLSearchParams(window.location.search);`;
    const matches = analyzeStringExpressions(content);
    expect(matches.some((m) => m.value.includes("URLSearchParams"))).toBe(true);
  });

  it("detects query string literals", () => {
    const content = `var qs = "?page=1&sort=name";`;
    const matches = analyzeStringExpressions(content);
    expect(matches.some((m) => m.value.includes("Query String"))).toBe(true);
  });

  it("deduplicates same URL", () => {
    const content = `var a = "https://api.example.com/test";\nvar b = "https://api.example.com/test";`;
    const matches = analyzeStringExpressions(content);
    const urlMatches = matches.filter((m) => m.value.includes("Absolute URL"));
    expect(urlMatches.length).toBe(1);
  });

  it("returns correct offsets", () => {
    const content = `x;\n"https://internal.api.com/v1"`;
    const matches = analyzeStringExpressions(content);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    const urlMatch = matches.find((m) => m.value.includes("Absolute URL"));
    expect(urlMatch).toBeDefined();
    expect(urlMatch!.startOffset).toBe(3);
  });

  it("returns empty for clean code", () => {
    const content = `var x = 1 + 2; console.log(x);`;
    const matches = analyzeStringExpressions(content);
    expect(matches.length).toBe(0);
  });
});
