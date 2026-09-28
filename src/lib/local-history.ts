import type { AnswerResult } from "./retrieval";
export type LocalAnswer = AnswerResult & {
  saved?: boolean;
  helpful?: boolean;
  report?: string;
};
const key = "niaguide-synthetic-history-v1";
export function readLocal(): LocalAnswer[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
export function addLocalAnswer(answer: AnswerResult) {
  localStorage.setItem(
    key,
    JSON.stringify([answer, ...readLocal()].slice(0, 100)),
  );
}
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
