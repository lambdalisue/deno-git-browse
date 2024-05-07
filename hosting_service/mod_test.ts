import { assertThrows } from "jsr:@std/assert@^0.221.0";
import { assertSnapshot } from "jsr:@std/testing@^0.221.0/snapshot";
import { getHostingService, UnsupportedHostingServiceError } from "./mod.ts";

Deno.test("getHostingService", async (t) => {
  await t.step("throws error for unsupported hosting service", () => {
    const url = new URL("https://example.com/lambdalisue/deno-git-browse");
    assertThrows(
      () => {
        return getHostingService(url);
      },
      UnsupportedHostingServiceError,
    );
  });

  const urls = [
    new URL("ssh://git@github.com/lambdalisue/deno-git-browse"),
    new URL("https://github.com/lambdalisue/deno-git-browse"),
    new URL("ssh://git@gitlab.com/lambdalisue/deno-git-browse"),
    new URL("https://gitlab.com/lambdalisue/deno-git-browse"),
    new URL("ssh://git@bitbucket.org/lambdalisue/deno-git-browse"),
    new URL("https://bitbucket.org/lambdalisue/deno-git-browse"),
  ];
  for (const url of urls) {
    const svc = getHostingService(url);

    await t.step(`getHomeURL for ${url}`, async () => {
      const result = await svc.getHomeURL(url);
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getCommitURL for ${url}`, async () => {
      const result = await svc.getCommitURL(url, "v0.1.0");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getTreeURL for ${url}`, async () => {
      const result = await svc.getTreeURL(url, "v0.1.0", "bin");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getBlobURL for ${url} (Markdown)`, async () => {
      const result = await svc.getBlobURL(url, "v0.1.0", "README.md");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(
      `getBlobURL with lineStart for ${url} (Markdown)`,
      async () => {
        const result = await svc.getBlobURL(url, "v0.1.0", "README.md", {
          range: 10,
        });
        await assertSnapshot(t, {
          url: url.href,
          result: result.href,
        });
      },
    );

    await t.step(
      `getBlobURL with lineStart/lineEnd for ${url} (Markdown)`,
      async () => {
        const result = await svc.getBlobURL(url, "v0.1.0", "README.md", {
          range: [10, 20],
        });
        await assertSnapshot(t, {
          url: url.href,
          result: result.href,
        });
      },
    );

    await t.step(`getBlobURL for ${url}`, async () => {
      const result = await svc.getBlobURL(url, "v0.1.0", "bin/browse.ts");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getBlobURL with lineStart for ${url}`, async () => {
      const result = await svc.getBlobURL(url, "v0.1.0", "bin/browse.ts", {
        range: 10,
      });
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(
      `getBlobURL with lineStart/lineEnd for ${url}`,
      async () => {
        const result = await svc.getBlobURL(url, "v0.1.0", "bin/browse.ts", {
          range: [10, 20],
        });
        await assertSnapshot(t, {
          url: url.href,
          result: result.href,
        });
      },
    );

    if (svc.getPullRequestURL) {
      await t.step(`getPullRequestURL for ${url}`, async () => {
        const result = await svc.getPullRequestURL!(url, 1);
        await assertSnapshot(t, {
          url: url.href,
          result: result.href,
        });
      });
    }
  }
});

Deno.test("getHostingService with alias", async (t) => {
  const urls = [
    new URL("https://my-github.com/lambdalisue/deno-git-browse"),
  ];
  const aliases = {
    "my-github.com": "github.com",
  };

  for (const url of urls) {
    const svc = getHostingService(url, { aliases });

    await t.step(`getHomeURL for ${url}`, async () => {
      const result = await svc.getHomeURL(url);
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getCommitURL for ${url}`, async () => {
      const result = await svc.getCommitURL(url, "v0.1.0");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getTreeURL for ${url}`, async () => {
      const result = await svc.getTreeURL(url, "v0.1.0", "bin");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getBlobURL for ${url}`, async () => {
      const result = await svc.getBlobURL(url, "v0.1.0", "README.md");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getBlobURL with lineStart for ${url}`, async () => {
      const result = await svc.getBlobURL(url, "v0.1.0", "README.md", {
        range: 10,
      });
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(
      `getBlobURL with lineStart/lineEnd for ${url}`,
      async () => {
        const result = await svc.getBlobURL(url, "v0.1.0", "README.md", {
          range: [10, 20],
        });
        await assertSnapshot(t, {
          url: url.href,
          result: result.href,
        });
      },
    );

    if (svc.getPullRequestURL) {
      await t.step(`getPullRequestURL for ${url}`, async () => {
        const result = await svc.getPullRequestURL!(url, 1);
        await assertSnapshot(t, {
          url: url.href,
          result: result.href,
        });
      });
    }
  }
});
