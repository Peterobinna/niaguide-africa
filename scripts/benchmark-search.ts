// Benchmark adapter: use the real planner and ranker without writing app records.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import {
  checkedPlan,
  collectionQueries,
  plannerInstructionsFor,
  searchPlanSchema,
  retrieveWithPlan,
} from "../src/lib/conversation";
import type { Source } from "../src/lib/catalogue";

const root = resolve("docs/benchmark");
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const literal = (s: string) => "'" + s.replace(/'/g, "''") + "'";
const sourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  published_at: z.string().nullable(),
  url: z.string().nullable(),
  content: z.string().max(1000000),
  synthetic: z.boolean(),
});
const expertSchema = z.object({
  id: z.guid(),
  name: z.string(),
  field: z.string(),
  status: z.literal("available"),
  synthetic: z.literal(false),
});
type Expert = z.infer<typeof expertSchema>;
const caseSchema = z.object({
  id: z.string(),
  kind: z.string(),
  expert: z.string(),
  question: z.string(),
  expected_passage_ids: z.array(z.guid()),
});
const text = readFileSync(join(root, "questions-v1.json"), "utf8");
if (
  hash(text) !==
  readFileSync(join(root, "questions-v1.sha256"), "utf8").split(/\s/)[0]
)
  throw Error("Frozen question hash mismatch");
const cases = z
  .object({ cases: z.array(caseSchema) })
  .parse(JSON.parse(text))
  .cases.filter((c) => c.kind !== "unanswerable");
if (cases.length !== 8) throw Error("Expected eight retrieval cases");
const planRowSchema = z.object({
  id: z.string(),
  question: z.string(),
  expert: expertSchema,
  status: z.enum(["search", "clarification", "planner_error"]),
  queries: z.array(z.string()),
  plan: searchPlanSchema.nullable(),
  planning_ms: z.number(),
  response_model: z.string().optional(),
  usage: z.unknown().optional(),
});
const bundleSchema = z.object({
  benchmark_sha256: z.string(),
  helper_sha256: z.string(),
  rows: z.array(planRowSchema),
});
export function plannerInput(expert: Expert, question: string) {
  // Never send target passages, expected lessons or source titles to the planner.
  return {
    selectedExpert: expert.name,
    collectionField: expert.field,
    question,
    recentConversation: [],
  };
}
export async function rankRecorded(
  original: string,
  queries: string[],
  batches: Map<string, Source[]>,
) {
  return retrieveWithPlan(original, queries, async (q) => {
    const batch = batches.get(q);
    if (!batch) throw Error("Missing retrieval batch; cannot score as a miss");
    return batch;
  });
}
const helperHash = () =>
  hash(
    readFileSync("src/lib/conversation.ts", "utf8") +
      readFileSync("src/lib/question-text.ts", "utf8"),
  );
