import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

import "@fontsource-variable/inter/index.css";
import "./globals.css";

import { cn } from "@/lib/utils";
import { createHydrationState } from "@/lib/trpc/hydration";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Supabase Auth Starter",
  description: "NextAuth v5, Prisma, tRPC, and Supabase storage wired together.",
};

export default async function RootLayout({ children }: { children: ReactNode }): Promise<ReactElement> {
  const hydrationState = await createHydrationState();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-transparent font-sans antialiased")}>
        <div
          className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_hsla(var(--primary)_/_0.45)_0%,_hsl(220_65%_14%)_40%,_hsl(234_58%_18%)_100%)] dark:bg-gradient-to-b dark:from-primary/5 dark:via-background dark:to-secondary/10"
        >
          <div className="pointer-events-none absolute -top-16 -left-24 -z-10 h-[480px] w-[480px] bg-[radial-gradient(circle_at_top,_hsla(var(--primary)_/_0.25),_transparent_55%)] blur-3xl dark:bg-[radial-gradient(circle_at_top,_hsla(var(--primary)_/_0.15),_transparent_55%)]" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-[520px] w-[520px] bg-[radial-gradient(circle_at_top,_hsla(var(--primary)_/_0.25),_transparent_55%)] blur-3xl dark:bg-[radial-gradient(circle_at_top,_hsla(var(--primary)_/_0.15),_transparent_55%)]" />
          <div className="relative z-10">
            <Providers state={hydrationState}>{children}</Providers>
          </div>
        </div>
      </body>
    </html>
  );
}
