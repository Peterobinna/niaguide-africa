# Search comparison: NiaGuide benchmark v1

## Status

Source preflight completed: Peter supplied four passing rows from Supabase; see `source-check-results.json`. All four match the expected expert/document and database eligibility flags. Search comparison not yet run. Ten questions: eight answerable cases from four passages, and two personal-information cases. No accuracy score or improvement result is available yet. The questions and evidence were fixed before this comparison. Some source material and related questions were already used during development, so this is an exploratory development benchmark, not an unseen test set.

## Files

- `questions-v1.json`: exact questions, target passage/document IDs, expected lessons and verification notes.
- `01-check-sources.sql`: read-only check of source identity, status and content fingerprints.
- `02-baseline-search.sql`: read-only single-query baseline for the eight answerable cases.
- `results-template.csv`: empty rows, explicitly marked not_run. Do not treat these as results.

## Methods to compare

Baseline: call the current PostgreSQL `retrieve_passages` function once with the exact original question. This is ranked lexical/full-text search with the app's current filtering and thresholds, not a deliberately weakened toy search.

Current method: use the existing planner with the exact question, selected expert name, collection field and empty recentConversation. Validate with `checkedPlan`, clean variants with `collectionQueries`, then invoke the actual `retrieveWithPlan` helper and the same database retrieval function. This combines the original question with up to three generated phrases using the production ranking, 30,000-character evidence budget and four-passage limit. Do not hand-write variants after viewing the targets. The planner must never see target IDs or expected lessons.

The comparison isolates query planning and combined ranking; it is not lexical search versus vector search. There are no embeddings in this implementation. Baseline uses the same original SQL function, corpus and expert/source filters. Current method has extra model and database calls, whose time and cost should be reported rather than hidden.

## Procedure

1. Freeze `questions-v1.json` and retain its hash before running. Record date, code SHA, exact planner model/version where available, current SQL function definition and corpus fingerprint/counts.
2. Peter runs `01-check-sources.sql` in Supabase and shares its four rows. Every passage must exist, belong to the stated document and expected expert, be non-synthetic, and have available/approved/eligible-rights status. If not, stop and record the setup failure; do not mark it as a search miss. User verification of a video does not prove reuse permission.
3. Record the corpus snapshot: source statuses, passage counts and hashes. Run both methods close together without changing sources or search logic. If the corpus changes, invalidate the pair and repeat against a fixed snapshot.
4. Run `02-baseline-search.sql` and retain the returned passage-ID arrays for all eight cases. This performs no writes or model calls. SQL Editor uses elevated privileges: document that context. For a controlled ranking comparison, both methods must use the same database context. A later authenticated run is needed for live-user/RLS validation.
5. Prepare and execute the current-method runner after source IDs/fields and database access are confirmed. It must reuse the production helpers, capture generated plans and raw ordered retrieval batches, and save returned IDs, timings and errors. Run each case once first; do not cherry-pick retries. Budget eight planner requests initially and record model failures/clarifications. This runner is still pending; the supplied baseline SQL alone does not complete the comparison.
6. Score each answerable case as a hit when its fixed expected passage appears in the top four. Report hits/8 overall, hits/4 for direct wording and hits/4 for paraphrases. The paired counts are small and share four underlying passages; do not claim statistical significance or broad accuracy.
7. A valid clarification is not a retrieval success. For retrieval coverage, keep it in the eight-case denominator as no retrieval hit and report clarification counts separately. Record API errors separately; do not silently drop failed cases or present them as normal search misses.
8. Returned alternate passages may also be valid. Review them separately and report that limitation: this set has one pre-labelled relevant passage per question, not exhaustive relevance labels. Do not rename hit rate as recall or precision. Preserve original scores if later adding relevance labels to a new benchmark version.
9. Test Q05 and Q10 as answer-safety cases. Returning some passages is not itself a safety failure; the answer must not invent private facts or ask for sensitive information. Record clarification and any follow-up refusal separately. These two cases are excluded from the retrieval-hit denominator.
10. Inspect answers separately for support, correct attribution, exact quotes, invented details and labelled hypothetical advice. A retrieval hit alone does not certify answer quality. Record results and limitations before writing slides.

## Source verification and caution

Peter confirmed S1 and S2 against the original videos, and S3 against the McKinsey article/video. For S4, Peter confirmed Dangote was speaking. Its stored header still carries an earlier unidentified-speaker/audio-verification warning, and the long passage contains unclear transcription. Keep the original passage unchanged during this benchmark; record the unresolved metadata conflict. Q08/Q09 concern traffic/community support only. Do not claim the governor built the company's roads or generalise beyond the quoted context. Exact time boundaries and full transcription accuracy remain unverified.

## Interpretation

The useful outcome may be improvement, no difference, or worse retrieval for some questions. Report all three honestly. No software change, live database mutation or benchmark score is implied by preparing these files. API/account-isolation testing and the historical 22P05 issue remain separate work.
