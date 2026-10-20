# PR5.119 — browser privacy and input QA acceptance

Baseline b97a4065fa9674d54e87f1a3bc2470b409103b1c. Owner screenshots show Chrome DNT=1 and no /api/events in the Hidden Gems → Joplin → official-site journey. Owner explicitly confirmed producer=true with Ready during that test and false with Ready afterward. Firefox screenshots show GPC=true, DNT=unspecified and no event requests in the same journey; owner followed the controlled activation workflow and confirmed changing back and deploying, without providing a separate enabled-deployment screenshot. These are browser request observations, not additional database absence queries.

The first keyboard/middle-click attempt still had DNT=1 and produced no events; it was not accepted as an input tracking test. The repeated attempt shows DNT=null, successful HTTP 204 requests and a Krita hidden_gems/product_click at position 2. Session 61baa262-19fc-44b9-8053-3c080498ea85 passed all six owner SQL presence/linkage checks for Joplin position 1 and Krita position 2. The owner reports Tab/Enter and middle-click actions, respectively. Event payloads do not encode input modality; SQL cannot independently prove those physical actions. Owner explicitly confirmed producer=false and Ready after this round.

This packet adds that exact accepted session to knownQaSessionIds, retaining all previous exclusions. The test covers both editorial products and product-page events, ordinary-session preservation, case normalization, deduplication and validation/conflicting-ID checks before exclusion. Its synthetic fixtures are not assertions of exact cloud event counts or actual outbound actions in this particular input test.

No SQL migration, event deletion, grants, schedule, secret or environment changes. Keep ANALYTICS_PRODUCER_ENABLED=false. discoveryMetrics applies this ledger after deployment; direct SQL reports must independently filter the ledger and the approved experiment window. Public counts remain 24 products and 10 routes; the experiment has not started.

Remaining browser acceptance: quick-click unmatched behavior, continuous visibility/document-hidden reset and enabled mobile capture/transport. These are not marked complete by privacy or input QA. Author validation: 51 Node tests, TypeScript, targeted ESLint and webpack production build pass; no live event requests sent by author.

Historical hash scripts intentionally pin older versions. This packet uses review-browser-privacy-input-acceptance.mjs rather than rewriting historical QA receipts or historical review hashes.
