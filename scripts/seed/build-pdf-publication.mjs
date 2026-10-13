import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {pdfImportInputs,buildPdfImport,createPdfImportVerification} from './build-pdf-import.mjs';
import {escapeDefinitions,rankCandidates} from '../../lib/discovery/escape-model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const pinned='076f5d014ceabe194ac1d8e7bce502cbc73159e49e6aa0792fcce330f4cbd211';
const routeSlug='pdf-editors-without-a-subscription';
const slugs=['pdf-xchange-editor','pdf24-creator','pdfgear'];
export function pdfPublicationInputs(){return {importInput:pdfImportInputs(),snapshot:JSON.parse(fs.readFileSync(path.join(root,'seed/research/pdf-publication-baseline-2026-10-13.json'),'utf8'))};}
export function buildPdfPublication(input,{commit=false}={}){
 const s=input.snapshot;
 if(hash(s)!==pinned||s.packet!=='PR5.32'||s.read_only!==true||s.products.length!==3||s.products.some(p=>p.status!=='draft'||!slugs.includes(p.slug))||s.route.length!==1||s.route[0].slug!==routeSlug||s.route[0].status!=='draft'||s.route[0].editorially_approved||s.route_members.length!==3||s.target_route_memberships.length!==3||s.target_route_memberships.some(m=>m.route_slug!==routeSlug)||s.published_products.length!==12||s.approved_published_routes.length!==5||!s.anon_private_evidence_boundary)throw Error('PDF publication checkpoint drift');
 const imported=buildPdfImport(input.importInput),bundle=structuredClone(imported.bundle);
 for(const p of bundle.products)p.status='published';
 const pages=bundle.products.map(p=>({...p,...Object.fromEntries(['attributes','anchors','audiences'].map(k=>[k,p[k].map(c=>({...c,description:c.scopeDescription,sources:c.evidence.map(key=>bundle.sources.find(src=>src.key===key))}))]))}));
 const ranked=rankCandidates(escapeDefinitions[7],pages.map(product=>({product,noveltyScore:0})));
 if(ranked.length!==3||ranked.some(c=>!c.eligible))throw Error('Three qualified PDF publication candidates required');
 const ids=s.products.map(p=>`'${p.id}'::uuid`).join(',');
 const guards=['products','product_attributes','product_anchors','product_problems','product_audiences','product_attribute_evidence','product_anchor_evidence','product_problem_evidence','product_audience_evidence','claim_evidence','evidence_sources'].map(table=>({table,rows:s[table],where:table==='products'?`id IN (${ids})`:['claim_evidence','evidence_sources'].includes(table)?`id IN (${s[table].map(r=>`'${r.id}'::uuid`).join(',')})`:`product_id IN (${ids})`}));
 guards.push({table:'escape_routes',rows:s.route,where:`id='${s.route[0].id}'::uuid`},{table:'escape_route_products',rows:s.route_members,where:`escape_route_id='${s.route[0].id}'::uuid OR product_id IN (${ids})`},...['attributes','anchors'].map(table=>({table,rows:s['taxonomy_'+table],where:`id IN (${s['taxonomy_'+table].map(r=>`'${r.id}'::uuid`).join(',')})`})));
 const description=s.route[0].description.replace(' Draft review; publication is not approved.','');
 if(description===s.route[0].description)throw Error('Expected draft copy marker missing');
 const payload=JSON.stringify({guards,published:s.published_products,routes:s.approved_published_routes,description});
 const sql=`-- PR5.33 ${commit?'APPLY ONLY AFTER EXPLICIT OWNER PUBLICATION APPROVAL':'REHEARSAL: publication changes roll back'}.
-- Only three product statuses and PDF route status/approval/description change.
DO $pdf_publish$
DECLARE data jsonb=$pdf_data$${payload}$pdf_data$::jsonb; op jsonb; expected jsonb; actual jsonb;
BEGIN
 SET LOCAL lock_timeout='10s';
 PERFORM pg_advisory_xact_lock(7232003);
 LOCK TABLE ${guards.map(g=>'software_discovery.'+g.table).join(', ')} IN SHARE ROW EXCLUSIVE MODE;
 IF coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.products WHERE status='published'),'[]'::jsonb)<>data->'published' OR coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved),'[]'::jsonb)<>data->'routes' THEN RAISE EXCEPTION 'PR5.33 publication state drift or repeated apply; fresh preflight required'; END IF;
 IF NOT has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') OR has_table_privilege('anon','software_discovery.claim_evidence','SELECT') THEN RAISE EXCEPTION 'PR5.33 anonymous evidence boundary drift'; END IF;
 FOR op IN SELECT value FROM jsonb_array_elements(data->'guards') LOOP
  EXECUTE format('SELECT coalesce(jsonb_agg(j ORDER BY j::text),''[]''::jsonb) FROM (SELECT to_jsonb(jsonb_populate_record(NULL::software_discovery.%I,r))-''created_at''-''updated_at'' j FROM jsonb_array_elements($1) r) x',op->>'table') INTO expected USING op->'rows';
  EXECUTE format('SELECT coalesce(jsonb_agg(j ORDER BY j::text),''[]''::jsonb) FROM (SELECT to_jsonb(t)-''created_at''-''updated_at'' j FROM software_discovery.%I t WHERE %s) x',op->>'table',op->>'where') INTO actual;
  IF expected<>actual THEN RAISE EXCEPTION 'PR5.33 stored checkpoint drift: %',op->>'table'; END IF;
 END LOOP;
 UPDATE software_discovery.products SET status='published' WHERE id IN (${ids});
 UPDATE software_discovery.escape_routes SET status='published',editorially_approved=true,description=data->>'description' WHERE id='${s.route[0].id}'::uuid;
 IF (SELECT count(*) FROM software_discovery.products WHERE status='published')<>15 OR (SELECT count(*) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved)<>6 THEN RAISE EXCEPTION 'PR5.33 post-publication count mismatch'; END IF;
 IF EXISTS(SELECT 1 FROM software_discovery.products WHERE id IN (${ids}) AND software_discovery.product_discovery_page(slug) IS NULL) THEN RAISE EXCEPTION 'PR5.33 public product projection missing'; END IF;
 ${commit?'-- Owner-approved apply persists.':"RAISE SQLSTATE 'ZSR01' USING MESSAGE='PDF publication rehearsal only';"}
EXCEPTION WHEN SQLSTATE 'ZSR01' THEN
 RAISE NOTICE 'PDF publication rehearsal rolled back; no changes persisted';
END $pdf_publish$;
`;
 return {sql,bundle,description,report:{packet:'PR5.33',publicationDecision:'pending-owner-approval',baselineSha256:pinned,mode:commit?'apply-after-owner-approval':'rehearsal-rollback',products:slugs,route:routeSlug,before:{products:12,routes:5},after:{products:15,routes:6},qualified:ranked.length}};
}
export function createPdfPublicationVerification(input){
 let sql=createPdfImportVerification(buildPdfImport(input.importInput)).replaceAll('PR5.31','PR5.33').replace("bool_and(status='draft')","bool_and(status='published')");
 sql=sql.replaceAll('pdf_route_remains_unapproved','pdf_route_published_and_approved').replace("status='draft' AND NOT editorially_approved","status='published' AND editorially_approved");
 sql=sql.replaceAll('twelve_products_five_routes_preserved','fifteen_products_six_routes').replace('count(*)=12 FROM','count(*)=15 FROM').replace('count(*)=5 FROM','count(*)=6 FROM');
 sql=sql.replaceAll('draft_products_hidden_from_public_rpc','three_products_visible_in_public_rpc').replaceAll(' IS NULL AND',' IS NOT NULL AND').replace("product_discovery_page('pdfgear') IS NULL","product_discovery_page('pdfgear') IS NOT NULL");
 const projection="UNION ALL SELECT 'public_pdf_scope_and_sources',(SELECT count(*)=3 AND bool_and(EXISTS(SELECT 1 FROM jsonb_array_elements(software_discovery.product_discovery_page(p.slug)->'anchors') a WHERE a->>'slug'='adobe-pdf' AND a->>'scope'='windows-personal-pdf-page-organization' AND a->>'verificationStatus'='verified' AND length(a->>'description')>0 AND jsonb_array_length(a->'sources')>0)) FROM software_discovery.products p WHERE slug IN ('pdf-xchange-editor','pdf24-creator','pdfgear'))";
 return sql.trimEnd().replace(/;$/, '\n'+projection+';').replace('exactly ten true checks','exactly eleven true checks')+'\n';
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{if(process.argv.length!==2)throw Error('No arguments supported');const i=pdfPublicationInputs();for(const commit of [false,true]){const r=buildPdfPublication(i,{commit});fs.writeFileSync(path.join(root,`supabase/data/PR5.33_${commit?'APPLY_AFTER_APPROVAL':'REHEARSE'}.sql`),r.sql);}fs.writeFileSync(path.join(root,'supabase/verification/PR5.33_VERIFY.sql'),createPdfPublicationVerification(i));console.log('PR5.33 proposal generated; owner approval pending. No remote execution.');}catch(e){console.error(e.message);process.exitCode=1;}}
