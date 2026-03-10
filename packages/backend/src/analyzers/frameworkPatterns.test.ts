import { describe, expect, it } from "vitest";

import { analyzeFrameworkPatterns } from "./frameworkPatterns";

describe("analyzeFrameworkPatterns", () => {
  it("detects React Router <Route> path", () => {
    const content = `<Route path="/dashboard" element={<Dashboard />} />`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("/dashboard"))).toBe(true);
    expect(matches.some((m) => m.value.includes("react"))).toBe(true);
  });

  it("detects React Router path config object", () => {
    const content = `{ path: "/users", element: <UserList /> }`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("/users"))).toBe(true);
  });

  it("detects React Router Link", () => {
    const content = `<Link to="/settings/profile">Profile</Link>`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("/settings/profile"))).toBe(
      true,
    );
  });

  it("detects Angular route path", () => {
    const content = `{ path: "admin/settings", loadChildren: () => import('./admin') }`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("admin/settings"))).toBe(true);
    expect(matches.some((m) => m.value.includes("angular"))).toBe(true);
  });

  it("detects Angular HttpClient call", () => {
    const content = `this.http.get<User[]>("/api/users")`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("/api/users"))).toBe(true);
    expect(matches.some((m) => m.value.includes("angular"))).toBe(true);
  });

  it("detects Vue Router path", () => {
    const content = `{ path: "/profile", component: Profile, name: "profile" }`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("/profile"))).toBe(true);
  });

  it("detects Vue $router.push", () => {
    const content = `this.$router.push("/login")`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("/login"))).toBe(true);
    expect(matches.some((m) => m.value.includes("vue"))).toBe(true);
  });

  it("detects Next.js getServerSideProps", () => {
    const content = `export async function getServerSideProps(context) { }`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("getServerSideProps"))).toBe(
      true,
    );
    expect(matches.some((m) => m.value.includes("nextjs"))).toBe(true);
  });

  it("detects Next.js getStaticProps", () => {
    const content = `export async function getStaticProps() { }`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("getStaticProps"))).toBe(true);
  });

  it("detects Next.js middleware", () => {
    const content = `export function middleware(request) { return NextResponse.next(); }`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("middleware"))).toBe(true);
  });

  it("detects Express route definition", () => {
    const content = `app.get("/api/v1/users", handler);`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("/api/v1/users"))).toBe(true);
    expect(matches.some((m) => m.value.includes("express"))).toBe(true);
    expect(matches[0]!.confidence).toBe("high");
  });

  it("detects Express router routes", () => {
    const content = `router.post("/auth/login", loginHandler);`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("/auth/login"))).toBe(true);
  });

  it("detects window.__INITIAL_STATE__", () => {
    const content = `window.__INITIAL_STATE__ = { user: null };`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.some((m) => m.value.includes("__INITIAL_STATE__"))).toBe(
      true,
    );
  });

  it("returns correct offsets", () => {
    const content = `x;\napp.get("/test", h);`;
    const matches = analyzeFrameworkPatterns(content);
    const routeMatch = matches.find((m) => m.value.includes("/test"));
    expect(routeMatch).toBeDefined();
    expect(routeMatch!.startOffset).toBe(3);
  });

  it("deduplicates at same offset", () => {
    const content = `app.get("/a", h);\napp.get("/b", h);`;
    const matches = analyzeFrameworkPatterns(content);
    const routes = matches.filter((m) => m.value.includes("Express"));
    expect(routes.length).toBe(2);
  });

  it("returns empty for clean code", () => {
    const content = `var x = 1 + 2; console.log(x);`;
    const matches = analyzeFrameworkPatterns(content);
    expect(matches.length).toBe(0);
  });
});
