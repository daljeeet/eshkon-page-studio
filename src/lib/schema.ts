import { z } from "zod";

export const heroProps = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
});
export const ctaProps = z.object({
  label: z.string(),
  url: z.string().url(),
});
export const featureGridProps = z.object({
  features: z.array(z.object({ title: z.string(), body: z.string() })),
});
export const testimonialProps = z.object({
  quote: z.string(),
  author: z.string(),
});

export const sectionSchema = z.discriminatedUnion("type", [
  z.object({ id: z.string(), type: z.literal("hero"), props: heroProps }),
  z.object({ id: z.string(), type: z.literal("featureGrid"), props: featureGridProps }),
  z.object({ id: z.string(), type: z.literal("testimonial"), props: testimonialProps }),
  z.object({ id: z.string(), type: z.literal("cta"), props: ctaProps }),
]);

export const pageSchema = z.object({
  pageId: z.string(),
  slug: z.string(),
  title: z.string(),
  sections: z.array(sectionSchema),
});

export type Section = z.infer<typeof sectionSchema>;
export type Page = z.infer<typeof pageSchema>;
export type SectionType = Section["type"];