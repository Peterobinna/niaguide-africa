# Testing and results - 31 October 2026

## Environment

Windows; Node 24.11.1, npm 11.6.2; Next 16.3.6, React 19.3.0, TypeScript 6.0.3, Tailwind 4.3.3, Supabase JS 2.117.2, OpenAI SDK 7.23.0, Zod 4.6.5. Production build served at localhost:3100 using existing live configuration; secret values were not read or printed. In-app Chromium at observed 1280x720. Exact browser version, CPU and RAM not collected. No real phone or second OS tested.

## Approach 1: unit/regression tests

Why: deterministic checks protect evidence provenance and state handling against malformed model output. `npm test`: **19 passed, 0 failed**. Coverage includes UUIDs, fictional collection isolation, bounded context, query plans, deduplication/rank fusion, four-passage storage limit, evidence windows, invalid references/quotes, one retry and genuine insufficiency. Synthetic/mocked tests do not establish semantic correctness or remote RLS. Evidence: `evidence/unit-tests.txt`.

## Approach 2: built-application HTTP checks

Why: exercise actual routes and request validation. `node docs/final-product/check-http.mjs`: **17/17 passed**. Ten page GETs returned 200; an unauthenticated valid request returned 401; invalid ID, empty/overlong question, cross-origin, malformed JSON and body over 32 KiB returned 400. This script makes no authenticated paid model calls. Evidence: `evidence/http-results.json`.

## Approach 3: browser functional checks

- Existing localhost session was authenticated, despite the static Sign In header.
- Joyce question: "How can I prepare to speak confidently in public?" Produced practical steps, student example, four passages and AI disclosure; displayed model latency **8,758 ms**. Source expansion showed an original passage and joycedaniels.net link. One observation, not a latency benchmark or semantic audit.
- Save clicked; acknowledgment and Saved Answers reload checked separately in the browser record.
- Adesina question: "How can I develop leadership skills as a student?" Generation logged verified with four passages, but storage failed **22P05**. UI preserved the question and displayed a save error. Cause unresolved; another collection succeeded, so neither universal failure nor full reliability is claimed.
- Directory loaded 24 real profiles and availability labels.

## Performance and compatibility

Ten sequential local GET requests to `/`: median **10 ms**, nearest-rank p95 **13 ms**, range **7-13 ms**. These measure local HTTP round trips, not browser rendering, AI completion, internet speed or concurrency. Initial dynamic GET observations: experts 690 ms, ask 427 ms, dashboard 529 ms; cache/order affect results.

Desktop: 1280x720, observed document width 1265 px with no document horizontal overflow. Current 390x844 override did not apply: measurements remained 1280x720 after reload/new tab. No fresh mobile pass claimed. September screenshots are historical. Real-phone keyboard, low-end/high-end comparison, additional browsers/OS, accessibility and stress tests remain pending.

## Improvements and retests

- Today lint initially found 24 CommonJS import-rule errors across 12 offline transcript helpers. Added a narrow explanatory file-level exception matching the offline Node runner pattern; lint rerun passed. Application/security logic unchanged.
- Earlier retrieval selected up to six passages while storage allowed four; selection now capped at four before generation. Regression passes.
- Earlier repeated clarification replaced by schema-enforced search after the first exchange and continuous chat. Unit checks pass; not proof every conversation succeeds.
- 22P05 remains an open defect; no unsupported root-cause claim or speculative fix applied.

## Build / remaining checks

Fresh lint, TypeScript, 19 tests and production build passed. Compile phase 15.4 s, then type checking/static generation; not total build time. Fresh-copy install was not repeated today. No vulnerability or penetration audit performed.

Still required: two-account isolation/admin checks; full feedback/report persistence; public deployment/auth redirects; current phone/browser/hardware checks; semantic evaluation; source/audio audit; investigate intermittent storage failure. Keep failures in the report and document successful retests.
