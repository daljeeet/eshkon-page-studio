import { getPage } from "@/lib/contentfulClient";
import { pageSchema } from "@/lib/schema";
import { SectionRenderer } from "@/components/section-renderer";

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;

  // `?preview=true` switches the adapter to the Contentful Preview API (drafts).
  const raw = await getPage(slug, preview === "true");
  const parsed = pageSchema.safeParse(raw);

  // Invalid / missing schema → graceful message, never a crash.
  if (!parsed.success) {
    return (
      <main role="alert" className="mx-auto max-w-2xl p-12 text-center">
        <h1 className="text-2xl font-bold text-foreground">Page unavailable</h1>
        <p className="mt-2 text-muted-foreground">
          The content for “{slug}” is missing or invalid and cannot be
          displayed.
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="sr-only">{parsed.data.title}</h1>
      {parsed.data.sections.map((s) => (
        <SectionRenderer key={s.id} section={s} />
      ))}
    </main>
  );
}
