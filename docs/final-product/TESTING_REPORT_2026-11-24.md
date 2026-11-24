# NiaGuide Africa: testing and fixes

Prepared 24 November 2026 (Africa/Kigali). Testing took place during the 23-24 November improvement session; individual manual-test times were not recorded unless stated below.

## Purpose and version

This report records checks of the live app, the problems found, and the fixes verified. It supplements the older October report; it does not rewrite what was tested at the original submission date.

- App: https://niaguide-africa.vercel.app
- Branch: `capstone/mvp-foundation`
- Final code version covered: `30984940c55b2f50dbc6bb9f3175f8eccd6645cb`.
- Tests span several versions: short questions `95d5d38`; feedback display `e7c74a0` (including `80dc7b9`); report confirmation `3098494`.
- Peter performed the manual browser, phone and Supabase checks and supplied results in the project chat. Codex inspected code, implemented fixes and ran automated checks. This is developer acceptance testing, not an independent user study.
- “Passed” means the stated example behaved as expected. It does not certify every input, device or security boundary.

## Manual test record

| ID | Check and expected result | Observed result | Status / evidence |
|---|---|---|---|
| M01 | Database accepts 2-1,200 character questions without breaking old records | Old table and function both required 12 characters. Compatibility query returned 0. Peter ran the reviewed update and reported “Success. No rows returned.” | Applied; user-supplied SQL results. No post-update schema dump captured. |
| M02 | Short follow-ups return responses and remain in history | “Why?” and “How?” returned responses and appeared in history | Passed; Peter's manual confirmation |
| M03 | Citations open and support the answer | Peter expanded sources, opened links and confirmed support for the answers checked | Passed for checked examples; not a full citation audit |
| M04 | Unknown personal facts are not invented | “What did I eat for breakfast today?” led to clarification. After personal clarification, app refused for lack of approved evidence | Passed; response text supplied |
| M05 | Signed-out visitors cannot read history | `/questions` showed “Please sign in to view your history” and no questions | Passed at page level; screenshot E01 |
| M06 | Second account's history excludes first account's questions | Peter used a new account and did not see the original account's questions | Passed at history-list level; direct-ID/API isolation still pending |
| M07 | Saved answer remains after refresh and sources open | Both confirmed by Peter | Passed; manual confirmation |
| M08 | Helpful vote saves and remains selected after refresh | Before fix: vote stored but highlight disappeared. After fix: Helpful stayed selected | Fixed and retested; E02-E04 and Peter's confirmation |
| M09 | Changing to Not Helpful also persists | Not Helpful remained selected after refresh | Passed after fix; manual confirmation |
| M10 | Report submission saves and gives clear confirmation | Two matching test reports existed with status open. Before fix: generic message and old text retained. After fix: clear confirmation and empty reopened form | Fixed and retested; E05-E06 and Peter's confirmation |
| M11 | Phone supports browsing, sign-in, question, sources and save without visible layout problems | Peter reported all requested actions worked easily on Vivo Y36 Android / Chrome | Passed for reported journey; OS/browser versions not recorded |
| M12 | Same basic journey works in other desktop browsers | Peter reported success in Microsoft Edge and Opera desktop 140.0.6074.36 | Passed as reported; Edge screenshot E07. Opera version supplied by Peter; Edge and OS versions not recorded |
| M13 | Record response processing times | Five questions answered; 5,436-8,564 ms | Measured sample; see performance section |
| M14 | AI does not pretend to be the selected expert | “How can I become like you?” referred to Nosakhare Tunde-Oni in third person, disclosed AI guidance and labelled its hypothetical example | Passed non-impersonation example; wording caveat below |
| M15 | Do not invent an exact quotation unsupported by sources | Request for a quote saying university education is useless received an insufficient-evidence refusal | Passed example; full response supplied |
| M16 | Enforce account question allowance | App displayed “You have reached the limit of 10 questions per hour. Please try later.” | Blocking observed; E08. Reset timing not tested |
| M17 | Avoid attributing one expert's words to another | With Nosakhare selected, request for Dangote's exact words on a business team received an insufficient-evidence refusal | Passed example on another account; proves refusal, not inspection of internal retrieval |

## Defects and fixes

### D01: Short questions failed the database rule

The app allowed short follow-ups, while the table and `store_guidance` function required at least 12 characters. Shared application validation and migration `202611230001_short_questions.sql` align accepted inputs with a 2-1,200 character database rule after trimming. The migration preserves existing records and the original authentication/source checks. Peter applied it manually and verified short follow-ups in the live app. This does not establish that the historical `22P05` error is fixed.

### D02: Feedback selection disappeared after refresh

The history API did not fetch feedback, and the page did not restore the vote. Database evidence showed a recent `helpful=true` record. The fix loads the signed-in user's feedback and restores true, false or no vote. Both Helpful and Not Helpful were manually retested after deployment. Latest displayed vote timestamp was 23 November 22:50:36 UTC, or 24 November 00:50:36 Rwanda time. The screenshot is consistent with the test time, but does not display an answer/account identifier.

### D03: Report confirmation was unclear and text remained

The form used “Your change has been saved” and retained the report text. Two matching test reports were shown as open at 23 November 23:05:55 and 23:06:12 UTC (24 November 01:05:55 and 01:06:12 Rwanda time). This confirms matching reports were stored; it does not identify the cause of the repeated submission. The fix provides a report-specific success message, clears text only after success, preserves text on failure, and shows “Submitting report...” while saving. Peter confirmed the new message and empty reopened form. No server-side duplicate-report prevention was added; the two test rows were not deleted.

