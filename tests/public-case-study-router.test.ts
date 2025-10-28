import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import type { TRPCContext } from "@/server/api/context";
import type { CaseStudyDetail, CaseStudySummary } from "@/lib/validators/case-study";
import { encodePublicCaseStudySlug } from "@/lib/public-case-study";

function createContext(): TRPCContext {
  return {
    session: null,
    prisma: {} as TRPCContext["prisma"],
  };
}

const samplePublicSlug = encodePublicCaseStudySlug("user-1", "sample-case-study");

const sampleSummary: CaseStudySummary = {
  id: "cs-1",
  slug: "sample-case-study",
  publicSlug: samplePublicSlug,
  title: "Sample Case Study",
  summary: "This is a sample.",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-02T00:00:00Z"),
};

const sampleDetail: CaseStudyDetail = {
  ...sampleSummary,
  audience: "Operators",
  headline: "Operators improve outcomes",
  background: "Background text",
  results: "Results text",
  heroAssetId: null,
  heroAsset: null,
  assets: [],
  sections: [],
};

afterEach(() => {
  mock.restoreAll();
  mock.reset();
});

const prismaDefaults = {
  listPublicCaseStudies: (..._args: unknown[]) =>
    Promise.reject(new Error("listPublicCaseStudies mock not configured")),
  getPublicCaseStudyBySlug: (..._args: unknown[]) =>
    Promise.reject(new Error("getPublicCaseStudyBySlug mock not configured")),
} satisfies Record<string, (...args: unknown[]) => Promise<unknown>>;

function setupPrismaMock(overrides: Partial<typeof prismaDefaults>): void {
  mock.module("@/lib/prisma", {
    namedExports: { ...prismaDefaults, ...overrides },
  });
}

let routerImportId = 0;

async function importRouter() {
  routerImportId += 1;
  return import(`@/server/api/routers/public-case-study?test=${routerImportId}`);
}

test("public case study list returns summaries", async () => {
  setupPrismaMock({
    listPublicCaseStudies: () => Promise.resolve([sampleSummary]),
  });
  const { publicCaseStudyRouter } = await importRouter();
  const caller = publicCaseStudyRouter.createCaller(createContext());
  const result = await caller.list();
  assert.deepEqual(result, [sampleSummary]);
});

test("public case study by slug returns detail", async () => {
  setupPrismaMock({
    getPublicCaseStudyBySlug: () => Promise.resolve(sampleDetail),
  });
  const { publicCaseStudyRouter } = await importRouter();
  const caller = publicCaseStudyRouter.createCaller(createContext());
  const result = await caller.bySlug({ slug: samplePublicSlug });
  assert.deepEqual(result, sampleDetail);
});

test("public case study by slug throws when missing", async () => {
  setupPrismaMock({
    getPublicCaseStudyBySlug: () => Promise.resolve(null),
  });
  const { publicCaseStudyRouter } = await importRouter();
  const caller = publicCaseStudyRouter.createCaller(createContext());
  await assert.rejects(() => caller.bySlug({ slug: samplePublicSlug }), (error: unknown) => {
    if (error && typeof error === "object" && "code" in error) {
      return (error as { code?: string }).code === "NOT_FOUND";
    }

    return false;
  });
});
