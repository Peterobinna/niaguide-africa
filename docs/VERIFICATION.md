# Verification record

## Live setup progress — 2026-10-06

The earlier local-only results below are historical. The owner applied both SQL migrations in Supabase; supplied screenshots show 11 public tables and 20 catalogue records (10 coming, 10 review). Visible RLS results were true; a full policy-isolation test remains pending.

In the signed-in Supabase dashboard, the local callback `http://localhost:3000/auth/callback` was added with owner approval. Email sign-up and email confirmation were already enabled. The owner completed registration and reported confirming the email. Browser verification showed an active application session, an authentication user, and a matching `profiles` record with role `student`. Account history loaded empty without an error. This does not yet verify sign-out/sign-in, two-account isolation, answer persistence or OpenAI generation.

Live-dashboard verification exposed fictional demo recommendations and empty-state wording in live mode. The dashboard now receives the server catalogue and uses mode-appropriate wording and collection counts.

After that correction, lint, TypeScript, all six automated tests and the production build passed. Browser verification of the production server confirmed real catalogue cards, zero available collections and the corrected live empty state. An authenticated question, "How can I lead a student project?", against Akinwumi Adesina returned the expected insufficient-evidence response. Saving it succeeded; the question remained visible on Saved Answers after navigation and a full reload. This verifies the live insufficient-evidence storage and retrieval path for this account, not generated answers with citations. Sign-out/sign-in, two-account isolation and OpenAI generation remain pending.

## Local checks

