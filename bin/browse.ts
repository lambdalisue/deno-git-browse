#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env
import { parseArgs } from "jsr:@std/cli@^0.221.0";
import { join } from "jsr:@std/path@^0.221.0";
import { ensure, is } from "jsr:@core/unknownutil@^3.17.2";
import { systemopen } from "jsr:@lambdalisue/systemopen@^1.0.0";
import { dir } from "jsr:@cross/dir@^1.1.0";
import {
  getCommitAbbrevRef,
  getCommitSHA1,
  getCommitURL,
  getHomeURL,
  getObjectURL,
  getPullRequestURL,
} from "../mod.ts";
import { __throw } from "../util.ts";

export type Options = {
  cwd?: string;
  remote?: string;
  path?: string;
  home?: boolean;
  commit?: boolean;
  pr?: boolean;
  permalink?: boolean;
  aliases?: Record<string, string>;
};

export async function getURL(
  commitish: string,
  options: Options = {},
): Promise<URL> {
  options.aliases = options.aliases ?? await readAliasesFile();
  if (options.home) {
    return getHomeURL(options);
  }
  if (options.pr) {
    commitish = await getCommitSHA1(commitish, options) ?? __throw(
      new Error(`No commit found for ${commitish}`),
    );
    return getPullRequestURL(commitish, options);
  }
  commitish = options.permalink
    ? await getCommitSHA1(commitish, options) ?? __throw(
      new Error(`No commit found for ${commitish}`),
    )
    : await getCommitAbbrevRef(commitish, options) ?? __throw(
      new Error(`No commit found for ${commitish}`),
    );
  if (options.commit) {
    return getCommitURL(commitish, options);
  }
  return getObjectURL(commitish, options.path ?? ".", options);
}

export async function readAliasesFile(): Promise<Record<string, string>> {
  const cdir = await dir("config");
  if (!cdir) {
    return {};
  }
  try {
    return JSON.parse(
      await Deno.readTextFile(join(cdir, "browse", "aliases.json")),
    );
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return {};
    }
    throw err;
  }
}

async function main(args: string[]): Promise<void> {
  const opts = parseArgs(args, {
    boolean: [
      "commit",
      "help",
      "home",
      "no-browser",
      "permalink",
      "pr",
    ],
    string: ["remote", "path"],
    alias: {
      "help": ["h"],
      "no-browser": ["n"],
    },
  });
  if (opts.help) {
    const resp = await fetch(new URL("./browse_usage.txt", import.meta.url));
    const text = await resp.text();
    console.log(text);
    return;
  }

  const commitish = ensure(opts._.at(0) ?? "HEAD", is.String, {
    message: "Commitish must be a string",
  });
  const url = await getURL(commitish, opts);

  if (opts["no-browser"]) {
    console.log(url.href);
  } else {
    await systemopen(url.href);
  }
}

if (import.meta.main) {
  try {
    await main(Deno.args);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
    Deno.exit(1);
  }
}
