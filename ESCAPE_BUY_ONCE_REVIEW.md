# PR5.5 — Buy-once edition evidence

Owner pushed PR5.4 as fdda4e6. This increment applies eight scoped purchasing facts to Things and OmniFocus within the local PR5.4 draft preview. It updates only one-time-purchase, no-subscription, pricing-model and trade-off-summary for those two products. No alternative or audience judgment is promoted. Research route membership, product status and approval remain unchanged.

Sources checked on 2026-10-07:

- [Things official purchase support](https://culturedcode.com/things/support/articles/2803552/): Things 3 platform applications are separate upfront purchases; Watch comes with iPhone. Sync has no extra charge. Non-Apple and browser use are unsupported; real-time shared lists are unsupported. No promise about free future major versions is made.
- [OmniFocus official purchasing](https://www.omnigroup.com/omnifocus/buy/): the native v4 permanent license includes 4.x updates and listed Apple platforms. Future major upgrades are separate. Optional Web access recurs and requires native setup plus a connection; the all-access subscription is a different offer. No numeric regional prices are fixed in the draft.

The dated review packet records the expected prior values, edition scope and allowed official URLs. The builder rejects baseline drift, missing/duplicate/unsupported claims, unsafe or unexpected sources, publication approval and published input. Documentary verification does not imply hands-on testing or complete Todoist replacement.

Generate the PR5.4 draft first, then run build-buy-once-draft.mjs once. It replaces only local bundle/product-preview files and writes buy-once-review.json. Repeating the whole generation sequence is supported; running only the last step twice intentionally rejects prior-value drift. The baseline 30-product fixtures and the PR5.4 four-new-product delta are not modified. The updated bundle is not an import instruction; no SQL or database writes occur.

Twenty-one tests and lint passed. Local HTTP checks confirmed Things and OmniFocus show updated caveats, the draft banner and noindex/nofollow. No TypeScript/application code changed. Qualified candidate counts remain unchanged: two each for offline/no-AI Notion, zero for the remaining routes. #5 is open; route relationships and audience evidence still need scoped review before publication.
