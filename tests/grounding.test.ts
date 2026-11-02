import { test } from "node:test";
import assert from "node:assert/strict";
import { demoId, experts, demoSources } from "../src/lib/catalogue";
import { suggestedQuestions } from "../src/lib/suggested-questions";
test("suggestions stay scoped to curated available collections", () => {
  const dangote = {
    id: "00000000-0000-4000-8000-000000000001",
    status: "available" as const,
    synthetic: false,
  };
  assert.equal(suggestedQuestions(dangote).length, 3);
  assert.equal(
    suggestedQuestions(dangote).some((q) => q.includes("test a business idea")),
    false,
  );
  assert.deepEqual(suggestedQuestions({ ...dangote, status: "review" }), []);
  assert.deepEqual(
    suggestedQuestions({ ...dangote, id: "another-expert" }),
    [],
  );
  assert.deepEqual(suggestedQuestions(undefined), []);
  assert.equal(
    suggestedQuestions({ ...dangote, id: demoId, synthetic: true }).length,
    3,
  );
});
test("imported PostgreSQL expert IDs pass while malformed IDs fail", () => {
  const question = "How can mental models help me solve problems?";
  for (const expertId of [
    "d464f8ea-4995-e45c-11de-2b2d7e9c65e8",
    "ec828ef1-7442-476a-a9ef-1dc21ab118c9",
    "00000000-0000-4000-8000-000000000004",
  ])
    assert.equal(
      questionSchema.safeParse({ expertId, question }).success,
      true,
    );
  for (const expertId of [
    "wrong",
    "d464f8ea4995e45c11de2b2d7e9c65e8",
    "g464f8ea-4995-e45c-11de-2b2d7e9c65e8",
    "d464f8ea-4995-e45c-11de-2b2d7e9c65e8'",
  ])
    assert.equal(
      questionSchema.safeParse({ expertId, question }).success,
      false,
    );
});
import {
  questionSchema,
  retrieveDemo,
  validateClaims,
} from "../src/lib/retrieval";
test("all real experts remain unanswerable even for relevant questions", () => {
  for (const e of experts.filter((e) => !e.synthetic)) {
    assert.notEqual(e.status, "available");
    assert.deepEqual(
      retrieveDemo(e.id, "How can I explore a career and practise a skill?"),
      [],
    );
  }
});
test("relevant synthetic questions retrieve passages", () => {
  for (const q of [
    "How can I explore a career and practise a new skill?",
    "How can I lead a student project?",
    "How do I test a business idea?",
  ])
    assert.ok(retrieveDemo(demoId, q).length > 0);
});
test("unrelated, weak, and high-stakes questions fail closed", () => {
  for (const q of [
    "What is the weather in Lagos?",
    "What is quantum entanglement?",
    "Give medical advice about my career",
    "career",
  ])
    assert.deepEqual(retrieveDemo(demoId, q), []);
});
test("validation bounds input and rejects invalid expert identifiers", () => {
  assert.equal(
    questionSchema.safeParse({
      expertId: "wrong",
      question: "A valid question?",
    }).success,
    false,
  );
  assert.equal(
    questionSchema.safeParse({ expertId: demoId, question: "x".repeat(1201) })
      .success,
    false,
  );
  assert.equal(
    questionSchema.safeParse({ expertId: demoId, question: "   " }).success,
    false,
  );
});
test("claim verification rejects missing sources, invented quotes, and model-supplied markers", () => {
  const c = {
    text: "Try a small career experiment.",
    sourceIndex: 1,
    quote: demoSources[0].content,
  };
  assert.ok(validateClaims({ sufficient: true, claims: [c] }, demoSources));
  assert.equal(
    validateClaims(
      { sufficient: true, claims: [{ ...c, sourceIndex: 99 }] },
      demoSources,
    ),
    false,
  );
  assert.equal(
    validateClaims(
      {
        sufficient: true,
        claims: [
          { ...c, quote: "An invented quote that is not in the source." },
        ],
      },
      demoSources,
    ),
    false,
  );
  assert.equal(
    validateClaims(
      {
        sufficient: true,
        claims: [{ ...c, text: "Unsupported citation [99]" }],
      },
      demoSources,
    ),
    false,
  );
  assert.equal(
    validateClaims({ sufficient: true, claims: [] }, demoSources),
    false,
  );
});
test("catalogue contains exactly 20 real draft profiles and one fictional expert", () => {
  assert.equal(experts.length, 21);
  assert.equal(experts.filter((e) => e.synthetic).length, 1);
  assert.equal(new Set(experts.map((e) => e.id)).size, 21);
});

