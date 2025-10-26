import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

afterEach(() => {
  mock.restoreAll();
  mock.reset();
});

test("initPosthog clears opt-out state when re-enabling analytics", async () => {
  const originalKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const originalHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  process.env.NEXT_PUBLIC_POSTHOG_KEY = "ph_test";
  process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://ph.example.com";

  try {
    const { initPosthog, posthogClient } = await import(`@/lib/analytics/posthog-client?test=${Date.now()}`);

    const optIn = mock.fn();
    const optOut = mock.fn();
    const init = mock.fn();
    const reset = mock.fn();

    const client = posthogClient as {
      opt_in_capturing?: typeof optIn;
      opt_out_capturing?: typeof optOut;
      init?: typeof init;
      reset?: typeof reset;
    };

    const originalClientState = {
      opt_in_capturing: client.opt_in_capturing,
      opt_out_capturing: client.opt_out_capturing,
      init: client.init,
      reset: client.reset,
    };

    Object.assign(client, {
      opt_in_capturing: optIn,
      opt_out_capturing: optOut,
      init,
      reset,
    });

    try {
      initPosthog(true);
      assert.strictEqual(optIn.mock.calls.length, 1);
      assert.strictEqual(init.mock.calls.length, 1);

      initPosthog(false);
      assert.strictEqual(optOut.mock.calls.length, 1);
      assert.strictEqual(reset.mock.calls.length, 1);

      initPosthog(true);
      assert.strictEqual(optIn.mock.calls.length, 2);
      assert.strictEqual(init.mock.calls.length, 2);
    } finally {
      Object.assign(client, originalClientState);
    }
  } finally {
    if (originalKey === undefined) {
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    } else {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = originalKey;
    }

    if (originalHost === undefined) {
      delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
    } else {
      process.env.NEXT_PUBLIC_POSTHOG_HOST = originalHost;
    }
  }
});
