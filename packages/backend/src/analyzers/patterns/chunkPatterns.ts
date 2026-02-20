type ChunkPattern = {
  name: string;
  regex: RegExp;
  bundler: "webpack" | "vite" | "nextjs" | "nuxtjs";
  confidence: "low" | "medium" | "high";
};

export const CHUNK_PATTERNS: ChunkPattern[] = [
  {
    name: "webpackJsonp",
    regex: /\bwebpackJsonp\b/g,
    bundler: "webpack",
    confidence: "high",
  },
  {
    name: "__webpack_require__",
    regex: /__webpack_require__\b/g,
    bundler: "webpack",
    confidence: "high",
  },
  {
    name: "__webpack_modules__",
    regex: /__webpack_modules__\b/g,
    bundler: "webpack",
    confidence: "high",
  },
  {
    name: "webpack public path",
    regex: /__webpack_require__\.p\s*=\s*["'`]([^"'`]+)["'`]/g,
    bundler: "webpack",
    confidence: "high",
  },
  {
    name: "webpack chunk loading",
    regex: /__webpack_require__\.e\s*\(/g,
    bundler: "webpack",
    confidence: "high",
  },
  {
    name: "webpack chunk URL template",
    regex: /["'`]((?:static\/|assets\/)?chunks?\/[^"'`\s]+\.js)["'`]/g,
    bundler: "webpack",
    confidence: "medium",
  },
  {
    name: "webpack chunk hash map",
    regex: /\{\s*(?:\d+\s*:\s*["'][a-f0-9]+["']\s*,?\s*){3,}\}/g,
    bundler: "webpack",
    confidence: "medium",
  },

  {
    name: "Vite dynamic import",
    regex: /import\s*\(\s*["'`]\.?\/?([^"'`]+\.js)["'`]\s*\)/g,
    bundler: "vite",
    confidence: "medium",
  },
  {
    name: "__vite_ssr_dynamic_import__",
    regex: /__vite_ssr_dynamic_import__/g,
    bundler: "vite",
    confidence: "high",
  },
  {
    name: "Vite module preload",
    regex: /__vitePreload\b|__vite__mapDeps\b/g,
    bundler: "vite",
    confidence: "high",
  },
  {
    name: "Vite asset path",
    regex: /["'`](\/assets\/[a-zA-Z0-9_-]+\.[a-f0-9]+\.js)["'`]/g,
    bundler: "vite",
    confidence: "medium",
  },

  {
    name: "Next.js chunk path",
    regex: /["'`](\/_next\/static\/chunks\/[^"'`\s]+)["'`]/g,
    bundler: "nextjs",
    confidence: "high",
  },
  {
    name: "Next.js _buildManifest",
    regex: /_buildManifest\.js/g,
    bundler: "nextjs",
    confidence: "high",
  },
  {
    name: "Next.js _ssgManifest",
    regex: /_ssgManifest\.js/g,
    bundler: "nextjs",
    confidence: "high",
  },
  {
    name: "Next.js self.__next_f",
    regex: /self\.__next_f\b/g,
    bundler: "nextjs",
    confidence: "high",
  },
  {
    name: "Next.js page data",
    regex: /["'`](\/_next\/data\/[^"'`\s]+\.json)["'`]/g,
    bundler: "nextjs",
    confidence: "high",
  },
  {
    name: "Next.js static media",
    regex: /["'`](\/_next\/static\/media\/[^"'`\s]+)["'`]/g,
    bundler: "nextjs",
    confidence: "medium",
  },

  {
    name: "Nuxt.js _nuxt path",
    regex: /["'`](\/_nuxt\/[^"'`\s]+\.js)["'`]/g,
    bundler: "nuxtjs",
    confidence: "high",
  },
  {
    name: "Nuxt.js __NUXT__",
    regex: /(?:window\.)?__NUXT__\b/g,
    bundler: "nuxtjs",
    confidence: "high",
  },
  {
    name: "Nuxt.js buildAssetsDir",
    regex: /buildAssetsDir\s*:\s*["'`]([^"'`]+)["'`]/g,
    bundler: "nuxtjs",
    confidence: "medium",
  },
  {
    name: "Nuxt.js payload",
    regex: /["'`](\/_payload\.json)["'`]/g,
    bundler: "nuxtjs",
    confidence: "high",
  },
];
