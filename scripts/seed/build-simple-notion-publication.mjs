import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {simpleNotionImportInputs,buildSimpleNotionImport,createSimpleNotionVerification} from './build-simple-notion-import.mjs';
import {fullPublicationSelection} from './build-raster-publication.mjs';
import {createDatabasePlan} from './database-plan.mjs';
import {escapeDefinitions,rankCandidates} from '../../lib/discovery/escape-model.ts';
const slugs=['joplin','obsidian','simplenote'],routeSlug='simple-notion-alternatives';
const REVIEW_SHA256='8caca7cd54cfb12863e07d0fe7d36912744bdd2aefab66c259bd2ea2f375fa78';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,''));
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function simpleNotionPublicationInputs(){return {...simpleNotionImportInputs(),publicationReview:read('seed/research/simple-notion-publication-review-2026-10-13.json')};}
export function buildSimpleNotionPublication(baseline,reviewed,workflowReview,review,{commit=false}={}){
 const imported=buildSimpleNotionImport(baseline,reviewed,workflowReview,{commit:true});
 if(hash(review)!==REVIEW_SHA256||review.publicationDecision!=='pending'||review.scope!=='personal-basic-note-capture-edit-organization')throw Error('PR5.25 publication manifest drift');
 const bundle=fullPublicationSelection(reviewed,slugs);for(const p of bundle.products)p.status='published';
 if(hash(bundle)!==review.bundleSha256||review.route.slug!==routeSlug||review.route.name!==escapeDefinitions[2].name||review.route.status!=='draft'||review.route.editoriallyApproved!==false||review.route.products.length!==3||review.route.products.some((m,i)=>m.productSlug!==slugs[i]||m.position!==i+1||m.noveltyScore!==0||m.editorialNote!==workflowReview.candidates[i].scopeDescription))throw Error('PR5.25 route/selection drift');
 const pages=bundle.products.map(p=>({...p,...Object.fromEntries(['attributes','anchors','audiences'].map(k=>[k,p[k].map(c=>({...c,description:c.scopeDescription,sources:c.evidence.map(key=>bundle.sources.find(s=>s.key===key))}))]))}));
 const candidates=rankCandidates(escapeDefinitions[2],pages.map(product=>({product,noveltyScore:0})));if(candidates.length!==3||candidates.some(c=>!c.eligible))throw Error('PR5.25 requires three qualified published products');
 // Reuse complete PR5.24 after-guard rows, including all historical evidence pointers.
 const importData=JSON.parse(imported.sql.match(/data jsonb=\$payload\$([\s\S]*?)\$payload\$::jsonb/)[1]);
 const plan={tables:[]};for(const g of importData.guardRows){let op=plan.tables.find(t=>t.table===g.table);if(!op){op={table:g.table,rows:[]};plan.tables.push(op);}op.rows.push(g.after);}
 const route={slug:routeSlug,name:review.route.name,description:review.route.description,anchor_id:{$ref:{table:'anchors',where:{slug:'notion'}}},last_verified_at:review.route.lastVerifiedAt};
 const priorPlan=createDatabasePlan(baseline);
 const priorRoute=priorPlan.tables.find(t=>t.table==='escape_routes').rows.find(r=>r.slug===routeSlug);
 const priorMembers=priorPlan.tables.find(t=>t.table==='escape_route_products').rows.filter(r=>r.escape_route_id.$ref.where.slug===routeSlug);
 const payload=JSON.stringify({tables:plan.tables,route,priorRoute,priorMembers,members:review.route.products});
 if(payload.includes('$pr525_data$')||payload.includes('$pr525$'))throw Error('PR5.25 delimiter collision');
 const sql=`-- PR5.25 ${commit?'APPLY ONLY AFTER EXPLICIT OWNER PUBLICATION APPROVAL':'REHEARSAL: all publication changes roll back'}.
-- Publish Joplin, Simplenote and one basic-note route. Existing Obsidian metadata is untouched.
DO $pr525$
DECLARE
 payload jsonb=$pr525_data$${payload}$pr525_data$::jsonb;
 tbl jsonb; item jsonb; wanted jsonb; prop record; ref_where record;
 ref_id uuid; matched boolean; actual_count integer; expected_count integer;
 target_id uuid; route_id uuid; product_slug text; page jsonb;
BEGIN
 SET LOCAL lock_timeout='10s';
 PERFORM pg_advisory_xact_lock(7232003);
 LOCK TABLE ${[...new Set([...plan.tables.map(t=>'software_discovery.'+t.table),'software_discovery.escape_routes','software_discovery.escape_route_products'])].join(', ')} IN SHARE ROW EXCLUSIVE MODE;
 IF (SELECT count(*) FROM software_discovery.products WHERE slug IN ('obsidian','things','omnifocus','2do','affine','anytype','appflowy','gimp','krita','paint-net') AND status='published')<>10 OR (SELECT count(*) FROM software_discovery.escape_routes WHERE slug IN ('todoist-alternatives-with-a-one-time-purchase','offline-notion-alternatives','photoshop-alternatives-without-a-subscription','notion-alternatives-without-ai') AND status='published' AND editorially_approved)<>4 THEN RAISE EXCEPTION 'PR5.25 accepted state mismatch'; END IF;
 IF EXISTS(SELECT 1 FROM software_discovery.escape_route_products m JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id JOIN software_discovery.products p ON p.id=m.product_id WHERE p.slug IN ('joplin','obsidian','simplenote') AND r.slug<>'simple-notion-alternatives' AND r.status='published' AND r.editorially_approved) THEN RAISE EXCEPTION 'PR5.25 other approved route exposure requires review'; END IF;
 IF EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='simple-notion-alternatives' AND status='published' AND editorially_approved) THEN
  IF (SELECT count(*) FROM software_discovery.products WHERE status='published')<>12 OR (SELECT count(*) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved)<>5 OR (SELECT count(*) FROM software_discovery.products WHERE slug IN ('joplin','simplenote') AND status='published')<>2 THEN RAISE EXCEPTION 'PR5.25 repeat publication state mismatch'; END IF;
 ELSE
  IF (SELECT count(*) FROM software_discovery.products WHERE status='published')<>10 OR (SELECT count(*) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved)<>4 OR (SELECT count(*) FROM software_discovery.products WHERE slug IN ('joplin','simplenote') AND status='draft')<>2 THEN RAISE EXCEPTION 'PR5.25 prior lifecycle mismatch'; END IF;
 END IF;
 FOR tbl IN SELECT value FROM jsonb_array_elements(payload->'tables') LOOP
  FOR item IN SELECT value FROM jsonb_array_elements(tbl->'rows') LOOP
   wanted=item;
   IF tbl->>'table'='products' AND item->>'slug' IN ('joplin','simplenote') AND EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='simple-notion-alternatives' AND status='published' AND editorially_approved) THEN wanted=jsonb_set(wanted,ARRAY['status'],'"published"'::jsonb); END IF;
   FOR prop IN SELECT key,value FROM jsonb_each(item) LOOP
    IF prop.value ? '$ref' THEN
     SELECT key,value INTO STRICT ref_where FROM jsonb_each(prop.value->'$ref'->'where');
     ref_id=NULL;
     EXECUTE format('SELECT id FROM software_discovery.%I WHERE %I=$1',prop.value->'$ref'->>'table',ref_where.key) INTO ref_id USING ref_where.value #>> '{}';
     IF ref_id IS NULL THEN RAISE EXCEPTION 'PR5.25 required reference missing'; END IF;
     wanted=jsonb_set(wanted,ARRAY[prop.key],to_jsonb(ref_id));
    END IF;
   END LOOP;
   EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I c WHERE NOT EXISTS(SELECT 1 FROM jsonb_object_keys($1) k WHERE to_jsonb(c)->k IS DISTINCT FROM to_jsonb(jsonb_populate_record(NULL::software_discovery.%I,$1))->k))',tbl->>'table',tbl->>'table') INTO matched USING wanted;
   IF NOT matched THEN RAISE EXCEPTION 'PR5.25 review mismatch: %',tbl->>'table'; END IF;
  END LOOP;
  IF left(tbl->>'table',8)='product_' THEN
   FOREACH product_slug IN ARRAY ARRAY['joplin','obsidian','simplenote'] LOOP
    SELECT id INTO STRICT target_id FROM software_discovery.products WHERE slug=product_slug;
    SELECT count(*) INTO expected_count FROM jsonb_array_elements(tbl->'rows') r WHERE r->'product_id'->'$ref'->'where'->>'slug'=product_slug;
    EXECUTE format('SELECT count(*) FROM software_discovery.%I WHERE product_id=$1',tbl->>'table') INTO actual_count USING target_id;
    IF actual_count<>expected_count THEN RAISE EXCEPTION 'PR5.25 relationship/evidence set changed: %/%',product_slug,tbl->>'table'; END IF;
   END LOOP;
  END IF;
 END LOOP;
 SELECT id INTO STRICT ref_id FROM software_discovery.anchors WHERE slug='notion';
 wanted=jsonb_set(payload->'route',ARRAY['anchor_id'],to_jsonb(ref_id));
 SELECT id INTO route_id FROM software_discovery.escape_routes WHERE slug='${routeSlug}';
 IF route_id IS NOT NULL THEN
  SELECT EXISTS(SELECT 1 FROM software_discovery.escape_routes c WHERE c.id=route_id AND ((status='draft' AND NOT editorially_approved) OR (status='published' AND editorially_approved)) AND NOT EXISTS(SELECT 1 FROM jsonb_object_keys(wanted) k WHERE to_jsonb(c)->k IS DISTINCT FROM to_jsonb(jsonb_populate_record(NULL::software_discovery.escape_routes,wanted))->k)) INTO matched;
  IF NOT matched THEN
   IF NOT EXISTS(SELECT 1 FROM software_discovery.escape_routes c WHERE c.id=route_id AND c.status='draft' AND NOT c.editorially_approved AND c.name=payload->'priorRoute'->>'name' AND c.description=payload->'priorRoute'->>'description' AND c.anchor_id=ref_id AND c.last_verified_at IS NOT DISTINCT FROM (payload->'priorRoute'->>'last_verified_at')::timestamptz) THEN RAISE EXCEPTION 'PR5.25 route metadata/approval mismatch'; END IF;
   SELECT count(*) INTO actual_count FROM software_discovery.escape_route_products WHERE escape_route_id=route_id;
   IF actual_count<>jsonb_array_length(payload->'priorMembers') THEN RAISE EXCEPTION 'PR5.25 baseline membership drift'; END IF;
   FOR item IN SELECT value FROM jsonb_array_elements(payload->'priorMembers') LOOP
    SELECT id INTO STRICT target_id FROM software_discovery.products WHERE slug=item->'product_id'->'$ref'->'where'->>'slug';
    IF NOT EXISTS(SELECT 1 FROM software_discovery.escape_route_products m WHERE escape_route_id=route_id AND product_id=target_id AND position IS NOT DISTINCT FROM (item->>'position')::integer AND novelty_score IS NOT DISTINCT FROM (item->>'novelty_score')::numeric AND relevance_score IS NOT DISTINCT FROM (item->>'relevance_score')::numeric AND constraint_fit_score IS NOT DISTINCT FROM (item->>'constraint_fit_score')::numeric AND quality_score IS NOT DISTINCT FROM (item->>'quality_score')::numeric AND editorial_note IS NOT DISTINCT FROM item->>'editorial_note') THEN RAISE EXCEPTION 'PR5.25 baseline member drift'; END IF;
   END LOOP;
   DELETE FROM software_discovery.escape_route_products WHERE escape_route_id=route_id;
   UPDATE software_discovery.escape_routes SET description=wanted->>'description',last_verified_at=(wanted->>'last_verified_at')::timestamptz,updated_at=now() WHERE id=route_id;
  END IF;
  SELECT count(*) INTO actual_count FROM software_discovery.escape_route_products WHERE escape_route_id=route_id;
  IF matched AND actual_count<>3 THEN RAISE EXCEPTION 'PR5.25 reviewed membership missing'; END IF;
  IF actual_count NOT IN (0,3) THEN RAISE EXCEPTION 'PR5.25 route membership drift'; END IF;
  IF actual_count=3 THEN
   FOR item IN SELECT value FROM jsonb_array_elements(payload->'members') LOOP
    SELECT id INTO STRICT target_id FROM software_discovery.products WHERE slug=item->>'productSlug';
    IF NOT EXISTS(SELECT 1 FROM software_discovery.escape_route_products m WHERE escape_route_id=route_id AND product_id=target_id AND position=(item->>'position')::integer AND novelty_score=0 AND relevance_score IS NULL AND constraint_fit_score IS NULL AND quality_score IS NULL AND editorial_note=item->>'editorialNote') THEN RAISE EXCEPTION 'PR5.25 member data mismatch'; END IF;
   END LOOP;
  END IF;
 ELSE
  IF payload->'priorRoute' IS NOT NULL THEN RAISE EXCEPTION 'PR5.25 baseline route missing'; END IF;
  INSERT INTO software_discovery.escape_routes(slug,name,description,anchor_id,last_verified_at) SELECT slug,name,description,anchor_id,last_verified_at FROM jsonb_populate_record(NULL::software_discovery.escape_routes,wanted) RETURNING id INTO route_id;
 END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(payload->'members') LOOP
  SELECT id INTO STRICT target_id FROM software_discovery.products WHERE slug=item->>'productSlug';
  INSERT INTO software_discovery.escape_route_products(escape_route_id,product_id,position,novelty_score,editorial_note) VALUES(route_id,target_id,(item->>'position')::integer,0,item->>'editorialNote') ON CONFLICT(escape_route_id,product_id) DO NOTHING;
 END LOOP;
 UPDATE software_discovery.products SET status='published',updated_at=now() WHERE slug IN ('joplin','simplenote') AND status='draft';
 UPDATE software_discovery.escape_routes SET status='published',editorially_approved=true,updated_at=now() WHERE id=route_id AND status='draft' AND NOT editorially_approved;
 FOREACH product_slug IN ARRAY ARRAY['joplin','obsidian','simplenote'] LOOP
  page=software_discovery.product_discovery_page(product_slug);
  IF page IS NULL OR page->>'status'<>'published' OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements(page->'anchors') a WHERE a->>'slug'='notion' AND a->>'scope'='personal-basic-note-capture-edit-organization' AND a->>'verificationStatus'='verified') OR (SELECT count(*) FROM jsonb_array_elements(page->'attributes') a WHERE a->>'slug' IN ('focused-note-taking','no-database-required','minimal-setup') AND a->>'value'='true' AND a->>'verificationStatus'='verified')<>3 THEN RAISE EXCEPTION 'PR5.25 public projection failed'; END IF;
 END LOOP;
 ${commit?'-- Approved apply persists atomically.':"RAISE SQLSTATE 'ZP525' USING MESSAGE='Rehearsal only';"}
EXCEPTION WHEN SQLSTATE 'ZP525' THEN RAISE NOTICE 'PR5.25 rehearsal rolled back; no publication persisted';
END $pr525$;
`;
 return {sql,bundle,report:{version:1,publicationDecision:'pending',candidateSlugs:slugs,qualifiedPublishedCandidates:3,routeSlug,noveltyScore:0,productWrites:2,bundleSha256:hash(bundle),sqlSha256:createHash('sha256').update(sql).digest('hex'),mode:commit?'apply-after-approval':'rollback-rehearsal'}};
}
export function createSimpleNotionPublicationVerification(bundle,review){
 const selected=structuredClone(bundle);
 for(const p of selected.products){p.attributes=p.attributes.filter(c=>['focused-note-taking','no-database-required','minimal-setup','pricing-model','trade-off-summary',...(p.slug==='simplenote'?['free-core-use','no-account-required']:[])].includes(c.slug));p.anchors=p.anchors.filter(c=>c.slug==='notion'&&c.relationshipType==='alternative');}
 let sql=createSimpleNotionVerification(selected).replace('PR5.24 read-only after APPLY','PR5.25 read-only after approved APPLY');
 sql=sql.replace("status=CASE WHEN slug='obsidian' THEN 'published' ELSE 'draft' END","status='published'");
 sql=sql.replace("'ten_products_four_routes_preserved'","'twelve_products_five_routes_published'").replace("count(*)=10 FROM software_discovery.products","count(*)=12 FROM software_discovery.products").replace("count(*)=4 FROM software_discovery.escape_routes","count(*)=5 FROM software_discovery.escape_routes");
 sql=sql.replace("'draft_products_hidden_from_public_rpc',software_discovery.product_discovery_page('joplin') IS NULL AND software_discovery.product_discovery_page('simplenote') IS NULL", "'three_products_public_rpc',(SELECT bool_and(software_discovery.product_discovery_page(slug)->>'status'='published') FROM (VALUES ('joplin'),('obsidian'),('simplenote')) p(slug))");
 const memberChecks=review.route.products.map(m=>`EXISTS(SELECT 1 FROM software_discovery.escape_route_products m JOIN software_discovery.products p ON p.id=m.product_id JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id WHERE r.slug='simple-notion-alternatives' AND p.slug='${m.productSlug}' AND m.position=${m.position} AND m.novelty_score=0 AND m.relevance_score IS NULL AND m.constraint_fit_score IS NULL AND m.quality_score IS NULL AND m.editorial_note=${"'"+m.editorialNote.replaceAll("'","''")+"'"})`).join(' AND ');
 sql=sql.replace("'simple_route_remains_unapproved',EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='simple-notion-alternatives' AND status='draft' AND NOT editorially_approved)",`'approved_route_exact_three_members',EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='simple-notion-alternatives' AND status='published' AND editorially_approved AND description='${review.route.description.replaceAll("'","''")}' AND last_verified_at='2026-10-13T00:00:00Z') AND (SELECT count(*)=3 FROM software_discovery.escape_route_products m JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id WHERE r.slug='simple-notion-alternatives') AND ${memberChecks}`);
 return sql;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('No arguments supported');const {baseline,reviewed,review,publicationReview}=simpleNotionPublicationInputs(),out=path.join(root,'.seed-output/simple-notion-publication');fs.mkdirSync(out,{recursive:true});
 for(const commit of [false,true]){const r=buildSimpleNotionPublication(baseline,reviewed,review,publicationReview,{commit});fs.writeFileSync(path.join(out,commit?'PR5.25_APPLY_AFTER_APPROVAL.sql':'PR5.25_REHEARSE.sql'),r.sql);fs.writeFileSync(path.join(out,commit?'apply-report.json':'rehearse-report.json'),JSON.stringify(r.report,null,2)+'\n');}
 fs.writeFileSync(path.join(out,'PR5.25_VERIFY.sql'),createSimpleNotionPublicationVerification(buildSimpleNotionPublication(baseline,reviewed,review,publicationReview).bundle,publicationReview));
 console.log('PR5.25: two draft products and one basic-note route prepared for publication; Obsidian retained. Owner publication approval pending; no remote writes.');
 }catch(e){console.error(e.message);process.exitCode=1;}
}
