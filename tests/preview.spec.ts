import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync } from "fs";

test.describe("Preview page", () => {
  test("renders sections from the schema-driven renderer", async ({ page }) => {
    await page.goto("/preview/hello");
    // Logical hierarchy: exactly one top-level heading.
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    // Content from the (mock) Contentful adapter is rendered.
    await expect(
      page.getByRole("heading", { name: /launch landing pages/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /everything you need to ship/i }),
    ).toBeVisible();
  });

  test("CTA is a keyboard-operable link", async ({ page }) => {
    await page.goto("/preview/hello");
    const cta = page.getByRole("link", { name: /get started/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", /.+/);
    await cta.focus();
    await expect(cta).toBeFocused();
  });

  test("has no critical accessibility violations (axe)", async ({ page }) => {
    await page.goto("/preview/hello");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    // Artefact required by the brief.
    writeFileSync("a11y-report.json", JSON.stringify(results, null, 2));

    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(
      critical,
      `Critical a11y violations:\n${JSON.stringify(critical, null, 2)}`,
    ).toEqual([]);
  });
});
