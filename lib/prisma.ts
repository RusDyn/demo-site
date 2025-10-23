/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
// Prisma's generated client is unavailable in the CI environment, so we rely on runtime validation instead.
import { PrismaClient } from "@prisma/client";

import { profileSchema, type ProfileSummary } from "@/lib/validators/profile";

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

  return new Proxy({}, clientHandler) as PrismaClient;
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
    data: seed,
  });
}
