import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { buildExpansion } from "./build-expansion.mjs";
import { buildSourceReview, expectedReviewCounts } from "./build-source-review.mjs";
import { createDatabasePlan } from "./database-plan.mjs";
import { createCompactImportSql } from "./import-sql-compact.mjs";
import { validateSeedBundle } from "./validate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const date = "2026-10-06T00:00:00Z";
const categories = [
  { slug: "personal-task-planners", name: "Personal Task Planners", description: "People comparing applications for personal tasks and planning; does not establish every Todoist feature." },
  { slug: "writers-and-editors", name: "Writers and Editors", description: "People comparing grammar, style, or language-reference tools within the documented edition and language scope." },
  { slug: "pdf-document-users", name: "PDF Document Users", description: "People comparing PDF tools for the documented operations; does not imply full Acrobat parity." },
  { slug: "meditation-app-listeners", name: "Meditation App Listeners", description: "People comparing meditation or sleep-audio applications; no therapeutic outcome or medical suitability is asserted." },
];
const primary = { todoist: "personal-task-planners", grammarly: "writers-and-editors", "adobe-pdf": "pdf-document-users", calm: "meditation-app-listeners" };

export function buildEditorialFit(baseline) {
  const reviewed = structuredClone(baseline);
  const delta = { version: 1, sources: [], anchors: [], attributes: [], problems: [], audiences: categories, products: [], escapeRoutes: [] };
  if (categories.some((c) => reviewed.audiences.some((a) => a.slug === c.slug))) throw new Error("Editorial taxonomy already exists in baseline");
  reviewed.audiences.push(...structuredClone(categories));
  const notes = [];
  for (const product of reviewed.products) {
    const ecosystem = product.anchors.find((a) => Object.hasOwn(primary, a.slug))?.slug;
    if (!ecosystem) continue;
    if (product.problems.length || product.audiences.length || product.status !== "draft") throw new Error(`Expected untouched draft fit baseline: ${product.slug}`);
    const output = { ...structuredClone(product), attributes: [], anchors: [], problems: [], audiences: [] };
    const add = (collection, slug, evidence, reason) => {
      if (!evidence.length) throw new Error(`Missing fit evidence: ${product.slug}/${slug}`);
      const claim = { slug, verificationStatus: "likely", confidence: 0.75, lastVerifiedAt: date, evidence: [...new Set(evidence)] };
      output[collection].push(claim);
      product[collection].push(structuredClone(claim));
      notes.push({ product: product.slug, collection, slug, verificationStatus: "likely", reason, evidence: claim.evidence });
    };
    add("audiences", primary[ecosystem], product.anchors.find((a) => a.slug === ecosystem).evidence, "Editorial audience inferred from the documented product workflow; no tested suitability or complete replacement claim.");
    const fact = (slug) => product.attributes.find((a) => a.slug === slug && a.value === true && a.verificationStatus === "verified" && a.evidence.length);
    const free = fact("free-core-use"), offline = fact("works-offline"), ai = fact("ai-optional"), host = fact("self-hostable");
    if (free) add("problems", "subscription-fatigue", free.evidence, "Documented free core may address recurring-subscription concerns; paid upgrades, limits, hosting, and automation costs remain in the trade-off summary.");
    if (offline) {
      add("problems", "cloud-dependency", offline.evidence, "Documented native core use offline may reduce cloud dependence; no cloud sync or all-platform offline guarantee.");
      add("audiences", "offline-first-users", offline.evidence, "Editorial fit for the documented offline edition; not a hands-on reliability assessment.");
    }
    if (ai) add("problems", "unwanted-ai", ai.evidence, "Documented core workflow does not require the optional AI feature; not a promise that the product contains no AI.");
    if (host) {
      add("problems", "vendor-lock-in", host.evidence, "Self-hosted deployment may improve control of where data lives; it does not prove migration portability or unrestricted licensing.");
      add("audiences", "data-ownership-seekers", host.evidence, "Editorial fit for control of deployment; commercial license and operating costs still apply.");
    }
    delta.products.push(output);
  }
  if (delta.products.length !== 24) throw new Error("Expected 24 expansion products");
  for (const collection of ["problems", "audiences"]) delta[collection] = reviewed[collection].filter((d) => delta.products.some((p) => p[collection].some((c) => c.slug === d.slug)));
  const keys = new Set(delta.products.flatMap((p) => [...p.problems, ...p.audiences].flatMap((c) => c.evidence)));
  delta.sources = reviewed.sources.filter((s) => keys.has(s.key));
  const errors = validateSeedBundle(reviewed);
  if (errors.length) throw new Error(errors.join("\n"));
  return { reviewed, delta, notes };
}

