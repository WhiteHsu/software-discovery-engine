import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {createDatabasePlan} from './database-plan.mjs';
import {buildTodoistDraftImport} from './build-todoist-draft-import.mjs';
import {escapeDefinitions,rankCandidates} from '../../lib/discovery/escape-model.ts';
const slugs=['2do','omnifocus','things'],routeSlug='todoist-alternatives-with-a-one-time-purchase';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function fullPublicationSelection(input,selected=slugs){
 const b=structuredClone(input);b.products=selected.map(slug=>{const p=b.products.find(p=>p.slug===slug);if(!p)throw Error(`Missing product ${slug}`);return p;});b.escapeRoutes=[];
 for(const k of ['attributes','anchors','audiences','problems'])b[k]=b[k].filter(n=>b.products.some(p=>p[k].some(c=>c.slug===n.slug)));
 const keys=new Set(b.products.flatMap(p=>['attributes','anchors','audiences','problems'].flatMap(k=>p[k].flatMap(c=>c.evidence))));b.sources=b.sources.filter(s=>keys.has(s.key));return b;
}
export function buildTodoistPublication(baseline,reviewed,importReview,review,{commit=false}={}){
 buildTodoistDraftImport(baseline,reviewed,importReview);
 const bundle=fullPublicationSelection(reviewed);
 if(review.version!==1||review.publicationDecision!=='pending'||review.bundleSha256!==hash(bundle)||review.route?.slug!==routeSlug||review.route.status!=='draft'||review.route.editoriallyApproved!==false||review.route.anchorSlug!=='todoist'||review.route.products?.length!==3||review.route.products.some((m,i)=>m.productSlug!==slugs[i]||m.position!==i+1||m.noveltyScore!==0)||!review.route.description.includes('Personal task capture and project organization')||review.route.lastVerifiedAt!=='2026-10-07T00:00:00Z')throw Error('Publication review drift or approval mismatch');
 if(review.route.name!==escapeDefinitions[3].name||review.route.products.some(m=>m.editorialNote!==bundle.products.find(p=>p.slug===m.productSlug).anchors.find(c=>c.slug==='todoist').scopeDescription))throw Error('Route name/member review mismatch');
 const pages=bundle.products.map(p=>({...p,attributes:p.attributes.map(c=>({...c,sources:c.evidence.map(key=>bundle.sources.find(s=>s.key===key))})),anchors:p.anchors.map(c=>({...c,sources:c.evidence.map(key=>bundle.sources.find(s=>s.key===key))})),audiences:p.audiences.map(c=>({...c,sources:c.evidence.map(key=>bundle.sources.find(s=>s.key===key))}))}));
 const candidates=rankCandidates(escapeDefinitions[3],pages.map(product=>({product,noveltyScore:0})));
 if(candidates.length!==3||candidates.some(c=>!c.eligible))throw Error('Three qualified candidates required');
 const plan=createDatabasePlan(bundle),old=createDatabasePlan(fullPublicationSelection(baseline,['things','omnifocus']));
 // PR5.8 retained historical pointers. Guard the complete old+reviewed evidence set.
 for(const op of plan.tables)if(op.table==='evidence_sources'||op.table==='claim_evidence'||op.table.endsWith('_evidence')){
  const previous=old.tables.find(t=>t.table===op.table);
  const rows=new Map(op.rows.map(r=>[JSON.stringify(op.conflictColumns.map(k=>r[k])),r]));
  for(const r of previous.rows)if(!rows.has(JSON.stringify(op.conflictColumns.map(k=>r[k]))))rows.set(JSON.stringify(op.conflictColumns.map(k=>r[k])),r);
  op.rows=[...rows.values()];
 }
 const route={slug:routeSlug,name:review.route.name,description:review.route.description,anchor_id:{$ref:{table:'anchors',where:{slug:'todoist'}}},last_verified_at:review.route.lastVerifiedAt};
 const payload=JSON.stringify({tables:plan.tables,route,members:review.route.products});
 if(payload.includes('$pr59_data$')||payload.includes('$pr59$'))throw Error('SQL delimiter collision');
 const sql=`-- PR5.9 ${commit?'APPLY ONLY AFTER EXPLICIT OWNER PUBLICATION APPROVAL':'REHEARSAL: all publication changes roll back'}.
-- Publish exactly Things, OmniFocus, 2Do and one scoped Todoist route.
DO $pr59$
DECLARE
 payload jsonb=$pr59_data$${payload}$pr59_data$::jsonb;
 tbl jsonb; item jsonb; wanted jsonb; prop record; ref_where record;
 ref_id uuid; matched boolean; actual_count integer; expected_count integer;
 target_id uuid; route_id uuid; product_slug text; page jsonb;
BEGIN
 SET LOCAL lock_timeout='10s';
 PERFORM pg_advisory_xact_lock(7232003);
 LOCK TABLE ${plan.tables.map(t=>'software_discovery.'+t.table).join(', ')} IN SHARE ROW EXCLUSIVE MODE;
 IF (SELECT count(*) FROM software_discovery.products WHERE slug IN ('2do','omnifocus','things') AND status IN ('draft','published'))<>3 THEN RAISE EXCEPTION 'PR5.9 target lifecycle mismatch'; END IF;
 IF EXISTS(SELECT 1 FROM software_discovery.escape_route_products m JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id JOIN software_discovery.products p ON p.id=m.product_id WHERE p.slug IN ('2do','omnifocus','things') AND r.slug<>'${routeSlug}' AND r.status='published' AND r.editorially_approved) THEN RAISE EXCEPTION 'PR5.9 other approved route exposure requires review'; END IF;
 FOR tbl IN SELECT value FROM jsonb_array_elements(payload->'tables') LOOP
  FOR item IN SELECT value FROM jsonb_array_elements(tbl->'rows') LOOP
   wanted=item;
   FOR prop IN SELECT key,value FROM jsonb_each(item) LOOP
    IF prop.value ? '$ref' THEN
     SELECT key,value INTO STRICT ref_where FROM jsonb_each(prop.value->'$ref'->'where');
     ref_id=NULL;
     EXECUTE format('SELECT id FROM software_discovery.%I WHERE %I=$1',prop.value->'$ref'->>'table',ref_where.key) INTO ref_id USING ref_where.value #>> '{}';
     IF ref_id IS NULL THEN RAISE EXCEPTION 'PR5.9 required reference missing'; END IF;
     wanted=jsonb_set(wanted,ARRAY[prop.key],to_jsonb(ref_id));
    END IF;
   END LOOP;
   IF tbl->>'table'='products' THEN wanted=wanted-'status'; END IF;
   EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I c WHERE NOT EXISTS(SELECT 1 FROM jsonb_object_keys($1) k WHERE to_jsonb(c)->k IS DISTINCT FROM to_jsonb(jsonb_populate_record(NULL::software_discovery.%I,$1))->k))',tbl->>'table',tbl->>'table') INTO matched USING wanted;
   IF NOT matched THEN RAISE EXCEPTION 'PR5.9 review mismatch: %',tbl->>'table'; END IF;
  END LOOP;
  IF left(tbl->>'table',8)='product_' THEN
   FOREACH product_slug IN ARRAY ARRAY['2do','omnifocus','things'] LOOP
    SELECT id INTO STRICT target_id FROM software_discovery.products WHERE slug=product_slug;
    SELECT count(*) INTO expected_count FROM jsonb_array_elements(tbl->'rows') r WHERE r->'product_id'->'$ref'->'where'->>'slug'=product_slug;
    EXECUTE format('SELECT count(*) FROM software_discovery.%I WHERE product_id=$1',tbl->>'table') INTO actual_count USING target_id;
    IF actual_count<>expected_count THEN RAISE EXCEPTION 'PR5.9 relationship/evidence set changed: %/%',product_slug,tbl->>'table'; END IF;
   END LOOP;
  END IF;
 END LOOP;
 SELECT id INTO STRICT ref_id FROM software_discovery.anchors WHERE slug='todoist';
 wanted=jsonb_set(payload->'route',ARRAY['anchor_id'],to_jsonb(ref_id));
 SELECT id INTO route_id FROM software_discovery.escape_routes WHERE slug='${routeSlug}';
 IF route_id IS NOT NULL THEN
  SELECT EXISTS(SELECT 1 FROM software_discovery.escape_routes c WHERE c.id=route_id AND ((status='draft' AND NOT editorially_approved) OR (status='published' AND editorially_approved)) AND NOT EXISTS(SELECT 1 FROM jsonb_object_keys(wanted) k WHERE to_jsonb(c)->k IS DISTINCT FROM to_jsonb(jsonb_populate_record(NULL::software_discovery.escape_routes,wanted))->k)) INTO matched;
  IF NOT matched THEN RAISE EXCEPTION 'PR5.9 route metadata/approval mismatch'; END IF;
  SELECT count(*) INTO actual_count FROM software_discovery.escape_route_products WHERE escape_route_id=route_id;
  IF actual_count NOT IN (0,3) THEN RAISE EXCEPTION 'PR5.9 route membership drift'; END IF;
  IF actual_count=3 THEN
   FOR item IN SELECT value FROM jsonb_array_elements(payload->'members') LOOP
    SELECT id INTO STRICT target_id FROM software_discovery.products WHERE slug=item->>'productSlug';
    IF NOT EXISTS(SELECT 1 FROM software_discovery.escape_route_products m WHERE escape_route_id=route_id AND product_id=target_id AND position=(item->>'position')::integer AND novelty_score=0 AND relevance_score IS NULL AND constraint_fit_score IS NULL AND quality_score IS NULL AND editorial_note=item->>'editorialNote') THEN RAISE EXCEPTION 'PR5.9 member data mismatch'; END IF;
   END LOOP;
  END IF;
 ELSE
  INSERT INTO software_discovery.escape_routes(slug,name,description,anchor_id,last_verified_at) SELECT slug,name,description,anchor_id,last_verified_at FROM jsonb_populate_record(NULL::software_discovery.escape_routes,wanted) RETURNING id INTO route_id;
 END IF;
 UPDATE software_discovery.products SET status='published',updated_at=now() WHERE slug IN ('2do','omnifocus','things') AND status='draft';
 FOR item IN SELECT value FROM jsonb_array_elements(payload->'members') LOOP
  SELECT id INTO STRICT target_id FROM software_discovery.products WHERE slug=item->>'productSlug';
  INSERT INTO software_discovery.escape_route_products(escape_route_id,product_id,position,novelty_score,editorial_note) VALUES(route_id,target_id,(item->>'position')::integer,0,item->>'editorialNote') ON CONFLICT(escape_route_id,product_id) DO NOTHING;
 END LOOP;
 UPDATE software_discovery.escape_routes SET status='published',editorially_approved=true,updated_at=now() WHERE id=route_id AND status='draft' AND NOT editorially_approved;
 FOREACH product_slug IN ARRAY ARRAY['2do','omnifocus','things'] LOOP
  page=software_discovery.product_discovery_page(product_slug);
  IF page IS NULL OR page->>'status'<>'published' OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements(page->'anchors') a WHERE a->>'slug'='todoist' AND a->>'scope'='personal-task-project-organization' AND a->>'verificationStatus'='verified') THEN RAISE EXCEPTION 'PR5.9 public projection failed'; END IF;
 END LOOP;
 ${commit?'-- Approved apply persists atomically.':"RAISE SQLSTATE 'ZP509' USING MESSAGE='Rehearsal only';"}
EXCEPTION WHEN SQLSTATE 'ZP509' THEN RAISE NOTICE 'PR5.9 rehearsal rolled back; no publication persisted';
END $pr59$;
`;
 return {sql,bundle,report:{version:1,publicationDecision:'pending',candidateSlugs:candidates.map(c=>c.product.slug),qualifiedCandidates:3,routeSlug,noveltyScore:0,bundleSha256:hash(bundle),sqlSha256:createHash('sha256').update(sql).digest('hex'),mode:commit?'apply-after-approval':'rollback-rehearsal'}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('No arguments supported');const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));const args=[read('.seed-output/editorial-fit/reviewed-five-ecosystems.json'),read('.seed-output/escape-draft/bundle.json'),read('seed/research/todoist-draft-import-2026-10-07.json'),read('seed/research/todoist-publication-review-2026-10-07.json')];const out='.seed-output/todoist-publication';fs.mkdirSync(out,{recursive:true});for(const commit of [false,true]){const r=buildTodoistPublication(...args,{commit});fs.writeFileSync(`${out}/${commit?'PR5.9_APPLY_AFTER_APPROVAL':'PR5.9_REHEARSE'}.sql`,r.sql);fs.writeFileSync(`${out}/${commit?'apply':'rehearse'}-report.json`,JSON.stringify(r.report,null,2)+'\n');if(!commit)fs.writeFileSync(`${out}/reviewed-products.json`,JSON.stringify(r.bundle,null,2)+'\n');}console.log('PR5.9 review packet: three qualified candidates, one route; owner publication approval pending. No remote writes.');}catch(e){console.error(e.message);process.exitCode=1;}
}
