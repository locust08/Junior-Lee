# Payload Direct Frontend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic Payload slot CMS with clear page/section Globals and connect published Payload content directly into the existing Alfa Pinjaman frontend without changing the rendered layout.

**Architecture:** Keep the root Next app as the public frontend and the `cms/` Payload app as the separate Cloudflare Worker CMS. The frontend currently renders legacy HTML through `src/lib/legacyPage.tsx`; integration will use stable frontend identifiers plus a server-side HTML parser during static export, never class-name regexes, text order, or browser-side DOM mutation. Payload will expose published JSON from six Globals and call a Cloudflare Pages Deploy Hook after published Global changes so admin publishes rebuild the static site without GitHub content commits.

**Tech Stack:** Next.js 15 static export, legacy HTML page imports, Payload CMS 3.82, Cloudflare Workers, Cloudflare Pages Deploy Hook, Cloudflare D1, Cloudflare R2, TypeScript, `node-html-parser`, Node test runner, Vitest for CMS where existing.

## Global Constraints

- The latest attachment and the user's six corrections are the source of truth.
- Execute with Subagent-Driven Development: one implementer subagent per task, task review after each task, final review at the end.
- Do not push automatically until final verification passes.
- The current website design, page structure, routes, forms, calculator, GTM/GA4 tracking, Tailwind classes, responsive behavior, animations, spacing, and section order must remain visually unchanged.
- Payload controls headings, paragraphs, button labels, editable content images, contact details, FAQ content, loan information, and SEO content.
- Frontend code controls layout, section order, styling, routes, icons, forms, calculator logic, appointment behavior, and tracking.
- Do not use generic fields such as `Text Slot 01`, `home.text.0`, `homeText1`, `Content Slot`, or `DOM Index`.
- Do not walk the rendered browser DOM, replace text by order, search text nodes, mutate the page after load, or use `data-cms-*` attributes as the content replacement mechanism.
- Do not locate editable elements using class-name regexes such as `<h1 class="font-heading...">`.
- Every editable field must map to one explicit stable frontend identifier, such as `#home-hero-main-heading`.
- Stable identifiers must not affect layout, styling, animations, or responsive behavior.
- Use a real server-side HTML parser for legacy HTML mapping.
- Use one canonical structured default-content source. Frontend fallback and Payload seed must import from or be generated from that source.
- Admin content edits must not modify GitHub source code.
- Draft content must not appear in normal public requests.
- Published Payload changes must call `CLOUDFLARE_PAGES_DEPLOY_HOOK_URL` only when content is published, never when saving drafts.
- The deploy hook URL must live in environment variables and must never be committed.
- Deploy-hook failure must be logged/handled without failing or rolling back the saved Payload content.
- Existing Payload content must not be reset during normal deployments.
- Future editable frontend changes must include a stable identifier, Payload schema field, mapping entry, default value, migration or safe seed update, and test.
- Removed or renamed editable elements must preserve or migrate existing Payload data safely.
- The admin subdomain remains blocked until `metropinjamanberlesen.com` exists in the Cloudflare account; Worker URL remains the usable CMS URL until DNS is fixed.

---

## File Structure

- Create `docs/payload-frontend-mapping.md`: required mapping document before frontend connection.
- Create `docs/payload-deployment.md`: Cloudflare/GitHub/database/media/deploy hook behavior, including the automatic publish flow.
- Create `src/payload/content.ts`: canonical structured default content and shared public content types.
- Create `src/payload/fetchPayloadContent.ts`: published-content fetcher with fallback behavior.
- Create `src/payload/renderLegacyContent.ts`: stable-ID server-side HTML parser mapper.
- Modify `src/legacy-pages/*.html`: add stable IDs only to editable elements; do not change classes, layout, text, routes, or scripts.
- Modify `src/lib/legacyPageData.ts`: load page HTML and apply explicit Payload/default content before export.
- Modify `src/lib/legacyPage.tsx`: remove `/js/site-content.js` and keep legacy hydration behavior only.
- Modify `src/pages/*.tsx`: pass page IDs to `loadLegacyPage`.
- Create `tests/payload-render.test.mjs`: proves stable-ID mapping updates intended fields and leaves unrelated HTML unchanged.
- Remove or stop using `public/js/site-content.js`, `src/content/applySiteContent.js`, `src/content/defaultSiteContent.js`, `src/content/siteContentSchema.js`, and `scripts/extract-site-content.mjs` after replacement tests pass.
- Modify `cms/src/collections/Media.ts`: add `internalName`, keep required `alt`, keep Upload config.
- Replace `cms/src/globals/SiteContent.ts` with six Globals:
  - `cms/src/globals/SiteSettings.ts`
  - `cms/src/globals/HomePage.ts`
  - `cms/src/globals/AboutUsPage.ts`
  - `cms/src/globals/LoanPage.ts`
  - `cms/src/globals/HowToApplyPage.ts`
  - `cms/src/globals/ContactUsPage.ts`
