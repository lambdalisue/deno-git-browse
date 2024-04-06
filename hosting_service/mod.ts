import type { ExecuteOptions } from "../process.ts";
import { service as bitbucket_org } from "./services/bitbucket_org.ts";
import { service as github_com } from "./services/github_com.ts";
import { service as gitlab_com } from "./services/gitlab_com.ts";

const serviceMap = {
  bitbucket_org,
  github_com,
  gitlab_com,
};

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
export function getHostingService(
  fetchURL: URL,
  { aliases }: { aliases?: Record<string, string> } = {},
): HostingService {
  const hostname = aliases?.[fetchURL.hostname] ?? fetchURL.hostname;
  const svcName = hostname.replace(/\W/g, "_");
  // deno-lint-ignore no-explicit-any
  const svc = (serviceMap as any)[svcName];
  if (!svc) {
    throw new UnsupportedHostingServiceError(hostname, svcName);
  }
  return svc;
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
