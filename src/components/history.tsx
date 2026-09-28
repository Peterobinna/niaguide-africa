"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { demoMode, experts } from "@/lib/catalogue";
import { readLocal, type LocalAnswer } from "@/lib/local-history";
import { Empty, ExpertCard } from "./ui";
import { AnswerCard } from "./answer-card";
type DbRow = {
  id: string;
  content: string;
  model: string;
  latency_ms: number;
  insufficient: boolean;
  created_at: string;
  queries: { question: string; expert_id: string };
  citations: {
    marker: number;
    passages: {
      id: string;
      content: string;
      source_documents: {
        title: string;
        type: string;
        published_at: string;
        url: string | null;
      };
    } | null;
  }[];
  saved_answers: { answer_id: string }[];
};
export function History({
  kind,
}: {
  kind: "dashboard" | "questions" | "saved";
}) {
  const [rows, setRows] = useState<LocalAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (demoMode) {
          if (active) setRows(readLocal());
          return;
        }
        const r = await fetch("/api/activity");
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        if (active)
          setRows(
            (data.rows as DbRow[]).map((row) => ({
              id: row.id,
              question: row.queries.question,
              expertId: row.queries.expert_id,
              answer: row.content,
              model: row.model,
              latencyMs: row.latency_ms,
              insufficient: row.insufficient,
              createdAt: row.created_at,
              synthetic: false,
              saved: row.saved_answers.length > 0,
              sources: row.citations
                .sort((a, b) => a.marker - b.marker)
                .map((c) => ({
                  id: c.passages?.id ?? `unavailable-${c.marker}`,
                  content:
                    c.passages?.content ??
                    "This source is no longer available for inspection. Do not rely on this answer until its evidence has been reviewed.",
                  title:
                    c.passages?.source_documents.title ??
                    "Source withdrawn or unavailable",
                  type: c.passages?.source_documents.type ?? "Unavailable",
                  published_at: c.passages?.source_documents.published_at ?? "",
                  url: c.passages?.source_documents.url ?? null,
                  synthetic: false,
                })),
            })),
          );
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "Could not load history.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);
  const visible =
    kind === "saved"
      ? rows.filter((r) => r.saved)
      : kind === "dashboard"
        ? rows.slice(0, 3)
        : rows;
  return (
    <>
      {demoMode && (
        <div className="notice">
          Demo workspace: questions, saves, and feedback stay in this browser.
          No account is created. Clear them from Profile.
        </div>
      )}
      {loading ? (
        <p role="status">Loading your workspace…</p>
      ) : error ? (
        <div className="error" role="alert">
          {error}{" "}
          <Link className="inline-link" href="/sign-in">
            Sign in
          </Link>
        </div>
      ) : (
        <>
          {kind === "dashboard" && (
            <>
              <div
                className="stats"
                style={{ gridTemplateColumns: "repeat(3,1fr)" }}
              >
                {[
                  [rows.length, "Questions explored"],
                  [rows.filter((r) => r.saved).length, "Saved answers"],
                  [demoMode ? 1 : 0, "Demo collections"],
                ].map(([n, t]) => (
                  <div className="stat" key={String(t)}>
                    <strong>{n}</strong>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
              <h2>Recent questions</h2>
            </>
          )}
          {visible.length ? (
            visible.map((row) => (
              <div key={row.id}>
                <div className="history-item">
                  <span className="muted">
                    {new Date(row.createdAt).toLocaleDateString("en-GB")} ·{" "}
                    {row.synthetic
                      ? "Fictional demonstration"
                      : "Your collection"}
                  </span>
                  <h3 style={{ marginTop: 10 }}>{row.question}</h3>
                  <details>
                    <summary
                      className="text-link"
                      style={{ cursor: "pointer" }}
                    >
                      Read guidance & sources
                    </summary>
                    <AnswerCard
                      answer={row}
                      onSavedChange={(saved) =>
                        setRows((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, saved } : item,
                          ),
                        )
                      }
                    />
                  </details>
                </div>
              </div>
            ))
          ) : (
            <Empty
              title={
                kind === "saved"
                  ? "Keep the ideas that matter."
                  : "Your next chapter starts here."
              }
              description={
                kind === "saved"
                  ? "Save an answer after asking a question. It will appear here."
                  : "You haven’t asked a question yet. Explore the fictional demo to get started."
              }
            />
          )}
        </>
      )}
      {kind === "dashboard" && (
        <>
          <h2 style={{ marginTop: 36 }}>Explore a direction</h2>
          <div className="category-grid">
            {[
              "Career choices",
              "Leadership",
              "Entrepreneurship",
              "Personal development",
              "Purposeful living",
            ].map((t) => (
              <Link href="/ask" key={t}>
                {t} ↗
              </Link>
            ))}
          </div>
          <div className="section-heading" style={{ marginTop: 40 }}>
            <h2>Collections to discover</h2>
            <Link className="text-link" href="/saved">
              View saved answers →
            </Link>
          </div>
          <div className="grid-3">
            {[experts[20], experts[3], experts[11]].map((e) => (
              <ExpertCard expert={e} key={e.id} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
