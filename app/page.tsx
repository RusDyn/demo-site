import Image from "next/image";
import Link from "next/link";
import type { ReactElement, ReactNode } from "react";

import { ProfileForm } from "@/components/profile/profile-form";
import { CaseStudyEditor } from "@/components/case-studies/case-study-editor";
import { HealthStatus } from "@/components/health-status";
import { auth, signIn, signOut } from "@/lib/auth";
import { HeroAnimatedShell, HeroMotionItem } from "@/components/hero/animated-hero";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { DemoHighlight } from "@/components/landing/demo-highlight";
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
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-12">
      <HeroAnimatedShell className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-primary/30 via-card/85 to-secondary/35 p-8 shadow-lg backdrop-blur">
        <div
          className="pointer-events-none absolute -left-24 -top-28 -z-10 h-48 w-48 rounded-full bg-primary/35 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-20 -z-10 h-56 w-56 rounded-full bg-secondary/40 blur-3xl"
          aria-hidden="true"
        />
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
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
                    Browse customer stories
                  </Link>
                </div>
              ) : (
                renderSignInActions()
              )}
            </HeroMotionItem>
            <HeroMotionItem className="mt-6">
              <HealthStatus />
            </HeroMotionItem>
          </div>
          <HeroMotionItem className="flex flex-col items-center justify-center gap-2 lg:items-end">
            <Image
              src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1080&h=720&q=80"
              alt="Lush evergreen forest with sunlight filtering through the trees"
              priority
              width={1080}
              height={720}
              className="h-auto w-full max-w-md rounded-2xl object-cover shadow-lg"
              sizes="(min-width: 1024px) 360px, (min-width: 768px) 60vw, 80vw"
            />
            <Link
              href="https://unsplash.com/photos/sp-p7uuT0tw"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2"
            >
              Photo by Sebastian Unrau on Unsplash
            </Link>
          </HeroMotionItem>
        </div>
      </HeroAnimatedShell>

      <section className="rounded-3xl border border-border/70 bg-gradient-to-br from-secondary/30 via-card/90 to-background/80 p-8 shadow-md backdrop-blur">
        <DemoHighlight />
      </section>

      <FeatureGrid className="gap-6" />

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
              href="/dashboard/case-studies"
              className="inline-flex items-center rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Open case study workspace
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
