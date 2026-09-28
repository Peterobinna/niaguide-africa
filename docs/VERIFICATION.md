# Verification record

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
