-- Ranked lexical candidates; preserves expert, rights, approval and RLS restrictions.
-- Answer generation still independently checks evidence sufficiency.
begin;
create or replace function public.retrieve_passages(selected_expert uuid,search_text text) returns table(id uuid,title text,type text,published_at date,url text,content text,synthetic boolean) language sql stable security invoker set search_path=public as $fn$
with terms as (select tsvector_to_array(to_tsvector('english',left(search_text,1200))) as words),
q as (select words,to_tsquery('english',array_to_string(array(select quote_literal(w) from unnest(words) w),' | ')) as any_term from terms where cardinality(words)>0),
candidates as (
select p.id,d.title,d.type,d.published_at,d.url,p.content,
(select count(*) from unnest(q.words) w where p.search_vector @@ to_tsquery('english',quote_literal(w))) as matched,
cardinality(q.words) as total,ts_rank_cd(p.search_vector,q.any_term) as rank
from public.passages p join public.source_documents d on d.id=p.document_id join public.experts e on e.id=d.expert_id cross join q
where e.id=selected_expert and e.status='available' and not e.synthetic and d.approval_status='approved' and d.rights_status in ('licensed','public_domain','permission_granted') and p.search_vector @@ q.any_term)
select c.id,c.title,c.type,c.published_at,c.url,c.content,false from candidates c
where c.matched>=least(2,c.total) and c.matched::numeric/c.total>=0.5
order by c.matched::numeric/c.total desc,c.rank desc,c.id limit 4
$fn$;
commit;
