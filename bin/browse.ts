#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env
import { parse } from "https://deno.land/std@0.194.0/flags/mod.ts";
import { join } from "https://deno.land/std@0.194.0/path/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.2.0/mod.ts";
import { systemopen } from "https://deno.land/x/systemopen@v0.2.0/mod.ts";
import config_dir from "https://deno.land/x/dir@1.5.1/config_dir/mod.ts";
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
  const cdir = config_dir();
  if (!cdir) {
    return {};
  }
  try {
    return await import(join(cdir, "browse", "aliases.json"), {
      assert: { type: "json" },
    });
  } catch (err) {
    if (err instanceof TypeError) {
      return {};
    }
    throw err;
  }
}

async function main(args: string[]): Promise<void> {
  const opts = parse(args, {
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
