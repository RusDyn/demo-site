# Next.js 15 Portfolio (WIP)

This repository is being reset in preparation for a forthcoming Next.js 15 portfolio experience backed by Prisma and Supabase. The initial commit streamlines the workspace to only the tooling required for the upcoming stack while we finalize design and architecture decisions.

Additional documentation, setup steps, and implementation details will be added alongside the first feature work.

## Beta & Release Candidate Caveats

- **Tailwind CSS 4.1 (Next channel)** &mdash; we pin `tailwindcss@next`/`@tailwindcss/postcss` to the 4.1 beta and lean on the new single-entry `@import "tailwindcss";` flow. CLI helpers that assume a Tailwind 3.x config (including `npx shadcn@latest init`) still fail validation; revisit the presets and plugin wiring once Tailwind 4.1 is stable.
- **React 19** &mdash; the project runs on React 19 with `framer-motion@latest` and a shared `AnimationProvider` that lazy-loads `domAnimation`. The type guards we apply prevent runtime regressions, but keep watching Framer Motion's release notes for any React 19 specific fixes before GA.
