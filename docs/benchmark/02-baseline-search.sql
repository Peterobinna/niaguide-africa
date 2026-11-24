-- Read-only baseline. Run only after every source passes 01-check-sources.sql.
-- Uses the existing retrieval function once per original question.
-- Does not call the model, reserve_question or store_guidance.
WITH cases(case_id, question, expected_passage) AS (
 VALUES
  ('Q01', 'What does Nosakhare say someone should do before expanding into other areas?', '343cddf5-305f-4702-868d-7db8935022bf'::uuid),
  ('Q02', 'I have many interests, but nobody knows what to come to me for. What should I focus on first?', '343cddf5-305f-4702-868d-7db8935022bf'::uuid),
  ('Q03', 'What is the difference between persistence and stubbornness in business?', '1e9531e0-1f29-6422-158f-a2950233c354'::uuid),
  ('Q04', 'Customers don’t seem interested in my product. How do I know whether to keep going or change my approach?', '1e9531e0-1f29-6422-158f-a2950233c354'::uuid),
  ('Q06', 'Why does Dangote say having the right team is important?', '63499f92-3d86-853e-e7f3-7fa084efcf80'::uuid),
  ('Q07', 'My business depends on me for everything. What lesson from Dangote could help me build a company that delivers results?', '63499f92-3d86-853e-e7f3-7fa084efcf80'::uuid),
  ('Q08', 'What support does Dangote thank the governor for providing?', '052d287d-a930-40e9-8c00-6337713c5678'::uuid),
  ('Q09', 'Apart from funding, what local support can help a large business deal with problems around its site?', '052d287d-a930-40e9-8c00-6337713c5678'::uuid)
)
SELECT c.case_id, e.id AS expert_id,
 COALESCE((SELECT jsonb_agg(r.id ORDER BY r.ordinality) FROM public.retrieve_passages(e.id,c.question) WITH ORDINALITY r),'[]'::jsonb)
 AS baseline_passage_ids
FROM cases c
JOIN public.passages p ON p.id=c.expected_passage
JOIN public.source_documents d ON d.id=p.document_id
JOIN public.experts e ON e.id=d.expert_id
ORDER BY c.case_id;
