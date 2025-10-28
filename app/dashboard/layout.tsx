import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement, ReactNode } from "react";

import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage content that powers your portfolio.</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Back to overview
        </Link>
      </header>
      {children}
    </main>
  );
}
