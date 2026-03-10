type SensitivePattern = {
  name: string;
  regex: RegExp;
  category: "email" | "internal-ip" | "debug-endpoint" | "security-comment";
  confidence: "low" | "medium" | "high";
};

const FALSE_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "localhost",
  "domain.com",
  "email.com",
  "your-domain.com",
  "yourdomain.com",
  "company.com",
  "placeholder.com",
  "sentry.io",
  "sentry-next.wixpress.com",
  "w3.org",
]);

const FALSE_EMAIL_PREFIXES = new Set([
  "test",
  "example",
  "user",
  "admin",
  "info",
  "noreply",
  "no-reply",
  "support",
  "mail",
  "email",
  "name",
  "your",
  "someone",
  "foo",
  "bar",
]);

export function isLikelyFalseEmail(email: string): boolean {
  const lower = email.toLowerCase();
  const parts = lower.split("@");
  if (parts.length !== 2) return true;
  const [prefix, domain] = parts as [string, string];
  if (FALSE_EMAIL_DOMAINS.has(domain)) return true;
  if (FALSE_EMAIL_PREFIXES.has(prefix)) return true;
  if (domain.endsWith(".example") || domain.endsWith(".test")) return true;
  return false;
}

export const SENSITIVE_DATA_PATTERNS: SensitivePattern[] = [
  {
    name: "Email Address",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    category: "email",
    confidence: "medium",
  },

  {
    name: "Internal IP (10.x.x.x)",
    regex:
      /\b10\.(?:25[0-5]|2[0-4]\d|1?\d\d?)\.(?:25[0-5]|2[0-4]\d|1?\d\d?)\.(?:25[0-5]|2[0-4]\d|1?\d\d?)\b/g,
    category: "internal-ip",
    confidence: "high",
  },
  {
    name: "Internal IP (172.16-31.x.x)",
    regex:
      /\b172\.(?:1[6-9]|2\d|3[01])\.(?:25[0-5]|2[0-4]\d|1?\d\d?)\.(?:25[0-5]|2[0-4]\d|1?\d\d?)\b/g,
    category: "internal-ip",
    confidence: "high",
  },
  {
    name: "Internal IP (192.168.x.x)",
    regex:
      /\b192\.168\.(?:25[0-5]|2[0-4]\d|1?\d\d?)\.(?:25[0-5]|2[0-4]\d|1?\d\d?)\b/g,
    category: "internal-ip",
    confidence: "high",
  },
  {
    name: "Localhost",
    regex: /\b127\.0\.0\.1\b/g,
    category: "internal-ip",
    confidence: "high",
  },
  {
    name: "IPv6 Localhost",
    regex: /\b::1\b/g,
    category: "internal-ip",
    confidence: "high",
  },

  {
    name: "Debug Endpoint",
    regex:
      /["'`](\/(?:debug|_debug|_profiler|__debug|trace|_trace)\b[^"'`]*?)["'`]/g,
    category: "debug-endpoint",
    confidence: "high",
  },
  {
    name: "Admin Endpoint",
    regex:
      /["'`](\/(?:admin|_admin|administrator|manage|management|dashboard\/admin)\b[^"'`]*?)["'`]/g,
    category: "debug-endpoint",
    confidence: "high",
  },
  {
    name: "Internal Endpoint",
    regex: /["'`](\/(?:internal|_internal|private|hidden)\b[^"'`]*?)["'`]/g,
    category: "debug-endpoint",
    confidence: "high",
  },
  {
    name: "Swagger/OpenAPI",
    regex: /["'`](\/(?:swagger|api-docs|openapi|redoc)\b[^"'`]*?)["'`]/g,
    category: "debug-endpoint",
    confidence: "high",
  },
  {
    name: "GraphQL Playground/Explorer",
    regex:
      /["'`](\/(?:graphql\/playground|graphiql|altair|graphql-explorer)\b[^"'`]*?)["'`]/g,
    category: "debug-endpoint",
    confidence: "high",
  },
  {
    name: "Actuator/Health Endpoint",
    regex:
      /["'`](\/(?:actuator|health|healthcheck|status|metrics|env|info|configprops|beans)\b[^"'`]*?)["'`]/g,
    category: "debug-endpoint",
    confidence: "medium",
  },

  {
    name: "Security TODO/FIXME",
    regex:
      /\/\/\s*(?:TODO|FIXME|HACK|XXX|BUG)\b[^\n]*?(?:auth|password|token|secret|credential|vulnerab|bypass|insecure|unsafe|security|permission|privilege|inject|xss|csrf|ssrf)[^\n]*/gi,
    category: "security-comment",
    confidence: "low",
  },
];
