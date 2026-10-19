
# PR5.115 — Live sitemap, robots and canonical deployment indexing

Baseline f7016794507bec8d4a8ddfcf3a35649a6d53aba2 / owner Production132. Owner31 tests, typecheck/build and push accepted. Producer remains false; no new analytics activation, database migration, grant or environment secret in this packet. Experiment not started.

## Behavior

GET /sitemap.xml returns a dynamically generated XML inventory on the canonical Production hostname only. It reads published product identities using the existing public Supabase client, checks each through the existing product_discovery_page public RPC and includes only matching published identities. It lists only registered launch route definitions whose existing getEscape runtime loader returns a published/qualified page, preserving editorial and claim/candidate guards. Homepage included. No seed data, fixtures, private claims, service-role keys or draft fallback. Paths validated/deduplicated and sorted. No unverified lastmod/changefreq/priority values are invented. Verification dates describe claims, not last content modifications, so they are not mislabeled as sitemap lastmod.

Product inventory is bounded at500 identities and fails if that bound is reached, rather than silently emitting a truncated sitemap. This is deliberately sized for the30–40-product validation launch; larger catalogs will require explicit pagination before raising the bound. For product identity lookup/RPC errors or any route loader error, return503 + Retry-After300 with no-store, not a successful partial inventory or a blank fallback. Products absent from the public page RPC and routes withheld by their runtime gate are omitted normally. Read statuses are live but not a single database transaction snapshot; concurrent publication changes can momentarily affect the inventory. Sitemap publication is discovery assistance, not proof every URL is indexed or guaranteed error-free later.

GET /robots.txt advertises the canonical sitemap and allows public pages, disallowing /api/ on canonical production. Preview/development/production deployment aliases instead get Disallow:/ and no sitemap. Root/product/route metadata also sets noindex,nofollow on these noncanonical environments, so robots is not the sole signal. Valid public canonical pages retain index/follow and absolute canonical URLs. Unavailable/missing/draft pages retain noindex. Previously product/route metadata could allow a published page on a preview deployment; this now additionally requires canonical production.

The site origin comes from existing NEXT_PUBLIC_SITE_URL (default project production URL). It must be HTTPS root with no credentials/query/fragment/custom port; invalid config fails rather than producing a bad canonical. The host is read from the actual request Host header, not a query parameter or requested destination. Only VERCEL=1 + VERCEL_ENV=production + exact canonical host permits indexing. This is crawl policy, not authentication; robots/noindex do not protect private data. Existing RLS/public RPC boundaries remain unchanged. No search engine submission, Search Console ownership or public indexing success claimed.

The implementation uses a normal dynamic route handler for sitemap XML to control503/no-store responses on backend outages, and Next's robots metadata route. No duplicate sitemap.ts exists. Root metadata is now computed per request to keep aliases/preview off; page content and CSS are unchanged. Public product/route metadata follows the same origin/host decision. Analytics APIs already use noindex responses and remain outside the sitemap.

## Owner validation after deployment

Keep all current analytics switches unchanged, especially ANALYTICS_PRODUCER_ENABLED=false. Copy files, run README commands, inspect explicit staged files and push. No SQL or new Vercel variables needed.

1. Open https://software-discovery-engine.vercel.app/robots.txt. Expected User-Agent:*, Allow:/, Disallow:/api/, Sitemap:https://software-discovery-engine.vercel.app/sitemap.xml.
2. Open https://software-discovery-engine.vercel.app/sitemap.xml. Expected XML with homepage, current published product URLs and qualified approved route URLs only. With the accepted24products/10routes unchanged, expected35 distinct loc entries. No draft/preview/query/API URLs or made-up dates. If503, return the status; do not substitute fixtures or bypass runtime qualification. Do not assume fewer entries means permission failure: withheld public pages need investigation.
3. Open homepage, /escape/offline-notion-alternatives and /software/affine. View page source (Ctrl+U), find canonical and name=robots: canonical points to the corresponding production URL and robots permits indexing. Also verify normal links/rendering and no automatic api/events requests with producer false.
4. On the deployment-specific alias URL (same deployment, not the canonical domain), robots.txt should Disallow:/ with no sitemap; a public product/route page source should show noindex,nofollow and canonical pointing to production. Preview deployment, if available, should do the same. Authentication protection may prevent direct preview inspection; do not disable it to test crawl metadata.
5. Return robots/sitemap observations and canonical/robots snippets or screenshots. This confirms deployed output, not Google indexing. Do not replay SQL or analytics probes. No acquisition experiment starts.

## Remaining launch work

The accepted catalog is24 products, below30 verified products. Natural-language intent parsing/search, anchor/constraint interactions, Hidden Gems, remaining required analytics, enabled privacy/mobile edge QA and the rest of Issue11 readiness still remain. This packet addresses sitemap/robots/indexing signals only; it does not declare SEO acquisition or MVP launch complete.

Implementation reference: bundled Next16.3.8 docs, app metadata robots/sitemap file conventions. No new package dependency.

## Author validation

38 Node tests pass, including7 SEO scenarios covering deployment/origin guards, registered live path filtering, canonical XML, no backend reads on previews,503 on failure, runtime public RPC identity/status checks and catalog overflow/drift. TypeScript, targeted ESLint and final webpack production build pass; dynamic robots.txt/sitemap.xml endpoints appear in the build inventory. No production DB reads/writes, browser deployment QA, search engine submission or indexation verification performed by the author. Existing31 analytics/catalog/audit scenarios remain passing.
