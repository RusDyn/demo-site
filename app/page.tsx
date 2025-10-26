import Link from "next/link";
import type { ReactElement } from "react";

import { ProfileForm } from "@/components/profile/profile-form";
import { CaseStudyEditor } from "@/components/case-studies/case-study-editor";
import { HealthStatus } from "@/components/health-status";
import { auth, signIn, signOut } from "@/lib/auth";

async function githubSignIn(): Promise<void> {
  "use server";
  await signIn("github");
}

async function googleSignIn(): Promise<void> {
  "use server";
  await signIn("google");
}

async function signOutAction(): Promise<void> {
  "use server";
  await signOut();
}

export default async function Home(): Promise<ReactElement> {
  const session = await auth();
  const user = session?.user;
  const primaryIdentifier = user?.email ?? user?.name ?? "Anonymous user";
  const role = typeof user?.role === "string" && user.role.length > 0 ? user.role : "user";

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold text-foreground">Supabase Auth Starter</h1>
        <p className="text-muted-foreground">
          A reference implementation that wires NextAuth v5, Prisma, tRPC, Supabase Storage, and TanStack Query together.
        </p>
        <HealthStatus />
      </section>

      <section className="space-y-4 rounded-lg border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Authentication</h2>
          <Link href="/api/auth/session" className="text-sm text-muted-foreground underline">
            View session JSON
          </Link>
        </div>
        {session?.user ? (
          <div className="space-y-4">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                Signed in as <span className="font-medium text-foreground">{primaryIdentifier}</span>
              </p>
              <p>User role: {role}</p>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/90"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <form action={githubSignIn} className="flex-1">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Continue with GitHub
              </button>
            </form>
            <form action={googleSignIn} className="flex-1">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Continue with Google
              </button>
            </form>
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center justify-center rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              More options
            </Link>
          </div>
        )}
      </section>

      {session?.user ? (
        <section className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Profile</h2>
            <ProfileForm />
          </div>
          <CaseStudyEditor />
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          Sign in to manage your profile, try the optimistic tRPC workflow, and experiment with the case study editor.
        </section>
      )}
    </main>
  );
}
