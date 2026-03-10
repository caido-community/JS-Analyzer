import { describe, expect, it } from "vitest";

import { analyzeDependencyConfusion } from "./dependencyConfusion";

describe("analyzeDependencyConfusion", () => {
  it("detects require() call", () => {
    const content = `const express = require("express");`;
    const matches = analyzeDependencyConfusion(content);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches.some((m) => m.value === "express")).toBe(true);
  });

  it("detects import statement", () => {
    const content = `import React from "react";`;
    const matches = analyzeDependencyConfusion(content);
    expect(matches.some((m) => m.value === "react")).toBe(true);
  });

  it("detects scoped package", () => {
    const content = `import { something } from "@company/internal-lib";`;
    const matches = analyzeDependencyConfusion(content);
    expect(matches.some((m) => m.value === "@company/internal-lib")).toBe(true);
  });

  it("detects dynamic import", () => {
    const content = `const mod = import("lodash");`;
    const matches = analyzeDependencyConfusion(content);
    expect(matches.some((m) => m.value === "lodash")).toBe(true);
  });

  it("detects webpack require", () => {
    const content = `const mod = __webpack_require__("axios");`;
    const matches = analyzeDependencyConfusion(content);
    expect(matches.some((m) => m.value === "axios")).toBe(true);
  });

  it("ignores relative paths", () => {
    const content = `import foo from "./foo";`;
    const matches = analyzeDependencyConfusion(content);
    expect(matches.length).toBe(0);
  });

  it("ignores Node.js built-in modules", () => {
    const content = `
      const fs = require("fs");
      const path = require("path");
      const http = require("http");
    `;
    const matches = analyzeDependencyConfusion(content);
    expect(matches.length).toBe(0);
  });

  it("extracts package name from deep import", () => {
    const content = `import util from "lodash/util";`;
    const matches = analyzeDependencyConfusion(content);
    expect(matches.some((m) => m.value === "lodash")).toBe(true);
  });

  it("deduplicates same package", () => {
    const content = `
      const a = require("express");
      const b = require("express");
    `;
    const matches = analyzeDependencyConfusion(content);
    const expressMatches = matches.filter((m) => m.value === "express");
    expect(expressMatches.length).toBe(1);
  });

  it("assigns medium confidence to scoped packages", () => {
    const content = `import foo from "@my-org/my-lib";`;
    const matches = analyzeDependencyConfusion(content);
    const scoped = matches.find((m) => m.value.startsWith("@"));
    expect(scoped).toBeDefined();
    expect(scoped!.confidence).toBe("medium");
  });

  it("assigns low confidence to unscoped packages", () => {
    const content = `const express = require("express");`;
    const matches = analyzeDependencyConfusion(content);
    const unscoped = matches.find((m) => m.value === "express");
    expect(unscoped).toBeDefined();
    expect(unscoped!.confidence).toBe("low");
  });
});
