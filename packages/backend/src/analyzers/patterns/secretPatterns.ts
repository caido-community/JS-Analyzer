export type SecretPattern = {
  name: string;
  regex: RegExp;
  confidence: "low" | "medium" | "high";
};

export const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: "AWS Access Key",
    regex: /(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/g,
    confidence: "high",
  },
  {
    name: "AWS Secret Key",
    regex:
      /(?:aws_secret_access_key|aws_secret)\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/gi,
    confidence: "high",
  },
  {
    name: "GitHub Token",
    regex: /gh[pousr]_[A-Za-z0-9_]{36,255}/g,
    confidence: "high",
  },
  {
    name: "GitHub Classic Token",
    regex: /ghp_[A-Za-z0-9]{36}/g,
    confidence: "high",
  },
  {
    name: "Google API Key",
    regex: /AIza[0-9A-Za-z_-]{35}/g,
    confidence: "high",
  },
  {
    name: "Google OAuth Token",
    regex: /ya29\.[0-9A-Za-z_-]+/g,
    confidence: "medium",
  },
  {
    name: "Slack Token",
    regex: /xox[bpors]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,34}/g,
    confidence: "high",
  },
  {
    name: "Slack Webhook",
    regex:
      /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]{8,}\/B[a-zA-Z0-9_]{8,}\/[a-zA-Z0-9_]{24,}/g,
    confidence: "high",
  },
  {
    name: "Stripe Secret Key",
    regex: /sk_live_[0-9a-zA-Z]{24,}/g,
    confidence: "high",
  },
  {
    name: "Stripe Publishable Key",
    regex: /pk_live_[0-9a-zA-Z]{24,}/g,
    confidence: "medium",
  },
  {
    name: "Twilio API Key",
    regex: /SK[0-9a-fA-F]{32}/g,
    confidence: "medium",
  },
  {
    name: "Mailgun API Key",
    regex: /key-[0-9a-zA-Z]{32}/g,
    confidence: "medium",
  },
  {
    name: "SendGrid API Key",
    regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g,
    confidence: "high",
  },
  {
    name: "Heroku API Key",
    regex:
      /(?:heroku_api_key|heroku_key|heroku_secret)\s*[:=]\s*["']?([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})["']?/gi,
    confidence: "high",
  },
  {
    name: "Firebase Key",
    regex:
      /(?:firebase_api_key|firebase_key)\s*[:=]\s*["']?([A-Za-z0-9_-]{39})["']?/gi,
    confidence: "medium",
  },
  {
    name: "Private Key",
    regex: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/g,
    confidence: "high",
  },
  {
    name: "JWT Token",
    regex: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    confidence: "medium",
  },
  {
    name: "Generic API Key Assignment",
    regex:
      /(?:api_key|apikey|api_secret|apisecret|secret_key|secretkey|access_token|auth_token|client_secret)\s*[:=]\s*["']([A-Za-z0-9_\-/.+=]{16,})["']/gi,
    confidence: "medium",
  },
  {
    name: "Bearer Token",
    regex: /["']Bearer\s+[A-Za-z0-9_\-/.+=]{20,}["']/g,
    confidence: "medium",
  },
  {
    name: "Basic Auth",
    regex: /["']Basic\s+[A-Za-z0-9+/=]{10,}["']/g,
    confidence: "medium",
  },
  {
    name: "Password Assignment",
    regex: /(?:password|passwd|pwd)\s*[:=]\s*["']([^"'\s]{8,})["']/gi,
    confidence: "low",
  },
  {
    name: "Datadog API Key",
    regex: /(?:dd_api_key|datadog_api_key)\s*[:=]\s*["']?([a-f0-9]{32})["']?/gi,
    confidence: "high",
  },
  {
    name: "Datadog App Key",
    regex: /(?:dd_app_key|datadog_app_key)\s*[:=]\s*["']?([a-f0-9]{40})["']?/gi,
    confidence: "high",
  },
  {
    name: "npm Token",
    regex: /npm_[A-Za-z0-9]{36}/g,
    confidence: "high",
  },
  {
    name: "PyPI Token",
    regex: /pypi-AgEIcHlwaS5vcmc[A-Za-z0-9_-]{50,}/g,
    confidence: "high",
  },
  {
    name: "Docker Hub Token",
    regex: /dckr_pat_[A-Za-z0-9_-]{27,}/g,
    confidence: "high",
  },
  {
    name: "CircleCI Token",
    regex:
      /(?:circle_token|circleci_token)\s*[:=]\s*["']?([a-f0-9]{40})["']?/gi,
    confidence: "high",
  },
  {
    name: "Travis CI Token",
    regex:
      /(?:travis_token|travis_api_token)\s*[:=]\s*["']?([A-Za-z0-9_-]{22,})["']?/gi,
    confidence: "medium",
  },
  {
    name: "Terraform Cloud Token",
    regex: /[a-zA-Z0-9]{14}\.atlasv1\.[a-zA-Z0-9_-]{60,}/g,
    confidence: "high",
  },
  {
    name: "Shopify Access Token",
    regex: /shpat_[a-fA-F0-9]{32}/g,
    confidence: "high",
  },
  {
    name: "Shopify Shared Secret",
    regex: /shpss_[a-fA-F0-9]{32}/g,
    confidence: "high",
  },
  {
    name: "Square Access Token",
    regex: /sq0atp-[0-9A-Za-z_-]{22}/g,
    confidence: "high",
  },
  {
    name: "Square OAuth Secret",
    regex: /sq0csp-[0-9A-Za-z_-]{43}/g,
    confidence: "high",
  },
  {
    name: "Atlassian API Token",
    regex:
      /(?:atlassian_api_token|jira_token|confluence_token)\s*[:=]\s*["']?([A-Za-z0-9]{24,})["']?/gi,
    confidence: "medium",
  },
  {
    name: "Discord Bot Token",
    regex: /[MN][A-Za-z0-9]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,40}/g,
    confidence: "high",
  },
  {
    name: "Discord Webhook",
    regex:
      /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]+/g,
    confidence: "high",
  },
  {
    name: "Telegram Bot Token",
    regex: /[0-9]{8,10}:[A-Za-z0-9_-]{35}/g,
    confidence: "medium",
  },
  {
    name: "Linear API Key",
    regex: /lin_api_[A-Za-z0-9]{40}/g,
    confidence: "high",
  },
  {
    name: "Vault Token",
    regex: /hvs\.[A-Za-z0-9_-]{24,}/g,
    confidence: "high",
  },
  {
    name: "Supabase Key",
    regex:
      /(?:supabase_key|supabase_anon_key|supabase_service_key)\s*[:=]\s*["']?(eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)["']?/gi,
    confidence: "high",
  },
  {
    name: "Algolia API Key",
    regex:
      /(?:algolia_api_key|algolia_admin_key)\s*[:=]\s*["']?([a-f0-9]{32})["']?/gi,
    confidence: "medium",
  },
  {
    name: "Sentry DSN",
    regex: /https:\/\/[a-f0-9]{32}@[a-z0-9.-]+\.ingest\.sentry\.io\/[0-9]+/g,
    confidence: "high",
  },
  {
    name: "PagerDuty Integration Key",
    regex:
      /(?:pagerduty_key|pd_integration_key)\s*[:=]\s*["']?([a-f0-9]{32})["']?/gi,
    confidence: "medium",
  },
];
