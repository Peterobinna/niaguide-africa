# NiaGuide Africa

**Guidance rooted in African wisdom.** Initial Full Stack capstone foundation for source-grounded guidance, designed for young Africans aged 18–25. The first research population is Nigerian university students aged 18–25 in Nigeria and abroad.

Repository: [Peterobinna/niaguide-africa](https://github.com/Peterobinna/niaguide-africa).

Initial software product Demo Video: https://drive.google.com/file/d/1R6rwuW7qhNdAyiyo0ZcjYGGjWyFvZE5s/view?usp=sharing


## Assessor: start here

Use the [implemented project branch](https://github.com/Peterobinna/niaguide-africa/tree/capstone/mvp-foundation) for this demonstration.

1. Read the [submission evidence PDF](docs/submission/NiaGuide_Africa_Submission_Evidence.pdf): rubric mapping, tool choices, annotated screenshots, wireframes, database diagram and three code examples.
2. Follow **Quick demo setup** below and try the question, citation and saved-answer journey.
3. Read the [verification record](docs/VERIFICATION.md) for passed checks and unverified live integrations, and the [deployment plan](docs/DEPLOYMENT_PLAN.md) for infrastructure.

The current requirements and design are in [Project specification](docs/PROJECT_SPEC.md) and [Design system](docs/DESIGN_SYSTEM.md). The demonstration video is available through the link above.

## Development assistance

OpenAI Codex assisted with planning, code generation, debugging, documentation and automated verification. The verification record describes the checks performed; it does not imply independent student review of every line. The student must review the implementation, explain the demonstrated choices and follow the course's AI-use and acknowledgement requirements. This development assistance is separate from the application's AI disclosure below.

## The problem

Ideas from African leaders are spread across many publications. Finding useful material and understanding which source supports an answer takes time. NiaGuide provides collection discovery, focused questions, and inspectable passages, without implying access to or representation of an expert.

## Working MVP

- Responsive public site, 20 draft expert profiles and one explicitly fictional collection.
- Search and field/country/status filters; expert profiles; original synthetic source library.
- Question submission with server validation, retrieval, citations, loading/error states and evidence-insufficiency behaviour.
- Browser-local demo history, saved answers, feedback, reports, and data clearing.
- Student dashboard; Supabase sign-in/registration and session callback structure.
- Admin preview; live role-protected overview and collection-status updates.
- SQL migrations with RLS, foreign keys, rights/approval fields, private storage, pgvector-ready passages, live history and feedback.
- Server-only OpenAI Responses integration using structured output and citation checks.

## Stack

Next.js 16.3.6 App Router, React 19.3, strict TypeScript, Tailwind CSS 4, Inter/Manrope via next/font, Lucide, Zod, Supabase Auth/PostgreSQL/Storage, official OpenAI SDK, npm. Package versions are resolved in package-lock.json. No custom model training.

## Quick demo setup (no accounts or API keys)

Install Node.js 22 or newer and npm. Extract the project ZIP, open a terminal in the folder containing package.json, then run:

```sh
npm ci
npm run setup:demo
npm run dev
```

Open http://localhost:3000. Internet access is needed to install packages and download the fonts on the first build. Demo answers use original fictional notes; no Supabase account or OpenAI key is required.

The setup command creates a demo-only .env.local and refuses to overwrite an existing file. If it reports that a file already exists, review your configuration before continuing. Environment changes require restarting the development server or rebuilding production.

Try **Explore experts → Amara Okeke → Ask**, ask “How can I explore a career and practise a new skill?”, inspect its citations, save the answer, then open **Saved answers**. Demo history stays in this browser.

For a production-style run, stop the development server and run:

```sh
npm run build
npm start
```

## Live environment variables (optional)

For a separate live installation, copy .env.example to .env.local and replace its placeholders with your own configuration. PowerShell: `Copy-Item .env.example .env.local`; macOS/Linux: `cp .env.example .env.local`. Do not overwrite an existing configuration. Follow the database instructions below before running live mode. The live template disables demo mode.

Never put real credentials in .env.example or commit .env.local.

| Variable | Purpose |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Browser-safe publishable key; RLS is still essential |
| OPENAI_API_KEY | Server-only OpenAI credential |
| OPENAI_MODEL | Optional Responses-compatible model; default gpt-4.1-mini |
| NEXT_PUBLIC_DEMO_MODE | Explicit `true` for synthetic demo; `false` for live mode; rebuild after changing |

```sh
npm run dev         # development server
npm run lint        # ESLint
npm run typecheck   # strict TypeScript
npm test           # grounding/validation regression tests
npm run build      # production build
npm start          # production server
```

## Database and live configuration

1. Create a new Supabase project. Review `supabase/migrations/202609280001_foundation.sql`, then apply it in the SQL Editor. Apply `202609280002_catalogue.sql` next. These files have not been applied to a remote database by this task.
2. Configure the Supabase URL, publishable key and server-only OpenAI key listed above locally or in your hosting provider. Set NEXT_PUBLIC_DEMO_MODE=false and rebuild.
3. Set Supabase Auth site URL and allowlisted redirect URLs to your deployment plus `/auth/callback`. Enable email confirmation; configure SMTP for real users. Register the first administrator account **after** the migration creates the auth trigger.
4. In the SQL Editor, promote the verified operator: `update public.profiles set role = 'admin' where id = 'YOUR-VERIFIED-USER-UUID';`. Do not accept a role from user metadata.
5. Insert legitimate source documents and passages as the operator. Record rights, provenance, reviewer UUID/date and approval. Only after review should the collection become available. Do not seed fabricated real-expert quotations. Source-upload UI is deferred; use the operator tools.
6. Test with two ordinary accounts and an admin, following `docs/VERIFICATION.md`. Live guidance requires an active collection with rights-cleared, approved passages; otherwise it returns the specified insufficient-evidence response.

## Deployment

Deploy this folder as the application root on Vercel (or another Node.js host). Build with `npm run build`; a self-hosted Node server uses `npm start`. Supabase provides Auth, PostgreSQL, pgvector and private storage. Set secrets in the host's environment manager. See [deployment plan](docs/DEPLOYMENT_PLAN.md). No deployment or remote database change was performed.

## Limitations and boundaries

- Demo answers are deterministic retrieved excerpts, **not live model-generated output**. They use only Amara's four original fictional notes. Demo data stays in localStorage on the current browser; feedback/reports are not sent to an admin.
- The 20 real collections are drafts with zero approved sources. A catalogue entry does not imply permission, endorsement or participation.
- Live OpenAI, Supabase Auth, database policies and persistence require credentials, migration application and integration testing. No configured secrets were visible to this task's process.
- Initial live retrieval is conservative PostgreSQL full-text search, not vector similarity. Nullable embeddings support a later measured upgrade; no embedding API is called.
- Exact quote checks and source-index validation do not prove semantic entailment. Human evaluation and a reviewed benchmark are required before research deployment.
- Question/answer persistence uses an authenticated RPC restricted to the caller's history. A caller can create their own history entries through that RPC; stored answers are **not an authenticity attestation** for model output. Before externally audited research, move writes behind a separately permissioned server identity or signed provenance mechanism.
- Document upload/approval UI, account deletion UI, password reset UI, research consent workflow and full audit events are deferred. Profile clears demo data only; contact the operator for live data requests.
- Admin preview changes are temporary and do not alter source availability. Admin document/report/feedback views provide a management foundation; document ingestion and report resolution use operator SQL tools.
- No medical, legal or financial advice, impersonation, direct expert messaging, payments, model training or social network features.

## Security

Private keys stay in server-only modules. `.env*` files are ignored except `.env.example`; no secret values are logged. Public Supabase configuration is designed for browser use, protected by RLS. Never add service-role keys to client code. Server APIs validate input and same-origin browser requests. Live answer calls require a verified session and reserve an atomic attempt (10 per hour per account). Outputs render as text, not HTML. Source URLs accept only HTTP(S). Private source storage is admin-only. Do not log question text or credentials in deployment logs. Configure retention and research consent before collecting student data.

## AI disclosure

“AI-generated guidance based on selected published sources. NiaGuide does not represent, impersonate or speak on behalf of the featured expert. Check the cited sources before making important decisions.”

## Design and demonstration

- [Submission evidence PDF](docs/submission/NiaGuide_Africa_Submission_Evidence.pdf) — six-page rubric map, annotated screens, wireframes, database diagram and code examples.
- [Editable evidence source](docs/submission/NiaGuide_Africa_Submission_Evidence.md)
- [Project specification](docs/PROJECT_SPEC.md)
- [Design system and decisions](docs/DESIGN_SYSTEM.md)
- [Wireframes](docs/WIREFRAMES.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
- [5–10 minute demo script](docs/DEMO_SCRIPT.md)
- [Verification record](docs/VERIFICATION.md)

### Screenshots

Captured during browser verification:

- [Desktop landing](docs/screenshots/landing-desktop.png)
- [Mobile landing](docs/screenshots/landing-mobile.png)
- [Mobile navigation](docs/screenshots/mobile-navigation.png)
- [Question and citations](docs/screenshots/answer-sources.png)
- [Admin overview](docs/screenshots/admin-overview.png)

Submission placeholders: `[Final hosted deployment screenshot]`, `[Configured live authentication screenshot after setup]`. Use fictional demo content for public screenshots; never capture environment settings or credentials.

## Earlier planning documents

The [earlier planning archive](docs/original-planning/README.md) preserves the original brief, design guide, beginner checklist, Codex handoff prompt and earlier agent instructions. These historical documents include different design tokens, model choices and a live pilot; they are not the setup guide or acceptance record for this demo. The root AGENTS.md remains the current development guidance. See the [submission preparation checklist](docs/submission/SUBMISSION_CHECKLIST.md) for policy confirmation and demonstration rehearsal.
