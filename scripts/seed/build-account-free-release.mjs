import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildAccountFreeImport} from './build-account-free-import.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,'');
const json=p=>JSON.parse(read(p));
const hash=x=>createHash('md5').update(x.replace(/\r/g,'')).digest('hex');
const uuid=key=>{const s=createHash('sha256').update('issue21-publication-v1:'+key).digest('hex');return `${s.slice(0,8)}-${s.slice(8,12)}-5${s.slice(13,16)}-a${s.slice(17,20)}-${s.slice(20,32)}`;};
const literal=x=>"'"+JSON.stringify(x).replaceAll("'","''")+"'::jsonb";
const matches=(table,row)=>`EXISTS(SELECT 1 FROM software_discovery.${table} target CROSS JOIN jsonb_populate_record(NULL::software_discovery.${table},${literal(row)}) source WHERE ${Object.keys(row).map(k=>`target.${k} IS NOT DISTINCT FROM source.${k}`).join(' AND ')})`;
export function buildAccountFreeRelease(){
 const draft=buildAccountFreeImport(),proposal=json('seed/research/account-free-proposal-2026-11-02.json'),base=json('seed/research/account-free-baseline-2026-11-02.json');
 const added=[],add=(table,keys,row)=>added.push({table,keys,row});
 const scope='account-free-note-workflow-scope',scopeId=draft.payload.scopeId;
 for(const slug of ['affine','obsidian']){
  const product=proposal.products.find(p=>p.slug===slug),claim=product.attributes.find(c=>c.slug===scope),productId=base.products.find(p=>p.slug===slug).id;
  if(claim.value!=='personal-desktop-local-note-creation-editing-retention-without-app-account'||claim.verificationStatus!=='verified'||claim.lastVerifiedAt!=='2026-11-02T00:00:00Z')throw Error('Reviewed scope proposal drift');
  for(const s of claim.sources)if(!added.some(op=>op.table==='evidence_sources'&&op.row.url===s.url))add('evidence_sources',['seed_key'],{id:uuid('source:'+s.url),seed_key:'issue21-scope-source:'+uuid(s.url),source_type:s.url.endsWith('/pricing')?'pricing':'documentation',title:slug==='affine'?'AFFiNE official local desktop workflow':'Obsidian official local notes and account requirements',url:s.url,publisher:product.name,retrieved_at:claim.lastVerifiedAt});
  add('product_attributes',['product_id','attribute_id'],{product_id:productId,attribute_id:scopeId,value_boolean:null,value_text:claim.value,value_number:null,value_enum:null,confidence:claim.confidence,verification_status:'verified',last_verified_at:claim.lastVerifiedAt});
  for(const s of claim.sources){const key=slug+':'+scope+':'+s.url,evidenceId=uuid('claim:'+key);add('claim_evidence',['seed_key'],{id:evidenceId,seed_key:'issue21-scope-claim:'+uuid(key),evidence_source_id:uuid('source:'+s.url),excerpt:null,notes:'Issue #21 bounded desktop personal-note documentary editorial review; source pointer, not a quotation or hands-on test.'});add('product_attribute_evidence',['product_id','attribute_id','claim_evidence_id'],{product_id:productId,attribute_id:scopeId,claim_evidence_id:evidenceId});}
 }
 const changes=draft.payload.ops.filter(op=>op.table==='products'||op.table==='escape_routes').map(op=>({...op,before:op.row,row:{...op.row,status:'published',...(op.table==='escape_routes'?{editorially_approved:true}:{})}}));
 const baselineSources=base.public_product_pages.filter(x=>x.page).flatMap(x=>x.page.attributes.flatMap(c=>{const a=base.attribute_taxonomy.find(a=>a.slug===c.slug);return a?c.sources.map(source=>({product_id:base.products.find(p=>p.slug===x.slug).id,attribute_id:a.id,...source})):[];}));
 const data={...draft.payload,added,changes,baselineSources};
 const prior=read('supabase/migrations/202610280002_zh_hant_search_paths.sql').match(/AS \$ingest\$([\s\S]*?)\$ingest\$;/)?.[1];if(!prior)throw Error('Collector source layout drift');
 const next=prior.replace('sejda|simplenote|smiling-mind','sejda|simplenote|standard-notes|smiling-mind').replace('meditation-apps-without-a-subscription|productivity-apps-you-can-buy-once))','meditation-apps-without-a-subscription|productivity-apps-you-can-buy-once|account-free-note-taking-apps))');
 if(next===prior||!next.includes('|standard-notes|')||!next.includes('|account-free-note-taking-apps))'))throw Error('Collector replacement drift');
 return {data,analyticsApply:analytics(prior,next),analyticsRollback:analytics(next,prior,true),rehearse:publication(data,'rehearse',hash(next)),apply:publication(data,'apply',hash(next)),rollback:publication(data,'rollback',hash(next)),verify:verify(data,hash(next)),priorHash:hash(prior),nextHash:hash(next)};
}
function analytics(before,after,rollback=false){
 return `-- Issue #21: exact collector-body transition; no event/settings/publication data writes.
BEGIN;
SET LOCAL lock_timeout='5s';
SELECT pg_advisory_xact_lock(8220001);
DO $patch$
DECLARE current_body text; definition text; acl_before aclitem[]; owner_before oid;
BEGIN
 IF current_user<>'postgres' THEN RAISE EXCEPTION 'Run as postgres'; END IF;
 ${rollback?"IF EXISTS(SELECT FROM software_discovery.products WHERE slug='standard-notes' AND status='published') OR EXISTS(SELECT FROM software_discovery.escape_routes WHERE slug='account-free-note-taking-apps' AND status='published') THEN RAISE EXCEPTION 'Issue21 hide the release before rolling back analytics'; END IF;":''}
 SELECT prosrc,proacl,proowner INTO current_body,acl_before,owner_before FROM pg_proc WHERE oid=to_regprocedure('software_discovery.ingest_discovery_events_v2(jsonb,text)') AND prosecdef AND proconfig=ARRAY['search_path=pg_catalog']::text[];
 IF current_body IS NULL OR md5(replace(current_body,E'\r','')) NOT IN ('${hash(before)}','${hash(after)}') THEN RAISE EXCEPTION 'Issue21 collector definition drift'; END IF;
 IF has_function_privilege('anon','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE') OR has_function_privilege('authenticated','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE') OR NOT has_function_privilege('service_role','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE') THEN RAISE EXCEPTION 'Issue21 collector access drift'; END IF;
 IF NOT (SELECT count(*)=2 AND bool_and(relrowsecurity AND relforcerowsecurity) FROM pg_class WHERE oid IN ('software_discovery.discovery_events_v2'::regclass,'software_discovery.discovery_queries_v2'::regclass)) THEN RAISE EXCEPTION 'Issue21 private storage drift'; END IF;
 IF md5(replace(current_body,E'\r',''))='${hash(before)}' THEN
  definition='CREATE OR REPLACE FUNCTION software_discovery.ingest_discovery_events_v2(batch jsonb,rate_key text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $body$'||$expected$${after}$expected$||'$body$;';
  EXECUTE definition;
 END IF;
 IF NOT EXISTS(SELECT FROM pg_proc WHERE oid=to_regprocedure('software_discovery.ingest_discovery_events_v2(jsonb,text)') AND md5(replace(prosrc,E'\r',''))='${hash(after)}' AND proacl IS NOT DISTINCT FROM acl_before AND proowner=owner_before AND prosecdef AND proconfig=ARRAY['search_path=pg_catalog']::text[]) THEN RAISE EXCEPTION 'Issue21 collector postcondition mismatch'; END IF;
END $patch$;
COMMIT;
`;
}
function publication(data,mode,collectorHash){
 return `-- Issue #21 ${mode}: atomic bounded scope and publication transition.
DO $release$
DECLARE data jsonb=$payload$${JSON.stringify(data)}$payload$::jsonb; op jsonb; expected jsonb; actual jsonb; t text; cols text; keys_sql text; match_sql text; found boolean; same boolean; sn_status text; route_status text; approved boolean;
BEGIN
 PERFORM set_config('lock_timeout','5s',true);
 PERFORM pg_advisory_xact_lock(hashtext('software_discovery.issue21.account_free_draft'));
 LOCK TABLE software_discovery.products,software_discovery.attributes,software_discovery.product_attributes,software_discovery.escape_routes,software_discovery.escape_route_products,software_discovery.evidence_sources,software_discovery.claim_evidence,software_discovery.product_attribute_evidence IN SHARE ROW EXCLUSIVE MODE;
 IF NOT EXISTS(SELECT FROM pg_proc WHERE oid=to_regprocedure('software_discovery.ingest_discovery_events_v2(jsonb,text)') AND md5(replace(prosrc,E'\r',''))='${collectorHash}') THEN RAISE EXCEPTION 'Issue21 analytics patch must be applied first'; END IF;
 SELECT status INTO sn_status FROM software_discovery.products WHERE id=(data->>'snId')::uuid;
 SELECT status,editorially_approved INTO route_status,approved FROM software_discovery.escape_routes WHERE id=(data->>'routeId')::uuid;
 IF NOT ((sn_status='draft' AND route_status='draft' AND NOT approved) OR (sn_status='published' AND route_status='published' AND approved)) THEN RAISE EXCEPTION 'Issue21 inconsistent publication state'; END IF;
 ${mode==='rollback'?"IF sn_status<>'published' THEN RAISE EXCEPTION 'Issue21 rollback requires intact published state'; END IF;":''}
 FOR expected IN SELECT value FROM jsonb_array_elements(data->'guardProducts') LOOP
  SELECT to_jsonb(p)-'created_at'-'updated_at' INTO actual FROM software_discovery.products p WHERE p.id=(expected->>'id')::uuid;
  IF actual IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Issue21 original product metadata drift'; END IF;
 END LOOP;
 FOR expected IN SELECT value FROM jsonb_array_elements(data->'guardTaxonomy') LOOP
  SELECT to_jsonb(a)-'created_at'-'updated_at' INTO actual FROM software_discovery.attributes a WHERE a.id=(expected->>'id')::uuid;
  IF actual IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Issue21 taxonomy baseline drift'; END IF;
 END LOOP;
 IF (SELECT count(*) FROM software_discovery.product_attributes WHERE product_id IN (SELECT (v->>'id')::uuid FROM jsonb_array_elements(data->'guardProducts') v) AND attribute_id<>(data->>'scopeId')::uuid)<>jsonb_array_length(data->'guardAttributes') THEN RAISE EXCEPTION 'Issue21 old attribute count drift'; END IF;
 FOR expected IN SELECT value FROM jsonb_array_elements(data->'guardAttributes') LOOP
  SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',key,key),' AND ') INTO match_sql FROM jsonb_object_keys(expected) x(key);
  EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.product_attributes target CROSS JOIN jsonb_populate_record(NULL::software_discovery.product_attributes,$1) source WHERE %s)',match_sql) INTO same USING expected;
  IF NOT same THEN RAISE EXCEPTION 'Issue21 old claim drift'; END IF;
 END LOOP;
 IF (SELECT count(*) FROM software_discovery.product_attributes WHERE product_id=(data->>'snId')::uuid)<>4 OR (SELECT count(*) FROM software_discovery.escape_route_products WHERE escape_route_id=(data->>'routeId')::uuid)<>3 THEN RAISE EXCEPTION 'Issue21 draft graph changed'; END IF;
 FOR op IN SELECT value FROM jsonb_array_elements(data->'ops') LOOP
  t=op->>'table';expected=op->'row';
  IF t='products' THEN expected=jsonb_set(expected,'{status}',to_jsonb(sn_status)); END IF;
  IF t='escape_routes' THEN expected=jsonb_set(jsonb_set(expected,'{status}',to_jsonb(route_status)),'{editorially_approved}',to_jsonb(approved)); END IF;
  SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',key,key),' AND ') INTO match_sql FROM jsonb_object_keys(expected) x(key);
  EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s)',t,t,match_sql) INTO same USING expected;
  IF NOT same THEN RAISE EXCEPTION 'Issue21 accepted draft row drift in %',t; END IF;
 END LOOP;
 IF EXISTS(SELECT FROM software_discovery.product_anchors WHERE product_id=(data->>'snId')::uuid) OR EXISTS(SELECT FROM software_discovery.product_audiences WHERE product_id=(data->>'snId')::uuid) OR EXISTS(SELECT FROM software_discovery.product_problems WHERE product_id=(data->>'snId')::uuid) OR (SELECT count(*) FROM software_discovery.escape_route_products WHERE product_id=(data->>'snId')::uuid)<>1 OR (SELECT count(*) FROM software_discovery.product_attribute_evidence WHERE product_id=(data->>'snId')::uuid)<>6 THEN RAISE EXCEPTION 'Issue21 Standard Notes graph/provenance changed'; END IF;
 FOR expected IN SELECT value FROM jsonb_array_elements(data->'baselineSources') LOOP
  IF NOT EXISTS(SELECT FROM software_discovery.product_attribute_evidence l JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources s ON s.id=e.evidence_source_id WHERE l.product_id=(expected->>'product_id')::uuid AND l.attribute_id=(expected->>'attribute_id')::uuid AND s.title=expected->>'title' AND s.url IS NOT DISTINCT FROM expected->>'url' AND s.retrieved_at IS NOT DISTINCT FROM (expected->>'retrievedAt')::timestamptz) THEN RAISE EXCEPTION 'Issue21 historical claim provenance drift'; END IF;
 END LOOP;
 -- Only two reviewed new scope claims and their new provenance may be inserted/removed.
 FOR op IN SELECT value FROM jsonb_array_elements(data->'added') ${mode==='rollback'?'WITH ORDINALITY x(value,n) ORDER BY n DESC':''} LOOP
  t=op->>'table';expected=op->'row';
  SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',value,value),' AND ') INTO keys_sql FROM jsonb_array_elements_text(op->'keys');
  SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',key,key),' AND '),string_agg(format('%I',key),',') INTO match_sql,cols FROM jsonb_object_keys(expected) x(key);
  EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s),EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s AND %s)',t,t,keys_sql,t,t,keys_sql,match_sql) INTO found,same USING expected;
  IF found AND NOT same OR sn_status='published' AND NOT found THEN RAISE EXCEPTION 'Issue21 scope/provenance drift in %',t; END IF;
  ${mode==='rollback'?`IF t='product_attributes' AND EXISTS(SELECT 1 FROM software_discovery.product_attribute_evidence WHERE product_id=(expected->>'product_id')::uuid AND attribute_id=(expected->>'attribute_id')::uuid) THEN RAISE EXCEPTION 'Issue21 scope gained evidence'; END IF;
  IF t='claim_evidence' AND (EXISTS(SELECT 1 FROM software_discovery.product_attribute_evidence WHERE claim_evidence_id=(expected->>'id')::uuid) OR EXISTS(SELECT 1 FROM software_discovery.product_anchor_evidence WHERE claim_evidence_id=(expected->>'id')::uuid) OR EXISTS(SELECT 1 FROM software_discovery.product_problem_evidence WHERE claim_evidence_id=(expected->>'id')::uuid) OR EXISTS(SELECT 1 FROM software_discovery.product_audience_evidence WHERE claim_evidence_id=(expected->>'id')::uuid)) THEN RAISE EXCEPTION 'Issue21 evidence gained references'; END IF;
  IF t='evidence_sources' AND EXISTS(SELECT 1 FROM software_discovery.claim_evidence WHERE evidence_source_id=(expected->>'id')::uuid) THEN RAISE EXCEPTION 'Issue21 source gained references'; END IF;
  EXECUTE format('DELETE FROM software_discovery.%I target USING jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s',t,t,keys_sql) USING expected;`:`IF NOT found THEN EXECUTE format('INSERT INTO software_discovery.%I (%s) SELECT %s FROM jsonb_populate_record(NULL::software_discovery.%I,$1)',t,cols,cols,t) USING expected; END IF;`}
 END LOOP;
 ${mode==='rollback'?`UPDATE software_discovery.products SET status='draft' WHERE id=(data->>'snId')::uuid;
 UPDATE software_discovery.escape_routes SET status='draft',editorially_approved=false WHERE id=(data->>'routeId')::uuid;`:`IF sn_status='draft' THEN
  UPDATE software_discovery.products SET status='published' WHERE id=(data->>'snId')::uuid;
  UPDATE software_discovery.escape_routes SET status='published',editorially_approved=true WHERE id=(data->>'routeId')::uuid;
 END IF;
 IF (${qualified(data)})<>3 THEN RAISE EXCEPTION 'Issue21 needs three source-backed qualified published products'; END IF;`}
 ${mode==='rehearse'?"RAISE EXCEPTION USING ERRCODE='P2122',MESSAGE='Issue21 release rehearsal complete';":"RAISE NOTICE 'Issue21 "+mode+" complete';"}
${mode==='rehearse'?"EXCEPTION WHEN SQLSTATE 'P2122' THEN RAISE NOTICE 'Issue21 release rehearsal rolled back; publication unchanged.';":''}
END $release$;
`;
}
function qualified(data){return `SELECT count(*) FROM software_discovery.products p JOIN software_discovery.escape_route_products m ON m.product_id=p.id WHERE m.escape_route_id='${data.routeId}' AND p.status='published' AND NOT EXISTS(SELECT FROM (VALUES ('no-account-required'),('account-free-note-workflow-scope'),('pricing-model'),('trade-off-summary')) required(slug) WHERE NOT EXISTS(SELECT FROM software_discovery.product_attributes c JOIN software_discovery.attributes a ON a.id=c.attribute_id WHERE c.product_id=p.id AND a.slug=required.slug AND c.verification_status='verified' AND c.confidence BETWEEN .8 AND 1 AND c.last_verified_at IS NOT NULL AND (CASE a.slug WHEN 'no-account-required' THEN c.value_boolean IS TRUE WHEN 'account-free-note-workflow-scope' THEN c.value_text='personal-desktop-local-note-creation-editing-retention-without-app-account' ELSE length(trim(c.value_text))>0 END) AND EXISTS(SELECT FROM software_discovery.product_attribute_evidence l JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources s ON s.id=e.evidence_source_id WHERE l.product_id=c.product_id AND l.attribute_id=c.attribute_id AND s.url ~ '^https?://[^/?#@:]+(:[0-9]+)?([/?#]|$)')))`;}
function verify(data,hash){
 const rows=[...data.ops.map(op=>({...op,row:op.table==='products'?{...op.row,status:'published'}:op.table==='escape_routes'?{...op.row,status:'published',editorially_approved:true}:op.row})),...data.added];
 return `-- Issue #21 read-only release verification.
SELECT 'published_graph_matches' check_name,${rows.map(op=>matches(op.table,op.row)).join(' AND ')} passed
UNION ALL SELECT 'three_qualified_candidates',(${qualified(data)})=3
UNION ALL SELECT 'original_products_preserved',${data.guardProducts.map(p=>matches('products',p)).join(' AND ')}
UNION ALL SELECT 'original_claims_preserved',${data.guardAttributes.map(p=>matches('product_attributes',p)).join(' AND ')}
UNION ALL SELECT 'standard_notes_public',software_discovery.product_discovery_page('standard-notes')->>'status'='published'
UNION ALL SELECT 'collector_definition_ready',EXISTS(SELECT FROM pg_proc WHERE oid=to_regprocedure('software_discovery.ingest_discovery_events_v2(jsonb,text)') AND md5(replace(prosrc,E'\r',''))='${hash}' AND prosecdef AND proconfig=ARRAY['search_path=pg_catalog']::text[])
UNION ALL SELECT 'collector_remains_service_only',NOT has_function_privilege('anon','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE') AND NOT has_function_privilege('authenticated','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE') AND has_function_privilege('service_role','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE')
UNION ALL SELECT 'analytics_rls_still_forced',(SELECT count(*)=2 AND bool_and(relrowsecurity AND relforcerowsecurity) FROM pg_class WHERE oid IN ('software_discovery.discovery_events_v2'::regclass,'software_discovery.discovery_queries_v2'::regclass));
`;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const r=buildAccountFreeRelease(),files={
  'supabase/migrations/202611030001_account_free_event_paths.sql':r.analyticsApply,
  'supabase/data/ISSUE21_RELEASE_ANALYTICS_ROLLBACK.sql':r.analyticsRollback,
  'supabase/data/ISSUE21_RELEASE_REHEARSE.sql':r.rehearse,
  'supabase/data/ISSUE21_RELEASE_APPLY.sql':r.apply,
  'supabase/data/ISSUE21_RELEASE_ROLLBACK.sql':r.rollback,
  'supabase/verification/ISSUE21_RELEASE_VERIFY.sql':r.verify};
 for(const [name,sql] of Object.entries(files)){const target=path.join(root,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,sql);}
 console.log('Generated collector patch, guarded publication, verification and rollback SQL. No remote writes.');
}
