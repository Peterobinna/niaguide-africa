import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { Disclosure } from "@/components/ui";
import { demoSources, statusLabel } from "@/lib/catalogue";
import { getCatalogue } from "@/lib/server/catalogue";
import { serverDb } from "@/lib/supabase/server";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title:
      (await getCatalogue()).find((e) => e.id === id)?.name ??
      "Expert collection",
  };
}
export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = (await getCatalogue()).find((e) => e.id === id);
  if (!e) notFound();
  const db = e.synthetic ? null : await serverDb();
  const { data: documents } = db
    ? await db
        .from("source_documents")
        .select("id,title,type,published_at,url")
        .eq("expert_id", e.id)
        .eq("approval_status", "approved")
    : { data: null };
  return (
    <div className="container page-shell">
      <Link className="text-link" href="/experts">
        ← All expert collections
      </Link>
      <div className="profile-head" style={{ marginTop: 30 }}>
        <div className="avatar">
          {e.name
            .split(" ")
            .map((x) => x[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <span className={`badge ${e.status}`}>{statusLabel[e.status]}</span>
          <h1>{e.name}</h1>
          <p>
            {e.field} · {e.country}
          </p>
        </div>
      </div>
      <div className="two-col">
        <div>
          <section className="panel">
            <h2>About this collection</h2>
            <p>{e.description}</p>
            {e.synthetic && (
              <div className="notice">
                Synthetic demonstration profile. These notes are original
                project content, not real quotations or published expert
                materials.
              </div>
            )}
            <Disclosure />
          </section>
          <section className="panel">
            <h2>
              <BookOpen
                size={21}
                style={{ display: "inline", marginRight: 10 }}
              />
              Source preview
            </h2>
            {e.synthetic ? (
              demoSources.map((s) => (
                <details className="source-details" key={s.id}>
                  <summary>{s.title}</summary>
                  <p className="muted">
                    {s.type} · {s.published_at}
                  </p>
                  <blockquote>{s.content}</blockquote>
                  <Link href={`/sources#${s.id}`}>
                    Open original synthetic note →
                  </Link>
                </details>
              ))
            ) : documents?.length ? (
              documents.map((s) => (
                <div className="source-details" key={s.id}>
                  <h3>{s.title}</h3>
                  <p>
                    {s.type} · {s.published_at || "Date not recorded"}
                  </p>
                  {s.url && /^https?:\/\//.test(s.url) && (
                    <a href={s.url} target="_blank" rel="noreferrer">
                      Open published source ↗
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p>
                {e.status === "available"
                  ? "Sign in to inspect the approved source library."
                  : "No source documents are available for this catalogue profile. Guidance is unavailable until review is complete."}
              </p>
            )}
          </section>
        </div>
        <aside className="panel soft-panel">
          <span className="eyebrow">EXPLORE WITH INTENTION</span>
          <h2 style={{ marginTop: 15 }}>Bring your own question.</h2>
          <p>
            {e.status === "available"
              ? "Explore career experiments, feedback, student leadership, or testing an idea."
              : "This proposed collection is not yet available for guidance."}
          </p>
          <p>
            <strong>
              {e.synthetic
                ? "4 synthetic notes · 4 passages"
                : e.status === "available"
                  ? `${documents?.length ?? 0} sources visible · sign in for access`
                  : "0 approved sources"}
            </strong>
          </p>
          {e.status === "available" ? (
            <Link className="button" href={`/ask?expert=${e.id}`}>
              Ask a Question <ArrowRight size={16} />
            </Link>
          ) : (
            <Link className="button secondary" href="/ask">
              Try the fictional demo
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
