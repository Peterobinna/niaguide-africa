# Project working agreement

## Structure

- `src/app`: App Router pages and HTTP routes. `api/ask` owns generation orchestration.
- `src/components`: accessible reusable and interactive React components.
- `src/lib/catalogue.ts`: supplied neutral catalogue and clearly labelled fictional notes.
- `src/lib/retrieval.ts`: validation, synthetic retrieval and evidence checks.
- `src/lib/server`, `src/lib/supabase/server.ts`: server-only modules.
- `supabase/migrations/202609280001_foundation.sql` and `202609280002_catalogue.sql`: reviewed SQL setup; do not automatically apply to a remote database.
- `tests`: meaningful grounding regression tests. `docs`: design, architecture and demonstration evidence.

## Conventions and checks

Strict TypeScript; no `any`; small reusable components; semantic HTML and labelled forms; visible focus. Use npm and retain the lockfile. Next.js App Router route params are asynchronous. Keep Tailwind import/theme and shared CSS tokens consistent. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` after substantive changes. `npm run dev` starts development, `npm start` serves the build.

## Security and content requirements

Never expose, print, change or commit secret values. Never copy `.env.local` into the repo. `.env.example` contains safe placeholders only. OpenAI uses the official SDK on the server. Do not remove RLS, grant ordinary users source writes, or allow users to set their admin role. Use Zod on API input and preserve ownership checks. Never weaken source-grounding, expert scoping, rights approval, citation checks, insufficiency behaviour or non-impersonation. Do not invent real-person biographies, quotes, URLs, permissions or endorsements. Synthetic data must stay explicitly labelled and gated by demo mode. Preserve disclosure and privacy warning strings from the brief. No destructive Git commands or direct merge into a default branch. Document untested live integrations honestly.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
