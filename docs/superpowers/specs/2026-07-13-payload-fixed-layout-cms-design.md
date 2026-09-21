# Payload Fixed Layout CMS Design

## Goal

Add Payload CMS so non-developers can edit website content while the public site layout stays fixed. The public website remains on Cloudflare Pages. The CMS admin runs separately on Cloudflare Workers and will be available from an admin subdomain, such as `admin.metropinjamanberlesen.com`.

## Scope

The CMS will manage editable text and selected image slots for every current public page:

- Home
- About Us
- Loan
- How To Apply
- Contact Us

The CMS will also manage navbar labels and links, footer text, footer links, and footer contact details.

The CMS will not allow editors to change spacing, layout, section order, CSS classes, responsive behavior, animations, booking flow behavior, or page structure. Page preview buttons are intentionally deferred until after the core editing and publishing flow works.

## Architecture

The frontend stays as a Cloudflare Pages site. It keeps the existing visual layout and renders content into predefined fields. Payload CMS runs as a separate Cloudflare Workers application. Cloudflare D1 stores structured CMS data. Cloudflare R2 stores media uploads.

The frontend will fetch published CMS content from the admin/CMS API and render it into the existing page templates. The preferred behavior is runtime or cached API fetching so content changes can be tested from the live Pages URL after saving in the CMS, without requiring a full frontend redeploy for every text edit.

## Content Model

Use fixed page globals or singleton collections rather than free-form page builders. Each page gets named fields that match the current sections, for example hero heading, hero paragraph, button label, button URL, section heading, section body, image, alt text, and repeated list items where the current design already has repeatable cards or bullets.

Navbar and footer content should be separate global records so shared site chrome can be edited once and reused across all pages.

Media fields should be added only where the current layout already has an image slot or where the user explicitly wants an image to be replaceable. Image alt text is required for each editable image.

## Data Flow

Editors sign in to Payload at the admin subdomain, edit content fields, upload media when needed, and publish/save changes. The public frontend requests the published content from the CMS API and uses fallback defaults if the CMS is temporarily unavailable or empty.

The frontend should preserve the existing routes:

- `/`
- `/about_us`
- `/about_us.html`
- `/loan`
- `/loan.html`
- `/how_to_apply`
- `/how_to_apply.html`
- `/contact`
- `/contact.html`

## Error Handling

If CMS content cannot be fetched, the public site should still render with bundled fallback content instead of showing a broken page. Missing optional images should keep the current layout stable. Required text fields should have defaults during development and seeded production content during deployment.

## Deployment

The existing Cloudflare Pages project remains the public frontend. A new Cloudflare Workers deployment will host Payload CMS. Cloudflare D1 and R2 resources must be created and bound to the CMS Worker. DNS for the admin subdomain must point to the CMS Worker after the Worker is deployed.

Cloudflare Workers Paid plan may be required for this setup. Any Cloudflare billing or account confirmation must be completed by the account owner.

## Testing

Verify the frontend build still passes. Verify every public route renders with fallback content before CMS is connected. Verify the CMS admin can create and update page content. Verify saved CMS text appears on the public Pages URL. Verify image upload and image rendering through R2. Verify contact and booking functionality still works independently of the CMS.

## Deferred

Page preview buttons in Payload are deferred until after the main CMS editing flow is working. Booking/contact submissions inside Payload are also deferred; the current booking/contact backend remains separate.
