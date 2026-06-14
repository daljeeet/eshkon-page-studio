"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSectionProps } from "@/store/draftPageSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SectionEditor() {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((s) => s.ui.selectedSectionId);
  const section = useAppSelector((s) =>
    s.draftPage.page?.sections.find((sec) => sec.id === selectedId),
  );

  if (!section) {
    return (
      <p className="text-sm text-muted-foreground">Select a section to edit.</p>
    );
  }

  const update = (props: Record<string, unknown>) =>
    dispatch(updateSectionProps({ id: section.id, props }));

  return (
    <div className="space-y-4 border-t pt-4">
      <h2 className="font-semibold">Edit {section.type}</h2>

      {section.type === "hero" && (
        <>
          <div className="space-y-1">
            <Label htmlFor="hero-heading">Heading</Label>
            <Input
              id="hero-heading"
              value={(section.props.heading as string) ?? ""}
              onChange={(e) => update({ heading: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hero-sub">Subheading</Label>
            <Input
              id="hero-sub"
              value={(section.props.subheading as string) ?? ""}
              onChange={(e) => update({ subheading: e.target.value })}
            />
          </div>
        </>
      )}

      {section.type === "cta" && (
        <>
          <div className="space-y-1">
            <Label htmlFor="cta-heading">Heading</Label>
            <Input
              id="cta-heading"
              value={(section.props.heading as string) ?? ""}
              onChange={(e) => update({ heading: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cta-label">Button label</Label>
            <Input
              id="cta-label"
              value={(section.props.label as string) ?? ""}
              onChange={(e) => update({ label: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cta-url">Button URL</Label>
            <Input
              id="cta-url"
              type="url"
              value={(section.props.url as string) ?? ""}
              onChange={(e) => update({ url: e.target.value })}
            />
          </div>
        </>
      )}

      {section.type !== "hero" && section.type !== "cta" && (
        <p className="text-sm text-muted-foreground">
          Editing is limited to Hero CTA.
        </p>
      )}
    </div>
  );
}
