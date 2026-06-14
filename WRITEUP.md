# Page Studio — Write-up

## Problem framing

Build a small CMS-backed "Page Studio" that lets authorised users load a page from
Contentful, edit its structure/props in a lightweight studio, preview it as a real landing
page, and publish it as an immutable, versioned release — with the quality bar (RBAC, a11y,
tests, CI) treated as part of the product, not an afterthought. The emphasis is on
architecture and correctness rather than UI breadth, so the design centres on one clear data
contract that every layer agrees on.

## Architecture overview

A single Zod schema (`Page` / `Section`) is the contract. Data flows
`Contentful → adapter → schema validation → renderer`. The renderer is schema-driven: a
typed registry maps each `section.type` to a component, and the **same** renderer powers both
the read-only `/preview/[slug]` and the studio's live preview, so what you edit is exactly
what you publish. Editing state lives entirely in Redux; publishing is a server action that
diffs the draft against the last release and writes an immutable snapshot.

Boundaries are deliberate: Contentful is touched only in `contentfulClient.ts`; validation
happens only at the route boundary; security is enforced only on the server (route gate +
publish action). Components are "dumb" — they receive validated props and render.

## Key decisions & trade-offs

- **Loose page schema + per-section prop validation.** The brief defines `props` as
  `Record<string, unknown>`. Rather than a strict discriminated union (which would make an
  unknown section fail the whole page), the page schema validates structure and `type` (a
  literal union), and each component validates its own props. This satisfies both
  "unknown/unregistered section → `UnsupportedSection`" and "invalid data → no crash"
  simultaneously, and keeps one malformed section from taking down the page.
- **Typed registry as the safety net.** `Record<SectionType, …>` means removing an entry is
  a compile error; the runtime guard renders a fallback. Two layers, cheap.
- **Filesystem snapshots.** `releases/<slug>/<version>.json` is the simplest faithful
  implementation of "immutable, versioned release" and is fully testable. The cost is that
  it doesn't persist on Vercel's read-only runtime (see below).
- **Cookie-based RBAC.** Real auth is out of scope for the time budget; a role cookie carries
  identity while the *enforcement pattern* (server-side, re-checked on the publish action) is
  production-shaped.
- **Mock-content flag for CI.** `USE_MOCK_CONTENT=true` lets e2e/axe run deterministically
  without Contentful secrets, keeping CI fast and hermetic while real integration still runs
  in dev/preview.

## Assumptions

- A Contentful `page` content type exists with `slug`, `title`, and a JSON `sections` field.
- Slugs are unique; the first matching entry is used.
- Roles are `viewer | editor | publisher`; absence of a cookie means least privilege.
- "Required prop break" is approximated as prop-key removal.

## Redux slice responsibilities

- **draftPage** — the edited page; all structural mutations (`setPage`, `addSection`,
  `removeSection`, `reorderSection`, `updateSectionProps`).
- **ui** — ephemeral editor state (`selectedSectionId`).
- **publish** — publish lifecycle (`status`, `version`, `bump`, `changelog`, `error`).

Store is per-request; `draftPage` persists to `localStorage` (`draft:<slug>`) and rehydrates
on reload after a deterministic SSR-safe first render.

## Contentful model & adapter

`page` = `{ slug, title, sections (JSON) }`. The adapter selects Delivery vs Preview API by a
`preview` flag (the only place draft/published lives), maps to the domain shape, guards a
stringified `sections` field, and returns `unknown` for the route to validate. No Contentful
types reach the UI.

## Publish & SemVer logic

`diffPages(prev, next)` is deterministic: remove section / change type / remove prop → major;
add section / add prop → minor; value change / reorder / title → patch; identical → none
(idempotent, no new version). Highest bump wins. The publish endpoint enforces the publisher
role, validates the payload, computes the next version, and writes an immutable snapshot with
a changelog. Re-publishing an unchanged draft returns the existing version.

## Accessibility approach

Native, keyboard-operable controls; a global visible focus ring; one `<h1>` per page with
`<h2>` sections; `prefers-reduced-motion` honoured globally; labelled inputs with
`aria-live`/`role="alert"` status. axe runs in Playwright across WCAG 2.x tags, emits
`a11y-report.json`, and fails CI on any critical violation (currently 0).

## What is not included & why

- Durable production persistence for releases (needs blob/KV on Vercel) — time-boxed.
- Real authentication/IdP — simulated via cookie; pattern is correct.
- Linked-entry Contentful model and prop editing beyond Hero/CTA — scoped per brief.
- Exhaustive AAA conformance (e.g. 7:1 contrast everywhere) — axe enforces critical only.
