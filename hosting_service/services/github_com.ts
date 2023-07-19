import type { HostingService, Range } from "../mod.ts";

export const service: HostingService = {
  getHomeURL(fetchURL: URL): URL {
    return new URL(formatURLBase(fetchURL));
  },

  getCommitURL(
    fetchURL: URL,
    commitish: string,
  ): URL {
    const urlBase = formatURLBase(fetchURL);
    const pathname = `commit/${commitish}`;
    return new URL(`${urlBase}/${pathname}`);
  },

  getTreeURL(
    fetchURL: URL,
    commitish: string,
    path: string,
  ): URL {
    const urlBase = formatURLBase(fetchURL);
    const pathname = `tree/${commitish}/${path}`;
    return new URL(`${urlBase}/${pathname}`);
  },

  getBlobURL(
    fetchURL: URL,
    commitish: string,
    path: string,
    { range }: { range?: Range } = {},
  ): URL {
    const urlBase = formatURLBase(fetchURL);
    const suffix = formatSuffix(range);
    const pathname = `blob/${commitish}/${path}${suffix}`;
    return new URL(`${urlBase}/${pathname}`);
  },

  getPullRequestURL(fetchURL: URL, n: number): URL {
    const urlBase = formatURLBase(fetchURL);
    const pathname = `pull/${n}`;
    return new URL(`${urlBase}/${pathname}`);
  },
};

function formatURLBase(fetchURL: URL): string {
  const [owner, repo] = fetchURL.pathname.split("/").slice(1);
  return `https://${fetchURL.hostname}/${owner}/${repo}`;
}

function formatSuffix(range: Range | undefined): string {
  // Note:
  // Without `?plain=1`, GitHub shows the rendering result of content (e.g. Markdown) so that we
  // cannot specify the line range.
  if (Array.isArray(range)) {
    return `?plain=1#L${range[0]}-L${range[1]}`;
  } else if (range) {
    return `?plain=1#L${range}`;
  }
  return "";
}
