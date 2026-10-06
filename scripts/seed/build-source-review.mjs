import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { buildExpansion } from "./build-expansion.mjs";
import { createDatabasePlan } from "./database-plan.mjs";
import { createCompactImportSql } from "./import-sql-compact.mjs";
import { validateSeedBundle } from "./validate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const date = "2026-10-06T00:00:00Z";
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function buildSourceReview(baseline, audit) {
  if (audit.reviewType !== "ai-official-source-review" || audit.humanReviewStatus !== "pending") throw new Error("AI review cannot grant human approval");
  const reviewed = structuredClone(baseline);
  const changes = [];
  const identities = new Set();
  for (const patch of audit.patches) {
    const identity = `${patch.product}/${patch.collection}/${patch.slug}`;
    if (identities.has(identity)) throw new Error(`Duplicate patch: ${identity}`);
    identities.add(identity);
    if (!["attributes", "problems", "audiences"].includes(patch.collection)) throw new Error("Unsupported review collection");
    const product = reviewed.products.find((p) => p.slug === patch.product);
    const claim = product?.[patch.collection].find((c) => c.slug === patch.slug);
    if (!claim || product.status !== "draft") throw new Error(`Missing draft claim: ${identity}`);
    const before = structuredClone(claim);
    const status = patch.status ?? claim.verificationStatus;
    if (!["verified", "likely", "unknown"].includes(status)) throw new Error("Invalid status");
    if (patch.collection === "attributes" && Object.hasOwn(patch, "value")) claim.value = patch.value;
    claim.verificationStatus = status;
    claim.confidence = status === "unknown" ? null : status === "likely" ? 0.75 : 0.95;
    claim.lastVerifiedAt = status === "unknown" ? null : date;
    if (status === "unknown") {
      if (patch.collection === "attributes") claim.value = null;
      claim.evidence = [];
    } else if (patch.urls) {
      claim.evidence = patch.urls.map((url) => {
        if (!url.startsWith("https://")) throw new Error("Invalid official source URL");
        const key = `${product.slug}-ai-review-${createHash("sha256").update(url).digest("hex").slice(0, 12)}-2026-10-06`;
        if (!reviewed.sources.some((s) => s.key === key)) reviewed.sources.push({ key, sourceType: patch.slug === "pricing-model" ? "pricing" : "official", title: `${product.name} — AI source review reference`, url, publisher: product.name, retrievedAt: date });
        return key;
      });
    }
    if (!same(before, claim)) changes.push({ product: product.slug, collection: patch.collection, slug: patch.slug, before, after: structuredClone(claim), reason: patch.reason });
  }
  const errors = validateSeedBundle(reviewed);
  if (errors.length) throw new Error(errors.join("\n"));
  const affected = new Set(changes.map((c) => c.product));
  const delta = structuredClone(reviewed);
  delta.escapeRoutes = [];
  delta.products = delta.products.filter((p) => affected.has(p.slug));
  for (const product of delta.products) for (const collection of ["attributes", "anchors", "problems", "audiences"]) product[collection] = product[collection].filter((claim) => identities.has(`${product.slug}/${collection}/${claim.slug}`));
  for (const collection of ["attributes", "anchors", "problems", "audiences"]) delta[collection] = delta[collection].filter((d) => delta.products.some((p) => p[collection].some((c) => c.slug === d.slug)));
  const keys = new Set(delta.products.flatMap((p) => ["attributes", "problems", "audiences"].flatMap((k) => p[k].flatMap((c) => c.evidence))));
  delta.sources = delta.sources.filter((s) => keys.has(s.key));
  const oldDelta = structuredClone(delta);
  oldDelta.sources = baseline.sources;
  for (const p of oldDelta.products) for (const collection of ["attributes", "problems", "audiences"]) p[collection] = p[collection].map((c) => structuredClone(changes.find((change) => change.product === p.slug && change.collection === collection && change.slug === c.slug).before));
  return { reviewed, delta, oldDelta, changes };
}

function resolveGuard(input, output) {
  return `input_data=${input}; ${output}='{}';
    FOR k,v IN SELECT * FROM jsonb_each(input_data) LOOP
      IF v ? '$ref' THEN
        target_table=v->'$ref'->>'table';
        IF target_table NOT IN ('products','attributes','problems','audiences') THEN RAISE EXCEPTION 'Invalid guard reference'; END IF;
        target_value=v->'$ref'->'where'->>'slug';
        EXECUTE format('SELECT id FROM software_discovery.%I WHERE slug=$1',target_table) INTO STRICT resolved_id USING target_value;
        v=to_jsonb(resolved_id);
      END IF;
      ${output}=${output}||jsonb_build_object(k,v);
    END LOOP;`;
}

