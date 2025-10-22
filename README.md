# Next.js 15 Portfolio (WIP)

This repository is being reset in preparation for a forthcoming Next.js 15 portfolio experience backed by Prisma and Supabase. The initial commit streamlines the workspace to only the tooling required for the upcoming stack while we finalize design and architecture decisions.

Additional documentation, setup steps, and implementation details will be added alongside the first feature work.

## Beta & Release Candidate Caveats

- **Tailwind CSS 4.1 (Next channel)** &mdash; the configuration in this repository targets the Tailwind 4.1 beta. Tooling that expects a Tailwind 3.x config (including `npx shadcn@latest init`) currently fails its validation step. We generated the required `components.json` and Tailwind settings manually and documented the defaults so the command can be re-run once official support ships.
- **React 19** &mdash; dependencies such as `framer-motion@latest` ship React 19-compatible builds, but they are still stabilizing their TS types. Keep an eye on upstream release notes in case additional polyfills or fixes become necessary when React 19 GA lands.
