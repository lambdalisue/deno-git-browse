import { execute, ExecuteOptions } from "./process.ts";

export async function getRemoteContains(
  options: ExecuteOptions = {},
): Promise<string | undefined> {
  const stdout = await execute(
    // ref: https://git-scm.com/docs/git-config/2.30.0#Documentation/git-config.txt-clonedefaultRemoteName
    ["config", "--default", "origin", "--get", "clone.defaultRemoteName"],
    options,
  );
  return stdout.trim().split("\n").at(0);
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