- Create `cms/src/globals/fields/common.ts`: shared field helpers for SEO, buttons, cards, fixed arrays, images, and admin descriptions.
- Create `cms/src/hooks/triggerPagesDeploy.ts`: shared Payload `afterChange` hook for all six Globals.
- Replace `cms/src/endpoints/siteContent.ts` with `cms/src/endpoints/publishedContent.ts`: returns all published Globals normalized for the frontend.
- Modify `cms/src/payload.config.ts`: register new Globals/endpoints, remove old `SiteContent`.
- Create `cms/src/seed/seedContent.ts`: idempotent manual seed runner that imports canonical defaults from `src/payload/content.ts`.
- Create `cms/tests/schema.test.mts`: validates Global slugs, no slot fields, fixed row limits, Media alt required, draft enabled.
- Create `cms/tests/deployHook.test.mts`: proves draft saves do not trigger deploy hook and published changes do trigger it.

---

### Task 1: Mapping, Deployment Docs, And Stable Identifier Inventory

**Files:**
- Create: `docs/payload-frontend-mapping.md`
- Create: `docs/payload-deployment.md`

**Interfaces:**
- Produces: stable identifier inventory used by Task 2 and later frontend mapping.
- Produces: deployment decision record requiring automatic deploy hook behavior.

- [ ] **Step 1: Inspect current page sections from repository HTML**

Run:

```powershell
rg -n "<section|<nav|<footer|<h1|<h2|<h3|loan-estimator|x-data" src\legacy-pages
```

Expected: each legacy page reports the section order used for the mapping.

- [ ] **Step 2: Write `docs/payload-frontend-mapping.md`**

Create the mapping with these columns for every editable field:

```markdown
| Payload Global | Field path | Stable frontend identifier | Frontend file | Frontend section | Visible element | Shared | Fallback value |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

Required examples:

```markdown
| Site Settings | header.aboutUsMenuLabel | #site-header-nav-about-us | src/legacy-pages/*.html | Header | About us nav label | Yes | About us |
| Site Settings | header.loanMenuLabel | #site-header-nav-loan | src/legacy-pages/*.html | Header | Loan nav label | Yes | Loan |
| Site Settings | header.howToApplyMenuLabel | #site-header-nav-how-to-apply | src/legacy-pages/*.html | Header | How to apply nav label | Yes | How to apply |
| Site Settings | header.contactUsMenuLabel | #site-header-nav-contact-us | src/legacy-pages/*.html | Header | Contact us nav label | Yes | Contact us |
| Site Settings | header.applyNowButtonLabel | #site-header-apply-now-label | src/legacy-pages/*.html | Header | Apply now button label | Yes | Apply now |
| Home Page | hero.mainHeading | #home-hero-main-heading | src/legacy-pages/index.html | Hero Section | Main h1 | No | Simple Loans, |
| Home Page | hero.description | #home-hero-description | src/legacy-pages/index.html | Hero Section | Hero paragraph | No | Current visible paragraph |
| Home Page | howItWorks.steps[0].title | #home-how-it-works-step-1-title | src/legacy-pages/index.html | How It Works Section | Step 1 title | No | Select Loan |
| Home Page | statistics.items[0].value | #home-statistic-1-value | src/legacy-pages/index.html | Statistics Strip | Statistic 1 value | No | Current HTML value |
| Contact Us Page | faq.items[0].question | #contact-faq-1-question | src/legacy-pages/contact.html | FAQ Section | First FAQ question | No | Current HTML question |
```

Fill the remaining rows from current HTML and the latest brief. Do not invent sections.

- [ ] **Step 3: Write `docs/payload-deployment.md`**

Document the confirmed architecture and automatic publish flow:

```markdown
# Payload And Frontend Deployment

