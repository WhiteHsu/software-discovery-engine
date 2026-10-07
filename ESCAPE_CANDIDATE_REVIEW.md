# PR5.3 — Four additional candidate dossiers

Owner pushed PR5.2 as 7ab09a4. This increment fills the research-name gaps, not the launch qualification gaps. All ten research shortlists now contain at least three names. Only the existing AFFiNE/AppFlowy evidence qualifies on the two previously supported Notion routes; this packet creates no additional qualified or published candidate.

## New source dossiers

Four proposed draft identities and eighteen claim proposals are stored in seed/research/escape-candidates-2026-10-07.json. Sources were checked on 2026-10-07. Every proposal remains pending. Direct documentary statements are separated from editorial relationship/audience inferences. No confidence score or verified claim is inferred from the fact that research was performed.

| Candidate | Proposed route | Source-supported scope | Remaining review |
| --- | --- | --- | --- |
| 2Do | Todoist buy-once; productivity buy-once | Direct Mac license remains usable after its 18-month update entitlement. Mobile purchases are separate. | Scoped Todoist relationship, platform/channel and future-update limitations |
| GIMP | Photoshop no-subscription | Official free GPL desktop editor; FAQ describes RAW plug-ins and CMYK limitations. | Retouching/composition fit, release/platform and interchange scope |
| Krita | Photoshop no-subscription | GPL painting application; official Photoshop migration guide documents tool/layer differences. | Painting-oriented fit and current release/platform scope |
| Paint.NET | Photoshop no-subscription | Free Classic distribution; paid Store channel; proprietary application license. | Basic layered-editing fit, Windows requirements and interchange/plugin limits |

Official sources: [2Do license terms](https://www.2doapp.com/store/), [2Do workflows](https://www.2doapp.com/), [GIMP overview](https://www.gimp.org/about/), [GIMP FAQ](https://www.gimp.org/docs/userfaq.html), [Krita license](https://krita.org/en/about/license/), [Krita Photoshop migration manual](https://docs.krita.org/en/user_manual/introduction_from_other_software/introduction_from_photoshop.html), [Paint.NET license](https://www.getpaint.net/license.html), [Paint.NET features](https://paint.net/features.html).

Krita's painting focus and Paint.NET's basic layered editing must be visible if those relationships are later approved. Three image-tool names do not establish three legitimate Photoshop replacements for every workflow. 2Do's documented Todoist integration does not prove that it replaces Todoist; that classification is an explicit pending editorial decision.

## Review tool

```powershell
node scripts/seed/build-editorial-fit.mjs
node scripts/seed/build-product-preview.mjs
node scripts/escape-candidate-research.mjs
node --test scripts/escape-candidate-research.test.mjs scripts/escape-content-review.test.mjs scripts/escape-model.test.mjs scripts/discovery-model.test.mjs
npm run lint
git diff --check
```

The generated .seed-output/escape/candidate-research.md contains the ten-route matrix, source links, edition scope, pending proposals and reviewer fields. candidate-research.json contains the corresponding machine-readable report. The earlier PR5.2 content-review output remains a baseline research report; it is not overwritten.

The generator uses copies of inputs, adds identities only to its in-memory research worklist and passes empty claim arrays for those identities to the qualification engine. Proposed values and sources never become factual graph claims automatically. No accepted seed fixture, product preview, public website or database record changes. No SQL is generated.

Validation: fourteen tests and lint passed. Tests cover nonmutation, no qualification from pending proposals, duplicate/colliding identities, invented routes/taxonomy, unsafe sources and attempted publication or verification promotion. Accepted fixture/preview hashes remained unchanged after report generation.

## Remaining work

Review the eighteen proposals and resolve edition/platform/relationship gaps. Prepare an explicit draft graph supplement with source metadata and reviewed claim decisions, preserving the published Obsidian record. Complete evidence for the other eight route intents too. Publication remains a separate decision: each route requires editorial approval and at least three unique qualified published products. #5 stays open.

Discovery limitation: Stripe Directory CLI was unavailable and its documentation URL could not be read by the web tool, so candidate research used official project/vendor websites. Directory ranking or popularity was not used as evidence or an organic ranking input.
