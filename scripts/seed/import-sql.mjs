import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDatabasePlan } from "./database-plan.mjs";

const schema = '"software_discovery"';
const updatedAt = new Set(["evidence_sources", "claim_evidence", "anchors", "attributes", "problems", "audiences", "products", "product_attributes", "escape_routes", "escape_route_products"]);
const id = (name) => {
  if (!/^[a-z][a-z0-9_]*$/.test(name)) throw new Error(`Invalid SQL identifier: ${name}`);
  return `"${name}"`;
};
const table = (name) => `${schema}.${id(name)}`;
const quote = (value) => {
  if (typeof value !== "string" || value.includes("\0")) throw new Error("Invalid SQL string");
  return `E'${value.replaceAll("\\", "\\\\").replaceAll("'", "''")}'`;
};
function valueSql(value) {
  if (value === null) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") return quote(value);
  if (value?.$ref) {
    const { table: target, where } = value.$ref;
    return `(SELECT id FROM ${table(target)} WHERE ${whereSql(where)})`;
  }
  throw new Error("Unsupported SQL value");
}
const whereSql = (where, alias = "") => Object.entries(where).map(([key,value]) => `${alias}${id(key)} IS NOT DISTINCT FROM ${valueSql(value)}`).join(" AND ");
const block = (body) => {
  let tag = "$seed$";
  while (body.includes(tag)) tag = tag.slice(0,-1) + "_x$";
  return `DO ${tag}\nBEGIN\n${body}\nEND\n${tag};`;
};
const requireSql = (condition, message) => block(`  IF NOT (${condition}) THEN\n    RAISE EXCEPTION ${quote(message)};\n  END IF;`);

function validateOwnership(manifest, plan) {
  if (manifest?.version !== 1) {
    throw new Error("Ownership manifest requires version 1");
  }
  for (const [key,target] of [["products","products"],["routes","escape_routes"],["sources","evidence_sources"]]) {
    if (!Array.isArray(manifest[key]) || manifest[key].some((v) => typeof v !== "string")) throw new Error(`Invalid ownership list: ${key}`);
    const known = new Set(plan.tables.find((t) => t.table === target).rows.map((row) => row.slug ?? row.seed_key));
    if (manifest[key].some((v) => !known.has(v))) throw new Error(`Ownership list contains unknown identity: ${key}`);
  }
  for (const name of ["anchors","attributes","problems","audiences"]) {
    const entries = manifest.taxonomy?.[name];
    const known = new Set(plan.tables.find((t) => t.table === name).rows.map((row) => row.slug));
    if (!Array.isArray(entries) || entries.some((v) => typeof v !== "string" || !known.has(v))) throw new Error(`Invalid taxonomy ownership: ${name}`);
  }
}

