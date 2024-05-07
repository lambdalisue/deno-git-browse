import { stub } from "jsr:@std/testing@^0.221.0/mock";
import { assertEquals, unreachable } from "jsr:@std/assert@^0.221.0";
import { _internals, ExecuteError } from "./process.ts";
import {
  getCommitAbbrevRef,
  getCommitSHA1,
  getRemoteContains,
  getRemoteFetchURL,
} from "./util.ts";

Deno.test("getRemoteContains", async (t) => {
  await t.step(
    "returns undefined if no remote contains the commitish",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "remote") {
          return Promise.resolve("origin\nfork\n");
        }
        if (args.at(0) === "branch") {
          throw new ExecuteError(
            args,
            129,
            "",
            "error: malformed object name <<commitish>>\n",
          );
        }
        unreachable();
      });
      try {
        const remote = await getRemoteContains("<<commitish>>");
        assertEquals(remote, undefined);
      } finally {
        executeStub.restore();
      }
    },
  );

  await t.step(
    "returns 'origin' if 'origin/my-awesome-branch' contains the commitish",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "remote") {
          return Promise.resolve("origin\nfork\n");
        }
        if (args.at(0) === "branch") {
          return Promise.resolve("origin/my-awesome-branch\n");
        }
        unreachable();
      });
      try {
        const remote = await getRemoteContains("<<commitish>>");
        assertEquals(remote, "origin");
      } finally {
        executeStub.restore();
      }
    },
  );

  await t.step(
    "returns 'origin' if 'origin/HEAD' and 'origin/my-awesome-branch' contains the commitish",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "remote") {
          return Promise.resolve("origin\nfork\n");
        }
        if (args.at(0) === "branch") {
          return Promise.resolve("origin/HEAD\norigin/my-awesome-branch\n");
        }
        unreachable();
      });
      try {
        const remote = await getRemoteContains("<<commitish>>");
        assertEquals(remote, "origin");
      } finally {
        executeStub.restore();
      }
    },
  );

  await t.step(
    "returns 'fork' if 'fork/my-awesome-branch' contains the commitish",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "remote") {
          return Promise.resolve("origin\nfork\n");
        }
        if (args.at(0) === "branch") {
          return Promise.resolve("fork/my-awesome-branch\n");
        }
        unreachable();
      });
      try {
        const remote = await getRemoteContains("<<commitish>>");
        assertEquals(remote, "fork");
      } finally {
        executeStub.restore();
      }
    },
  );

  await t.step(
    "returns 'origin' if 'origin/feature/my-awesome-branch' contains the commitish (#9)",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "remote") {
          return Promise.resolve("origin\nfork\n");
        }
        if (args.at(0) === "branch") {
          return Promise.resolve("origin/feature/my-awesome-branch\n");
        }
        unreachable();
      });
      try {
        const remote = await getRemoteContains("<<commitish>>");
        assertEquals(remote, "origin");
      } finally {
        executeStub.restore();
      }
    },
  );

  await t.step(
    "returns 'fork/my-awesome-fork' if 'fork/my-awesome-fork/feature/my-awesome-branch' contains the commitish",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "remote") {
          return Promise.resolve("origin\nfork/my-awesome-fork\n");
        }
        if (args.at(0) === "branch") {
          return Promise.resolve(
            "fork/my-awesome-fork/feature/my-awesome-branch\n",
          );
        }
        unreachable();
      });
      try {
        const remote = await getRemoteContains("<<commitish>>");
        assertEquals(remote, "fork/my-awesome-fork");
      } finally {
        executeStub.restore();
      }
    },
  );

  await t.step(
    "returns 'origin' if 'origin/my-awesome-branch' and 'fork/my-awesome-branch' contains the commitish",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "remote") {
          return Promise.resolve("origin\nfork\n");
        }
        if (args.at(0) === "branch") {
          return Promise.resolve(
            "fork/my-awesome-branch\norigin/my-awesome-branch\n",
          );
        }
        unreachable();
      });
      try {
        const remote = await getRemoteContains("<<commitish>>");
        assertEquals(remote, "origin");
      } finally {
        executeStub.restore();
      }
    },
  );
});

