import { describe, expect, it } from "vitest";

import { mapBeautifiedOffsetsToRaw } from "./offsetMapper";

describe("mapBeautifiedOffsetsToRaw", () => {
  it("maps a simple value back to raw content", () => {
    const rawContent = `const key = "AKIAIOSFODNN7EXAMPLE";`;
    const matches = mapBeautifiedOffsetsToRaw(rawContent, [
      {
        analyzerKind: "secrets",
        value: "[AWS Access Key] AKIAIOSFODNN7EXAMPLE",
        startOffset: 14,
        endOffset: 34,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "high",
        context: rawContent,
      },
    ]);
    expect(matches[0]!.rawStartOffset).toBeDefined();
    expect(matches[0]!.rawEndOffset).toBeDefined();
    const slice = rawContent.slice(
      matches[0]!.rawStartOffset,
      matches[0]!.rawEndOffset,
    );
    expect(slice).toBe("AKIAIOSFODNN7EXAMPLE");
  });

  it("maps a subdomain back to raw content", () => {
    const rawContent = `const url = "api.example.com";`;
    const matches = mapBeautifiedOffsetsToRaw(rawContent, [
      {
        analyzerKind: "subdomains",
        value: "api.example.com",
        startOffset: 13,
        endOffset: 28,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "high",
        context: rawContent,
      },
    ]);
    expect(matches[0]!.rawStartOffset).toBeDefined();
    const slice = rawContent.slice(
      matches[0]!.rawStartOffset,
      matches[0]!.rawEndOffset,
    );
    expect(slice).toBe("api.example.com");
  });

  it("returns undefined offsets when value not found in raw", () => {
    const rawContent = `const x = 1;`;
    const matches = mapBeautifiedOffsetsToRaw(rawContent, [
      {
        analyzerKind: "secrets",
        value: "[AWS Access Key] NOTINRAW",
        startOffset: 0,
        endOffset: 10,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "high",
        context: "",
      },
    ]);
    expect(matches[0]!.rawStartOffset).toBeUndefined();
    expect(matches[0]!.rawEndOffset).toBeUndefined();
  });

  it("handles values without bracket prefix", () => {
    const rawContent = `const url = "/api/v1/users";`;
    const matches = mapBeautifiedOffsetsToRaw(rawContent, [
      {
        analyzerKind: "apiEndpoints",
        value: "/api/v1/users",
        startOffset: 13,
        endOffset: 26,
        rawStartOffset: undefined,
        rawEndOffset: undefined,
        confidence: "medium",
        context: rawContent,
      },
    ]);
    expect(matches[0]!.rawStartOffset).toBeDefined();
    const slice = rawContent.slice(
      matches[0]!.rawStartOffset,
      matches[0]!.rawEndOffset,
    );
    expect(slice).toBe("/api/v1/users");
  });
});
