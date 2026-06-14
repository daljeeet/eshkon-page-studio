"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSectionProps } from "@/store/draftPageSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Feature {
  title: string;
  body: string;
}

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
          <Field
            id="hero-eyebrow"
            label="Eyebrow"
            value={(section.props.eyebrow as string) ?? ""}
            onChange={(v) => update({ eyebrow: v })}
          />
          <Field
            id="hero-heading"
            label="Heading"
            value={(section.props.heading as string) ?? ""}
            onChange={(v) => update({ heading: v })}
          />
          <Field
            id="hero-sub"
            label="Subheading"
            value={(section.props.subheading as string) ?? ""}
            onChange={(v) => update({ subheading: v })}
          />
        </>
      )}

      {section.type === "cta" && (
        <>
          <Field
            id="cta-heading"
            label="Heading"
            value={(section.props.heading as string) ?? ""}
            onChange={(v) => update({ heading: v })}
          />
          <Field
            id="cta-label"
            label="Button label"
            value={(section.props.label as string) ?? ""}
            onChange={(v) => update({ label: v })}
          />
          <Field
            id="cta-url"
            label="Button URL"
            type="url"
            value={(section.props.url as string) ?? ""}
            onChange={(v) => update({ url: v })}
          />
        </>
      )}

      {section.type === "testimonial" && (
        <>
          <Field
            id="testimonial-quote"
            label="Quote"
            value={(section.props.quote as string) ?? ""}
            onChange={(v) => update({ quote: v })}
          />
          <Field
            id="testimonial-author"
            label="Author"
            value={(section.props.author as string) ?? ""}
            onChange={(v) => update({ author: v })}
          />
          <Field
            id="testimonial-role"
            label="Role"
            value={(section.props.role as string) ?? ""}
            onChange={(v) => update({ role: v })}
          />
        </>
      )}

      {section.type === "featureGrid" && (
        <FeatureGridEditor
          heading={(section.props.heading as string) ?? ""}
          features={(section.props.features as Feature[]) ?? []}
          onChange={update}
        />
      )}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  type = "text",
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function FeatureGridEditor({
  heading,
  features,
  onChange,
}: {
  heading: string;
  features: Feature[];
  onChange: (props: Record<string, unknown>) => void;
}) {
  const setFeature = (index: number, patch: Partial<Feature>) =>
    onChange({
      features: features.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    });
  const addFeature = () =>
    onChange({ features: [...features, { title: "", body: "" }] });
  const removeFeature = (index: number) =>
    onChange({ features: features.filter((_, i) => i !== index) });

  return (
    <>
      <Field
        id="featuregrid-heading"
        label="Heading"
        value={heading}
        onChange={(v) => onChange({ heading: v })}
      />

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Features</legend>
        {features.map((f, i) => (
          <div key={i} className="space-y-2 rounded border p-3">
            <Field
              id={`feature-${i}-title`}
              label={`Feature ${i + 1} title`}
              value={f.title}
              onChange={(v) => setFeature(i, { title: v })}
            />
            <Field
              id={`feature-${i}-body`}
              label={`Feature ${i + 1} body`}
              value={f.body}
              onChange={(v) => setFeature(i, { body: v })}
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              aria-label={`Remove feature ${i + 1}`}
              onClick={() => removeFeature(i)}
            >
              Remove feature
            </Button>
          </div>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={addFeature}>
          Add feature
        </Button>
      </fieldset>
    </>
  );
}
