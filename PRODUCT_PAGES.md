# PR4.1 — Product Discovery Pages

The canonical `/software/[slug]` page renders structured graph data from Supabase. It exposes positioning, supported positive attributes, best-for audiences, likely problem fits, platforms, verified pricing models, tradeoffs, all attribute states, anchor relationship types, approved related route names, per-claim source links/dates, latest supported claim check, and an official outbound CTA.

Unknown or missing evidence stays unknown; an explicit supported negative can display No. Pricing prose appears only for a verified, source-supported pricing claim. Taxonomy descriptions are definitions, not newly inferred product facts. No product-specific prose is hardcoded into the page. Outbound links permit only HTTP(S) without credentials. Missing/unpublished products return 404; query failures use a retryable error view.

## Production data boundary

Execute `supabase/migrations/202610060002_product_discovery_page.sql` in the shared project's SQL Editor, then `supabase/verification/PR4.1_VERIFY.sql`. This migration adds one read-only function in `software_discovery` and grants execution to anon/authenticated. It changes no product status, seed data, table grants, or other schema.

The SECURITY DEFINER function uses a fixed pg_catalog search path and fully qualified objects. It filters the parent product to published, returns only source title/URL/retrieval metadata linked through current typed claims, and excludes raw fragments, notes, identifiers, unrelated sources, draft products, and unapproved routes. Existing evidence tables stay private. It accepts a parameterized slug and has no dynamic SQL or writes.

At the PR4.1 migration stage all 30 products were draft, so production `/software/obsidian` correctly returned 404. After the separately approved PR4.2 publication, Obsidian is published and the other 29 products remain draft. Do not change status merely to make a deployment screenshot show a product. Publication requires separate product-level review.

Published product pages have their canonical URL and index/follow metadata. The canonical origin defaults to the existing production domain; optional NEXT_PUBLIC_SITE_URL can override it. Draft previews are noindex/nofollow and cannot be enabled on production builds/servers.

## Local draft preview (PowerShell)

```powershell
node scripts/seed/build-editorial-fit.mjs
node scripts/seed/build-product-preview.mjs
$env:PRODUCT_LOCAL_PREVIEW = "true"
npm run dev
```

The two generators write only `.seed-output/`; do not run their seed SQL again. The preview uses the accepted structured dataset as a development fixture, not a production fallback. It does not require a service-role key or alter publication state. Generation keeps its pending review template; the actual owner acceptance stays recorded in seed/DATASET_ACCEPTANCE.md.

Open these local examples:

- http://localhost:3000/software/obsidian — supported features and a draft related route.
- http://localhost:3000/software/logseq — unconfirmed Markdown format stays Unknown.
- http://localhost:3000/software/balance — unconfirmed platforms and empty problem-fit section.
- http://localhost:3000/software/pdf24-creator — offline/core workflow.
- http://localhost:3000/software/does-not-exist — 404.

If port 3000 is occupied, use the port printed by Next.js. To stop preview mode, stop the server and remove the process variable with `Remove-Item Env:PRODUCT_LOCAL_PREVIEW`, then restart normally. `.env.local` may instead set PRODUCT_LOCAL_PREVIEW=true for local development only.

## Validation

```powershell
node --test scripts/discovery-model.test.mjs
npm run lint
npm run typecheck
npm run build
git diff --check
```

Local PostgreSQL/PGlite checks exercised the RPC as anon: draft/missing slugs return null; a locally published test product includes linked sources; raw evidence stays unreadable; unapproved routes stay hidden. Existing seed runtime checks also passed. Only the disposable local test database changed publication state.

HTTP smoke checks passed for all 30 draft previews with correct H1 and noindex; a missing product returned 404. Browser checks covered desktop and 390px mobile, with no horizontal overflow on mobile, verified CTA URL, and preview robots metadata. The operator subsequently confirmed production migration and deployment; see the acceptance record.

## Issue #4 status

PR4.1 is deployed as operator commit b7568d1. The operator confirmed all four public-read SQL checks and the expected difference between local draft preview and the unavailable production Obsidian page. PR4.2 prepares the first single-product publication review; see seed/OBSIDIAN_PUBLICATION_REVIEW.md. The owner approved only Obsidian publication and indexing on 2026-10-06; see seed/OBSIDIAN_PUBLICATION_APPROVAL.md. The operator applied the guarded SQL and confirmed all seven checks plus the public page. PR4.2 is pushed and deployed as c9dad66. PR4.1_VERIFY.sql now returns all four checks in one result and uses the still-draft Logseq slug, so it remains valid after a separately approved Obsidian release.

The requested page sections are implemented, including honest empty states and structured data rendering. Related Escape Route names are shown when approved; route navigation awaits the route pages in #5. Homepage discovery navigation (#6), click analytics (#8), and full SEO infrastructure (#9) remain their own scopes. See PRODUCT_PAGES_ACCEPTANCE.md for the remaining production acceptance checks. Keep #4 open pending template acceptance; additional product publication remains a separate review workflow.
