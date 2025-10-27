import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import type { CaseStudyAsset, CaseStudyDetail } from "@/lib/validators/case-study";

const detail: CaseStudyDetail = {
  id: "cs-1",
  slug: "sample",
  title: "Sample",
  summary: "Summary",
  audience: "Operators",
  headline: "Headline",
  background: "Background",
  results: "Results",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-02T00:00:00Z"),
  heroAssetId: null,
  heroAsset: null,
  sections: [],
  assets: [],
};

afterEach(() => {
  mock.restoreAll();
  mock.reset();
});

const prismaDefaults = {
  saveCaseStudyForUser: (..._args: unknown[]) =>
    Promise.reject(new Error("saveCaseStudyForUser mock not configured")),
  deleteCaseStudyForUser: (..._args: unknown[]) =>
    Promise.reject(new Error("deleteCaseStudyForUser mock not configured")),
  createCaseStudyAsset: (..._args: unknown[]) =>
    Promise.reject(new Error("createCaseStudyAsset mock not configured")),
  deleteCaseStudyAssetForUser: (..._args: unknown[]) =>
    Promise.reject(new Error("deleteCaseStudyAssetForUser mock not configured")),
  getCaseStudyAssetForUser: (..._args: unknown[]) =>
    Promise.reject(new Error("getCaseStudyAssetForUser mock not configured")),
  getCaseStudyForUser: (..._args: unknown[]) =>
    Promise.reject(new Error("getCaseStudyForUser mock not configured")),
} satisfies Record<string, (...args: unknown[]) => Promise<unknown>>;

let importId = 0;

function setupAuthMock(value: unknown): void {
  mock.module("@/lib/auth", {
    namedExports: {
      auth: () => Promise.resolve(value),
    },
  });
}

function setupPrismaMock(overrides: Partial<typeof prismaDefaults>): void {
  mock.module("@/lib/prisma", {
    namedExports: { ...prismaDefaults, ...overrides },
  });
}

function setupRevalidateMock(callback: (path: string) => void): void {
  mock.module("next/cache", {
    namedExports: {
      revalidatePath: (path: string) => {
        callback(path);
      },
    },
  });
}

async function importCaseStudyActions() {
  importId += 1;
  return import(`@/app/actions/case-study?test=${importId}`);
}

const asset: CaseStudyAsset = {
  id: "asset-1",
  caseStudyId: "cs-1",
  bucket: "test-bucket",
  path: "case-studies/user-123/file.png",
  name: "file.png",
  mimeType: "image/png",
  size: 2048,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
};

function setupSupabaseMock(options?: {
  removeImplementation?: () => Promise<{ error: { message: string } | null }>;
  createSignedUrlImplementation?: () => Promise<{
    data: unknown;
    error: { message: string } | null;
  }>;
}) {
  const removeMock = mock.fn(
    options?.removeImplementation ?? (() => Promise.resolve({ error: null })),
  );
  const createSignedUrlMock = mock.fn(
    options?.createSignedUrlImplementation ?? (() =>
      Promise.resolve({ data: { signedURL: "https://example.com/signed" }, error: null })),
  );

  mock.module("@/lib/supabase", {
    namedExports: {
      getSupabaseServiceRoleClient: () => ({
        storage: {
          from: () => ({
            remove: removeMock,
            createSignedUrl: createSignedUrlMock,
          }),
        },
      }),
    },
  });

  return { removeMock, createSignedUrlMock };
}

test("saveCaseStudyAction validates session and normalizes input", async () => {
  const revalidated: string[] = [];
  setupAuthMock({
    user: { id: "user-123" },
  });
  setupPrismaMock({
    saveCaseStudyForUser: () => Promise.resolve(detail),
  });
  setupRevalidateMock((path) => {
    revalidated.push(path);
  });

  const { saveCaseStudyAction } = await importCaseStudyActions();
  const result = await saveCaseStudyAction({
    id: undefined,
    slug: "sample",
    title: "Sample",
    audience: " ",
    summary: "",
    headline: "Headline",
    background: "",
    results: "",
    heroAssetId: null,
    assetIds: [],
    sections: [],
  });

  assert.ok(result.success);
  assert.deepEqual(revalidated, [
    "/case-studies",
    "/dashboard/case-studies",
    "/case-studies/sample",
    "/dashboard/case-studies/cs-1",
    "/dashboard/case-studies/cs-1/edit",
  ]);
});

