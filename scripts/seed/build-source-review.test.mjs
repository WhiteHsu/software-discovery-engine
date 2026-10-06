import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildExpansion } from "./build-expansion.mjs";
import { buildSourceReview, createReviewSql } from "./build-source-review.mjs";
const read = (file) => JSON.parse(fs.readFileSync(new URL(`../../${file}`, import.meta.url), "utf8"));
const baseline = buildExpansion(read("seed/data/notion-vertical-slice.json"), read("seed/research/expansion-2026-10-06.json"));
const audit = read("seed/research/source-review-2026-10-06.json");
const result = buildSourceReview(baseline, audit);

test("review changes only listed claims and preserves publication states and routes", () => {
  const restored = structuredClone(result.reviewed);
  for (const change of result.changes) {
    const p = restored.products.find((item) => item.slug === change.product);
    const index = p[change.collection].findIndex((c) => c.slug === change.slug);
    p[change.collection][index] = change.before;
  }
  assert.deepEqual(restored.products, baseline.products);
  assert.deepEqual(restored.escapeRoutes, baseline.escapeRoutes);
  assert.deepEqual(result.delta.escapeRoutes, []);
  assert.ok(result.delta.products.every((p) => p.status === "draft" && p.anchors.length === 0));
  assert.throws(() => buildSourceReview(baseline, { ...audit, humanReviewStatus: "approved" }), /human approval/);
});

test("unresolved facts are null and recommendations are distinct from verified features", () => {
  const p = (slug) => result.reviewed.products.find((item) => item.slug === slug);
  for (const [product, attribute] of [["anytype", "pricing-model"], ["anytype", "free-core-use"], ["logseq", "markdown-files"], ["balance", "supported-platforms"]]) {
    const c = p(product).attributes.find((a) => a.slug === attribute);
    assert.equal(c.value, null);
    assert.equal(c.verificationStatus, "unknown");
    assert.deepEqual(c.evidence, []);
  }
  assert.equal(p("joplin").attributes.find((a) => a.slug === "markdown-files").value, true);
  assert.equal(p("affine").attributes.find((a) => a.slug === "open-source").value, true);
  assert.ok(result.reviewed.products.every((item) => [...item.problems, ...item.audiences].every((c) => c.verificationStatus !== "verified")));
});

test("guarded review SQL fits SQL Editor and validates the prior rows and evidence atomically", () => {
  for (const commit of [false, true]) {
    const sql = createReviewSql(result, { commit });
    assert.ok(Buffer.byteLength(sql) < 200_000);
    assert.ok(sql.indexOf("LOCK TABLE") < sql.indexOf("AI review baseline conflict"));
    assert.ok(sql.indexOf("AI review evidence conflict") < sql.indexOf("own=data->'ownership'"));
    assert.equal(sql.includes("RAISE SQLSTATE 'ZSR01'"), !commit);
  }
});
