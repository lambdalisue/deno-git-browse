import { execute, ExecuteOptions } from "./process.ts";

/**
 * Returns a remote name that contains the given commitish.
 *
 * It returns undefined if there is no remote that contains the commitish.
 * If there are multiple remotes that contain the commitish, it prefer to return "origin" or the first one.
 */
export async function getRemoteContains(
  commitish: string,
  options: ExecuteOptions = {},
): Promise<string | undefined> {
  try {
    const branches = (await execute(
      ["branch", "-r", "--contains", commitish, "--format=%(refname:short)"],
      options,
    )).trim().split("\n");
    const remotes = (await execute(["remote"], options)).trim().split("\n");
    const remoteContains = remotes.filter((remote) => {
      return branches.some((branch) => branch.startsWith(`${remote}/`));
    });
    // Prefer "origin" if it exists
    return remoteContains.includes("origin") ? "origin" : remoteContains.at(0);
  } catch (err: unknown) {
    if (err instanceof ExecuteError && err.code === 129) {
      // error: malformed object name ...
      return undefined;
    }
    throw err;
  }
}

export async function getRemoteFetchURL(
  remote: string,
  options: ExecuteOptions = {},
): Promise<URL | undefined> {
  const stdout = await execute(
    ["remote", "get-url", remote],
    options,
  );
  const url = stdout.trim().split("\n").at(0);
  if (!url) {
    return undefined;
  }
  return new URL(url.replace(/^git@([^:]+):(.*)\.git$/, "ssh://git@$1/$2"));
}

export async function getCommitSHA1(
  commitish: string,
  options: ExecuteOptions = {},
): Promise<string> {
  const stdout = await execute(
    ["rev-parse", commitish],
    options,
  );
  return stdout.trim();
}

export async function getCommitAbbrevRef(
  commitish: string,
  options: ExecuteOptions = {},
): Promise<string> {
  const stdout = await execute(
    ["rev-parse", "--abbrev-ref", commitish],
    options,
  );
  return stdout.trim() || commitish;
}
