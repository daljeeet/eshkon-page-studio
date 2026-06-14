import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { pageSchema } from "@/lib/schema";
import { can, getRole } from "@/lib/rbac";
import { diffPages, nextVersion } from "@/lib/semver";
import { getLatestSnapshot, writeSnapshot, type Snapshot } from "@/lib/releases";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const role = getRole((await cookies()).get("role")?.value);
  if (!can.publish(role)) {
    return NextResponse.json(
      { error: "Forbidden: a publisher role is required to publish." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = pageSchema.safeParse(body?.page);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid page payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const page = parsed.data;

  const latest = await getLatestSnapshot(page.slug);
  const { bump, changes } = diffPages(latest?.page ?? null, page);

  // if the draft is unchanged 
  if (bump === "none" && latest) {
    return NextResponse.json({
      version: latest.version,
      bump,
      changelog: latest.changelog,
      idempotent: true,
    });
  }

  const version = latest ? nextVersion(latest.version, bump) : "1.0.0";
  const snapshot: Snapshot = {
    version,
    slug: page.slug,
    publishedAt: new Date().toISOString(),
    bump,
    changelog: changes,
    page,
  };

  try {
    await writeSnapshot(snapshot);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to persist snapshot" },
      { status: 500 },
    );
  }

  return NextResponse.json({ version, bump, changelog: changes, idempotent: false });
}
