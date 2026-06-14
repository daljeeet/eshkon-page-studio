import { sectionRegistry } from "@/lib/sectionRegistry";
import { UnsupportedSection } from "./sections/unsupported-section";
import type { Section } from "@/lib/schema";

export function SectionRenderer({ section }: { section: Section }) {
  const Comp = sectionRegistry[section.type];
  if (!Comp) return <UnsupportedSection type={section.type} />;
  return <Comp raw={section.props} />;
}
