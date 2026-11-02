# NiaGuide Africa

Source-based AI guidance for Nigerian university students aged 18-25. Students select an expert, ask a question and inspect supporting passages. AI does not represent or speak for experts. No model training or fine-tuning.

Repository: [Peterobinna/niaguide-africa](https://github.com/Peterobinna/niaguide-africa). Current local changes have not yet been published; do not assume the remote branch matches this workspace.

## Final-product assessment - 31 October 2026

- [Technical report - PDF, five pages](docs/final-product/NiaGuide_Africa_Final_Technical_Report.pdf)
- [Feature/scope table](docs/final-product/SCOPE_ALIGNMENT.md)
- [Testing methods and results](docs/final-product/TESTING_AND_RESULTS.md)
- [Walkthrough recording guide](docs/final-product/VIDEO_WALKTHROUGH_GUIDE.md)
- [Delivery status and remaining steps](docs/final-product/DELIVERY_STATUS.md)

**Video:** recording/upload pending. Add the actual assessor-accessible video URL here. The guide is not a video submission.

**Public app URL:** not supplied or verified. Supabase backend is live; Vercel is the intended app host. Local production build/start verified.

The older [initial evidence PDF](docs/submission/NiaGuide_Africa_Submission_Evidence.pdf) and [verification history](docs/VERIFICATION.md) are historical, not the current final report.

## Current functionality

- Directory, field/country/status filters, expert profiles and continuous chat.
- Live snapshot: **24 real profiles, 16 available collections, 211 approved documents, 3,880 passages**. Counts do not certify source rights or audio accuracy.
- Server-side planning, ranked lexical search, evidence selection, citation checks and one bounded generation repair.
- Supabase sign-in, account history, saves, feedback/report controls and protected admin overview/status API.
- Fresh Joyce answer/citation expansion/save/reload passed. Adesina generation verified but storage failed **22P05**; cause unresolved. No universal live reliability claim.
- Responsive CSS exists; current desktop checked. Current phone/browser/hardware comparisons remain pending.
- Operator SQL ingestion works; full admin document upload/review UI and research export are incomplete. Embedding rebuild, voice input and audio output are not implemented.

See the scope table: approximately 20 approved collections and vector search were planned; current coverage and lexical retrieval differ.

## Tools and requirements

| Layer | Technology |
|---|---|
| Runtime | Node.js/npm; tested Windows, Node 24.11.1, npm 11.6.2 |
| App/UI | Next.js 16.3.6 App Router, React 19.3.0 |
| Language/style | TypeScript 6.0.3, Tailwind 4.3.3, Lucide |
| Validation | Zod 4.6.5 |
| Data/auth | Supabase Auth/PostgreSQL/private storage schema, SDK 2.117.2 |
| AI | Server-side OpenAI SDK 7.23.0; configurable model, default gpt-4.1-mini |
| Search | PostgreSQL full-text ranking plus model query reformulation; no embedding calls |

Exact packages are locked in package-lock.json. Installation/first build needs internet for packages and fonts. Live mode needs Supabase/OpenAI connectivity. No GPU/native mobile runtime is required for the browser client; low-end hardware minimum not benchmarked.

## Installation

Open the application folder containing package.json. Install using `npm ci`. Configure one mode below, then `npm run dev`. Open http://localhost:3000.

### Fresh fictional demo

```sh
npm ci
npm run setup:demo
npm run dev
```

setup:demo creates a demo-only .env.local and refuses to overwrite an existing one. Choose fictional Amara Okeke and ask "How can I explore a career and practise a new skill?" Demo responses are retrieved fictional notes, not live model output; history/feedback stay in the browser. Do not overwrite an existing live configuration.

### Live configuration

For a fresh installation, copy .env.example to .env.local and enter your own values. Never commit/show .env.local.

| Variable | Purpose |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase endpoint |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Browser-safe key; RLS still essential |
| OPENAI_API_KEY | Server-only credential |
| OPENAI_MODEL | Optional supported structured-output model |
| NEXT_PUBLIC_DEMO_MODE | false live / true fictional demo; rebuild after changing |

For a **new database only**, review/apply migrations in filename order: foundation, catalogue, ranked retrieval. Configure Supabase auth site URL/callback allowlist. Existing live tables already exist: **do not rerun foundation/catalogue migrations**. Sources need recorded reuse basis, review and linked passages before activation. Do not grant ordinary users source-write/admin access. Document ingestion UI is deferred.

Production:

```sh
npm run build
npm start
```

## Tests and reproducible evidence

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Fresh October 31: lint/typecheck/build passed, 19 unit tests passed. To run the 17 HTTP checks, keep `npm start -- --port 3100` running in one terminal and run this in another:

```sh
node docs/final-product/check-http.mjs
```

ASSESSMENT_BASE can select another address. Results overwrite docs/final-product/evidence/http-results.json. This script uses unauthenticated requests and makes no model calls. The older smoke script expects demo mode. Reruns may change timings; update report values if needed.

Recorded local home-page GETs: median 10 ms, p95 13 ms (10 sequential samples). One Joyce answer: 8,758 ms. These measure different things; no internet/phone/load performance conclusion follows.

## Repository structure

```text
src/app/                Pages, auth callback and API routes
src/app/api/ask/        Request validation, retrieval, generation and storage
src/components/         Reusable form, chat, answer, navigation and history UI
src/lib/                Types, planning, ranking, evidence and service helpers
supabase/migrations/    Tables, RLS, RPCs and ranked retrieval
tests/                  Grounding/conversation regressions
scripts/                Setup, test runner and opt-in diagnostics
docs/final-product/     Five-page report, scope/results, walkthrough guide
docs/*-import/          Local source-import preparation/provenance
docs/original-planning/ Historical planning
```

Local import artifacts may contain licensed full transcripts. Public website excerpt permission is not automatically permission to redistribute complete transcripts in a public repository; confirm redistribution scope before publication. Exclude private participant/research data.

## Request lifecycle and engineering

1. AskForm POSTs expertId, question and bounded recent context to /api/ask.
2. Server validates input, authenticates, reserves an hourly attempt and checks the expert.
3. Structured planner clarifies once or supplies search phrases; earlier conversation is context, not evidence.
4. Database filters approved, rights-cleared expert passages. Up to four searches are deduplicated/rank-fused into at most four passages.
5. Model chooses evidence IDs. Server attaches original quotations and validates claims/citations; one invalid-output repair allowed.
6. store_guidance saves the result and citations; browser displays an answer, limitation or service error.

Functions, callbacks and composition provide abstraction/separation of concerns. Reusable components are not proof of class inheritance or polymorphism. Exact quotation provenance does not establish semantic correctness.

## Security and limitations

Keys remain server-side; environment files ignored except safe example. RLS/user ownership and source approval/rights gates remain enabled. Live attempts limited to 10/hour/account. Output renders as text; source URLs HTTP(S). Only two bounded exchanges reach the model as context; refresh/expert switch/New chat clear tab context, not saved history.

Outstanding: intermittent22P05, two-account/admin isolation, full feedback/report workflow, semantic benchmark, rights/audio audit, current mobile/accessibility/browser/hardware tests, public deployment and research consent/retention validation. No new student study was conducted today. A build pass is not production readiness.

## Deployment and submission

[Deployment plan](docs/DEPLOYMENT_PLAN.md): Vercel or compatible Node host; host-managed secrets; Supabase auth redirects; live verification. No public application deployment was performed here.

Attempt 1: repository URL with report and actual accessible video links. Attempt 2: ZIP of the same version with report and actual video file. No APK normally required for this web app. Exclude secrets/caches/node_modules/private material. Review/publish actual changes; do not invent commit history.

## Assistance and disclosure

OpenAI Codex assisted with planning, implementation, debugging, tests and documentation. Student review, explanation and course acknowledgement requirements remain the student's responsibility; no claim of independent authorship/full personal code review.

"AI-generated guidance based on selected published sources. NiaGuide does not represent, impersonate or speak on behalf of the featured expert. Check the cited sources before making important decisions."