## Current Architecture

- Frontend: root Next.js 15 static export, `next.config.js` has `output: 'export'`.
- Frontend hosting: Cloudflare Pages project `metropinjamanberlesen`, output directory `out`, configured in `wrangler.toml`.
- Payload CMS: separate `cms/` Next/Payload app deployed as Cloudflare Worker `metropinjamanberlesen-payload-cms`.
- Database: Cloudflare D1 binding `D1`, database `metropinjamanberlesen_payload`.
- Media storage: Cloudflare R2 binding `R2`, bucket `metropinjamanberlesen-payload-media`.
- Admin domain: Worker URL is active; `admin.metropinjamanberlesen.com` needs the domain zone added to the Cloudflare account before route attachment.

## Required Publish Flow

Admin edits Payload -> Admin saves draft -> no frontend deploy.

Admin publishes Payload -> Payload `afterChange` hook calls `CLOUDFLARE_PAGES_DEPLOY_HOOK_URL` -> Cloudflare Pages rebuilds the static frontend -> live website shows new published content -> GitHub remains unchanged.

## Secret Handling

`CLOUDFLARE_PAGES_DEPLOY_HOOK_URL` is an environment variable/Worker secret. It must not be committed or printed in logs.
```

- [ ] **Step 4: Commit docs**

Run:

```powershell
git add docs/payload-frontend-mapping.md docs/payload-deployment.md
git commit -m "Document Payload mapping and deploy flow"
```

Expected: commit succeeds locally. Do not push.

---

### Task 2: Canonical Defaults, Stable IDs, And Parser Renderer

**Files:**
- Create: `src/payload/content.ts`
- Create: `src/payload/renderLegacyContent.ts`
- Modify: `src/legacy-pages/index.html`
- Modify: `src/legacy-pages/about_us.html`
- Modify: `src/legacy-pages/loan.html`
- Modify: `src/legacy-pages/how_to_apply.html`
- Modify: `src/legacy-pages/contact.html`
- Create: `tests/payload-render.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `defaultPayloadContent: PublicPayloadContent`
- Produces: `renderLegacyContent(html: string, pageId: SitePageId, content: PublicPayloadContent): string`
- Consumes: stable IDs from `docs/payload-frontend-mapping.md`.

- [ ] **Step 1: Add parser dependency**

Run:

```powershell
npm install node-html-parser
```

Expected: `package.json` and `package-lock.json` include `node-html-parser`.

- [ ] **Step 2: Create canonical defaults**

Create `src/payload/content.ts` with:

