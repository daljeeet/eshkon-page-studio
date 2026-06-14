import { promises as fs } from "fs";
import path from "path";
import type { Page } from "./schema";
import type { Bump } from "./semver";

const ROOT = path.join(process.cwd(), "releases");

export interface Snapshot {
  version: string;
  slug: string;
  publishedAt: string;
  bump: Bump;
  changelog: string[];
  page: Page;
}

function dirFor(slug: string) {
  return path.join(ROOT, slug);
}

/** Sort descending so index 0 is the highest version. */
function compareVersionsDesc(a: string, b: string) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pb[i] ?? 0) !== (pa[i] ?? 0)) return (pb[i] ?? 0) - (pa[i] ?? 0);
  }
  return 0;
}

/** Read the latest immutable snapshot for a slug, or null if none exist. */
export async function getLatestSnapshot(slug: string): Promise<Snapshot | null> {
  try {
    const dir = dirFor(slug);
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
    if (!files.length) return null;
    const versions = files.map((f) => f.replace(/\.json$/, "")).sort(compareVersionsDesc);
    const raw = await fs.readFile(path.join(dir, `${versions[0]}.json`), "utf8");
    return JSON.parse(raw) as Snapshot;
  } catch {
    return null;
  }
}
export async function writeSnapshot(snapshot: Snapshot): Promise<void> {
  const dir = dirFor(snapshot.slug);
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${snapshot.version}.json`);
  try {
    await fs.access(file);
    throw new Error(`Version ${snapshot.version} already exists and is immutable`);
  } catch (e) {
    if (e instanceof Error && e.message.includes("immutable")) throw e;
  }
  await fs.writeFile(file, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
}
