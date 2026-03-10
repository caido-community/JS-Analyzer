import { describe, expect, it } from "vitest";

import { analyzeCloudUrls } from "./cloudUrls";

describe("analyzeCloudUrls", () => {
  it("detects AWS S3 bucket URL", () => {
    const content = `const url = "https://mybucket.s3.amazonaws.com/file.txt";`;
    const matches = analyzeCloudUrls(content);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches.some((m) => m.value.includes("AWS S3"))).toBe(true);
  });

  it("detects AWS S3 with region", () => {
    const content = `const url = "https://mybucket.s3.us-east-1.amazonaws.com/file.txt";`;
    const matches = analyzeCloudUrls(content);
    expect(matches.some((m) => m.value.includes("AWS S3"))).toBe(true);
  });

  it("detects CloudFront URL", () => {
    const content = `const cdn = "https://d1234abcd.cloudfront.net/assets/app.js";`;
    const matches = analyzeCloudUrls(content);
    expect(matches.some((m) => m.value.includes("CloudFront"))).toBe(true);
  });

  it("detects Azure Blob storage", () => {
    const content = `const url = "https://mystorageaccount.blob.core.windows.net/container";`;
    const matches = analyzeCloudUrls(content);
    expect(matches.some((m) => m.value.includes("Azure Blob"))).toBe(true);
  });

  it("detects Azure Websites", () => {
    const content = `const url = "https://my-app.azurewebsites.net";`;
    const matches = analyzeCloudUrls(content);
    expect(matches.some((m) => m.value.includes("Azure Websites"))).toBe(true);
  });

  it("detects GCP Storage", () => {
    const content = `const url = "https://storage.googleapis.com/my-bucket/file.txt";`;
    const matches = analyzeCloudUrls(content);
    expect(matches.some((m) => m.value.includes("GCP Storage"))).toBe(true);
  });

  it("detects Firebase URL", () => {
    const content = `const db = "https://myapp-12345.firebaseio.com";`;
    const matches = analyzeCloudUrls(content);
    expect(matches.some((m) => m.value.includes("Firebase"))).toBe(true);
  });

  it("detects DigitalOcean Spaces", () => {
    const content = `const url = "https://my-space.nyc3.digitaloceanspaces.com/file";`;
    const matches = analyzeCloudUrls(content);
    expect(matches.some((m) => m.value.includes("DigitalOcean"))).toBe(true);
  });

  it("returns no matches for non-cloud URLs", () => {
    const content = `const url = "https://example.com/api/data";`;
    const matches = analyzeCloudUrls(content);
    expect(matches.length).toBe(0);
  });

  it("deduplicates same URL", () => {
    const content = `
      const a = "https://mybucket.s3.amazonaws.com";
      const b = "https://mybucket.s3.amazonaws.com";
    `;
    const matches = analyzeCloudUrls(content);
    const s3Matches = matches.filter((m) => m.value.includes("AWS S3"));
    expect(s3Matches.length).toBe(1);
  });

  it("all matches have high confidence", () => {
    const content = `const url = "https://mybucket.s3.amazonaws.com/file.txt";`;
    const matches = analyzeCloudUrls(content);
    for (const match of matches) {
      expect(match.confidence).toBe("high");
    }
  });

  it("returns correct offsets", () => {
    const content = `const url = "https://mybucket.s3.amazonaws.com";`;
    const matches = analyzeCloudUrls(content);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    const match = matches[0]!;
    expect(match.startOffset).toBeGreaterThanOrEqual(0);
    expect(match.endOffset).toBeGreaterThan(match.startOffset);
  });
});
