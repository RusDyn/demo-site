import NextAuth from "next-auth";
import type { Session } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    GitHub({
      clientId: requireEnv("GITHUB_CLIENT_ID"),
      clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
    }),
    Google({
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  callbacks: {
    session: async ({ session, user }): Promise<Session> => {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
} satisfies Parameters<typeof NextAuth>[0];

const authResult = NextAuth(authConfig);

export const authHandlers = authResult.handlers;
export const auth = authResult.auth as () => Promise<Session | null>;
export const signIn = authResult.signIn;
export const signOut = authResult.signOut;
export type AuthSession = Awaited<ReturnType<typeof auth>>;