test("saveCaseStudyAction revalidates previous slug when renamed", async () => {
  const revalidated: string[] = [];
  setupAuthMock({
    user: { id: "user-123" },
  });
  setupPrismaMock({
    getCaseStudyForUser: () =>
      Promise.resolve({
        ...detail,
        slug: "original",
      }),
    saveCaseStudyForUser: () =>
      Promise.resolve({
        ...detail,
        slug: "updated",
      }),
  });
  setupRevalidateMock((path) => {
    revalidated.push(path);
  });

  const { saveCaseStudyAction } = await importCaseStudyActions();
  const result = await saveCaseStudyAction({
    id: "cs-1",
    slug: "updated",
    title: "Sample",
    audience: "Operators",
    summary: "Summary",
    headline: "Headline",
    background: "Background",
    results: "Results",
    heroAssetId: null,
    assetIds: [],
    sections: [],
  });

  assert.ok(result.success);
  assert.deepEqual(revalidated, [
    "/case-studies",
    "/dashboard/case-studies",
    "/case-studies/updated",
    "/case-studies/original",
    "/dashboard/case-studies/cs-1",
    "/dashboard/case-studies/cs-1/edit",
  ]);
});

test("saveCaseStudyAction returns unauthorized without session", async () => {
  setupAuthMock(null);
  setupPrismaMock({});

  const { saveCaseStudyAction } = await importCaseStudyActions();
  const result = await saveCaseStudyAction({
    id: undefined,
    slug: "sample",
    title: "Sample",
    audience: "",
    summary: "",
    headline: "",
    background: "",
    results: "",
    heroAssetId: null,
    assetIds: [],
    sections: [],
  });

  assert.deepEqual(result, { success: false, error: "Unauthorized" });
});

test("deleteCaseStudyAction calls repository and revalidates", async () => {
  const revalidated: string[] = [];
  let deletedId: string | null = null;
  setupAuthMock({
    user: { id: "user-123" },
  });
  setupPrismaMock({
    deleteCaseStudyForUser: (...args: unknown[]) => {
      const [, caseStudyId] = args as [string, string];
      deletedId = caseStudyId;
      return Promise.resolve();
    },
  });
  setupRevalidateMock((path) => {
    revalidated.push(path);
  });

  const { deleteCaseStudyAction } = await importCaseStudyActions();
  const result = await deleteCaseStudyAction("cs-1");
  assert.deepEqual(result, { success: true });
  assert.strictEqual(deletedId, "cs-1");
  assert.deepEqual(revalidated, [
    "/case-studies",
    "/dashboard/case-studies",
    "/case-studies/[slug]",
    "/dashboard/case-studies/cs-1",
    "/dashboard/case-studies/cs-1/edit",
  ]);
});

