"use client";

import { useState } from "react";
import Link from "next/link";
import type { Role } from "@/lib/rbac";

const ROLES: { role: Role; desc: string }[] = [
  { role: "viewer", desc: "Preview only — blocked from the studio." },
  { role: "editor", desc: "Edit drafts in the studio (cannot publish)." },
  { role: "publisher", desc: "Edit drafts and publish versioned releases." },
];

function persistRole(role: Role) {
  document.cookie = `role=${role}; path=/; max-age=31536000`;
}

export function RoleSwitcher({
  current,
  sampleSlug,
}: {
  current: Role;
  sampleSlug?: string;
}) {
  const [active, setActive] = useState<Role>(current);

  const setRole = (role: Role) => {
    persistRole(role);
    setActive(role);
  };

  // Link to a real slug discovered from Contentful; fall back to the home index.
  const studioHref = sampleSlug ? `/studio/${sampleSlug}` : "/";
  const previewHref = sampleSlug ? `/preview/${sampleSlug}` : "/";

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {ROLES.map(({ role, desc }) => (
          <li key={role}>
            <button
              type="button"
              onClick={() => setRole(role)}
              aria-pressed={active === role}
              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                active === role
                  ? "border-primary ring-2 ring-primary"
                  : "hover:bg-muted"
              }`}
            >
              <span className="font-semibold capitalize">{role}</span>
              {active === role && (
                <span className="ml-2 text-xs font-medium text-primary">
                  current
                </span>
              )}
              <span className="mt-1 block text-sm text-muted-foreground">
                {desc}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="text-sm text-muted-foreground">
        Active role: <strong>{active}</strong>. Try{" "}
        <Link className="underline focus-visible:outline-2" href={studioHref}>
          {studioHref}
        </Link>{" "}
        or{" "}
        <Link className="underline focus-visible:outline-2" href={previewHref}>
          {previewHref}
        </Link>
        .
      </p>
    </div>
  );
}
