import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import { createDatabasePlan } from "./database-plan.mjs";

const bundle = JSON.parse(fs.readFileSync(new URL("../../seed/data/notion-vertical-slice.json", import.meta.url), "utf8"));
const rows = (plan, table) => plan.tables.find((operation) => operation.table === table).rows;
const clone = (value) => structuredClone(value);

test("all four claim types preserve source references and graph identities", () => {
  const plan = createDatabasePlan(bundle);
  const count = bundle.products.reduce((n, p) => n + ["attributes", "anchors", "problems", "audiences"].reduce((m, type) => m + p[type].reduce((s, c) => s + new Set(c.evidence).size, 0), 0), 0);
  assert.equal(rows(plan, "claim_evidence").length, count);
  assert.equal(plan.tables.filter((t) => t.table.endsWith("_evidence") && t.table !== "claim_evidence").reduce((n, t) => n + t.rows.length, 0), count);
  const sourceKeys = new Set(bundle.sources.map((s) => s.key));
  for (const fragment of rows(plan, "claim_evidence")) {
    assert(sourceKeys.has(fragment.evidence_source_id.$ref.where.seed_key));
    assert.equal(fragment.excerpt, null);
    assert.match(fragment.notes, /not an independently verified quotation/);
  }
  for (const row of rows(plan, "product_anchors")) assert.equal(row.relationship_type, "alternative");
  assert.equal(rows(plan, "escape_routes").length, 3);
  assert(rows(plan, "escape_routes").every((r) => r.status === "draft" && !r.editorially_approved));
});

test("plan is deterministic even when product, claim, or source ordering changes", () => {
  const changed = clone(bundle);
  changed.products.reverse(); changed.sources.reverse(); changed.attributes.reverse(); changed.escapeRoutes.reverse();
  for (const p of changed.products) for (const type of ["attributes", "anchors", "problems", "audiences"]) {
    p[type].reverse(); for (const c of p[type]) c.evidence.reverse();
  }
  assert.deepEqual(createDatabasePlan(changed), createDatabasePlan(bundle));
});

test("unknown and false remain distinct; removing evidence requests stale-link reconciliation", () => {
  const plan = createDatabasePlan(bundle);
  const claims = rows(plan, "product_attributes");
  const unknown = claims.find((c) => c.verification_status === "unknown");
  assert.equal(unknown.value_boolean, null);
  assert.equal(unknown.confidence, null);
  assert.equal(unknown.last_verified_at, null);
  const negative = claims.find((c) => c.value_boolean === false);
  assert.equal(negative.verification_status, "verified");
  assert(plan.evidenceReplacements.some((r) => r.desiredFragmentKeys.length === 0));
  const changed = clone(bundle);
  const claim = changed.products[0].attributes.find((c) => c.verificationStatus === "verified");
  Object.assign(claim, {value:null,verificationStatus:"unknown",confidence:null,lastVerifiedAt:null,evidence:[]});
  const updated = createDatabasePlan(changed);
  assert(rows(updated, "claim_evidence").length < rows(plan, "claim_evidence").length);
  assert.equal(rows(updated, "product_attributes").length, claims.length);
});

test("reject missing evidence, duplicate identities, duplicate memberships, invalid positions", () => {
  const invalid = clone(bundle);
  invalid.products[0].attributes[0].evidence = [];
  assert.throws(() => createDatabasePlan(invalid), /at least one source/);
  const duplicate = clone(bundle);
  duplicate.products[0].attributes.push(clone(duplicate.products[0].attributes[0]));
  assert.throws(() => createDatabasePlan(duplicate), /Duplicate claim identity/);
  const route = clone(bundle);
  route.escapeRoutes[0].products.push(clone(route.escapeRoutes[0].products[0]));
  assert.throws(() => createDatabasePlan(route), /Duplicate route membership/);
  route.escapeRoutes[0].products.pop(); route.escapeRoutes[0].products[0].position = 0;
  assert.throws(() => createDatabasePlan(route), /Invalid route position/);
});

