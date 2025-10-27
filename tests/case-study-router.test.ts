import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import type { TRPCContext } from "@/server/api/context";
import {
  caseStudySummarySchema,
  type CaseStudyDetail,
  type CaseStudySummary,
} from "@/lib/validators/case-study";
import { demoCaseStudies } from "@/prisma/seed-data";

function createContext(): TRPCContext {
  return {
    session: {
      user: {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        image: null,
      },
      expires: new Date().toISOString(),
    } as unknown as TRPCContext["session"],
    prisma: {} as TRPCContext["prisma"],
  };
}

const sampleSummary: CaseStudySummary = {
  id: "cs-1",
  slug: "sample-case-study",
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
  listCaseStudiesForUser: (..._args: unknown[]) =>
    Promise.reject(new Error("listCaseStudiesForUser mock not configured")),
  getCaseStudyForUser: (..._args: unknown[]) =>
    Promise.reject(new Error("getCaseStudyForUser mock not configured")),
  saveCaseStudyForUser: (..._args: unknown[]) =>
    Promise.reject(new Error("saveCaseStudyForUser mock not configured")),
  deleteCaseStudyForUser: (..._args: unknown[]) =>
    Promise.reject(new Error("deleteCaseStudyForUser mock not configured")),
} satisfies Record<string, (...args: unknown[]) => Promise<unknown>>;

function setupPrismaMock(overrides: Partial<typeof prismaDefaults>): void {
  mock.module("@/lib/prisma", {
    namedExports: { ...prismaDefaults, ...overrides },
  });
}

let routerImportId = 0;

async function importCaseStudyRouter() {
  routerImportId += 1;
  return import(`@/server/api/routers/case-study?test=${routerImportId}`);
}

test("case study list returns repository result", async () => {
  setupPrismaMock({
    listCaseStudiesForUser: () => Promise.resolve([sampleSummary]),
  });
  const { caseStudyRouter } = await importCaseStudyRouter();
  const caller = caseStudyRouter.createCaller(createContext());
  const result = await caller.list();
  assert.deepEqual(result, [sampleSummary]);
});

test("case study by id returns detail", async () => {
  setupPrismaMock({
    getCaseStudyForUser: () => Promise.resolve(sampleDetail),
  });
  const { caseStudyRouter } = await importCaseStudyRouter();
  const caller = caseStudyRouter.createCaller(createContext());
  const result = await caller.byId({ id: "cs-1" });
  assert.deepEqual(result, sampleDetail);
});

test("case study by id throws when missing", async () => {
  setupPrismaMock({
    getCaseStudyForUser: () => Promise.resolve(null),
  });
  const { caseStudyRouter } = await importCaseStudyRouter();
  const caller = caseStudyRouter.createCaller(createContext());
  await assert.rejects(() => caller.byId({ id: "missing" }), (error: unknown) => {
    if (error && typeof error === "object" && "code" in error) {
      return (error as { code?: string }).code === "NOT_FOUND";
    }

    return false;
  });
});

test("case study save delegates to repository", async () => {
  let calledWith: unknown[] | null = null;
  setupPrismaMock({
    saveCaseStudyForUser: (...args: unknown[]) => {
      calledWith = args;
      return Promise.resolve(sampleDetail);
    },
  });
  const { caseStudyRouter } = await importCaseStudyRouter();
  const caller = caseStudyRouter.createCaller(createContext());
  const payload = {
    id: undefined,
    slug: "sample-case-study",
    title: "Sample Case Study",
    audience: "Operators",
    summary: "This is a sample.",
    headline: "Operators improve outcomes",
    background: "Background text",
    results: "Results text",
    heroAssetId: null,
    assetIds: [],
    sections: [],
  };
  const result = await caller.save(payload);
  assert.deepEqual(result, sampleDetail);
  assert.deepEqual(calledWith, ["user-123", payload]);
});

test("case study delete forwards to repository", async () => {
  let deletedArgs: unknown[] | null = null;
  setupPrismaMock({
    deleteCaseStudyForUser: (...args: unknown[]) => {
      deletedArgs = args;
      return Promise.resolve();
    },
  });
  const { caseStudyRouter } = await importCaseStudyRouter();
  const caller = caseStudyRouter.createCaller(createContext());
  const result = await caller.delete({ id: "cs-1" });
  assert.deepEqual(result, { success: true });
  assert.deepEqual(deletedArgs, ["user-123", "cs-1"]);
});

test("seeded case studies satisfy the summary schema", () => {
  for (const study of demoCaseStudies) {
    assert.doesNotThrow(() =>
      caseStudySummarySchema.parse({
        id: "seed-id",
        slug: study.slug,
        title: study.title,
        summary: study.summary,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  }
});
