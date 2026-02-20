import { describe, expect, it } from "vitest";

import { analyzeSecuritySinks } from "./securitySinks";

describe("analyzeSecuritySinks", () => {
  it("detects innerHTML assignment", () => {
    const content = `el.innerHTML = userInput;`;
    const matches = analyzeSecuritySinks(content);
    expect(matches.length).toBe(1);
    expect(matches[0]!.value).toContain("innerHTML");
    expect(matches[0]!.confidence).toBe("high");
  });

  it("detects document.write", () => {
    const content = `document.write("<h1>" + name + "</h1>");`;
    const matches = analyzeSecuritySinks(content);
    const m = matches.find((m) => m.value.includes("document.write"));
    expect(m).toBeDefined();
    expect(m!.confidence).toBe("high");
  });

  it("detects eval()", () => {
    const content = `var result = eval(code);`;
    const matches = analyzeSecuritySinks(content);
    const m = matches.find((m) => m.value.includes("eval"));
    expect(m).toBeDefined();
    expect(m!.confidence).toBe("high");
  });

  it("detects insertAdjacentHTML", () => {
    const content = `el.insertAdjacentHTML("beforeend", html);`;
    const matches = analyzeSecuritySinks(content);
    expect(matches.some((m) => m.value.includes("insertAdjacentHTML"))).toBe(
      true,
    );
  });

  it("detects Function constructor", () => {
    const content = `var fn = new Function("return " + code);`;
    const matches = analyzeSecuritySinks(content);
    expect(matches.some((m) => m.value.includes("Function"))).toBe(true);
  });

  it("detects location.hash as XSS source", () => {
    const content = `var hash = location.hash.slice(1);`;
    const matches = analyzeSecuritySinks(content);
    const m = matches.find((m) => m.value.includes("location.hash"));
    expect(m).toBeDefined();
    expect(m!.value).toContain("xss-source");
  });

  it("detects location.search as XSS source", () => {
    const content = `var params = window.location.search;`;
    const matches = analyzeSecuritySinks(content);
    expect(matches.some((m) => m.value.includes("location.search"))).toBe(true);
  });

  it("detects document.referrer", () => {
    const content = `var ref = document.referrer;`;
    const matches = analyzeSecuritySinks(content);
    expect(matches.some((m) => m.value.includes("document.referrer"))).toBe(
      true,
    );
  });

  it("detects __proto__ access", () => {
    const content = `obj.__proto__.polluted = true;`;
    const matches = analyzeSecuritySinks(content);
    expect(matches.some((m) => m.value.includes("__proto__"))).toBe(true);
  });

  it("detects postMessage wildcard origin", () => {
    const content = `window.postMessage(data, "*")`;
    const matches = analyzeSecuritySinks(content);
    expect(matches.some((m) => m.value.includes("postMessage wildcard"))).toBe(
      true,
    );
    expect(matches.some((m) => m.confidence === "high")).toBe(true);
  });

  it("detects CORS wildcard", () => {
    const content = `headers["Access-Control-Allow-Origin"] = "*"`;
    const matches = analyzeSecuritySinks(content);
    expect(
      matches.some((m) => m.value.includes("Access-Control-Allow-Origin")),
    ).toBe(true);
  });

  it("detects setTimeout with string argument", () => {
    const content = `setTimeout("alert(1)", 100);`;
    const matches = analyzeSecuritySinks(content);
    expect(matches.some((m) => m.value.includes("setTimeout"))).toBe(true);
    expect(matches[0]!.confidence).toBe("medium");
  });

  it("returns correct offsets", () => {
    const content = `var x = 1;\neval(code);`;
    const matches = analyzeSecuritySinks(content);
    const evalMatch = matches.find((m) => m.value.includes("eval"));
    expect(evalMatch).toBeDefined();
    expect(evalMatch!.startOffset).toBe(11);
    expect(content.slice(evalMatch!.startOffset, evalMatch!.endOffset)).toBe(
      "eval(",
    );
  });

  it("deduplicates matches at same offset", () => {
    const content = `eval(x); eval(y);`;
    const matches = analyzeSecuritySinks(content);
    const evalMatches = matches.filter((m) => m.value.includes("eval"));
    expect(evalMatches.length).toBe(2);
  });

  it("returns empty for clean code", () => {
    const content = `var x = 1 + 2; console.log(x);`;
    const matches = analyzeSecuritySinks(content);
    expect(matches.length).toBe(0);
  });

  it("detects jQuery .html()", () => {
    const content = `$("#output").html(userInput);`;
    const matches = analyzeSecuritySinks(content);
    expect(matches.some((m) => m.value.includes("jQuery .html()"))).toBe(true);
  });
});
