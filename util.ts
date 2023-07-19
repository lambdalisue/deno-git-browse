import { common } from "https://deno.land/std@0.194.0/path/mod.ts";
import { execute, ExecuteOptions } from "./process.ts";

export async function getRemoteContains(
  commitish: string,
  options: ExecuteOptions = {},
): Promise<string | undefined> {
  const stdout = await execute(
    ["branch", "-r", "--contains", commitish, "--format=%(refname:short)"],
    options,
  );
  const result = common(stdout.trim().split("\n"));
  if (!result) {
    return undefined;
  }
  return result?.substring(0, result.length - 1);
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
