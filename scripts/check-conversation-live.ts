// Opt-in: five paid planning calls. Uses only synthetic test conversations.
import assert from "node:assert/strict";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  checkedPlan,
  plannerInstructionsFor,
  mayClarify,
  searchOnlySchema,
  searchPlanSchema,
} from "../src/lib/conversation";

async function main() {
  const client = new OpenAI({ timeout: 30000, maxRetries: 0 });
  const cases = [
    {
      selectedExpert: "Ngozi Okonjo-Iweala",
      question: "Strategies",
      recentConversation: [
        {
          question: "How can I become like you?",
          answer: "Which aspect interests you?",
        },
      ],
      clarify: false,
    },
    {
      selectedExpert: "Ngozi Okonjo-Iweala",
      question: "Negotiation Strategies",
      recentConversation: [
        { question: "Strategies", answer: "Which strategies?" },
      ],
      clarify: false,
    },
    {
      selectedExpert: "Ngozi Okonjo-Iweala",
      question: "How can I become like you?",
      recentConversation: [],
      clarify: true,
    },
    {
      selectedExpert: "Ngozi Okonjo-Iweala",
      question: "Her career",
      recentConversation: [
        {
          question: "How can I become like you?",
          answer:
            "Which aspect interests you: her career, confidence or leadership?",
        },
      ],
      clarify: false,
    },
    {
      selectedExpert: "Coach Joyce Daniels",
      question:
        "Whenever I stand in front of my class, I forget everything I wanted to say. What can I try?",
      recentConversation: [],
      clarify: false,
    },
  ];
  for (const { clarify, ...input } of cases) {
    const response = await client.responses.parse({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      store: false,
      max_output_tokens: 700,
      instructions: plannerInstructionsFor(input.recentConversation),
      input: JSON.stringify(input),
      text: {
        format: zodTextFormat(
          mayClarify(input.recentConversation)
            ? searchPlanSchema
            : searchOnlySchema,
          "guidance_search",
        ),
      },
    });
    const plan =
      response.status === "completed"
        ? checkedPlan(response.output_parsed)
        : null;
    assert.ok(plan, "Search plan must be valid");
    assert.equal(plan.needsClarification, clarify);
    if (input.question === "Her career")
      assert.match(
        plan.standaloneQuestion,
        /develop|build|pursue|learn|follow|achieve|grow|career path/i,
      );
    console.log(JSON.stringify({ question: input.question, ...plan }));
  }
}
main().catch(() => {
  console.error(
    "Live conversation check failed. No credentials or raw API errors logged.",
  );
  process.exitCode = 1;
});
