# Next.js Portfolio Platform

A full-stack portfolio platform built with Next.js 15, Prisma, and Supabase. The site renders long-form case studies, streams realtime project analytics, and connects with GitHub/Google for authenticated editing. This README captures the project context, the day-to-day developer workflow, and the guardrails we rely on to keep quality high.

## Tech Stack

- **Framework:** Next.js 15 with the App Router, React 19, and TypeScript
- **Styling:** Tailwind CSS 4.1 (next channel) with PostCSS and `tailwind-merge`
- **Database:** Supabase-managed PostgreSQL accessed via Prisma ORM
- **Auth:** NextAuth.js beta with GitHub and Google OAuth providers using the Prisma adapter
- **Storage:** Supabase Storage with server-side uploads
- **APIs:** tRPC for typed server/client contracts, OpenAI SDK for AI-assisted copy
- **Observability:** Sentry (error + performance) and PostHog (product analytics)
- **Tooling:** ESLint 9, TypeScript, Husky + lint-staged, Node.js ≥ 20

## Environment Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Copy environment template**
   ```bash
   cp .env.example .env.local
   ```
3. **Provision Supabase**
   - Create a Supabase project (PostgreSQL 15+) and note the project URL, anon key, and service role key.
   - Create a storage bucket that matches `SUPABASE_STORAGE_BUCKET` (default to `portfolio-assets`).
   - Update the SQL schema if needed, then store the connection string as `DATABASE_URL` (and optionally `DIRECT_URL`).
4. **Run Prisma migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```
   Use `npx prisma migrate dev --name <migration-name>` when iterating locally.
5. **Seed demo content (optional)**
   - Drop illustrative SVGs or screenshots into `public/demo-assets/`. The seed script references the files defined in [`prisma/seed-data.ts`](./prisma/seed-data.ts).
   - Ensure `SUPABASE_STORAGE_BUCKET` matches your Supabase storage bucket (defaults to `portfolio-assets`).
   - Run the seed command to create the demo profile, assets, and case studies:
     ```bash
     npm run prisma db seed
     ```
   - After the seed completes, open `npx prisma studio` (or inspect the `User` table directly) to copy the seeded user's `id`. Add that value to `PUBLIC_CASE_STUDIES_AUTHOR_IDS` in `.env.local`—use comma-separated IDs if you want multiple authors available to the marketing pages.
   - Re-running the seed keeps the demo user in sync and refreshes the case study copy without duplicating records.
6. **Configure OAuth providers**
   - **GitHub**: create an OAuth App with callback `https://<your-domain>/api/auth/callback/github` (use `http://localhost:3000` for dev). Store the client ID and secret in `.env.local`.
   - **Google**: create OAuth credentials with callback `https://<your-domain>/api/auth/callback/google`. Add authorized domains for local development and production.
   - Define `AUTH_SECRET` (or `NEXTAUTH_SECRET`) for session signing.
7. **Wire external services**
   - **OpenAI**: generate an API key and optional org/project IDs.
   - **Sentry**: create a project, copy the DSN, auth token, and optional trace/profile sampling rates.
   - **PostHog**: create a project, copy the client and server API keys, and configure the ingestion host when self-hosting.

Populate `.env.local` using the keys described above. See [`.env.example`](./.env.example) for the full list of variables.

## Quality Gates

- **Pre-commit hook** (`.husky/pre-commit`) automatically runs `lint-staged`, `npm run lint`, `npm run typecheck`, and `npm run test`.
- **Manual validation**: before pushing, run `npm run lint`, `npm run build`, `npm run test`, and relevant Prisma commands (`prisma migrate dev`, `prisma db seed`) to ensure changes ship safely.
- **Static analysis**: ESLint enforces accessibility, security, and code-quality rules. TypeScript runs in strict mode for runtime safety.

## Development Workflow

1. Start the dev server with `npm run dev` once dependencies and environment variables are in place.
2. When working on the database:
   - Use `npx prisma migrate dev --name <name>` to evolve the schema.
   - Run `npx prisma studio` (optional) to inspect data.
3. Keep API contracts updated by running `npm run prisma:generate` after schema changes.
4. Use `npm run lint:fix` to autofix lint issues and `npm run lint:strict` to fail on warnings.
5. Execute targeted tests via `npm test -- <pattern>`; the default `npm run test` runs the full Node test suite.
6. Always finish work by running:
   ```bash
   npm run lint
   npm run build
   npm run test
   npx prisma migrate deploy
   ```
   These commands align with the team’s "Always check lint and build before finishing the task" agreement.

## Deployment

- **Hosting**: Deploy on Vercel. Link the project to the Vercel dashboard and import environment variables from `.env.local` (Vercel ➝ Settings ➝ Environment Variables). Use separate environments for Production, Preview, and Development.
- **Database**: Point `DATABASE_URL` to the managed Supabase instance. Run `npx prisma migrate deploy` as a Vercel deployment hook or via the Supabase SQL editor.
- **Supabase Service Keys**: Store `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and any storage bucket names as Vercel environment variables.
- **OAuth**: Update GitHub/Google OAuth callbacks to match the Vercel domain and add the preview URL wildcard if needed.
- **Sentry**: Configure the Vercel ↔ Sentry integration or set `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`, and sampling rates in the Vercel project.
- **PostHog**: Provide both `NEXT_PUBLIC_POSTHOG_KEY` (browser) and `POSTHOG_KEY` (server) along with optional `POSTHOG_HOST` overrides.
- **Analytics & Monitoring**: Enable Vercel Analytics and Speed Insights via the dashboard.

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for history clarity. Husky ensures lint/test gates before a commit lands. If commitlint is reintroduced, use the same Conventional Commits spec to stay compliant.

## Troubleshooting

- Missing environment variables will throw at runtime. Revisit `.env.example` and ensure all values are populated.
- Tailwind 4.1 (next) tooling occasionally lags behind; rerun `npm run dev` after updating the config.
- When enabling new providers or integrations, update `.env.example` and this README to document additional keys.

Happy building!
