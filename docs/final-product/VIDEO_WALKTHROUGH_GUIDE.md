# Record your technical walkthrough

The current assignment gives no duration. Aim for 10-12 focused minutes unless your supervisor specifies otherwise. This is a preparation guide, not a recorded video. Explain code in your own words; review unfamiliar sections before recording.

## Set up

1. Start the app from the folder with package.json: `npm run dev`, or `npm run build` then `npm start`. Sign in using your usual account. Use the tested Joyce collection first.
2. Open VS Code files listed below, the five-page report, scope table and test results. Enlarge the text.
3. Open Supabase expert/document/passage metadata only. Keep .env.local, keys, tokens and participant records off-screen.
4. Use your existing screen recorder, enable your microphone and record a 20-second trial. Play it back. Hide unrelated tabs/notifications. Use landscape 1080p if available.

## Recording sequence

| Time | Show | Explain in simple words |
|---|---|---|
| 0:00-0:45 | Landing page and feature table | The student problem; AI guidance with sources, not the expert speaking. 16 available collections out of 24 profiles as of October 31. |
| 0:45-2:30 | Directory, filters, Joyce question and citations | Ask: How can I prepare to speak confidently in public? Wait for the real result. Open a passage and original source link. Practical examples are AI-created applications. Save and verify Saved Answers after reload. |
| 2:30-3:30 | New chat and different input | Try an unrelated question such as car engine repair. Show the actual result, including any error. Do not promise a canned response. |
| 3:30-6:30 | VS Code files below | Trace one request from browser to database, model, validation and storage. |
| 6:30-7:30 | Supabase table structure | Experts link to documents, documents to passages; answers link to citations and account-owned history. No secret keys in the browser. RLS is access control, not a completed security audit. |
| 7:30-9:00 | Unit and HTTP results | Explain the two approaches, why selected, results and improvements. Show 19 unit tests and 17 HTTP checks. Local GET timings are not AI speed. Mention the observed Adesina 22P05 failure if unresolved. |
| 9:00-10:30 | Device/browser and deployment | Test mobile emulation and an actual phone if available. Show the real public URL only if deployed. Supabase is live; Vercel is planned until verified. |
| 10:30-11:30 | Modules, report, README | Explain modular functions, reusable components, abstraction and limitations. Acknowledge Codex assistance truthfully. |

## Code guide: press Ctrl+P and enter each path

- `src/components/ask-form.tsx`: React state stores draft/messages. `submit` sends expertId, question and recent context to `/api/ask`. Loading prevents duplicate sends; failures preserve the draft.
- `src/app/api/ask/route.ts`: input size/shape checks, user authentication, hourly reservation, expert lookup, search planning, retrieval, generation checks, storage and response. Point to both success and failure paths.
- `src/lib/conversation.ts`: original query plus up to three reformulations; deduplicate IDs; combine reciprocal-rank scores; cap at four passages and 30,000 source characters. Only two exchanges become context. No second clarification after a prior exchange.
- `supabase/migrations/202610130001_ranked_retrieval.sql`: filter by expert/status/approval/rights; match English words and rank results. Say full-text search, not vector similarity. Do not rerun migrations during recording.
- `src/lib/evidence-generation.ts`: slices original evidence windows; model selects evidence IDs; server attaches original text. Unknown evidence fails closed.
- `src/lib/checked-generation.ts`: validates output; one repair attempt; genuine insufficiency remains a limitation. Citation provenance does not prove every claim is true.

The app uses functions/composition, not a custom class-inheritance hierarchy. Reusable components are not automatically proof of inheritance or polymorphism.

## Run tests on camera

`npm test` runs unit regressions. For HTTP tests, keep a production server on port 3100 (`npm start -- --port 3100`), then run `node docs/final-product/check-http.mjs`. Alternatively set ASSESSMENT_BASE to your server address. This script overwrites the current HTTP evidence file, so update report metrics if your new values differ.

## Test a phone

Desktop emulation: open Chrome DevTools, toggle the device toolbar, choose 390x844, then test menu, typing, scrolling and source expansion. Label this emulation. The October 31 automated override failed, so no current mobile pass is recorded yet.

Real phone: on the same trusted Wi-Fi, use `npm run dev -- --hostname 0.0.0.0`, find the laptop Wi-Fi IPv4 address and open `http://LAPTOP-IP:3000` on the phone. Auth redirects may need an explicitly allowed callback. If local network restrictions block it, use a deployed HTTPS preview. Do not weaken authentication or broadly change firewall access.

## Finish

1. Watch the entire recording. Check sound, readable code, credentials and failed steps.
2. Save as `NiaGuide_Africa_Technical_Walkthrough.mp4`; the ZIP needs the actual video file.
3. Upload to your permitted video service or ALU Drive; give assessors view access without changing research-folder sharing.
4. Put the real accessible video URL in README. The guide is not a substitute for that link.
5. Check the video and report links from a signed-out/incognito window after publishing the repository.
6. Add fresh phone/deployment/retest findings and regenerate the report if conclusions change. No video is recorded or uploaded by this preparation task.
