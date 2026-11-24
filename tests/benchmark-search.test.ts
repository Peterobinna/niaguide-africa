import assert from "node:assert/strict";
import { test } from "node:test";
import { plannerInput, rankRecorded } from "../scripts/benchmark-search";
import type { Source } from "../src/lib/catalogue";
const source = (id: string, size = 20): Source => ({
  id,
  title: "Fixture",
  type: "test",
  published_at: "",
  url: null,
  content: "x".repeat(size),
  synthetic: false,
});
test("planner receives collection context and question, never benchmark answers", () => {
  const input = plannerInput(
    {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Example",
      field: "Business",
      status: "available",
      synthetic: false,
    },
    "Question?",
  );
  assert.deepEqual(input, {
    selectedExpert: "Example",
    collectionField: "Business",
    question: "Question?",
    recentConversation: [],
  });
});
test("recorded batches use production ranking, deduplication and evidence budget", async () => {
  const a = source("a"),
    b = source("b"),
    large = source("large", 30001);
  const result = await rankRecorded(
    "original",
    ["variant"],
    new Map([
      ["original", [a, b]],
      ["variant", [b, large]],
    ]),
  );
  assert.deepEqual(
    result.map((s) => s.id),
    ["b", "a"],
  );
});
test("missing SQL batch is an error rather than an artificial search miss", async () => {
  await assert.rejects(
    rankRecorded("original", ["missing"], new Map([["original", []]])),
    /Missing retrieval batch/,
  );
});