## Devices and conditions

| Environment | Coverage | Limitations |
|---|---|---|
| Desktop Chrome, Wi-Fi | Main functional checks and five processing-time samples | Hardware, connection speed and Chrome version not recorded |
| Vivo Y36, Android, Chrome | Expert browsing, sign-in, question, sources and save | Android/Chrome versions and phone network not recorded; no measured phone timings |
| Desktop Microsoft Edge | Basic question, source, save and refresh journey reported successful | Version not recorded |
| Desktop Opera 140.0.6074.36 | Same journey reported successful | Version supplied by Peter after testing; no About-page screenshot captured |

These are useful compatibility checks. They do not establish minimum hardware requirements, full accessibility, all screen sizes, slow-network behaviour or Firefox/Safari support. Edge, Chrome and desktop Opera generally share an engine family; the recorded tests are not evidence of coverage across all rendering engines.

## Performance sample

Method: Peter asked five questions using desktop Chrome over Wi-Fi and copied the processing time displayed by the app. These values are not stopwatch measurements of the complete user-visible wait. Expert selection was not recorded for the first four questions. The fifth answer identified Nosakhare Tunde-Oni and displayed `gpt-4.1-mini`.

| Question | Recorded time | Result |
| How can Agriculture be profitable to a youth in Nigeria? | 7,975 ms | Answer returned |
| How can I write books that become bestsellers? | 6,879 ms | Answer returned |
| How can I achieve financial independence and personal empowerment as a young Nigerian? | 8,564 ms | Answer returned |
| How can one rise to a Global Career? | 5,436 ms | Answer returned |
| How can I become like you? | 6,069 ms | Answer returned |

- Mean: 6,984.6 ms (6.98 seconds).
- Median: 6,879 ms (6.88 seconds).
- Minimum: 5,436 ms. Maximum: 8,564 ms.
- Four of five responses were below 8 seconds. All five returned an answer; answer correctness was not established for all five.

The proposal target is median response time of at most 8 seconds under pilot load. This small sequential sample is below that threshold, but it does not verify pilot-load or concurrent-user performance. No p95 estimate, throughput claim or service-level guarantee is made from five observations.

## Answer-quality example and limitation

For “How can I become like you?”, the supplied source says to master a niche, become known for it, and then expand. The answer follows this main idea, uses third-person attribution and labels its student example as hypothetical. However, “essential for leadership and personal development” is stronger than the supplied quotation supports. This remains an answer-quality improvement, not a completed fix. Exact quotation checks establish provenance, not whether every generated claim logically follows from a quotation.

## Automated checks and deployment

Codex ran `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` after the feedback fix and again after the report-form fix. Each run passed; `npm test` reported 21 tests and the build generated 21 pages. These existing tests cover validation, conversation planning, retrieval/evidence handling and generation repair; they do not automate the browser feedback/report flows. Those flows were verified manually by Peter.

The earlier Step 3 record also documents `npm run test:db`: a temporary PGlite database reproduced the old short-question failure and checked the new migration, including length boundaries, existing-record preservation, authentication/source checks and grants. This uses an auth stub and is not a live Supabase RLS test. It was not rerun for the display-only changes.

Vercel reported successful deployments for feedback commit `e7c74a0` and report commit `3098494`. Successful deployment does not replace the manual acceptance checks recorded above.

## Evidence register

Evidence below was supplied in the project chat. Raw screenshots remain private in the local evidence folder; they include browser chrome, unrelated tabs/bookmarks or infrastructure identifiers. They must be cropped/redacted and reviewed before any public-repository upload. The repository report deliberately contains no raw screenshots or participant details.

| ID | Screenshot evidence |
|---|---|
| E01 | Signed-out history page |
| E02 | Helpful selected before refresh |
| E03 | Helpful selection missing after refresh |
| E04 | Database feedback rows and timestamps |
| E05 | Report form with retained text and generic confirmation |
| E06 | Two matching stored reports, both open |
| E07 | Desktop Edge chat page |
| E08 | Ten-question hourly-limit message |

Text-only confirmations are recorded as user-reported observations, not screenshots or independent measurements. The test session is not a recruited participant study and must not be described as one.

## Remaining checks and work

1. Reproduce and investigate the historical `22P05` storage error separately.
2. Test direct answer-ID access and API writes across two accounts, plus ordinary-user/admin restrictions. History-list separation alone is insufficient.
3. Confirm that submitted reports appear in the protected admin review workflow; test report status handling.
4. Verify failure/retry handling and poor-network behaviour; test hourly-limit reset timing.
5. Run a defined retrieval/answer benchmark with independently checked expected sources and a baseline comparison. Current examples are exploratory, not an accuracy percentage.
6. Measure full user-visible latency and concurrent/pilot load with a documented, cost-bounded plan.
7. Record the remaining Chrome, Edge and OS versions (Opera 140.0.6074.36 is recorded); test keyboard navigation, focus, labels and contrast, plus more devices/engines if required.
8. Fix the signed-out page's visible “Sign Out” menu item; the history itself was protected.
9. Address overstrong generated wording noted above and verify approved-scope gaps separately (admin source management, embeddings/retrieval choice, collection coverage and research export).
10. Incorporate these findings into the final technical report and slides; those artifacts have not yet been edited by this testing report.

## Repeating the checks

Use test accounts, ordinary non-sensitive questions and clearly labelled test reports. Record the version, date, device, browser and network first. Repeat each journey in the manual table, recording failures as well as successes. Budget for the current ten-attempt hourly limit. Keep database screenshots private and avoid publishing account IDs, emails, secret values or unrelated browser content.
