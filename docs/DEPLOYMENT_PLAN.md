# Deployment plan

## Local demonstration

Use Node.js 22+, npm ci, npm run setup:demo (creates an ignored demo-only `.env.local`), and npm run dev. Demo uses no paid API or database. Run all validation commands before recording the video.

## Staging

1. Push the review branch to a repository after inspecting files for secrets. Open a pull request; do not merge directly into the default branch.
2. Import this app directory into Vercel with Next.js preset, npm package manager, `npm run build`. Alternatively use a supported Node host with `npm start` and PORT provided by the host.
3. Create a separate Supabase staging project; manually review/apply both migrations. Do not apply against an unreviewed existing database.
4. Configure Supabase Auth site URL, callback allowlist, email confirmation, password policy, SMTP and session settings. Register and explicitly promote an admin.
5. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, OPENAI_API_KEY, optional OPENAI_MODEL and NEXT_PUBLIC_DEMO_MODE=false in host settings. Public-prefixed values are compiled into client code; rebuild on change. Never paste secrets into README, issues, build logs, source code or screenshots.
6. Review and ingest legitimate documents with rights metadata. Approve documents and only then activate the collection. No approved sources means insufficient evidence, not invented answers.
7. Run account isolation, retrieval, persistence, email confirmation and admin policy checks. Set OpenAI project usage budgets; test failure and throttling behaviour.

## Research release gate

Obtain project/supervisor approval and participant consent, define retention/deletion/contact information, review sources/rights, evaluate unsupported claims and abstention on a benchmark, test mobile accessibility, and verify production backups. Add stronger output provenance if stored answers will be treated as auditable model outputs. A live release is not complete solely because a build passes.

## Operations and rollback

Use provider-managed TLS, private Supabase bucket and database backups. Monitor aggregate errors and latency without question contents. Roll back the application to the last passing deployment. If evidence quality fails, set the affected expert status to review to stop retrieval. Do not drop tables to roll back; preserve user data and prepare reviewed forward migrations. Keep staging/live data separate. No remote deployment was performed in this task.
