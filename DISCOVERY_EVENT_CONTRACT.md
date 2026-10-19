# PR5.107 — Anonymous discovery event and CTR contract

Baseline b741dd2 / Production124. Owner accepted homepage tests4/4, typecheck/build and local browser navigation. Public24/10/0 remains the accepted content checkpoint. No data writes or new tracking occurs in this packet.

Architecture requires first-party anonymous measurement. No event storage migrations, collector endpoint or browser producers exist in the accepted baseline. This packet implements shared payload validation and executable offline CTR aggregation as the foundation for those components. It is not production measurement readiness.

## Implemented event format (version1)

Four events: product_impression/product_click on an Escape Route, product_view/outbound_click on a product page. Every event has random UUIDv4 eventId/sessionId/pageViewId, canonical UTC occurredAt, canonical query-free path and productSlug. Route events additionally carry a supported routeSlug, exposureId and one-based position1..100. Product-page events cannot claim a route placement. An optional referrerHost is a normalized hostname only; the helper strips URL path/query/fragment and excludes credential-bearing or non-HTTP URLs. Unknown fields, raw search text, full referrer URL, Email, arbitrary payload fields and malformed context are rejected. No user ID, account, fingerprint, persistent identifier, secret or raw text is required.

Session/page/exposure UUIDs must be randomly created by a future client, not derived from user/device data. This module does not allocate or store them. Product slugs are structurally checked; future collector must validate actual current published product/approved route membership and ignore client-supplied eligibility. Event timestamps/IDs are untrusted client claims, not proof of human behavior. No session duration or retention policy is deployed by these pure functions.

## Exact metric semantics

Route→Product CTR = unique clicked measured exposures / unique measured exposures. Exposure identity includes session, page view, route, product, exposureId and position. A retry with the same eventId is ignored; reuse of that ID with a different payload rejects the batch. Repeated impression events/actions for the same placement do not inflate counts. A click without a matching impression is counted diagnostically, not converted into an inferred impression.

Product→Outbound CTR = product-page views with an outbound action / unique product-page views, matched by session/pageView/product. Repeated outbound actions count once per matching view. No denominator returns null (insufficient measured data), not0%. Batch arrival order does not affect attribution. Event ordering by actual action time and late-arrival reconciliation remain collector/storage concerns. The aggregate is for a supplied coherent analysis window; callers must group or filter by route/product/window before calculating comparisons. It does not infer unique people or causal acquisition.

## Browser/collector work still required

Define visible exposure as at least50% of a product card/row visible for one continuous second while document visible. Use IntersectionObserver/visibility lifecycle, cancel pending timers when hidden/unmounted, and deduplicate per page placement. Producer is not implemented here; these criteria must be tested when wired. Product view fires when the published product page is viewed. Outbound action must not delay/block navigation. Measurement failure must not break discovery. Route view, generic page view, search/parsed intent, anchor/constraint selection, Hidden Gems and source attribution extensions remain pending.

Next packet should implement the first-party collector/storage boundary with current-publication validation, bounded request sizes, ingestion timestamp, duplicate protection, abuse/rate controls, anonymous insert-only access, private analytics reads and documented retention; prepare read-only schema collision preflight before any owner-run migration. Then wire browser producers and verify real events before declaring analytics healthy. Do not treat console output or successful transport without durable storage as collected data. No vendor selection, external analytics service, secret, migration or endpoint is included here.

## Verification

8 tests passed:4 event/CTR scenarios plus2 catalog and2 acceptance-audit regression tests. TypeScript noEmit passed. Application pages unchanged, so no new build or UI test is required. Public24 products/10 routes/0 remaining and historical checkpoints unchanged; experiment not started. Raw event fixtures in tests are synthetic only. next-env.d.ts excluded.