- Dependencies installed from npm; installation audit reported zero vulnerabilities.
- Final run: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` all passed. Six tests passed, zero failed; Next.js produced the production route build successfully.
- Git-tracked review files were scanned for common private-key, OpenAI-key, Supabase-secret and JWT credential patterns, plus any configured credential values. No findings. `.env.local` is ignored. `git diff --cached --check` passed. Review branch: `capstone/mvp-foundation`; see Git history for current commit and publication status. No merge into main was performed.
- Six automated regression tests: real-expert isolation, supported synthetic retrieval, unrelated/weak/high-stakes abstention, validation limits, rejection of invalid citation indices/invented quotes/model citation markers, and catalogue completeness.
- `node scripts/smoke.cjs` against the running demo: relevant answer, unrelated question, real-expert abstention, invalid payload, cross-origin request, oversized body and malformed JSON. Fourteen public/student/admin/auth/source routes returned 200.

## Fresh-copy setup verification (2026-09-28)

A separate folder was populated from project source, excluding node_modules, .next, .git and .env.local. On Windows, Node 24.11.1 and npm 11.6.2:

- npm ci installed 374 packages from the lockfile, using a local download cache.
- npm run setup:demo created the demo-only environment; repeating it refused to overwrite the file.
- Lint, all six regression tests, production build and TypeScript checks passed.
- npm start on port 3001 started successfully. SMOKE_BASE_URL=http://127.0.0.1:3001 selected it for seven API cases and fourteen route checks; all passed.
- The browser career/skill question returned two citations. Opening the first displayed its synthetic passage. Saving and navigating to Saved Answers retained the question. No browser error or warning logs appeared during the form check.

This verifies a fresh source copy with cached package downloads, not an uncached install on another operating system. Check the final ZIP after packaging.

## Earlier browser checks performed

Verified using the rendered app in the in-app browser:

1. Desktop landing hierarchy, colours, fonts, navigation, hero and source preview.
2. A career/skill question returns synthetic excerpts with [1] and [2]. Source expansion displays title, date, type, passage and original synthetic-note link.
3. Save, helpful feedback and test report produce the explicit browser-local acknowledgement. The saved question appears on Saved Answers after navigation.
4. Search for Ngozi returns both matching names; combining the Economics filter narrows to one. Reset works; Available returns only fictional Amara.
5. Mobile 390 × 844: navigation opens, profile-to-question flow works, unrelated quantum question returns the exact insufficiency message. Landing and Ask have no horizontal document overflow after fixing the CTA width.
6. Admin preview collection control changes the on-screen status and explicitly confirms that public availability is unchanged. Browser error log was empty after final interaction checks.

## Issues found and fixed

- JSX closing syntax caught by initial lint/build.
- Windows test launcher incompatibility with OS user-profile lookup: replaced tsx with a small development-only TypeScript transpilation runner.
- Browser submission rejected by internal Next request hostname: compare the incoming browser Origin host against Host rather than Next's internal URL.
- Mobile CTA width plus margins caused horizontal overflow: constrain width; tighten mobile headline sizing.
- Live save upsert conflict target corrected; saved-list state now updates immediately.
- Historical citations tolerate withdrawn/unavailable sources instead of crashing.

## Evidence

- `screenshots/landing-desktop.png`
- `screenshots/landing-mobile.png`
- `screenshots/mobile-navigation.png`
- `screenshots/answer-sources.png`

## Not verified / manual release checks

No Supabase/OpenAI credentials were visible to the process. Therefore no remote migrations, live auth emails, real OpenAI requests, live persistence, real policy isolation tests or deployment were performed. Do not infer those integrations pass from a local build. Apply migrations to a new disposable Supabase project, configure Auth URLs/SMTP and roles, then follow the two-account and admin tests in DATABASE_SCHEMA.md. Screen-reader, zoom, additional device testing, semantic grounding evaluation and research consent remain release prerequisites.

### 13 October 2026: distinguish generation validation from missing evidence

Added a bounded second generation attempt when structured output is missing or fails the existing exact-quote/citation checks. Same approved passages and model are used; explicit insufficient evidence is not retried. Persistent validation failure returns a service error and is not stored as an insufficient-evidence answer. Server diagnostics contain only outcome and source count, not questions, source text or credentials. Retrieval and permission policies are unchanged. An invalid first answer can incur one additional model call. Automated regression tests cover repaired output, persistent invalid citations, genuine insufficiency, no sources and null output. No live paid API test was run; the screenshot's specific failure cause remains unconfirmed. Tests, typecheck and production build passed.

2026-10-15: Imported expert ID regression fixed: expert request/admin validation uses canonical GUID format compatible with PostgreSQL rather than RFC version/variant enforcement. Actual John ID and malformed-ID regression tests pass (11 tests); typecheck and production build pass. End-to-end signed-in AI request not verified.

### 21 October 2026: preserve original transcript quotations

Reproduced the reported corruption-question failure with a live model call using the local approved import copy of Ngozi's "Strong systems against corruption" passage: the response completed but claims 2 and 3 failed exact quotation matching. This reproduces the failure class, not the original logged request (whose exact model output was not retained).

The model now selects numbered evidence excerpts; the server attaches the untouched original text and source index, then applies the existing quote/citation validation. Excerpts are overlapping windows of at most 600 characters from retrieved approved passages. Unknown evidence IDs fail closed; claims are never silently dropped. Insufficiency, expert scope, rights filtering, authentication, and database policies are unchanged. Validation diagnostics log only attempt numbers and failure codes. Exact quotation matching establishes provenance, not semantic entailment; human answer-quality review remains necessary.

Live API checks after the change: the same corruption question returned an answer with no quotation/citation failures; an unrelated cake question returned sufficient=false and no claims. These calls used a local approved passage copy, not the entire authenticated retrieval/save path. The in-app browser can load the local app but is not signed in, so full signed-in browser submission remains unverified. The optional scripts/check-ngozi-live.ts diagnostic requires the local ngozi-import files and existing environment configuration; it makes one paid API call per invocation and does not modify the database.

Validation: all 14 regression tests, ESLint, TypeScript, production build, and git diff whitespace check passed. No database records or permissions were changed.

### 21 October 2026: natural questions and bounded follow-ups

Added a structured, source-independent search planner that either asks one clarification or creates up to three short reformulations. The original question and reformulations use the existing authenticated retrieve_passages function with the same selected expert and approval/rights filters. Results are deduplicated and rank-fused, capped at six passages and 30,000 source characters. This is model-assisted query expansion over lexical search, not vector/embedding retrieval; it improves wording coverage but does not guarantee relevant evidence exists. One additional model call and up to four retrieval calls can increase latency/cost. Existing question limits still apply, including to clarification requests.

The current tab retains two exchanges (questions up to 1,200 characters, answers up to 2,000 each) for follow-ups. Context is discarded across expert IDs and reset on refresh, expert switch or Start a new conversation. The page explains that this context is sent to the AI and clearing it does not delete saved history. Server input is bounded at 32 KiB for this endpoint only. Prior answers and user context are untrusted context, never evidence. Clarifications are displayed separately and are not stored as sourced guidance or given save/feedback controls. Short replies such as "Her career" are accepted. The answer card labels practical steps/examples as AI-created applications.

Live planning tests: broad aspiration produced a clarification; a career reply retained the original personal-development goal after a prompt correction; a natural classroom-speaking question produced related search phrases. Proper-name/filler removal is enforced locally because live planning sometimes included names despite instructions. A live answer-generation check with the approved local Ngozi systems passage and a student-club money question produced practical steps with valid evidence references. Semantic soundness still needs human review; exact provenance is not a factual entailment check.

All 17 regression tests, lint, typecheck, production build and whitespace checks passed. Updated local page/disclosure verified in browser. Full signed-in retrieval, clarification round-trip, persistence and reset interactions remain unverified in the browser: its local-app session is signed out. No Supabase migrations, source changes or permission changes were made. Live diagnostics are opt-in scripts/check-conversation-live.ts (three paid calls) and scripts/check-ngozi-live.ts --student (one paid call with local import files).

### 22 October 2026: stop clarification loops and use a continuous chat

Replaced the top-entry/separate-answer layout with a chronological transcript and a reply composer below its independent scroll area. All completed exchanges remain visible until refresh, expert switch or New chat; only the last two exchanges are sent as context. Previous source/feedback controls are retained. Pending replies show progress; errors preserve the draft; a synchronous submission guard prevents duplicate sends. Enter sends, Shift+Enter adds a line, and IME composition is respected. New replies scroll within the transcript, not back up the document. Privacy/context disclosure is accessible below the composer. Desktop preview: chat-layout.png.

The prior prompt-only clarification instruction proved insufficient. After any prior exchange, the planner now uses a schema requiring needsClarification=false and clarification="", with an additional server check. Clarification is available only for the first exchange of a fresh conversation. It must subsequently retrieve evidence or return a limitation, not ask another narrowing question. Guidance instructions also stop default closing questions. This does not bypass source grounding or permit unsupported advice.

All 17 regression tests, lint, typecheck, production build and whitespace checks passed. Five live planner cases passed, including the reported "Strategies" and "Negotiation Strategies" replies, which both produced search plans without clarification. The optional live diagnostic now makes five paid calls. Desktop layout and visible composer verified in the browser. Full signed-in chat submission, mobile keyboard behavior and persistence were not verified; the in-app session is signed out. No database or permission changes.

## 2026-10-22: Dangote question coverage
- Reviewed the imported approved excerpts: business understanding, teams, vision and persistence; no explicit business-idea validation procedure in the selected text.
- Live retrieve_passages: original idea-testing question and market-research query returned zero matches. Under authenticated role, curated understanding/team/vision questions returned 3/3/2 matches.
- Replaced universal real-expert suggestions with curated Dangote prompts. Other real collections show no unverified generic suggestions; fictional demo retains its examples.
- Lint, typecheck, 18 tests and production build passed. Built page verified in browser; screenshot: dangote-suggestions.png.
- No remote data or retrieval safeguards changed. Signed-in answer generation and real-phone/keyboard behaviour were not tested in this check.

## 2026-10-23: Answer persistence and collection context
- Retrieval now returns at most four passages before generation, matching store_guidance's four-citation limit without discarding citation markers after generation.
- Planner receives the database collection field and instructions to resolve partner as romantic partner in a relationships collection unless the user specifies otherwise.
- Persistence uses the resolved standalone question for follow-ups. Storage failure diagnostics include only error code and source count.
- Added regression covering twelve candidates across three searches, deduplication and four-passage selection.
- Lint, typecheck, all 19 tests and production build passed. Signed-in live answer persistence and model clarification behavior were not tested in this run. No remote database changes.


## 31 October2026: final-product assessment preparation
Fresh lint/typecheck/19 tests/production build passed. Lint initially failed CommonJS syntax in12 offline import helpers; explanatory narrow rule exceptions fixed24 findings. Built-route HTTP17/17 passed. Fresh Joyce cited generation,source expansion,save acknowledgment and Saved Answers reload passed; displayed latency8758ms. Adesina generation verified but storage failed22P05,cause unresolved. Aggregate live catalogue24 real profiles/16 available/211 approved documents/3880 passages. Current mobile override did not apply; no fresh mobile pass or hardware/second-browser comparison. Five-page report and full qualifications:docs/final-product. No public deployment,video recording,push,merge or LMS submission. Historical zero-source/unconfigured statements above describe earlier dates,not current status.
