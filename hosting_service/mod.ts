export type Range = number | [number, number];

export type HostingService = {
  getHomeURL(fetchURL: URL): URL;

  getCommitURL(fetchURL: URL, commitish: string): URL;

  getTreeURL(fetchURL: URL, commitish: string, path: string): URL;

  getBlobURL(
    fetchURL: URL,
    commitish: string,
    path: string,
    options?: { range?: Range },
  ): URL;

  getPullRequestURL?(fetchURL: URL, number: number): URL;
};

/**
 * Get git hosting service from URL
 */
export async function getHostingService(
  fetchURL: URL,
  { aliases }: { aliases?: Record<string, string> } = {},
): Promise<HostingService> {
  const hostname = aliases?.[fetchURL.hostname] ?? fetchURL.hostname;
  const svcName = hostname.replace(/\W/g, "_");
  const svc = await import(
    new URL(`./services/${svcName}.ts`, import.meta.url).href
  );
  return svc.service;
}
