import { heroPropsSchema } from "@/lib/sectionProps";
import { InvalidSection } from "./InvalidSection";

export const Hero = ({ raw }: { raw: Record<string, unknown> }) => {
  const parsed = heroPropsSchema.safeParse(raw);
  if (!parsed.success) return <InvalidSection type="hero" />;
  const { eyebrow, heading, subheading } = parsed.data;

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-primary/5 via-background to-background">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
        {eyebrow && (
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          {heading}
        </h2>
        {subheading && (
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {subheading}
          </p>
        )}
      </div>
    </section>
  );
};
