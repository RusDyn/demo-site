import { z } from "zod";

const optionalTrimmedString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `Must be at least ${min} characters long`)
    .max(max, `Must be at most ${max} characters long`);

const optionalNullableString = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Must not be empty")
    .max(max, `Must be at most ${max} characters long`)
    .nullable()
    .optional();

export const caseStudySectionInputSchema = z.object({
  id: z.string().optional(),
  title: optionalTrimmedString(1, 200),
  content: z.string().min(1, "Section body is required"),
  position: z.number().int().min(0, "Section order must be zero or positive"),
});

export const caseStudyMutationSchema = z
  .object({
    id: z.string().optional(),
    slug: optionalTrimmedString(1, 120),
    title: optionalTrimmedString(1, 200),
    audience: optionalNullableString(200),
    summary: z
      .string()
      .trim()
      .max(2000, "Summary is too long")
      .nullable()
      .optional(),
    headline: optionalNullableString(200),
    background: z
      .string()
      .trim()
      .max(5000, "Background is too long")
      .nullable()
      .optional(),
    results: z
      .string()
      .trim()
      .max(5000, "Results content is too long")
      .nullable()
      .optional(),
    heroAssetId: z.string().nullable().optional(),
    assetIds: z.array(z.string()).optional(),
    sections: z.array(caseStudySectionInputSchema).default([]),
  })
  .superRefine((value, ctx) => {
    const ids = new Set<string>();
    for (const section of value.sections) {
      if (section.id) {
        if (ids.has(section.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Section identifiers must be unique",
            path: ["sections"],
          });
          break;
        }
        ids.add(section.id);
      }
    }
  });

export const caseStudySectionSchema = z.object({
  id: z.string(),
  caseStudyId: z.string(),
  title: z.string(),
  content: z.string(),
  position: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const caseStudyAssetSchema = z.object({
  id: z.string(),
  caseStudyId: z.string().nullable(),
  bucket: z.string(),
  path: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const caseStudyAssetCreateSchema = caseStudyAssetSchema.pick({
  caseStudyId: true,
  bucket: true,
  path: true,
  name: true,
  mimeType: true,
  size: true,
});

export const caseStudySummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const caseStudyDetailSchema = caseStudySummarySchema.extend({
  audience: z.string().nullable(),
  headline: z.string().nullable(),
  background: z.string().nullable(),
  results: z.string().nullable(),
  heroAssetId: z.string().nullable(),
  heroAsset: caseStudyAssetSchema.nullable(),
  sections: z.array(caseStudySectionSchema),
  assets: z.array(caseStudyAssetSchema),
});

export type CaseStudyMutationInput = z.infer<typeof caseStudyMutationSchema>;
export type CaseStudySectionInput = z.infer<typeof caseStudySectionInputSchema>;
export type CaseStudySummary = z.infer<typeof caseStudySummarySchema>;
export type CaseStudyDetail = z.infer<typeof caseStudyDetailSchema>;
export type CaseStudyAsset = z.infer<typeof caseStudyAssetSchema>;
export type CaseStudyAssetCreateInput = z.infer<typeof caseStudyAssetCreateSchema>;
