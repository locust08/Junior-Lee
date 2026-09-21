# Payload Fixed Layout CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Payload CMS admin on Cloudflare Workers so all public page text and selected image slots can be edited while the current website layout stays fixed.

**Architecture:** Keep the existing Next static export on Cloudflare Pages. Add a separate `cms/` Payload app based on Payload's Cloudflare D1 template, with D1 for CMS data and R2 for uploaded media. Add a frontend content bridge that renders bundled fallback content first, then replaces annotated text and image slots with published CMS content from the Payload API at runtime.

**Tech Stack:** Next.js 15 static export, Cloudflare Pages Functions, Payload CMS Cloudflare D1 template, Cloudflare Workers, Cloudflare D1, Cloudflare R2, TypeScript, Node test runner.

## Global Constraints

- Public frontend remains on Cloudflare Pages.
- CMS admin runs separately on Cloudflare Workers.
- Admin subdomain target is `admin.metropinjamanberlesen.com`.
- CMS controls text and selected image slots only.
- Spacing, layout, section order, CSS classes, responsive behavior, animations, booking flow behavior, and page structure stay fixed.
- Pages in scope: Home, About Us, Loan, How To Apply, Contact Us.
- Navbar and footer content are in scope.
- Page preview buttons are deferred.
- Booking/contact submissions inside Payload are deferred.
- Public routes must remain `/`, `/about_us`, `/about_us.html`, `/loan`, `/loan.html`, `/how_to_apply`, `/how_to_apply.html`, `/contact`, and `/contact.html`.
- If CMS content cannot be fetched, the public site must render bundled fallback content.

---

## File Structure

- Create `src/content/siteContentSchema.ts`: shared content key definitions, page IDs, and TypeScript types for frontend tests and CMS field generation.
- Create `src/content/defaultSiteContent.ts`: fallback content exported as a typed object. The first implementation can seed from current legacy pages and refine field coverage incrementally.
- Create `src/content/applySiteContent.ts`: DOM-safe runtime applicator that updates `[data-cms-text]`, `[data-cms-html]`, `[data-cms-image]`, and `[data-cms-link]` nodes.
- Create `public/js/site-content.js`: browser entrypoint that fetches CMS content and applies it over the fallback-rendered page.
- Modify `src/lib/legacyPage.tsx`: inject the runtime content script and expose the current page ID.
- Modify `src/legacy-pages/*.html`: add stable `data-cms-*` markers to navbar, footer, and page section text/image slots without changing classes or layout.
- Create `tests/site-content.test.mjs`: tests fallback merging, DOM text replacement, image replacement, link replacement, and fetch failure behavior.
- Create `cms/`: Payload Cloudflare app based on `payloadcms/payload/templates/with-cloudflare-d1`.
- Create `cms/src/collections/SiteMedia.ts`: upload collection for image slots.
- Create `cms/src/globals/SiteContent.ts`: singleton global containing navbar, footer, and page section fields.
- Create `cms/src/endpoints/site-content.ts`: public read-only JSON endpoint for frontend consumption.
- Modify `cms/src/payload.config.ts`: register globals, media, endpoint, CORS, and Cloudflare-compatible config.
- Create `cms/src/seed/siteContentSeed.ts`: seed CMS with current fallback values.
- Create `cms/wrangler.jsonc`: Worker name, D1 binding, R2 binding, compatibility settings, and route value after Cloudflare resources exist.
- Modify root `README.md`: document the two-host setup and test flow.

---

### Task 1: Frontend Content Schema And Runtime Applicator

