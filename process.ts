const decoder = new TextDecoder();

export type ExecuteOptions = Omit<
  Deno.CommandOptions,
  "args" | "stdin" | "stdout" | "stderr"
>;

export async function execute(
  args: string[],
  options: ExecuteOptions = {},
): Promise<string> {
  // --literal-pathspecs
  //     Treat pathspecs literally (i.e. no globbing, no pathspec magic).
  //     This is equivalent to setting the GIT_LITERAL_PATHSPECS environment
  //     variable to 1.
  //
  // --no-optional-locks
  //     Do not perform optional operations that require locks. This is
  //     equivalent to setting the GIT_OPTIONAL_LOCKS to 0.
  const cmdArgs = [
    "--no-pager",
    "--literal-pathspecs",
    "--no-optional-locks",
  ];
  const command = new Deno.Command("git", {
    args: [...cmdArgs, ...args],
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
    ...options,
  });
  const { code, success, stdout, stderr } = await command.output();
  const stdoutStr = decoder.decode(stdout);
  const stderrStr = decoder.decode(stderr);
  if (!success) {
    throw new ExecuteError(args, code, stdoutStr, stderrStr);
  }
  return stdoutStr;
}

export class ExecuteError extends Error {
  constructor(
    public args: string[],
    public code: number,
    public stdout: string,
    public stderr: string,
  ) {
    super(`[${code}]: ${stderr}`);
    this.name = this.constructor.name;
  }
}
