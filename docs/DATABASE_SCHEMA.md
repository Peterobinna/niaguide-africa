# Database schema

The foundation migration is transactional and intended for a new Supabase project. Review before manual application; it is not an automatic upgrade for arbitrary existing schemas.

| Table | Relationships and purpose |
|---|---|
| profiles | UUID matches auth.users; display name, operator-controlled role |
| experts | UUID catalogue ID; neutral fields; available/review/coming; synthetic flag |
| source_documents | Expert FK; type, date, URL, private path, rights notes/status, approval/reviewer/date |
| passages | Document FK; content, generated full-text vector, nullable vector(1536), embedding model |
| queries | Owner and expert FKs; question and creation time |
| answers | Unique query FK; owner, output, insufficient flag, model, prompt version, latency |
| citations | Answer and passage FKs; unique numbered marker per answer |
| feedback | Owner and answer FKs; helpful flag; unique per user/answer |
| saved_answers | Owner and answer FKs; unique per user/answer |
| reported_answers | Owner and answer FKs; reason, open/reviewed/resolved status |
| question_limits | Internal per-user rolling-hour attempt counter, atomic reservation |

UUID keys and creation timestamps are universal; mutable records include updated_at triggers. Indexes cover document/expert, passages/document, full-text search, user/time histories and review queues. Citation FKs preserve traceability; referenced passages cannot be casually removed while cited. Approval constraints require valid rights status, reviewer and review time. Collection activation checks that approved passages exist.

## Access model

- Anyone reads neutral expert metadata. No anonymous source access or writes.
- Students read own profiles/queries/answers/citations; approved active source metadata/passages are readable by authenticated users.
- Students save/feedback/report only their own answers. They cannot assign roles, edit sources, or change report status.
- Admins manage experts/documents/passages and read review queues; original storage files are private to admins. Roles are provisioned by SQL operators, not user metadata.
- Queries/answers/citations are inserted by the owner-scoped atomic RPC. See README for the limit on model authenticity of directly callable RPC records.
- Full-text retrieval repeats collection, approval, rights and synthetic exclusions even under RLS.

`question_limits` has no client table grants/policies; its security-definer function derives the user from the verified session. All security-definer functions fix search_path; execute privileges are explicitly restricted. No service-role credential is required by the application.

## Manual policy verification

In a disposable configured project, use two students and an admin. Verify student A cannot select or mutate B's records, cannot update profile.role, cannot upload to expert-sources, cannot read pending passages, and cannot activate collections. Verify the admin can approve rights-cleared sources and change a collection status. Verify retrieval excludes another expert's documents and revoked approvals, and storage remains private. Confirm rollback if any citation references unapproved evidence. These checks require a real Supabase environment and are not claimed executed locally.