Deno.test("getRemoteFetchURL", async (t) => {
  await t.step(
    "returns undefined if no remote exists",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "remote") {
          throw new ExecuteError(
            args,
            2,
            "",
            "error: No such remote 'origin'\n",
          );
        }
        unreachable();
      });
      try {
        const url = await getRemoteFetchURL("origin");
        assertEquals(url, undefined);
      } finally {
        executeStub.restore();
      }
    },
  );

  await t.step(
    "returns URL of the remote (HTTP URL)",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "remote") {
          return Promise.resolve(
            "https://github.com/lambdalisue/deno-git-browse\n",
          );
        }
        unreachable();
      });
      try {
        const url = await getRemoteFetchURL("origin");
        assertEquals(
          url,
          new URL("https://github.com/lambdalisue/deno-git-browse"),
        );
      } finally {
        executeStub.restore();
      }
    },
  );

  await t.step(
    "returns URL of the remote (SSH URL)",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "remote") {
          return Promise.resolve(
            "ssh://git@github.com/lambdalisue/deno-git-browse\n",
          );
        }
        unreachable();
      });
      try {
        const url = await getRemoteFetchURL("origin");
        assertEquals(
          url,
          new URL("ssh://git@github.com/lambdalisue/deno-git-browse"),
        );
      } finally {
        executeStub.restore();
      }
    },
  );

  await t.step(
    "returns URL of the remote (SSH Protocol)",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "remote") {
          return Promise.resolve(
            "git@github.com:lambdalisue/deno-git-browse.git\n",
          );
        }
        unreachable();
      });
      try {
        const url = await getRemoteFetchURL("origin");
        assertEquals(
          url,
          new URL("ssh://git@github.com/lambdalisue/deno-git-browse"),
        );
      } finally {
        executeStub.restore();
      }
    },
  );
});

Deno.test("getCommitSHA1", async (t) => {
  await t.step(
    "returns undefined when the commitish is not found",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "rev-parse") {
          throw new ExecuteError(
            args,
            128,
            "",
            "<<commitish>>\nfatal: ambiguous argument '<<commitish>>': unknown revision or path not in the working tree.\nUse '--' to separate paths from revisions, like this:\n'git <command> [<revision>...] -- [<file>...]'\n",
          );
        }
        unreachable();
      });
      try {
        const sha1 = await getCommitSHA1("<<commitish>>");
        assertEquals(sha1, undefined);
      } finally {
        executeStub.restore();
      }
    },
  );

  await t.step(
    "returns commit SHA1",
    async () => {
      const expect = "8e3367e40b91850d7f7864b4a8984d25f6e9419e";
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "rev-parse") {
          return Promise.resolve(`${expect}\n`);
        }
        unreachable();
      });
      try {
        const sha1 = await getCommitSHA1("<<commitish>>");
        assertEquals(sha1, expect);
      } finally {
        executeStub.restore();
      }
    },
  );
});

Deno.test("getCommitAbbrevRef", async (t) => {
  await t.step(
    "returns undefined when the commitish is not found",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "rev-parse") {
          throw new ExecuteError(
            args,
            128,
            "",
            "<<commitish>>\nfatal: ambiguous argument '<<commitish>>': unknown revision or path not in the working tree.\nUse '--' to separate paths from revisions, like this:\n'git <command> [<revision>...] -- [<file>...]'\n",
          );
        }
        unreachable();
      });
      try {
        const sha1 = await getCommitAbbrevRef("<<commitish>>");
        assertEquals(sha1, undefined);
      } finally {
        executeStub.restore();
      }
    },
  );

  await t.step(
    "returns commit abbrev ref",
    async () => {
      const executeStub = stub(_internals, "execute", (args, _options) => {
        if (args.at(0) === "rev-parse") {
          return Promise.resolve(`my-awesome-branch\n`);
        }
        unreachable();
      });
      try {
        const sha1 = await getCommitAbbrevRef("<<commitish>>");
        assertEquals(sha1, "my-awesome-branch");
      } finally {
        executeStub.restore();
      }
    },
  );
});
