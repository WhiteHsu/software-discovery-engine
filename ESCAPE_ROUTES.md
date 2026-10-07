# PR5.1 — Escape Route Engine foundation

Issue #4 was closed by the owner on 2026-10-07. Issue #5 remains in progress. This increment implements the shared engine and local preview, not ten published launch routes.

## Route and candidate rules

Ten validation intent definitions live in lib/discovery/escape-model.ts. Candidates come from curated escape_route_products membership, not all products with matching keywords. For launch qualification, each candidate needs a safe official website, a dated source-backed verified alternative relationship to the configured anchor (or verified productivity audience for the generic buy-once route), verified positive boolean constraint claims, and meaningful verified pricing/trade-off claims.

The evidence confidence quality floor is 0.80, calculated as the minimum confidence across all required claims. Missing, invalid, likely or unsupported required claims fail qualification. This is an evidence-confidence gate, not a claim of hands-on product quality. The stricter launch rule excludes provisional likely relationships accepted into the draft seed dataset.

Eligible candidates rank by evidence confidence plus at most 0.05 novelty bonus. Missing/out-of-range novelty is zero. Ineligible candidates never receive a score or novelty rescue. Slug breaks ties deterministically; duplicate memberships are deduplicated. Popularity is not an input. Stored position and free-form editorial notes are not used as factual recommendation evidence. Recommendation reasons and source details derive from qualifying structured claims.

Public /escape/[slug] requires a published, editorially approved route and at least three unique qualified published products. It reads existing RLS-scoped graph rows and the PR4.1 product RPC with the public key; it does not use service-role credentials or grant raw evidence access. Data API graph permissions are unchanged; the new threshold governs the public website rendering, not a new database publication constraint. Failed reads show a retryable error, while draft/missing/underqualified routes return the unavailable page. Qualified routes are linked from product pages; nonqualifying route links are filtered out.

Only NODE_ENV=development plus PRODUCT_LOCAL_PREVIEW=true enables local draft fixtures. Preview pages show draft banners, blockers, noindex/nofollow and may show fewer than three candidates for review. Production never falls back to those files.

## Current content gaps

The accepted fixture contains three route records, not ten. Offline Notion and no-AI Notion each have two qualifying draft candidates. Obsidian's Notion relationship remains likely, so its public product approval does not qualify it for an offline Notion launch route. Simple Notion has no curated candidates.

Seven remaining intents have no curated membership. One-time-purchase, no-subscription and privacy-friendly taxonomy/evidence are not yet present; Photoshop also lacks an anchor definition and the generic buy-once route lacks a productivity audience definition. Existing PDF and meditation ecosystems map to adobe-pdf and calm. These proposed rubric keys require explicit definition and source review before content import. Free core use is not automatically a one-time purchase; privacy is not inferred from a product name. No missing claim is fabricated to fill a route.

Run scripts/escape-readiness.mjs to produce the ten-route gap inventory. It evaluates draft fixture evidence, not current production publication status. No route is launch-ready from the current public scope. Future reviewed graph inputs can use these same page templates; #5 cannot close until the route-content and publication acceptance criteria are satisfied.

## Local review and validation

```powershell
node scripts/seed/build-editorial-fit.mjs
node scripts/seed/build-product-preview.mjs
node scripts/escape-readiness.mjs
$env:PRODUCT_LOCAL_PREVIEW = "true"
npm run dev
```

Open /escape/offline-notion-alternatives for the two-candidate comparison and Obsidian blocker, /escape/notion-alternatives-without-ai for the opt-in AI rule, and /escape/simple-notion-alternatives for an honest empty state. All ten slugs appear in .seed-output/escape/readiness.json. Follow candidate links to /software/[slug]. Do not rerun seed SQL or set preview variables on Vercel.

Eight model/ranking tests passed. Lint/typecheck/build passed; all ten local preview HTTP routes returned the correct headings and noindex, and a missing route returned 404. Browser QA confirmed comparison content, evidence sources, disqualified-candidate reasons and a 390px mobile viewport without whole-document overflow. The wide comparison table scrolls within its own container.

Next increment: review taxonomy definitions and complete candidate/evidence inputs across all ten routes, then prepare guarded product/route publication review and production verification. This package contains no database writes or publication approvals.
