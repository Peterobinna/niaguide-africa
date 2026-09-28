import { z } from "zod";
import { serverDb } from "@/lib/supabase/server";
import { readBody, failure } from "@/lib/server/http";
export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await readBody(request);
  } catch {
    return failure("Invalid request.");
  }
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(["available", "review", "coming"]) })
    .safeParse(body);
  if (!parsed.success) return failure("Invalid collection update.");
  const db = await serverDb();
  if (!db) return failure("Database is not configured.", 503);
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return failure("Sign in required.", 401);
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return failure("Admin access required.", 403);
  const { data, error } = await db
    .from("experts")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();
  if (error)
    return failure(
      "The collection could not be updated. Verify that approved, rights-cleared sources and passages exist.",
      409,
    );
  if (!data) return failure("Collection not found.", 404);
  return Response.json({ ok: true });
}
