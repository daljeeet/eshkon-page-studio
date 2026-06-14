import type { ComponentType } from "react";
import type { SectionType } from "./schema";
import { Hero } from "@/components/sections";
import { FeatureGrid } from "@/components/sections";
import { Testimonial } from "@/components/sections";
import { Cta } from "@/components/sections";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sectionRegistry: Record<SectionType, ComponentType<any>> = {
  hero: Hero,
  featureGrid: FeatureGrid,
  testimonial: Testimonial,
  cta: Cta,
};