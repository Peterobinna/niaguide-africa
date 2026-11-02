import { z } from "zod";
import type { Source } from "./catalogue";

// The model selects evidence; the server copies it from the approved passage.
export const evidenceSchema = z.object({
  sufficient: z.boolean(),
  claims: z.array(z.object({ text: z.string(), evidenceId: z.string() })),
});

export type Evidence = { id: string; sourceIndex: number; quote: string };

export function buildEvidence(sources: Source[]): Evidence[] {
  return sources.flatMap((source, index) => {
    const evidence: Evidence[] = [];
    // Overlapping word-boundary windows also work for unpunctuated transcripts.
    // Every excerpt is sliced from the original, preserving spacing and fillers.
    let start = 0;
    while (start < source.content.length) {
      let end = Math.min(start + 600, source.content.length);
      if (end < source.content.length) {
        const boundary = source.content.lastIndexOf(" ", end);
        if (boundary > start + 25) end = boundary;
      }
      const quote = source.content.slice(start, end);
      if (quote.length >= 25)
        evidence.push({
          id: `s${index + 1}e${evidence.length + 1}`,
          sourceIndex: index + 1,
          quote,
        });
      if (end === source.content.length) break;
      const overlap = source.content.indexOf(" ", end - 180);
      start = overlap > start && overlap < end ? overlap + 1 : end;
    }
    return evidence;
  });
}

export function resolveEvidence(output: unknown, evidence: Evidence[]) {
  const parsed = evidenceSchema.safeParse(output);
  if (!parsed.success) return null;
  const claims = [];
  for (const claim of parsed.data.claims) {
    const selected = evidence.find((e) => e.id === claim.evidenceId);
    // Never guess, silently drop claims, or substitute unrelated evidence.
    if (!selected) return null;
    claims.push({
      text: claim.text,
      sourceIndex: selected.sourceIndex,
      quote: selected.quote,
    });
  }
  return { sufficient: parsed.data.sufficient, claims };
}

export const evidenceInstructions = `For each claim select the evidenceId of one supplied evidence excerpt that supports it. Return text and evidenceId only for each claim, rather than copying a quote or supplying sourceIndex. The server attaches the original quote and source reference. Never invent an evidenceId. Do not treat the existence of an excerpt as proof of a claim: its words must support the lesson or application. If none supports the answer, return sufficient=false and claims=[].`;
