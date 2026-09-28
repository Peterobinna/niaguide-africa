import { z } from "zod";
import { demoId, demoSources, type Source } from "./catalogue";
export const questionSchema = z.object({
  expertId: z.uuid(),
  question: z
    .string()
    .max(1200, "Keep your question under 1,200 characters.")
    .transform((s) => s.replace(/[\u0000-\u001f\u007f]/g, " ").trim())
    .pipe(z.string().min(12, "Ask a question of at least 12 characters.")),
});
const stop = new Set(
  "what how can could should would about with from this that have your their into when where which want help need some does please more there they them then".split(
    " ",
  ),
);
export function terms(text: string) {
  return [
    ...new Set(
      (text.toLowerCase().match(/[a-z]{3,}/g) ?? []).filter(
        (t) => !stop.has(t),
      ),
    ),
  ];
}
export function retrieveDemo(expertId: string, question: string): Source[] {
  if (
    expertId !== demoId ||
    /\b(medical|diagnos\w*|medicine|invest\w*|stock|legal|lawsuit|password|suicid\w*)\b/i.test(
      question,
    )
  )
    return [];
  const tokens = terms(question);
  return demoSources
    .map((source) => ({
      source,
      score: tokens.filter((t) =>
        (source.content + " " + source.title).toLowerCase().includes(t),
      ).length,
    }))
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.source);
}
export const generatedSchema = z.object({
  sufficient: z.boolean(),
  claims: z.array(
    z.object({
      text: z.string(),
      sourceIndex: z.number().int(),
      quote: z.string(),
    }),
  ),
});
export function validateClaims(
  data: z.infer<typeof generatedSchema>,
  sources: Source[],
) {
  return (
    data.sufficient &&
    data.claims.length > 0 &&
    data.claims.every(
      (c) =>
        c.text.trim().length > 0 &&
        c.quote.length >= 25 &&
        Number.isInteger(c.sourceIndex) &&
        c.sourceIndex >= 1 &&
        c.sourceIndex <= sources.length &&
        sources[c.sourceIndex - 1].content.includes(c.quote) &&
        !/\[\d+\]/.test(c.text),
    )
  );
}
export type AnswerResult = {
  id: string;
  question: string;
  expertId: string;
  answer: string;
  sources: Source[];
  insufficient: boolean;
  synthetic: boolean;
  model: string;
  latencyMs: number;
  createdAt: string;
};
