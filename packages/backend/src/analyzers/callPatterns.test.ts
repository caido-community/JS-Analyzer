import { describe, expect, it } from "vitest";

import { analyzeCallPatterns } from "./callPatterns";

describe("analyzeCallPatterns", () => {
  it("detects fetch() with URL", () => {
    const content = `fetch("/api/users")`;
    const matches = analyzeCallPatterns(content);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0]!.value).toContain("/api/users");
    expect(matches[0]!.confidence).toBe("high");
  });

  it("detects XMLHttpRequest.open()", () => {
    const content = `xhr.open("GET", "/api/data")`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("XMLHttpRequest"))).toBe(true);
    expect(matches.some((m) => m.value.includes("/api/data"))).toBe(true);
  });

  it("detects $.ajax()", () => {
    const content = `$.ajax({ url: "/api/data", method: "POST" });`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("$.ajax"))).toBe(true);
  });

  it("detects $.get() with URL", () => {
    const content = `$.get("/api/items")`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("/api/items"))).toBe(true);
  });

  it("detects localStorage.setItem()", () => {
    const content = `localStorage.setItem("token", jwt);`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("localStorage"))).toBe(true);
    expect(matches.some((m) => m.value.includes("token"))).toBe(true);
  });

  it("detects localStorage.getItem()", () => {
    const content = `var t = localStorage.getItem("authToken");`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("localStorage.getItem"))).toBe(
      true,
    );
  });

  it("detects sessionStorage", () => {
    const content = `sessionStorage.setItem("session", data);`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("sessionStorage"))).toBe(true);
  });

  it("detects document.cookie", () => {
    const content = `var c = document.cookie;`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("document.cookie"))).toBe(true);
  });

  it("detects postMessage()", () => {
    const content = `parent.postMessage(data, origin);`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("postMessage"))).toBe(true);
    expect(matches[0]!.confidence).toBe("high");
  });

  it("detects message event listener", () => {
    const content = `window.addEventListener("message", handler);`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("message event"))).toBe(true);
  });

  it("detects new WebSocket()", () => {
    const content = `var ws = new WebSocket("wss://example.com/ws");`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("WebSocket"))).toBe(true);
    expect(matches.some((m) => m.value.includes("wss://example.com/ws"))).toBe(
      true,
    );
  });

  it("detects Socket.io connect", () => {
    const content = `var socket = io("https://chat.example.com");`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("Socket.io"))).toBe(true);
  });

  it("detects createElement('script')", () => {
    const content = `var s = document.createElement("script");`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("createElement"))).toBe(true);
  });

  it("detects EventSource (SSE)", () => {
    const content = `var sse = new EventSource("/events/stream");`;
    const matches = analyzeCallPatterns(content);
    expect(matches.some((m) => m.value.includes("EventSource"))).toBe(true);
    expect(matches.some((m) => m.value.includes("/events/stream"))).toBe(true);
  });

  it("returns correct offsets", () => {
    const content = `abc;\nfetch("/test")`;
    const matches = analyzeCallPatterns(content);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0]!.startOffset).toBe(5);
  });

  it("deduplicates at same offset", () => {
    const content = `fetch("/a"); fetch("/b");`;
    const matches = analyzeCallPatterns(content);
    const fetches = matches.filter((m) => m.value.includes("fetch"));
    expect(fetches.length).toBe(2);
  });

  it("returns empty for clean code", () => {
    const content = `var x = 1 + 2; console.log(x);`;
    const matches = analyzeCallPatterns(content);
    expect(matches.length).toBe(0);
  });
});
