import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {createDatabasePlan} from './database-plan.mjs';
import {buildOfflineDraftImport} from './build-offline-draft-import.mjs';
import {offlineWorkflowBaseline,buildOfflineWorkflow} from './build-offline-workflow.mjs';
import {escapeDefinitions,rankCandidates} from '../../lib/discovery/escape-model.ts';
const slugs=['affine','anytype','appflowy'],routeSlug='offline-notion-alternatives';
const REVIEW_SHA256='747e0da5bd6fc477f3bc679f76baf9b2c383ef52a8bd11cb84781c2bf1770545';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function fullPublicationSelection(input,selected=slugs){
 const b=structuredClone(input);b.products=selected.map(slug=>{const p=b.products.find(p=>p.slug===slug);if(!p)throw Error(`Missing product ${slug}`);return p;});b.escapeRoutes=[];
 for(const k of ['attributes','anchors','audiences','problems'])b[k]=b[k].filter(n=>b.products.some(p=>p[k].some(c=>c.slug===n.slug)));
 const keys=new Set(b.products.flatMap(p=>['attributes','anchors','audiences','problems'].flatMap(k=>p[k].flatMap(c=>c.evidence))));b.sources=b.sources.filter(s=>keys.has(s.key));return b;
}
export function buildOfflinePublication(baseline,reviewed,importReview,review,{commit=false}={}){
 buildOfflineDraftImport(baseline,reviewed,importReview);
 if(hash(review)!==REVIEW_SHA256)throw Error('Publication manifest drift');
 const bundle=fullPublicationSelection(reviewed);
 if(review.version!==1||review.publicationDecision!=='pending'||review.bundleSha256!==hash(bundle)||review.route?.slug!==routeSlug||review.route.status!=='draft'||review.route.editoriallyApproved!==false||review.route.anchorSlug!=='notion'||review.route.products?.length!==3||review.route.products.some((m,i)=>m.productSlug!==slugs[i]||m.position!==i+1||m.noveltyScore!==0)||!review.route.description.includes('Personal offline notes and locally available organized content')||review.route.lastVerifiedAt!=='2026-10-08T00:00:00Z')throw Error('Publication review drift or approval mismatch');
 if(review.route.name!==escapeDefinitions[0].name||review.route.products.some(m=>m.editorialNote!==bundle.products.find(p=>p.slug===m.productSlug).anchors.find(c=>c.slug==='notion').scopeDescription))throw Error('Route name/member review mismatch');
 const pages=bundle.products.map(p=>({...p,attributes:p.attributes.map(c=>({...c,sources:c.evidence.map(key=>bundle.sources.find(s=>s.key===key))})),anchors:p.anchors.map(c=>({...c,description:c.scopeDescription??bundle.anchors.find(a=>a.slug===c.slug)?.description,sources:c.evidence.map(key=>bundle.sources.find(s=>s.key===key))})),audiences:p.audiences.map(c=>({...c,sources:c.evidence.map(key=>bundle.sources.find(s=>s.key===key))}))}));
 const candidates=rankCandidates(escapeDefinitions[0],pages.map(product=>({product,noveltyScore:0})));
 if(candidates.length!==3||candidates.some(c=>!c.eligible))throw Error('Three qualified candidates required');
 const plan=createDatabasePlan(bundle),old=createDatabasePlan(fullPublicationSelection(baseline,slugs));
 // PR5.12 retained historical pointers. Guard the complete old+reviewed evidence set.
 for(const op of plan.tables)if(op.table==='evidence_sources'||op.table==='claim_evidence'||op.table.endsWith('_evidence')){
  const previous=old.tables.find(t=>t.table===op.table);
  const rows=new Map(op.rows.map(r=>[JSON.stringify(op.conflictColumns.map(k=>r[k])),r]));
  for(const r of previous.rows)if(!rows.has(JSON.stringify(op.conflictColumns.map(k=>r[k]))))rows.set(JSON.stringify(op.conflictColumns.map(k=>r[k])),r);
  op.rows=[...rows.values()];
 }
 const route={slug:routeSlug,name:review.route.name,description:review.route.description,anchor_id:{$ref:{table:'anchors',where:{slug:'notion'}}},last_verified_at:review.route.lastVerifiedAt};
 const priorPlan=createDatabasePlan(baseline);
 const priorRoute=priorPlan.tables.find(t=>t.table==='escape_routes').rows.find(r=>r.slug===routeSlug);
 const priorMembers=priorPlan.tables.find(t=>t.table==='escape_route_products').rows.filter(r=>r.escape_route_id.$ref.where.slug===routeSlug);
 const payload=JSON.stringify({tables:plan.tables,route,priorRoute,priorMembers,members:review.route.products});
 if(payload.includes('$pr513_data$')||payload.includes('$pr513$'))throw Error('SQL delimiter collision');
 const sql=`-- PR5.13 ${commit?'APPLY ONLY AFTER EXPLICIT OWNER PUBLICATION APPROVAL':'REHEARSAL: all publication changes roll back'}.
-- Publish exactly AFFiNE, Anytype, AppFlowy and one scoped offline Notion route.
DO $pr513$
DECLARE
 payload jsonb=$pr513_data$${payload}$pr513_data$::jsonb;
 tbl jsonb; item jsonb; wanted jsonb; prop record; ref_where record;
 ref_id uuid; matched boolean; actual_count integer; expected_count integer;
 target_id uuid; route_id uuid; product_slug text; page jsonb;
BEGIN
 SET LOCAL lock_timeout='10s';
 PERFORM pg_advisory_xact_lock(7232003);
 LOCK TABLE ${[...new Set([...plan.tables.map(t=>'software_discovery.'+t.table),'software_discovery.escape_routes','software_discovery.escape_route_products'])].join(', ')} IN SHARE ROW EXCLUSIVE MODE;
 IF (SELECT count(*) FROM software_discovery.products WHERE slug IN ('obsidian','things','omnifocus','2do') AND status='published')<>4 OR NOT EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='todoist-alternatives-with-a-one-time-purchase' AND status='published' AND editorially_approved) THEN RAISE EXCEPTION 'PR5.13 prior published state mismatch'; END IF;
 IF (SELECT count(*) FROM software_discovery.products WHERE slug IN ('affine','anytype','appflowy') AND status IN ('draft','published'))<>3 THEN RAISE EXCEPTION 'PR5.13 target lifecycle mismatch'; END IF;
 IF EXISTS(SELECT 1 FROM software_discovery.escape_route_products m JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id JOIN software_discovery.products p ON p.id=m.product_id WHERE p.slug IN ('affine','anytype','appflowy') AND r.slug<>'${routeSlug}' AND r.status='published' AND r.editorially_approved) THEN RAISE EXCEPTION 'PR5.13 other approved route exposure requires review'; END IF;
 FOR tbl IN SELECT value FROM jsonb_array_elements(payload->'tables') LOOP
  FOR item IN SELECT value FROM jsonb_array_elements(tbl->'rows') LOOP
   wanted=item;
   FOR prop IN SELECT key,value FROM jsonb_each(item) LOOP
    IF prop.value ? '$ref' THEN
     SELECT key,value INTO STRICT ref_where FROM jsonb_each(prop.value->'$ref'->'where');
     ref_id=NULL;
     EXECUTE format('SELECT id FROM software_discovery.%I WHERE %I=$1',prop.value->'$ref'->>'table',ref_where.key) INTO ref_id USING ref_where.value #>> '{}';
     IF ref_id IS NULL THEN RAISE EXCEPTION 'PR5.13 required reference missing'; END IF;
     wanted=jsonb_set(wanted,ARRAY[prop.key],to_jsonb(ref_id));
    END IF;
   END LOOP;
   IF tbl->>'table'='products' THEN wanted=wanted-'status'; END IF;
   EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I c WHERE NOT EXISTS(SELECT 1 FROM jsonb_object_keys($1) k WHERE to_jsonb(c)->k IS DISTINCT FROM to_jsonb(jsonb_populate_record(NULL::software_discovery.%I,$1))->k))',tbl->>'table',tbl->>'table') INTO matched USING wanted;
   IF NOT matched THEN RAISE EXCEPTION 'PR5.13 review mismatch: %',tbl->>'table'; END IF;
  END LOOP;
  IF left(tbl->>'table',8)='product_' THEN
   FOREACH product_slug IN ARRAY ARRAY['affine','anytype','appflowy'] LOOP
    SELECT id INTO STRICT target_id FROM software_discovery.products WHERE slug=product_slug;
    SELECT count(*) INTO expected_count FROM jsonb_array_elements(tbl->'rows') r WHERE r->'product_id'->'$ref'->'where'->>'slug'=product_slug;
    EXECUTE format('SELECT count(*) FROM software_discovery.%I WHERE product_id=$1',tbl->>'table') INTO actual_count USING target_id;
    IF actual_count<>expected_count THEN RAISE EXCEPTION 'PR5.13 relationship/evidence set changed: %/%',product_slug,tbl->>'table'; END IF;
   END LOOP;
  END IF;
 END LOOP;
 SELECT id INTO STRICT ref_id FROM software_discovery.anchors WHERE slug='notion';
 wanted=jsonb_set(payload->'route',ARRAY['anchor_id'],to_jsonb(ref_id));
 SELECT id INTO route_id FROM software_discovery.escape_routes WHERE slug='${routeSlug}';
 IF route_id IS NOT NULL THEN
  SELECT EXISTS(SELECT 1 FROM software_discovery.escape_routes c WHERE c.id=route_id AND ((status='draft' AND NOT editorially_approved) OR (status='published' AND editorially_approved)) AND NOT EXISTS(SELECT 1 FROM jsonb_object_keys(wanted) k WHERE to_jsonb(c)->k IS DISTINCT FROM to_jsonb(jsonb_populate_record(NULL::software_discovery.escape_routes,wanted))->k)) INTO matched;
  IF NOT matched THEN
   IF NOT EXISTS(SELECT 1 FROM software_discovery.escape_routes c WHERE c.id=route_id AND c.status='draft' AND NOT c.editorially_approved AND c.name=payload->'priorRoute'->>'name' AND c.description=payload->'priorRoute'->>'description' AND c.anchor_id=ref_id AND c.last_verified_at=(payload->'priorRoute'->>'last_verified_at')::timestamptz) THEN RAISE EXCEPTION 'PR5.13 route metadata/approval mismatch'; END IF;
   SELECT count(*) INTO actual_count FROM software_discovery.escape_route_products WHERE escape_route_id=route_id;
   IF actual_count<>jsonb_array_length(payload->'priorMembers') THEN RAISE EXCEPTION 'PR5.13 baseline membership drift'; END IF;
   FOR item IN SELECT value FROM jsonb_array_elements(payload->'priorMembers') LOOP
    SELECT id INTO STRICT target_id FROM software_discovery.products WHERE slug=item->'product_id'->'$ref'->'where'->>'slug';
    IF NOT EXISTS(SELECT 1 FROM software_discovery.escape_route_products m WHERE escape_route_id=route_id AND product_id=target_id AND position IS NOT DISTINCT FROM (item->>'position')::integer AND novelty_score IS NOT DISTINCT FROM (item->>'novelty_score')::numeric AND relevance_score IS NOT DISTINCT FROM (item->>'relevance_score')::numeric AND constraint_fit_score IS NOT DISTINCT FROM (item->>'constraint_fit_score')::numeric AND quality_score IS NOT DISTINCT FROM (item->>'quality_score')::numeric AND editorial_note IS NOT DISTINCT FROM item->>'editorial_note') THEN RAISE EXCEPTION 'PR5.13 baseline member drift'; END IF;
   END LOOP;
   DELETE FROM software_discovery.escape_route_products WHERE escape_route_id=route_id;
   UPDATE software_discovery.escape_routes SET description=wanted->>'description',last_verified_at=(wanted->>'last_verified_at')::timestamptz,updated_at=now() WHERE id=route_id;
  END IF;
  SELECT count(*) INTO actual_count FROM software_discovery.escape_route_products WHERE escape_route_id=route_id;
  IF actual_count NOT IN (0,3) THEN RAISE EXCEPTION 'PR5.13 route membership drift'; END IF;
  IF actual_count=3 THEN
   FOR item IN SELECT value FROM jsonb_array_elements(payload->'members') LOOP
    SELECT id INTO STRICT target_id FROM software_discovery.products WHERE slug=item->>'productSlug';
    IF NOT EXISTS(SELECT 1 FROM software_discovery.escape_route_products m WHERE escape_route_id=route_id AND product_id=target_id AND position=(item->>'position')::integer AND novelty_score=0 AND relevance_score IS NULL AND constraint_fit_score IS NULL AND quality_score IS NULL AND editorial_note=item->>'editorialNote') THEN RAISE EXCEPTION 'PR5.13 member data mismatch'; END IF;
   END LOOP;
  END IF;
 ELSE
  IF payload->'priorRoute' IS NOT NULL THEN RAISE EXCEPTION 'PR5.13 baseline route missing'; END IF;
  INSERT INTO software_discovery.escape_routes(slug,name,description,anchor_id,last_verified_at) SELECT slug,name,description,anchor_id,last_verified_at FROM jsonb_populate_record(NULL::software_discovery.escape_routes,wanted) RETURNING id INTO route_id;
 END IF;
 UPDATE software_discovery.products SET status='published',updated_at=now() WHERE slug IN ('affine','anytype','appflowy') AND status='draft';
 FOR item IN SELECT value FROM jsonb_array_elements(payload->'members') LOOP
  SELECT id INTO STRICT target_id FROM software_discovery.products WHERE slug=item->>'productSlug';
  INSERT INTO software_discovery.escape_route_products(escape_route_id,product_id,position,novelty_score,editorial_note) VALUES(route_id,target_id,(item->>'position')::integer,0,item->>'editorialNote') ON CONFLICT(escape_route_id,product_id) DO NOTHING;
 END LOOP;
 UPDATE software_discovery.escape_routes SET status='published',editorially_approved=true,updated_at=now() WHERE id=route_id AND status='draft' AND NOT editorially_approved;
 FOREACH product_slug IN ARRAY ARRAY['affine','anytype','appflowy'] LOOP
  page=software_discovery.product_discovery_page(product_slug);
  IF page IS NULL OR page->>'status'<>'published' OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements(page->'anchors') a WHERE a->>'slug'='notion' AND a->>'scope'='personal-offline-note-object-organization' AND a->>'verificationStatus'='verified') THEN RAISE EXCEPTION 'PR5.13 public projection failed'; END IF;
 END LOOP;
 ${commit?'-- Approved apply persists atomically.':"RAISE SQLSTATE 'ZP513' USING MESSAGE='Rehearsal only';"}
EXCEPTION WHEN SQLSTATE 'ZP513' THEN RAISE NOTICE 'PR5.13 rehearsal rolled back; no publication persisted';
END $pr513$;
`;
 return {sql,bundle,report:{version:1,publicationDecision:'pending',candidateSlugs:candidates.map(c=>c.product.slug),qualifiedCandidates:3,routeSlug,noveltyScore:0,bundleSha256:hash(bundle),sqlSha256:createHash('sha256').update(sql).digest('hex'),mode:commit?'apply-after-approval':'rollback-rehearsal'}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('No arguments supported');const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));const {baseline,bundle}=offlineWorkflowBaseline();const reviewed=buildOfflineWorkflow(bundle,read('seed/research/offline-workflow-review-2026-10-08.json')).bundle;const args=[baseline,reviewed,read('seed/research/offline-draft-import-2026-10-12.json'),read('seed/research/offline-publication-review-2026-10-12.json')];const out='.seed-output/offline-publication';fs.mkdirSync(out,{recursive:true});for(const commit of [false,true]){const r=buildOfflinePublication(...args,{commit});fs.writeFileSync(out+'/'+(commit?'PR5.13_APPLY_AFTER_APPROVAL':'PR5.13_REHEARSE')+'.sql',r.sql);fs.writeFileSync(out+'/'+(commit?'apply':'rehearse')+'-report.json',JSON.stringify(r.report,null,2)+'\n');if(!commit)fs.writeFileSync(out+'/reviewed-products.json',JSON.stringify(r.bundle,null,2)+'\n');}console.log('PR5.13: three qualified candidates, one offline route; owner publication approval pending. No remote writes.');}catch(e){console.error(e.message);process.exitCode=1;}
}
