# Instructions for Codex

## Project goal

Build the initial working version of **NiaGuide Africa**, a source-grounded AI guidance platform for Nigerian university students aged 18–25.

Read `PROJECT_BRIEF.md` and `DESIGN_AND_CONTENT.md` before changing code. Treat those documents as the product requirements.

## Working method

1. Inspect the repository before making changes.
2. Create and maintain a short implementation plan.
3. Work in small, testable milestones.
4. After each milestone, run relevant formatting, linting, type checking, tests, and builds.
5. Preserve user work and avoid destructive Git commands.
6. Explain important decisions in simple language.
7. Keep the README accurate as the project changes.

## Required stack

- Next.js with TypeScript and the App Router
- Tailwind CSS
- Supabase Postgres, Auth, Storage, and pgvector
- OpenAI Responses API using `gpt-6-luna`
- OpenAI embeddings using `text-embedding-3-small`
- Vercel deployment

Do not replace the stack unless a blocking technical reason is documented.

## Security rules

- Never commit API keys, service-role keys, database passwords, or private source files.
- Keep real secrets in `.env.local` and deployment environment variables.
- Commit only a safe `.env.example` containing variable names and descriptions.
- Run OpenAI and privileged Supabase operations only on the server.
- Validate all request bodies.
- Protect administrator routes and mutations.
- Use Supabase Row Level Security where appropriate.
- Avoid logging full private source text or sensitive user information.

## AI and source-grounding rules

- The assistant must never claim to be the selected expert.
- Do not imitate an expert's personality or generate first-person answers on their behalf.
- Retrieve approved passages before generation.
- Send the model only the question, necessary instructions, and retrieved passages.
- Require citation markers that map to stored passage records.
- If the evidence threshold is not met, return the exact insufficient-evidence message from `PROJECT_BRIEF.md` without calling normal answer generation.
- Show the required AI disclosure with every answer.
- Ordinary users must not upload arbitrary documents.
- Keep source-rights status and collection enable/disable controls in the data model.

## Initial demonstration priority

Build one complete vertical slice before adding optional features:

1. Student opens expert directory.
2. Student opens the active expert profile.
3. Student asks a question.
4. Server embeds the question and retrieves passages from that expert's enabled collection.
5. Server checks the evidence threshold.
6. Server returns either a cited answer or the limitation message.
7. The application stores the query, answer status, citations, latency, and feedback.
8. Student can inspect the sources.

Three expert cards may be visible, but only one collection must work for the initial demonstration. Label inactive profiles **Coming soon**.

## Data model minimum

Create migrations for at least:

- `profiles`
- `experts`
- `source_documents`
- `passages`
- `queries`
- `answers`
- `answer_citations`
- `feedback`

Include timestamps, enabled/status fields, source-rights metadata, model and prompt versions, and latency where relevant.

## Testing minimum

Add tests for:

- Request validation
- Expert/collection filtering
- Evidence-threshold behaviour
- Citation-to-passage mapping
- Insufficient-evidence response

The project must pass linting, type checking, tests, and a production build before handoff.

## Accessibility and interface quality

- Design mobile first.
- Use semantic HTML, keyboard-accessible controls, visible focus states, labelled form fields, and meaningful error messages.
- Keep source citations and disclosure text readable.
- Use loading, empty, error, success, and insufficient-evidence states.

## Documentation and assignment deliverables

The README must include:

- Product description
- Project scope and exclusions
- Technology stack
- Architecture summary
- Local setup steps
- Environment variable list
- Database and ingestion setup
- Test and build commands
- Screenshots or design images
- Deployment URL and plan
- GitHub repository link
- AI disclosure and ethical safeguards
- Known limitations and next steps

Also prepare:

- A concise demonstration checklist
- A 5–10 minute video demonstration script focused on the working application
- A submission ZIP that excludes `node_modules`, `.next`, `.env.local`, private files, and secrets

## Stop conditions

Ask the project owner before:

- Publishing the site publicly
- Uploading a real expert's documents
- Using an expert's photograph or logo
- Changing the approved project scope
- Adding paid services beyond the agreed small API budget
