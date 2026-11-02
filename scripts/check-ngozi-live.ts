// Opt-in diagnostic: uses local approved import copies; never prints credentials.
import fs from "node:fs";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { generatedSchema, claimIssues } from "../src/lib/retrieval";
import { guidanceInstructions } from "../src/lib/guidance-instructions";
import type { Source } from "../src/lib/catalogue";
import {
  buildEvidence,
  evidenceSchema,
  evidenceInstructions,
  resolveEvidence,
} from "../src/lib/evidence-generation";

async function main() {
  const first = JSON.parse(
    fs.readFileSync("../ngozi-import/first-video-passages.json", "utf8"),
  ) as { content: string }[];
  const docs = JSON.parse(
    fs.readFileSync("../ngozi-import/six-source-manifest.json", "utf8"),
  ) as { passages: { content: string }[] }[];
  const passages = [...first, ...docs.flatMap((d) => d.passages)]
    .filter(
      (p) =>
        /corrupt/i.test(p.content) &&
        /system/i.test(p.content) &&
        /fight/i.test(p.content),
    )
    .slice(0, 4);
  const client = new OpenAI({ timeout: 45000, maxRetries: 0 });
  const evidence = buildEvidence(passages as Source[]);
  const response = await client.responses.parse({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    store: false,
    max_output_tokens: 2800,
    instructions: guidanceInstructions + "\n" + evidenceInstructions,
    input: JSON.stringify({
      question: process.argv.includes("--unrelated")
        ? "What is the best recipe for chocolate cake?"
        : process.argv.includes("--student")
          ? "I handle money for a student club. How can we make it harder for anyone to misuse it?"
          : "How can strong systems help fight corruption?",
      selectedExpert: "Ngozi Okonjo-Iweala",
      evidence,
      passages: passages.map((p, i) => ({ index: i + 1, content: p.content })),
    }),
    text: { format: zodTextFormat(evidenceSchema, "grounded_guidance") },
  });
  const parsed = generatedSchema.safeParse(
    resolveEvidence(response.output_parsed, evidence),
  );
  console.log(
    JSON.stringify({
      status: response.status,
      sourceCount: passages.length,
      sufficient: parsed.success ? parsed.data.sufficient : null,
      issues: parsed.success
        ? claimIssues(parsed.data, passages as Source[])
        : ["invalid_structure"],
      answer: parsed.success ? parsed.data.claims.map((c) => c.text) : [],
    }),
  );
}
main().catch(() => {
  console.error("Live diagnostic failed; no credentials or raw error logged.");
  process.exitCode = 1;
});
