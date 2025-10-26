import { z } from "zod";

export const aiPromptTypeSchema = z.enum(["outline", "summary", "headline"]);
export type AiPromptType = z.infer<typeof aiPromptTypeSchema>;

const toneSchema = z.enum(["neutral", "friendly", "professional", "confident"]);

const outlinePromptSchema = z.object({
  type: z.literal("outline"),
  topic: z.string().min(3, "Provide a short topic for the outline"),
  context: z.string().min(1).optional(),
  audience: z.string().min(1).optional(),
  keyPoints: z.array(z.string().min(1)).max(10).optional(),
  tone: toneSchema.optional().default("neutral"),
});

const summaryPromptSchema = z.object({
  type: z.literal("summary"),
  source: z.string().min(10, "Provide a few sentences of source material"),
  length: z.enum(["short", "medium", "long"]).default("medium"),
  tone: toneSchema.optional().default("neutral"),
});

const headlinePromptSchema = z.object({
  type: z.literal("headline"),
  topic: z.string().min(3, "Provide a short topic for the headline"),
  audience: z.string().min(1).optional(),
  style: z.enum(["punchy", "insightful", "formal", "playful"]).default("insightful"),
  variantCount: z.number().int().min(1).max(5).default(3),
});

export const aiPromptSchema = z.discriminatedUnion("type", [
  outlinePromptSchema,
  summaryPromptSchema,
  headlinePromptSchema,
]);

export type AiPromptInput = z.infer<typeof aiPromptSchema>;
export type AiOutlinePromptInput = z.infer<typeof outlinePromptSchema>;
export type AiSummaryPromptInput = z.infer<typeof summaryPromptSchema>;
export type AiHeadlinePromptInput = z.infer<typeof headlinePromptSchema>;

const outlineSectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const outlineResponseSchema = z.object({
  type: z.literal("outline"),
  sections: z.array(outlineSectionSchema).min(1),
});

const summaryResponseSchema = z.object({
  type: z.literal("summary"),
  summary: z.string().min(1),
});

const headlineResponseSchema = z.object({
  type: z.literal("headline"),
  headline: z.string().min(1),
  variations: z.array(z.string().min(1)).min(1),
});

export const aiResponseSchema = z.discriminatedUnion("type", [
  outlineResponseSchema,
  summaryResponseSchema,
  headlineResponseSchema,
]);

export type AiStructuredResponse = z.infer<typeof aiResponseSchema>;
export type AiOutlineResponse = z.infer<typeof outlineResponseSchema>;
export type AiSummaryResponse = z.infer<typeof summaryResponseSchema>;
export type AiHeadlineResponse = z.infer<typeof headlineResponseSchema>;

const outlinePartialSchema = z.object({
  type: z.literal("outline"),
  sections: z.array(outlineSectionSchema.partial()).optional(),
});

const summaryPartialSchema = z.object({
  type: z.literal("summary"),
  summary: z.string().optional(),
});

const headlinePartialSchema = z.object({
  type: z.literal("headline"),
  headline: z.string().optional(),
  variations: z.array(z.string().min(1)).optional(),
});

export const aiPartialResponseSchema = z.discriminatedUnion("type", [
  outlinePartialSchema,
  summaryPartialSchema,
  headlinePartialSchema,
]);

export type AiPartialResponse = z.infer<typeof aiPartialResponseSchema>;

export const aiStreamEventSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("in-progress"),
    type: aiPromptTypeSchema,
    snapshot: aiPartialResponseSchema.optional(),
  }),
  z.object({
    status: z.literal("complete"),
    type: aiPromptTypeSchema,
    result: aiResponseSchema,
  }),
  z.object({
    status: z.literal("error"),
    type: aiPromptTypeSchema,
    message: z.string().min(1),
  }),
]);

export type AiStreamEvent = z.infer<typeof aiStreamEventSchema>;

export type AiPromptOfType<TType extends AiPromptType> = Extract<AiPromptInput, { type: TType }>;
export type AiResponseOfType<TType extends AiPromptType> = Extract<AiStructuredResponse, { type: TType }>;
export type AiPartialOfType<TType extends AiPromptType> = Extract<AiPartialResponse, { type: TType }>;

export { toneSchema as aiToneSchema };
