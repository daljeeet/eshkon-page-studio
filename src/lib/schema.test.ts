import { describe, it, expect } from "vitest";
import { pageSchema } from "./schema";

const validPage = {
  pageId: "p1",
  slug: "home",
  title: "Home",
  sections: [
    { id: "hero-1", type: "hero", props: { heading: "Hi" } },
    { id: "cta-1", type: "cta", props: { label: "Go", url: "https://x.com" } },
  ],
};

describe("pageSchema", () => {
  it("accepts a valid page", () => {
    expect(pageSchema.safeParse(validPage).success).toBe(true);
  });

  it("rejects an unknown section type", () => {
    const bad = { ...validPage, sections: [{ id: "x", type: "banner", props: {} }] };
    expect(pageSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects sections that are not an array", () => {
    const bad = { ...validPage, sections: "not-an-array" };
    expect(pageSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a section missing an id", () => {
    const bad = { ...validPage, sections: [{ type: "hero", props: {} }] };
    expect(pageSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects props that are not an object", () => {
    const bad = { ...validPage, sections: [{ id: "h", type: "hero", props: "hello" }] };
    expect(pageSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a page missing required top-level fields", () => {
    expect(pageSchema.safeParse({ slug: "home" }).success).toBe(false);
  });
});
