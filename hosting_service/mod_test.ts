import { assertRejects } from "https://deno.land/std@0.202.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.202.0/testing/snapshot.ts";
import { getHostingService, UnsupportedHostingServiceError } from "./mod.ts";

Deno.test("getHostingService", async (t) => {
  await t.step("throws error for unsupported hosting service", async () => {
    const url = new URL("https://example.com/lambdalisue/gin.vim");
    await assertRejects(
      () => {
        return getHostingService(url);
      },
      UnsupportedHostingServiceError,
    );
  });

  const urls = [
    new URL("ssh://git@github.com/lambdalisue/gin.vim"),
    new URL("https://github.com/lambdalisue/gin.vim"),
  ];
  for (const url of urls) {
    const svc = await getHostingService(url);

    await t.step(`getHomeURL for ${url}`, async () => {
      const result = svc.getHomeURL(url);
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getCommitURL for ${url}`, async () => {
      const result = svc.getCommitURL(url, "main");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getTreeURL for ${url}`, async () => {
      const result = svc.getTreeURL(url, "main", "denops/gin");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getBlobURL for ${url}`, async () => {
      const result = svc.getBlobURL(url, "main", "denops/gin/main.ts");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getBlobURL with lineStart for ${url}`, async () => {
      const result = svc.getBlobURL(url, "main", "denops/gin/main.ts", {
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
        const result = svc.getBlobURL(url, "main", "denops/gin/main.ts", {
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
        const result = svc.getPullRequestURL!(url, 1);
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
    new URL("https://my-github.com/lambdalisue/gin.vim"),
  ];
  const aliases = {
    "my-github.com": "github.com",
  };

  for (const url of urls) {
    const svc = await getHostingService(url, { aliases });

    await t.step(`getHomeURL for ${url}`, async () => {
      const result = svc.getHomeURL(url);
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getCommitURL for ${url}`, async () => {
      const result = svc.getCommitURL(url, "main");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getTreeURL for ${url}`, async () => {
      const result = svc.getTreeURL(url, "main", "denops/gin");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getBlobURL for ${url}`, async () => {
      const result = svc.getBlobURL(url, "main", "denops/gin/main.ts");
      await assertSnapshot(t, {
        url: url.href,
        result: result.href,
      });
    });

    await t.step(`getBlobURL with lineStart for ${url}`, async () => {
      const result = svc.getBlobURL(url, "main", "denops/gin/main.ts", {
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
        const result = svc.getBlobURL(url, "main", "denops/gin/main.ts", {
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
        const result = svc.getPullRequestURL!(url, 1);
        await assertSnapshot(t, {
          url: url.href,
          result: result.href,
        });
      });
    }
  }
});