test("all supported value types map to one database column", () => {
  const changed = clone(bundle);
  for (const [type, value] of [["text","hello"],["number",2],["enum","selected"]]) {
    changed.attributes.push({slug:`test-${type}`,name:type,category:"workflow",valueType:type});
    changed.products[0].attributes.push({slug:`test-${type}`,value,verificationStatus:"likely",evidence:[changed.sources[0].key]});
  }
  const mapped = rows(createDatabasePlan(changed), "product_attributes");
  for (const type of ["text","number","enum"]) {
    const row = mapped.find((r) => r.attribute_id.$ref.where.slug === `test-${type}`);
    assert.equal([row.value_boolean,row.value_text,row.value_number,row.value_enum].filter((v) => v !== null).length, 1);
    assert.notEqual(row[`value_${type}`], null);
  }
});

// A local model checks the plan protocol, not actual PostgreSQL behavior.
test("modeled re-import reuses IDs, clears stale seed links, preserves manual evidence", () => {
  const db = new Map(); let sequence = 0;
  const get = (table) => { if (!db.has(table)) db.set(table, []); return db.get(table); };
  get("products").push({id:"existing-product",slug:"obsidian"});
  const resolve = (value) => {
    if (!value?.$ref) return value;
    const {table,where} = value.$ref;
    const matches = get(table).filter((row) => Object.entries(where).every(([k,v]) => row[k] === v));
    assert.equal(matches.length, 1, `Unresolved reference ${JSON.stringify(value)}`);
    return matches[0].id;
  };
  const apply = (plan) => {
    for (const operation of plan.tables) for (const symbolic of operation.rows) {
      const row = Object.fromEntries(Object.entries(symbolic).map(([k,v]) => [k,resolve(v)]));
      const existing = get(operation.table).find((r) => operation.conflictColumns.every((k) => r[k] === row[k]));
      if (existing) Object.assign(existing,row);
      else get(operation.table).push({id:`model-${++sequence}`,...row});
    }
    for (const replacement of plan.evidenceReplacements) {
      const where = Object.fromEntries(Object.entries(replacement.where).map(([k,v]) => [k,resolve(v)]));
      db.set(replacement.table,get(replacement.table).filter((row) => {
        if (!Object.entries(where).every(([k,v]) => row[k] === v)) return true;
        const fragment = get("claim_evidence").find((f) => f.id === row.claim_evidence_id);
        return !fragment.seed_key?.startsWith(replacement.ownership.fragmentSeedKeyPrefix) || replacement.desiredFragmentKeys.includes(fragment.seed_key);
      }));
    }
    for (const replacement of plan.routeMembershipReplacements) {
      const route = resolve(replacement.where.escape_route_id);
      db.set("escape_route_products",get("escape_route_products").filter((row) => row.escape_route_id !== route || replacement.desiredProductSlugs.some((slug) => get("products").some((p) => p.slug === slug && p.id === row.product_id))));
    }
  };
  const plan = createDatabasePlan(bundle); apply(plan);
  assert.equal(get("products").find((p) => p.slug === "obsidian").id,"existing-product");
  const snapshot = clone([...db]); apply(plan); assert.deepEqual([...db],snapshot);
  const link = clone(get("product_attribute_evidence")[0]);
  get("claim_evidence").push({id:"manual-fragment",seed_key:null});
  get("product_attribute_evidence").push({...link,id:"manual-link",claim_evidence_id:"manual-fragment"});
  const changed = clone(bundle);
  const product = get("products").find((p) => p.id === link.product_id);
  const attribute = get("attributes").find((a) => a.id === link.attribute_id);
  const claim = changed.products.find((p) => p.slug === product.slug).attributes.find((a) => a.slug === attribute.slug);
  Object.assign(claim,{value:null,verificationStatus:"unknown",confidence:null,lastVerifiedAt:null,evidence:[]});
  changed.escapeRoutes[0].products = [];
  apply(createDatabasePlan(changed));
  assert(!get("product_attribute_evidence").some((r) => r.claim_evidence_id === link.claim_evidence_id));
  assert(get("product_attribute_evidence").some((r) => r.claim_evidence_id === "manual-fragment"));
  const route = get("escape_routes").find((r) => r.slug === changed.escapeRoutes[0].slug);
  assert(!get("escape_route_products").some((r) => r.escape_route_id === route.id));
  assert.equal(get("products").length,6);
});
