# Page Studio

Load a page definition from Contentful, edit it in a lightweight WYSIWYG-lite studio,
preview it as a rendered landing page, and publish it as an immutable, SemVer-tagged
release — with RBAC, accessibility, tests and CI.

**Stack:** Next.js 16 (App Router) · TypeScript · Redux Toolkit · Contentful · Tailwind v4 + shadcn/ui · Playwright + axe · GitHub Actions · Vercel.

---

## Quick start

```bash
npm install

# 1. Configure Contentful (see "Contentful model" below)
cp .env.local.example .env.local   # then fill in the four values

# 2. Run
npm run dev                        # http://localhost:3000
```

Open:
- **Preview** — `/preview/<slug>` (e.g. `/preview/hello`)
- **Studio** — `/studio/<slug>` (requires an `editor`/`publisher` role cookie — see RBAC)

### Environment variables

| Var | Where to find it (Contentful → Settings → API keys) |
|---|---|
| `CONTENTFUL_SPACE_ID` | Space ID |
| `CONTENTFUL_ENVIRONMENT` | usually `master` |
| `CONTENTFUL_DELIVERY_TOKEN` | Content Delivery API access token |
| `CONTENTFUL_PREVIEW_TOKEN` | Content Preview API access token |

Set `USE_MOCK_CONTENT=true` to bypass Contentful and serve a deterministic fixture
(used by CI / e2e so tests don't need credentials).

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev / production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:unit` | Vitest — schema + SemVer logic |
| `npm run test:e2e` | Playwright + axe (writes `a11y-report.json`) |

---

## 1. Architecture overview

```
Contentful ──► contentfulClient.ts (adapter) ──► pageSchema (Zod, boundary validation)
                                                      │
                          ┌───────────────────────────┴───────────────────────────┐
                          ▼                                                         ▼
                /preview/[slug] (RSC)                                   /studio/[slug] (RSC)
                          │                                                         │
                          ▼                                          StoreProvider (Redux, per-request)
                 SectionRenderer ──► sectionRegistry[type] ──► Hero/FeatureGrid/...   │
                          ▲                                                  StudioShell (client)
                          └──────────────── same renderer reads ◄───────────  live preview from draftPage
                                                                                      │
                                                                      POST /api/publish (RBAC + SemVer + snapshot)
```

Key boundaries:
- **Schema is the contract.** All external data is validated with Zod (`src/lib/schema.ts`)
  at the boundary. Page structure is validated centrally; per-section props are validated
  inside each component, so a single malformed section degrades to a fallback instead of
  failing the whole page.
- **Typed registry** (`src/lib/sectionRegistry.ts`) maps `type → component`. It is typed
  `Record<SectionType, …>`, so deleting an entry is a TypeScript error; at runtime an
  unregistered type renders `UnsupportedSection`.
- **Adapter isolation.** Only `contentfulClient.ts` imports the Contentful SDK. Switching
  draft/published or environment is isolated there.
- **RBAC is server-side.** Route access is gated in `proxy.ts`; the publish action
  re-checks the role independently.

### Directory map

| Path | Responsibility |
|---|---|
| `src/lib/schema.ts` | Zod `pageSchema` / `sectionSchema`; `Page`/`Section`/`SectionType` types |
| `src/lib/sectionRegistry.ts` | Single typed section registry |
| `src/lib/sectionProps.ts` | Per-type prop schemas (validated inside components) |
| `src/lib/contentfulClient.ts` | Contentful adapter (draft vs published, mock fallback) |
| `src/lib/semver.ts` | Deterministic diff + version bump logic |
| `src/lib/releases.ts` | Immutable snapshot read/write (`releases/<slug>/<version>.json`) |
| `src/lib/rbac.ts` | Roles + capability checks |
| `src/proxy.ts` | Server-side route gate (Next 16 middleware) |
| `src/app/preview/[slug]` | Schema-driven rendered page |
| `src/app/studio/[slug]` | Studio editor |
| `src/app/api/publish` | RBAC-protected publish endpoint |
| `src/store/*` | Redux slices + provider |
| `src/components/sections/*` | Section components + fallbacks |
| `src/components/studio/*` | Studio UI (list, editor, publish panel) |

---

## 2. Redux slice responsibilities

All state lives in Redux Toolkit; there is no mutation of page state outside dispatched actions.

| Slice | State | Reducers |
|---|---|---|
| **draftPage** | the page being edited (`page: Page \| null`) | `setPage`, `addSection`, `removeSection`, `reorderSection`, `updateSectionProps` |
| **ui** | ephemeral editor UI (`selectedSectionId`) | `selectSection` |
| **publish** | publish lifecycle (`status`, `version`, `bump`, `changelog`, `error`) | `publishStarted`, `publishSucceeded`, `publishFailed`, `resetPublish` |

- The store is created **per request** (`makeStore`) and provided via `StoreProvider`.
- **Persistence:** `StoreProvider` hydrates from `initialPage` (deterministic, SSR-safe),
  then overlays any `localStorage` draft after mount, and persists `draftPage` on every
  change (`draft:<slug>`). Reloading the studio restores the draft.
- The live preview reads `draftPage.sections` through the **same** `SectionRenderer` used
  by `/preview`, so the preview always reflects Redux state.

---

## 3. Contentful model + adapter

**Content type `page`** with fields:

| Field ID | Type | Notes |
|---|---|---|
| `slug` | Short text | used in the URL |
| `title` | Short text | |
| `sections` | **JSON object** | array of `{ id, type, props }` |

`sections` is modelled as a single JSON field for speed of delivery. The richer
alternative (each section as its own linked entry) is noted under trade-offs.

**Adapter (`contentfulClient.ts`):**
- Chooses the Delivery or Preview API + host based on a `preview` flag — this is the only
  place draft vs published is decided.
- Maps the Contentful entry to our domain shape `{ pageId, slug, title, sections }`.
- Guards against `sections` arriving as a JSON string, and returns a mock fixture when
  `USE_MOCK_CONTENT=true`.
- Returns `unknown`; validation happens at the route boundary with `pageSchema`. No
  Contentful types leak into components.

`/preview/[slug]?preview=true` renders draft content; without the flag it renders published.

---

## 4. Publish + SemVer logic

`POST /api/publish` (Node runtime):

1. **RBAC:** rejects with `403` unless the role cookie is `publisher`.
2. **Validate** the submitted draft with `pageSchema` (`400` on failure).
3. **Diff** against the latest snapshot (`diffPages`, `src/lib/semver.ts`):

   | Change | Bump |
   |---|---|
   | text / prop value change, reorder, title change | **patch** |
   | add section / add prop | **minor** |
   | remove section / change type / remove prop | **major** |
   | no change | **none** (idempotent) |

   When several changes occur, the highest bump wins. The diff is order-independent, so the
   same draft always yields the same result.
4. **Idempotent:** if the diff is `none`, the existing version is returned and **no new
   snapshot is written**.
5. **Snapshot:** otherwise compute the next version and write an **immutable**
   `releases/<slug>/<version>.json` (`{ version, slug, publishedAt, bump, changelog, page }`).
   Re-writing an existing version is refused.

Response: `{ version, bump, changelog, idempotent }`.

> **Note:** snapshots are written to the local filesystem, which works in dev and CI.
> Vercel's runtime filesystem is read-only/ephemeral, so durable production publishing
> would use a blob/KV store — see trade-offs.

---

## 5. Accessibility evidence

Targeting WCAG 2.2 AAA-oriented behaviour:

- **Keyboard operability** — all controls are native `<button>`/`<a>`/`<input>`; reorder,
  select, edit and publish are fully keyboard-driven. The CTA is a real anchor.
- **Visible focus** — global `:focus-visible` outline using the theme ring colour.
- **Heading hierarchy** — one `<h1>` per page (preview uses an `sr-only` page title; studio
  uses "Editing: …"); sections use `<h2>`.
- **Reduced motion** — `@media (prefers-reduced-motion: reduce)` neutralises animation /
  transition / smooth-scroll globally.
- **Forms** — every studio input has an associated `<label htmlFor>`; publish status uses
  `aria-live` and errors use `role="alert"`.

**Automated evidence:** `npm run test:e2e` runs axe (`wcag2a/aa`, `wcag21`, `wcag22aa`)
against `/preview`, writes `a11y-report.json`, and **fails CI on any critical violation**.
Latest local run: **0 violations**. The report is uploaded as a CI artifact.

---

## 6. What is incomplete / deliberately scoped

- **Auth is simulated** via an unsigned `role` cookie. The enforcement *pattern*
  (server-side route gate + independent action check) is real; production would use a
  signed session / JWT from an IdP.
- **Snapshot persistence is filesystem-based** — works locally and in CI, not on Vercel's
  read-only runtime. Production needs a blob/KV store.
- **Contentful model** uses a single JSON `sections` field rather than linked section
  entries.
- **Studio prop editing** is limited to Hero text and CTA label/URL, per the brief.
- **AAA is targeted, not fully audited** — axe enforces *critical* violations; full AAA
  (e.g. 7:1 contrast everywhere) is not exhaustively verified.
- **SemVer "required prop"** is treated as prop-key presence rather than reading each
  type's required keys from its Zod schema.

---

## Testing & CI

- **Unit (Vitest):** `src/lib/schema.test.ts`, `src/lib/semver.test.ts`.
- **E2E + a11y (Playwright + axe):** `tests/preview.spec.ts` — preview renders, CTA is an
  operable link, axe finds no critical violations (+ `a11y-report.json`).
- **CI (`.github/workflows/ci.yml`):** lint → unit → build → install browser → e2e/axe →
  upload a11y report. Runs on push to `main` and PRs.

## Deploying to Vercel

The repo ships a deploy workflow (`.github/workflows/deploy.yml`) that deploys to Vercel
production on every push to `main` via the Vercel CLI.

**One-time setup:**

1. Create the Vercel project and link it locally (generates `.vercel/project.json`):
   ```bash
   vercel link
   ```
2. Add the `CONTENTFUL_*` env vars to the Vercel **project** (Settings → Environment
   Variables, Production). `vercel pull` reads these at build time.
3. Create a Vercel access token at <https://vercel.com/account/tokens>.
4. Add three GitHub repo secrets (Settings → Secrets and variables → Actions):
   | Secret | Value |
   |---|---|
   | `VERCEL_TOKEN` | the token from step 3 |
   | `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
   | `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

After that, pushes to `main` auto-deploy. The live URL is shown in the Vercel dashboard
(`https://<project>.vercel.app`). Alternatively, skip the workflow and use Vercel's native
Git integration — both achieve continuous deployment.

(Publishing writes to disk, so it is demonstrated locally/CI; see trade-offs.)

## Roles (local)

Set the role cookie in the browser console, then reload:

```js
document.cookie = "role=publisher; path=/"; // or editor / viewer
```

- `viewer` → preview only (blocked from `/studio`, redirected to the preview)
- `editor` → edit the draft
- `publisher` → publish releases
