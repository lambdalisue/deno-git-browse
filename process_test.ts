import {
  assert,
  assertRejects,
} from "https://deno.land/std@0.194.0/testing/asserts.ts";
import { execute, ExecuteError } from "./process.ts";

Deno.test("execute() runs 'git' and return a stdout on success", async () => {
  const stdout = await execute(["version"]);
  assert(stdout.startsWith("git version"));
});

Deno.test("execute() runs 'git' and throw ExecuteError on fail", async () => {
  await assertRejects(async () => {
    await execute(["no-such-command"]);
  }, ExecuteError);
});
