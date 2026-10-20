# PR5.120 — mobile Chrome cloud QA receipt and exclusion

Baseline f34fc5ef558462c28a35e75392ea1602d304e9a0. Owner reports Chrome on a phone. The scoped candidate lookup returned exactly one session for PDF24 Creator during the lookup window: c52c9eed-061e-4618-bf9f-5dc2f44a85b3, first event 2026-10-20T07:30:06.607Z and last event 2026-10-20T07:30:20.305Z. That lookup showed one editorial impression, one editorial click, one product view and one outbound click. The owner subsequently supplied all seven scoped verification results as true and explicitly confirmed producer=false and Ready redeployment.

The accepted phone journey establishes those event presences and matching page/exposure/position keys at editorial position 3. Device/browser designation comes from owner testimony; SQL contains no device fingerprint and cannot itself prove physical device type. Phone OS was not provided. This is a successful individual journey, not universal mobile, background-delivery or network-failure acceptance. It does not establish complete editorial-to-outbound attribution.

This packet adds only this accepted QA session to knownQaSessionIds and retains earlier exclusions. Synthetic tests check exclusion across editorial and product events, ordinary-session preservation, case normalization and validation/conflict checks before exclusion. No event rows are deleted; no SQL migration, privileges, schedules, secrets or environment settings change. Keep ANALYTICS_PRODUCER_ENABLED=false. Direct SQL reports must independently filter all QA identifiers and an approved experiment window.

Author validation: 52 Node tests, TypeScript, targeted ESLint and production webpack build pass. Owner deployment acceptance for this packet remains pending. Quick-click before qualifying exposure and continuous-visibility/document-hidden acceptance remain pending. Public counts stay 24 products and 10 approved routes; the formal experiment has not started.

Use review-mobile-cloud-acceptance.mjs for this packet. Older hash scripts intentionally pin their original bytes and are not rewritten to conceal subsequent ledger changes.
