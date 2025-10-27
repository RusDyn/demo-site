"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Activity, Archive, Code2, ShieldCheck } from "lucide-react";
import type { ReactElement } from "react";

import { cn } from "@/lib/utils";

const cardMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

const features: FeatureItem[] = [
  {
    title: "Robust authentication",
    description: "Link NextAuth v5 with Supabase Auth helpers to deliver secure, low-latency sign-ins by default.",
    icon: ShieldCheck,
  },
  {
    title: "Typed data workflows",
    description: "Use Prisma and tRPC together so queries, mutations, and UI state stay consistent end-to-end.",
    icon: Code2,
  },
  {
    title: "Storage-ready foundation",
    description: "Wire Supabase Storage into your app without custom glue code or brittle upload flows.",
    icon: Archive,
  },
  {
    title: "Operational insight",
    description: "Monitor key health metrics instantly thanks to PostHog analytics and built-in health checks.",
    icon: Activity,
  },
];

interface FeatureGridProps {
  className?: string;
}

export function FeatureGrid({ className }: FeatureGridProps): ReactElement {
  return (
    <section className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.article
            key={feature.title}
            className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card/60 p-6 shadow-sm backdrop-blur"
            initial={cardMotion.initial}
            whileInView={cardMotion.animate}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}
