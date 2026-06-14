import { featureGridPropsSchema } from "@/lib/sectionProps";
import { InvalidSection } from "./InvalidSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FeatureGrid = ({ raw }: { raw: Record<string, unknown> }) => {
  const parsed = featureGridPropsSchema.safeParse(raw);
  if (!parsed.success) return <InvalidSection type="featureGrid" />;
  const { heading, features } = parsed.data;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      {heading && (
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {heading}
        </h2>
      )}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <li key={i}>
            <Card className="h-full transition-shadow motion-safe:hover:shadow-lg">
              <CardHeader>
                <div
                  aria-hidden="true"
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
                >
                  {i + 1}
                </div>
                <CardTitle className="text-xl">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {f.body}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
};
