import type { ExecuteOptions } from "./process.ts";
import { getHostingService } from "./hosting_service/mod.ts";
import { getRemoteContains, getRemoteFetchURL } from "./util.ts";

type Options = ExecuteOptions & {
  remote?: string;
  aliases?: Record<string, string>;
};

export async function getCommitURL(
  commitish: string,
  options: Options = {},
): Promise<URL> {
  if (!options.remote) {
    const remote = await getRemoteContains(commitish, options);
    return getCommitURL(commitish, { ...options, remote: remote ?? "origin" });
  }
  const fetchURL = await getRemoteFetchURL(options.remote, options);
  if (!fetchURL) {
    throw new Error(`Remote '${options.remote}' has no fetch URL`);
  }
  const hostingService = await getHostingService(fetchURL, options);
  return hostingService.getCommitURL(fetchURL, commitish);
}
