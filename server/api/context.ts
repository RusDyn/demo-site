/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// The Prisma client types require generated metadata that is not present in CI.
import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";

import { auth, type AuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface TRPCContext {
  session: Session | null;
  prisma: PrismaClient;
}

export async function createTRPCContext(): Promise<TRPCContext> {
  const session: AuthSession = await auth();

  return {
    session,
    prisma,
  };
}
