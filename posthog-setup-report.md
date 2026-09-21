# PostHog setup report

PostHog browser analytics was installed and initialized for the public loan-enquiry and appointment-booking site, with three non-PII booking events and a starter dashboard.

## What was installed and initialized

- Installed `posthog-js` with npm; the dependency and lockfile were updated.
- `posthog-node` was initially installed, then removed during review because this integration has no server-side PostHog call sites.
- `instrumentation-client.ts` owns the single guarded browser initialization. It reads `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` from environment configuration, keeps default capture settings, enables `capture_exceptions: true`, and reports missing configuration during development while production remains a no-op.
- The real environment values were set in `.env`; `.env.example` documents the required variable names.
- No CSP changes were made because no CSP was found in the reviewed project source.

## Events instrumented

These events were added to the booking form. The run did not perform a live browser or PostHog ingestion check, so event delivery is **unconfirmed**.

| Event | What it measures | File |
|---|---|---|
| `loan_type_select` | A visitor selects a personal or business loan type before submitting the booking form. | `src/components/contact/ContactSectionContact2.tsx` |
| `lead_form_submit` | A visitor successfully submits a loan appointment booking request. | `src/components/contact/ContactSectionContact2.tsx` |
| `lead_form_error` | A visitor encounters client validation, booking availability, or network failure during booking submission. | `src/components/contact/ContactSectionContact2.tsx` |

The event properties were reviewed as non-PII. Names, email addresses, phone numbers, booking identifiers, and message contents are not sent in PostHog capture properties. Existing `window.metroTrack` calls remain separate and unchanged.

## Identification

User identification was skipped. The site is a public, unauthenticated booking flow with no login, registration, session, account, or stable non-PII user identifier. The browser therefore remains anonymous and uses the anonymous distinct ID supplied by `posthog-js`. Do not identify visitors from submitted name, email, or phone fields. If a stable authenticated account flow is introduced later, wire `identify` at successful authentication and `reset` at logout.

## Error tracking

Error tracking is enabled centrally through `capture_exceptions: true` in `instrumentation-client.ts`. No additional route wrappers or scattered manual exception calls were added. The run did not observe an exception arriving in PostHog, so delivery remains unconfirmed.

## Dashboard

[DASHBOARD_URL] https://us.posthog.com/project/503297/dashboard/1927225

The dashboard is named **Analytics basics (wizard)** and contains three wizard-tagged insights: daily loan type selections, daily lead form submissions versus errors, and a 14-day ordered funnel from `loan_type_select` to `lead_form_submit`. The insights may be empty until traffic sends events.

## Verification and unresolved items

- `npm install` completed successfully.
- `npm run type-check` passed twice after dependency cleanup.
- `npm run build` compiled Next.js successfully, generated 27 static pages, and Wrangler reported `Compiled Worker successfully`.
- No live event flow or exception delivery was observed during the run; compilation and typechecking do not prove ingestion.
- `npm run lint` could not produce lint results: the pre-existing `next lint` script opened an interactive ESLint configuration prompt and exited 1 in the non-interactive run.
- The environment reported Node 26.5.0 while the project requires Node `>=22 <25`; npm emitted this engine warning, but installation and verification completed.
- npm reported existing audit vulnerabilities and pending install-script approvals; neither blocked installation.

## Before you merge

- [ ] Run a full production build in the deployment environment and confirm the PostHog variables documented in `.env.example`—`NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`—are configured there, not only in local `.env`.
- [ ] Run the test suite and update any mocks or fixtures affected by the new capture calls in `src/components/contact/ContactSectionContact2.tsx`.
- [ ] Exercise loan selection and successful, validation-error, unavailable-slot, and network-error booking paths, then confirm `loan_type_select`, `lead_form_submit`, and `lead_form_error` arrive in PostHog; this was not verified by the run.
- [ ] Resolve the pre-existing interactive ESLint setup prompted by the `npm run lint` script, then run lint and fix any errors introduced by `instrumentation-client.ts` or `src/components/contact/ContactSectionContact2.tsx`.
- [ ] Confirm the deployed Node runtime satisfies the package requirement (`>=22 <25`) rather than the observed Node 26.5.0 environment.
