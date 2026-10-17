# PR5.101 — Read-only privacy collision preflight

Owner accepted local route, three scoped product pages and official links after PR5.100 (HEAD ca9f971). Existing public checkpoint remains 21 products / 9 approved routes / 1 remaining route. This packet does not assert a fresh database count.

Run `supabase/verification/PR5.101_PREFLIGHT.sql` in the existing project's privileged Supabase SQL Editor. It is one SELECT with read-only CTEs. Export the single `snapshot` JSON cell and return it for review. Do not use an anonymous API response: unpublished collisions can be hidden by RLS. The snapshot contains product/research metadata and no application credentials; inspect before sharing.

The query includes exact proposed editions, generic family names and official URL matches, both Grammarly routes, memberships across all routes for matching products, claims and evidence, required taxonomy, scope columns and the anonymous private-evidence boundary. Empty collision arrays are valid results, not proof of approval. Unexpected public counts or a false evidence boundary require review before an import.

Next selective proposal will contain only three new draft edition products, 12 attribute claims, three scoped anchors and three privacy-route memberships plus their referenced evidence. Existing generic editions and unrelated route members must be retained. Never import the entire historical draft bundle. Exact slug/source/taxonomy collisions must be reconciled against this fresh snapshot before generating apply SQL. Publication is a separate decision.

No database call, data mutation, migration, import or publication is included. The pending dependency is the actual privileged snapshot, not another local UI test. The owner checkout's generated next-env.d.ts change is outside this payload.
