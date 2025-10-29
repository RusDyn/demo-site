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

function requireAnyEnv(...names: string[]): string {
  for (const name of names) {
    // Accessing environment variables by name is required for configuration lookup.
    // eslint-disable-next-line security/detect-object-injection
    const value = process.env[name];

    if (value) {
      return value;
    }
  }

  const primary = names[0] ?? "environment variable";
  const shouldEnforce = process.env.VERCEL === "1" || process.env.CI === "true";

  if (shouldEnforce) {
    throw new Error(`Missing environment variable: ${names.join(" or ")}`);
  }

  const fallback = `placeholder-${primary.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  console.warn(
    `Missing environment variable: ${names.join(" or ")}. Using fallback value for local build.`,
  );
  return fallback;
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  secret: requireAnyEnv("AUTH_SECRET", "NEXTAUTH_SECRET"),
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

const authResult = NextAuth(authConfig);

export const authHandlers = authResult.handlers;
export const auth = authResult.auth as () => Promise<Session | null>;
export const signIn = authResult.signIn;
export const signOut = authResult.signOut;
export type AuthSession = Awaited<ReturnType<typeof auth>>;
