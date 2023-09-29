import { execute, ExecuteOptions } from "./process.ts";
import { getHostingService } from "./hosting_service/mod.ts";
import { getCommitSHA1, getRemoteContains, getRemoteFetchURL } from "./util.ts";

type Options = ExecuteOptions & {
  remote?: string;
  aliases?: Record<string, string>;
};

export async function getPullRequestURL(
  commitish: string,
  options: Options = {},
): Promise<URL> {
  if (!options.remote) {
    const remote = await getRemoteContains(options);
    return getPullRequestURL(commitish, {
      ...options,
      remote: remote ?? "origin",
    });
  }
  const fetchURL = await getRemoteFetchURL(options.remote, options);
  if (!fetchURL) {
    throw new Error(`Remote '${options.remote}' has no fetch URL`);
  }
  const hostingService = await getHostingService(fetchURL, options);
  if (!hostingService.getPullRequestURL) {
    throw new Error(
      `Hosting service of ${fetchURL} has no pull request URL`,
    );
  }
  const pr = await getPullRequestContains(
    commitish,
    options.remote,
    options,
  );
  if (!pr) {
    throw new Error(`No pull request found for ${commitish}`);
  }
  return hostingService.getPullRequestURL(fetchURL, pr);
}

async function getPullRequestContains(
  commitish: string,
  remote: string,
  options: ExecuteOptions = {},
): Promise<number | undefined> {
  const branch = await getRemoteDefaultBranch(remote, options) ?? "main";
  const sha = await getCommitSHA1(commitish, options);
  let stdout: string;
  // The sha may points to a merge commit itself.
  stdout = await execute(
    [
      "log",
      "--oneline",
      "-1",
      sha,
    ],
    options,
  );
  const pr = parseMerges(stdout);
  if (pr) {
    return pr;
  }
  // Try to find the merge commit that contains the sha
  const ancestraryPath = `${sha}...${remote}/${branch}`;
  stdout = await execute(
    [
      "log",
      "--merges",
      "--oneline",
      "--reverse",
      "--ancestry-path",
      ancestraryPath,
    ],
    options,
  );
  return parseMerges(stdout);
}

async function getRemoteDefaultBranch(
  remote: string,
  options: ExecuteOptions = {},
): Promise<string | undefined> {
  const stdout = await execute(
    ["remote", "show", remote],
    options,
  );
  const m = stdout.match(/HEAD branch: (.*)$/);
  if (!m) {
    return undefined;
  }
  return m[1].trim();
}

function parseMerges(stdout: string): number | undefined {
  const record = stdout.trim().split("\n").at(0);
  if (!record) {
    return undefined;
  }
  const m = record.match(/Merge pull request #(\d+)/);
  if (!m) {
    return undefined;
  }
  return Number(m[1]);
}
