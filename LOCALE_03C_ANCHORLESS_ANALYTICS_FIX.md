# Locale-03C — Anchorless comparison analytics correction (#20)

The productivity-apps-you-can-buy-once definition deliberately has anchor=null. AnalyticsV2 copied null into the optional string event field, causing the API parser to reject entire comparison batches with HTTP 400. Omitting the field alone was insufficient: publicationV2 compared undefined against null and would still reject valid batches.

The producer now uses escapeContextV2 to omit an absent anchor. Publication validation compares with the same absent-field representation. Null and forged anchors remain rejected; anchored comparisons still require the correct anchor. English and Traditional Chinese routes share the correction. Eligibility, ordering and the database function are unchanged.

The owner acceptance session b4e6515b-b308-4905-869f-323da4139ab1 is added to supplementary analytics exclusions and LOCALE_03_METRICS.sql. Apply that exclusion to other manual reports as well. This does not retroactively remove Vercel views or recover rejected events. Keep the original validation clock.

Validation: 20 focused/regression tests passed, including the real collectV2 + publicationV2 with synthetic publication data, English/Chinese comparison views/impressions/clicks and product/outbound attribution. Existing analytics suite: 94 passed. Type checking and production build passed. Changed JS/TS files lint clean; full isolated tree has existing warnings, including two old local diagnostic warnings not shipped in this packet. Production acceptance remains pending until owner deploys and verifies persisted events.

No database migration, environment changes, dependency installation or SQL writes are required.
