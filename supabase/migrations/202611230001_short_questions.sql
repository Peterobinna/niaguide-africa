-- Allow short questions and follow-ups, as the app already does.
-- Run after the earlier migrations. Existing questions and answers are kept.
begin;
alter table public.queries drop constraint queries_question_check;
alter table public.queries add constraint queries_question_check
  check (length(btrim(question)) between 2 and 1200);

create or replace function public.store_guidance(selected_expert uuid,question_text text,answer_text text,used_model text,latency integer,is_insufficient boolean,source_ids uuid[]) returns uuid language plpgsql security definer set search_path=public as $$ declare q uuid;a uuid;passage uuid;n integer:=0;begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 if question_text is null or length(btrim(question_text)) not between 2 and 1200 or length(answer_text)>20000 or array_length(source_ids,1)>4 or latency<0 then raise exception 'Invalid answer';end if;
 if not is_insufficient and coalesce(array_length(source_ids,1),0)=0 then raise exception 'Citations required';end if;
 foreach passage in array source_ids loop if not exists(select 1 from public.passages p join public.source_documents d on d.id=p.document_id join public.experts e on e.id=d.expert_id where p.id=passage and e.id=selected_expert and e.status='available' and not e.synthetic and d.approval_status='approved' and d.rights_status in ('licensed','public_domain','permission_granted')) then raise exception 'Invalid evidence';end if;end loop;
 insert into public.queries(user_id,expert_id,question) values(auth.uid(),selected_expert,question_text) returning id into q;
 insert into public.answers(query_id,user_id,content,model,latency_ms,insufficient) values(q,auth.uid(),answer_text,left(used_model,100),latency,is_insufficient) returning id into a;
 foreach passage in array source_ids loop n:=n+1;insert into public.citations(answer_id,passage_id,marker) values(a,passage,n);end loop;return a;end $$;
-- Keep the same permissions as the original function.
revoke all on function public.store_guidance(uuid,text,text,text,integer,boolean,uuid[]) from public,anon;
grant execute on function public.store_guidance(uuid,text,text,text,integer,boolean,uuid[]) to authenticated;
commit;
