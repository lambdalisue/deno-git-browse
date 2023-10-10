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
  const remote = options.remote ??
    await getRemoteContains(commitish, options) ??
    "origin";
  const fetchURL = await getRemoteFetchURL(remote, options);
  if (!fetchURL) {
    throw new Error(`No remote '${remote}' found`);
  }
  const hostingService = await getHostingService(fetchURL, options);
  return hostingService.getCommitURL(fetchURL, commitish);
}
