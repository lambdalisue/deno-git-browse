#!/usr/bin/env -S deno run --allow-run --allow-read
import { parse } from "https://deno.land/std@0.194.0/flags/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.2.0/mod.ts";
import { systemopen } from "https://deno.land/x/systemopen@v0.2.0/mod.ts";
import {
  getCommitAbbrevRef,
  getCommitSHA1,
  getCommitURL,
  getHomeURL,
  getObjectURL,
  getPullRequestURL,
} from "../mod.ts";

export type Options = {
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
  if (options.home) {
    return getHomeURL(options);
  }
  if (options.pr) {
    commitish = await getCommitSHA1(commitish);
    return getPullRequestURL(commitish, options);
  }
  commitish = options.permalink
    ? await getCommitSHA1(commitish)
    : await getCommitAbbrevRef(commitish);
  if (options.commit) {
    return getCommitURL(commitish, options);
  }
  return getObjectURL(commitish, options.path ?? ".", options);
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
