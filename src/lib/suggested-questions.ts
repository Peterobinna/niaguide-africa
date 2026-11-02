import type { Expert } from "./catalogue";

// Curated against the approved collection, not the expert's general reputation.
export function suggestedQuestions(
  expert?: Pick<Expert, "id" | "status" | "synthetic">,
): string[] {
  if (!expert || expert.status !== "available") return [];
  if (expert.synthetic)
    return [
      "How can I explore a career and practise a new skill?",
      "How can I lead a student project?",
      "How do I test a business idea?",
    ];
  if (expert.id === "00000000-0000-4000-8000-000000000001")
    return [
      "Why should I understand a business before starting?",
      "Why is the right team important for a business?",
      "Why does a business need a clear vision?",
    ];
  return [];
}
