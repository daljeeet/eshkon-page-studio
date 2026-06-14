import { z } from "zod";

export const SECTION_TYPES = ["hero", "featureGrid", "testimonial", "cta"] as const;

export const sectionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(SECTION_TYPES),
  props: z.record(z.string(), z.unknown()),
});

export const pageSchema = z.object({
  pageId: z.string(),
  slug: z.string(),
  title: z.string(),
  sections: z.array(sectionSchema),
});

export type Section = z.infer<typeof sectionSchema>;
export type Page = z.infer<typeof pageSchema>;
export type SectionType = (typeof SECTION_TYPES)[number];
export const pageEnvelopeSchema = z.object({
  pageId: z.string(),
  slug: z.string(),
  title: z.string(),
  sections: z.array(z.unknown()),
});
export type PageEnvelope = z.infer<typeof pageEnvelopeSchema>;