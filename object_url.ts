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
  if (!options.remote) {
    const remote = await getRemoteContains(options);
    return getObjectURL(commitish, path, {
      ...options,
      remote: remote ?? "origin",
    });
  }
  const fetchURL = await getRemoteFetchURL(options.remote, options);
  if (!fetchURL) {
    throw new Error(`Remote '${options.remote}' has no fetch URL`);
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
  return stdout.trim().split("\n").at(0)?.split(" ").at(1) as ObjectType;
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
