# PR5.14 — Bounded raster workflow draft review

Prepared and sources reviewed: 2026-10-12. Issue #5 remains open: production has seven published products and two of ten required published routes after the owner's PR5.13 approval and acceptance.

## Decision and scope

GIMP, Krita and Paint.NET qualify as three **local draft** candidates for `photoshop-alternatives-without-a-subscription`, strictly within `desktop-raster-layers-painting-basic-adjustment`.

This covers desktop raster layers, painting and basic image adjustment. It does not establish full Photoshop parity, PSD round-trip fidelity, professional RAW/print workflows, automation, AI or team workflows. Alternative fit is a bounded editorial inference from documentation on both sides of the comparison; no hands-on editing, file interchange or printing was tested.

Free official releases meet the no-subscription constraint; they are not classified as paid perpetual licenses. GIMP and Krita are free software; Paint.NET Classic is proprietary freeware. Optional store/cloud offers have separate terms. Prices are not frozen in this packet.

## Reviewed graph

- Twelve attributes: no-subscription, pricing model, trade-off summary and supported platforms for each candidate.
- Three Photoshop alternative anchors: verified editorial classification, confidence 0.85, exact scope and explicit limitations. Documentary attribute confidence is 0.95.
- Twelve primary sources. Historical evidence pointers remain attached.
- Existing route member identities retained; notes bounded to scope and novelty scores set to zero.
- All 34 local products remain draft; all ten local routes remain draft/unapproved. Other products, audiences, problems and route memberships remain intact.

The generator pins the entire review manifest plus the target product/route baselines. Drift, published input or repeated patch application aborts. The CLI instead reconstructs from versioned research each time, making command reruns deterministic. Exact scope and meaningful scope description are now required by this route's engine gate. Draft qualification cannot satisfy public publication requirements.

## Primary sources and practical limits

The comparison anchor uses [Adobe Photoshop's official editing overview](https://www.adobe.com/products/photoshop.html).

GIMP's [overview](https://www.gimp.org/about/), [FAQ](https://www.gimp.org/docs/userfaq.html), [layer manual](https://docs.gimp.org/3.0/en/gimp-image-combining.html) and [desktop downloads](https://www.gimp.org/downloads/) support free desktop retouching/composition and layer workflows. RAW processing involves external tools/plugins; native CMYK editing is outside this review.

Krita's [downloads](https://krita.org/en/download/), [license](https://krita.org/en/about/license/), [Photoshop workflow introduction](https://docs.krita.org/en/user_manual/introduction_from_other_software/introduction_from_photoshop.html) and [PSD format manual](https://docs.krita.org/en/general_concepts/file_formats/file_psd.html) support free desktop painting and bounded layer/adjustment work. Painting is its main focus; PSD/text/layer semantics need review. The introductory comparison contains historical software context, so its old UI/version examples are not treated as current exhaustive feature claims.

Paint.NET's [features](https://paint.net/features.html), [downloads](https://paint.net/download.html) and [license](https://paint.net/license.html) support Windows layers, drawing, selections and adjustments in the free Classic release. Its native layered format is PDN; plugin availability does not establish PSD fidelity. Review current Windows/CPU/GPU requirements.

The precise dated claim text and source mappings are in `seed/research/raster-workflow-review-2026-10-12.json`.

## Verification and preview

75 tests passed, including preservation, scope rejection, drift rejection, deterministic reconstruction and draft publication blocking. Lint, typecheck and production build passed. Four HTTP preview pages returned 200 with draft indicators and bounded descriptions.

```powershell
node scripts/seed/build-raster-workflow.mjs
$taskTests = @(rg --files scripts -g '*.test.mjs')
node --test @taskTests
npm run lint
npm run typecheck
npm run build
git diff --check
```

For local previews only:

```powershell
$env:PRODUCT_LOCAL_PREVIEW = 'true'
$env:ESCAPE_DRAFT_PREVIEW = 'true'
npm run dev
```

Open `/escape/photoshop-alternatives-without-a-subscription` and `/software/gimp`, `/software/krita`, `/software/paint-net`. Check all three qualify, the draft/publication block remains, bounded caveats appear, and product/source links open. Stop the server with Ctrl+C; remove the two preview variables afterward with `Remove-Item Env:PRODUCT_LOCAL_PREVIEW, Env:ESCAPE_DRAFT_PREVIEW`.

## Following step

This packet contains no SQL, database import, publication or remote writes. Production progress remains two of ten routes. After local acceptance, prepare a selective draft import that preserves seven published products, both published routes and private evidence boundaries. Publication review follows separately.
