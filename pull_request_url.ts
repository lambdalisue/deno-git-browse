import { execute, ExecuteOptions } from "./process.ts";
import { getHostingService, HostingService } from "./hosting_service/mod.ts";
import {
  __throw,
  getCommitSHA1,
  getRemoteContains,
  getRemoteFetchURL,
} from "./util.ts";

type Options = ExecuteOptions & {
  remote?: string;
  aliases?: Record<string, string>;
};

export async function getPullRequestURL(
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
  if (!hostingService.getPullRequestURL) {
    throw new Error(
      `Hosting service of ${fetchURL} has no pull request URL`,
    );
  }
  const pr = await getPullRequestContains(
    hostingService,
    commitish,
    remote,
    options,
  );
  if (!pr) {
    throw new Error(`No pull request found for ${commitish}`);
  }
  return hostingService.getPullRequestURL(fetchURL, pr);
}

async function getPullRequestContains(
  hostingService: HostingService,
  commitish: string,
  remote: string,
  options: ExecuteOptions = {},
): Promise<number | undefined> {
  if (!hostingService.extractPullRequestID) {
    throw new Error("Hosting service has no pull request ID extractor");
  }
  const branch = await getRemoteDefaultBranch(remote, options) ?? "main";
  const sha = await getCommitSHA1(commitish, options) ?? __throw(
    new Error(`No commit found for ${commitish}`),
  );
  let stdout: string;
  // The sha may points to a merge commit itself.
  stdout = await execute(
    [
      "log",
      "-1",
      sha,
    ],
    options,
  );
  const pr = hostingService.extractPullRequestID(stdout);
  if (pr) {
    return pr;
  }
  // Try to find the merge commit that contains the sha
  const ancestraryPath = `${sha}...${remote}/${branch}`;
  stdout = await execute(
    [
      "log",
      "--merges",
      "--reverse",
      "--ancestry-path",
      ancestraryPath,
    ],
    options,
  );
  return hostingService.extractPullRequestID(stdout);
}

async function getRemoteDefaultBranch(
  remote: string,
  options: ExecuteOptions = {},
): Promise<string | undefined> {
  const stdout = await execute(
    ["remote", "show", remote],
    options,
  );
  const m = stdout.match(/HEAD branch: (.*)/);
  if (!m) {
    return undefined;
  }
  return m[1].trim();
}
