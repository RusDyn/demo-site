import { randomBytes } from "crypto";

import NextAuth from "next-auth";
import type { Session } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

function requireEnv(name: string): string {
  // Accessing environment variables by name is required for configuration lookup.
  // eslint-disable-next-line security/detect-object-injection
  const value = process.env[name];

  if (value) {
    return value;
  }

  const shouldEnforce = process.env.VERCEL === "1" || process.env.CI === "true";

  if (shouldEnforce) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  const fallback = `placeholder-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  console.warn(`Missing environment variable: ${name}. Using fallback value for local build.`);
  return fallback;
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  secret: resolveAuthSecret(),
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
    session: ({ session, user }): Session => {
      // The session object is controlled by NextAuth and exposes known properties.
       
      session.user.id = user.id;
       
      session.user.role = user.role;
      return session;
    },
  },
} satisfies Parameters<typeof NextAuth>[0];

function resolveAuthSecret(): string {
  const envSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (envSecret) {
    return envSecret;
  }

  const shouldEnforce =
    process.env.VERCEL === "1" ||
    process.env.CI === "true" ||
    process.env.NODE_ENV === "production";

  if (shouldEnforce) {
    throw new Error("Missing environment variable: AUTH_SECRET or NEXTAUTH_SECRET");
  }

  const fallback = randomBytes(32).toString("hex");
  console.warn(
    "Missing environment variable: AUTH_SECRET or NEXTAUTH_SECRET. Generating ephemeral secret for local build.",
  );
  return fallback;
}

const authResult = NextAuth(authConfig);

export const authHandlers = authResult.handlers;
export const auth = authResult.auth as () => Promise<Session | null>;
export const signIn = authResult.signIn;
export const signOut = authResult.signOut;
export type AuthSession = Awaited<ReturnType<typeof auth>>;