```ts
export type SitePageId = 'home' | 'aboutUs' | 'loan' | 'howToApply' | 'contactUs';

export type ImageValue = { src: string; alt: string };
export type LabeledText = { title: string; description: string };

export type PublicPayloadContent = {
  siteSettings: {
    header: {
      websiteLogo: ImageValue;
      aboutUsMenuLabel: string;
      loanMenuLabel: string;
      howToApplyMenuLabel: string;
      contactUsMenuLabel: string;
      applyNowButtonLabel: string;
    };
    footer: {
      footerLogo: ImageValue;
      pagesColumnHeading: string;
      homeLinkLabel: string;
      aboutUsLinkLabel: string;
      loanLinkLabel: string;
      helpColumnHeading: string;
      howToApplyLinkLabel: string;
      contactUsLinkLabel: string;
      copyrightText: string;
    };
    contactDetails: {
      supportEmail: string;
      displayPhoneNumber: string;
      telephoneLinkNumber: string;
      whatsappNumber: string;
      defaultWhatsappMessage: string;
      businessHours: string;
      officeName: string;
      officeAddress: string;
      wazeUrl: string;
      googleMapsUrl: string;
    };
    formMessages: {
      successfulSubmissionMessage: string;
      failedSubmissionMessage: string;
      sendingMessage: string;
      validationSummaryMessage: string;
    };
  };
  homePage: Record<string, unknown>;
  aboutUsPage: Record<string, unknown>;
  loanPage: Record<string, unknown>;
  howToApplyPage: Record<string, unknown>;
  contactUsPage: Record<string, unknown>;
};

export const defaultPayloadContent: PublicPayloadContent = {
  siteSettings: {
    header: {
      websiteLogo: { src: 'flow-assets/logos/flow-logo.svg', alt: '' },
      aboutUsMenuLabel: 'About us',
      loanMenuLabel: 'Loan',
      howToApplyMenuLabel: 'How to apply',
      contactUsMenuLabel: 'Contact us',
      applyNowButtonLabel: 'Apply now',
    },
    footer: {
      footerLogo: { src: 'flow-assets/logos/flow-logo.svg', alt: '' },
      pagesColumnHeading: 'Pages',
      homeLinkLabel: 'Home',
      aboutUsLinkLabel: 'About us',
      loanLinkLabel: 'Loan',
      helpColumnHeading: 'Help',
      howToApplyLinkLabel: 'How to apply',
      contactUsLinkLabel: 'Contact us',
      copyrightText: '© 2026 Alfa Pinjaman. All rights reserved.',
    },
    contactDetails: {
      supportEmail: 'alfa.pinjaman@gmail.com',
      displayPhoneNumber: '017-5392449',
      telephoneLinkNumber: '+60175392449',
      whatsappNumber: '60175392449',
      defaultWhatsappMessage:
        'Hi Alfa Pinjaman, I would like to enquire about a loan appointment.',
      businessHours: '24/7',
      officeName: 'Alfa Pinjaman',
      officeAddress:
        'Jalan Batu Nilam 1, Bandar Bukit Tinggi 1, 41200 Pelabuhan Klang, Selangor',
      wazeUrl:
        'https://www.waze.com/live-map/directions/my/wilayah-persekutuan-kuala-lumpur/kuala-lumpur/jalan-metro-1?to=place.ElpKYWxhbiBNZXRybyAxLCBNZXRybyBQcmltYSwgNTIxMDAgS3VhbGEgTHVtcHVyLCBXaWxheWFoIFBlcnNla3V0dWFuIEt1YWxhIEx1bXB1ciwgTWFsYXlzaWEiLiosChQKEglr0ecfQEbMMRELOdpZeIzxyxIUChIJ35pfkUBGzDERuup-yz1DT3Y',
      googleMapsUrl:
        'https://www.google.com/maps/place/Jalan+Metro+1,+Metro+Prima,+52100+Kuala+Lumpur,+Wilayah+Persekutuan+Kuala+Lumpur/data=!4m2!3m1!1s0x31cc46401fe7d16b:0xcbf18c7859da390b?sa=X&ved=1t:242&ictx=111',
    },
    formMessages: {
      successfulSubmissionMessage: 'Booking submitted.',
      failedSubmissionMessage:
        'Sorry, we could not submit your appointment right now. Please try again or contact us on WhatsApp.',
      sendingMessage: 'Sending...',
      validationSummaryMessage: 'Please complete all required fields.',
    },
  },
  homePage: {
    hero: {
      mainHeading: 'Simple Loans,',
      description:
        'Get the funds you need with competitive rates and a streamlined application. No hidden fees, no surprises — just straightforward lending.',
    },
  },
  aboutUsPage: {},
  loanPage: {},
  howToApplyPage: {},
  contactUsPage: {},
};
```

Expand page defaults from the mapping document as implementation proceeds. This is the only canonical default content source; CMS seed imports from this file.

- [ ] **Step 3: Add stable IDs to legacy HTML**

Add IDs from `docs/payload-frontend-mapping.md` to editable elements only.

Example:

```html
<h1 id="home-hero-main-heading" class="font-heading text-5xl xs:text-7xl xl:text-8xl tracking-tight mb-8">Simple Loans,</h1>
```

Do not change element classes, text, order, scripts, `x-data`, routes, or wrapping structure.

- [ ] **Step 4: Write parser renderer tests**

