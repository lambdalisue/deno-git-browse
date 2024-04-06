import type { HostingService, Range } from "../mod.ts";
import type { ExecuteOptions } from "../../process.ts";
import { extname } from "jsr:@std/path";
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
    const pathname = `commits/${sha}`;
    return Promise.resolve(new URL(`${urlBase}/${pathname}`));
  },

  getTreeURL(
    fetchURL: URL,
    commitish: string,
    path: string,
    _options?: ExecuteOptions,
  ): Promise<URL> {
    const urlBase = formatURLBase(fetchURL);
    const pathname = `src/${commitish}/${path}`;
    return Promise.resolve(new URL(`${urlBase}/${pathname}`));
  },

  getBlobURL(
    fetchURL: URL,
    commitish: string,
    path: string,
    { range }: { range?: Range } & ExecuteOptions = {},
  ): Promise<URL> {
    const urlBase = formatURLBase(fetchURL);
    if (!range || extname(path) !== ".md") {
      const suffix = formatSuffix(range);
      const pathname = `src/${commitish}/${path}${suffix}`;
      return Promise.resolve(new URL(`${urlBase}/${pathname}`));
    }
    // Bitbucket does not provide `?plain=1` like GitHub so we need to use annotation URL
    // instead to proerply select the line range of Markdown file
    const suffix = formatSuffix(range);
    const pathname = `annotate/${commitish}/${path}${suffix}`;
    return Promise.resolve(new URL(`${urlBase}/${pathname}`));
  },
};

function formatURLBase(fetchURL: URL): string {
  const [owner, repo] = fetchURL.pathname.split("/").slice(1);
  return `https://${fetchURL.hostname}/${owner}/${repo.replace(/\.git$/, "")}`;
}

function formatSuffix(range: Range | undefined): string {
  if (Array.isArray(range)) {
    return `#lines-${range[0]}:${range[1]}`;
  } else if (range) {
    return `#lines-${range}`;
  }
  return "";
}
