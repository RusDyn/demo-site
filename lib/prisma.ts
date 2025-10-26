// Prisma's generated client is unavailable in the CI environment, so we rely on runtime validation instead.
import { Prisma, PrismaClient } from "@prisma/client";
import type {
  Asset as PrismaAsset,
  CaseStudy as PrismaCaseStudy,
  CaseStudySection as PrismaCaseStudySection,
} from "@prisma/client";

import { profileSchema, type ProfileSummary } from "@/lib/validators/profile";
import {
  caseStudyAssetCreateSchema,
  caseStudyAssetSchema,
  caseStudyDetailSchema,
  caseStudyMutationSchema,
  caseStudySummarySchema,
  type CaseStudyAsset,
  type CaseStudyAssetCreateInput,
  type CaseStudyDetail,
  type CaseStudyMutationInput,
  type CaseStudySummary,
} from "@/lib/validators/case-study";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const prismaErrorMessage =
  "Prisma Client failed to initialize. Run `npx prisma generate` with network access to generate the client before building.";

function createFallbackClient(error: unknown): PrismaClient {
  const cause = error instanceof Error ? error : new Error("Unknown Prisma client error");
  const failure = new Error(prismaErrorMessage, { cause });
  const asyncFailure = (): Promise<never> => Promise.reject(failure);

  const modelHandler: ProxyHandler<Record<string, unknown>> = {
    get(_modelTarget, method) {
      if (typeof method === "symbol") {
        return undefined;
      }

      return asyncFailure;
    },
  };

  const clientHandler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (typeof prop === "symbol") {
        return undefined;
      }

      if (prop.startsWith("$")) {
        return asyncFailure;
      }

      return new Proxy({}, modelHandler);
    },
  };

  return new Proxy({}, clientHandler) as unknown as PrismaClient;
}

const profileSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
} as const;

function createPrismaClient(): PrismaClient {
  if (typeof globalThis.prismaGlobal !== "undefined") {
    return globalThis.prismaGlobal;
  }

  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

    if (process.env.NODE_ENV !== "production") {
      globalThis.prismaGlobal = client;
    }

    return client;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(prismaErrorMessage);
    }

    const fallback = createFallbackClient(error);

    if (process.env.NODE_ENV !== "production") {
      globalThis.prismaGlobal = fallback;
    }

    return fallback;
  }
}

export const prisma: PrismaClient = createPrismaClient();

export async function getProfileById(userId: string): Promise<ProfileSummary | null> {
  const record = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });

  if (!record) {
    return null;
  }

  return profileSchema.parse(record);
}

export async function updateProfileName(userId: string, name: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { name },
  });
}

interface SeedUserInput {
  email: string;
  name: string;
  emailVerified: Date;
}

export async function ensureUser(seed: SeedUserInput): Promise<void> {
  await prisma.user.upsert({
    where: { email: seed.email },
    update: {},
    create: seed,
  });
}

const caseStudySummarySelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  createdAt: true,
  updatedAt: true,
} as const;

const caseStudyDetailInclude = {
  sections: {
    orderBy: {
      position: "asc" as const,
    },
  },
  assets: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  heroAsset: true,
} as const;

type CaseStudyWithRelations = PrismaCaseStudy & {
  sections: PrismaCaseStudySection[];
  assets: PrismaAsset[];
  heroAsset: PrismaAsset | null;
};