export function createImportSql(bundle, manifest, { commit = false } = {}) {
  const plan = createDatabasePlan(bundle);
  validateOwnership(manifest, plan);
  const sql = [
    "-- PR3.2C: generated seed import; review before execution.",
    `-- Transaction outcome: ${commit ? "COMMIT" : "ROLLBACK (default rehearsal)"}.`,
    "BEGIN;",
    "SET LOCAL lock_timeout = '10s';",
    "SET LOCAL statement_timeout = '120s';",
    "SELECT pg_advisory_xact_lock(7232003);",
    // Blocks concurrent non-importer writers too, within software_discovery only.
    `LOCK TABLE ${plan.tables.map((operation) => table(operation.table)).join(", ")} IN SHARE ROW EXCLUSIVE MODE;`,
  ];
  const summaries = [];
  const owned = (target, row) => {
    if (target === "claim_evidence") return false; // immutable source-pointer records
    if (target === "evidence_sources") return manifest.sources.includes(row.seed_key);
    if (target === "products") return manifest.products.includes(row.slug);
    if (target.startsWith("product_") && row.product_id) return manifest.products.includes(row.product_id.$ref.where.slug);
    if (target === "escape_routes") return manifest.routes.includes(row.slug);
    if (target === "escape_route_products") return manifest.routes.includes(row.escape_route_id.$ref.where.slug);
    return manifest.taxonomy[target]?.includes(row.slug) ?? false;
  };
  // Entire route membership is checked BEFORE any mutations, including new rows.
  for (const replacement of plan.routeMembershipReplacements) {
    const slug = replacement.where.escape_route_id.$ref.where.slug;
    if (manifest.routes.includes(slug)) continue;
    const existingRoute = `(SELECT id FROM ${table("escape_routes")} WHERE slug = ${quote(slug)})`;
    const desired = replacement.desiredProductSlugs.length ? replacement.desiredProductSlugs.map(quote).join(", ") : "NULL";
    const extras = `NOT EXISTS (SELECT 1 FROM ${table("escape_route_products")} m JOIN ${table("products")} p ON p.id = m.product_id WHERE m.escape_route_id = ${existingRoute} AND ${replacement.desiredProductSlugs.length ? `p.slug NOT IN (${desired})` : "TRUE"})`;
    const count = `(SELECT count(*) FROM ${table("escape_route_products")} WHERE escape_route_id = ${existingRoute}) = ${replacement.desiredProductSlugs.length}`;
    sql.push(requireSql(`NOT EXISTS (SELECT 1 FROM ${table("escape_routes")} WHERE slug = ${quote(slug)}) OR (${extras} AND ${count})`, `Existing route membership differs; ownership required: ${slug}`));
  }
  for (const operation of plan.tables) {
    const target = table(operation.table);
    sql.push(`-- ${operation.table}: ${operation.rows.length} desired rows`);
    const keyConditions = [];
    for (const row of operation.rows) {
      const columns = Object.keys(row);
      const key = Object.fromEntries(operation.conflictColumns.map((column) => [column,row[column]]));
      const condition = whereSql(key);
      keyConditions.push(`(${condition})`);
      const matches = whereSql(row);
      for (const value of Object.values(row)) if (value?.$ref) {
        sql.push(requireSql(`(SELECT count(*) FROM ${table(value.$ref.table)} WHERE ${whereSql(value.$ref.where)}) = 1`, `Unresolved reference for ${operation.table}`));
      }
      if (!owned(operation.table,row)) sql.push(requireSql(`NOT EXISTS (SELECT 1 FROM ${target} WHERE ${condition} AND NOT (${matches}))`, `Existing row differs; ownership required: ${operation.table}`));
      const mutable = columns.filter((column) => !operation.conflictColumns.includes(column));
      let update = "DO NOTHING";
      if (mutable.length && operation.table !== "claim_evidence") {
        const assignments = mutable.map((column) => `${id(column)} = EXCLUDED.${id(column)}`);
        if (updatedAt.has(operation.table)) assignments.push('"updated_at" = now()');
        const changed = mutable.map((column) => `target.${id(column)} IS DISTINCT FROM EXCLUDED.${id(column)}`).join(" OR ");
        update = `DO UPDATE SET ${assignments.join(", ")} WHERE ${changed}`;
      }
      sql.push(`INSERT INTO ${target} AS target (${columns.map(id).join(", ")}) VALUES (${columns.map((column) => valueSql(row[column])).join(", ")}) ON CONFLICT (${operation.conflictColumns.map(id).join(", ")}) ${update};`);
      sql.push(requireSql(`EXISTS (SELECT 1 FROM ${target} WHERE ${matches})`, `Stored row differs from seed: ${operation.table}`));
    }
    summaries.push(`SELECT ${quote(operation.table)} AS table_name, ${operation.rows.length} AS expected_seed_rows, count(*) AS actual_seed_rows FROM ${target} WHERE ${keyConditions.length ? keyConditions.join(" OR ") : "FALSE"};`);
  }
  for (const replacement of plan.evidenceReplacements) {
    const desired = replacement.desiredFragmentKeys.length ? `AND fragment.seed_key NOT IN (${replacement.desiredFragmentKeys.map(quote).join(", ")})` : "";
    sql.push(`DELETE FROM ${table(replacement.table)} AS link USING ${table("claim_evidence")} AS fragment WHERE link.claim_evidence_id = fragment.id AND ${whereSql(replacement.where,"link.")} AND left(fragment.seed_key, 11) = 'seed-claim:' ${desired};`);
  }
  for (const replacement of plan.routeMembershipReplacements) {
    const desired = replacement.desiredProductSlugs.length ? `AND membership.product_id NOT IN (SELECT id FROM ${table("products")} WHERE slug IN (${replacement.desiredProductSlugs.map(quote).join(", ")}))` : "";
    sql.push(`DELETE FROM ${table("escape_route_products")} AS membership WHERE ${whereSql(replacement.where,"membership.")} ${desired};`);
    sql.push(requireSql(`(SELECT count(*) FROM ${table("escape_route_products")} WHERE ${whereSql(replacement.where)}) = ${replacement.desiredProductSlugs.length}`, "Route membership count mismatch"));
  }
  sql.push(...summaries, commit ? "COMMIT;" : "ROLLBACK;");
  return sql.join("\n\n") + "\n";
}

