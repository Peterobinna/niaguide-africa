# Short questions and follow ups

Prepared 23 November 2026. Local implementation and migration tests are complete; this document does not assert that the migration has been applied to the live database.

## What changed

The chat already allowed short replies, but the supplied database required at least 12 characters. A valid question could therefore reach the save step and fail. The form, API and planner now share the question-text validator, which accepts 2–1,200 characters, replaces control characters with spaces and trims surrounding whitespace. The planner's rewritten question must pass this validator before it is used. A clarification still has an empty standalone question because it is not saved as a guidance answer.

The new migration changes the query-table constraint and the `store_guidance` function to accept short questions. It keeps existing records, authentication, source approval/rights checks, citation limits and execution permissions. Old migrations remain unchanged; a fresh database must apply all migration files in filename order.

## Local verification

- `npm test`: 21 passing application tests, including short questions, short follow-ups, whitespace/control-character handling, length boundaries and planner validation.
- `npm run test:db`: a temporary PGlite PostgreSQL database reproduces the old failure, applies the actual migration, and checks stored short questions and preservation of an existing record.
- The database test checks invalid lengths, direct table constraint enforcement, required citations, invalid/disabled evidence, missing authentication and function execution grants.
- The fixture uses the original table/function definitions with a local auth stub. Its unused embedding column is text because vector retrieval is not exercised. It is not a full Supabase integration or RLS test.

## Apply to an existing database

1. Confirm the intended project and compare its existing query constraint and `store_guidance` definition with the migration baseline. If they differ because of later changes, reconcile those differences before replacing the function.
2. Check for existing rows incompatible with the new trimmed-length rule without displaying their contents:

```sql
select count(*) as incompatible_questions
from public.queries
where length(btrim(question)) not between 2 and 1200;
```

3. If the count is nonzero, investigate privately before applying. The migration is transactional and will roll back if validation fails; it does not delete records.
4. Apply only `supabase/migrations/202611230001_short_questions.sql` to an existing database that already has the previous migrations. Do not rerun the foundation/catalogue migrations. The expected old constraint is `queries_question_check`.
5. Record the project, execution date and migration result. Then deploy the application update.
6. Using a test account, ask a normal question and follow with “Why?” and “How?”. Verify that accepted answers/refusals can be saved and reloaded, and that empty/one-character/overlong questions are rejected. A source-based refusal can be correct; short input does not guarantee enough evidence for an answer.

The historical 22P05 failure remains a separate investigation. This length fix is not proof of its cause or resolution. Retain the new database limit if reverting the application: older app versions can still use the less restrictive minimum. Restoring the 12-character constraint would require reviewing newly stored short questions first.
