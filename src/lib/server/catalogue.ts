import "server-only";
import { cache } from "react";
import { demoMode, experts, expertSlug, type Expert } from "../catalogue";
import { serverDb } from "../supabase/server";
export const getCatalogue = cache(async (): Promise<Expert[]> => {
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
  const profiles: Expert[] = data;
  const counts = new Map<string, number>();
  for (const { name } of profiles) {
    const slug = expertSlug(name);
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return profiles.map((profile) => {
    const slug = expertSlug(profile.name);
    return {
      ...profile,
      profileSlug: slug && counts.get(slug) === 1 ? slug : profile.id,
    };
  });
});
