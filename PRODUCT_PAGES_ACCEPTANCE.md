# Issue #4 — Product Discovery Pages acceptance record

Recorded 2026-10-06. PR4.1 application commit: b7568d1. PR4.2 publication commit: c9dad66. Issue remains open; this record does not close GitHub or approve additional products.

## Confirmed production evidence

Operator screenshots confirm successful publication rehearsal and apply, all seven PR4.2 SQL checks true, and successful main push/deployment. Obsidian renders on the production domain without the local draft banner. Logseq and a nonexistent slug display the unavailable-product page. The SQL assertions confirm 30 products: one published Obsidian and 29 drafts; all three Escape Routes remain unapproved drafts. Raw evidence tables remain private.

Operator terminal output confirms 5 publication/model tests passed, lint, typecheck, production build and diff checks completed. Earlier PR4.1 validation confirmed 25 tests and four public-read SQL checks. These are separate test runs, not a claim that 30 tests ran together.

## Acceptance criteria mapping

| Issue criterion | Implementation and evidence | Remaining confirmation |
| --- | --- | --- |
| `/software/[slug]` | Structured dynamic route; production Obsidian renders | None for route availability |
| Positioning | Product short description rendered; visible in production screenshot | None |
| Why worth discovering | Supported positive attributes generate section | Inspect full production section |
| Best-for use cases | Supported audience relationships; likely labels retained | Inspect full production section |
| Verified attributes | Supported values; unknown stays Unknown; sourced negatives only | Inspect full production section |
| Verified pricing | Only verified source-backed pricing model shown | Inspect full production section |
| Platforms | Source-backed structured platform claim | Inspect full production section |
| Consider it if | Structured problem fits, with editorial confidence labels | Inspect full production section |
| Skip it if / trade-offs | Source-backed trade-off summary and honest missing states | Inspect full production section |
| Anchor products | Structured relationship type and evidence | Inspect full production section |
| Related Escape Routes | RPC returns only published, approved routes; current empty state is expected | Approved-route projection tested locally; route navigation belongs to #5 |
| Last verification date | Latest supported claim date visible in production hero | Per-claim dates: inspect full production section |
| Outbound CTA | Safe HTTP(S) URL handling tested; CTA visible in production | Click and confirm official Obsidian destination |
| Missing/unknown data | Model tests; production draft/missing pages hidden | Inspect rendered unknown attributes |
| Structured data, no hardcoded product prose | Shared renderer and RPC; local previews exercised all 30 datasets | No additional product publication required for this criterion |

## Remaining production acceptance pass

1. Scroll through the complete Obsidian page; confirm the listed sections, Unknown and likely labels, source links and dates.
2. Click Visit Obsidian and at least one source link; confirm the intended destination.
3. Check a narrow/mobile viewport for readable content and horizontal overflow. Local 390px preview passed previously; a production mobile check has not yet been reported.
4. Confirm public metadata: canonical `https://software-discovery-engine.vercel.app/software/obsidian`, index/follow, and no draft preview banner. Draft/missing pages retain noindex. Local metadata was checked previously; public metadata has not yet been independently recorded.

Once these checks pass, the shared product-page implementation can be evaluated for #4 closure. The original issue does not require publishing every seed product. Future products keep product-level publication review; all existing route publication decisions remain unchanged. Homepage/navigation (#6), Escape Route pages (#5), analytics (#8) and broader SEO (#9) retain their own scopes.