async function main() {
  const [mode, input, output] = process.argv.slice(3);
  if (!mode || !input || !output)
    throw Error(
      "Usage: plan metadata.json NEW_OUTPUT_DIR | score plans.json sql-results.json",
    );
  if (mode === "plan") {
    if (!process.env.OPENAI_API_KEY)
      throw Error(
        "OPENAI_API_KEY must be configured locally; do not paste it into chat",
      );
    const experts = z
      .array(expertSchema)
      .parse(JSON.parse(readFileSync(input, "utf8")));
    for (const c of cases)
      if (experts.filter((e) => e.name === c.expert).length !== 1)
        throw Error("Missing or ambiguous expert metadata");
    mkdirSync(output); // Refuse to overwrite an earlier run.
    const client = new OpenAI({ timeout: 30000, maxRetries: 0 });
    const rows: z.infer<typeof planRowSchema>[] = [];
    const meta = {
      benchmark_sha256: hash(text),
      helper_sha256: helperHash(),
      code_sha: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
      started_at: new Date().toISOString(),
      requested_model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: plannerInstructionsFor([]),
    };
    for (const c of cases) {
      const expert = experts.find((e) => e.name === c.expert)!;
      const started = Date.now();
      let row: z.infer<typeof planRowSchema> = {
        id: c.id,
        question: c.question,
        expert,
        status: "planner_error",
        queries: [],
        plan: null,
        planning_ms: 0,
      };
      try {
        const response = await client.responses.parse({
          model: meta.requested_model,
          store: false,
          max_output_tokens: 700,
          instructions: meta.instructions,
          input: JSON.stringify(plannerInput(expert, c.question)),
          text: { format: zodTextFormat(searchPlanSchema, "guidance_search") },
        });
        const plan =
          response.status === "completed"
            ? checkedPlan(response.output_parsed)
            : null;
        row = {
          ...row,
          plan,
          response_model: response.model,
          usage: response.usage,
          status: !plan
            ? "planner_error"
            : plan.needsClarification
              ? "clarification"
              : "search",
          queries:
            plan && !plan.needsClarification
              ? collectionQueries(plan.queries, expert.name)
              : [],
        };
      } catch {
        /* Preserve the failed case without printing secrets or raw service errors. */
      }
      row.planning_ms = Date.now() - started;
      rows.push(row);
      writeFileSync(
        join(output, "plans.json"),
        JSON.stringify({ ...meta, rows }, null, 2),
      );
      console.log(c.id + ": " + row.status);
    }
    // Baseline and planned searches execute in one read-only statement/snapshot.
    const tuples = rows.flatMap((r) =>
      [
        ...new Set(
          [r.question, ...(r.status === "search" ? r.queries : [])].map((q) =>
            q.trim(),
          ),
        ),
      ]
        .slice(0, 4)
        .map(
          (q, i) =>
            `(${literal(r.id)},${literal(r.expert.id)}::uuid,${i},${literal(q)})`,
        ),
    );
    const sql = `-- Read-only. Export ALL rows as JSON, preserving the sources arrays.\n-- Contains approved source excerpts: keep the raw export private.\nWITH searches(case_id,expert_id,variant_index,search_text) AS (VALUES ${tuples.join(",\n")}),\ncorpus AS (SELECT md5(coalesce(string_agg(p.id::text||':'||md5(p.content)||':'||p.search_vector::text,'|' ORDER BY p.id),'')) AS fingerprint,count(*) AS passages FROM public.passages p JOIN public.source_documents d ON d.id=p.document_id JOIN public.experts e ON e.id=d.expert_id WHERE e.id IN (SELECT DISTINCT expert_id FROM searches) AND e.status='available' AND NOT e.synthetic AND d.approval_status='approved' AND d.rights_status IN ('licensed','public_domain','permission_granted'))\nSELECT s.*, e.name AS actual_expert,e.field AS collection_field,e.status AS expert_status,e.synthetic,${literal(hash(text))} AS benchmark_sha256,statement_timestamp() AS snapshot_at,current_user AS database_role,corpus.*,md5(pg_get_functiondef('public.retrieve_passages(uuid,text)'::regprocedure)) AS retrieval_function_hash,\nCOALESCE((SELECT jsonb_agg(jsonb_build_object('id',r.id,'title',r.title,'type',r.type,'published_at',r.published_at,'url',r.url,'content',r.content,'synthetic',r.synthetic) ORDER BY r.ordinality) FROM public.retrieve_passages(s.expert_id,s.search_text) WITH ORDINALITY r),'[]'::jsonb) AS sources\nFROM searches s JOIN public.experts e ON e.id=s.expert_id CROSS JOIN corpus ORDER BY s.case_id,s.variant_index;\n`;
    writeFileSync(join(output, "run-searches.sql"), sql);
    console.log(
      "Prepared SQL; no database writes or answer generation performed.",
    );
  } else if (mode === "score") {
    const plans = bundleSchema.parse(JSON.parse(readFileSync(input, "utf8")));
    if (
      plans.benchmark_sha256 !== hash(text) ||
      plans.helper_sha256 !== helperHash()
    )
      throw Error("Question or helper version changed");
    const raw = z
      .array(
        z.object({
          case_id: z.string(),
          expert_id: z.guid(),
          variant_index: z.number().int(),
          search_text: z.string(),
          actual_expert: z.string(),
          collection_field: z.string(),
          expert_status: z.literal("available"),
          synthetic: z.literal(false),
          benchmark_sha256: z.string(),
          snapshot_at: z.string(),
          database_role: z.string(),
          fingerprint: z.string(),
          passages: z.number(),
          retrieval_function_hash: z.string(),
          sources: z.array(sourceSchema).max(4),
        }),
      )
      .parse(JSON.parse(readFileSync(output, "utf8")));
    if (
      plans.rows.length !== 8 ||
      new Set(plans.rows.map((r) => r.id)).size !== 8
    )
      throw Error("Incomplete/duplicate planner cases");
    const snapshotKeys = new Set(
      raw.map((r) =>
        JSON.stringify([
          r.snapshot_at,
          r.database_role,
          r.fingerprint,
          r.passages,
          r.retrieval_function_hash,
        ]),
      ),
    );
    if (snapshotKeys.size !== 1)
      throw Error("Mixed snapshots or database contexts");
    let expectedRows = 0;
    const results: {
      id: string;
      kind: string;
      status: string;
      baseline_ids: string[];
      current_ids: string[];
      baseline_hit: boolean;
      current_hit: boolean;
      planning_ms: number;
    }[] = [];
    for (const c of cases) {
      const p = plans.rows.find((r) => r.id === c.id);
      if (!p || p.question !== c.question || p.expert.name !== c.expert)
        throw Error("Changed case");
      const variants = [
        ...new Set(
          [c.question, ...(p.status === "search" ? p.queries : [])].map((q) =>
            q.trim(),
          ),
        ),
      ].slice(0, 4);
      expectedRows += variants.length;
      const batches = new Map<string, Source[]>();
      for (const [i, q] of variants.entries()) {
        const matches = raw.filter(
          (r) => r.case_id === c.id && r.variant_index === i,
        );
        if (matches.length !== 1) throw Error("Missing or duplicate SQL row");
        const r = matches[0];
        if (
          r.search_text !== q ||
          r.expert_id !== p.expert.id ||
          r.actual_expert !== p.expert.name ||
          r.collection_field !== p.expert.field ||
          r.benchmark_sha256 !== hash(text)
        )
          throw Error("SQL metadata differs from planner input");
        if (
          new Set(r.sources.map((s) => s.id)).size !== r.sources.length ||
          r.sources.some((s) => s.synthetic)
        )
          throw Error("Invalid source batch");
        batches.set(
          q,
          r.sources.map((s) => ({ ...s, published_at: s.published_at ?? "" })),
        );
      }
      const baseline = batches.get(c.question.trim())!;
      const current =
        p.status === "search"
          ? await rankRecorded(c.question, p.queries, batches)
          : [];
      results.push({
        id: c.id,
        kind: c.kind,
        status: p.status,
        baseline_ids: baseline.map((s) => s.id),
        current_ids: current.map((s) => s.id),
        baseline_hit: baseline.some((s) =>
          c.expected_passage_ids.includes(s.id),
        ),
        current_hit: current.some((s) => c.expected_passage_ids.includes(s.id)),
        planning_ms: p.planning_ms,
      });
    }
    if (raw.length !== expectedRows) throw Error("Unexpected SQL rows");
    const summary = {
      benchmark_sha256: hash(text),
      sql_export_sha256: hash(readFileSync(output, "utf8")),
      snapshot: JSON.parse([...snapshotKeys][0]),
      denominator: 8,
      baseline_hits: results.filter((r) => r.baseline_hit).length,
      current_hits: results.filter((r) => r.current_hit).length,
      clarifications: results.filter((r) => r.status === "clarification")
        .length,
      planner_errors: results.filter((r) => r.status === "planner_error")
        .length,
      groups: ["direct", "paraphrase"].map((kind) => ({
        kind,
        denominator: 4,
        baseline_hits: results.filter((r) => r.kind === kind && r.baseline_hit)
          .length,
        current_hits: results.filter((r) => r.kind === kind && r.current_hit)
          .length,
      })),
      results,
      limitations:
        "Expected-passage hit rate, not answer accuracy. Planner failures and clarifications remain in denominator and are reported separately. SQL Editor context, not authenticated RLS test. No retrieval/network timing measurement. No answer generation or safety scoring.",
    };
    writeFileSync(
      resolve(input, "..", "scores.json"),
      JSON.stringify(summary, null, 2),
      { flag: "wx" },
    );
    console.log(JSON.stringify(summary, null, 2));
  } else throw Error("Unknown mode");
}
if (process.argv[2]?.endsWith("benchmark-search.ts"))
  void main().catch((e) => {
    console.error(
      e instanceof z.ZodError
        ? "Invalid benchmark input format"
        : e instanceof Error
          ? e.message
          : "Benchmark failed",
    );
    process.exitCode = 1;
  });
