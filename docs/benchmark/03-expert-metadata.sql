-- Read-only: exact collection context used by the production planner.
SELECT id,name,field,status,synthetic FROM public.experts
WHERE id IN ('ec828ef1-7442-476a-a9ef-1dc21ab118c9'::uuid,'00000000-0000-4000-8000-000000000001'::uuid)
ORDER BY name;
