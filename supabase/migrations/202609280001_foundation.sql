-- Review and apply manually to a NEW Supabase project. No destructive changes.
begin;
create extension if not exists vector with schema extensions;
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,display_name text not null default '',role text not null default 'student' check(role in ('student','admin')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.experts(id uuid primary key default gen_random_uuid(),name text not null,field text not null,country text not null,description text not null default '',status text not null default 'coming' check(status in ('available','review','coming')),synthetic boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.source_documents(id uuid primary key default gen_random_uuid(),expert_id uuid not null references public.experts(id),title text not null,type text not null,published_at date,url text check(url is null or url ~ '^https?://'),storage_path text,rights_status text not null default 'pending' check(rights_status in ('pending','licensed','public_domain','permission_granted','original_synthetic','rejected')),rights_notes text,approval_status text not null default 'pending' check(approval_status in ('pending','approved','rejected')),reviewed_by uuid references public.profiles(id),reviewed_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(approval_status <> 'approved' or (rights_status in ('licensed','public_domain','permission_granted','original_synthetic') and reviewed_by is not null and reviewed_at is not null)));
create table public.passages(id uuid primary key default gen_random_uuid(),document_id uuid not null references public.source_documents(id) on delete cascade,content text not null check(length(content) between 25 and 12000),embedding extensions.vector(1536),embedding_model text,search_vector tsvector generated always as(to_tsvector('english',content)) stored,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.queries(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,expert_id uuid not null references public.experts(id),question text not null check(length(question) between 12 and 1200),created_at timestamptz not null default now());
create table public.answers(id uuid primary key default gen_random_uuid(),query_id uuid not null unique references public.queries(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,content text not null,insufficient boolean not null default false,model text not null,prompt_version text not null default 'grounded-v1',latency_ms integer not null check(latency_ms>=0),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.citations(id uuid primary key default gen_random_uuid(),answer_id uuid not null references public.answers(id) on delete cascade,passage_id uuid not null references public.passages(id),marker integer not null check(marker>0),created_at timestamptz not null default now(),unique(answer_id,marker),unique(answer_id,passage_id));
create table public.feedback(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,answer_id uuid not null references public.answers(id) on delete cascade,helpful boolean not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(user_id,answer_id));
create table public.saved_answers(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,answer_id uuid not null references public.answers(id) on delete cascade,created_at timestamptz not null default now(),unique(user_id,answer_id));
create table public.reported_answers(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,answer_id uuid not null references public.answers(id) on delete cascade,reason text not null check(length(reason) between 5 and 1000),status text not null default 'open' check(status in ('open','reviewed','resolved')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.question_limits(user_id uuid primary key references public.profiles(id) on delete cascade,window_started timestamptz not null default now(),attempts integer not null default 0);
create index source_expert_idx on public.source_documents(expert_id,approval_status);
create index passage_document_idx on public.passages(document_id);
create index passage_search_idx on public.passages using gin(search_vector);
create index query_owner_time_idx on public.queries(user_id,created_at desc);
create index query_expert_idx on public.queries(expert_id);
create index answer_owner_idx on public.answers(user_id,created_at desc);
create index citation_passage_idx on public.citations(passage_id);
create index feedback_answer_idx on public.feedback(answer_id);
create index saved_answer_idx on public.saved_answers(answer_id);
create index report_answer_idx on public.reported_answers(answer_id);
create index report_queue_idx on public.reported_answers(status,created_at);
-- Embeddings are nullable; lexical retrieval is the first implementation. Add an
-- HNSW vector_cosine_ops index after selecting and evaluating an embedding model.
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated,anon;
create function public.touch_updated_at() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now();return new;end $$;
do $$ declare t text;begin foreach t in array array['profiles','experts','source_documents','passages','answers','feedback','reported_answers'] loop execute format('create trigger touch_updated before update on public.%I for each row execute function public.touch_updated_at()',t);end loop;end $$;
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,display_name) values(new.id,left(coalesce(new.raw_user_meta_data->>'display_name',''),80));return new;end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.guard_collection_activation() returns trigger language plpgsql set search_path=public as $$ begin if new.status='available' and old.status is distinct from 'available' and not exists(select 1 from public.source_documents d join public.passages p on p.document_id=d.id where d.expert_id=new.id and d.approval_status='approved') then raise exception 'Approved source passages required';end if;return new;end $$;
create trigger guard_activation before update on public.experts for each row execute function public.guard_collection_activation();
do $$ declare t text;begin foreach t in array array['profiles','experts','source_documents','passages','queries','answers','citations','feedback','saved_answers','reported_answers','question_limits'] loop execute format('alter table public.%I enable row level security',t);end loop;end $$;
-- Explicit privilege baseline. RLS is mandatory even when using the publishable key.
revoke all on public.profiles,public.experts,public.source_documents,public.passages,public.queries,public.answers,public.citations,public.feedback,public.saved_answers,public.reported_answers,public.question_limits from anon,authenticated;
grant select on public.experts to anon,authenticated;
grant select on public.profiles,public.source_documents,public.passages,public.queries,public.answers,public.citations,public.feedback,public.saved_answers,public.reported_answers to authenticated;
grant insert,update,delete on public.experts,public.source_documents,public.passages,public.feedback,public.saved_answers,public.reported_answers to authenticated;
-- No client role update privilege; admin roles are assigned by the operator in SQL.
grant update(display_name) on public.profiles to authenticated;
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy profile_edit on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy expert_read on public.experts for select to anon,authenticated using(true);
create policy expert_admin on public.experts for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy document_read on public.source_documents for select to authenticated using(public.is_admin() or (approval_status='approved' and exists(select 1 from public.experts e where e.id=expert_id and e.status='available' and not e.synthetic)));
create policy document_admin on public.source_documents for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy passage_read on public.passages for select to authenticated using(public.is_admin() or exists(select 1 from public.source_documents d join public.experts e on e.id=d.expert_id where d.id=document_id and d.approval_status='approved' and e.status='available' and not e.synthetic));
create policy passage_admin on public.passages for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy query_read on public.queries for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy answer_read on public.answers for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy citation_read on public.citations for select to authenticated using(exists(select 1 from public.answers a where a.id=answer_id and (a.user_id=auth.uid() or public.is_admin())));
create policy feedback_read on public.feedback for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy feedback_own on public.feedback for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.answers a where a.id=answer_id and a.user_id=auth.uid()));
create policy feedback_update on public.feedback for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.answers a where a.id=answer_id and a.user_id=auth.uid()));
create policy saved_own on public.saved_answers for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.answers a where a.id=answer_id and a.user_id=auth.uid()));
create policy report_read on public.reported_answers for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy report_insert on public.reported_answers for insert to authenticated with check(user_id=auth.uid() and status='open' and exists(select 1 from public.answers a where a.id=answer_id and a.user_id=auth.uid()));
create policy report_admin on public.reported_answers for update to authenticated using(public.is_admin()) with check(public.is_admin());
-- Reserve an attempt atomically, including failures, before a paid API request.
create function public.reserve_question() returns boolean language plpgsql security definer set search_path=public as $$ declare n integer;begin if auth.uid() is null then return false;end if;insert into public.question_limits(user_id,attempts) values(auth.uid(),1) on conflict(user_id) do update set attempts=case when question_limits.window_started<now()-interval '1 hour' then 1 else question_limits.attempts+1 end,window_started=case when question_limits.window_started<now()-interval '1 hour' then now() else question_limits.window_started end returning attempts into n;return n<=10;end $$;
-- Rank exact lexical matches; active/approved/rights checks are repeated here.
create function public.retrieve_passages(selected_expert uuid,search_text text) returns table(id uuid,title text,type text,published_at date,url text,content text,synthetic boolean) language sql stable security invoker set search_path=public as $$
 select p.id,d.title,d.type,d.published_at,d.url,p.content,false from public.passages p join public.source_documents d on d.id=p.document_id join public.experts e on e.id=d.expert_id where e.id=selected_expert and e.status='available' and not e.synthetic and d.approval_status='approved' and d.rights_status in ('licensed','public_domain','permission_granted') and p.search_vector @@ plainto_tsquery('english',left(search_text,1200)) and ts_rank_cd(p.search_vector,plainto_tsquery('english',left(search_text,1200)))>=0.05 order by ts_rank_cd(p.search_vector,plainto_tsquery('english',left(search_text,1200))) desc limit 4
