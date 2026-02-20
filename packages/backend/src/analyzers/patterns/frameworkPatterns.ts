type FrameworkPattern = {
  name: string;
  regex: RegExp;
  framework: "react" | "angular" | "vue" | "nextjs" | "express" | "general";
  confidence: "low" | "medium" | "high";
};

export const FRAMEWORK_PATTERNS: FrameworkPattern[] = [
  {
    name: "React Router <Route>",
    regex: /<Route\s+[^>]*path\s*=\s*["']([^"']+)["']/g,
    framework: "react",
    confidence: "high",
  },
  {
    name: "React Router path config",
    regex: /\{\s*path\s*:\s*["']([^"']+)["']\s*,\s*(?:element|component)\s*:/g,
    framework: "react",
    confidence: "high",
  },
  {
    name: "React useNavigate/navigate",
    regex: /navigate\s*\(\s*["']([^"']+)["']/g,
    framework: "react",
    confidence: "medium",
  },
  {
    name: "React Router Link",
    regex: /<Link\s+[^>]*to\s*=\s*["']([^"']+)["']/g,
    framework: "react",
    confidence: "high",
  },

  {
    name: "Angular RouterModule.forRoot",
    regex: /RouterModule\.forRoot\s*\(\s*\[/g,
    framework: "angular",
    confidence: "high",
  },
  {
    name: "Angular route path",
    regex:
      /\{\s*path\s*:\s*["']([^"']+)["']\s*,\s*(?:component|loadChildren|loadComponent)\s*:/g,
    framework: "angular",
    confidence: "high",
  },
  {
    name: "Angular HttpClient",
    regex:
      /(?:this\.)?http\s*\.\s*(?:get|post|put|delete|patch)\s*(?:<[^>]*>)?\s*\(\s*["'`]([^"'`]+)["'`]/g,
    framework: "angular",
    confidence: "high",
  },
  {
    name: "Angular routerLink",
    regex: /routerLink\s*=\s*["']\/?([^"']+)["']/g,
    framework: "angular",
    confidence: "high",
  },

  {
    name: "Vue Router path",
    regex:
      /\{\s*path\s*:\s*["']([^"']+)["']\s*,\s*(?:component|name|redirect)\s*:/g,
    framework: "vue",
    confidence: "high",
  },
  {
    name: "Vue Router push/replace",
    regex: /\$router\.(?:push|replace)\s*\(\s*["']([^"']+)["']/g,
    framework: "vue",
    confidence: "medium",
  },
  {
    name: "Vue $http/$axios",
    regex:
      /(?:this\.)?\$(?:http|axios)\s*\.\s*(?:get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/g,
    framework: "vue",
    confidence: "high",
  },

  {
    name: "Next.js getServerSideProps",
    regex: /export\s+(?:async\s+)?function\s+getServerSideProps/g,
    framework: "nextjs",
    confidence: "high",
  },
  {
    name: "Next.js getStaticProps",
    regex: /export\s+(?:async\s+)?function\s+getStaticProps/g,
    framework: "nextjs",
    confidence: "high",
  },
  {
    name: "Next.js API route handler",
    regex:
      /export\s+(?:default\s+)?(?:async\s+)?function\s+(?:handler|GET|POST|PUT|DELETE|PATCH)\s*\(/g,
    framework: "nextjs",
    confidence: "medium",
  },
  {
    name: "Next.js middleware",
    regex: /export\s+(?:async\s+)?function\s+middleware\s*\(/g,
    framework: "nextjs",
    confidence: "high",
  },
  {
    name: "Next.js NextResponse",
    regex: /NextResponse\.(?:json|redirect|rewrite|next)\s*\(/g,
    framework: "nextjs",
    confidence: "medium",
  },

  {
    name: "Express route definition",
    regex:
      /(?:app|router)\s*\.\s*(?:get|post|put|delete|patch|all|use)\s*\(\s*["'`](\/[^"'`]*?)["'`]/g,
    framework: "express",
    confidence: "high",
  },
  {
    name: "Express Router()",
    regex: /express\.Router\s*\(\s*\)/g,
    framework: "express",
    confidence: "medium",
  },
  {
    name: "Koa Router route",
    regex:
      /router\s*\.\s*(?:get|post|put|delete|patch|all)\s*\(\s*["'`](\/[^"'`]*?)["'`]/g,
    framework: "express",
    confidence: "high",
  },

  {
    name: "window.__INITIAL_STATE__",
    regex: /window\.__INITIAL_STATE__/g,
    framework: "general",
    confidence: "medium",
  },
  {
    name: "window.__PRELOADED_STATE__",
    regex: /window\.__PRELOADED_STATE__/g,
    framework: "general",
    confidence: "medium",
  },
];
