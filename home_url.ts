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
  if (!options.remote) {
    const remote = await getRemoteContains(options);
    return getHomeURL({ ...options, remote: remote ?? "origin" });
  }
  const fetchURL = await getRemoteFetchURL(options.remote, options);
  if (!fetchURL) {
    throw new Error(`Remote '${options.remote}' has no fetch URL`);
  }
  const hostingService = await getHostingService(fetchURL, options);
  return hostingService.getHomeURL(fetchURL);
}
