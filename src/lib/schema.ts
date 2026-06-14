import { z } from "zod";

// The known section types. Kept as a const tuple so we can derive both the
// Zod enum (runtime validation) and the SectionType literal union (compile-time).
export const SECTION_TYPES = ["hero", "featureGrid", "testimonial", "cta"] as const;

// Matches the brief's Section exactly:
//   type: 'hero' | 'featureGrid' | 'testimonial' | 'cta'
//   props: Record<string, unknown>
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