"use client";

import { useState, useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";
import { setPage } from "./draftPageSlice";
import { pageSchema, type Page } from "@/lib/schema";

function storageKey(slug: string) {
  return `draft:${slug}`;
}

export function StoreProvider({
  slug,
  initialPage,
  children,
}: {
  slug: string;
  initialPage: Page;
  children: React.ReactNode;
}) {
  // Deterministic: server AND client both start from initialPage → no hydration mismatch.
  const [store] = useState(() => {
    const s = makeStore();
    s.dispatch(setPage(initialPage));
    return s;
  });

  // AFTER mount (client only): overlay any persisted draft.
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = window.localStorage.getItem(storageKey(slug));
    if (saved) {
      try {
        const parsed = pageSchema.safeParse(JSON.parse(saved));
        if (parsed.success) store.dispatch(setPage(parsed.data));
      } catch {
        /* corrupt JSON — ignore, keep server page */
      }
    }
  }, [store, slug]);

  // Persist draftPage on every change.
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const { page } = store.getState().draftPage;
      if (page) {
        window.localStorage.setItem(storageKey(slug), JSON.stringify(page));
      }
    });
    return unsubscribe;
  }, [store, slug]);

  return <Provider store={store}>{children}</Provider>;
}