**Files:**
- Create: `src/content/siteContentSchema.ts`
- Create: `src/content/defaultSiteContent.ts`
- Create: `src/content/applySiteContent.ts`
- Create: `tests/site-content.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `SITE_PAGES: readonly SitePage[]`
- Produces: `defaultSiteContent: SiteContent`
- Produces: `mergeSiteContent(fallback: SiteContent, remote: PartialSiteContent | null | undefined): SiteContent`
- Produces: `applySiteContent(root: ParentNode, content: SiteContent, pageId: SitePageId): void`

- [ ] **Step 1: Add a test script**

Modify `package.json` scripts to include:

```json
"test": "node --test tests/*.test.mjs"
```

- [ ] **Step 2: Write the failing tests**

Create `tests/site-content.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applySiteContent,
  mergeSiteContent,
} from '../src/content/applySiteContent.js';
import { defaultSiteContent } from '../src/content/defaultSiteContent.js';

function createNode(attrs = {}) {
  const node = {
    textContent: '',
    attributes: { ...attrs },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    getAttribute(name) {
      return this.attributes[name] || '';
    },
  };
  return node;
}

function createRoot(nodes) {
  return {
    querySelectorAll(selector) {
      const attr = selector.match(/\[([^\]]+)\]/)?.[1];
      if (!attr) return [];
      return nodes.filter((node) => Object.prototype.hasOwnProperty.call(node.attributes, attr));
    },
  };
}

test('mergeSiteContent keeps fallback values when remote content is unavailable', () => {
  const merged = mergeSiteContent(defaultSiteContent, null);
  assert.equal(merged.site.navbar.items[0].label, defaultSiteContent.site.navbar.items[0].label);
  assert.equal(merged.pages.home.hero.heading, defaultSiteContent.pages.home.hero.heading);
});

test('applySiteContent replaces text, links, and image slots by stable CMS keys', () => {
  const textNode = createNode({ 'data-cms-text': 'pages.home.hero.heading' });
  const linkNode = createNode({ 'data-cms-link': 'site.navbar.cta.href', 'data-cms-text': 'site.navbar.cta.label' });
  const imageNode = createNode({ 'data-cms-image': 'pages.home.hero.image' });
  const root = createRoot([textNode, linkNode, imageNode]);
  const content = mergeSiteContent(defaultSiteContent, {
    site: { navbar: { cta: { label: 'Start application', href: 'contact.html' } } },
    pages: {
      home: {
        hero: {
          heading: 'Fast loans for real life',
          image: { src: 'https://cdn.example.com/home.jpg', alt: 'Customer at desk' },
        },
      },
    },
  });

  applySiteContent(root, content, 'home');

  assert.equal(textNode.textContent, 'Fast loans for real life');
  assert.equal(linkNode.textContent, 'Start application');
  assert.equal(linkNode.attributes.href, 'contact.html');
  assert.equal(imageNode.attributes.src, 'https://cdn.example.com/home.jpg');
  assert.equal(imageNode.attributes.alt, 'Customer at desk');
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- --test-name-pattern site-content`

Expected: FAIL because `src/content/applySiteContent.js` does not exist.

- [ ] **Step 4: Implement schema and defaults**

Create `src/content/siteContentSchema.ts` with page IDs, media/link types, and `SiteContent` interfaces. Create `src/content/defaultSiteContent.ts` with current navbar/footer defaults and first-pass page defaults for all five pages.

- [ ] **Step 5: Implement runtime content helpers**

Create `src/content/applySiteContent.ts` with:

```ts
export function getByPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object' && key in value) {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

export function deepMerge<T>(fallback: T, remote: unknown): T {
  if (!remote || typeof remote !== 'object' || Array.isArray(remote)) return fallback;
  const result: Record<string, unknown> = { ...(fallback as Record<string, unknown>) };
  for (const [key, value] of Object.entries(remote)) {
    const base = result[key];
    result[key] =
      base && typeof base === 'object' && !Array.isArray(base)
        ? deepMerge(base, value)
        : value;
  }
  return result as T;
}
```

Add `mergeSiteContent` and `applySiteContent` around those helpers.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- --test-name-pattern site-content`

Expected: PASS for the new site content tests.

- [ ] **Step 7: Commit**

Run:

```bash
git add package.json src/content tests/site-content.test.mjs
git commit -m "Add fixed-layout content runtime"
```

---

### Task 2: Annotate Existing Static Pages Without Changing Layout

**Files:**
- Create: `public/js/site-content.js`
- Modify: `src/lib/legacyPage.tsx`
- Modify: `src/pages/index.tsx`
- Modify: `src/pages/about_us.tsx`
- Modify: `src/pages/about_us.html.tsx`
- Modify: `src/pages/loan.tsx`
- Modify: `src/pages/loan.html.tsx`
- Modify: `src/pages/how_to_apply.tsx`
- Modify: `src/pages/how_to_apply.html.tsx`
- Modify: `src/pages/contact.tsx`
- Modify: `src/pages/contact.html.tsx`
- Modify: `src/legacy-pages/index.html`
- Modify: `src/legacy-pages/about_us.html`
- Modify: `src/legacy-pages/loan.html`
- Modify: `src/legacy-pages/how_to_apply.html`
- Modify: `src/legacy-pages/contact.html`

**Interfaces:**
- Consumes: `applySiteContent(root, content, pageId)`
- Produces: every route passes `pageId` to `LegacyPage`
- Produces: browser script reads `window.__METRO_PAGE_ID__`

- [ ] **Step 1: Extend `LegacyPageProps`**

Modify `src/lib/legacyPage.tsx` so props include `pageId` and the component emits:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `window.__METRO_PAGE_ID__=${JSON.stringify(pageId)};`,
  }}