import { checkedGeneration } from "../src/lib/checked-generation";
import {
  appendExchange,
  checkedPlan,
  mayClarify,
  searchOnlySchema,
  collectionQueries,
  contextForExpert,
  retrieveWithPlan,
} from "../src/lib/conversation";
test("follow-ups accept short replies and context is bounded to the current expert", () => {
  let context = appendExchange(
    demoId,
    undefined,
    "How can I become like you?",
    "Which aspect interests you?",
  );
  context = appendExchange(
    demoId,
    context,
    "Her career",
    "Learn from relevant experience.",
  );
  context = appendExchange(
    demoId,
    context,
    "How do I start?",
    "x".repeat(2500),
  );
  assert.equal(context.turns.length, 2);
  assert.equal(context.turns[1].answer.length, 2000);
  assert.deepEqual(
    contextForExpert("00000000-0000-4000-8000-000000000002", context),
    [],
  );
  assert.equal(
    questionSchema.safeParse({
      expertId: demoId,
      question: "Her career",
      context,
    }).success,
    true,
  );
  assert.equal(
    questionSchema.safeParse({
      expertId: demoId,
      question: "Help",
      context: { ...context, turns: [...context.turns, ...context.turns] },
    }).success,
    false,
  );
});
test("clarification and search plans are mutually exclusive and bounded", () => {
  assert.equal(mayClarify([]), true);
  assert.equal(
    mayClarify([{ question: "Strategies", answer: "Which strategies?" }]),
    false,
  );
  assert.equal(
    searchOnlySchema.safeParse({
      needsClarification: true,
      clarification: "Which kind of negotiation?",
      standaloneQuestion: "",
      queries: [],
    }).success,
    false,
  );
  assert.equal(
    searchOnlySchema.safeParse({
      needsClarification: false,
      clarification: "",
      standaloneQuestion: "How can I learn negotiation strategies?",
      queries: ["negotiation compromise"],
    }).success,
    true,
  );
  assert.deepEqual(
    collectionQueries(
      ["Ngozi Okonjo-Iweala career development", "career development"],
      "Ngozi Okonjo-Iweala",
    ),
    ["career development"],
  );
  const clarification = {
    needsClarification: true,
    clarification: "Which aspect interests you?",
    standaloneQuestion: "",
    queries: [],
  };
  assert.ok(checkedPlan(clarification));
  assert.equal(
    checkedPlan({ ...clarification, queries: ["career leadership"] }),
    null,
  );
  assert.equal(
    checkedPlan({
      ...clarification,
      clarification: "Here is unsupported advice.",
    }),
    null,
  );
  const plan = {
    needsClarification: false,
    clarification: "",
    standaloneQuestion: "How can I develop my career?",
    queries: ["career development", "learning skills"],
  };
  assert.ok(checkedPlan(plan));
  assert.equal(
    checkedPlan({ ...plan, queries: Array(4).fill("career") }),
    null,
  );
  assert.equal(checkedPlan({ ...plan, queries: ["x".repeat(161)] }), null);
  assert.equal(checkedPlan(null), null);
});
test("meaning-aware searches retain original search, deduplicate evidence and fail on database errors", async () => {
  const calls: string[] = [];
  const sources = await retrieveWithPlan(
    "I'm afraid to speak",
    ["public speaking", "confidence practice", "public speaking"],
    async (query) => {
      calls.push(query);
      return query === "public speaking"
        ? demoSources
        : query === "confidence practice"
          ? [demoSources[0]]
          : [];
    },
  );
  assert.deepEqual(calls, [
    "I'm afraid to speak",
    "public speaking",
    "confidence practice",
  ]);
  assert.equal(sources.length, new Set(sources.map((s) => s.id)).size);
  assert.equal(sources[0].id, demoSources[0].id);
  assert.deepEqual(
    await retrieveWithPlan("cake", ["cake recipe"], async () => []),
    [],
  );
  await assert.rejects(
    retrieveWithPlan("career", ["skills"], async () => {
      throw new Error("Database unavailable");
    }),
  );
});
import { buildEvidence, resolveEvidence } from "../src/lib/evidence-generation";
test("multi-query retrieval fits the database citation limit before generation", async () => {
  const sources = await retrieveWithPlan("partner", ["dating", "marriage"], async (query) =>
    Array.from({ length: 4 }, (_, i) => ({
      ...demoSources[0],
      id: `${query}-${i}`,
      content: `A complete passage about ${query} and relationships.`,
    })),
  );
  assert.equal(sources.length, 4);
  assert.equal(new Set(sources.map((source) => source.id)).size, 4);
  assert.equal(sources[0].id, "partner-0");
});
test("evidence selection preserves transcript whitespace and never trusts model quotes", () => {
  const sources = [
    {
      ...demoSources[0],
      content:
        "You know,  systems\nare the bedrock. Do not change these words. ",
    },
  ];
  const evidence = buildEvidence(sources);
  const result = resolveEvidence(
    {
      sufficient: true,
      claims: [
        {
          text: "Systems matter.",
          evidenceId: evidence[0].id,
          quote: "Invented",
        },
      ],
    },
    evidence,
  );
  assert.ok(result);
  assert.equal(result.claims[0].quote, sources[0].content);
  assert.ok(validateClaims(result, sources));
  assert.equal(
    resolveEvidence(
      { sufficient: true, claims: [{ text: "No", evidenceId: "s99e1" }] },
      evidence,
    ),
    null,
  );
  assert.equal(resolveEvidence(null, evidence), null);
  assert.deepEqual(
    resolveEvidence({ sufficient: false, claims: [] }, evidence),
    { sufficient: false, claims: [] },
  );
});
test("long and unpunctuated evidence stays scoped and covers passage ends", () => {
  for (const content of ["word ".repeat(2400), "x".repeat(1200)]) {
    const sources = [{ ...demoSources[0], content }, demoSources[1]];
    const evidence = buildEvidence(sources);
    assert.equal(new Set(evidence.map((e) => e.id)).size, evidence.length);
    for (const e of evidence) {
      assert.ok(e.quote.length >= 25 && e.quote.length <= 600);
      assert.ok(sources[e.sourceIndex - 1].content.includes(e.quote));
    }
    assert.ok(
      content.endsWith(
        evidence.filter((e) => e.sourceIndex === 1).at(-1)!.quote,
      ),
    );
  }
});
test("diagnostics identify failures without including source or question text", async () => {
  const events: unknown[] = [];
  const result = await checkedGeneration(
    demoSources,
    async (repair, feedback) => {
      if (repair)
        assert.deepEqual(feedback, [{ claim: 1, code: "quote_not_exact" }]);
      return {
        sufficient: true,
        claims: [
          {
            text: "Try a step.",
            sourceIndex: 1,
            quote: repair
              ? demoSources[0].content
              : "Private fabricated quote not to log.",
          },
        ],
      };
    },
    (event) => events.push(event),
  );
  assert.equal(result.status, "verified");
  assert.deepEqual(events, [
    { attempt: 1, issues: [{ claim: 1, code: "quote_not_exact" }] },
  ]);
});
test("generation retries invalid quotes once and accepts only verified claims", async () => {
  const calls: boolean[] = [];
  const result = await checkedGeneration(demoSources, async (repair) => {
    calls.push(repair);
    return {
      sufficient: true,
      claims: [
        {
          text: "Try an experiment.",
          sourceIndex: 1,
          quote: repair
            ? demoSources[0].content
            : "Invented evidence that must never pass.",
        },
      ],
    };
  });
  assert.equal(result.status, "verified");
  assert.deepEqual(calls, [false, true]);
});
test("persistent invalid generation fails separately from insufficient evidence", async () => {
  let calls = 0;
  const result = await checkedGeneration(demoSources, async () => {
    calls++;
    return {
      sufficient: true,
      claims: [
        { text: "Unsupported", sourceIndex: 99, quote: demoSources[0].content },
      ],
    };
  });
  assert.equal(result.status, "validation_failed");
  assert.equal(calls, 2);
});
test("genuine insufficiency is not retried or forced into an answer", async () => {
  let calls = 0;
  const result = await checkedGeneration(demoSources, async () => {
    calls++;
    return { sufficient: false, claims: [] };
  });
  assert.equal(result.status, "insufficient");
  assert.equal(calls, 1);
  const empty = await checkedGeneration([], async () => {
    throw new Error("Must not generate");
  });
  assert.equal(empty.status, "no_sources");
});
test("null output fails closed after one retry", async () => {
  assert.equal(
    (await checkedGeneration(demoSources, async () => null)).status,
    "validation_failed",
  );
});
