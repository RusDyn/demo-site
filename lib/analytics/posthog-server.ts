import { PostHog } from "posthog-node";

let serverClient: PostHog | null = null;

function createServerClient(apiKey: string): PostHog {
  return new PostHog(apiKey, {
    host: process.env.POSTHOG_HOST ?? "https://app.posthog.com",
    flushAt: 1,
  });
}

export function getServerPosthog(consentGranted: boolean): PostHog | null {
  if (!consentGranted) {
    return null;
  }

  const apiKey = process.env.POSTHOG_KEY;

  if (!apiKey) {
    return null;
  }

  serverClient ??= createServerClient(apiKey);

  return serverClient;
}

export async function shutdownServerPosthog(): Promise<void> {
  if (!serverClient) {
    return;
  }

  const client = serverClient;
  serverClient = null;

  const asyncShutdown = (client as { _shutdown?: (timeout?: number) => Promise<void> })._shutdown;

  if (typeof asyncShutdown === "function") {
    await asyncShutdown.call(client);
    return;
  }

  void client.shutdown();
}
