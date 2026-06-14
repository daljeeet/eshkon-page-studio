import { testimonialPropsSchema } from "@/lib/sectionProps";
import { InvalidSection } from "./InvalidSection";

export const Testimonial = ({ raw }: { raw: Record<string, unknown> }) => {
  const parsed = testimonialPropsSchema.safeParse(raw);
  if (!parsed.success) return <InvalidSection type="testimonial" />;
  const { quote, author, role } = parsed.data;

  return (
    <section className="bg-muted/40 py-20">
      <figure className="mx-auto max-w-3xl px-6 text-center">
        <blockquote className="text-balance text-2xl font-medium leading-relaxed text-foreground sm:text-3xl">
          <span aria-hidden="true" className="text-primary">
            “
          </span>
          {quote}
          <span aria-hidden="true" className="text-primary">
            ”
          </span>
        </blockquote>
        <figcaption className="mt-8 flex items-center justify-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary"
          >
            {author.charAt(0)}
          </span>
          <span className="text-left">
            <span className="block font-semibold text-foreground">
              {author}
            </span>
            {role && (
              <span className="block text-sm text-muted-foreground">
                {role}
              </span>
            )}
          </span>
        </figcaption>
      </figure>
    </section>
  );
};
