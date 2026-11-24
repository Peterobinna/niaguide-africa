# Running the current-method comparison

Status: first paired run completed on 24 November 2026. Baseline 1/8; current method 3/8; one clarification and no planner errors. See paired-results-2026-11-24.json. The steps below document how to reproduce a new, separately recorded run. The earlier user-run baseline is preserved in baseline-user-results.json (1/8 hits). The paired run repeats the baseline in the SAME SQL statement as planned searches to avoid corpus changes between methods. Do not compare different snapshots as if they were identical.

## Step 1: exact expert context
Run 03-expert-metadata.sql in Supabase. Save the two rows as a JSON array in a private workspace file named experts.json. This records the same name and field supplied by the app. Do not substitute generic fields.

## Step 2: planning (eight paid model requests maximum)
From the repository folder, with the existing OpenAI environment configured locally:

    node --env-file=.env.local scripts/run-ts.cjs scripts/benchmark-search.ts plan ABSOLUTE_PATH_TO_experts.json NEW_PRIVATE_RUN_DIRECTORY

The script never prints credentials, does not write questions/answers or bypass the app's API limit, and performs a separate read-only research diagnostic. It does not call the public app API. It makes one planning request per answerable case with maxRetries=0 and records errors rather than silently retrying. This intentionally differs from the app's transport retry allowance, not its planning/ranking logic. Model selection uses OPENAI_MODEL or the app default. Confirm this matches deployment before claiming exact production parity. It records actual response model and token usage when available. No target passage/expected lesson is sent to OpenAI. An existing output directory is rejected to preserve earlier results.

Inputs are versioned by question and helper hashes. plans.json captures questions, generated plans, metadata and timings. run-searches.sql contains the exact original queries and actual generated variants. No answer generation occurs.

## Step 3: same-snapshot retrieval
Run the generated run-searches.sql in Supabase SQL Editor. It uses the existing retrieve_passages function for both baseline and planned searches. Copy/export ALL result rows as JSON to a private sql-results.json. Rows include approved source text so the actual production helper can enforce its JavaScript character budget; keep this raw export out of GitHub. Results contain corpus and function fingerprints, role, timestamp and actual collection fields. The query does not change data.

## Step 4: score

    node scripts/run-ts.cjs scripts/benchmark-search.ts score ABSOLUTE_PATH_TO_plans.json ABSOLUTE_PATH_TO_sql-results.json

The scorer calls the real retrieveWithPlan helper with the recorded ordered batches. It rejects changed questions/helpers, mixed snapshots, mismatched expert fields, duplicate/missing rows and incomplete exports. Scores go beside plans.json and will not overwrite an existing scores.json. It reports hits/8 and direct/paraphrase groups, plus clarifications and planner errors. Only IDs and measurements go in the score report, not source excerpts.

## Limitations
This isolates retrieval, not answer generation, faithfulness, citation correctness or RLS. The baseline is full-question ranked lexical retrieval; the current method adds model planning and rank fusion. It is not a comparison against web search, ChatGPT or vector retrieval. The eight cases share four preselected passages and were prepared with knowledge of their content; this is an exploratory benchmark. Planning timings exclude manual SQL execution and are not full response times. No result or improvement claim is valid until the paired run finishes.

## Offline verification

    node scripts/run-ts.cjs tests/benchmark-search.test.ts

These fixture tests verify target-data exclusion from planner input, production ranking/evidence-size behaviour and missing-batch rejection. They do not invoke AI or certify live retrieval. Run normal lint, type checks, tests and build as well.
