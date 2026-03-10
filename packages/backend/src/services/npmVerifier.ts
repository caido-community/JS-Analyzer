import { fetch, Request as FetchRequest } from "caido:http";
import type { NpmVerificationResult } from "shared";

const NPM_REGISTRY_URL = "https://registry.npmjs.org";

export async function verifyPackageOnNpm(
  packageName: string,
): Promise<NpmVerificationResult> {
  const encodedName = packageName.replace("/", "%2f");
  const url = `${NPM_REGISTRY_URL}/${encodedName}`;

  const request = new FetchRequest(url, {
    headers: {
      Accept: "application/json",
    },
  });

  const response = await fetch(request);

  if (response.status === 200) {
    return {
      packageName,
      exists: true,
      isOrgClaimed: undefined,
    };
  }

  if (response.status === 404) {
    const isScoped = packageName.startsWith("@");
    let isOrgClaimed: boolean | undefined;

    if (isScoped) {
      const orgName = packageName.split("/")[0]!;
      isOrgClaimed = await checkOrgExists(orgName);
    }

    return {
      packageName,
      exists: false,
      isOrgClaimed,
    };
  }

  return {
    packageName,
    exists: true,
    isOrgClaimed: undefined,
  };
}

async function checkOrgExists(orgName: string): Promise<boolean> {
  const encodedOrg = orgName.replace("@", "");
  const url = `${NPM_REGISTRY_URL}/-/org/${encodedOrg}/package`;

  const request = new FetchRequest(url, {
    headers: {
      Accept: "application/json",
    },
  });

  const response = await fetch(request);
  return response.status !== 404;
}

export async function verifyPackagesOnNpm(
  packageNames: string[],
): Promise<NpmVerificationResult[]> {
  const results: NpmVerificationResult[] = [];

  for (const name of packageNames) {
    const result = await verifyPackageOnNpm(name);
    results.push(result);
  }

  return results;
}