Create `tests/payload-render.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderLegacyContent } from '../src/payload/renderLegacyContent.ts';
import { defaultPayloadContent } from '../src/payload/content.ts';

test('renderLegacyContent updates stable id fields without class regexes', () => {
  const html = '<h1 id="home-hero-main-heading" class="keep">Simple Loans,</h1><p id="home-hero-description" class="anything">Old description</p>';
  const content = structuredClone(defaultPayloadContent);
  content.homePage.hero = {
    mainHeading: 'Fast loans, clear terms',
    description: 'Updated description',
  };

  const output = renderLegacyContent(html, 'home', content);

  assert.match(output, /id="home-hero-main-heading" class="keep">Fast loans, clear terms<\/h1>/);
  assert.match(output, /id="home-hero-description" class="anything">Updated description<\/p>/);
  assert.doesNotMatch(output, /data-cms/);
});

test('renderLegacyContent leaves unmatched HTML unchanged', () => {
  const html = '<div><span>Keep me</span></div>';
  const output = renderLegacyContent(html, 'home', defaultPayloadContent);
  assert.equal(output, html);
});
```

- [ ] **Step 5: Implement parser renderer**

Create `src/payload/renderLegacyContent.ts`:

```ts
import { parse } from 'node-html-parser';
import type { PublicPayloadContent, SitePageId } from './content';

function setText(root: ReturnType<typeof parse>, selector: string, value: unknown) {
  if (value == null) return;
  const element = root.querySelector(selector);
  if (!element) return;
  element.set_content(String(value));
}

function renderHome(root: ReturnType<typeof parse>, content: PublicPayloadContent) {
  const hero = (content.homePage as { hero?: Record<string, unknown> }).hero || {};
  setText(root, '#home-hero-main-heading', hero.mainHeading);
  setText(root, '#home-hero-description', hero.description);
}

export function renderLegacyContent(
  html: string,
  pageId: SitePageId,
  content: PublicPayloadContent,
): string {
  const root = parse(html, {
    blockTextElements: {
      script: true,
      style: true,
      pre: true,
      noscript: true,
    },
  });

  if (pageId === 'home') renderHome(root, content);

  return root.toString();
}
```

- [ ] **Step 6: Run tests**

Run:

```powershell
npm test
```

Expected: tests pass.

- [ ] **Step 7: Commit task**

Run:

```powershell
git add package.json package-lock.json src/payload/content.ts src/payload/renderLegacyContent.ts src/legacy-pages tests/payload-render.test.mjs
git commit -m "Add stable Payload frontend mapping renderer"
```

Expected: commit succeeds locally. Do not push.

---

### Task 3: Payload Section Globals Schema

**Files:**
- Modify: `cms/src/collections/Media.ts`
- Delete/replace: `cms/src/globals/SiteContent.ts`
- Create: `cms/src/globals/fields/common.ts`
- Create: `cms/src/globals/SiteSettings.ts`
- Create: `cms/src/globals/HomePage.ts`
- Create: `cms/src/globals/AboutUsPage.ts`
- Create: `cms/src/globals/LoanPage.ts`
- Create: `cms/src/globals/HowToApplyPage.ts`
- Create: `cms/src/globals/ContactUsPage.ts`
- Modify: `cms/src/payload.config.ts`
- Test: `cms/tests/schema.test.mts`

**Interfaces:**
- Produces Global slugs: `site-settings`, `home-page`, `about-us-page`, `loan-page`, `how-to-apply-page`, `contact-us-page`.
- Produces Media fields: `alt`, `internalName`.
- Consumes shared hook from Task 4 after Task 4 is complete.

- [ ] **Step 1: Add schema tests**

Create `cms/tests/schema.test.mts`:

