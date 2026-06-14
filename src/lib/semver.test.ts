import { describe, it, expect } from "vitest";
import { diffPages, nextVersion } from "./semver";
import type { Page } from "./schema";

const base: Page = {
  pageId: "p",
  slug: "s",
  title: "T",
  sections: [
    { id: "hero", type: "hero", props: { heading: "A" } },
    { id: "cta", type: "cta", props: { label: "Go", url: "https://x.com" } },
  ],
};

const clone = (p: Page): Page => JSON.parse(JSON.stringify(p));

describe("diffPages", () => {
  it("treats the first release as minor", () => {
    expect(diffPages(null, base).bump).toBe("minor");
  });

  it("returns 'none' for identical pages (idempotent)", () => {
    expect(diffPages(base, clone(base)).bump).toBe("none");
  });

  it("prop value change → patch", () => {
    const next = clone(base);
    next.sections[0].props.heading = "B";
    expect(diffPages(base, next).bump).toBe("patch");
  });

  it("added section → minor", () => {
    const next = clone(base);
    next.sections.push({
      id: "t",
      type: "testimonial",
      props: { quote: "q", author: "a" },
    });
    expect(diffPages(base, next).bump).toBe("minor");
  });

  it("added prop → minor", () => {
    const next = clone(base);
    next.sections[0].props.subheading = "sub";
    expect(diffPages(base, next).bump).toBe("minor");
  });

  it("removed section → major", () => {
    const next = clone(base);
    next.sections.pop();
    expect(diffPages(base, next).bump).toBe("major");
  });

  it("removed prop → major", () => {
    const next = clone(base);
    delete next.sections[0].props.heading;
    expect(diffPages(base, next).bump).toBe("major");
  });

  it("type change → major", () => {
    const next = clone(base);
    next.sections[0].type = "cta";
    expect(diffPages(base, next).bump).toBe("major");
  });

  it("reorder → patch", () => {
    const next = clone(base);
    next.sections.reverse();
    expect(diffPages(base, next).bump).toBe("patch");
  });

  it("major wins when multiple changes occur", () => {
    const next = clone(base);
    next.sections[0].props.heading = "B"; // patch
    next.sections.pop(); // major
    expect(diffPages(base, next).bump).toBe("major");
  });
});

describe("nextVersion", () => {
  it("bumps major", () => expect(nextVersion("1.2.3", "major")).toBe("2.0.0"));
  it("bumps minor", () => expect(nextVersion("1.2.3", "minor")).toBe("1.3.0"));
  it("bumps patch", () => expect(nextVersion("1.2.3", "patch")).toBe("1.2.4"));
  it("leaves version unchanged for 'none'", () =>
    expect(nextVersion("1.2.3", "none")).toBe("1.2.3"));
});
