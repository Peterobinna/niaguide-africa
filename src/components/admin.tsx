"use client";
import { useState } from "react";
import {
  type Expert,
  type CollectionStatus,
  statusLabel,
} from "@/lib/catalogue";
export type AdminDocument = {
  id: string;
  title: string;
  type: string;
  approval_status: string;
  rights_status: string;
  expert_id: string;
};
export function Admin({
  initialExperts,
  documents,
  counts,
  reports,
  feedback,
  demo,
}: {
  initialExperts: Expert[];
  documents: AdminDocument[];
  counts: number[];
  reports: { id: string; reason: string; status: string }[];
  feedback: { id: string; helpful: boolean }[];
  demo: boolean;
}) {
  const [rows, setRows] = useState(initialExperts);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function change(id: string, status: CollectionStatus) {
    setBusy(true);
    setMessage("");
    try {
      if (!demo) {
        const response = await fetch("/api/admin", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
      }
      setRows(rows.map((e) => (e.id === id ? { ...e, status } : e)));
      setMessage(
        demo
          ? "Preview status changed for this screen only. Source availability and the public catalogue are unchanged."
          : "Collection status updated.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Unable to update collection.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <nav className="admin-tabs" aria-label="Admin navigation">
        {[
          ["overview", "Overview"],
          ["experts", "Experts"],
          ["documents", "Source Documents"],
          ["collections", "Collections"],
          ["reports", "Reported Answers"],
          ["feedback", "Feedback"],
          ["settings", "Settings"],
        ].map(([id, label]) => (
          <a href={`#${id}`} key={id}>
            {label}
          </a>
        ))}
      </nav>
      {demo && (
        <div className="notice">
          Read-only administration preview with temporary status controls. No
          live database changes. Real admin access requires a verified admin
          account.
        </div>
      )}
      <div className="stats" id="overview">
        {["Experts", "Documents", "Passages", "Questions", "Reports"].map(
          (label, i) => (
            <div className="stat" key={label}>
              <strong>{counts[i]}</strong>
              <span>
                {label}
                {demo ? " · demo" : ""}
              </span>
            </div>
          ),
        )}
      </div>
      <section className="panel" id="experts">
        <h2>Expert collections</h2>
        <p>
          Review collection readiness before making approved evidence available.
        </p>
        <div role="status" className="notice">
          {message ||
            "Collection changes require administrative access in live mode."}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>EXPERT</th>
                <th>FIELD</th>
                <th>COUNTRY</th>
                <th>COLLECTION STATUS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>
                    {e.name}
                    {e.synthetic ? " · Fictional" : ""}
                  </td>
                  <td>{e.field}</td>
                  <td>{e.country}</td>
                  <td>
                    <select
                      disabled={busy}
                      aria-label={`Status for ${e.name}`}
                      value={e.status}
                      onChange={(event) =>
                        change(e.id, event.target.value as CollectionStatus)
                      }
                    >
                      {Object.entries(statusLabel).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section id="documents" className="panel">
        <h2>Source documents</h2>
        <p>
          Document ingestion and approval are managed through the Supabase SQL
          Editor in this foundation. Ordinary users cannot upload or edit
          sources.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TITLE</th>
                <th>TYPE</th>
                <th>RIGHTS</th>
                <th>APPROVAL</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id}>
                  <td>{d.title}</td>
                  <td>{d.type}</td>
                  <td>{d.rights_status}</td>
                  <td>{d.approval_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!documents.length && <p>No source documents yet.</p>}
      </section>
      <section id="collections" className="panel">
        <h2>Collection review queue</h2>
        <p>
          {rows.filter((e) => e.status === "review").length} collections await
          source review. Review provenance, usage rights, publication details,
          and passage quality before activation.
        </p>
        <p>
          Availability does not establish an expert’s endorsement. Keep
          catalogue and permission language separate.
        </p>
      </section>
      <section id="reports" className="panel">
        <h2>Reported answers</h2>
        {reports.length ? (
          reports.map((r) => (
            <p key={r.id}>
              {r.reason} · {r.status}
            </p>
          ))
        ) : (
          <p>
            No reports in the {demo ? "demonstration" : "live"} review queue.
          </p>
        )}
      </section>
      <section id="feedback" className="panel">
        <h2>Feedback</h2>
        <p>
          {feedback.filter((f) => f.helpful).length} helpful ·{" "}
          {feedback.filter((f) => !f.helpful).length} not helpful
          {demo
            ? " (demo preview; local browser feedback is not submitted to this queue)"
            : ""}
        </p>
      </section>
      <section id="settings" className="panel">
        <h2>Collection settings</h2>
        <p>
          Prompt version: grounded-v1. Retrieval: approved passages from active
          collections only. Rate limit: 10 live questions per user per hour.
          Credentials and deployment settings are configured server-side.
        </p>
      </section>
    </>
  );
}
