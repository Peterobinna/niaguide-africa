"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { demoId, demoMode, privacyWarning, type Expert } from "@/lib/catalogue";
import type { AnswerResult } from "@/lib/retrieval";
import { Disclosure } from "./ui";
import { AnswerCard } from "./answer-card";
import { addLocalAnswer } from "@/lib/local-history";
import { appendExchange, type Conversation } from "@/lib/conversation";
import { suggestedQuestions } from "@/lib/suggested-questions";

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
  const [messages, setMessages] = useState<AnswerResult[]>([]);
  const [pending, setPending] = useState("");
  const [context, setContext] = useState<Conversation>();
  const latest = useRef<HTMLDivElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const sending = useRef(false);
  useEffect(() => {
    if ((messages.length || pending) && latest.current && transcript.current)
      transcript.current.scrollTo({
        top: latest.current.offsetTop - 16,
        behavior: "instant",
      });
  }, [messages.length, pending]);
  useEffect(() => {
    if (!busy && messages.length) input.current?.focus({ preventScroll: true });
  }, [busy, messages.length]);
  function reset() {
    setMessages([]);
    setContext(undefined);
    setQuestion("");
    setError("");
    setPending("");
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending.current || question.trim().length < 2) return;
    sending.current = true;
    const sent = question;
    setBusy(true);
    setPending(sent);
    setError("");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertId: expert,
          question: sent,
          context: demoMode ? undefined : context,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to send. Please try again.");
      setMessages((previous) => [...previous, data]);
      if (!demoMode)
        setContext(appendExchange(expert, context, sent, data.answer));
      else if (data.kind !== "clarification") addLocalAnswer(data);
      setQuestion("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to send. Your reply is still below so you can retry.",
      );
    } finally {
      setPending("");
      setBusy(false);
      sending.current = false;
    }
  }
  return (
    <section className="guidance-chat" aria-label="Chat with NiaGuide">
      <div className="chat-toolbar">
        <div>
          <label htmlFor="expert">Expert collection</label>
          <select
            id="expert"
            value={expert}
            disabled={busy}
            onChange={(e) => {
              setExpert(e.target.value);
              reset();
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
        <button
          type="button"
          className="text-link"
          disabled={busy || !messages.length}
          onClick={reset}
        >
          New chat
        </button>
      </div>
      <div
        ref={transcript}
        className="chat-transcript"
        role="region"
        aria-label="Conversation"
        tabIndex={0}
      >
        {!messages.length && !busy && (
          <div className="chat-welcome">
            <h2>What would you like help with?</h2>
            <p>
              Ask in your own words. We’ll look for useful lessons in this
              expert’s sources.
            </p>
            <div className="suggestions">
              {suggestedQuestions(experts.find((e) => e.id === expert)).map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setQuestion(s);
                      input.current?.focus();
                    }}
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
        {messages.map((answer, i) => (
          <div
            className="chat-exchange"
            key={answer.id}
            ref={i === messages.length - 1 && !pending ? latest : undefined}
          >
            <div className="chat-user">
              <strong>You</strong>
              <p>{answer.question}</p>
            </div>
            <div className="chat-assistant">
              <strong className="chat-speaker">NiaGuide</strong>
              {answer.kind === "clarification" ? (
                <div className="chat-clarification">
                  <p>{answer.answer}</p>
                </div>
              ) : (
                <AnswerCard
                  answer={answer}
                  onFollowUp={() => input.current?.focus()}
                />
              )}
            </div>
          </div>
        ))}
        {pending && (
          <div className="chat-exchange" ref={latest}>
            <div className="chat-user">
              <strong>You</strong>
              <p>{pending}</p>
            </div>
            <p role="status">NiaGuide is checking the sources…</p>
          </div>
        )}
      </div>
      <form className="chat-composer" onSubmit={submit}>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <label htmlFor="question">
          {messages.length ? "Your reply" : "Your question"}
        </label>
        <textarea
          ref={input}
          id="question"
          value={question}
          readOnly={busy}
          onChange={(e) => setQuestion(e.target.value)}
          minLength={2}
          maxLength={1200}
          required
          rows={2}
          placeholder="Type here…"
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              if (!busy) e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <div className="chat-send-row">
          <span className="muted">
            {question.length}/1,200 · Enter to send · Shift + Enter for a new
            line
          </span>
          <button
            className="button"
            disabled={busy || !expert || question.trim().length < 2}
          >
            {busy ? "Working…" : "Send"}
            <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="privacy">
          <LockKeyhole size={13} />
          <span>{privacyWarning}</span>
        </div>
      </form>
      <details className="chat-about">
        <summary>About this chat and your privacy</summary>
        <p className="muted">
          Messages stay visible in this tab. In live mode, the last two
          exchanges are sent to the AI for follow-ups. New chat, changing expert
          or refreshing clears this conversation, but does not delete saved
          question history.
        </p>
        {demoMode && (
          <p className="notice">
            Demo mode uses fictional excerpts without live AI or conversation
            understanding.
          </p>
        )}
        <Disclosure />
      </details>
    </section>
  );
}
