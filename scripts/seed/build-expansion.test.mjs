import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildExpansion, ecosystemBundle } from "./build-expansion.mjs";
import { createDatabasePlan } from "./database-plan.mjs";
import { createCompactImportSql } from "./import-sql-compact.mjs";

const read = (file) => JSON.parse(fs.readFileSync(new URL(`../../${file}`, import.meta.url), "utf8"));
const base = read("seed/data/notion-vertical-slice.json");
const research = read("seed/research/expansion-2026-10-06.json");
const ownership = read("seed/import-ownership.example.json");
const bundle = buildExpansion(base, research);

test("expansion covers 30 unique draft products and five ecosystems without changing existing claims or routes", () => {
  assert.equal(new Set(bundle.products.map((p) => p.slug)).size, 30);
  assert.equal(bundle.anchors.length, 5);
  assert.equal(research.humanReviewStatus, "pending");
  assert.ok(bundle.products.every((p) => p.status === "draft"));
  assert.deepEqual(bundle.escapeRoutes, base.escapeRoutes);
  for (const old of base.products) {
    const current = bundle.products.find((p) => p.slug === old.slug);
    const copy = structuredClone(current);
    copy.attributes = copy.attributes.filter((claim) => !["supported-platforms", "pricing-model", "trade-off-summary"].includes(claim.slug));
    assert.deepEqual(copy, old);
  }
});

test("uncertain pricing stays null and edition-specific offline claims are not generalized", () => {
  const attribute = (product, slug) => bundle.products.find((p) => p.slug === product).attributes.find((a) => a.slug === slug);
  assert.equal(attribute("logseq", "pricing-model").value, null);
  assert.equal(attribute("logseq", "pricing-model").verificationStatus, "unknown");
  assert.equal(attribute("insight-timer", "works-offline").value, null);
  assert.equal(attribute("sejda", "works-offline").value, null);
  assert.equal(attribute("pdf24-creator", "works-offline").value, true);
  assert.equal(attribute("healthy-minds-program", "no-account-required").value, false);
});

test("five import batches preserve the complete plan and stay below SQL Editor size budget", () => {
  const plans = ["notion", "todoist", "grammarly", "adobe-pdf", "calm"].map((name) => {
    const batch = ecosystemBundle(bundle, name);
    assert.equal(batch.products.length, 6);
    assert.ok(Buffer.byteLength(createCompactImportSql(batch, ownership, { commit: true })) < 200_000);
    return createDatabasePlan(batch);
  });
  const whole = createDatabasePlan(bundle);
  for (const table of whole.tables) {
    if (["evidence_sources", "attributes", "anchors", "problems", "audiences"].includes(table.table)) continue;
    const actual = plans.flatMap((plan) => plan.tables.find((t) => t.table === table.table).rows).map((row) => JSON.stringify(row)).sort();
    assert.deepEqual(actual, table.rows.map((row) => JSON.stringify(row)).sort(), table.table);
  }
});
