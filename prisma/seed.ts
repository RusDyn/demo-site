import { promises as fs } from "node:fs";
import path from "node:path";

import { ensureUser, prisma, saveCaseStudyForUser } from "../lib/prisma";
import { demoAssets, demoCaseStudies, demoUser } from "./seed-data";

/**
 * Marketing pages rely on PUBLIC_CASE_STUDIES_AUTHOR_IDS to expose seeded case studies.
 * After running this script, copy the seeded user's ID into that comma-separated environment variable
 * so public queries return the demo content.
 */
const assetDirectory = path.join(process.cwd(), "public", "demo-assets");
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "portfolio-assets";

const assetByKey = new Map(demoAssets.map((asset) => [asset.key, asset]));

async function ensureSeedAsset(
  assetKey: string,
  userId: string,
  caseStudySlug: string,
): Promise<string> {
  const asset = assetByKey.get(assetKey);

  if (!asset) {
    throw new Error(`Unknown asset key: ${assetKey}`);
  }

  const filePath = path.join(assetDirectory, asset.fileName);
  const stats = await fs.stat(filePath).catch((error: unknown) => {
    const nodeError = error as NodeJS.ErrnoException | undefined;

    if (nodeError?.code === "ENOENT") {
      throw new Error(
        `Missing demo asset file at ${filePath}. Add the image before running the seed script.`,
      );
    }

    throw error;
  });

  if (!stats.isFile()) {
    throw new Error(`Expected ${filePath} to be a file.`);
  }

  const desiredPath = path.posix.join(
    "case-studies",
    userId,
    caseStudySlug,
    asset.fileName,
  );

  const existing = await prisma.asset.findFirst({
    where: {
      bucket,
      path: desiredPath,
    },
  });

  if (existing) {
    if (
      existing.name !== asset.name ||
      existing.mimeType !== asset.mimeType ||
      existing.size !== stats.size
    ) {
      await prisma.asset.update({
        where: { id: existing.id },
        data: {
          name: asset.name,
          mimeType: asset.mimeType,
          size: stats.size,
        },
      });
    }

    return existing.id;
  }

  const legacy = await prisma.asset.findFirst({
    where: {
      bucket,
      name: asset.name,
      path: {
        startsWith: `case-studies/${userId}/`,
      },
    },
  });

  if (legacy) {
    const updated = await prisma.asset.update({
      where: { id: legacy.id },
      data: {
        path: desiredPath,
        name: asset.name,
        mimeType: asset.mimeType,
        size: stats.size,
      },
    });

    return updated.id;
  }

  const created = await prisma.asset.create({
    data: {
      bucket,
      path: desiredPath,
      name: asset.name,
      mimeType: asset.mimeType,
      size: stats.size,
    },
  });

  return created.id;
}

async function seedCaseStudies(userId: string): Promise<void> {
  for (const study of demoCaseStudies) {
    const assetIds: string[] = [];
    let heroAssetId: string | null = null;
    const uniqueAssetKeys = [study.heroAssetKey, ...study.assetKeys];

    for (const assetKey of uniqueAssetKeys) {
      if (!assetKey) {
        continue;
      }

      const assetId = await ensureSeedAsset(assetKey, userId, study.slug);

      if (assetKey === study.heroAssetKey) {
        heroAssetId = assetId;
      } else if (!assetIds.includes(assetId)) {
        assetIds.push(assetId);
      }
    }

    if (!heroAssetId) {
      throw new Error(
        `Failed to resolve hero asset for case study ${study.slug}.`,
      );
    }

    const existing = await prisma.caseStudy.findFirst({
      where: {
        authorId: userId,
        slug: study.slug,
      },
      select: { id: true },
    });

    await saveCaseStudyForUser(userId, {
      id: existing?.id,
      slug: study.slug,
      title: study.title,
      audience: study.audience,
      summary: study.summary,
      headline: study.headline,
      background: study.background,
      results: study.results,
      heroAssetId,
      assetIds,
      sections: study.sections.map((section, index) => ({
        title: section.title,
        content: section.content,
        position: index,
      })),
    });
  }
}

async function seed(): Promise<void> {
  const user = await ensureUser(demoUser);
  await seedCaseStudies(user.id);
}

try {
  await seed();
} catch (error) {
  console.error("Seed failed", error);
  process.exit(1);
} finally {
   
  await prisma.$disconnect();
}
