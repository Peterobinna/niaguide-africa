import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Use a temporary PostgreSQL database, never the live Supabase project.
test("short-question migration fixes storage and preserves its guards", async () => {
  const db = new PGlite();
  const user = "00000000-0000-4000-8000-000000000001";
  const expert = "00000000-0000-4000-8000-000000000002";
  const document = "00000000-0000-4000-8000-000000000003";
  const passage = "00000000-0000-4000-8000-000000000004";
  const save = (question, ids = [passage], insufficient = false) => db.query(
    "select public.store_guidance($1,$2,'A test answer.','test-model',10,$3,$4::uuid[]) as id",
    [expert, question, insufficient, ids],
  );
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
      $$;
    `);
    const foundation = await readFile(new URL("../supabase/migrations/202609280001_foundation.sql", import.meta.url), "utf8");
    // Use the real table definitions. Embeddings are not exercised by this test.
    const tables = foundation.split("\n").filter((line) => line.startsWith("create table public."));
    assert.equal(tables.length, 11);
    await db.exec(tables.join("\n").replaceAll("extensions.vector(1536)", "text"));
    const start = foundation.indexOf("create function public.store_guidance(");
    const end = foundation.indexOf("revoke all on function public.reserve_question()", start);
    assert.ok(start > 0 && end > start);
    await db.exec(foundation.slice(start, end));
    await db.query("insert into auth.users values ($1)", [user]);
    await db.query("insert into public.profiles(id) values ($1)", [user]);
    await db.query("insert into public.experts(id,name,field,country,status) values ($1,'Test expert','Career','Test','available')", [expert]);
    await db.query("insert into public.source_documents(id,expert_id,title,type,rights_status,approval_status,reviewed_by,reviewed_at) values ($1,$2,'Test source','article','permission_granted','approved',$3,now())", [document, expert, user]);
    await db.query("insert into public.passages(id,document_id,content) values ($1,$2,'A sufficiently long source passage for this isolated storage test.')", [passage, document]);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
    await save("A longer original question?");
    await assert.rejects(() => save("Hi"), /Invalid answer/);

    await db.exec(await readFile(new URL("../supabase/migrations/202611230001_short_questions.sql", import.meta.url), "utf8"));
    for (const question of ["Hi", "Why?", "How?", "😀😀", "Her career", "x".repeat(11), "x".repeat(12), "x".repeat(1200)]) {
      const result = await save(question);
      const stored = await db.query("select q.question,a.user_id from public.answers a join public.queries q on q.id=a.query_id where a.id=$1", [result.rows[0].id]);
      assert.equal(stored.rows[0].question, question);
      assert.equal(stored.rows[0].user_id, user);
    }
    await save("Why?", [], true);
    for (const question of [null, "", "x", "😀", " ", " x ", "x".repeat(1201)]) {
      await assert.rejects(() => save(question), /Invalid answer/);
    }
    await assert.rejects(() => db.query("insert into public.queries(user_id,expert_id,question) values ($1,$2,'x')", [user, expert]), /queries_question_check/);
    await assert.rejects(() => save("Why?", []), /Citations required/);
    await assert.rejects(() => save("Why?", [user]), /Invalid evidence/);
    await db.query("update public.experts set status='review' where id=$1", [expert]);
    await assert.rejects(() => save("Why?"), /Invalid evidence/);
    await db.query("select set_config('request.jwt.claim.sub','',false)");
    await assert.rejects(() => save("Why?"), /Authentication required/);
    const privileges = await db.query(`select
      has_function_privilege('anon','public.store_guidance(uuid,text,text,text,integer,boolean,uuid[])','EXECUTE') as anon,
      has_function_privilege('authenticated','public.store_guidance(uuid,text,text,text,integer,boolean,uuid[])','EXECUTE') as authenticated`);
    assert.equal(privileges.rows[0].anon, false);
    assert.equal(privileges.rows[0].authenticated, true);
    const old = await db.query("select count(*)::int as count from public.queries where question='A longer original question?'");
    assert.equal(old.rows[0].count, 1);
  } finally {
    await db.close();
  }
});
