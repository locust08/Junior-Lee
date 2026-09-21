# Junior Lee SEO and Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the existing Junior Lee SEO implementation with consistent social metadata, favicon and manifest references while retaining accurate canonical URLs.

**Architecture:** Keep the current `next/head` metadata flow and centralized `siteConfig`. Extend that configuration with one existing social image, update shared document metadata and checked-in crawl assets, and cover the generated metadata contract through existing Node tests.

**Tech Stack:** Next.js 15 Pages Router, React 19, TypeScript, Node test runner, static Cloudflare Pages export.

**Spec:** User request “STEP 10 — Update SEO and Metadata” in this Codex task.

## Global Constraints

- Brand name is exactly `Junior Lee`.
- Do not add unsupported business claims.
- Preserve the existing SEO implementation and do not install a new SEO library.
- Keep changes minimal and retain the verified deployed origin for canonical URLs.
- Do not introduce JSON-LD because the current project does not use structured data.

## Review Focus

- Missing analytics or deployment environment variables must not affect metadata rendering.
- Localized pages must retain distinct canonical and `hreflang` URLs.
- Social metadata must use an absolute URL to an existing image asset.
- Manifest and document favicon references must resolve to an existing file without an old-brand filename.
- Public SEO artifacts must not contain the textual names `Alfa Pinjaman` or `Metro Pinjaman Berlesen`.

---

### Task 1: Pin the Public SEO Contract

**Files:**
- Modify: `tests/site-brand.test.mjs`
- Modify: `tests/legacy-page-data.test.mjs`

**Interfaces:**
- Consumes: `siteConfig`, `loadLegacyPage()`, and checked-in `public/` SEO artifacts.
- Produces: regression coverage for brand titles/descriptions, manifest icons, robots and sitemap URLs.

- [ ] **Step 1: Write failing tests**

Add assertions that all five English page metadata results use `Junior Lee`, manifest icons use `/junior-lee-favicon.png`, the favicon exists, robots and sitemap point to the configured public origin, and user-facing SEO artifacts contain no former brand names.

- [ ] **Step 2: Verify the tests fail**

Run: `node --test tests/site-brand.test.mjs tests/legacy-page-data.test.mjs`

Expected: failure because the manifest and legacy document still reference `/alfa-favicon.png` and social metadata is incomplete.

- [ ] **Step 3: Keep expectations literal and user-visible**

Assert rendered metadata values and actual public artifact contents rather than private helper implementation details.

### Task 2: Update Shared Metadata and Brand Assets

**Files:**
- Modify: `config/site.ts`
- Modify: `src/lib/legacyPage.tsx`
- Modify: `src/pages/_document.tsx`
- Modify: `src/legacy-pages/index.html`
- Modify: `src/legacy-pages/about_us.html`
- Modify: `src/legacy-pages/loan.html`
- Modify: `src/legacy-pages/how_to_apply.html`
- Modify: `src/legacy-pages/contact.html`
- Modify: `public/manifest.json`
- Create: `public/junior-lee-favicon.png`

**Interfaces:**
- Consumes: `siteConfig.url`, existing localized paths, and `/optimized-media/home-hero-adviser.webp`.
- Produces: canonical, OpenGraph, Twitter, manifest and favicon metadata for every public page.

- [ ] **Step 1: Add centralized social metadata values**

Add `siteConfig.seo.socialImage` and `siteConfig.seo.socialImageAlt` using the existing adviser image and factual alt text.

- [ ] **Step 2: Extend the existing Next Head block**

Emit `og:image`, `og:image:alt`, `twitter:image`, `twitter:image:alt`, and use `summary_large_image`; preserve current titles, descriptions, canonicals, robots and localized alternates.

- [ ] **Step 3: Align document and manifest references**

Reference `/junior-lee-favicon.png`, `/manifest.json`, and the existing teal theme colour from the shared document. Update legacy templates and the manifest to the same favicon filename.

- [ ] **Step 4: Add the neutral favicon asset**

Copy the currently rendered 32×32 favicon bytes to `public/junior-lee-favicon.png`; do not redesign the icon.

- [ ] **Step 5: Verify focused tests pass**

Run: `node --test tests/site-brand.test.mjs tests/legacy-page-data.test.mjs`

Expected: all focused tests pass.

### Task 3: Crawl, Build and Brand Verification

**Files:**
- Verify: `public/robots.txt`
- Verify: `public/sitemap.xml`
- Verify: generated `out/*.html`

**Interfaces:**
- Consumes: completed metadata implementation.
- Produces: verified static-export SEO output.

- [ ] **Step 1: Search active SEO sources for former brand names**

Run a scoped `rg` search across `config/site.ts`, `src/lib/legacyPage.tsx`, `src/pages/_document.tsx`, `src/legacy-pages`, `public/manifest.json`, `public/robots.txt`, and `public/sitemap.xml`. Treat the compatibility replacement list and deployed hostname as documented technical identifiers, not displayed brand copy.

- [ ] **Step 2: Run the full test suite and typecheck**

Run: `npm test`

Run: `npm run type-check`

Expected: zero failures.

- [ ] **Step 3: Stop the development server before building**

Stop the active `npm run dev` session so production and development do not write to `.next` concurrently.

- [ ] **Step 4: Build the static export**

Run: `npm run build`

Expected: successful Next.js export and Cloudflare Pages functions build.

- [ ] **Step 5: Inspect generated metadata**

Verify `out/en.html` contains the Junior Lee title, description, canonical, OpenGraph/Twitter image tags, manifest and favicon links; verify `out/robots.txt` and `out/sitemap.xml` retain the deployed origin.

- [ ] **Step 6: Restart and verify the development server**

Run `npm run dev`, request `/` and `/en`, and confirm HTTP 200 with no browser console errors.