// Only for a first import into an EMPTY Discovery Graph, confirmed by precheck.
// Retains migrations. Refuses new tables, extra rows, or edited seed content.
export function createInitialImportUndoSql(bundle) {
  const plan = createDatabasePlan(bundle);
  const names = plan.tables.map((operation) => operation.table);
  const sql = ["-- FIRST EMPTY-DATABASE IMPORT UNDO ONLY. Do not use for an existing dataset.","BEGIN;", "SET LOCAL lock_timeout = '10s';", "SET LOCAL statement_timeout = '120s';", "SELECT pg_advisory_xact_lock(7232003);",
    `LOCK TABLE ${names.map(table).join(", ")} IN SHARE ROW EXCLUSIVE MODE;`,
    requireSql(`NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'software_discovery' AND table_type = 'BASE TABLE' AND table_name NOT IN (${names.map(quote).join(", ")}))`, "Undo refused: additional graph tables exist"),
  ];
  for (const operation of plan.tables) {
    sql.push(requireSql(`(SELECT count(*) FROM ${table(operation.table)}) = ${operation.rows.length}`, `Undo refused: extra/missing rows in ${operation.table}`));
    for (const row of operation.rows) sql.push(requireSql(`EXISTS (SELECT 1 FROM ${table(operation.table)} WHERE ${whereSql(row)})`, `Undo refused: edited content in ${operation.table}`));
    if (operation.table === "escape_route_products") sql.push(requireSql(`NOT EXISTS (SELECT 1 FROM ${table(operation.table)} WHERE num_nonnulls(relevance_score, constraint_fit_score, quality_score, novelty_score) > 0)`, "Undo refused: route scores have been edited"));
  }
  for (const name of [...names].reverse()) sql.push(`DELETE FROM ${table(name)};`);
  sql.push("COMMIT;");
  return sql.join("\n\n") + "\n";
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const commit = args.includes("--commit");
    const undo = args.includes("--undo-initial");
    const positional = args.filter((arg) => arg !== "--commit" && arg !== "--undo-initial");
    if ((commit && undo) || positional.length !== 3 || positional.some((arg) => arg.startsWith("--"))) throw new Error("Usage: node scripts/seed/import-sql.mjs <seed.json> <ownership.json> <output.sql> [--commit | --undo-initial]");
    const [input,ownership,output] = positional;
    const bundle = JSON.parse(fs.readFileSync(input,"utf8"));
    const manifest = JSON.parse(fs.readFileSync(ownership,"utf8"));
    validateOwnership(manifest,createDatabasePlan(bundle));
    const sql = undo ? createInitialImportUndoSql(bundle) : createImportSql(bundle,manifest,{commit});
    fs.mkdirSync(path.dirname(output),{recursive:true}); fs.writeFileSync(output,sql);
    console.log(`Import SQL generated (${undo ? "FIRST-IMPORT UNDO" : commit ? "COMMIT" : "ROLLBACK"}): ${output}. No database connection or writes performed.`);
  } catch (error) {
    console.error(error.message); process.exitCode = 1;
  }
}
