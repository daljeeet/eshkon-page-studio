import { sectionRegistry } from "@/lib/section-registry";
import { UnsupportedSection } from "./sections/unsupported-section";
import type { Section } from "@/lib/schema";

export function SectionRenderer({ section }: { section: Section }) {
  const Comp = sectionRegistry[section.type];
  if (!Comp) return <UnsupportedSection type={section.type} />;
  return <Comp {...section.props} />;
}
