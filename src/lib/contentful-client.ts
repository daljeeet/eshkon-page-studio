import { createClient } from "contentful";

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
  const res = await client(preview).getEntries({
    content_type: "page",
    "fields.slug": slug,
    limit: 1,
  });
  const entry = res.items[0];
  if (!entry) return null;
  const f = entry.fields as Record<string, unknown>;
  return {
    pageId: entry.sys.id,
    slug: f.slug,
    title: f.title,
    sections: f.sections ?? [],
  };
}