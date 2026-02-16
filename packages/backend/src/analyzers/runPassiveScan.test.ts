import { describe, expect, it } from "vitest";

import { runPassiveScanOnFiles, scanSingleFile } from "./runPassiveScan";

describe("scanSingleFile", () => {
  it("returns matches for content with secrets", () => {
    const matches = scanSingleFile(
      {
        requestId: "req-1",
        url: "https://example.com/app.js",
        content: `const key = "AKIAIOSFODNN7EXAMPLE";`,
      },
      ["secrets"],
      false,
    );
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches.some((m) => m.analyzerKind === "secrets")).toBe(true);
  });

  it("returns matches for content with API endpoints", () => {
    const matches = scanSingleFile(
      {
        requestId: "req-1",
        url: "https://example.com/app.js",
        content: `fetch("/api/v1/users/profile");`,
      },
      ["apiEndpoints"],
      false,
    );
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches.some((m) => m.analyzerKind === "apiEndpoints")).toBe(true);
  });

  it("runs multiple analyzers", () => {
    const content = `
      const key = "AKIAIOSFODNN7EXAMPLE";
      const url = "https://mybucket.s3.amazonaws.com/file";
      fetch("/api/v1/data");
    `;
    const matches = scanSingleFile(
      {
        requestId: "req-1",
        url: "https://example.com/app.js",
        content,
      },
      ["secrets", "cloudUrls", "apiEndpoints"],
      false,
    );
    const kinds = new Set(matches.map((m) => m.analyzerKind));
    expect(kinds.has("secrets")).toBe(true);
    expect(kinds.has("cloudUrls")).toBe(true);
    expect(kinds.has("apiEndpoints")).toBe(true);
  });

  it("returns empty array for clean content", () => {
    const matches = scanSingleFile(
      {
        requestId: "req-1",
        url: "https://example.com/app.js",
        content: "const x = 1;",
      },
      ["secrets"],
      false,
    );
    expect(matches.length).toBe(0);
  });
});

describe("runPassiveScanOnFiles", () => {
  it("scans multiple files", () => {
    const entries = runPassiveScanOnFiles(
      [
        {
          requestId: "req-1",
          url: "https://example.com/a.js",
          content: `const key = "AKIAIOSFODNN7EXAMPLE";`,
        },
        {
          requestId: "req-2",
          url: "https://example.com/b.js",
          content: `fetch("/api/users");`,
        },
      ],
      { analyzers: ["secrets", "apiEndpoints"] },
    );
    expect(entries.length).toBe(2);
    expect(entries[0]!.requestId).toBe("req-1");
    expect(entries[1]!.requestId).toBe("req-2");
  });

  it("calls onProgress callback", () => {
    const progressCalls: Array<{ scannedFiles: number; totalFiles: number }> =
      [];
    runPassiveScanOnFiles(
      [
        {
          requestId: "req-1",
          url: "https://example.com/a.js",
          content: `fetch("/api/data");`,
        },
        {
          requestId: "req-2",
          url: "https://example.com/b.js",
          content: `fetch("/api/other");`,
        },
      ],
      {
        analyzers: ["apiEndpoints"],
        onProgress: (p) => progressCalls.push(p),
      },
    );
    expect(progressCalls.length).toBe(2);
    expect(progressCalls[0]!.scannedFiles).toBe(1);
    expect(progressCalls[1]!.scannedFiles).toBe(2);
  });

  it("respects abort signal", () => {
    const signal = { aborted: false };
    const files = Array.from({ length: 10 }, (_, i) => ({
      requestId: `req-${i}`,
      url: `https://example.com/${i}.js`,
      content: `fetch("/api/data-${i}");`,
    }));

    const entries = runPassiveScanOnFiles(files, {
      analyzers: ["apiEndpoints"],
      abortSignal: signal,
      onProgress: (p) => {
        if (p.scannedFiles >= 3) {
          signal.aborted = true;
        }
      },
    });

    expect(entries.length).toBeLessThanOrEqual(3);
  });

  it("skips files with no matches", () => {
    const entries = runPassiveScanOnFiles(
      [
        {
          requestId: "req-1",
          url: "https://example.com/a.js",
          content: "const x = 1;",
        },
        {
          requestId: "req-2",
          url: "https://example.com/b.js",
          content: `fetch("/api/users");`,
        },
      ],
      { analyzers: ["apiEndpoints"] },
    );
    expect(entries.length).toBe(1);
    expect(entries[0]!.requestId).toBe("req-2");
  });
});
