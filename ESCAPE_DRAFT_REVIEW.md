# PR5.4 — Reviewed local draft graph

This packet applies the four PR5.3 dossiers to a separate local draft graph: 2Do, GIMP, Krita and Paint.NET. It generates 34 product previews and ten research route previews. It does not import a graph, generate SQL, write to Supabase or approve publication.

The dated review records 22 claims: 17 verified documentary claims (including four platform claims) and five likely editorial claims. Verified means supported by the cited official documentation within the stated edition/workflow; it does not mean hands-on testing. Four alternative relationships and 2Do's productivity audience remain likely and cannot pass route qualification. Existing baseline products are preserved without changing their claim values.

Krita's historical Photoshop migration guide describes version 2.9. Current trade-offs use the current FAQ instead; the old guide is retained only as context for the likely comparison relationship. The review records URLs, scope, decisions and reasons. The builder pins the proposal digest and rejects changed proposals, missing decisions, unsafe sources, inference promotion and publication approval.

## Generation and preview

Run the existing baseline generators, then `node scripts/seed/build-escape-draft.mjs`. Separate outputs appear under `.seed-output/escape-draft/`: full bundle, four-product delta, product previews and review report. The delta contains no routes or publication decisions. It is a review artifact, not an import instruction.

In development, enable both `PRODUCT_LOCAL_PREVIEW=true` and `ESCAPE_DRAFT_PREVIEW=true` before starting the server. Both product and route readers select the same fixed draft files. Without the second flag, existing baseline previews are selected. Production and test environments ignore both flags.

## Qualification and validation

Offline Notion and no-AI Notion still have two qualified draft candidates each; the other eight routes have zero. Research membership does not imply qualification. All products/routes in this generated local graph remain draft and route approval is false. #5 remains open: each launch route still requires editorial approval and at least three unique qualified published products.

Validation: 18 tests passed; lint, typecheck and production build passed. Local HTTP checks covered four new product pages, ten routes and an unknown product (404); existing pages returned noindex/nofollow. Browser navigation from Krita to the Photoshop route showed three candidate cards, their missing verified alternative relationship, and the publication block.