export function createFitSql(result, { commit = false } = {}) {
  const plan = createDatabasePlan(result.delta);
  const guards = plan.evidenceReplacements.map((r) => ({ table: r.table, product: r.where.product_id.$ref.where.slug, taxonomy: r.where.problem_id ? "problems" : "audiences", slug: (r.where.problem_id ?? r.where.audience_id).$ref.where.slug, foreignKey: r.where.problem_id ? "problem_id" : "audience_id", keys: r.desiredFragmentKeys }));
  const payload = JSON.stringify(guards);
  if (payload.includes("$fit_guard$")) throw new Error("Fit payload delimiter collision");
  const guard = `
  IF NOT EXISTS(SELECT 1 FROM software_discovery.product_attributes c JOIN software_discovery.products p ON p.id=c.product_id JOIN software_discovery.attributes a ON a.id=c.attribute_id WHERE p.slug='logseq' AND a.slug='markdown-files' AND c.verification_status='unknown' AND c.value_boolean IS NULL) THEN RAISE EXCEPTION 'PR3.4 reviewed baseline required'; END IF;
  FOR replacement IN SELECT value FROM jsonb_array_elements($fit_guard$${payload}$fit_guard$::jsonb) LOOP
    EXECUTE format('SELECT coalesce(array_agg(e.seed_key ORDER BY e.seed_key),''{}''::text[]) FROM software_discovery.%I l JOIN software_discovery.products p ON p.id=l.product_id JOIN software_discovery.%I d ON d.id=l.%I JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id WHERE p.slug=$1 AND d.slug=$2',replacement->>'table',replacement->>'taxonomy',replacement->>'foreignKey') INTO desired_keys USING replacement->>'product',replacement->>'slug';
    SELECT coalesce(array_agg(value ORDER BY value),'{}'::text[]) INTO wanted FROM jsonb_array_elements_text(replacement->'keys');
    IF cardinality(desired_keys)>0 AND desired_keys IS DISTINCT FROM wanted THEN RAISE EXCEPTION 'Editorial fit evidence conflict'; END IF;
  END LOOP;
`;
  let sql = createCompactImportSql(result.delta, { version: 1, products: [], routes: [], sources: [], taxonomy: { anchors: [], attributes: [], problems: [], audiences: [] } }, { commit });
  sql = sql.replace("  own=data->'ownership';", guard + "\n  own=data->'ownership';");
  if (Buffer.byteLength(sql) >= 200_000) throw new Error("Fit SQL exceeds SQL Editor budget");
  return sql;
}

export function fitCounts(original, baseline, result) {
  const counts = expectedReviewCounts(original, baseline);
  const plan = createDatabasePlan(result.delta);
  for (const t of plan.tables) {
    if (["product_problems", "product_audiences", "product_problem_evidence", "product_audience_evidence", "claim_evidence"].includes(t.table)) counts[t.table] += t.rows.length;
  }
  counts.audiences += categories.length;
  return counts;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const original = buildExpansion(read("seed/data/notion-vertical-slice.json"), read("seed/research/expansion-2026-10-06.json"));
  const baseline = buildSourceReview(original, read("seed/research/source-review-2026-10-06.json")).reviewed;
  const result = buildEditorialFit(baseline);
  const output = path.resolve(process.argv[2] ?? path.join(root, ".seed-output/editorial-fit"));
  fs.mkdirSync(output, { recursive: true });
  for (const [name, data] of [["reviewed-five-ecosystems.json", result.reviewed], ["delta.json", result.delta], ["fit-rationale.json", result.notes]]) fs.writeFileSync(path.join(output, name), JSON.stringify(data, null, 2) + "\n");
  fs.writeFileSync(path.join(output, "review-packet.json"), JSON.stringify({ version: 1, datasetSha256: createHash("sha256").update(JSON.stringify(result.reviewed)).digest("hex"), productSlugs: result.reviewed.products.map((p) => p.slug).sort(), humanReviewStatus: "pending", reviewer: null, reviewedAt: null, decision: null, scope: "Official-source desk-review dataset; unknowns retained and editorial fits likely. Does not authorize product publication or assert hands-on testing.", unknownAttributes: result.reviewed.products.flatMap((p) => p.attributes.filter((c) => c.verificationStatus === "unknown").map((c) => ({ product: p.slug, attribute: c.slug }))) }, null, 2) + "\n");
  fs.writeFileSync(path.join(output, "01_REHEARSAL.sql"), createFitSql(result));
  fs.writeFileSync(path.join(output, "02_APPLY.sql"), createFitSql(result, { commit: true }));
  const counts = fitCounts(original, baseline, result);
  fs.writeFileSync(path.join(output, "03_VERIFY.sql"), Object.entries(counts).map(([t, n]) => `SELECT '${t}' AS table_name, ${n} AS expected_rows, count(*)::integer AS actual_rows, count(*)=${n} AS matches FROM software_discovery.${t}`).join("\nUNION ALL\n") + "\nORDER BY table_name;\n");
  console.log(`${result.delta.products.length} draft products; ${result.notes.length} likely editorial relationships. No remote writes or human approval.`);
}
