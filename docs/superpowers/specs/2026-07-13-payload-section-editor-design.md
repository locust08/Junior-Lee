# Payload Section Editor Design

## Goal

Rebuild the Payload CMS editor so it is easy for a non-developer to understand exactly what they are editing.

The public website design, layout, spacing, responsive behavior, animations, routes, and section order must stay fixed. Payload edits content only: text, links, and selected images.

The current generic slot model is rejected. Editors must not see names like `Text Slot 01`, `home.text.0`, or `home text 1`.

## Root Cause Of Current Confusion

The first CMS model was generated from page text order. That made Payload technically contain many editable values, but the admin did not explain what each value represented. Worse, ordered DOM replacement was unsafe because small differences in rendered text nodes could move content into the wrong place.

The new model must be explicit. Every editable field needs a stable content key, a human label, and a position inside a page/section group that matches the public website.

## Recommended Approach

Use a structured Payload global named `Site Content` with grouped fields:

- `Global`
- `Home Page`
- `About Us Page`
- `Loan Page`
- `How To Apply Page`
- `Contact Us Page`

Inside each page, fields are grouped by visible website section names. Example:

- `Home Page`
  - `Navbar`
  - `Hero Section`
  - `How It Works Section`
  - `Loan Types Section`
  - `Why Choose Us Section`
  - `Ready To Get Started Section`
  - `Footer`

This is the recommended option because it matches the way the editor thinks: page first, section second, field third.

## Alternatives Considered

### Keep Ordered Slots

Rejected. It is fast to generate but hard to understand and unsafe. It caused the live site text to shift into the wrong places.

### Fully Custom Visual Editor

Deferred. Payload can be extended with a custom preview/editor that looks closer to the website, but that is a larger feature. The current priority is a clean, reliable form editor. A preview button or split preview can be added later.

### One Collection Entry Per Section

Rejected for now. It would make reusing sections flexible, but this site has a fixed layout. A single structured global is simpler and safer.

## Editor Structure

### Global

Global content appears across multiple pages.

- `Navbar`
  - Logo image
  - Logo alt text
  - Menu item: About us
  - Menu item: Loan
  - Menu item: How to apply
  - Menu item: Contact us
  - CTA button label
  - CTA button link
- `Footer`
  - Logo image
  - Page links
  - Help links
  - Social link labels and URLs
  - Copyright text
- `Contact Defaults`
  - WhatsApp number
  - WhatsApp message
  - Company address
  - Waze link
  - Google Maps link

### Home Page

Use the section titles from the visible page. Field names must describe what the editor sees.

- `Hero Section`
  - Eyebrow label
  - Main heading
  - Description
  - Primary button label
  - Primary button link
  - Secondary button label
  - Secondary button link
  - Left top image
  - Right top image
  - Bottom left image
  - Bottom right image
- `How It Works Section`
  - Section heading
  - Section description
  - Step 1 title
  - Step 1 description
  - Step 2 title
  - Step 2 description
  - Step 3 title
  - Step 3 description
  - Step 4 title
  - Step 4 description
- `Loan Types Section`
  - Section heading
  - Section description
  - Personal loan card title
  - Personal loan card description
  - Business loan card title
  - Business loan card description
- `Why Choose Us Section`
  - Section heading
  - Section image
  - Feature titles and descriptions
- `Ready To Get Started Section`
  - Heading
  - Description
  - Apply button label
  - WhatsApp button label

### About Us Page

- `Hero Section`
- `About Section`
- `Mission Section`
- `Vision Section`
- `Values Section`
- `CTA Section`

Exact field labels must be taken from the current page content during implementation.

### Loan Page

- `Hero Section`
- `Loan Options Section`
- `Personal Loan Section`
- `Business Loan Section`
- `Requirements Section`
- `FAQ Section`
- `CTA Section`

Exact field labels must be taken from the current page content during implementation.

### How To Apply Page

- `Hero Section`
- `Application Steps Section`
- `Required Documents Section`
- `Online Form Section`
- `WhatsApp CTA Section`

Exact field labels must be taken from the current page content during implementation.

### Contact Us Page

- `Hero Section`
- `Contact Methods Section`
- `Address Section`
- `Map Links Section`
- `FAQ Section`
- `CTA Section`

Exact field labels must be taken from the current page content during implementation.

## Payload UI Requirements

- Use `tabs` or clearly separated collapsible groups so each page is easy to jump to.
- Use section names that match visible website sections.
- Use field labels like `Main heading`, `Description`, `Primary button label`, not technical keys.
- Keep technical keys hidden from the editor where Payload allows it.
- Add short admin descriptions only when helpful, such as “This appears in the hero section at the top of the Home page.”
- Keep fields in the same order they appear visually on the website.
- Do not use generic arrays for normal page text.
- Use arrays only for natural repeating content, such as steps, FAQ items, footer links, and social links.

## Frontend Wiring Requirements

- Add explicit `data-cms-text`, `data-cms-link`, and `data-cms-image` markers to the existing HTML/React output.
- Do not walk the DOM and replace text by order.
- Do not change Tailwind classes, wrappers, spacing, layout, or section order.
- If a CMS value is empty or unavailable, the bundled static website content remains visible.
- Every frontend CMS key must map to one clear Payload field.

## Preview

Payload does not need to look exactly like the public website for this phase. A preview button or split preview is allowed later, but not required before the section-based editor is correct.

Future preview behavior:

- Editor clicks preview from a page or section.
- Preview opens the matching public page.
- Preview shows draft CMS values when possible.

## Testing And Verification

- Add tests that prove unannotated text is never changed.
- Add tests that prove annotated text, links, and images update correctly.
- Build the public site and inspect the main pages visually.
- Verify the Payload admin shows clear page and section names.
- Verify the public site still renders correctly when the CMS API is unavailable.

## Success Criteria

- Payload no longer shows `Text Slot 01` style editing.
- Editors can immediately find `Home Page -> Hero Section -> Main heading`.
- Navbar and Footer are easy to find.
- Each page is clearly separated.
- The public website design matches the original fixed layout.
- CMS changes update only the intended fields.
