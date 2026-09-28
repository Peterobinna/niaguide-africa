# Initial software product specification

NiaGuide Africa — Guidance rooted in African wisdom.

## Users and problem

Young Africans aged 18–25 need accessible, inspectable guidance from published ideas. The first research population is Nigerian university students aged 18–25, inside and outside Nigeria. Published knowledge is fragmented; an answer without evidence is hard to evaluate.

## Acceptance journeys

1. A visitor discovers collections by search, field, country and status, then sees an honest expert profile.
2. A visitor selects fictional Amara, submits a focused question and opens the matching synthetic passage behind a numbered citation.
3. An unrelated question or unavailable expert returns exactly: “I could not find enough reliable information in this expert’s approved sources to answer that question. Try asking in a different way or choose another expert.”
4. A student revisits questions, saves an answer, gives feedback, reports a problem and clears local demo data. Live mode uses account-scoped Supabase persistence.
5. An admin inspects experts, sources and review queues. Ordinary users have no source-upload capability.

## Delivery scope

Professional responsive UI, public and student navigation, admin foundation, sign-in/registration, retrieval-first server API, schema/RLS, deployment and design documentation. The 20 real expert entries use only neutral name/field/country information supplied in the brief. Amara is an invented demonstration profile with original synthetic notes. Live sources require manual review and configuration.

Excluded: direct expert contact, video/audio mentorship, feeds, payments, custom model training, voice cloning, avatars, career prediction, diagnosis, medical/legal/financial advice, mobile apps, translation and complex recommendation algorithms.

## Quality and safety

Mobile-first, semantic layouts, readable contrast, keyboard focus, explicit loading/empty/error states. No false expert endorsement. API keys server-only. Evidence before generation; abstain when insufficient. Citations are inspectable but not a guarantee of correctness. No ordinary source uploads. Research consent, evaluation and data retention must be completed before a student study.
