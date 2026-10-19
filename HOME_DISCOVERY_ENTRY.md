# PR5.106 — Homepage discovery entry and readiness inventory

Baseline af554e6. Accepted public24 products/10 routes/0 remaining. The homepage was still the Issue1 foundation placeholder, with no entry into published comparisons. Replaced it with a task-focused introduction and a responsive directory of supported live published, editorially approved route records. Database query and pure catalog filter both require published/approved status. No static research fallback, draft preview, product count claim or unsupported route identity. Names and scoped descriptions come from live database records; React escapes text. Cards link to the existing qualified comparison pages, which still enforce candidate eligibility.

New server reader uses the existing public Supabase configuration and RLS. No credential or service provisioning. No database or policy mutation. Loading errors produce a neutral temporary-unavailable state rather than fabricated results; empty approved data has a separate empty state. Desktop two-column/mobile single-column layout and keyboard focus outlines. The homepage is now dynamic. One route metadata query per request; it does not fetch/rank all product graphs. This is navigation, not natural-language intent parsing or analytics.

## Requirement-to-code inventory

- Homepage: app/page.tsx was a foundation placeholder; this packet supplies approved-route navigation.
- Routes/products: app/escape/[slug] and app/software/[slug] exist; accepted production UI and SQL evidence recorded in PR5.105.
- Search: no search page or parser found under app/ and lib/. PRODUCT_SPEC section on intent parsing requires bounded database-backed candidates; not implemented by this directory.
- Measurement: no event dispatch/collector or impression/outbound/search-intent tracking found under app/ and lib/. Existing links alone do not establish CTR instrumentation.
- Hidden Gems: no corresponding app surface found.
- SEO: existing route/product metadata includes canonical and index/noindex handling; app/ has no sitemap.ts or robots.ts. Comprehensive production SEO validation remains pending.
- Content:24 accepted products versus original minimum30; no arbitrary additional publication included.
- Experiment: Issue11 completion and measurement/Day0 checks remain pending. No experiment start date or GitHub issue closure inferred.

## Validation and owner QA

Two catalog tests verify draft/unapproved/unknown/malformed exclusion, empty-data behavior, scope-copy retention, deduplication and ordering. Two current/historical publication audit tests also pass (4 tests total). TypeScript noEmit and Next webpack production build passed. Local production server started, but the HTTP request was blocked by local socket permissions; no successful SSR/browser visual check is claimed. Test server stopped. No credentials were copied. No database call used to claim a new production count. next-env.d.ts remains outside payload.

After copying files, run the commands in README. In local dev using the existing project environment, open / and verify10 comparison links, their scoped descriptions and navigation to privacy/offline/PDF routes. Test a narrow viewport and keyboard navigation. A missing connection configuration should show temporary-unavailable, not research drafts. Once pushed, repeat homepage link checks on production. No SQL required.

Next bounded implementation: agree and implement the impression/product-click/outbound/search-intent event contract and discovery search flow against frozen validation requirements. Do not interpret this navigation release as measurement readiness.
