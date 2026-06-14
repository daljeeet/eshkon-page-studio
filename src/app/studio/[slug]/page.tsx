import { cookies } from "next/headers";
import { getPage } from "@/lib/contentfulClient";
import { pageSchema } from "@/lib/schema";
import { getRole } from "@/lib/rbac";
import { StoreProvider } from "@/store/StoreProvider";
import { StudioShell } from "@/components/studio/StudioShell";

export default async function StudioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = getRole((await cookies()).get("role")?.value);
  const raw = await getPage(slug, false);
  const parsed = pageSchema.safeParse(raw);
  if (!parsed.success) {
    return (
      <main role="alert" className="p-8">
        Could not load a valid page for “{slug}”.
      </main>
    );
  }

  return (
    <StoreProvider slug={slug} initialPage={parsed.data}>
      <StudioShell role={role} />
    </StoreProvider>
  );
}
