# Payload And Frontend Deployment

## Current Architecture

- Frontend: root Next.js 15 static export; `next.config.js` has `output: 'export'`.
- Frontend hosting: Cloudflare Pages project `metropinjamanberlesen`, output directory `out`, configured in `wrangler.toml`.
- Payload CMS: separate `cms/` Next/Payload app deployed as Cloudflare Worker `metropinjamanberlesen-payload-cms`.
- Database: Cloudflare D1 binding `D1`, database `metropinjamanberlesen_payload`.
- Media storage: Cloudflare R2 binding `R2`, bucket `metropinjamanberlesen-payload-media`.
- Public CMS origin: `PAYLOAD_PUBLIC_SERVER_URL`, defaulting to the current Worker URL. The published endpoint resolves relative `/api/media/file/...` upload URLs against this origin before the static frontend consumes them.
- Admin domain: the Worker URL is active; `admin.metropinjamanberlesen.com` needs the domain zone added to the Cloudflare account before route attachment.

The static frontend remains the owner of the route structure, legacy markup, Tailwind
classes, responsive behavior, animation, forms, calculator, appointment behavior,
and GTM/GA4 tracking. Payload is a separate content service. It supplies only
published content, using the shared canonical default-content source when Payload is
unavailable or a field is nullish.

## Required Publish Flow

`Admin edits Payload -> Admin saves draft -> no frontend deploy.`

`Admin publishes Payload -> Payload afterChange hook calls CLOUDFLARE_PAGES_DEPLOY_HOOK_URL -> Cloudflare Pages rebuilds the static frontend -> live website shows new published content -> GitHub remains unchanged.`

The public content endpoint must request only published versions. Draft saves must
not be exposed by normal public requests and must not call the deploy hook. The
`afterChange` hook runs only for a published Global change. It must handle missing,
non-successful, and network-failed hook calls by logging a redacted operational
message and returning normally; saved Payload content is never failed, rolled back,
or overwritten because a rebuild trigger failed.

Payload edits never write GitHub source files or create GitHub commits. The deploy
hook triggers a Cloudflare Pages rebuild, and that static build fetches published
Payload content before exporting the pages. Live content changes therefore arrive
through the Pages deployment rather than a repository commit.

## Secret Handling

`CLOUDFLARE_PAGES_DEPLOY_HOOK_URL` is an environment variable/Worker secret. It
must not be committed or printed in logs. Configure it in the CMS Worker environment
or secret store, not in frontend source, `.env.example` values, docs, build output,
or Payload records. Error logs may identify the failed action and response status but
must never include the hook URL or its query parameters.

## Operational Checks

Before production verification, confirm the Worker secret is present without
displaying it. Then save a draft and confirm neither a Pages deployment nor a public
content change occurs; publish the same change and confirm exactly one rebuild is
requested. After Pages completes, confirm the public site reflects the published
value and that no GitHub content commit was created.

## Task 6 Verification (2026-07-13)

- The obsolete browser slot runtime, slot-content defaults/schema, extractor, slot test,
  and unused legacy CMS `site-content` endpoint/defaults were removed. The required
  forbidden-runtime scan returned no matches.
- Root verification passed: `npm test` (11 tests), `npm run type-check`, and
  `npm run build`. The root test run retains existing Node module-type warnings; the
  build retains the existing multi-lockfile workspace-root warning.
- `pnpm --dir cms exec vitest run` passed: 12 tests passed and the local API
  integration test was skipped because this workstation does not have a local
  `PAYLOAD_SECRET`/D1 test environment configured. The integration test is Node-only
  and imports the Payload config only when the required local CMS environment exists.
- `pnpm --dir cms run build` passed with existing ESLint warnings. `npm run lint` was
  not run because Next 15 no longer provides the configured `next lint` command.
- Local static output was checked on desktop and at 390px wide for `/`,
  `/about_us.html`, `/loan.html`, `/how_to_apply.html`, and `/contact.html`: each route
  rendered with headings/images and no horizontal overflow. Public route content was
  checked for the same five routes; each route returned the same first heading as the
  local static output and no obsolete `/js/site-content.js` or `window.__METRO_PAGE_ID__`
  runtime. Pixel-level production parity and the draft/publish/deploy-hook flow remain
  unverified because the Cloudflare Pages deploy-hook secret was not available in this
  local verification pass. No push was performed.
