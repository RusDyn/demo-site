import Link from "next/link";
import type { ReactElement, ReactNode } from "react";

import { ProfileForm } from "@/components/profile/profile-form";
import { CaseStudyEditor } from "@/components/case-studies/case-study-editor";
import { HealthStatus } from "@/components/health-status";
import { auth, signIn, signOut } from "@/lib/auth";
import { HeroAnimatedShell, HeroMotionItem } from "@/components/hero/animated-hero";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { DashboardHandOffSection } from "@/components/dashboard/dashboard-hand-off-section";
import { TechStackMarquee } from "@/components/landing/tech-stack-marquee";

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

function renderSignInActions(): ReactNode {
  return (
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
          className="inline-flex w-full items-center justify-center rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/90"
        >
          Continue with Google
        </button>
      </form>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-md border border-transparent bg-muted px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/80"
      >
        Explore the dashboard
      </Link>
    </div>
  );
}

export default async function Home(): Promise<ReactElement> {
  const session = await auth();
  const user = session?.user;
  const primaryIdentifier = user?.email ?? user?.name ?? "Anonymous user";
  const role = typeof user?.role === "string" && user.role.length > 0 ? user.role : "user";

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-12">
      <HeroAnimatedShell className="relative overflow-hidden rounded-3xl border border-border bg-background/70 p-8 shadow-sm backdrop-blur">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_hsla(var(--primary)_/_0.25),_transparent_55%)]" />
        <HeroMotionItem as="h1" className="text-3xl font-semibold text-foreground sm:text-4xl">
          Supabase Auth Starter
        </HeroMotionItem>
        <HeroMotionItem as="p" className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
          A reference implementation wiring NextAuth v5, Prisma, tRPC, Supabase Storage, and TanStack Query so you can launch
          secure SaaS tooling faster.
        </HeroMotionItem>
        <HeroMotionItem className="mt-6">
          {session?.user ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Open your dashboard
              </Link>
              <Link
                href="/case-studies"
                className="inline-flex items-center justify-center rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Visit case studies
              </Link>
            </div>
          ) : (
            renderSignInActions()
          )}
        </HeroMotionItem>
        <HeroMotionItem className="mt-6">
          <HealthStatus />
        </HeroMotionItem>
      </HeroAnimatedShell>

      <FeatureGrid />

      <TechStackMarquee />

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
          <div className="space-y-3">
            {renderSignInActions()}
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center justify-center rounded-md border border-dashed border-input px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              More sign-in options
            </Link>
          </div>
        )}
      </section>

      {session?.user ? (
        <DashboardHandOffSection>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Profile</h2>
            <ProfileForm />
          </div>
          <CaseStudyEditor />
          <div className="flex justify-end">
            <Link
              href="/case-studies"
              className="inline-flex items-center rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Open case study dashboard
            </Link>
          </div>
        </DashboardHandOffSection>
      ) : (
        <section className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          Sign in to manage your profile, try the optimistic tRPC workflow, and experiment with the case study editor.
        </section>
      )}
    </main>
  );
}
