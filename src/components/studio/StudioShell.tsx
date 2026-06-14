"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { SectionList } from "./SectionList";
import { SectionEditor } from "./SectionEditor";
import { PublishPanel } from "./PublishPanel";
import { SectionRenderer } from "@/components/section-renderer";
import type { Role } from "@/lib/rbac";

export const StudioShell = ({ role }: { role: Role }) => {
  const page = useAppSelector((s) => s.draftPage.page);
  if (!page) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 p-6">
      <aside aria-label="Editor" className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold">Editing: {page.title}</h1>
          <Link
            href="/roles"
            className="text-sm underline text-muted-foreground focus-visible:outline-2"
          >
            Role: {role}
          </Link>
        </div>
        <SectionList />
        <SectionEditor />
        <PublishPanel role={role} />
      </aside>

      <section
        aria-label="Live preview"
        className="border rounded-lg overflow-auto"
      >
        {page.sections.map((s) => (
          <SectionRenderer key={s.id} section={s} />
        ))}
      </section>
    </div>
  );
};
