import { redirect } from "next/navigation";
import { Admin } from "@/components/admin";
import { PageHeading } from "@/components/ui";
import {
  demoMode,
  demoSources,
  experts,
  demoId,
  type Expert,
} from "@/lib/catalogue";
import { serverDb } from "@/lib/supabase/server";
export const metadata = { title: "Collection administration" };
export default async function AdminPage() {
  if (demoMode)
    return (
      <div className="container page-shell">
        <PageHeading
          eyebrow="COLLECTION ADMINISTRATION · PREVIEW"
          title="A trustworthy collection starts here."
          description="Review sources, manage collection readiness, and keep evidence at the centre."
        />
        <Admin
          demo
          initialExperts={experts}
          documents={demoSources.map((s) => ({
            ...s,
            expert_id: demoId,
            approval_status: "Synthetic demo only",
            rights_status: "Original project content",
          }))}
          counts={[21, 4, 4, 0, 0]}
          reports={[]}
          feedback={[]}
        />
      </div>
    );
  const db = await serverDb();
  if (!db) redirect("/sign-in");
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/sign-in");
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");
  const responses = await Promise.all([
    db.from("experts").select("*"),
    db.from("source_documents").select("*"),
    db.from("passages").select("*", { head: true, count: "exact" }),
    db.from("queries").select("*", { head: true, count: "exact" }),
    db.from("reported_answers").select("id,reason,status"),
    db.from("feedback").select("id,helpful"),
  ]);
  if (responses.some((r) => r.error))
    throw new Error("Could not load administration data.");
  const [e, d, p, q, r, f] = responses;
  return (
    <div className="container page-shell">
      <PageHeading
        eyebrow="COLLECTION ADMINISTRATION"
        title="Collection overview"
        description="Review approved sources and monitor feedback."
      />
      <Admin
        demo={false}
        initialExperts={e.data as Expert[]}
        documents={d.data ?? []}
        counts={[
          e.data?.length ?? 0,
          d.data?.length ?? 0,
          p.count ?? 0,
          q.count ?? 0,
          r.data?.length ?? 0,
        ]}
        reports={r.data ?? []}
        feedback={f.data ?? []}
      />
    </div>
  );
}
