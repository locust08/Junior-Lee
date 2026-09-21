# GTM and GA4 Tracking Setup

This Next.js static-export site loads Google Tag Manager from `public/js/global-88881.js`.

## Production Resources

- GTM account: `LT Automation 6346744109`
- Web GTM container name: `Alfa Pinjaman`
- Web GTM container ID: `GTM-PFSGCN88`
- Server GTM container name: `Alfa Pinjaman Server`
- Server GTM container ID: `GTM-PRF3538V`
- Stape sGTM container name: `Alfa Pinjaman Server`
- Stape container identifier: `eqmahhxr`
- Stape tagging server URL: `https://eqmahhxr.apd.stape.io`
- Stape server region: `AP East (Singapore)`
- GA4 account: `LT Automation 389036374`
- GA4 property name: `Alfa Pinjaman`
- GA4 property ID: `544621007`
- GA4 web stream ID: `15218086624`
- GA4 measurement ID: `G-2R37LT2QLR`

## Server-Side Routing

On July 8, 2026, the Web GTM container was published as version 4:

- Version name: `Route GA4 through Stape server container`
- Change: added `server_container_url=https://eqmahhxr.apd.stape.io` to the Google tag.

The Server GTM container is hosted in Stape on the free container plan.

On July 8, 2026, the Server GTM container was published as version 2:

- Version name: `Add GA4 server forwarding`
- Tag: `GA4 - Forward All Events`
- Tag type: `Google Analytics: GA4`
- Measurement ID: `G-2R37LT2QLR`
- Event name: default incoming `event.event_name`
- Trigger: `All Events`
- Change: forwards all incoming GA4 web events from the server container to GA4.

The production Doppler config `locus-t-ai-backend/prd` has been updated with:

- `GTM_CONTAINER_ID=GTM-PFSGCN88`
- `PUBLIC_GTM_CONTAINER_ID=GTM-PFSGCN88`
- `PUBLIC_GTM_ID=GTM-PFSGCN88`
- `GA4_PROPERTY_ID=544621007`
- `GA4_STREAM_ID=15218086624`
- `PUBLIC_GA4_MEASUREMENT_ID=G-2R37LT2QLR`
- `GTM_ACCOUNT_REFERENCE=LT Automation 6346744109`

GA4 property IDs are not measurement IDs. Only `G-2R37LT2QLR` should be used as the GA4 web measurement ID.

## Runtime Behavior

- GTM is loaded when a valid `GTM-*` ID is configured.
- Direct GA4 `gtag` loading is only used as a fallback when GTM is not configured.
- Events are pushed through `window.dataLayer` when GTM is active.
- The GTM container is published with GA4 bootstrap and event tags for the implemented custom events.
- No personal form fields are pushed to analytics.

## Implemented Events

- `whatsapp_click`: existing WhatsApp links and the contact phone card.
- `google_maps_click`: existing Google Maps link on the contact page.
- `waze_click`: existing Waze link on the contact page.
- `lead_form_submit`: fires only after the contact booking form receives a successful `/api/bookings` response.

## Skipped Events

- `facebook_click`: footer links are placeholders using `href="#"`.
- `instagram_click`: footer links are placeholders using `href="#"`.
- `linkedin_click`: footer links are placeholders using `href="#"`.
- `x_click`: no X/Twitter link exists.
- `tiktok_click`: no TikTok link exists.

The How To Apply form is visible but has no real submit handler or success state, so it is not tracked as a successful lead submission.
