import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

import "@fontsource-variable/inter/index.css";
import "./globals.css";

import { AppProvider } from "@/components/providers/app-provider";
import { cn } from "@/lib/utils";
import { createHydrationState } from "@/lib/trpc/hydration";

export const metadata: Metadata = {
  title: "Supabase Auth Starter",
  description: "NextAuth v5, Prisma, tRPC, and Supabase storage wired together.",
};

export default async function RootLayout({ children }: { children: ReactNode }): Promise<ReactElement> {
  const hydrationState = await createHydrationState();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <AppProvider state={hydrationState}>{children}</AppProvider>
      </body>
    </html>
  );
}
