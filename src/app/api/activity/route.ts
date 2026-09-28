import { z } from "zod";
import { serverDb } from "@/lib/supabase/server";
import { readBody, failure } from "@/lib/server/http";
const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("save"),
    answerId: z.uuid(),
    saved: z.boolean(),
  }),
  z.object({
    action: z.literal("feedback"),
    answerId: z.uuid(),
    helpful: z.boolean(),
  }),
  z.object({
    action: z.literal("report"),
    answerId: z.uuid(),
    reason: z.string().trim().min(5).max(1000),
  }),
]);
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await readBody(request);
  } catch {
    return failure("Invalid request.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return failure("Check your feedback and try again.");
  const db = await serverDb();
  if (!db) return failure("The database is not configured.", 503);
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return failure("Please sign in.", 401);
  const v = parsed.data;
  const { data: answer } = await db
    .from("answers")
    .select("id")
    .eq("id", v.answerId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!answer) return failure("Answer not found.", 404);
  const row = { answer_id: v.answerId, user_id: user.id };
  const response =
    v.action === "save"
      ? v.saved
        ? await db
            .from("saved_answers")
            .upsert(row, { onConflict: "user_id,answer_id" })
        : await db
            .from("saved_answers")
            .delete()
            .eq("user_id", user.id)
            .eq("answer_id", v.answerId)
      : v.action === "feedback"
        ? await db
            .from("feedback")
            .upsert(
              { ...row, helpful: v.helpful },
              { onConflict: "user_id,answer_id" },
            )
        : await db
            .from("reported_answers")
            .insert({ ...row, reason: v.reason });
  if (response.error)
    return failure("Could not save your change. Please retry.", 503);
  return Response.json({ ok: true });
}
export async function GET() {
  const db = await serverDb();
  if (!db) return failure("The database is not configured.", 503);
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return failure("Please sign in to view your history.", 401);
  const { data, error } = await db
    .from("answers")
    .select(
      "id,content,model,latency_ms,insufficient,created_at,queries(question,expert_id),citations(marker,passages(id,content,source_documents(title,type,published_at,url))),saved_answers(answer_id)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return failure("Your history could not be loaded.", 503);
  return Response.json({ rows: data });
}
