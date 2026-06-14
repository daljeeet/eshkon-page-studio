"use client";

import { useState, useEffect } from "react";
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
  const [store] = useState(() => {
    const s = makeStore();

    let pageToLoad: Page = initialPage;
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(storageKey(slug));
      if (saved) {
        try {
          const parsed = pageSchema.safeParse(JSON.parse(saved));
          if (parsed.success) pageToLoad = parsed.data;
        } catch {}
      }
    }

    s.dispatch(setPage(pageToLoad));
    return s;
  });

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
