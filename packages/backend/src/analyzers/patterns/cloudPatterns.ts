export type CloudPattern = {
  provider: string;
  regex: RegExp;
};

export const CLOUD_PATTERNS: CloudPattern[] = [
  {
    provider: "AWS S3",
    regex:
      /(?:https?:\/\/)?[a-z0-9][a-z0-9.-]*\.s3(?:[.-](?:us|eu|ap|sa|ca|me|af)-(?:east|west|north|south|central|southeast|northeast)-\d)?\.amazonaws\.com/gi,
  },
  {
    provider: "AWS S3 Path",
    regex:
      /(?:https?:\/\/)?s3(?:[.-](?:us|eu|ap|sa|ca|me|af)-(?:east|west|north|south|central|southeast|northeast)-\d)?\.amazonaws\.com\/[a-z0-9][a-z0-9.-]*/gi,
  },
  {
    provider: "AWS General",
    regex:
      /(?:https?:\/\/)?[a-z0-9.-]+\.(?:execute-api|elasticbeanstalk|elb\.amazonaws|s3-website|apigateway)\.(?:us|eu|ap|sa|ca|me|af)-(?:east|west|north|south|central|southeast|northeast)-\d\.amazonaws\.com/gi,
  },
  {
    provider: "CloudFront",
    regex: /(?:https?:\/\/)?[a-z0-9]+\.cloudfront\.net/gi,
  },
  {
    provider: "Azure Blob",
    regex: /(?:https?:\/\/)?[a-z0-9]+\.blob\.core\.windows\.net/gi,
  },
  {
    provider: "Azure Websites",
    regex: /(?:https?:\/\/)?[a-z0-9-]+\.azurewebsites\.net/gi,
  },
  {
    provider: "Azure CDN",
    regex: /(?:https?:\/\/)?[a-z0-9-]+\.azureedge\.net/gi,
  },
  {
    provider: "Azure API Management",
    regex: /(?:https?:\/\/)?[a-z0-9-]+\.azure-api\.net/gi,
  },
  {
    provider: "GCP Storage",
    regex: /(?:https?:\/\/)?storage\.googleapis\.com\/[a-z0-9][a-z0-9._-]*/gi,
  },
  {
    provider: "GCP Storage Bucket",
    regex: /(?:https?:\/\/)?[a-z0-9][a-z0-9._-]*\.storage\.googleapis\.com/gi,
  },
  {
    provider: "Firebase",
    regex: /(?:https?:\/\/)?[a-z0-9-]+\.firebaseio\.com/gi,
  },
  {
    provider: "Firebase App",
    regex: /(?:https?:\/\/)?[a-z0-9-]+\.firebaseapp\.com/gi,
  },
  {
    provider: "Firebase Storage",
    regex:
      /(?:https?:\/\/)?firebasestorage\.googleapis\.com\/v0\/b\/[a-z0-9-]+/gi,
  },
  {
    provider: "DigitalOcean Spaces",
    regex:
      /(?:https?:\/\/)?[a-z0-9-]+\.(?:nyc3|sfo2|sfo3|ams3|sgp1|fra1|blr1|syd1)\.digitaloceanspaces\.com/gi,
  },
  {
    provider: "DigitalOcean CDN",
    regex:
      /(?:https?:\/\/)?[a-z0-9-]+\.(?:nyc3|sfo2|sfo3|ams3|sgp1|fra1|blr1|syd1)\.cdn\.digitaloceanspaces\.com/gi,
  },
  {
    provider: "Oracle Cloud",
    regex:
      /(?:https?:\/\/)?objectstorage\.[a-z0-9-]+\.oraclecloud\.com\/n\/[a-z0-9]+/gi,
  },
  {
    provider: "Alibaba Cloud OSS",
    regex: /(?:https?:\/\/)?[a-z0-9-]+\.oss-[a-z0-9-]+\.aliyuncs\.com/gi,
  },
  {
    provider: "Rackspace Cloud Files",
    regex: /(?:https?:\/\/)?[a-f0-9-]+\.ssl\.cf[1-5]\.rackcdn\.com/gi,
  },
  {
    provider: "DreamHost Objects",
    regex: /(?:https?:\/\/)?objects-[a-z0-9-]+\.dream\.io/gi,
  },
  {
    provider: "Backblaze B2",
    regex: /(?:https?:\/\/)?f[0-9]{3}\.backblazeb2\.com\/file\/[a-z0-9-]+/gi,
  },
];
