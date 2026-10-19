
# PR5.116 — First editorial Hidden Gems surface

Baseline e9d438384a3093b1b1260ac99cfefbf83f94c980 / owner Production133,38 tests/typecheck/build passed. Owner supplied canonical robots/sitemap35loc, product+route index/follow/canonical, alias Disallow:/ and alias product noindex/nofollow with production canonical. Frozen SEO evidence is seo-deployed-acceptance-2026-10-19.json. No actual search indexation is inferred.

## Editorial scope

Added /hidden-gems with3 fixed selections: Joplin for personal notebooks, Krita for digital painting and PDF24 Creator for Windows personal PDF page organization. Selection reasons are editorial summaries of previously reviewed scopes, not new hands-on tests, popularity measurements or a claim that these products are unknown. Existing accepted public products/routes are reused; no new product publication, evidence claim, seed import or database changes. Curation/source pins are in hidden-gems-curation-2026-10-19.json.

Cards preserve the exact live alternative-relationship description, pricing-model value and trade-off-summary value. Edition/platform/task limits remain visible, including Markdown/sync setup and Notion parity limits, Krita PSD/text/layer differences, and PDF24 Windows page organization versus broader editing or online tools. Scope/price/tradeoff source links are deduplicated and rendered as safe external links. Evidence date conservatively uses the oldest required fit claim verification date; it is not a new verification, last page update or lifetime guarantee.

## Publication and failure behavior

Read only the existing public getEscape path. Every selected source route must be published and satisfy current runtime qualifications with at least3 eligible published members. The pure selector recomputes rankEscapeCandidates so a stale eligible flag cannot bypass changed sources, confidence, constraints, pricing, trade-offs or relationship scope. The selected product must itself remain published and eligible in its reviewed source route. No replacement pick is auto-generated if one is withdrawn.

The homepage adds an explicit hero link plus a lower editorial introduction. Hidden Gems cards lead to canonical product pages and their comparison pages; official outbound remains on product pages. No new direct product-outbound shortcut, user ranking input or generated recommendation. Existing layout colors/typography and responsive patterns are reused. Sources use native details/summary; links have visible keyboard focus. Actual browser/mobile/keyboard visual QA remains owner work.

An empty collection renders an availability message and comparison link; a partial collection shows only qualified cards with an availability notice. Empty/partial collections are noindex,nofollow and omitted from sitemap. Only all3 qualifying picks allow canonical Production index/follow and /hidden-gems in sitemap. Aliases/previews remain noindex/nofollow via shared SEO policy. Backend read errors propagate as server errors, with no fixture fallback; sitemap uses the existing503 handler. Sitemap products/routes are unchanged; with all existing24/10 plus this page, expected loc count36. No lastmod invented. Publication can change between live reads; this is not an atomic snapshot.

## Instrumentation boundary

This packet adds the discovery surface, not its dedicated analytics contract/storage extension. /hidden-gems has NO tracker or fabricated escape-route context. Existing product page view/outbound collection remains independently gated and cannot establish Hidden Gems impression/click CTR or source attribution. Keep ANALYTICS_PRODUCER_ENABLED=false; do not turn it on to test this page. Full Hidden Gems instrumentation and enabled browser privacy/mobile/transport edge QA remain launch blockers. No demand/CTR results or experiment Day0 are claimed.

## Owner deployment QA

Copy files, run README checks, inspect explicit staging and push. No SQL, secrets or environment changes needed. Use only the new review-hidden-gems script for this stage; prior SEO scripts pin their historical source bytes and can report intentional drift after sitemap integration changes.

After Ready/Current:
1. Open homepage; hero Hidden Gems link and lower introduction both reach /hidden-gems.
2. Expect3 cards in editorial order Joplin/Krita/PDF24 Creator. Read scope, pricing and trade-offs; compare product and comparison links, source disclosures and safe external source destinations. No broad privacy/platform/parity promises should replace scoped live text.
3. Follow each product link; ordinary pages/official links remain usable. No automatic api/events requests with producer false.
4. Narrow viewport to mobile width or use a phone: cards/details should stack with readable text and no horizontal overflow. Tab navigation must visibly focus links and source disclosure; Enter/Space operate native controls. Do not infer this passed from build output.
5. Canonical /hidden-gems page source should show production canonical and index/follow when all3 cards qualify. Alias version should show noindex/nofollow and the same production canonical. Canonical sitemap should contain /hidden-gems once and normally36loc total; existing robots policies stay the same.
6. Return page screenshot and sitemap count first; no database mutation or analytics probe required.

## Validation and next launch gaps

44 Node tests pass, including6 collection tests rebuilt from the pinned historical sourced graph and owner-accepted publication identities. They simulate current statuses; they are not a new live DB query. Tests cover all3 selections, mutation-free scope/value reuse, withheld products/routes, changed evidence despite stale flags, insufficient route membership, partial-index policy, conservative dates/source deduplication and the dedicated sitemap URL. TypeScript, targeted ESLint and final webpack build are checked separately. Owner visual/live qualification checks are still required.

The catalog remains24 accepted products, below the30-product target. Natural-language discovery/intent parsing and its telemetry, anchor/constraint selections, Hidden Gems telemetry, enabled privacy/mobile edge QA and remaining Issue11 requirements are not complete. This surface is one step toward that launch, not a declaration that the MVP or experiment is ready.

Final author validation: TypeScript, targeted ESLint and final webpack production build pass; /hidden-gems appears in the dynamic route inventory. Existing38 regression scenarios plus6 collection scenarios pass. The final collection-identity guard was retested with all6 collection scenarios, typecheck/lint/build. No live public page was fetched and no visual browser QA is claimed for this new surface. No secret values or production DB commands accessed.
