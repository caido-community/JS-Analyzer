type SinkPattern = {
  name: string;
  regex: RegExp;
  category: "xss-sink" | "xss-source" | "prototype-pollution" | "cors";
  confidence: "low" | "medium" | "high";
};

export const SECURITY_SINK_PATTERNS: SinkPattern[] = [
  {
    name: "innerHTML Assignment",
    regex: /\.innerHTML\s*=[^=]/g,
    category: "xss-sink",
    confidence: "high",
  },
  {
    name: "outerHTML Assignment",
    regex: /\.outerHTML\s*=[^=]/g,
    category: "xss-sink",
    confidence: "high",
  },
  {
    name: "document.write",
    regex: /document\.write\s*\(/g,
    category: "xss-sink",
    confidence: "high",
  },
  {
    name: "document.writeln",
    regex: /document\.writeln\s*\(/g,
    category: "xss-sink",
    confidence: "high",
  },
  {
    name: "insertAdjacentHTML",
    regex: /\.insertAdjacentHTML\s*\(/g,
    category: "xss-sink",
    confidence: "high",
  },
  {
    name: "eval()",
    regex: /\beval\s*\(/g,
    category: "xss-sink",
    confidence: "high",
  },
  {
    name: "Function() constructor",
    regex: /new\s+Function\s*\(/g,
    category: "xss-sink",
    confidence: "high",
  },
  {
    name: "setTimeout with string",
    regex: /setTimeout\s*\(\s*["'`]/g,
    category: "xss-sink",
    confidence: "medium",
  },
  {
    name: "setInterval with string",
    regex: /setInterval\s*\(\s*["'`]/g,
    category: "xss-sink",
    confidence: "medium",
  },
  {
    name: ".src assignment",
    regex: /\.src\s*=[^=]\s*[^"'`\s;]/g,
    category: "xss-sink",
    confidence: "medium",
  },
  {
    name: ".href assignment",
    regex: /(?:location|window)\.href\s*=[^=]/g,
    category: "xss-sink",
    confidence: "medium",
  },
  {
    name: "jQuery .html()",
    regex: /\$\([^)]*\)\.html\s*\(/g,
    category: "xss-sink",
    confidence: "high",
  },
  {
    name: "jQuery .append() with variable",
    regex: /\$\([^)]*\)\.append\s*\(\s*[^"'`<]/g,
    category: "xss-sink",
    confidence: "medium",
  },

  {
    name: "location.hash",
    regex: /(?:window\.)?location\.hash/g,
    category: "xss-source",
    confidence: "medium",
  },
  {
    name: "location.search",
    regex: /(?:window\.)?location\.search/g,
    category: "xss-source",
    confidence: "medium",
  },
  {
    name: "location.href read",
    regex: /(?:window\.)?location\.href(?!\s*=)/g,
    category: "xss-source",
    confidence: "medium",
  },
  {
    name: "document.referrer",
    regex: /document\.referrer/g,
    category: "xss-source",
    confidence: "medium",
  },
  {
    name: "window.name",
    regex: /window\.name(?!\s*=)/g,
    category: "xss-source",
    confidence: "medium",
  },
  {
    name: "document.URL",
    regex: /document\.URL/g,
    category: "xss-source",
    confidence: "medium",
  },
  {
    name: "document.documentURI",
    regex: /document\.documentURI/g,
    category: "xss-source",
    confidence: "medium",
  },
  {
    name: "URLSearchParams",
    regex: /new\s+URLSearchParams\s*\(\s*(?:window\.)?location/g,
    category: "xss-source",
    confidence: "medium",
  },

  {
    name: "__proto__ access",
    regex: /\.__proto__\b/g,
    category: "prototype-pollution",
    confidence: "medium",
  },
  {
    name: "constructor.prototype",
    regex: /\.constructor\.prototype/g,
    category: "prototype-pollution",
    confidence: "medium",
  },
  {
    name: "Object.assign with spread",
    regex: /Object\.assign\s*\(\s*\{\s*\}\s*,/g,
    category: "prototype-pollution",
    confidence: "low",
  },

  {
    name: "postMessage without origin check",
    regex: /addEventListener\s*\(\s*["']message["']\s*,\s*(?:function|\()/g,
    category: "cors",
    confidence: "medium",
  },
  {
    name: "Access-Control-Allow-Origin wildcard",
    regex: /Access-Control-Allow-Origin[^*\n]{0,20}\*/g,
    category: "cors",
    confidence: "high",
  },
  {
    name: "postMessage wildcard origin",
    regex: /\.postMessage\s*\([^)]*,\s*["']\*["']\s*\)/g,
    category: "cors",
    confidence: "high",
  },
];
