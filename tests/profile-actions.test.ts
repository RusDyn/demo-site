import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import type { ProfileUpdateInput } from "@/lib/validators/profile";

afterEach(() => {
  mock.restoreAll();
  mock.reset();
});

function setupAuthMock(value: unknown): void {
  mock.module("@/lib/auth", {
    namedExports: {
      auth: () => Promise.resolve(value),
    },
  });
}

function setupPrismaMock(
  callback: (userId: string, data: ProfileUpdateInput) => void,
): void {
  mock.module("@/lib/prisma", {
    namedExports: {
      updateProfile: (...args: unknown[]) => {
        const [userId, data] = args as [string, ProfileUpdateInput];
        callback(userId, data);
        return Promise.resolve();
      },
    },
  });
}

function setupRevalidateMock(record: string[]): void {
  mock.module("next/cache", {
    namedExports: {
      revalidatePath: (path: string) => {
        record.push(path);
      },
    },
  });
}

let importId = 0;

async function importProfileActions() {
  importId += 1;
  return import(`@/app/actions/profile?test=${importId}`);
}

test("updateProfileAction returns unauthorized without a session", async () => {
  setupAuthMock(null);
  setupPrismaMock(() => {
    throw new Error("updateProfile should not be called without a session");
  });
  setupRevalidateMock([]);

  const { updateProfileAction } = await importProfileActions();
  const result = await updateProfileAction({ name: "Example" });

  assert.deepEqual(result, { success: false, error: "Unauthorized" });
});

test("updateProfileAction validates input", async () => {
  setupAuthMock({ user: { id: "user-123" } });
  setupPrismaMock(() => {
    throw new Error("updateProfile should not be called when validation fails");
  });
  setupRevalidateMock([]);

  const { updateProfileAction } = await importProfileActions();
  const result = await updateProfileAction({ name: "" });

  assert.equal(result.success, false);
  assert.equal(result.error, "Name is required");
});

test("updateProfileAction updates only the name when image is omitted", async () => {
  const revalidated: string[] = [];
  const updates: { userId: string; data: ProfileUpdateInput }[] = [];
  setupAuthMock({ user: { id: "user-123" } });
  setupPrismaMock((userId, data) => {
    updates.push({ userId, data });
  });
  setupRevalidateMock(revalidated);

  const { updateProfileAction } = await importProfileActions();
  const result = await updateProfileAction({ name: "Alice" });

  assert.deepEqual(result, { success: true });
  assert.deepEqual(updates, [{ userId: "user-123", data: { name: "Alice" } }]);
  assert.deepEqual(revalidated, ["/"]);
});

test("updateProfileAction forwards image updates", async () => {
  const revalidated: string[] = [];
  let received: { userId: string; data: ProfileUpdateInput } | null = null;
  setupAuthMock({ user: { id: "user-123" } });
  setupPrismaMock((userId, data) => {
    received = { userId, data };
  });
  setupRevalidateMock(revalidated);

  const { updateProfileAction } = await importProfileActions();
  const result = await updateProfileAction({ name: "Bob", image: "avatars/user-123/example.png" });

  assert.deepEqual(result, { success: true });
  assert.deepEqual(received, {
    userId: "user-123",
    data: { name: "Bob", image: "avatars/user-123/example.png" },
  });
  assert.deepEqual(revalidated, ["/"]);
});
