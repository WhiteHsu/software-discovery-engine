# PR5.2 — Escape Route content preflight

PR5.1 was pushed to main as 814a126 by the owner on 2026-10-07. Issue #5 is still in progress.

This increment produces a review worklist for all ten route intents. Research shortlists are not curated membership approvals. It deliberately leaves the accepted fixture, local website preview and production dataset unchanged. The report evaluates existing evidence against proposed research candidates; a passing evidence result alone does not approve membership or publication.

## Proposed taxonomy

The research JSON defines no-subscription, one-time-purchase, privacy-friendly, the Photoshop anchor and a productivity audience. These definitions are proposals for review, not imported graph rows.

No-subscription includes a meaningful free or perpetual licensed workflow with optional services disclosed. One-time-purchase requires a paid non-recurring edition; free tools do not qualify merely because they have no subscription. A perpetual version license does not promise free future upgrades. Privacy-friendly requires edition-specific evidence about text processing, retention, training and third parties; open source or a homepage privacy slogan is insufficient.

Simple Notion keeps the three existing note-focus, database-free and setup criteria. A candidate cannot inherit a verified Notion relationship from publication status or general category similarity. PDF candidates need explicit editing-operation limits rather than blanket Acrobat equivalence. Meditation source review does not make health or therapeutic claims.

## Source observations

Seven official pages were checked on 2026-10-07 and short paraphrases recorded with edition caveats. Every observation remains pending and is excluded from qualification. No numerical confidence is manufactured from an AI review.

- Medito: official page supports a free app with no premium tier or paywall. [App](https://meditofoundation.org/medito-app/)
- PDF24 Creator: official page supports free private/commercial use of the Windows offline application. Free use is not a purchase. [Creator](https://tools.pdf24.org/en/creator)
- PDF-XChange Editor: official FAQ describes perpetual paid licensing and one year of maintenance. Edition features and future updates still require scoped review. [License and features](https://www.pdf-xchange.com/product/pdf-xchange-editor)
- Healthy Minds Program: official FAQ supports a free donor-funded app and registration; separate paid offerings must be distinguished. [App FAQ](https://www.humin.org/wellbeing-tools/app)
- LanguageTool: the add-on's no-storage statement does not establish all processing, retention or AI policies. Classification remains unknown. [Overview](https://languagetool.org/)
- OmniFocus: overview offers purchase or subscription; perpetual terms and Web entitlement need a detailed license review. [Overview](https://www.omnigroup.com/omnifocus/)
- Things: separate Apple applications and regional store pricing do not alone establish license/upgrade scope. [Overview](https://culturedcode.com/things/)

## Generate the review packet

```powershell
node scripts/seed/build-editorial-fit.mjs
node scripts/seed/build-product-preview.mjs
node scripts/escape-content-review.mjs
node --test scripts/escape-content-review.test.mjs scripts/escape-model.test.mjs scripts/discovery-model.test.mjs
```

Read .seed-output/escape/content-review.md for the ten-route matrix, candidate blockers and missing taxonomy/anchor/audience keys. The JSON report is suitable for later scoped review tooling. It does not replace escape-readiness.json, which continues to assess accepted curated memberships.

Todoist buy-once has only two research candidates; a third must be researched. Photoshop has none in the existing fixture and requires a new ecosystem review. Other routes have research shortlists but incomplete evidence. A three-name shortlist is not three legitimate qualified candidates.

The checker rejects invented product identities, duplicate/omitted route definitions, duplicate candidates, missing required taxonomy proposals, unsafe URLs, non-pending observations and publication flags. It never merges observations into product claims. No SQL is supplied. Do not rerun seed import SQL for this packet.

Next: complete primary-source reviews, record correction/edition scope and reviewer decisions, then prepare a separately reviewable draft graph change. Product and route publication require their own approval and at least three unique qualified published candidates per route. #5 remains open.
