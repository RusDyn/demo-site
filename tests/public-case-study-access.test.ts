import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";

import type { Prisma, PrismaClient } from "@prisma/client";

import { getPublicCaseStudyBySlug, listPublicCaseStudies } from "@/lib/prisma";
import { encodePublicCaseStudySlug } from "@/lib/public-case-study";

const originalPublicCaseStudyAuthors = process.env.PUBLIC_CASE_STUDIES_AUTHOR_IDS;
const originalNodeEnv = process.env.NODE_ENV;

Reflect.set(process.env, "NODE_ENV", "test");

afterEach(() => {
  if (typeof originalPublicCaseStudyAuthors === "undefined") {
    delete process.env.PUBLIC_CASE_STUDIES_AUTHOR_IDS;
  } else {
    process.env.PUBLIC_CASE_STUDIES_AUTHOR_IDS = originalPublicCaseStudyAuthors;
  }
});

after(() => {
  if (typeof originalNodeEnv === "undefined") {
    Reflect.deleteProperty(process.env, "NODE_ENV");
  } else {
    Reflect.set(process.env, "NODE_ENV", originalNodeEnv);
  }
});

test("listPublicCaseStudies scopes queries to configured author ids", async () => {
  process.env.PUBLIC_CASE_STUDIES_AUTHOR_IDS = "user-1, user-2";

  let receivedWhere: Prisma.CaseStudyWhereInput | undefined;

  const client = {
    caseStudy: {
      findMany: (args: Prisma.CaseStudyFindManyArgs) => {
        receivedWhere = args.where;
        return Promise.resolve([]);
      },
    },
  } as unknown as PrismaClient;

  await listPublicCaseStudies(client);

  assert.deepEqual(receivedWhere, {
    authorId: { in: ["user-1", "user-2"] },
  });
});

test("getPublicCaseStudyBySlug scopes queries by slug and author ids", async () => {
  process.env.PUBLIC_CASE_STUDIES_AUTHOR_IDS = "user-42";

  let receivedArgs: Prisma.CaseStudyFindFirstArgs | undefined;

  const client = {
    caseStudy: {
      findFirst: (args: Prisma.CaseStudyFindFirstArgs) => {
        receivedArgs = args;
        return Promise.resolve(null);
      },
    },
  } as unknown as PrismaClient;

  await getPublicCaseStudyBySlug(encodePublicCaseStudySlug("user-42", "example-slug"), client);

  assert(receivedArgs);
  assert.deepEqual(receivedArgs?.where, {
    authorId: "user-42",
    slug: "example-slug",
  });
});

test("getPublicCaseStudyBySlug fails closed when configuration is missing", async () => {
  delete process.env.PUBLIC_CASE_STUDIES_AUTHOR_IDS;

  const client = {
    caseStudy: {
      findFirst: () => {
        throw new Error("findFirst should not be called");
      },
    },
  } as unknown as PrismaClient;

  const result = await getPublicCaseStudyBySlug(
    encodePublicCaseStudySlug("user-42", "example-slug"),
    client,
  );

  assert.equal(result, null);
});

test("public case study queries fail closed when configuration is missing", async () => {
  delete process.env.PUBLIC_CASE_STUDIES_AUTHOR_IDS;

  let receivedWhere: Prisma.CaseStudyWhereInput | undefined;

  const client = {
    caseStudy: {
      findMany: (args: Prisma.CaseStudyFindManyArgs) => {
        receivedWhere = args.where;
        return Promise.resolve([]);
      },
    },
  } as unknown as PrismaClient;

  await listPublicCaseStudies(client);

  assert.deepEqual(receivedWhere, {
    authorId: { in: [] },
  });
});
