# Scope alignment - 31 October 2026

Baseline: the complete research proposal supplied in Downloads (FR1-FR10), archived project brief and current specification. The two complete proposal copies contain the same relevant requirements. Supervisor sign-off/version precedence was not independently revalidated; confirm this is the approved baseline. Research recruitment and evaluation are separate from software implementation.

| Planned feature | Intended purpose | Current status | Evidence / qualification |
|---|---|---|---|
| FR1: approximately 20 approved collections | Discover expert guidance | Partial | Live SQL snapshot: 24 real profiles, 16 available, 211 approved documents, 3,880 passages. Eight profiles unavailable. Inactive profiles remain visible with labels, unlike the proposal's approved-only directory wording. |
| FR2: question input | Accept valid questions and reject invalid input | Implemented | ask-form.tsx; retrieval.ts; HTTP checks reject empty/overlong/malformed input. |
| FR3: collection-scoped retrieval | Keep evidence within the selected expert | Implemented; validation incomplete | Ranked retrieval SQL filters expert, status, rights and approval. Unit isolation checks pass. Full two-account remote isolation remains untested. |
| FR4: cited AI generation | Provide traceable guidance | Partial / working happy path | Fresh Joyce response displayed practical steps, four passages and disclosure in 8,758 ms. Adesina generation verified but storage failed with 22P05. Human semantic evaluation pending. |
| FR5: source preview / link | Inspect supporting evidence | Implemented | Fresh Joyce source expansion displayed original passage and published link. |
| FR6: insufficient evidence | Avoid unsupported answers | Implemented; locally tested | Regression tests cover genuine insufficiency. No fresh live unanswerable-question benchmark yet. |
| FR7: feedback and reporting | Collect user concerns | Implemented in code; partial validation | answer-card.tsx; api/activity. Current save journey checked separately. Full feedback/report persistence and resolution not freshly tested. |
| FR8: administrator management | Control profiles and documents | Partial | Role-protected overview/status API exists. Documents/passages use operator SQL; complete upload/edit/review UI and audit workflow absent. |
| FR9: embedding rebuild | Semantic search after source updates | Not implemented / changed approach | Nullable embedding columns exist; current search is ranked full-text plus query reformulation. No embedding API or rebuild control. Requires supervisor acceptance of scope change. |
| FR10: coded evaluation logs | Analyse research outcomes privately | Partial | Account-owned queries, answers, citations, model and latency fields exist. No complete participant-code research export or completed study evidence. |
| Responsive website | Support smaller screens | Partial validation | Responsive CSS exists; desktop checked today. Historical 390x844 tests are dated September 28. Current viewport override failed, so no fresh mobile pass claimed. |
| Public application deployment | Assessor can visit an online URL | Not verified | Vercel planned; Supabase backend live. No verified public application URL supplied. |
| Voice input / audio output | Support preferred input/output formats | Not implemented | Later requested enhancement; absent from current interface. Voice cloning excluded. |

## Scope changes and limitations

- Lexical search delivers inspectable passage search without an embedding pipeline, but can miss paraphrases. Reformulation helps without guaranteeing coverage. This is a deviation from the vector-search proposal.
- Collections expanded beyond the initial demonstration; 16 of 24 are available, not 20 completed collections. Profiles do not imply endorsement.
- Manual ingestion records rights, review and document linkage; it does not complete the administrator ingestion UI.
- Continuous chat and one clarification maximum were added after usability complaints. Only the last two exchanges reach the planner/model as untrusted context, not evidence.
- Reuse scope was confirmed by the owner during imports; permission documents and full audio quality were not independently audited.
- Proposal research target: up to 200 valid survey responses and 20 comparison participants. Earlier ethics text used 5-8 testers. Reconcile the approved sample before reporting research outcomes. No study was conducted in this preparation task.
