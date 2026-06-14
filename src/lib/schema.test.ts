import { describe, it, expect } from "vitest";
import { pageSchema, pageEnvelopeSchema, sectionSchema } from "./schema";

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

describe("resilient rendering contract", () => {
  const withBadSection = {
    pageId: "p1",
    slug: "home",
    title: "Home",
    sections: [
      { id: "hero-1", type: "hero", props: { heading: "Hi" } },
      { id: "bad-1", type: "carousel", props: {} }, // unsupported type
    ],
  };

  it("strict pageSchema rejects a page containing an unsupported section", () => {
    expect(pageSchema.safeParse(withBadSection).success).toBe(false);
  });

  it("lenient envelope still accepts it (sections validated per-item later)", () => {
    expect(pageEnvelopeSchema.safeParse(withBadSection).success).toBe(true);
  });

  it("per-section schema flags the unsupported section so it can fall back", () => {
    const [good, bad] = withBadSection.sections;
    expect(sectionSchema.safeParse(good).success).toBe(true);
    expect(sectionSchema.safeParse(bad).success).toBe(false);
  });
});
