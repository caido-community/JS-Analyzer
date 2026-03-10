import { describe, expect, it } from "vitest";

import { analyzeSensitiveData } from "./sensitiveData";

describe("analyzeSensitiveData", () => {
  it("detects real email addresses", () => {
    const content = `var contact = "john.doe@internal-corp.net";`;
    const matches = analyzeSensitiveData(content);
    expect(matches.some((m) => m.value.includes("Email"))).toBe(true);
  });

  it("filters out false-positive emails", () => {
    const content = `var email = "test@example.com";`;
    const matches = analyzeSensitiveData(content);
    expect(matches.some((m) => m.value.includes("Email"))).toBe(false);
  });

  it("filters out placeholder domain emails", () => {
    const content = `var email = "user@domain.com";`;
    const matches = analyzeSensitiveData(content);
    expect(matches.some((m) => m.value.includes("Email"))).toBe(false);
  });

  it("detects 10.x internal IP", () => {
    const content = `var server = "10.0.1.50";`;
    const matches = analyzeSensitiveData(content);
    const ipMatch = matches.find((m) => m.value.includes("Internal IP"));
    expect(ipMatch).toBeDefined();
    expect(ipMatch!.confidence).toBe("high");
  });

  it("detects 192.168.x internal IP", () => {
    const content = `const host = "192.168.1.100";`;
    const matches = analyzeSensitiveData(content);
    expect(matches.some((m) => m.value.includes("192.168"))).toBe(true);
  });

  it("detects 172.16.x internal IP", () => {
    const content = `const endpoint = "172.16.0.1";`;
    const matches = analyzeSensitiveData(content);
    expect(matches.some((m) => m.value.includes("Internal IP"))).toBe(true);
  });

  it("detects localhost IP", () => {
    const content = `var url = "http://127.0.0.1:8080/api";`;
    const matches = analyzeSensitiveData(content);
    expect(matches.some((m) => m.value.includes("Localhost"))).toBe(true);
  });

  it("detects debug endpoints", () => {
    const content = `fetch("/debug/pprof");`;
    const matches = analyzeSensitiveData(content);
    expect(matches.some((m) => m.value.includes("Debug Endpoint"))).toBe(true);
  });

  it("detects admin endpoints", () => {
    const content = `var url = "/admin/users";`;
    const matches = analyzeSensitiveData(content);
    expect(matches.some((m) => m.value.includes("Admin Endpoint"))).toBe(true);
  });

  it("detects swagger endpoints", () => {
    const content = `var docs = "/swagger/v1/swagger.json";`;
    const matches = analyzeSensitiveData(content);
    expect(matches.some((m) => m.value.includes("Swagger"))).toBe(true);
  });

  it("detects security-related comments", () => {
    const content = `// TODO: fix authentication bypass issue`;
    const matches = analyzeSensitiveData(content);
    expect(matches.some((m) => m.value.includes("TODO/FIXME"))).toBe(true);
    expect(matches[0]!.confidence).toBe("low");
  });

  it("ignores non-security TODO comments", () => {
    const content = `// TODO: add better UI styling`;
    const matches = analyzeSensitiveData(content);
    expect(matches.some((m) => m.value.includes("TODO/FIXME"))).toBe(false);
  });

  it("returns correct offsets", () => {
    const content = `x=1;\nvar ip = "10.0.0.1";`;
    const matches = analyzeSensitiveData(content);
    const ipMatch = matches.find((m) => m.value.includes("Internal IP"));
    expect(ipMatch).toBeDefined();
    expect(content.slice(ipMatch!.startOffset, ipMatch!.endOffset)).toContain(
      "10.0.0.1",
    );
  });

  it("returns empty for clean code", () => {
    const content = `var x = 1 + 2; console.log(x);`;
    const matches = analyzeSensitiveData(content);
    expect(matches.length).toBe(0);
  });
});
