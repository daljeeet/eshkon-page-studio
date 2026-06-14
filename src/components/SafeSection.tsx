import { sectionSchema } from "@/lib/schema";
import { SectionRenderer } from "./section-renderer";
import { SectionErrorBoundary } from "./SectionErrorBoundary";
import { UnsupportedSection } from "./sections/unsupported-section";
import { InvalidSection } from "./sections/InvalidSection";

/**
 * Renders one section defensively from raw (unvalidated) data:
 *   - invalid / unsupported shape → UnsupportedSection (never throws, never blanks the page)
 *   - valid section → SectionRenderer, wrapped in an error boundary so a render
 *     throw degrades to a fallback for this section only.
 */
export function SafeSection({ data }: { data: unknown }) {
  const parsed = sectionSchema.safeParse(data);

  if (!parsed.success) {
    const type =
      data &&
      typeof data === "object" &&
      "type" in data &&
      typeof (data as { type: unknown }).type === "string"
        ? (data as { type: string }).type
        : "unknown";
    return <UnsupportedSection type={type} />;
  }

  return (
    <SectionErrorBoundary fallback={<InvalidSection type={parsed.data.type} />}>
      <SectionRenderer section={parsed.data} />
    </SectionErrorBoundary>
  );
}
