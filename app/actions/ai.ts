"use server";

import { generateAiResponse } from "@/lib/ai/generator";
import { aiPromptSchema, type AiPromptInput, type AiStructuredResponse } from "@/lib/validators/ai";

export type GenerateAiActionResult =
  | {
      success: true;
      data: AiStructuredResponse;
    }
  | {
      success: false;
      error: string;
    };

export async function generateCaseStudyContentAction(
  input: AiPromptInput,
): Promise<GenerateAiActionResult> {
  const parsed = aiPromptSchema.safeParse(input);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid input";
    return {
      success: false,
      error: firstIssue,
    } as const;
  }

  try {
    const result = await generateAiResponse(parsed.data);
    return {
      success: true,
      data: result,
    } as const;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate content",
    } as const;
  }
}
