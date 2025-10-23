import assert from "node:assert/strict";
import { test } from "node:test";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { appRouter } from "@/server/api/root";
import type { TRPCContext } from "@/server/api/context";
import { trpc } from "@/lib/trpc/react";

test("health ping round-trips Date instances", async (t) => {
  const server = createHTTPServer({
    router: appRouter,
    createContext(): TRPCContext {
      return {
        session: null,
        prisma: {} as TRPCContext["prisma"],
      };
    },
  });

  const port = await new Promise<number>((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address) {
        reject(new Error("Failed to determine test server address"));
        return;
      }
      if (typeof address === "string") {
        const match = /:(\d+)$/.exec(address);
        if (!match) {
          reject(new Error("Failed to determine test server address"));
          return;
        }

        const portMatch = match[1];

        if (!portMatch) {
          reject(new Error("Failed to determine test server port"));
          return;
        }

        resolve(Number.parseInt(portMatch, 10));
        return;
      }
      resolve(address.port);
    });
  });
  t.after(() => {
    server.close();
  });

  const transformer = superjson;
  const client = trpc.createClient(
    {
      transformer,
      links: [
        httpBatchLink({
          url: `http://127.0.0.1:${port}`,
          transformer,
        }),
      ],
    } as unknown as Parameters<typeof trpc.createClient>[0],
  );

  const result = await client.health.ping.query();
  assert.ok(result.timestamp instanceof Date);
});
