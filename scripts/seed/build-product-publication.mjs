import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { createDatabasePlan } from "./database-plan.mjs";
import { buildExpansion } from "./build-expansion.mjs";
import { buildSourceReview } from "./build-source-review.mjs";
import { buildEditorialFit } from "./build-editorial-fit.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
export function publicationBundle(dataset, slug) {
  const product = dataset.products.find(p => p.slug === slug);
  if (!product || product.status !== "draft") throw new Error("A draft product is required");
  const evidence = new Set(["attributes", "anchors", "problems", "audiences"].flatMap(kind => product[kind].flatMap(c => c.evidence)));
  return { version: dataset.version, products: [product], escapeRoutes: [], sources: dataset.sources.filter(s => evidence.has(s.key)),
    ...Object.fromEntries(["attributes", "anchors", "problems", "audiences"].map(kind => [kind, dataset[kind].filter(t => product[kind].some(c => c.slug === t.slug))])) };
}
export function createPublicationSql(bundle, { commit = false } = {}) {
  if (bundle.products.length !== 1 || bundle.escapeRoutes.length) throw new Error("Publication scope must be one product and no routes");
  const plan = createDatabasePlan(bundle);
  const data = JSON.stringify({ slug: bundle.products[0].slug, tables: plan.tables });
  if (data.includes("$publication_data$") || data.includes("$publication$")) throw new Error("Publication delimiter collision");
  const locks = plan.tables.map(t => `software_discovery.${t.table}`).join(", ");
  return `-- PR4.2 single-product ${commit ? "APPLY: requires explicit owner publication approval" : "REHEARSAL: all changes roll back"}.
DO $publication$
DECLARE
  payload jsonb=$publication_data$${data}$publication_data$::jsonb;
  tbl jsonb; item jsonb; wanted jsonb; prop record; ref_where record;
  ref_id uuid; matched boolean; actual_count integer; target_id uuid;
BEGIN
  SET LOCAL lock_timeout='10s';
  PERFORM pg_advisory_xact_lock(7232003);
  LOCK TABLE ${locks} IN SHARE ROW EXCLUSIVE MODE;
  IF to_regprocedure('software_discovery.product_discovery_page(text)') IS NULL THEN
    RAISE EXCEPTION 'PR4.1 RPC required';
  END IF;
  SELECT id INTO target_id FROM software_discovery.products
    WHERE slug=payload->>'slug' AND status IN ('draft','published');
  IF target_id IS NULL THEN RAISE EXCEPTION 'Publication target missing or lifecycle conflict'; END IF;
  IF EXISTS (SELECT 1 FROM software_discovery.escape_route_products m JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id
    WHERE m.product_id=target_id AND r.status='published' AND r.editorially_approved) THEN
    RAISE EXCEPTION 'Approved route exposure requires a new publication review';
  END IF;
  FOR tbl IN SELECT value FROM jsonb_array_elements(payload->'tables') LOOP
    FOR item IN SELECT value FROM jsonb_array_elements(tbl->'rows') LOOP
      wanted=item;
      FOR prop IN SELECT key,value FROM jsonb_each(item) LOOP
        IF jsonb_typeof(prop.value)='object' AND prop.value ? '$ref' THEN
          SELECT key,value INTO ref_where FROM jsonb_each(prop.value->'$ref'->'where');
          EXECUTE format('SELECT id FROM software_discovery.%I WHERE %I=$1',prop.value->'$ref'->>'table',ref_where.key)
            INTO ref_id USING ref_where.value #>> '{}';
          IF ref_id IS NULL THEN RAISE EXCEPTION 'Publication reference missing'; END IF;
          wanted=jsonb_set(wanted,ARRAY[prop.key],to_jsonb(ref_id));
        END IF;
      END LOOP;
      IF tbl->>'table'='products' THEN wanted=wanted-'status'; END IF;
      EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I c WHERE NOT EXISTS(SELECT 1 FROM jsonb_object_keys($1) k WHERE to_jsonb(c)->k IS DISTINCT FROM to_jsonb(jsonb_populate_record(NULL::software_discovery.%I,$1))->k))',tbl->>'table',tbl->>'table')
        INTO matched USING wanted;
      IF NOT matched THEN RAISE EXCEPTION 'Publication review mismatch in %',tbl->>'table'; END IF;
    END LOOP;
    IF left(tbl->>'table',8)='product_' THEN
      EXECUTE format('SELECT count(*) FROM software_discovery.%I WHERE product_id=$1',tbl->>'table')
        INTO actual_count USING target_id;
      IF actual_count<>jsonb_array_length(tbl->'rows') THEN RAISE EXCEPTION 'Publication relationship set changed in %',tbl->>'table'; END IF;
    END IF;
  END LOOP;
  UPDATE software_discovery.products SET status='published',updated_at=now()
    WHERE id=target_id AND status='draft';
  IF software_discovery.product_discovery_page(payload->>'slug') IS NULL THEN
    RAISE EXCEPTION 'Publication projection failed';
  END IF;
  ${commit ? "-- Approved apply persists on successful completion." : "RAISE SQLSTATE 'ZP401' USING MESSAGE='Rehearsal only';"}
EXCEPTION WHEN SQLSTATE 'ZP401' THEN
  RAISE NOTICE 'Publication rehearsal rolled back; no product was published';
END $publication$;
`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const expanded=buildExpansion(read("seed/data/notion-vertical-slice.json"),read("seed/research/expansion-2026-10-06.json"));
  const dataset=buildEditorialFit(buildSourceReview(expanded,read("seed/research/source-review-2026-10-06.json")).reviewed).reviewed;
  const bundle=publicationBundle(dataset, "obsidian");
  const output=path.join(root,".seed-output/product-publication");
  fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,"obsidian-review.json"),JSON.stringify({version:1,publicationDecision:"pending",scope:"Only Obsidian product page; no Escape Route publication",sha256:createHash("sha256").update(JSON.stringify(bundle)).digest("hex"),bundle},null,2)+"\n");
  fs.writeFileSync(path.join(output,"01_REHEARSAL.sql"),createPublicationSql(bundle));
  fs.writeFileSync(path.join(output,"02_APPLY_AFTER_APPROVAL.sql"),createPublicationSql(bundle,{commit:true}));
  console.log("Obsidian publication packet prepared. Owner approval pending; no remote writes.");
}
