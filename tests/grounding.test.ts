import { test } from "node:test";
import assert from "node:assert/strict";
import { demoId, experts, demoSources } from "../src/lib/catalogue";
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
