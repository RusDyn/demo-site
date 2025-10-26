import type { ResponseStream } from "openai/lib/responses/ResponseStream";

import { getOpenAIClient } from "@/lib/openai";
import {
  aiPartialResponseSchema,
  aiPromptSchema,
  aiResponseSchema,
  type AiPartialResponse,
  type AiPromptInput,
  type AiPromptType,
  type AiStructuredResponse,
} from "@/lib/validators/ai";

const DEFAULT_MODEL = process.env.OPENAI_RESPONSES_MODEL ?? "gpt-4.1-mini";

interface JsonSchemaConfig {
  name: string;
  schema: Record<string, unknown>;
}

const outlineJsonSchema: JsonSchemaConfig = {
  name: "case_study_outline",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["type", "sections"],
    properties: {
      type: { const: "outline" },
      sections: {
        type: "array",
        minItems: 3,
        maxItems: 8,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "description"],
          properties: {
            title: { type: "string", minLength: 1 },
            description: { type: "string", minLength: 1 },
          },
        },
      },
    },
  },
};

const summaryJsonSchema: JsonSchemaConfig = {
  name: "case_study_summary",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["type", "summary"],
    properties: {
      type: { const: "summary" },
      summary: { type: "string", minLength: 1 },
    },
  },
};

const headlineJsonSchema: JsonSchemaConfig = {
  name: "case_study_headline",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["type", "headline", "variations"],
    properties: {
      type: { const: "headline" },
      headline: { type: "string", minLength: 1 },
      variations: {
        type: "array",
        minItems: 1,
        maxItems: 5,
        items: { type: "string", minLength: 1 },
      },
    },
  },
};

const jsonSchemasByType: Record<AiPromptType, JsonSchemaConfig> = {
  outline: outlineJsonSchema,
  summary: summaryJsonSchema,
  headline: headlineJsonSchema,
};

function buildSystemInstruction(type: AiPromptType): string {
  const shared =
    "You are an editorial assistant helping marketing teams shape polished SaaS case studies. " +
    "Always respond with strict JSON that matches the provided schema. Do not include markdown or prose outside of JSON.";

  switch (type) {
    case "outline":
      return (
        shared +
        " Focus on logical storytelling, capturing the customer's problem, solution, and impact. Provide descriptive section titles." +
        " Keep the outline concise and actionable." 
      );
    case "summary":
      return (
        shared +
        " Craft a tight narrative that highlights the customer's pain, the solution rollout, and measurable business outcomes." +
        " Aim for crisp sentences that can slot into a marketing brief." 
      );
    case "headline":
      return (
        shared +
        " Produce compelling headlines suitable for B2B SaaS audiences. Offer strong leading headline text and punchy alternatives." 
      );
    default:
      return shared;
  }
}

function buildUserPrompt(input: AiPromptInput): string {
  switch (input.type) {
    case "outline": {
      const keyPoints = input.keyPoints?.length ? `\nKey points: ${input.keyPoints.join("; ")}` : "";
      const audience = input.audience ? `\nTarget audience: ${input.audience}` : "";
      const context = input.context ? `\nContext: ${input.context}` : "";
      return `Topic: ${input.topic}${audience}${context}${keyPoints}\nTone: ${input.tone}`;
    }
    case "summary":
      return `Source content:\n${input.source}\nPreferred length: ${input.length}\nTone: ${input.tone}`;
    case "headline": {
      const audience = input.audience ? `\nAudience: ${input.audience}` : "";
      return `Topic: ${input.topic}${audience}\nDesired style: ${input.style}\nVariants: ${input.variantCount}`;
    }
    default:
      return "";
  }
}

function parseStructuredResponse(raw: string): AiStructuredResponse {
  const parsed = JSON.parse(raw) as unknown;
  return aiResponseSchema.parse(parsed);
}

export function extractTextFromFinalResponse(response: { output_text?: string | null }): string {
  if (response.output_text && response.output_text.trim().length > 0) {
    return response.output_text;
  }

  throw new Error("The AI response did not include output_text");
}

export function createAiResponseStream(
  input: AiPromptInput,
  options?: { signal?: AbortSignal },
): Promise<ResponseStream> {
  const parsed = aiPromptSchema.parse(input);
  const client = getOpenAIClient();
  const schema = jsonSchemasByType[parsed.type];

  return Promise.resolve(
    client.responses.stream(
      {
        model: DEFAULT_MODEL,
        instructions: buildSystemInstruction(parsed.type),
        input: buildUserPrompt(parsed),
        text: {
          format: {
            type: "json_schema",
            name: schema.name,
            schema: schema.schema,
          },
        },
      },
      {
        signal: options?.signal,
      },
    ),
  );
}

export async function generateAiResponse(input: AiPromptInput): Promise<AiStructuredResponse> {
  const parsed = aiPromptSchema.parse(input);
  const client = getOpenAIClient();
  const schema = jsonSchemasByType[parsed.type];

  const response = await client.responses.create({
    model: DEFAULT_MODEL,
    instructions: buildSystemInstruction(parsed.type),
    input: buildUserPrompt(parsed),
    text: {
      format: {
        type: "json_schema",
        name: schema.name,
        schema: schema.schema,
      },
    },
  });

  const raw = extractTextFromFinalResponse(response);

  return parseStructuredResponse(raw);
}

export function safeParsePartialSnapshot(snapshot: string): AiPartialResponse | null {
  try {
    const parsed = JSON.parse(snapshot) as unknown;
    return aiPartialResponseSchema.parse(parsed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null;
    }

    throw error;
  }
}

export { parseStructuredResponse };
