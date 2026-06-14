import Link from "next/link";
import { getAllSlugs } from "@/lib/contentfulClient";

export default async function HomePage() {
  const slugs = await getAllSlugs();

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Page Studio</h1>
        <p className="text-sm text-muted-foreground">
          Pages are loaded from Contentful. Pick one to preview or edit.
        </p>
      </header>

      {slugs.length === 0 ? (
        <p className="text-muted-foreground">
          No published pages found in Contentful. Create a <code>page</code> entry
          with a <code>slug</code> and publish it.
        </p>
      ) : (
        <ul className="space-y-2">
          {slugs.map((slug) => (
            <li
              key={slug}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="font-medium">/{slug}</span>
              <span className="flex gap-4 text-sm">
                <Link
                  className="underline focus-visible:outline-2"
                  href={`/preview/${slug}`}
                >
                  Preview
                </Link>
                <Link
                  className="underline focus-visible:outline-2"
                  href={`/studio/${slug}`}
                >
                  Studio
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/roles"
        className="inline-block text-sm text-muted-foreground underline focus-visible:outline-2"
      >
        Switch role
      </Link>
    </main>
  );
}
