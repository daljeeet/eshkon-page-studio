"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addSection,
  removeSection,
  reorderSection,
} from "@/store/draftPageSlice";
import { selectSection } from "@/store/uiSlice";
import type { SectionType } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPES: SectionType[] = ["hero", "featureGrid", "testimonial", "cta"];

export const SectionList = () => {
  const dispatch = useAppDispatch();
  const sections = useAppSelector((s) => s.draftPage.page?.sections ?? []);
  const selectedId = useAppSelector((s) => s.ui.selectedSectionId);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select onValueChange={(v) => dispatch(addSection(v as SectionType))}>
          <SelectTrigger aria-label="Add section" className="p-2 w-full">
            <SelectValue placeholder="Add section…" />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ul className="space-y-2">
        {sections.map((s, i) => (
          <li
            key={s.id}
            className={`flex items-center gap-2 rounded border p-2 ${
              selectedId === s.id ? "ring ring-primary" : ""
            }`}
          >
            <button
              className="flex-1 text-left focus-visible:outline cursor-pointer"
              onClick={() => dispatch(selectSection(s.id))}
              aria-pressed={selectedId === s.id}
            >
              {i + 1}. {s.type}
            </button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Move ${s.type} up`}
              disabled={i === 0}
              onClick={() => dispatch(reorderSection({ from: i, to: i - 1 }))}
            >
              ↑
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Move ${s.type} down`}
              disabled={i === sections.length - 1}
              onClick={() => dispatch(reorderSection({ from: i, to: i + 1 }))}
            >
              ↓
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove ${s.type}`}
              onClick={() => dispatch(removeSection(s.id))}
            >
              ✕
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
