// This is the main question route. It takes a question from the chat and returns guidance with its sources or a message explaining the problem.
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { demoMode, insufficient, type Source } from "@/lib/catalogue";
import {
  questionSchema,
  retrieveDemo,
  type AnswerResult,
} from "@/lib/retrieval";
import { serverDb } from "@/lib/supabase/server";
import { readBody, failure } from "@/lib/server/http";
import { checkedGeneration } from "@/lib/checked-generation";
import { guidanceInstructions } from "@/lib/guidance-instructions";
import {
  checkedPlan,
  collectionQueries,
  contextForExpert,
  plannerInstructionsFor,
  mayClarify,
  searchOnlySchema,
  retrieveWithPlan,
  searchPlanSchema,
} from "@/lib/conversation";
import {
  buildEvidence,
  evidenceSchema,
  evidenceInstructions,
  resolveEvidence,
} from "@/lib/evidence-generation";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const started = Date.now();
  let body: unknown;
  try {
    body = await readBody(request, 32768);
  } catch {
    return failure(
      "Invalid request. Send a small JSON question from this site.",
    );
  }
  // Check that the request has the fields and values I expect before using it.
  const parsed = questionSchema.safeParse(body);
  if (!parsed.success) return failure(parsed.error.issues[0].message);
  const { expertId, question, context } = parsed.data;
  const recentConversation = contextForExpert(expertId, context);
  // Start with an empty source list and the insufficient-evidence reply. Fill in the answer if the sources support one.
  const result: AnswerResult = {
    id: crypto.randomUUID(),
    question,
    expertId,
    answer: insufficient,
    sources: [],
    insufficient: true,
    synthetic: demoMode,
    model: "none",
    latencyMs: 0,
    createdAt: new Date().toISOString(),
  };
  // The demo searches fictional notes and returns its result before the live steps.
  if (demoMode) {
    const sources = retrieveDemo(expertId, question);
    if (sources.length) {
      result.sources = sources;
      result.answer = sources
        .map((s, i) => `${s.content} [${i + 1}]`)
        .join("\n\n");
      result.insufficient = false;
      result.model = "synthetic-extractive-demo-v1";
    }
    result.latencyMs = Date.now() - started;
    return Response.json(result);
  }
  try {
    // In live mode, use the signed-in visitor's database connection and check who is asking.
    const db = await serverDb();
    if (!db)
      return failure(
        "Live guidance is not configured. Please contact the project administrator.",
        503,
      );
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) return failure("Sign in before asking a live question.", 401);
    // Ask the database whether this account has another question available within its usage limit.
    const { data: allowed, error: limitError } =
      await db.rpc("reserve_question");
    if (limitError)
      return failure("Question service unavailable. Please try later.", 503);
    if (!allowed)
      return failure(
        "You have reached the limit of 10 questions per hour. Please try later.",
        429,
      );
    // Use the expert ID from the form to look up the real collection and its status.
    const { data: expert, error: expertError } = await db
      .from("experts")
      .select("name,field,status,synthetic")
      .eq("id", expertId)
      .single();
    if (expertError || !expert)
      return failure("This expert collection could not be found.", 404);
    if (!process.env.OPENAI_API_KEY)
      return failure("The answer service has not been configured.", 503);
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    const client = new OpenAI({ timeout: 30000, maxRetries: 1 });
    let standaloneQuestion = question;
    let queries: string[] = [];
    if (expert.status === "available" && !expert.synthetic) {
      // This first model request prepares words to search for. It does not write the final guidance.
      const planning = await client.responses.parse({
        model,
        store: false,
        max_output_tokens: 700,
        instructions: plannerInstructionsFor(recentConversation),
        input: JSON.stringify({
          selectedExpert: expert.name,
          collectionField: expert.field,
          question,
          recentConversation,
        }),
        text: {
          format: zodTextFormat(
            mayClarify(recentConversation)
              ? searchPlanSchema
              : searchOnlySchema,
            "guidance_search",
          ),
        },
      });
      const plan =
        planning.status === "completed"
          ? checkedPlan(planning.output_parsed)
          : null;
      if (!plan || (!mayClarify(recentConversation) && plan.needsClarification))
        return failure(
          "I couldn’t understand that request just now. Please try again.",
          503,
        );
      // If the question needs more detail and we can ask a follow-up, return that question to the chat.
      if (plan.needsClarification) {
        // Clarifications are conversational prompts, not sourced guidance records.
        return Response.json({
          ...result,
          kind: "clarification",
          answer: plan.clarification,
          model,
          latencyMs: Date.now() - started,
        });
      }
      standaloneQuestion = plan.standaloneQuestion;
      queries = collectionQueries(plan.queries, expert.name);
    }
    // Try the original question and the planned searches. The database gives us matching pieces of source text.
    const sources = await retrieveWithPlan(
      question,
      queries,
      async (search_text) => {
        // Give the SQL search the selected expert and one search phrase so it can look in the right collection.
        const { data, error } = await db.rpc("retrieve_passages", {
          selected_expert: expertId,
          search_text,
        });
        if (error) throw new Error("RETRIEVAL_UNAVAILABLE");
        return (data ?? []) as Source[];
      },
    );
    if (sources.length) {
      // Label the text excerpts so the model can point to a specific one for each claim.
      const evidence = buildEvidence(sources);
      // Ask the model to write using the evidence. The helper can retry once if the reply fails validation.
      const outcome = await checkedGeneration(
        sources,
        async (repair, feedback) => {
          const response = await client.responses.parse({
            model,
            store: false,
            max_output_tokens: 2800,
            instructions:
              guidanceInstructions +
              "\n" +
              evidenceInstructions +
              (repair
                ? " A previous response failed validation. Use only supplied evidence IDs, non-empty text without citation markers, and claims supported by the selected evidence. If evidence is insufficient, set sufficient=false and claims=[]."
                : ""),
            input: JSON.stringify({
              question,
              standaloneQuestion,
              selectedExpert: expert.name,
              recentConversation,
              evidence,
              validationFeedback: feedback,
              passages: sources.map((s, i) => ({
                index: i + 1,
                content: s.content,
              })),
            }),
            text: {
              format: zodTextFormat(evidenceSchema, "grounded_guidance"),
            },
          });
          if (response.status !== "completed")
            console.info("guidance_response", { status: response.status });
          return response.status === "completed"
            ? resolveEvidence(response.output_parsed, evidence)
            : null;
        },
        (event) => {
          console.info("guidance_validation", event);
        },
      );
      result.model = model;
      console.info("guidance_outcome", {
        status: outcome.status,
        sourceCount: sources.length,
      });
      // If the output still fails, tell the student the service could not verify the reply.
      if (outcome.status === "validation_failed")
        return failure(
          "Relevant sources were found, but the answer could not be verified. Please try again.",
          503,
        );
      // Put the source numbers beside the accepted claims and include the passages in the result.
      if (outcome.status === "verified") {
        const generated = outcome.generated;
        result.answer = generated.claims
          .map((c) => `${c.text} [${c.sourceIndex}]`)
          .join("\n\n");
        result.sources = sources;
        result.insufficient = false;
      }
    }
    if (!sources.length)
      console.info("guidance_outcome", {
        status: "no_sources",
        sourceCount: 0,
      });
    result.latencyMs = Date.now() - started;
    // Save the question, answer and source links together so the student can open them again.
    const { data: stored, error: storeError } = await db.rpc("store_guidance", {
      selected_expert: expertId,
      question_text: standaloneQuestion,
      answer_text: result.answer,
      used_model: result.model,
      latency: result.latencyMs,
      is_insufficient: result.insufficient,
      source_ids: result.sources.map((s) => s.id),
    });
    if (storeError) {
      // Never log question/answer text or database details containing user data.
      console.error("guidance_storage_failed", {
        code: storeError.code,
        sourceCount: result.sources.length,
      });
      return failure("Your answer could not be saved. Please try again.", 503);
    }
    // Use the database ID for this answer before sending it back to the browser.
    result.id = stored;
    return Response.json(result);
  } catch {
    return failure(
      "The guidance service is temporarily unavailable. Please try again shortly.",
      503,
    );
  }
}
