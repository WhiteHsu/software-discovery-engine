# After the ten-route milestone — Validation MVP readiness

The publication milestone is24 products/10 routes as of2026-10-17. It completes launch-route coverage. It does not complete the Validation MVP or start the30-day observation window.

## Frozen requirements

PRODUCT_SPEC.md section16 requires at least30 verified products,5 anchors, at least10 attributes,10 reviewed routes, a Hidden Gems collection, natural-language discovery, impressions/click/outbound/search-intent measurement, and SEO/canonical/sitemap checks. VALIDATION_PLAN.md says the experiment starts only after Issue11 is complete. Those source requirements are unchanged. At24 accepted published products, at least6 additional verified published products are needed for the stated content count. This is a count gap, not approval to publish arbitrary additions.

## Next implementation order

1. Inventory existing discovery/search, Hidden Gems, instrumentation and SEO against the frozen requirements; record existing implementation and concrete missing behavior. Route/product publication is accepted, while broad measurement/search/SEO readiness is unverified by this packet.
2. Implement and verify the search/discovery flow and exposure/click/outbound event contract before starting traffic acquisition. Record route, product, position, intent and source/referrer only where appropriate; impressions are required to calculate CTR. Do not treat this document as a deployed analytics implementation.
3. Review Hidden Gems and crawlability/canonical/sitemap/noindex behavior. Check all public routes through the actual app; preserve draft/private evidence boundaries.
4. Select the remaining verified products from the scoped research pipeline with evidence and trade-offs; each new publication still needs collision checks and review. Do not reduce the frozen content gate or flood the database to meet a number.
5. After Issue11 completion and production checks, record Day0 URL/counts/indexed-sitemap/analytics baseline, then start the30-day experiment. No start date is set here.

Success criteria stay those in VALIDATION_PLAN.md: Escape Route→Product CTR target15%, Product View→Outbound CTR target20%, interpreted with meaningful exposure samples. These are internal targets, not industry benchmarks. Successful SQL, deployment and UI acceptance do not establish demand. Account/submission/payment/creator analytics features remain outside this experiment.

Immediate next deliverable: a requirement-to-code inventory and the first bounded discovery/measurement implementation gap. This packet provides the accepted content baseline and updates the report, without changing the website or connecting new services.
