# NiaGuide Africa: testing summary for report and presentation

Prepared 24 November 2026. Source: `TESTING_REPORT_2026-11-24.md`.

## Technical-report text

During the 23-24 November improvement session, the developer manually checked NiaGuide on desktop Chrome, Microsoft Edge, Opera desktop and a Vivo Y36 Android phone using Chrome. The tested journeys included questions, short follow-ups, history, source links, saved answers, feedback and reporting. Browser and operating-system versions were not recorded, so these results apply to the tested environments rather than every version.

The session found three issues: the database rejected short questions, saved feedback did not remain highlighted after refresh, and report submission used an unclear message while keeping old text. The database rule and application code were updated. The developer confirmed that short follow-ups were stored, Helpful and Not Helpful persisted after refresh, and reports displayed a clear confirmation with an empty form when reopened.

Five desktop Chrome questions over Wi-Fi returned answers. Their displayed processing times ranged from 5.44 to 8.56 seconds, with a mean of 6.98 seconds and a median of 6.88 seconds. The median was below the proposal's eight-second target in this small sample. Concurrent-user performance and complete user-visible waiting time were not measured, so the pilot-load requirement is not yet verified.

The app refused an unknown personal fact after clarification, an unsupported exact-quote request, and a request for another expert's words while Nosakhare Tunde-Oni was selected. An inspected answer used third-person attribution and an explicitly hypothetical example. One claim was stronger than its quotation supported. These examples provide useful evidence, but do not establish a general accuracy or hallucination rate.

After the feedback and report-form fixes, lint, type checking, 21 existing automated tests and production builds passed. The automated suite does not replace the manual UI checks. Direct cross-account API access, admin restrictions, historical storage error 22P05, broader accessibility testing and a formal retrieval benchmark remain pending.

## Slide 1: What we tested

- Desktop: Chrome, Microsoft Edge and Opera (exact versions pending).
- Phone: Vivo Y36, Android, Chrome.
- Journeys: ask, follow up, inspect sources, history, save, vote and report.
- Manual checks performed by the developer; not an independent user study.

Speaker note: Describe these as the devices and journeys actually tested. Do not say the app works on every browser or device.

## Slide 2: Problems found and fixed

| Problem | Change | Retest |
|---|---|---|
| Short questions conflicted with database limit | Align app and database question rules | Why? and How? answered and appeared in history |
| Feedback highlight disappeared | Load the saved vote with history | Helpful and Not Helpful survived refresh |
| Report confirmation was unclear | Specific success message and clear submitted text | Confirmation appeared; reopened form was empty |

Speaker note: Show a current live example. The report form still allows separate reports; do not claim server-side duplicate prevention.

## Slide 3: Measured processing time

- Five questions; desktop Chrome over Wi-Fi.
- Median: 6.88 seconds. Mean: 6.98 seconds.
- Range: 5.44-8.56 seconds; four of five below eight seconds.
- Small sequential sample; not a load test or full browser-wait measurement.

Speaker note: The sample meets the median threshold, but the proposal's pilot-load condition still needs testing.

## Slide 4: Evidence checks and honest limits

- Refused unsupported personal information and a requested unsupported quotation.
- Refused a cross-expert request in the selected collection.
- Sources supported the examples checked; one answer used wording stronger than its source.
- Next: formal answer benchmark, account/API isolation, load tests and broader accessibility checks.

Speaker note: Avoid claiming zero hallucinations, complete security, or a numerical accuracy score.
