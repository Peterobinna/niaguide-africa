import "server-only";
import { demoMode, experts, type Expert } from "../catalogue";
import { serverDb } from "../supabase/server";
export async function getCatalogue(): Promise<Expert[]> {
  if (demoMode) return experts;
  const db = await serverDb();
  if (!db) return experts.filter((e) => !e.synthetic);
  const { data, error } = await db
    .from("experts")
    .select("id,name,field,country,status,synthetic,description")
    .order("name");
  if (error)
    throw new Error(
      "The expert catalogue is temporarily unavailable. Please try again.",
    );
  return data as Expert[];
}
