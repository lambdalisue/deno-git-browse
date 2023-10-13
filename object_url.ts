import { execute, ExecuteOptions } from "./process.ts";
import { getHostingService, Range } from "./hosting_service/mod.ts";
import { getRemoteContains, getRemoteFetchURL } from "./util.ts";

type Options = ExecuteOptions & {
  remote?: string;
  permalink?: boolean;
  aliases?: Record<string, string>;
};

export async function getObjectURL(
  commitish: string,
  path: string,
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
  const [normPath, range] = parsePath(path);
  const objectType = await getObjectType(commitish, normPath, options);
  if (objectType === "tree") {
    return hostingService.getTreeURL(fetchURL, commitish, normPath);
  }
  return hostingService.getBlobURL(fetchURL, commitish, normPath, { range });
}

type ObjectType = "blob" | "tree" | "commit";

async function getObjectType(
  commitish: string,
  path: string,
  options: ExecuteOptions = {},
): Promise<ObjectType | undefined> {
  const stdout = await execute(
    ["ls-tree", "-t", commitish, path],
    options,
  );
  return stdout
    .trim()
    .split("\n")
    .find((line) => line.includes(path))
    ?.split(" ")
    .at(1) as ObjectType;
}

function parsePath(path: string): [string, Range | undefined] {
  const m = path.match(/^(.*?):(\d+)(?::(\d+))?$/);
  if (!m) {
    return [path, undefined];
  } else if (m[3]) {
    return [m[1], [Number(m[2]), Number(m[3])]];
  }
  return [m[1], Number(m[2])];
}