export function createReviewSql(result, { commit = false } = {}) {
  const { delta, oldDelta } = result;
  const current = createDatabasePlan(delta), old = createDatabasePlan(oldDelta);
  const rows = [];
  for (const table of current.tables.filter((t) => ['products','product_attributes','product_problems','product_audiences'].includes(t.table))) {
    const oldTable = old.tables.find((t) => t.table === table.table);
    const identity = (r) => JSON.stringify(table.conflictColumns.map((key) => r[key]));
    for (const after of table.rows) rows.push({ table: table.table, conflictColumns: table.conflictColumns, before: oldTable.rows.find((r) => identity(r) === identity(after)), after });
  }
  const evidence = current.evidenceReplacements.map((r) => ({ ...r, beforeKeys: old.evidenceReplacements.find((item) => item.table === r.table && same(item.where, r.where)).desiredFragmentKeys }));
  if (JSON.stringify(rows).includes("$review_guard$") || JSON.stringify(evidence).includes("$review_links$")) throw new Error("Review payload delimiter collision");
  const guards = `
  FOR op IN SELECT value FROM jsonb_array_elements($review_guard$${JSON.stringify(rows)}$review_guard$::jsonb) LOOP
    t=op->>'table'; allowed=false;
    FOR raw_row IN SELECT value FROM jsonb_array_elements(jsonb_build_array(op->'before',op->'after')) LOOP
      ${resolveGuard('raw_row','row_data')}
      SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',key,key),' AND ') INTO match_condition FROM jsonb_object_keys(row_data) AS keys(key);
      EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s)',t,t,match_condition) INTO found_row USING row_data;
      allowed=allowed OR found_row;
    END LOOP;
    IF NOT allowed THEN RAISE EXCEPTION 'AI review baseline conflict: %',t; END IF;
  END LOOP;
  FOR replacement IN SELECT value FROM jsonb_array_elements($review_links$${JSON.stringify(evidence)}$review_links$::jsonb) LOOP
    t=replacement->>'table';
    ${resolveGuard("replacement->'where'",'where_data')}
    SELECT string_agg(format('link.%I IS NOT DISTINCT FROM source.%I',key,key),' AND ') INTO key_condition FROM jsonb_object_keys(where_data) AS keys(key);
    EXECUTE format('SELECT coalesce(array_agg(fragment.seed_key ORDER BY fragment.seed_key),''{}''::text[]) FROM software_discovery.%I link JOIN software_discovery.claim_evidence fragment ON fragment.id=link.claim_evidence_id CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s',t,t,key_condition) INTO desired_keys USING where_data;
    SELECT coalesce(array_agg(value ORDER BY value),'{}'::text[]) INTO wanted FROM jsonb_array_elements_text(replacement->'beforeKeys');
    IF desired_keys IS DISTINCT FROM wanted THEN
      SELECT coalesce(array_agg(value ORDER BY value),'{}'::text[]) INTO wanted FROM jsonb_array_elements_text(replacement->'desiredFragmentKeys');
      IF desired_keys IS DISTINCT FROM wanted THEN RAISE EXCEPTION 'AI review evidence conflict: %',t; END IF;
    END IF;
  END LOOP;
`;
  const ownership = { version: 1, products: delta.products.map((p) => p.slug), routes: [], sources: [], taxonomy: { anchors: [], attributes: [], problems: [], audiences: [] } };
  let sql = createCompactImportSql(delta, ownership, { commit });
  sql = sql.replace("  own=data->'ownership';", guards + "\n  own=data->'ownership';");
  if (Buffer.byteLength(sql) >= 200_000) throw new Error('Review SQL exceeds SQL Editor size limit');
  return sql;
}

export function expectedReviewCounts(baseline, reviewed) {
  const old = createDatabasePlan(baseline), next = createDatabasePlan(reviewed);
  return Object.fromEntries(next.tables.map((table) => {
    if (["evidence_sources", "claim_evidence"].includes(table.table)) return [table.table, new Set([...table.rows, ...old.tables.find((t) => t.table === table.table).rows].map((row) => row.seed_key)).size];
    return [table.table, table.rows.length];
  }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = path.resolve(process.argv[2] ?? path.join(root, ".seed-output/source-review"));
  const baseline = buildExpansion(read("seed/data/notion-vertical-slice.json"), read("seed/research/expansion-2026-10-06.json"));
  const result = buildSourceReview(baseline, read("seed/research/source-review-2026-10-06.json"));
  fs.mkdirSync(output, { recursive: true });
  for (const [name, value] of [["reviewed-five-ecosystems.json", result.reviewed], ["delta.json", result.delta], ["changes.json", result.changes]]) fs.writeFileSync(path.join(output, name), JSON.stringify(value, null, 2) + "\n");
  fs.writeFileSync(path.join(output, "01_REHEARSAL.sql"), createReviewSql(result));
  fs.writeFileSync(path.join(output, "02_APPLY.sql"), createReviewSql(result, { commit: true }));
  const counts = expectedReviewCounts(baseline, result.reviewed);
  fs.writeFileSync(path.join(output, "03_VERIFY.sql"), Object.entries(counts).map(([table, count]) => `SELECT '${table}' AS table_name, ${count} AS expected_rows, count(*)::integer AS actual_rows, count(*)=${count} AS matches FROM software_discovery.${table}`).join("\nUNION ALL\n") + "\nORDER BY table_name;\n");
  console.log(`${result.changes.length} reviewed claim corrections on ${result.delta.products.length} draft products. Generated locally; no remote writes. Human review pending.`);
}