$$;
-- One transaction creates a query, answer, and verified citation relationships.
-- Caller can write only their own history. This is NOT an authenticity attestation:
-- authenticated clients can call the RPC for their own records (documented limitation).
create function public.store_guidance(selected_expert uuid,question_text text,answer_text text,used_model text,latency integer,is_insufficient boolean,source_ids uuid[]) returns uuid language plpgsql security definer set search_path=public as $$ declare q uuid;a uuid;passage uuid;n integer:=0;begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 if length(question_text) not between 12 and 1200 or length(answer_text)>20000 or array_length(source_ids,1)>4 or latency<0 then raise exception 'Invalid answer';end if;
 if not is_insufficient and coalesce(array_length(source_ids,1),0)=0 then raise exception 'Citations required';end if;
 foreach passage in array source_ids loop if not exists(select 1 from public.passages p join public.source_documents d on d.id=p.document_id join public.experts e on e.id=d.expert_id where p.id=passage and e.id=selected_expert and e.status='available' and not e.synthetic and d.approval_status='approved' and d.rights_status in ('licensed','public_domain','permission_granted')) then raise exception 'Invalid evidence';end if;end loop;
 insert into public.queries(user_id,expert_id,question) values(auth.uid(),selected_expert,question_text) returning id into q;
 insert into public.answers(query_id,user_id,content,model,latency_ms,insufficient) values(q,auth.uid(),answer_text,left(used_model,100),latency,is_insufficient) returning id into a;
 foreach passage in array source_ids loop n:=n+1;insert into public.citations(answer_id,passage_id,marker) values(a,passage,n);end loop;return a;end $$;
revoke all on function public.reserve_question(),public.retrieve_passages(uuid,text),public.store_guidance(uuid,text,text,text,integer,boolean,uuid[]) from public,anon;
grant execute on function public.reserve_question(),public.retrieve_passages(uuid,text),public.store_guidance(uuid,text,text,text,integer,boolean,uuid[]) to authenticated;
-- Private bucket; only admins can read/write original source files.
insert into storage.buckets(id,name,public) values('expert-sources','expert-sources',false) on conflict(id) do nothing;
create policy source_storage_admin on storage.objects for all to authenticated using(bucket_id='expert-sources' and public.is_admin()) with check(bucket_id='expert-sources' and public.is_admin());
commit;
