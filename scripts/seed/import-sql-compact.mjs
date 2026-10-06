import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDatabasePlan } from "./database-plan.mjs";

function resolveInline(input,output){
  return `input_data=${input}; ${output}='{}';
    FOR k,v IN SELECT * FROM jsonb_each(input_data) LOOP
      IF v ? '$ref' THEN
        target_table=v->'$ref'->>'table';
        IF target_table NOT IN ('products','anchors','attributes','problems','audiences','escape_routes','evidence_sources','claim_evidence') THEN RAISE EXCEPTION 'Invalid reference table'; END IF;
        SELECT key,value INTO STRICT target_key,target_value FROM jsonb_each_text(v->'$ref'->'where');
        IF target_key NOT IN ('slug','seed_key') THEN RAISE EXCEPTION 'Invalid reference key'; END IF;
        EXECUTE format('SELECT id FROM software_discovery.%I WHERE %I=$1',target_table,target_key) INTO STRICT resolved_id USING target_value;
        v=to_jsonb(resolved_id);
      END IF;
      ${output}=${output}||jsonb_build_object(k,v);
    END LOOP;`;
}

export function createImportCountQuery(bundle){
  const plan=createDatabasePlan(bundle);
  return plan.tables.map(op=>`SELECT '${op.table}' AS table_name, ${op.rows.length} AS expected_initial_rows, count(*)::integer AS actual_total_rows FROM software_discovery.${op.table}`).join('\nUNION ALL\n')+'\nORDER BY table_name;\n';
}

