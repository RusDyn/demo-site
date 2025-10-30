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
import { VideoSpotlight } from "@/components/landing/video-spotlight";
import { DashboardHandOffSection } from "@/components/dashboard/dashboard-hand-off-section";
import { TechStackMarquee } from "@/components/landing/tech-stack-marquee";
import { Button } from "@/components/ui/button";

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
        <Button type="submit" className="w-full">
          Continue with GitHub
        </Button>
      </form>
      <form action={googleSignIn} className="flex-1">
        <Button type="submit" variant="secondary" className="w-full">
          Continue with Google
        </Button>
      </form>
      <Button asChild variant="outline" className="bg-muted hover:bg-muted/80">
        <Link href="/dashboard">Explore the dashboard</Link>
      </Button>
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
                  <Button asChild>
                    <Link href="/dashboard">Open your dashboard</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/case-studies">Browse customer stories</Link>
                  </Button>
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

      <section className="space-y-6 rounded-3xl border border-border/70 bg-gradient-to-br from-card/80 via-secondary/40 to-primary/20 p-8 shadow-lg backdrop-blur">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Explore the Supabase Auth workflow</h2>
          <p className="text-base text-muted-foreground">
            Watch how the Supabase team wires Auth Helpers into a Next.js App Router project—exactly the flow this starter builds upon.
          </p>
        </div>
        <VideoSpotlight className="mx-auto max-w-4xl" />
        <p className="text-xs text-muted-foreground">
          Video: {" "}
          <Link
            href="https://www.youtube.com/watch?v=pqn9D6r9F7o"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted underline-offset-2"
          >
            Supabase — "Supabase Auth Helpers for Next.js App Router"
          </Link>
        </p>
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
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-3">
            {renderSignInActions()}
            <Button asChild variant="outline" className="border-dashed">
              <Link href="/api/auth/signin">More sign-in options</Link>
            </Button>
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
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/case-studies">Open case study workspace</Link>
            </Button>
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
