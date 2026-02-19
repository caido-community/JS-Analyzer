import { describe, expect, it } from "vitest";

import { analyzeSecrets } from "./secrets";

describe("analyzeSecrets", () => {
  it("detects AWS access key", () => {
    const content = `const key = "AKIAIOSFODNN7EXAMPLE";`;
    const matches = analyzeSecrets(content);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    const awsMatch = matches.find((m) => m.value.includes("AWS Access Key"));
    expect(awsMatch).toBeDefined();
    expect(awsMatch!.confidence).toBe("high");
  });

  it("detects GitHub token", () => {
    const content = `const token = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij";`;
    const matches = analyzeSecrets(content);
    const ghMatch = matches.find((m) => m.value.includes("GitHub"));
    expect(ghMatch).toBeDefined();
    expect(ghMatch!.confidence).toBe("high");
  });

  it("detects Google API key", () => {
    const content = `var apiKey = "AIzaSyA1234567890abcdefghijklmnopqrstuv";`;
    const matches = analyzeSecrets(content);
    const googleMatch = matches.find((m) => m.value.includes("Google API Key"));
    expect(googleMatch).toBeDefined();
    expect(googleMatch!.confidence).toBe("high");
  });

  it("detects Stripe secret key", () => {
    const content = `const stripe = "sk_live_abcdefghijklmnopqrstuvwx";`;
    const matches = analyzeSecrets(content);
    const stripeMatch = matches.find((m) =>
      m.value.includes("Stripe Secret Key"),
    );
    expect(stripeMatch).toBeDefined();
    expect(stripeMatch!.confidence).toBe("high");
  });

  it("detects Slack token", () => {
    const content = `const slack = "xoxb-1234567890-1234567890-AbCdEfGhIjKlMnOpQrStUvWx";`;
    const matches = analyzeSecrets(content);
    const slackMatch = matches.find((m) => m.value.includes("Slack Token"));
    expect(slackMatch).toBeDefined();
  });

  it("detects private key header", () => {
    const content = `const pk = "-----BEGIN RSA PRIVATE KEY-----\\nMIIE...";`;
    const matches = analyzeSecrets(content);
    const pkMatch = matches.find((m) => m.value.includes("Private Key"));
    expect(pkMatch).toBeDefined();
    expect(pkMatch!.confidence).toBe("high");
  });

  it("detects JWT token", () => {
    const content = `const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";`;
    const matches = analyzeSecrets(content);
    const jwtMatch = matches.find((m) => m.value.includes("JWT"));
    expect(jwtMatch).toBeDefined();
  });

  it("detects SendGrid API key", () => {
    const content = `const sg = "SG.abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuvwxyz0123456789abcdefg";`;
    const matches = analyzeSecrets(content);
    const sgMatch = matches.find((m) => m.value.includes("SendGrid"));
    expect(sgMatch).toBeDefined();
    expect(sgMatch!.confidence).toBe("high");
  });

  it("detects generic API key assignment", () => {
    const content = `const config = { api_key: "super_secret_key_12345678" };`;
    const matches = analyzeSecrets(content);
    const genericMatch = matches.find((m) =>
      m.value.includes("Generic API Key"),
    );
    expect(genericMatch).toBeDefined();
  });

  it("detects high entropy strings", () => {
    const content = `const hash = "aK9mZ3xQ7vB2nL5wR8jT4uY1cF6hG0eD";`;
    const matches = analyzeSecrets(content);
    const entropyMatch = matches.find((m) => m.value.includes("High Entropy"));
    expect(entropyMatch).toBeDefined();
  });

  it("does not match simple strings", () => {
    const content = `const name = "hello";`;
    const matches = analyzeSecrets(content);
    expect(matches.length).toBe(0);
  });

  it("does not match test/placeholder values", () => {
    const content = `const key = "testkey12345678901234";`;
    const matches = analyzeSecrets(content);
    const falsePositive = matches.find(
      (m) => m.value.includes("testkey") && !m.value.includes("High Entropy"),
    );
    expect(falsePositive).toBeUndefined();
  });

  it("returns correct offsets", () => {
    const content = `const key = "AKIAIOSFODNN7EXAMPLE";`;
    const matches = analyzeSecrets(content);
    const awsMatch = matches.find((m) => m.value.includes("AWS Access Key"));
    expect(awsMatch).toBeDefined();
    expect(awsMatch!.startOffset).toBeGreaterThanOrEqual(0);
    expect(awsMatch!.endOffset).toBeGreaterThan(awsMatch!.startOffset);
    expect(content.slice(awsMatch!.startOffset, awsMatch!.endOffset)).toContain(
      "AKIAIOSFODNN7EXAMPLE",
    );
  });

  it("deduplicates matches at the same offset", () => {
    const content = `const a = "AKIAIOSFODNN7EXAMPLE"; const b = "AKIAIOSFODNN7EXAMPLE";`;
    const matches = analyzeSecrets(content);
    const awsMatches = matches.filter((m) =>
      m.value.includes("AWS Access Key"),
    );
    expect(awsMatches.length).toBe(2);
  });
});
