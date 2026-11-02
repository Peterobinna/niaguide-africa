import { generatedSchema, claimIssues } from "./retrieval";
import type { Source } from "./catalogue";

// A failed generation is not evidence that the collection has no answer.
// Retry once with the same approved sources; never relax quotation checks.
export async function checkedGeneration(
  sources: Source[],
  generate: (
    repair: boolean,
    feedback: { claim: number; code: string }[],
  ) => Promise<unknown>,
  report?: (event: {
    attempt: number;
    issues: { claim: number; code: string }[];
  }) => void,
) {
  if (!sources.length) return { status: "no_sources" as const };
  let issues: { claim: number; code: string }[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const parsed = generatedSchema.safeParse(
      await generate(attempt === 1, issues),
    );
    if (parsed.success) {
      if (!parsed.data.sufficient && parsed.data.claims.length === 0)
        return { status: "insufficient" as const };
      issues = claimIssues(parsed.data, sources);
      if (!issues.length)
        return { status: "verified" as const, generated: parsed.data };
    } else issues = [{ claim: 0, code: "invalid_structure" }];
    report?.({ attempt: attempt + 1, issues });
  }
  return { status: "validation_failed" as const };
}
