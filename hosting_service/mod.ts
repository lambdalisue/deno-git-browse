import type { ExecuteOptions } from "../process.ts";

export type Range = number | [number, number];

export type HostingService = {
  getHomeURL(fetchURL: URL, options?: ExecuteOptions): Promise<URL>;

  getCommitURL(
    fetchURL: URL,
    commitish: string,
    options?: ExecuteOptions,
  ): Promise<URL>;

  getTreeURL(
    fetchURL: URL,
    commitish: string,
    path: string,
    options?: ExecuteOptions,
  ): Promise<URL>;

  getBlobURL(
    fetchURL: URL,
    commitish: string,
    path: string,
    options?: { range?: Range } & ExecuteOptions,
  ): Promise<URL>;

  getPullRequestURL?(
    fetchURL: URL,
    number: number,
    options?: ExecuteOptions,
  ): Promise<URL>;

  extractPullRequestID?(
    commit: string,
  ): number | undefined;
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
  try {
    const svc = await import(
      new URL(`./services/${svcName}.ts`, import.meta.url).href
    );
    return svc.service;
  } catch (err: unknown) {
    if (err instanceof TypeError) {
      // TypeError: Module not found "...".
      throw new UnsupportedHostingServiceError(hostname, svcName);
    }
    throw err;
  }
}

export class UnsupportedHostingServiceError extends Error {
  constructor(
    public hostname: string,
    public svcName: string,
  ) {
    super(`Unsupported hosting service: ${hostname} (${svcName})`);
    this.name = this.constructor.name;
  }
}