/>
<script src="/js/site-content.js" defer />
```

- [ ] **Step 2: Pass page IDs from routes**

Update each route so it passes a literal page ID:

```ts
export function getStaticProps() {
  return { props: { ...loadLegacyPage('index.html'), pageId: 'home' } };
}
```

Use `about`, `loan`, `howToApply`, and `contact` for the other pages.

- [ ] **Step 3: Create the browser content script**

Create `public/js/site-content.js` that fetches:

```js
const endpoint = window.METRO_CMS_CONTENT_URL || 'https://admin.metropinjamanberlesen.com/api/site-content';
```

On success, apply text, links, and images to nodes with `data-cms-*` attributes. On failure, do nothing so fallback HTML remains visible.

- [ ] **Step 4: Annotate shared navbar and footer**

In every `src/legacy-pages/*.html`, add `data-cms-text` and `data-cms-link` attributes to visible navbar/footer labels and links. Keep existing classes, hrefs, and element structure unchanged.

- [ ] **Step 5: Annotate page-specific content**

For each page, annotate every meaningful visible heading, paragraph, CTA label, card label, FAQ question, FAQ answer, and selected image slot with a stable key from `defaultSiteContent`.

- [ ] **Step 6: Build the frontend**

Run: `npm run build`

Expected: PASS and static export still writes to `out`.

- [ ] **Step 7: Smoke-check generated HTML**

Run:

```bash
Select-String -Path out/index.html -Pattern 'data-cms-text="pages.home.hero.heading"'
Select-String -Path out/contact.html -Pattern 'data-cms-text="pages.contact.hero.heading"'
```

Expected: both commands find matching lines.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/lib src/pages src/legacy-pages public/js/site-content.js
git commit -m "Wire frontend to fixed CMS content slots"
```

---

### Task 3: Scaffold Payload Cloudflare CMS

**Files:**
- Create: `cms/`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `cms/package.json` with scripts `dev`, `build`, `deploy`, `payload`, and `test`
- Produces: `cms/wrangler.jsonc` with D1 and R2 bindings

- [ ] **Step 1: Copy official template**

Use the Payload Cloudflare D1 template from `payloadcms/payload/templates/with-cloudflare-d1` into `cms/`.

- [ ] **Step 2: Install dependencies**

Run:

```bash
cd cms
npm install
```

Expected: package install completes and creates `cms/package-lock.json`.

- [ ] **Step 3: Rename the Worker**

Set the Worker name to:

```json
"name": "metropinjamanberlesen-payload-cms"
```

Set the intended binding names in notes or comments until Cloudflare creates the actual resource IDs:

```json
"cmsD1Binding": "DB",
"cmsD1DatabaseName": "metropinjamanberlesen_payload",
"cmsR2Binding": "R2",
"cmsR2BucketName": "metropinjamanberlesen-payload-media"
```

- [ ] **Step 4: Ignore local CMS output**

Add CMS local output patterns to `.gitignore`:

```gitignore
cms/.open-next/
cms/.wrangler/
cms/.dev.vars
cms/.env
```

- [ ] **Step 5: Build the CMS template**

Run:

```bash
cd cms
npm run build
```

Expected: PASS or a Cloudflare binding error that names a missing local binding. Missing remote resource IDs are acceptable before Cloudflare resources are created.

- [ ] **Step 6: Commit**

Run:

```bash
git add .gitignore cms
git commit -m "Scaffold Payload Cloudflare CMS"
```

---

### Task 4: Add Fixed Site Content Model To Payload

**Files:**
- Create: `cms/src/globals/SiteContent.ts`
- Create: `cms/src/endpoints/site-content.ts`
- Create: `cms/src/seed/siteContentSeed.ts`
- Modify: `cms/src/payload.config.ts`
- Modify: `cms/src/collections/Media.ts` or create `cms/src/collections/SiteMedia.ts` based on the template file names

**Interfaces:**
- Consumes: `defaultSiteContent` shape from frontend, copied into CMS seed data
- Produces: public endpoint `GET /api/site-content`
- Produces: Payload global slug `site-content`

- [ ] **Step 1: Add a CMS endpoint test**

Create a small test that imports the endpoint normalizer and verifies the response strips draft/private user data and returns `site` plus `pages`.

- [ ] **Step 2: Implement the Site Content global**

Create `cms/src/globals/SiteContent.ts` with fixed groups:

```ts
export const SiteContent = {
  slug: 'site-content',
  label: 'Site Content',
  access: {
    read: () => true,
  },
  fields: [
    { name: 'site', type: 'group', fields: [] },
    { name: 'pages', type: 'group', fields: [] },
  ],
};
```

Fill `site.fields` with navbar/footer fields and `pages.fields` with page groups.

- [ ] **Step 3: Register the global**

Modify `cms/src/payload.config.ts`:

```ts
import { SiteContent } from './globals/SiteContent';

export default buildConfig({
  globals: [SiteContent],
});
```

Preserve the template's existing Users, Media, D1, R2, and Cloudflare settings.

- [ ] **Step 4: Add the public JSON endpoint**

Create `cms/src/endpoints/site-content.ts`:

```ts
export async function siteContentEndpoint(req) {
  const content = await req.payload.findGlobal({ slug: 'site-content' });
  return Response.json(content, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

- [ ] **Step 5: Register CORS for the frontend**

Allow these origins:

```ts
[
  'https://metropinjamanberlesen.pages.dev',
  'https://12add699.metropinjamanberlesen.pages.dev',
]
```

- [ ] **Step 6: Seed the CMS defaults**

Create `cms/src/seed/siteContentSeed.ts` exporting the same initial values as `src/content/defaultSiteContent.ts`.

- [ ] **Step 7: Build and test CMS**

Run:

```bash
cd cms
npm test
npm run build
```

Expected: tests pass and CMS build passes after local Cloudflare bindings are available.

- [ ] **Step 8: Commit**

Run:

```bash
git add cms/src
git commit -m "Add Payload site content model"
```

---

### Task 5: Cloudflare Resources, Deployment, And Domain Wiring

**Files:**
- Modify: `cms/wrangler.jsonc`
- Modify: `README.md`

**Interfaces:**
- Consumes: Cloudflare account access through Wrangler
- Produces: deployed Worker URL for Payload admin
- Produces: D1 database ID and R2 bucket binding in `cms/wrangler.jsonc`

- [ ] **Step 1: Confirm Wrangler auth**

Run:

```bash
npx wrangler whoami
```

Expected: Cloudflare account email is printed.

- [ ] **Step 2: Create D1 database**

Run:

```bash
cd cms
npx wrangler d1 create metropinjamanberlesen_payload
```

Expected: output includes a `database_id`.

- [ ] **Step 3: Create R2 bucket**

Run:

```bash
cd cms
npx wrangler r2 bucket create metropinjamanberlesen-payload-media
```

Expected: bucket creation succeeds or Cloudflare reports it already exists.

- [ ] **Step 4: Update Wrangler bindings**

Add the actual D1 and R2 bindings to `cms/wrangler.jsonc` using the `database_id` printed in Step 2:

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "metropinjamanberlesen_payload",
    "database_id": "<database id printed by wrangler>"
  }
],
"r2_buckets": [
  {
    "binding": "R2",
    "bucket_name": "metropinjamanberlesen-payload-media"
  }
]
```

- [ ] **Step 5: Create migrations**

Run:

```bash
cd cms
npm run payload migrate:create
```

Expected: migration files are created under the CMS migrations directory.

- [ ] **Step 6: Deploy CMS Worker**

Run:

```bash
cd cms
npm run deploy
```

Expected: Cloudflare deploy succeeds and prints the Worker URL.

- [ ] **Step 7: Add custom domain**

In Cloudflare dashboard, attach `admin.metropinjamanberlesen.com` to the deployed CMS Worker. If the root domain is not in this Cloudflare account yet, document the needed DNS record instead of forcing it.

- [ ] **Step 8: Document deploy flow**

Update `README.md` with:

```md
## CMS

Public site: https://metropinjamanberlesen.pages.dev
CMS admin: https://admin.metropinjamanberlesen.com

Frontend deploy:
npm run build
npx wrangler pages deploy out --project-name metropinjamanberlesen

CMS deploy:
cd cms
npm run deploy
```

- [ ] **Step 9: Commit**

Run:

```bash
git add cms/wrangler.jsonc README.md
git commit -m "Document Cloudflare CMS deployment"
```

---

### Task 6: End-To-End Verification

**Files:**
- Modify only if verification exposes a defect.

**Interfaces:**
- Consumes: deployed frontend and CMS
- Produces: verified content editing flow

- [ ] **Step 1: Verify frontend build**

Run:

```bash
npm test
npm run build
```

Expected: both pass.

- [ ] **Step 2: Verify CMS build**

Run:

```bash
cd cms
npm test
npm run build
```

Expected: both pass.

- [ ] **Step 3: Verify public CMS JSON**

Run:

```bash
Invoke-WebRequest -Uri 'https://admin.metropinjamanberlesen.com/api/site-content' -UseBasicParsing
```

Expected: status `200` and JSON contains `site` and `pages`.

- [ ] **Step 4: Verify live frontend**

Open `https://metropinjamanberlesen.pages.dev`, edit a harmless text field in Payload, save it, refresh the public site, and confirm the changed text appears without layout movement.

- [ ] **Step 5: Verify image replacement**

Upload one image in Payload, assign it to a page image slot, save, refresh the public site, and confirm the new image appears with the expected alt text and stable layout.

- [ ] **Step 6: Verify booking/contact still works**

Submit the contact booking form using a test entry and confirm the existing booking flow still responds successfully.

- [ ] **Step 7: Commit verification fixes**

If code changed during verification, run:

```bash
git add .
git commit -m "Fix CMS integration verification issues"
```

If no code changed, do not create a commit.

---

## Self-Review

- Spec coverage: The plan covers fixed editable content, selected images, navbar/footer, all five pages, fallback behavior, separate frontend/CMS hosting, D1, R2, Cloudflare deployment, route preservation, and deferred preview/submissions.
- Red-flag scan: No unfinished implementation markers remain; Cloudflare-generated IDs are added only after the resource creation command prints them.
- Type consistency: `SiteContent`, `PartialSiteContent`, `SitePageId`, `mergeSiteContent`, and `applySiteContent` are introduced in Task 1 and consumed consistently by later tasks.