```ts
import { describe, expect, it } from 'vitest';
import { Media } from '../src/collections/Media';
import { SiteSettings } from '../src/globals/SiteSettings';
import { HomePage } from '../src/globals/HomePage';
import { AboutUsPage } from '../src/globals/AboutUsPage';
import { LoanPage } from '../src/globals/LoanPage';
import { HowToApplyPage } from '../src/globals/HowToApplyPage';
import { ContactUsPage } from '../src/globals/ContactUsPage';

const globals = [SiteSettings, HomePage, AboutUsPage, LoanPage, HowToApplyPage, ContactUsPage];

function stringify(value: unknown) {
  return JSON.stringify(value);
}

describe('Payload section schema', () => {
  it('defines the six required globals', () => {
    expect(globals.map((global) => global.slug)).toEqual([
      'site-settings',
      'home-page',
      'about-us-page',
      'loan-page',
      'how-to-apply-page',
      'contact-us-page',
    ]);
  });

  it('does not expose generic slot fields', () => {
    const schema = stringify(globals);
    expect(schema).not.toContain('Text Slot');
    expect(schema).not.toContain('textSlots');
    expect(schema).not.toContain('imageSlots');
    expect(schema).not.toContain('DOM Index');
  });

  it('requires media alt text', () => {
    const alt = Media.fields.find((field) => 'name' in field && field.name === 'alt');
    expect(alt).toMatchObject({ required: true });
  });

  it('uses fixed rows for home steps and statistics', () => {
    const schema = stringify(HomePage);
    expect(schema).toContain('"minRows":4');
    expect(schema).toContain('"maxRows":4');
    expect(schema).toContain('"minRows":3');
    expect(schema).toContain('"maxRows":3');
  });

  it('enables drafts and versions for every global', () => {
    globals.forEach((global) => {
      expect(global.versions).toMatchObject({ drafts: true, maxPerDoc: 20 });
    });
  });
});
```

- [ ] **Step 2: Create field helpers**

Create `cms/src/globals/fields/common.ts` with `requiredText`, `optionalText`, `requiredTextarea`, `imageUpload`, `seoFields`, `titleDescriptionFields`, and fixed-row array helpers.

- [ ] **Step 3: Update Media collection**

Add `label: 'Alt text'` to `alt`, keep `required: true`, and add optional `internalName`.

- [ ] **Step 4: Create six section Globals**

Create one file per Global using exact tabs from the latest brief. Use arrays only for repeating content and fixed row counts where required.

- [ ] **Step 5: Register Globals**

Modify `cms/src/payload.config.ts` to remove `SiteContent` and register:

```ts
globals: [SiteSettings, HomePage, AboutUsPage, LoanPage, HowToApplyPage, ContactUsPage],
```

- [ ] **Step 6: Run CMS schema tests**

Run:

```powershell
pnpm --dir cms exec vitest run tests/schema.test.mts
pnpm --dir cms run generate:types
pnpm --dir cms run build
```

Expected: tests pass and Payload builds.

- [ ] **Step 7: Commit task**

Run:

```powershell
git add cms/src/collections/Media.ts cms/src/globals cms/src/payload.config.ts cms/tests/schema.test.mts cms/src/payload-types.ts
git commit -m "Add section-based Payload globals"
```

Expected: commit succeeds locally. Do not push.

---

### Task 4: Published Content API, Canonical Seed, And Deploy Hook

**Files:**
- Create: `cms/src/endpoints/publishedContent.ts`
- Create: `cms/src/seed/seedContent.ts`
- Create: `cms/src/hooks/triggerPagesDeploy.ts`
- Create: `cms/tests/deployHook.test.mts`
- Modify: `cms/package.json`
- Modify: `cms/src/payload.config.ts`
- Modify: six Global files to use the shared `afterChange` hook.

**Interfaces:**
- Produces endpoint: `GET /api/published-content`
- Produces script: `pnpm run seed:content`
- Produces hook: `triggerPagesDeployAfterPublish`

- [ ] **Step 1: Add deploy hook tests**

Create `cms/tests/deployHook.test.mts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { shouldTriggerPagesDeploy, triggerPagesDeployAfterPublish } from '../src/hooks/triggerPagesDeploy';

describe('Cloudflare Pages deploy hook', () => {
  it('does not trigger for draft saves', () => {
    expect(shouldTriggerPagesDeploy({ _status: 'draft' })).toBe(false);
  });

  it('triggers for published content', () => {
    expect(shouldTriggerPagesDeploy({ _status: 'published' })).toBe(true);
  });

  it('calls the deploy hook URL for published content', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    const originalFetch = global.fetch;
    const originalUrl = process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL;
    global.fetch = fetchMock;
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = 'https://example.com/deploy-hook';

    await triggerPagesDeployAfterPublish({ doc: { _status: 'published' }, req: { payload: { logger: console } } } as any);

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/deploy-hook', { method: 'POST' });

    global.fetch = originalFetch;
    process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL = originalUrl;
  });
});
```

