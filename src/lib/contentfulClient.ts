import { createClient } from "contentful";
import { mockPage } from "./mockContent";

function client(preview: boolean) {
  return createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
    accessToken: preview
      ? process.env.CONTENTFUL_PREVIEW_TOKEN!
      : process.env.CONTENTFUL_DELIVERY_TOKEN!,
    host: preview ? "preview.contentful.com" : "cdn.contentful.com",
  });
}


export async function getPage(slug: string, preview = false): Promise<unknown> {
  if (process.env.USE_MOCK_CONTENT === "true") {
    return mockPage(slug);
  }

  const res = await client(preview).getEntries({
    content_type: "page",
    "fields.slug": slug,
    limit: 1,
  });
  const entry = res.items[0];
  if (!entry) return null;
  const f = entry.fields as Record<string, unknown>;

  let sections: unknown = f.sections ?? [];
  if (typeof sections === "string") {
    try {
      sections = JSON.parse(sections);
    } catch {
      sections = [];
    }
  }

  return {
    pageId: entry.sys.id,
    slug: f.slug,
    title: f.title,
    sections,
  };
}

/**
 * Lists the slugs of all published pages, so the app can discover pages
 * dynamically instead of hard-coding any single slug.
 */
export async function getAllSlugs(): Promise<string[]> {
  if (process.env.USE_MOCK_CONTENT === "true") {
    return ["hello"];
  }

  try {
    const res = await client(false).getEntries({
      content_type: "page",
      limit: 1000,
    });
    return res.items
      .map((entry) => (entry.fields as { slug?: unknown }).slug)
      .filter((slug): slug is string => typeof slug === "string");
  } catch {
    return [];
  }
}