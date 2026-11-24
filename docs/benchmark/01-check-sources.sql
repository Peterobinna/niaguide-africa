-- Read-only: verify source links, collection identity and retrieval eligibility.
-- No source text or personal account data is returned.
WITH expected(source_key, expected_expert, passage_id, document_id) AS (
 VALUES
  ('S1', 'Nosakhare Tunde-Oni', '343cddf5-305f-4702-868d-7db8935022bf'::uuid, '8ff751ad-c24f-57ae-aea1-607c94761aca'::uuid),
  ('S2', 'Nosakhare Tunde-Oni', '1e9531e0-1f29-6422-158f-a2950233c354'::uuid, '5218ad0c-6b8b-38e8-fc9f-21acbd0faffa'::uuid),
  ('S3', 'Aliko Dangote', '63499f92-3d86-853e-e7f3-7fa084efcf80'::uuid, 'a2e546aa-fbd0-5e07-2ec2-3688d0360349'::uuid),
  ('S4', 'Aliko Dangote', '052d287d-a930-40e9-8c00-6337713c5678'::uuid, '4f60bc6d-df04-40b9-a963-4cd7f478e51e'::uuid)
)
SELECT x.source_key, x.expected_expert, e.id AS expert_id, e.name AS actual_expert,
 p.id IS NOT NULL AS passage_exists,
 p.document_id = x.document_id AS document_matches,
 e.status AS expert_status, e.synthetic,
 d.approval_status, d.rights_status, d.url,
 length(p.content) AS passage_characters,
 md5(p.content) AS passage_content_fingerprint
FROM expected x
LEFT JOIN public.passages p ON p.id=x.passage_id
LEFT JOIN public.source_documents d ON d.id=p.document_id
LEFT JOIN public.experts e ON e.id=d.expert_id
ORDER BY x.source_key;
