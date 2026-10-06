import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { buildExpansion } from "./build-expansion.mjs";
import { buildSourceReview } from "./build-source-review.mjs";
import { buildEditorialFit, createFitSql } from "./build-editorial-fit.mjs";
const read = (file) => JSON.parse(fs.readFileSync(new URL(`../../${file}`, import.meta.url), "utf8"));
const original = buildExpansion(read("seed/data/notion-vertical-slice.json"), read("seed/research/expansion-2026-10-06.json"));
const baseline = buildSourceReview(original, read("seed/research/source-review-2026-10-06.json")).reviewed;
const result = buildEditorialFit(baseline);
test("fit fills only the 24 empty draft relation sets and preserves reviewed facts and routes", () => {
  assert.equal(result.delta.products.length, 24);
  for (const p of result.reviewed.products) {
    const old = baseline.products.find((item) => item.slug === p.slug);
    assert.deepEqual(p.attributes, old.attributes);
    assert.deepEqual(p.anchors, old.anchors);
    assert.equal(p.status, "draft");
    if (old.audiences.length) assert.deepEqual(p, old);
  }
  assert.deepEqual(result.reviewed.escapeRoutes, baseline.escapeRoutes);
  assert.ok(result.notes.every((n) => n.verificationStatus === "likely" && n.evidence.length));
});
test("unknowns and conditional access do not become negative claims or free/offline recommendations", () => {
  const p = (slug) => result.reviewed.products.find((item) => item.slug === slug);
  assert.equal(p("waking-up").problems.length, 0);
  assert.equal(p("balance").problems.length, 0);
  assert.ok(!p("insight-timer").problems.some((c) => c.slug === "cloud-dependency"));
  assert.ok(!p("sejda").audiences.some((c) => c.slug === "offline-first-users"));
  assert.ok(p("pdf24-creator").audiences.some((c) => c.slug === "offline-first-users"));
  assert.ok(p("pdf-xchange-editor").problems.some((c) => c.slug === "unwanted-ai"));
});
test("fit importer has empty ownership, guards evidence and fits SQL Editor", () => {
  const sql = createFitSql(result, { commit: true });
  assert.ok(Buffer.byteLength(sql) < 200_000);
  assert.ok(sql.includes('"products":[],"routes":[],"sources":[]'));
  assert.ok(sql.includes("Editorial fit evidence conflict"));
  assert.ok(sql.includes("PR3.4 reviewed baseline required"));
});
