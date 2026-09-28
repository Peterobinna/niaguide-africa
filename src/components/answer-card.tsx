"use client";
import Link from "next/link";
import { useState } from "react";
import { Bookmark, ThumbsUp, ThumbsDown, Flag, ArrowRight } from "lucide-react";
import { demoMode } from "@/lib/catalogue";
import { updateLocal, type LocalAnswer } from "@/lib/local-history";
import { Disclosure } from "./ui";
export function AnswerCard({
  answer,
  onFollowUp,
  onSavedChange,
}: {
  answer: LocalAnswer;
  onFollowUp?: () => void;
  onSavedChange?: (saved: boolean) => void;
}) {
  const [saved, setSaved] = useState(answer.saved ?? false);
  const [helpful, setHelpful] = useState<boolean | undefined>(answer.helpful);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function act(
    action: "save" | "feedback" | "report",
    value: boolean | string,
  ) {
    setMessage("");
    setBusy(true);
    try {
      if (demoMode) {
        updateLocal(
          answer.id,
          action === "save"
            ? { saved: Boolean(value) }
            : action === "feedback"
              ? { helpful: Boolean(value) }
              : { report: String(value) },
        );
      } else {
        const r = await fetch("/api/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            answerId: answer.id,
            ...(action === "save"
              ? { saved: value }
              : action === "feedback"
                ? { helpful: value }
                : { reason: value }),
          }),
        });
        if (!r.ok) throw new Error("Could not save your change. Please retry.");
      }
      if (action === "save") {
        setSaved(Boolean(value));
        onSavedChange?.(Boolean(value));
      }
      if (action === "feedback") setHelpful(Boolean(value));
      if (action === "report") setReportOpen(false);
      setMessage(
        demoMode
          ? "Recorded in this browser for the demonstration only."
          : "Your change has been saved.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="panel" aria-label="Guidance answer">
      <span className={`badge ${answer.insufficient ? "review" : "available"}`}>
        {answer.insufficient
          ? "More evidence needed"
          : answer.synthetic
            ? "Synthetic extractive demonstration"
            : "AI-generated guidance"}
      </span>
      <h2 style={{ marginTop: 16 }}>
        {answer.insufficient
          ? "Let’s try another question."
          : "A perspective to reflect on"}
      </h2>
      <p className="answer-copy">
        {answer.answer.split(/(\[\d+\])/).map((part, i) =>
          /^\[\d+\]$/.test(part) ? (
            <a
              className="inline-link"
              href={`#source-${answer.id}-${part.slice(1, -1)}`}
              key={i}
            >
              {part}
            </a>
          ) : (
            part
          ),
        )}
      </p>
      {answer.sources.length > 0 && (
        <>
          <h3 style={{ marginTop: 28 }}>Explore the supporting sources</h3>
          {answer.sources.map((s, i) => (
            <details
              id={`source-${answer.id}-${i + 1}`}
              key={s.id}
              className="source-details"
            >
              <summary>
                [{i + 1}] {s.title}
              </summary>
              <p className="muted">
                {s.type} · {s.published_at || "Publication date not recorded"}
                {s.synthetic ? " · Synthetic content" : ""}
              </p>
              <blockquote>{s.content}</blockquote>
              {s.synthetic ? (
                <Link href={`/sources#${s.id}`}>
                  View original synthetic note →
                </Link>
              ) : s.url && /^https?:\/\//.test(s.url) ? (
                <a href={s.url} target="_blank" rel="noreferrer">
                  Open published source ↗
                </a>
              ) : (
                <p>Source link unavailable.</p>
              )}
            </details>
          ))}
        </>
      )}
      <Disclosure />
      <div className="answer-actions">
        <button
          disabled={busy}
          aria-pressed={saved}
          onClick={() => act("save", !saved)}
        >
          <Bookmark size={15} />
          {saved ? "Saved" : "Save Answer"}
        </button>
        <button
          disabled={busy}
          aria-pressed={helpful === true}
          onClick={() => act("feedback", true)}
        >
          <ThumbsUp size={15} />
          Helpful
        </button>
        <button
          disabled={busy}
          aria-pressed={helpful === false}
          onClick={() => act("feedback", false)}
        >
          <ThumbsDown size={15} />
          Not Helpful
        </button>
        <button disabled={busy} onClick={() => setReportOpen(!reportOpen)}>
          <Flag size={15} />
          Report a Problem
        </button>
        {onFollowUp ? (
          <button onClick={onFollowUp}>
            Ask a follow-up <ArrowRight size={15} />
          </button>
        ) : (
          <Link className="text-link" href={`/ask?expert=${answer.expertId}`}>
            Ask a follow-up →
          </Link>
        )}
      </div>
      {reportOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void act("report", reason);
          }}
          style={{ marginTop: 20 }}
        >
          <label htmlFor={`report-${answer.id}`}>
            What went wrong? Please avoid sensitive information.
          </label>
          <textarea
            id={`report-${answer.id}`}
            minLength={5}
            maxLength={1000}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button className="button small" disabled={busy}>
            Submit report
          </button>
        </form>
      )}
      <p role="status" className="muted" style={{ marginTop: 12 }}>
        {message}
      </p>
      <small className="muted">
        {answer.synthetic ? "Demo engine" : answer.model} · {answer.latencyMs}{" "}
        ms
      </small>
    </article>
  );
}
