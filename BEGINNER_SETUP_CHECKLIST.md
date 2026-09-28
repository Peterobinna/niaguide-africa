# NiaGuide Africa — Beginner Setup Checklist

Complete these checkpoints in order. Do not place secret keys in chat, screenshots, GitHub, or shared documents.

## Checkpoint 1 — Create the GitHub repository

- Repository name: `niaguide-africa`
- Description: `A source-grounded AI guidance platform built from approved African expert knowledge.`
- Visibility: Private during development
- Initialise with: README
- `.gitignore` template: Node
- Licence: None for now

Save the repository URL.

## Checkpoint 2 — Prepare the computer

Install or confirm:

- Git
- Node.js current LTS release
- Visual Studio Code
- A modern browser

Confirm these commands work:

```bash
git --version
node --version
npm --version
```

Clone the repository. Codex can then create the Next.js project inside it.

## Checkpoint 3 — Create the Supabase project

Create one Supabase project called `niaguide-africa` in a nearby region. Save these values privately:

- Project URL
- Public anon/publishable key
- Server service-role/secret key
- Database password

Do not send the secret values in chat. They will later go into local and Vercel environment variables.

The `vector` extension will be enabled when the database migration is ready.

## Checkpoint 4 — Create the OpenAI API project

Create an OpenAI Platform project named `NiaGuide Africa`. Add a small initial credit amount that you are comfortable losing during testing. Start with approximately USD 5–10 and set a low usage budget or alert.

Create a project API key. Copy it once and store it privately. Do not paste it into chat or GitHub.

Planned models:

- Answer generation: `gpt-6-luna`
- Embeddings: `text-embedding-3-small`

## Checkpoint 5 — Create the Vercel account

Sign in to Vercel using the same GitHub account. Do not deploy yet. The repository will be imported after Codex creates a working build.

## Checkpoint 6 — Obtain pilot expert permission and content

Contact the recommended first expert or authorised representative. Request written permission and the materials listed in `PROJECT_BRIEF.md`.

Until permission is confirmed, Codex should use clearly labelled sample data and should not publish the expert's real photograph or private content.

## Checkpoint 7 — Give the repository to Codex

Place these files in the repository root:

- `PROJECT_BRIEF.md`
- `DESIGN_AND_CONTENT.md`
- `AGENTS.md`

Give Codex access to the GitHub repository or open the cloned repository in the Codex workspace. Use the prompt in `CODEX_HANDOFF_PROMPT.md`.

Do not give Codex secrets through the prompt. Add them only through the local `.env.local` file or the deployment dashboard when Codex tells you the required variable names.

## Checkpoint 8 — Review the wireframes and first milestone

Codex should first show:

- Planned file structure
- Five simple wireframes
- Database entity plan
- Milestone plan

Approve the direction, then let Codex implement the first working vertical slice.

## Checkpoint 9 — Test and deploy

Before deployment:

- Confirm supported answers show correct sources.
- Confirm unsupported questions produce the limitation message.
- Confirm the AI disclosure is visible.
- Confirm mobile navigation works.
- Confirm no secrets appear in the repository.
- Run lint, type checking, tests, and production build.

Import the GitHub repository into Vercel, add environment variables privately, deploy, and test the public URL.

## Checkpoint 10 — Prepare the assignment submission

Prepare:

- GitHub repository link
- Deployed website link
- README with setup, designs, screenshots, and deployment plan
- Repository ZIP without secrets or dependency folders
- 5–10 minute application demonstration video

