"use client";
import { useState } from "react";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { demoId, demoMode, privacyWarning, type Expert } from "@/lib/catalogue";
import type { AnswerResult } from "@/lib/retrieval";
import { Disclosure } from "./ui";
import { AnswerCard } from "./answer-card";
import { addLocalAnswer } from "@/lib/local-history";
export function AskForm({
  initialExpert,
  experts,
}: {
  initialExpert?: string;
  experts: Expert[];
}) {
  const [expert, setExpert] = useState(
    initialExpert && experts.some((e) => e.id === initialExpert)
      ? initialExpert
      : demoMode
        ? demoId
        : (experts[0]?.id ?? ""),
  );
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState<AnswerResult | null>(null);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setAnswer(null);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertId: expert, question }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to submit your question.");
      setAnswer(data);
      if (demoMode) addLocalAnswer(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="panel">
        <form className="question-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="expert">Choose an expert collection</label>
            <select
              id="expert"
              value={expert}
              onChange={(e) => {
                setExpert(e.target.value);
                setAnswer(null);
              }}
            >
              {experts.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                  {e.synthetic
                    ? " · Fictional demonstration"
                    : e.status !== "available"
                      ? " · Sources unavailable"
                      : ""}
                </option>
              ))}
            </select>
          </div>
          {demoMode && (
            <div className="notice">
              Demo mode: answers are retrieved excerpts from original fictional
              notes. No live AI generation or real-expert guidance is used.
            </div>
          )}
          <label htmlFor="question">What’s on your mind?</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            minLength={12}
            maxLength={1200}
            required
            placeholder="For example: How can I explore a career and practise a new skill?"
          />
          <div className="privacy">
            <LockKeyhole size={13} />
            <span>{privacyWarning}</span>
          </div>
          <div className="suggestions">
            {[
              "How can I explore a career and practise a new skill?",
              "How can I lead a student project?",
              "How do I test a business idea?",
            ].map((s) => (
              <button type="button" key={s} onClick={() => setQuestion(s)}>
                {s}
              </button>
            ))}
          </div>
          <button className="button" disabled={busy || !expert}>
            {busy ? "Finding supporting passages…" : "Find guidance"}{" "}
            {!busy && <ArrowUpRight size={17} />}
          </button>
          <span className="muted" style={{ marginLeft: 15 }}>
            {question.length}/1,200
          </span>
        </form>
        {error && (
          <p className="error" role="alert" style={{ marginTop: 15 }}>
            {error}
          </p>
        )}
        <div role="status" aria-live="polite">
          {busy && (
            <p className="muted">
              Searching the selected collection before preparing an answer.
            </p>
          )}
        </div>
      </div>
      {answer && (
        <AnswerCard
          answer={answer}
          onFollowUp={() => {
            setQuestion("");
            document.getElementById("question")?.focus();
          }}
        />
      )}
      <Disclosure />
    </>
  );
}