test("uploadCaseStudyAssetAction uploads and stores metadata", async () => {
  const originalBucket = process.env.SUPABASE_STORAGE_BUCKET;
  process.env.SUPABASE_STORAGE_BUCKET = "test-bucket";
  try {
    const revalidated: string[] = [];
    setupAuthMock({
      user: { id: "user-123" },
    });
    const asset = {
      id: "asset-1",
      caseStudyId: "cs-1",
      bucket: "test-bucket",
      path: "case-studies/user-123/file.png",
      name: "file.png",
      mimeType: "image/png",
      size: 1234,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies CaseStudyDetail["assets"][number];
    setupPrismaMock({
      createCaseStudyAsset: () => Promise.resolve(asset),
    });
    setupRevalidateMock((path) => {
      revalidated.push(path);
    });
    mock.module("../app/actions/upload.ts", {
      namedExports: {
        uploadToSupabase: () =>
          Promise.resolve({
            success: true,
            path: "case-studies/user-123/file.png",
            signedUrl: "https://example.com/file.png",
          }),
      },
    });

    const { uploadCaseStudyAssetAction } = await importCaseStudyActions();
    const file = new File([new Uint8Array([1, 2, 3])], "file.png", { type: "image/png" });
    const result = await uploadCaseStudyAssetAction({ caseStudyId: "cs-1", file });
    assert.ok(result.success);
    assert.strictEqual(result.asset.id, "asset-1");
    assert.strictEqual(result.signedUrl, "https://example.com/file.png");
    assert.deepEqual(revalidated, [
      "/case-studies",
      "/dashboard/case-studies",
      "/case-studies/[slug]",
      "/dashboard/case-studies/cs-1",
      "/dashboard/case-studies/cs-1/edit",
    ]);
  } finally {
    process.env.SUPABASE_STORAGE_BUCKET = originalBucket;
  }
});

test("deleteCaseStudyAssetAction deletes Supabase object and revalidates", async () => {
  const revalidated: string[] = [];
  setupAuthMock({
    user: { id: "user-123" },
  });
  const { removeMock } = setupSupabaseMock();
  let deleteCalled = false;
  setupPrismaMock({
    getCaseStudyAssetForUser: () =>
      Promise.resolve({ asset, caseStudyId: "cs-1", heroCaseStudyId: null }),
    deleteCaseStudyAssetForUser: (...args: unknown[]) => {
      deleteCalled = true;
      assert.deepEqual(args, ["user-123", "asset-1"]);
      return Promise.resolve({ asset, caseStudyId: "cs-1", wasHero: false });
    },
  });
  setupRevalidateMock((path) => {
    revalidated.push(path);
  });

  const { deleteCaseStudyAssetAction } = await importCaseStudyActions();
  const result = await deleteCaseStudyAssetAction({ assetId: "asset-1" });

  assert.ok(deleteCalled);
  assert.strictEqual(removeMock.mock.calls.length, 1);
  assert.deepEqual(result, {
    success: true,
    assetId: "asset-1",
    caseStudyId: "cs-1",
    heroCleared: false,
  });
  assert.deepEqual(revalidated, [
    "/case-studies",
    "/dashboard/case-studies",
    "/case-studies/[slug]",
    "/dashboard/case-studies/cs-1",
    "/dashboard/case-studies/cs-1/edit",
  ]);
});

test("deleteCaseStudyAssetAction requires authentication", async () => {
  setupAuthMock(null);
  setupSupabaseMock();
  setupPrismaMock({});

  const { deleteCaseStudyAssetAction } = await importCaseStudyActions();
  const result = await deleteCaseStudyAssetAction({ assetId: "asset-1" });
  assert.deepEqual(result, { success: false, error: "Unauthorized" });
});

test("deleteCaseStudyAssetAction returns error when asset missing", async () => {
  setupAuthMock({
    user: { id: "user-123" },
  });
  setupSupabaseMock();
  setupPrismaMock({
    getCaseStudyAssetForUser: () => Promise.resolve(null),
  });

  const { deleteCaseStudyAssetAction } = await importCaseStudyActions();
  const result = await deleteCaseStudyAssetAction({ assetId: "missing" });
  assert.deepEqual(result, { success: false, error: "Asset not found" });
});

test("deleteCaseStudyAssetAction surfaces Supabase removal failures", async () => {
  setupAuthMock({
    user: { id: "user-123" },
  });
  setupSupabaseMock({
    removeImplementation: () => Promise.resolve({ error: { message: "Removal failed" } }),
  });
  let deleteCalled = false;
  setupPrismaMock({
    getCaseStudyAssetForUser: () =>
      Promise.resolve({ asset, caseStudyId: "cs-1", heroCaseStudyId: null }),
    deleteCaseStudyAssetForUser: () => {
      deleteCalled = true;
      return Promise.resolve({ asset, caseStudyId: "cs-1", wasHero: false });
    },
  });

  const { deleteCaseStudyAssetAction } = await importCaseStudyActions();
  const result = await deleteCaseStudyAssetAction({ assetId: "asset-1" });
  assert.deepEqual(result, { success: false, error: "Removal failed" });
  assert.ok(!deleteCalled);
});

test("fetchCaseStudyAssetUrlAction returns signed URL", async () => {
  setupAuthMock({
    user: { id: "user-123" },
  });
  const { createSignedUrlMock } = setupSupabaseMock();
  setupPrismaMock({
    getCaseStudyAssetForUser: () =>
      Promise.resolve({ asset, caseStudyId: "cs-1", heroCaseStudyId: null }),
  });

  const { fetchCaseStudyAssetUrlAction } = await importCaseStudyActions();
  const result = await fetchCaseStudyAssetUrlAction({ assetId: "asset-1" });
  assert.deepEqual(result, { success: true, signedUrl: "https://example.com/signed" });
  assert.strictEqual(createSignedUrlMock.mock.calls.length, 1);
});

test("fetchCaseStudyAssetUrlAction requires authentication", async () => {
  setupAuthMock(null);
  setupSupabaseMock();
  setupPrismaMock({});

  const { fetchCaseStudyAssetUrlAction } = await importCaseStudyActions();
  const result = await fetchCaseStudyAssetUrlAction({ assetId: "asset-1" });
  assert.deepEqual(result, { success: false, error: "Unauthorized" });
});

test("fetchCaseStudyAssetUrlAction handles Supabase errors", async () => {
  setupAuthMock({
    user: { id: "user-123" },
  });
  setupSupabaseMock({
    createSignedUrlImplementation: () =>
      Promise.resolve({ data: null, error: { message: "Failed" } }),
  });
  setupPrismaMock({
    getCaseStudyAssetForUser: () =>
      Promise.resolve({ asset, caseStudyId: "cs-1", heroCaseStudyId: null }),
  });

  const { fetchCaseStudyAssetUrlAction } = await importCaseStudyActions();
  const result = await fetchCaseStudyAssetUrlAction({ assetId: "asset-1" });
  assert.deepEqual(result, { success: false, error: "Failed" });
});

test("fetchCaseStudyAssetUrlAction handles invalid Supabase responses", async () => {
  setupAuthMock({
    user: { id: "user-123" },
  });
  setupSupabaseMock({
    createSignedUrlImplementation: () =>
      Promise.resolve({ data: { signedURL: "" }, error: null }),
  });
  setupPrismaMock({
    getCaseStudyAssetForUser: () =>
      Promise.resolve({ asset, caseStudyId: "cs-1", heroCaseStudyId: null }),
  });

  const { fetchCaseStudyAssetUrlAction } = await importCaseStudyActions();
  const result = await fetchCaseStudyAssetUrlAction({ assetId: "asset-1" });
  assert.deepEqual(result, { success: false, error: "Failed to generate a signed URL" });
});
