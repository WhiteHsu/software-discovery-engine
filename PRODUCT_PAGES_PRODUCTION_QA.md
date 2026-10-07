# Issue #4 — Production browser QA, 2026-10-07

Acceptance documentation commit 80a8828 was pushed and deployed successfully according to operator screenshots. Agent independently inspected the production site on 2026-10-07 using the Codex in-app browser.

## Passed

- Obsidian canonical product page loads, with no local draft banner.
- Complete DOM includes positioning, supported discovery features, best-for audiences, Consider it if, platforms, verified pricing, trade-offs, attribute details, Notion relationship, and the honest empty related-route state.
- Unknown attributes remain Unknown; editorial audience/problem/anchor relationships retain likely labels. Verification dates and linked sources appear beside supported claims.
- Canonical is https://software-discovery-engine.vercel.app/software/obsidian and robots is index, follow.
- At a 390 x 844 viewport, screenshot showed readable stacked content. DOM measurements: innerWidth 390, document scrollWidth 375, no main descendants extended beyond the viewport's right edge. This checks browser emulation, not a physical phone.
- Logseq remains unavailable and robots is noindex, nofollow.
- Official CTA href is https://obsidian.md/; the destination independently loaded with title Obsidian - Sharpen your thinking.
- Pricing source href is https://obsidian.md/pricing; the destination independently loaded with title Pricing - Obsidian.

## Remaining click confirmation

The agent clicked the Visit Obsidian link, but the in-app browser did not expose a resulting new tab. Correct rendered href and reachable destination are confirmed; actual new-tab click behavior in the operator's Chrome remains unconfirmed. This limitation is not evidence of an application failure.

Operator final check: in Chrome, click Visit Obsidian and the pricing source link, and confirm that their intended official pages open. If both work, the remaining #4 production acceptance checks have evidence. Prepare the closeout record at that point; this document does not close GitHub or authorize any additional product/route publication.

Other 29 products and all Escape Routes retain their existing draft scope. No SQL, application code or remote publication changes were made during this QA.