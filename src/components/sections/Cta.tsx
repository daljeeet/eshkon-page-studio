import { ctaPropsSchema } from "@/lib/sectionProps";
import { InvalidSection } from "./InvalidSection";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Cta = ({ raw }: { raw: Record<string, unknown> }) => {
  const parsed = ctaPropsSchema.safeParse(raw);
  if (!parsed.success) return <InvalidSection type="cta" />;
  const { heading, label, url } = parsed.data;

  return (
    <section className="mx-auto my-16 max-w-5xl px-6">
      <div className="rounded-2xl bg-primary px-8 py-14 text-center text-primary-foreground">
        {heading && (
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {heading}
          </h2>
        )}
        <div className="mt-8">
          {/* A real anchor styled as a button: valid HTML + keyboard/AT operable. */}
          <a
            href={url}
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "text-base font-semibold",
            )}
          >
            {label}
          </a>
        </div>
      </div>
    </section>
  );
};
