import { createHash } from "node:crypto";
import { validateSeedBundle } from "./validate.mjs";

const relationships = [
  ["attributes", "product_attributes", "attribute_id", "product_attribute_evidence"],
  ["anchors", "product_anchors", "anchor_id", "product_anchor_evidence"],
  ["problems", "product_problems", "problem_id", "product_problem_evidence"],
  ["audiences", "product_audiences", "audience_id", "product_audience_evidence"],
];
const ref = (table, key, value) => ({ $ref: { table, where: { [key]: value } } });
const ordered = (rows) => [...rows].sort((a, b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : JSON.stringify(a) > JSON.stringify(b) ? 1 : 0);
const metadata = (claim) => ({
  confidence: claim.confidence ?? null,
  verification_status: claim.verificationStatus,
  last_verified_at: claim.lastVerifiedAt ?? null,
});

// Reviewable local plan only. UUIDs are resolved by a future privileged importer.
export function createDatabasePlan(bundle) {
  const errors = validateSeedBundle(bundle);
  if (errors.length) throw new Error(errors.join("\n"));
  for (const route of bundle.escapeRoutes) {
    const seen = new Set();
    for (const entry of route.products) {
      if (seen.has(entry.productSlug)) throw new Error(`Duplicate route membership: ${route.slug}/${entry.productSlug}`);
      seen.add(entry.productSlug);
      if (entry.position != null && (!Number.isInteger(entry.position) || entry.position <= 0)) {
        throw new Error(`Invalid route position: ${route.slug}/${entry.productSlug}`);
      }
    }
  }
  const tables = [];
  const add = (table, conflictColumns, rows) => tables.push({
    table, operation: "upsert", conflictColumns, rows: ordered(rows),
  });
  const replacements = [];
  add("evidence_sources", ["seed_key"], bundle.sources.map((source) => ({
    seed_key: source.key, source_type: source.sourceType, title: source.title,
    url: source.url ?? null, publisher: source.publisher ?? null, retrieved_at: source.retrievedAt,
  })));
  for (const table of ["anchors", "attributes", "problems", "audiences"]) {
    add(table, ["slug"], bundle[table].map((node) => ({
      slug: node.slug, name: node.name, description: node.description ?? null,
      ...(table === "attributes" ? { category: node.category, value_type: node.valueType } : {}),
    })));
  }
  add("products", ["slug"], bundle.products.map((product) => ({
    slug: product.slug, name: product.name, short_description: product.shortDescription ?? null,
    website_url: product.websiteUrl ?? null, status: product.status,
  })));
  const fragments = [];
  const links = [];
  const definitions = new Map(bundle.attributes.map((attribute) => [attribute.slug, attribute]));
  for (const [collection, table, foreignKey, linkTable] of relationships) {
    const rows = [];
    const associations = [];
    for (const product of bundle.products) {
      const seen = new Set();
      for (const claim of product[collection]) {
        const identity = [product.slug, collection, claim.slug, ...(collection === "anchors" ? [claim.relationshipType] : [])];
        const key = JSON.stringify(identity);
        if (seen.has(key)) throw new Error(`Duplicate claim identity: ${key}`);
        seen.add(key);
        const where = {
          product_id: ref("products", "slug", product.slug),
          [foreignKey]: ref(collection, "slug", claim.slug),
          ...(collection === "anchors" ? { relationship_type: claim.relationshipType } : {}),
        };
        const row = { ...where, ...metadata(claim) };
        if (collection === "anchors") {
          row.relationship_scope = claim.scope ?? null;
          row.scope_description = claim.scopeDescription ?? null;
        }
        if (collection === "attributes") {
          Object.assign(row, { value_boolean: null, value_text: null, value_number: null, value_enum: null });
          row[`value_${definitions.get(claim.slug).valueType === "boolean" ? "boolean" : definitions.get(claim.slug).valueType}`] = claim.value;
        }
        rows.push(row);
        // Includes empty evidence: re-import must clear stale seed-managed links.
        replacements.push({
          table: linkTable, where, ownership: { fragmentSeedKeyPrefix: "seed-claim:" },
          desiredFragmentKeys: [...new Set(claim.evidence)].map((sourceKey) => {
            const seedKey = "seed-claim:" + createHash("sha256").update(JSON.stringify([...identity, sourceKey])).digest("hex");
            fragments.push({ seed_key: seedKey, evidence_source_id: ref("evidence_sources", "seed_key", sourceKey), excerpt: null,
              notes: `Seed source reference for ${key}. Source content is not embedded; this pointer is not an independently verified quotation.` });
            associations.push({ ...where, claim_evidence_id: ref("claim_evidence", "seed_key", seedKey) });
            return seedKey;
          }).sort(),
        });
      }
    }
    add(table, ["product_id", foreignKey, ...(collection === "anchors" ? ["relationship_type"] : [])], rows);
    links.push([linkTable, ["product_id", foreignKey, ...(collection === "anchors" ? ["relationship_type"] : []), "claim_evidence_id"], associations]);
  }
  add("claim_evidence", ["seed_key"], fragments);
  for (const args of links) add(...args);
  add("escape_routes", ["slug"], bundle.escapeRoutes.map((route) => ({
    slug: route.slug, name: route.name, description: route.description ?? null,
    anchor_id: route.anchorSlug ? ref("anchors", "slug", route.anchorSlug) : null,
    status: route.status, editorially_approved: route.editoriallyApproved,
    last_verified_at: route.lastVerifiedAt ?? null,
  })));
  add("escape_route_products", ["escape_route_id", "product_id"], bundle.escapeRoutes.flatMap((route) => route.products.map((entry) => ({
    escape_route_id: ref("escape_routes", "slug", route.slug), product_id: ref("products", "slug", entry.productSlug),
    position: entry.position ?? null, editorial_note: entry.editorialNote ?? null,
  }))));
  return {
    version: 1, schema: "software_discovery", mode: "review-only",
    requiredMigration: "202610060001_seed_claim_evidence_mapping.sql",
    transactionRequired: true,
    preconditions: [
      "Use a privileged database role; never anon/authenticated or browser credentials.",
      "Serialize imports with a transaction-scoped advisory lock and abort unresolved or ambiguous references.",
      "Require an explicit ownership manifest before replacing route membership or updating previously curated claims/editorial states.",
      "Resolve existing node IDs by unique slug and evidence IDs by unique seed_key; do not allocate replacement IDs.",
    ],
    tables, evidenceReplacements: ordered(replacements),
    routeMembershipReplacements: ordered(bundle.escapeRoutes.map((route) => ({
      where: { escape_route_id: ref("escape_routes", "slug", route.slug) },
      desiredProductSlugs: route.products.map((entry) => entry.productSlug).sort(),
      requiresExclusiveRouteOwnership: true,
    }))),
    deletionPolicy: "No product, relationship, source, or fragment deletion. Replace only seed-managed evidence links for included claims and membership for explicitly seed-owned routes. Omitted claims are retained.",
  };
}
