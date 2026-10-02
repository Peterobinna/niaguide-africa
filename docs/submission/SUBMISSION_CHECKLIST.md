# Submission preparation

Start with the [README](../../README.md) and [evidence PDF](NiaGuide_Africa_Submission_Evidence.pdf).

## Course AI-use requirements: confirmation pending

On 2 October 2026, the supplied "Initial software product/solution demonstration" instructions and 15-point rubric were reviewed. They require design evidence, frontend/backend examples, a database model, infrastructure discussion, a repository ZIP and a 5–10-minute functionality demonstration. The supplied text contains no explicit rule permitting or prohibiting AI-assisted coding, and no explicit AI acknowledgement format.

Silence in this assignment is not permission. The course syllabus, applicable academic-integrity policy and supervisor guidance have not been supplied or verified. Before submitting:

- Check those sources for permitted assistance, required disclosure and any prompt/history evidence requirements.
- If unclear, ask the supervisor: "I used OpenAI Codex for planning, code generation, debugging and documentation. What use is permitted for this capstone, and what acknowledgement or evidence must I submit?"
- Record the actual policy source and required action once confirmed. Do not mark this check complete without that evidence.
- Review the factual development-assistance note in the README and adapt it to any required format without claiming work or review you did not perform.

## Explain the implementation in your own words

Rehearse these points using the evidence PDF and actual code. These are preparation prompts, not a claim that understanding has been assessed.

| Topic | Plain-language explanation to practise | Code reference |
|---|---|---|
| Mobile navigation | React tracks whether the menu is open; CSS changes the layout on a small screen. | src/components/header.tsx; src/app/globals.css |
| Filtering | Search and selected filters change the visible expert list. | src/components/explorer.tsx |
| Input validation | The server checks the expert ID and question length before searching. | src/lib/retrieval.ts; src/app/api/ask/route.ts |
| Retrieval and citations | The demo selects relevant fictional passages and returns numbered source references. | src/lib/retrieval.ts; src/app/api/ask/route.ts |
| Insufficient evidence | An unsupported question returns a limitation instead of an invented answer. | src/lib/retrieval.ts |
| Saving | Demo answers stay in browser storage; live database persistence needs separate integration testing. | src/lib/local-history.ts; src/components/answer-card.tsx |
| Database | Experts have documents, documents have passages, and citations connect answers to passages. | supabase/migrations/202609280001_foundation.sql |

Open each example, explain what it does, and demonstrate its visible result. If you cannot explain a section, review it before recording. Distinguish working synthetic behaviour from unverified live Supabase/OpenAI integration.

## Final deliverables

- Record and watch a 5–10-minute video focused on application functionality.
- Check the repository branch link points to the application, not only the original planning files.
- Include README, application code, lockfile, current design/evidence documents and video in the final submission as required.
- Exclude credentials, node_modules, .next and private material from the ZIP; verify the extracted package.
- Confirm the exact LMS deadline and upload requirements before submitting.
