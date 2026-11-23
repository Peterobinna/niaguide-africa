import { z } from "zod";

// Keep short follow-ups valid everywhere that handles a question.
export const MIN_QUESTION_LENGTH = 2;
export const MAX_QUESTION_LENGTH = 1200;
export const questionTextSchema = z
  .string()
  .max(MAX_QUESTION_LENGTH, "Keep your question at 1,200 characters or fewer.")
  .transform((text) => text.replace(/[\u0000-\u001f\u007f]/g, " ").trim())
  // PostgreSQL counts a supplementary Unicode character once, not twice.
  .refine((text) => Array.from(text).length >= MIN_QUESTION_LENGTH, "Please enter at least 2 characters.");
