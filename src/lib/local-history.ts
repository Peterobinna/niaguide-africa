// This file saves fictional demo answers and feedback in this browser.
import type { AnswerResult } from "./retrieval";
export type LocalAnswer = AnswerResult & {
  saved?: boolean;
  helpful?: boolean;
  report?: string;
};
const key = "niaguide-synthetic-history-v1";
// Read the fictional chat history from this browser. Use an empty list if there is no readable copy.
export function readLocal(): LocalAnswer[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
// Put the newest demo answer at the front of the history list.
export function addLocalAnswer(answer: AnswerResult) {
  localStorage.setItem(
    key,
    JSON.stringify([answer, ...readLocal()].slice(0, 100)),
  );
}
// Find the selected answer in the list and update its saved or feedback state.
export function updateLocal(
  id: string,
  patch: Partial<Pick<LocalAnswer, "saved" | "helpful" | "report">>,
) {
  localStorage.setItem(
    key,
    JSON.stringify(
      readLocal().map((a) => (a.id === id ? { ...a, ...patch } : a)),
    ),
  );
}
export function clearLocal() {
  localStorage.removeItem(key);
}
