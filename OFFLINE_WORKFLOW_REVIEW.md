# PR5.11 — bounded native offline workflow review

Reviewed 2026-10-08. Publication approval is false. This packet contains no SQL or remote database writes.

The comparison covers personal offline notes and locally available organized content in installed native workspaces, after setup. AFFiNE, AppFlowy and Anytype share the `personal-offline-note-object-organization` relationship scope. Full Notion replacement, team collaboration, guaranteed migration fidelity and complete offline caching of Cloud content are outside the review.

Eight primary sources and reviewed statements/limitations are recorded in `seed/research/offline-workflow-review-2026-10-08.json`. The generator pins that exact review and three prior product fingerprints plus the route fingerprint. The review updates six AFFiNE/AppFlowy attributes and their two existing Notion alternative claims, retaining historical evidence pointers. Anytype retains its PR5.10 evidence and bounded scope; other products, audiences, problems, route memberships and lifecycle remain unchanged.

- [AFFiNE desktop download](https://affine.pro/download): local docs/databases/whiteboards; optional Cloud sync. Mobile capture/review differs from the complete desktop experience.
- [AFFiNE plans](https://affine.pro/pricing): distinguish free local editing, Cloud plans, AI add-ons, Believer terms and editor/backend licensing. Exact prices/limits are not frozen here.
- [AFFiNE import](https://affine.pro/blog/import-your-data-from-notion-into-affine): HTML/Markdown import exists, with an explicit warning about incomplete feature mapping.
- [AppFlowy native overview](https://docs.appflowy.io/docs): offline native workspace; no claim that every Cloud page or attachment is already available locally.
- [AppFlowy plans](https://appflowy.com/pricing): free Personal Cloud limits and renewing per-member Pro; local and self-hosted terms are distinct.
- [AppFlowy import](https://docs.appflowy.io/docs/guides/import-from-notion): documented hosted zip upload and email completion. Export without files/images omits those assets; this hosted flow needs connectivity.
- [AppFlowy comparison](https://appflowy.com/compare/notion-vs-appflowy): native offline workspace and remaining integration/view limitations. Vendor marketing is not treated as a full parity guarantee.
- [Notion offline help](https://www.notion.com/en-gb/help/use-pages-offline): Notion already supports offline desktop/mobile pages, with page/device preparation and feature limits. No claim that Notion cannot work offline.

The offline engine now rejects missing/broadened relationship scope and empty scope descriptions even with high confidence/novelty. Todoist's existing qualification behavior remains unchanged. Three local offline drafts qualify, zero are published and publishable=false. Obsidian remains excluded from this offline comparison. Production still has four published products and the one approved Todoist route.

Use only `node scripts/seed/build-offline-workflow.mjs` to reconstruct the complete current draft workflow. It reads versioned research, not patched preview output, and can be repeated. Earlier intermediate generators may show fewer eligible candidates under the new scope gate; their previous publication artifacts should not be regenerated or executed for this packet.

Validation: 65 tests passed; lint, typecheck and production build passed. The workflow was regenerated twice with identical outputs. Local HTTP checks cover the route and three product pages; browser/source/CTA acceptance is separate. The owner supplied successful PR5.10 local page screenshots after pushing 0cb6c33 on 2026-10-08.

Next: prepare a separate selective draft import with exact before/after guards for these eight AFFiNE/AppFlowy claims and Anytype's four PR5.10 claims. Preserve omitted claims, historical evidence, published Obsidian/Things/OmniFocus/2Do and the approved Todoist route. Route publication requires a later concrete review and owner approval.
