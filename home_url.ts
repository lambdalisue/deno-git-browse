import type { ExecuteOptions } from "./process.ts";
import { getHostingService } from "./hosting_service/mod.ts";
import { getRemoteContains, getRemoteFetchURL } from "./util.ts";

export type Options = ExecuteOptions & {
  remote?: string;
  aliases?: Record<string, string>;
};

export async function getHomeURL(
  options: Options = {},
): Promise<URL> {
  const remote = options.remote ??
    await getRemoteContains("HEAD", options) ??
    "origin";
  const fetchURL = await getRemoteFetchURL(remote, options);
  if (!fetchURL) {
    throw new Error(`No remote '${remote}' found or failed to get fetch URL.`);
  }
  const hostingService = await getHostingService(fetchURL, options);
  return hostingService.getHomeURL(fetchURL);
}
