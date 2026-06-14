import { z } from "zod";

export const heroPropsSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string(),
  subheading: z.string().optional(),
});

export const featureGridPropsSchema = z.object({
  heading: z.string().optional(),
  features: z
    .array(z.object({ title: z.string(), body: z.string() }))
    .default([]),
});

export const testimonialPropsSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
});

export const ctaPropsSchema = z.object({
  heading: z.string().optional(),
  label: z.string(),
  url: z.string().url(),
});

export type HeroProps = z.infer<typeof heroPropsSchema>;
export type FeatureGridProps = z.infer<typeof featureGridPropsSchema>;
export type TestimonialProps = z.infer<typeof testimonialPropsSchema>;
export type CtaProps = z.infer<typeof ctaPropsSchema>;