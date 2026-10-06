import fs from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import { createImportSql, createInitialImportUndoSql } from "./import-sql.mjs";

const read = (name) => JSON.parse(fs.readFileSync(new URL(`../../seed/${name}`, import.meta.url), "utf8"));
const bundle = read("data/notion-vertical-slice.json");
const manifest = read("import-ownership.example.json");

test("default SQL rehearses in one transaction; commit is explicit", () => {
  const sql = createImportSql(bundle,manifest);
  assert.match(sql,/\nBEGIN;/);
  assert.match(sql,/ROLLBACK;\n$/);
  assert.doesNotMatch(sql,/COMMIT;/);
  assert.match(createImportSql(bundle,manifest,{commit:true}),/COMMIT;\n$/);
  assert.match(sql,/pg_advisory_xact_lock/);
  assert.match(sql,/SHARE ROW EXCLUSIVE/);
  assert.doesNotMatch(sql,/CREATE TABLE|DROP TABLE|TRUNCATE|DELETE FROM "software_discovery"\."products"/);
});

test("SQL refuses unowned overwrites and checks stored rows/references", () => {
  const sql = createImportSql(bundle,manifest);
  assert.match(sql,/Existing row differs; ownership required/);
  assert.match(sql,/Existing route membership differs; ownership required/);
  assert.match(sql,/Stored row differs from seed/);
  assert.match(sql,/Unresolved reference/);
  assert.match(sql,/left\(fragment.seed_key, 11\) = 'seed-claim:'/);
  assert.match(sql,/WHERE target\."source_type" IS DISTINCT FROM EXCLUDED\."source_type"/);
});

test("manifest validation fails closed", () => {
  assert.throws(()=>createImportSql(bundle,{}),/version 1/);
  assert.throws(()=>createImportSql(bundle,{...manifest,products:["not-in-bundle"]}),/unknown identity/);
  assert.throws(()=>createImportSql(bundle,{...manifest,taxonomy:{}}),/taxonomy ownership/);
});

test("SQL string escaping rejects NUL and avoids procedural delimiter collisions", () => {
  const changed=structuredClone(bundle);
  changed.sources[0].title="A '$seed$' \\ literal; DROP TABLE products; --";
  const sql=createImportSql(changed,manifest);
  assert.match(sql,/E'A ''\$seed\$'' \\\\ literal; DROP TABLE products; --'/);
  assert.match(sql,/DO \$seed_x\$/);
  changed.sources[0].title="bad\0title";
  assert.throws(()=>createImportSql(changed,manifest),/Invalid SQL string/);
});

test("initial-import undo checks entire graph before deleting in dependency order", () => {
  const sql=createInitialImportUndoSql(bundle);
  assert.match(sql,/Undo refused: additional graph tables exist/);
  assert.match(sql,/Undo refused: extra\/missing rows/);
  assert.match(sql,/Undo refused: edited content/);
  assert(sql.indexOf('DELETE FROM "software_discovery"."escape_route_products"') < sql.indexOf('DELETE FROM "software_discovery"."products"'));
  assert(sql.indexOf('DELETE FROM "software_discovery"."product_attribute_evidence"') < sql.indexOf('DELETE FROM "software_discovery"."claim_evidence"'));
  assert.match(sql,/COMMIT;\n$/);
  assert.doesNotMatch(sql,/DROP TABLE|DROP SCHEMA/);
});