function mapAsset(record: PrismaAsset): CaseStudyAsset {
  return caseStudyAssetSchema.parse({
    id: record.id,
    caseStudyId: record.caseStudyId ?? null,
    bucket: record.bucket,
    path: record.path,
    name: record.name,
    mimeType: record.mimeType,
    size: record.size,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function normalizeCaseStudy(record: CaseStudyWithRelations): CaseStudyDetail {
  const base = {
    id: record.id,
    slug: record.slug,
    title: record.title,
    audience: record.audience ?? null,
    summary: record.summary ?? null,
    headline: record.headline ?? null,
    background: record.background ?? null,
    results: record.results ?? null,
    heroAssetId: record.heroAssetId ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    sections: record.sections.map((section) => ({
      id: section.id,
      caseStudyId: section.caseStudyId,
      title: section.title,
      content: section.content,
      position: section.position,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    })),
    assets: record.assets.map((asset) => mapAsset(asset)),
    heroAsset: record.heroAsset ? mapAsset(record.heroAsset) : null,
  } satisfies CaseStudyDetail;

  return caseStudyDetailSchema.parse(base);
}

export async function listCaseStudiesForUser(
  userId: string,
  client: PrismaClient = prisma,
): Promise<CaseStudySummary[]> {
  const records = await client.caseStudy.findMany({
    where: { authorId: userId },
    orderBy: {
      updatedAt: "desc",
    },
    select: caseStudySummarySelect,
  });

  return caseStudySummarySchema.array().parse(
    records.map((record) => ({
      ...record,
      summary: record.summary ?? null,
    })),
  );
}

export async function getCaseStudyForUser(
  userId: string,
  caseStudyId: string,
  client: PrismaClient = prisma,
): Promise<CaseStudyDetail | null> {
  const record = await client.caseStudy.findFirst({
    where: {
      id: caseStudyId,
      authorId: userId,
    },
    include: caseStudyDetailInclude,
  });

  if (!record) {
    return null;
  }

  return normalizeCaseStudy(record as CaseStudyWithRelations);
}

async function ensureOwnsCaseStudy(
  client: PrismaClient | Prisma.TransactionClient,
  userId: string,
  caseStudyId: string,
): Promise<void> {
  const match = await client.caseStudy.count({
    where: {
      id: caseStudyId,
      authorId: userId,
    },
  });

  if (match === 0) {
    throw new Error("Case study not found");
  }
}

export async function createCaseStudyAsset(
  userId: string,
  assetInput: CaseStudyAssetCreateInput,
  client: PrismaClient = prisma,
): Promise<CaseStudyAsset> {
  const parsed = caseStudyAssetCreateSchema.parse({
    ...assetInput,
    caseStudyId: assetInput.caseStudyId ?? null,
  });

  if (parsed.caseStudyId) {
    await ensureOwnsCaseStudy(client, userId, parsed.caseStudyId);
  }

  const record = await client.asset.create({
    data: {
      caseStudyId: parsed.caseStudyId ?? undefined,
      bucket: parsed.bucket,
      path: parsed.path,
      name: parsed.name,
      mimeType: parsed.mimeType,
      size: parsed.size,
    },
  });

  return mapAsset(record);
}

export async function saveCaseStudyForUser(
  userId: string,
  input: CaseStudyMutationInput,
  client: PrismaClient = prisma,
): Promise<CaseStudyDetail> {
  const parsed = caseStudyMutationSchema.parse(input);
  const { id, sections, assetIds, heroAssetId, ...rest } = parsed;

  try {
    const result = await client.$transaction(async (tx) => {
      let targetId = id ?? null;

      if (targetId) {
        await ensureOwnsCaseStudy(tx, userId, targetId);
        await tx.caseStudy.update({
          where: { id: targetId },
          data: {
            ...rest,
            heroAssetId: heroAssetId ?? null,
          },
        });
      } else {
        const created = await tx.caseStudy.create({
          data: {
            ...rest,
            heroAssetId: heroAssetId ?? null,
            authorId: userId,
          },
        });

        targetId = created.id;
      }

      const sectionIds = sections
        .map((section) => section.id)
        .filter((sectionId): sectionId is string => typeof sectionId === "string");

      if (sections.length === 0) {
        await tx.caseStudySection.deleteMany({
          where: { caseStudyId: targetId },
        });
      } else {
        await tx.caseStudySection.deleteMany({
          where: {
            caseStudyId: targetId,
            id: {
              notIn: sectionIds,
            },
          },
        });
      }

      for (const section of sections) {
        if (section.id) {
          await tx.caseStudySection.updateMany({
            where: {
              id: section.id,
              caseStudyId: targetId,
            },
            data: {
              title: section.title,
              content: section.content,
              position: section.position,
            },
          });
        } else {
          await tx.caseStudySection.create({
            data: {
              caseStudyId: targetId,
              title: section.title,
              content: section.content,
              position: section.position,
            },
          });
        }
      }

      const assetsToLink = new Set<string>(assetIds ?? []);
      if (heroAssetId) {
        assetsToLink.add(heroAssetId);
      }

      if (assetsToLink.size > 0) {
        const assets = await tx.asset.findMany({
          where: {
            id: {
              in: [...assetsToLink],
            },
          },
          include: {
            caseStudy: true,
          },
        });

        if (assets.length !== assetsToLink.size) {
          throw new Error("One or more attachments are missing");
        }

        for (const asset of assets) {
          if (
            asset.caseStudy &&
            asset.caseStudy.authorId !== userId &&
            asset.caseStudyId !== targetId
          ) {
            throw new Error("Cannot attach an asset owned by another user");
          }
        }

        await tx.asset.updateMany({
          where: {
            id: {
              in: [...assetsToLink],
            },
          },
          data: {
            caseStudyId: targetId,
          },
        });
      }

      const updated = await tx.caseStudy.findFirst({
        where: {
          id: targetId,
          authorId: userId,
        },
        include: caseStudyDetailInclude,
      });

      if (!updated) {
        throw new Error("Failed to load case study after saving");
      }

      return normalizeCaseStudy(updated as CaseStudyWithRelations);
    });

    return result;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("A case study with this slug already exists.");
    }

    throw error;
  }
}

export async function deleteCaseStudyForUser(
  userId: string,
  caseStudyId: string,
  client: PrismaClient = prisma,
): Promise<void> {
  await client.caseStudy.deleteMany({
    where: {
      id: caseStudyId,
      authorId: userId,
    },
  });
}
