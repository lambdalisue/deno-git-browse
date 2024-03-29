import type { HostingService, Range } from "../mod.ts";
import type { ExecuteOptions } from "../../process.ts";
import { getCommitSHA1 } from "../../util.ts";

export const service: HostingService = {
  getHomeURL(fetchURL: URL, _options?: ExecuteOptions): Promise<URL> {
    return Promise.resolve(new URL(formatURLBase(fetchURL)));
  },

  async getCommitURL(
    fetchURL: URL,
    commitish: string,
    options: ExecuteOptions = {},
  ): Promise<URL> {
    const sha = await getCommitSHA1(commitish, options) ?? commitish;
    const urlBase = formatURLBase(fetchURL);
    const pathname = `-/commit/${sha}`;
    return Promise.resolve(new URL(`${urlBase}/${pathname}`));
  },

  getTreeURL(
    fetchURL: URL,
    commitish: string,
    path: string,
    _options?: ExecuteOptions,
  ): Promise<URL> {
    const urlBase = formatURLBase(fetchURL);
    const pathname = `-/tree/${commitish}/${path}`;
    return Promise.resolve(new URL(`${urlBase}/${pathname}`));
  },

  getBlobURL(
    fetchURL: URL,
    commitish: string,
    path: string,
    { range }: { range?: Range } & ExecuteOptions = {},
  ): Promise<URL> {
    const urlBase = formatURLBase(fetchURL);
    const suffix = formatSuffix(range);
    const pathname = `-/blob/${commitish}/${path}${suffix}`;
    return Promise.resolve(new URL(`${urlBase}/${pathname}`));
  },

  getPullRequestURL(
    fetchURL: URL,
    n: number,
    _options?: ExecuteOptions,
  ): Promise<URL> {
    const urlBase = formatURLBase(fetchURL);
    const pathname = `-/merge_requests/${n}`;
    return Promise.resolve(new URL(`${urlBase}/${pathname}`));
  },

  extractPullRequestID(commit: string): number | undefined {
    const m = commit.match(/See merge request (?:.*)!(\d+)/);
    if (m) {
      return Number(m[1]);
    }
    return undefined;
  },
};

function formatURLBase(fetchURL: URL): string {
  const [owner, repo] = fetchURL.pathname.split("/").slice(1);
  return `https://${fetchURL.hostname}/${owner}/${repo.replace(/\.git$/, "")}`;
}

function formatSuffix(range: Range | undefined): string {
  // Note:
  // Without `?plain=1`, GitHub shows the rendering result of content (e.g. Markdown) so that we
  // cannot specify the line range.
  if (Array.isArray(range)) {
    return `?plain=1#L${range[0]}-${range[1]}`;
  } else if (range) {
    return `?plain=1#L${range}`;
  }
  return "";
}
