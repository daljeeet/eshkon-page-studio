/**
 * Deterministic fixture used when USE_MOCK_CONTENT=true (e.g. CI e2e), so tests
 * don't depend on live Contentful credentials. Mirrors the real content shape.
 * This lives inside the adapter layer — components never import it.
 */
export function mockPage(slug: string) {
  return {
    pageId: "mock-page",
    slug,
    title: "Page Studio (mock)",
    sections: [
      {
        id: "hero-1",
        type: "hero",
        props: {
          eyebrow: "Page Studio",
          heading: "Launch landing pages in minutes",
          subheading:
            "Author in a lightweight studio, preview instantly, publish immutable versioned releases.",
        },
      },
      {
        id: "features-1",
        type: "featureGrid",
        props: {
          heading: "Everything you need to ship",
          features: [
            { title: "Schema-driven", body: "Pages render from a Zod-validated schema." },
            { title: "Versioned publishing", body: "Every publish is an immutable snapshot." },
            { title: "Accessible by default", body: "Built against WCAG 2.2 AAA targets." },
          ],
        },
      },
      {
        id: "testimonial-1",
        type: "testimonial",
        props: {
          quote: "Page Studio cut our campaign launch time in half.",
          author: "Jane Doe",
          role: "Head of Growth, Acme",
        },
      },
      {
        id: "cta-1",
        type: "cta",
        props: {
          heading: "Ready to build your first page?",
          label: "Get started",
          url: "https://example.com",
        },
      },
    ],
  };
}
