import type { ComponentType } from "react";
import type { SectionType } from "./schema";
import { Hero } from "@/components/sections/Hero";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { Testimonial } from "@/components/sections/Testimonial";
import { Cta } from "@/components/sections/Cta";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sectionRegistry: Record<SectionType, ComponentType<any>> = {
  hero: Hero,
  featureGrid: FeatureGrid,
  testimonial: Testimonial,
  cta: Cta,
};