export function createCompactImportSql(bundle, ownership, {commit=false}={}) {
  const plan=createDatabasePlan(bundle);
  // Reuse the existing ownership validator before producing executable output.
  if(ownership?.version!==1)throw new Error("Ownership version must equal 1");
  for(const [key,target] of [["products","products"],["routes","escape_routes"],["sources","evidence_sources"]]) {
    const known=new Set(plan.tables.find(t=>t.table===target).rows.map(r=>r.slug??r.seed_key));
    if(!Array.isArray(ownership[key])||ownership[key].some(k=>!known.has(k)))throw new Error(`Invalid ownership: ${key}`);
  }
  for(const name of ["anchors","attributes","problems","audiences"]) {
    const known=new Set(plan.tables.find(t=>t.table===name).rows.map(r=>r.slug));
    if(!Array.isArray(ownership.taxonomy?.[name])||ownership.taxonomy[name].some(k=>!known.has(k)))throw new Error(`Invalid ownership: ${name}`);
  }
  const payload=JSON.stringify({tables:plan.tables,evidenceReplacements:plan.evidenceReplacements,routeMembershipReplacements:plan.routeMembershipReplacements,ownership});
  let tag="$payload$";while(payload.includes(tag))tag=tag.slice(0,-1)+"_x$";
  let importTag="$import$";while(payload.includes(importTag))importTag=importTag.slice(0,-1)+"_x$";
  return `-- PR3.2C SQL Editor fix: one self-contained atomic DO statement.
-- ${commit ? 'APPLY: changes persist when this statement succeeds.' : 'REHEARSAL: changes are rolled back inside this statement.'}
DO ${importTag}
DECLARE
  data jsonb=${tag}${payload}${tag}::jsonb;
  op jsonb; raw_row jsonb; row_data jsonb; replacement jsonb; own jsonb;
  t text; cols text; conflict_cols text; key_condition text; match_condition text;
  assignments text; changed text; statement text; allowed boolean; bad boolean; found_row boolean;
  route_slug text; route_id uuid; wanted text[]; desired_keys text[]; prefix text;
  expected integer; actual integer; where_data jsonb; fragment_id uuid;
  k text; v jsonb; target_table text; target_key text; target_value text; resolved_id uuid; input_data jsonb;
BEGIN
  PERFORM set_config('lock_timeout','10s',true);
  PERFORM pg_advisory_xact_lock(7232003);
  LOCK TABLE ${plan.tables.map(t=>`software_discovery.${t.table}`).join(",")} IN SHARE ROW EXCLUSIVE MODE;
  own=data->'ownership';
  FOR replacement IN SELECT value FROM jsonb_array_elements(data->'routeMembershipReplacements') LOOP
    route_slug=replacement->'where'->'escape_route_id'->'$ref'->'where'->>'slug';
    IF NOT (own->'routes' ? route_slug) THEN
      SELECT id INTO route_id FROM software_discovery.escape_routes WHERE slug=route_slug;
      IF route_id IS NOT NULL THEN
        SELECT coalesce(array_agg(value ORDER BY value),'{}') INTO wanted FROM jsonb_array_elements_text(replacement->'desiredProductSlugs');
        IF wanted IS DISTINCT FROM (SELECT coalesce(array_agg(p.slug ORDER BY p.slug),'{}') FROM software_discovery.escape_route_products m JOIN software_discovery.products p ON p.id=m.product_id WHERE m.escape_route_id=route_id) THEN RAISE EXCEPTION 'Existing route membership differs; ownership required: %',route_slug; END IF;
      END IF;
    END IF;
  END LOOP;
  FOR op IN SELECT value FROM jsonb_array_elements(data->'tables') LOOP
    t=op->>'table';
    IF t NOT IN (${plan.tables.map(t=>`'${t.table}'`).join(",")}) THEN RAISE EXCEPTION 'Invalid table'; END IF;
    SELECT string_agg(format('%I',value),',') INTO conflict_cols FROM jsonb_array_elements_text(op->'conflictColumns');
    actual=0; expected=jsonb_array_length(op->'rows');
    FOR raw_row IN SELECT value FROM jsonb_array_elements(op->'rows') LOOP
  ${resolveInline('raw_row','row_data')}
      SELECT string_agg(format('%I',key),',' ORDER BY key),string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',key,key),' AND ' ORDER BY key) INTO cols,match_condition FROM jsonb_object_keys(row_data) AS keys(key);
      SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',value,value),' AND ') INTO key_condition FROM jsonb_array_elements_text(op->'conflictColumns');
      allowed=CASE
        WHEN t='evidence_sources' THEN own->'sources' ? (raw_row->>'seed_key')
        WHEN t='products' THEN own->'products' ? (raw_row->>'slug')
        WHEN t='escape_routes' THEN own->'routes' ? (raw_row->>'slug')
        WHEN t='escape_route_products' THEN own->'routes' ? (raw_row->'escape_route_id'->'$ref'->'where'->>'slug')
        WHEN raw_row ? 'product_id' THEN own->'products' ? (raw_row->'product_id'->'$ref'->'where'->>'slug')
        WHEN t IN ('anchors','attributes','problems','audiences') THEN own->'taxonomy'->t ? (raw_row->>'slug')
        ELSE false END;
      IF NOT coalesce(allowed,false) THEN
        EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s AND NOT (%s))',t,t,key_condition,match_condition) INTO bad USING row_data;
        IF bad THEN RAISE EXCEPTION 'Existing row differs; ownership required: %',t; END IF;
      END IF;
      SELECT string_agg(format('%I=EXCLUDED.%I',key,key),',' ORDER BY key),string_agg(format('target.%I IS DISTINCT FROM EXCLUDED.%I',key,key),' OR ' ORDER BY key) INTO assignments,changed FROM jsonb_object_keys(row_data) AS keys(key) WHERE NOT (op->'conflictColumns' ? key);
      statement=format('INSERT INTO software_discovery.%I AS target (%s) SELECT %s FROM jsonb_populate_record(NULL::software_discovery.%I,$1) source ON CONFLICT (%s) ',t,cols,cols,t,conflict_cols);
      IF assignments IS NULL OR t='claim_evidence' THEN statement=statement||'DO NOTHING';
      ELSE
        IF t IN ('evidence_sources','anchors','attributes','problems','audiences','products','product_attributes','escape_routes','escape_route_products') THEN assignments=assignments||',updated_at=now()'; END IF;
        statement=statement||format('DO UPDATE SET %s WHERE %s',assignments,changed);
      END IF;
      EXECUTE statement USING row_data;
      EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s)',t,t,match_condition) INTO found_row USING row_data;
      IF NOT found_row THEN RAISE EXCEPTION 'Stored row differs from seed: %',t; END IF;
      actual=actual+1;
    END LOOP;
    RAISE NOTICE 'Seed table %: % rows verified',t,actual;
  END LOOP;
  FOR replacement IN SELECT value FROM jsonb_array_elements(data->'evidenceReplacements') LOOP
    t=replacement->>'table';
    IF t NOT IN ('product_attribute_evidence','product_anchor_evidence','product_problem_evidence','product_audience_evidence') THEN RAISE EXCEPTION 'Invalid evidence table'; END IF;
    ${resolveInline("replacement->'where'","where_data")}
    SELECT string_agg(format('link.%I IS NOT DISTINCT FROM source.%I',key,key),' AND ') INTO key_condition FROM jsonb_object_keys(where_data) AS keys(key);
    SELECT coalesce(array_agg(value),'{}') INTO desired_keys FROM jsonb_array_elements_text(replacement->'desiredFragmentKeys');
    prefix=replacement->'ownership'->>'fragmentSeedKeyPrefix';
    EXECUTE format('DELETE FROM software_discovery.%I link USING software_discovery.claim_evidence fragment,jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE link.claim_evidence_id=fragment.id AND %s AND left(fragment.seed_key,length($2))=$2 AND NOT(fragment.seed_key=ANY($3))',t,t,key_condition) USING where_data,prefix,desired_keys;
  END LOOP;
  FOR replacement IN SELECT value FROM jsonb_array_elements(data->'routeMembershipReplacements') LOOP
    ${resolveInline("replacement->'where'","where_data")}route_id=(where_data->>'escape_route_id')::uuid;
    SELECT coalesce(array_agg(value),'{}') INTO wanted FROM jsonb_array_elements_text(replacement->'desiredProductSlugs');
    DELETE FROM software_discovery.escape_route_products m WHERE m.escape_route_id=route_id AND NOT EXISTS(SELECT 1 FROM software_discovery.products p WHERE p.id=m.product_id AND p.slug=ANY(wanted));
    SELECT count(*) INTO actual FROM software_discovery.escape_route_products WHERE escape_route_id=route_id;
    IF actual<>cardinality(wanted) THEN RAISE EXCEPTION 'Route membership count mismatch'; END IF;
  END LOOP;
${commit ? "" : "  RAISE SQLSTATE 'ZSR01' USING MESSAGE='Rehearsal only';"}
EXCEPTION WHEN SQLSTATE 'ZSR01' THEN
  RAISE NOTICE 'Rehearsal rolled back; no seed changes persisted';
END ${importTag};
`;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const args=process.argv.slice(2);const commit=args.includes('--commit');const positional=args.filter(a=>a!=='--commit');
    if(positional.length!==3||positional.some(a=>a.startsWith('--')))throw new Error('Usage: node scripts/seed/import-sql-compact.mjs <seed.json> <ownership.json> <output.sql> [--commit]');
    const [input,owner,output]=positional;const sql=createCompactImportSql(JSON.parse(fs.readFileSync(input,'utf8')),JSON.parse(fs.readFileSync(owner,'utf8')),{commit});
    fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,sql);console.log(`Compact SQL generated: ${Buffer.byteLength(sql)} bytes. No remote writes.`);
  }catch(error){console.error(error.message);process.exitCode=1;}
}
