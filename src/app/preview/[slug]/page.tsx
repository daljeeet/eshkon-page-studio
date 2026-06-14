import Link from "next/link";
import { getPage } from "@/lib/contentfulClient";
import { pageEnvelopeSchema } from "@/lib/schema";
import { SafeSection } from "@/components/SafeSection";

function RolesLink() {
  return (
    <Link
      href="/roles"
      className="fixed right-4 top-4 z-50 rounded-md border bg-background/80 px-3 py-1.5 text-sm font-medium shadow-sm backdrop-blur hover:bg-muted focus-visible:outline-2"
    >
      Switch role
    </Link>
  );
}

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;

  const raw = await getPage(slug, preview === "true");

  const parsed = pageEnvelopeSchema.safeParse(raw);
  if (!parsed.success) {
    return (
      <main role="alert" className="mx-auto max-w-2xl p-12 text-center">
        <RolesLink />
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
      <RolesLink />
      <h1 className="sr-only">{parsed.data.title}</h1>
      {parsed.data.sections.map((s, i) => (
        <SafeSection key={i} data={s} />
      ))}
    </main>
  );
}