- [ ] **Step 2: Implement deploy hook**

Create `cms/src/hooks/triggerPagesDeploy.ts`:

```ts
import type { GlobalAfterChangeHook } from 'payload';

export function shouldTriggerPagesDeploy(doc: { _status?: string } | null | undefined): boolean {
  return doc?._status === 'published';
}

export const triggerPagesDeployAfterPublish: GlobalAfterChangeHook = async ({ doc, req }) => {
  if (!shouldTriggerPagesDeploy(doc as { _status?: string })) return doc;

  const url = process.env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL;
  if (!url) {
    req.payload.logger?.warn?.('CLOUDFLARE_PAGES_DEPLOY_HOOK_URL is not configured; skipping frontend rebuild.');
    return doc;
  }

  try {
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      req.payload.logger?.error?.(`Cloudflare Pages deploy hook failed with status ${response.status}.`);
    }
  } catch (error) {
    req.payload.logger?.error?.(
      `Cloudflare Pages deploy hook request failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return doc;
};
```

- [ ] **Step 3: Attach hook to six Globals**

Each Global must include:

```ts
hooks: {
  afterChange: [triggerPagesDeployAfterPublish],
},
```

- [ ] **Step 4: Create published endpoint**

Create `cms/src/endpoints/publishedContent.ts` returning all six Globals with `draft: false`.

- [ ] **Step 5: Add canonical seed command**

Create `cms/src/seed/seedContent.ts` that imports `defaultPayloadContent` from `../../src/payload/content` via a relative path resolved from `cms/src/seed`. The seed must update only missing/nullish values and must not overwrite existing admin edits.

Add to `cms/package.json`:

```json
"seed:content": "cross-env NODE_OPTIONS=--no-deprecation tsx src/seed/seedContent.ts"
```

- [ ] **Step 6: Register endpoint**

Modify `cms/src/payload.config.ts`:

```ts
endpoints: [publishedContentEndpoint],
```

- [ ] **Step 7: Verify hook, seed, API build**

Run:

```powershell
pnpm --dir cms exec vitest run tests/deployHook.test.mts tests/schema.test.mts
pnpm --dir cms run seed:content
pnpm --dir cms run build
```

Expected: tests pass; seed does not overwrite existing values; build passes.

- [ ] **Step 8: Commit task**

Run:

```powershell
git add cms/src/endpoints/publishedContent.ts cms/src/hooks/triggerPagesDeploy.ts cms/src/seed/seedContent.ts cms/tests/deployHook.test.mts cms/package.json cms/src/payload.config.ts cms/src/globals
git commit -m "Add published content API and deploy hook"
```

Expected: commit succeeds locally. Do not push.

---

### Task 5: Frontend Fetch And Static Build Integration

**Files:**
- Create: `src/payload/fetchPayloadContent.ts`
- Modify: `src/lib/legacyPageData.ts`
- Modify: `src/pages/*.tsx`
- Modify: `src/lib/legacyPage.tsx`
- Modify: `docs/payload-deployment.md`

**Interfaces:**
- Consumes: `GET /api/published-content`
- Produces: `loadLegacyPage(fileName: string, pageId: SitePageId): Promise<LegacyPageContent>`

- [ ] **Step 1: Add fetch helper**

Create `src/payload/fetchPayloadContent.ts` that fetches `PAYLOAD_PUBLIC_CONTENT_URL` or the Worker `/api/published-content` URL, merges nullish fallbacks with `defaultPayloadContent`, and returns defaults on network/API failure.

- [ ] **Step 2: Make legacy loader async**

Modify `src/lib/legacyPageData.ts` to call `fetchPayloadContent()` and `renderLegacyContent(bodyHtml, pageId, content)` before returning `bodyHtml`.

- [ ] **Step 3: Update pages**

Change each `getStaticProps` to async and use page IDs: `home`, `aboutUs`, `loan`, `howToApply`, `contactUs`.

- [ ] **Step 4: Remove browser CMS script injection**

Modify `src/lib/legacyPage.tsx` to remove the `window.__METRO_PAGE_ID__` script and `/js/site-content.js` script.

- [ ] **Step 5: Document static update behavior**

Update `docs/payload-deployment.md` to state that static pages update when the deploy hook triggers a Cloudflare Pages rebuild, and admin publishes do not create GitHub commits.

- [ ] **Step 6: Run frontend checks**

Run:

```powershell
npm test
npm run type-check
npm run build
```

Expected: tests/type-check/build pass.

- [ ] **Step 7: Commit task**

Run:

```powershell
git add src/payload/fetchPayloadContent.ts src/lib/legacyPageData.ts src/lib/legacyPage.tsx src/pages docs/payload-deployment.md
git commit -m "Connect static frontend to Payload content"
```

Expected: commit succeeds locally. Do not push.

---

### Task 6: Cleanup, Verification, And Production Flow

**Files:**
- Delete obsolete slot runtime files.
- Create/update final verification notes in `docs/payload-deployment.md`.

**Interfaces:**
- Produces clean branch with no generic slot UI or client-side replacement.
- Produces verified no-push-until-pass final state.

- [ ] **Step 1: Remove obsolete slot runtime**

Delete:

```text
public/js/site-content.js
src/content/applySiteContent.js
src/content/defaultSiteContent.js
src/content/siteContentSchema.js
scripts/extract-site-content.mjs
tests/site-content.test.mjs
```

- [ ] **Step 2: Verify no forbidden slot system remains**

Run:

```powershell
rg -n "Text Slot|textSlots|imageSlots|home\\.text|site-content|data-cms|DOM Index|font-heading\\[|replaceTextBetween" src public cms tests scripts
```

Expected: no matches except old migration files or docs explicitly rejecting the old approach.

- [ ] **Step 3: Run full local checks**

Run:

```powershell
npm test
npm run type-check
npm run build
pnpm --dir cms exec vitest run
pnpm --dir cms run build
```

Expected: all pass. If `npm run lint` still fails because Next 15 removed `next lint`, record it and do not claim lint passed.

- [ ] **Step 4: Visual parity check**

Compare restored production against local build at desktop and mobile for:

```text
/
/about_us.html
/loan.html
/how_to_apply.html
/contact.html
```

Expected: no intentional layout differences. Stable IDs must not affect rendering.

- [ ] **Step 5: Production deploy-hook verification**

Only after all local checks pass:

1. Confirm `CLOUDFLARE_PAGES_DEPLOY_HOOK_URL` is configured as a CMS Worker secret or environment variable without printing it.
2. Change Home Page hero heading in Payload.
3. Save as draft.
4. Confirm public `https://metropinjamanberlesen.pages.dev/` still shows the previous heading.
5. Publish the heading.
6. Confirm Payload calls Cloudflare Pages Deploy Hook.
7. Wait for Cloudflare Pages deployment to complete.
8. Confirm public website displays the new heading.
9. Confirm `git status` and `git log origin/codex/payload-fixed-layout-cms..HEAD` show no GitHub content commit caused by admin editing.
10. Restore the original heading through Payload and publish again if the test used visible temporary wording.

If any part cannot be completed because the deploy-hook secret is unavailable, report it clearly and do not claim production flow verified.

- [ ] **Step 6: Commit cleanup**

Run:

```powershell
git add .
git commit -m "Remove obsolete slot CMS runtime"
```

Expected: commit succeeds locally. Do not push until Step 7 passes.

- [ ] **Step 7: Final review gate**

Dispatch a final whole-branch code review. Fix all Critical and Important findings. Re-run covering tests after fixes.

- [ ] **Step 8: Push only after final verification passes**

Run only after Steps 1-7 pass or uncompleted checks are explicitly reported:

```powershell
git push
```

Expected: branch pushes to `origin/codex/payload-fixed-layout-cms`.

---

## Self-Review Checklist

- User correction 1: automatic deploy hook is implemented by Task 4 and verified by Task 6.
- User correction 2: stable IDs plus `node-html-parser` replace regex-by-class in Task 2.
- User correction 3: one canonical default-content source is `src/payload/content.ts`; seed imports it.
- User correction 4: future developer change rules are in Global Constraints and mapping docs.
- User correction 5: real draft/publish/deploy/public/GitHub production flow is in Task 6.
- User correction 6: no push until final verification passes; Subagent-Driven Development is required.
