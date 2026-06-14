import type { Page } from "./schema";

export type Bump = "none" | "patch" | "minor" | "major";

const ORDER: Record<Bump, number> = { none: 0, patch: 1, minor: 2, major: 3 };

export interface DiffResult {
  bump: Bump;
  /** Human-readable, deterministic list of what changed. */
  changes: string[];
}

/**
 * Deterministic diff between two page versions, following the brief's fixed rules:
 *   - major → remove section / change type / remove (break) a required prop
 *   - minor → add section / add a prop
 *   - patch → text/prop value change (or reorder / title change)
 * The result is order-independent w.r.t. how sections are listed, so the same
 * pair of pages always yields the same bump (idempotent input → "none").
 */
export function diffPages(prev: Page | null, next: Page): DiffResult {
  if (!prev) {
    return { bump: "minor", changes: ["initial release"] };
  }

  const changes: string[] = [];
  let bump: Bump = "none";
  const raise = (b: Bump, msg: string) => {
    if (ORDER[b] > ORDER[bump]) bump = b;
    changes.push(`[${b}] ${msg}`);
  };

  const prevById = new Map(prev.sections.map((s) => [s.id, s]));
  const nextById = new Map(next.sections.map((s) => [s.id, s]));

  // Removed sections → major
  for (const [id, ps] of prevById) {
    if (!nextById.has(id)) raise("major", `removed section "${id}" (${ps.type})`);
  }
  // Added sections → minor
  for (const [id, ns] of nextById) {
    if (!prevById.has(id)) raise("minor", `added section "${id}" (${ns.type})`);
  }
  // Sections present in both → compare type + props
  for (const [id, ns] of nextById) {
    const ps = prevById.get(id);
    if (!ps) continue;

    if (ps.type !== ns.type) {
      raise("major", `changed type of "${id}": ${ps.type} → ${ns.type}`);
      continue; // a type change makes prop comparison meaningless
    }

    const prevKeys = Object.keys(ps.props);
    const nextKeys = Object.keys(ns.props);
    for (const k of prevKeys) {
      if (!nextKeys.includes(k)) raise("major", `removed prop "${k}" from "${id}"`);
    }
    for (const k of nextKeys) {
      if (!prevKeys.includes(k)) raise("minor", `added prop "${k}" to "${id}"`);
    }
    for (const k of nextKeys) {
      if (
        prevKeys.includes(k) &&
        JSON.stringify(ps.props[k]) !== JSON.stringify(ns.props[k])
      ) {
        raise("patch", `changed prop "${k}" in "${id}"`);
      }
    }
  }

  // Reorder (same set of ids, different sequence) → patch
  const prevOrder = prev.sections.map((s) => s.id);
  const nextOrder = next.sections.map((s) => s.id);
  if (
    prevOrder.length === nextOrder.length &&
    prevOrder.slice().sort().join() === nextOrder.slice().sort().join() &&
    prevOrder.join() !== nextOrder.join()
  ) {
    raise("patch", "reordered sections");
  }

  // Title change → patch
  if (prev.title !== next.title) raise("patch", "changed page title");

  return { bump, changes };
}

/** Compute the next semantic version string from a bump. */
export function nextVersion(current: string, bump: Bump): string {
  const [maj, min, pat] = current.split(".").map(Number);
  switch (bump) {
    case "major":
      return `${maj + 1}.0.0`;
    case "minor":
      return `${maj}.${min + 1}.0`;
    case "patch":
      return `${maj}.${min}.${pat + 1}`;
    default:
      return current; // "none" is idempotent — no version change
  }
}
