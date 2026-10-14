import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {productivityInputs,buildProductivityWorkflow} from './build-productivity-workflow.mjs';
import {escapeDefinitions,rankCandidates,publishable} from '../../lib/discovery/escape-model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex'),pinned='b341b2e267e0482f41f78375efab03bcbd5b1eee6b2ca6f602654da6cbe6d413';
const slugs=['things','omnifocus','2do'],routeSlug='productivity-apps-you-can-buy-once',quote=x=>"'"+x.replaceAll("'","''")+"'",list=xs=>xs.map(quote).join(',')||'NULL';
export function productivityPublicationInputs(){return {...productivityInputs(),snapshot:JSON.parse(fs.readFileSync(path.join(root,'seed/research/productivity-publication-baseline-2026-10-14.json'),'utf8'))};}
export function buildProductivityPublication(input,{commit=false}={}){
 const {baseline,review,snapshot:s}=input;
 if(hash(s)!==pinned||s.packet!=='PR5.39'||s.read_only!==true||s.route.length!==1||s.route[0].slug!==routeSlug||s.route[0].status!=='draft'||s.route[0].editorially_approved||s.products.length!==3||s.products.some(p=>p.status!=='published'||!slugs.includes(p.slug))||s.route_members.length!==3||new Set(s.route_members.map(m=>m.product_slug)).size!==3||s.route_members.some(m=>!slugs.includes(m.product_slug))||s.published_products.length!==15||s.approved_published_routes.length!==6||s.anon_private_evidence_boundary!==true)throw Error('PR5.40 publication baseline drift');
 const r=buildProductivityWorkflow(baseline,review);
 for(const p of r.bundle.products.filter(p=>slugs.includes(p.slug))){const id=s.products.find(x=>x.slug===p.slug).id;
 for(const slug of ['personal-task-workflow-scope','one-time-purchase','pricing-model','trade-off-summary']){const expected=p.attributes.find(c=>c.slug===slug),tid=s.taxonomy_attributes.find(a=>a.slug===slug)?.id,stored=s.product_attributes.find(a=>a.product_id===id&&a.attribute_id===tid);if(!stored||stored.verification_status!=='verified'||stored.confidence!==expected.confidence||Date.parse(stored.last_verified_at)!==Date.parse(expected.lastVerifiedAt)||(stored.value_text??stored.value_boolean)!==expected.value)throw Error('PR5.40 reviewed claim mismatch');for(const key of expected.evidence.filter(k=>k.startsWith('productivity-'))){const src=s.evidence_sources.find(x=>x.seed_key===key);if(!src||!s.product_attribute_evidence.some(l=>l.product_id===id&&l.attribute_id===tid&&s.claim_evidence.some(e=>e.id===l.claim_evidence_id&&e.evidence_source_id===src.id)))throw Error('PR5.40 reviewed provenance missing');}}
 }
 const pages=r.pages.filter(p=>slugs.includes(p.slug)).map(p=>({...p,status:'published'})),candidates=rankCandidates(escapeDefinitions[9],pages.map(product=>({product,noveltyScore:0})));
 if(!publishable({published:true,candidates})||candidates.length!==3)throw Error('PR5.40 three qualified published products required');
 const description=review.description.replace(' Draft review; publication is not approved.','');if(s.route[0].description!==review.description)throw Error('PR5.40 description mismatch');
 const ids=list(s.products.map(p=>p.id)),guards=[];
 for(const table of ['products','product_attributes','product_anchors','product_problems','product_audiences','product_attribute_evidence','product_anchor_evidence','product_problem_evidence','product_audience_evidence'])guards.push({table,rows:s[table],where:table==='products'?`slug IN (${list(slugs)})`:`product_id IN (${ids})`});
 for(const table of ['claim_evidence','evidence_sources'])guards.push({table,rows:s[table],where:`id IN (${list(s[table].map(r=>r.id))})${table==='evidence_sources'?" OR seed_key LIKE 'productivity-%'":''}`});
 for(const table of ['attributes','anchors','problems','audiences'])guards.push({table,rows:s['taxonomy_'+table],where:`id IN (${list(s['taxonomy_'+table].map(r=>r.id))})`});
 guards.push({table:'escape_routes',rows:s.route,where:`slug=${quote(routeSlug)}`},{table:'escape_route_products',rows:s.target_route_memberships.map(m=>Object.fromEntries(Object.entries(m).filter(([k])=>!['route_slug','route_status','editorially_approved'].includes(k)))),where:`product_id IN (${ids}) OR escape_route_id=${quote(s.route[0].id)}`});
 const data={guards,snapshot:s,description},payload=JSON.stringify(data);
 const sql=`-- PR5.40: route-only publication proposal. ${commit?'Run only after explicit owner approval.':'Rehearsal rolls back all changes.'}
DO $task_publish$
DECLARE data jsonb=$payload$${payload}$payload$::jsonb; op jsonb; expected jsonb; actual jsonb;
BEGIN
 PERFORM set_config('lock_timeout','10s',true);
 PERFORM set_config('TimeZone','UTC',true);
 PERFORM pg_advisory_xact_lock(7232003);
 LOCK TABLE ${[...new Set(guards.map(g=>g.table))].map(t=>'software_discovery.'+t).join(',')} IN SHARE ROW EXCLUSIVE MODE;
 IF NOT EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE id=${quote(s.route[0].id)} AND status='draft' AND NOT editorially_approved) THEN RAISE EXCEPTION 'PR5.40 route drift or repeated apply'; END IF;
 IF coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.products WHERE status='published'),'[]'::jsonb)<>data->'snapshot'->'published_products' OR coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved),'[]'::jsonb)<>data->'snapshot'->'approved_published_routes' THEN RAISE EXCEPTION 'PR5.40 publication drift'; END IF;
 IF NOT has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') OR has_table_privilege('anon','software_discovery.claim_evidence','SELECT') THEN RAISE EXCEPTION 'PR5.40 private evidence boundary drift'; END IF;
 FOR op IN SELECT value FROM jsonb_array_elements(data->'guards') LOOP
  EXECUTE format('SELECT coalesce(jsonb_agg(j ORDER BY j::text),''[]''::jsonb) FROM (SELECT to_jsonb(jsonb_populate_record(NULL::software_discovery.%I,r))-''created_at''-''updated_at'' j FROM jsonb_array_elements($1) r) x',op->>'table') INTO expected USING op->'rows';
  EXECUTE format('SELECT coalesce(jsonb_agg(j ORDER BY j::text),''[]''::jsonb) FROM (SELECT to_jsonb(t)-''created_at''-''updated_at'' j FROM software_discovery.%I t WHERE %s) x',op->>'table',op->>'where') INTO actual;
  IF expected<>actual THEN RAISE EXCEPTION 'PR5.40 stored baseline drift: %',op->>'table'; END IF;
 END LOOP;
 UPDATE software_discovery.escape_routes SET status='published',editorially_approved=true,description=data->>'description' WHERE id=${quote(s.route[0].id)};
 IF (SELECT count(*) FROM software_discovery.products WHERE status='published')<>15 OR (SELECT count(*) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved)<>7 THEN RAISE EXCEPTION 'PR5.40 post-publication count mismatch'; END IF;
 IF EXISTS(SELECT 1 FROM software_discovery.products WHERE id IN (${ids}) AND software_discovery.product_discovery_page(slug) IS NULL) THEN RAISE EXCEPTION 'PR5.40 public product projection missing'; END IF;
 ${commit?'-- Owner-approved apply persists.':"RAISE SQLSTATE 'ZSR01' USING MESSAGE='Task route publication rehearsal only';"}
EXCEPTION WHEN SQLSTATE 'ZSR01' THEN RAISE NOTICE 'Task route publication rehearsal rolled back; no changes persisted';
END $task_publish$;
`;
 return {sql,guards,description,candidates,report:{packet:'PR5.40',publicationDecision:'pending-owner-approval',baselineSha256:pinned,mode:commit?'apply-after-approval':'rehearsal-rollback',before:{products:15,routes:6},after:{products:15,routes:7},qualified:3}};
}
export function productivityPublicationVerification(input){const r=buildProductivityPublication(input),s=input.snapshot,expectedRoutes=[...s.approved_published_routes,routeSlug].sort();
 const checks=r.guards.filter(g=>g.table!=='escape_routes').map(g=>`SELECT 'unchanged_${g.table}' check_name,(SELECT coalesce(jsonb_agg(j ORDER BY j::text),'[]'::jsonb) FROM (SELECT to_jsonb(t)-'created_at'-'updated_at' j FROM software_discovery.${g.table} t WHERE ${g.where}) x)=(SELECT coalesce(jsonb_agg(j ORDER BY j::text),'[]'::jsonb) FROM (SELECT to_jsonb(jsonb_populate_record(NULL::software_discovery.${g.table},a))-'created_at'-'updated_at' j FROM jsonb_array_elements($verify$${JSON.stringify(g.rows)}$verify$::jsonb) a) x) passed`);
 checks.push(`SELECT 'route_published_approved_description',EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE id=${quote(s.route[0].id)} AND status='published' AND editorially_approved AND description=${quote(r.description)})`, `SELECT 'public_slug_sets',coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.products WHERE status='published'),'[]'::jsonb)=$verify$${JSON.stringify(s.published_products)}$verify$::jsonb AND coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved),'[]'::jsonb)=$verify$${JSON.stringify(expectedRoutes)}$verify$::jsonb`, `SELECT 'public_workflow_projection',(SELECT count(*)=3 AND bool_and(EXISTS(SELECT 1 FROM jsonb_array_elements(software_discovery.product_discovery_page(p.slug)->'attributes') a WHERE a->>'slug'='personal-task-workflow-scope' AND a->>'value'='personal-task-capture-project-organization-and-scheduling' AND a->>'verificationStatus'='verified' AND jsonb_array_length(a->'sources')>0)) FROM software_discovery.products p WHERE slug IN (${list(slugs)}))`, `SELECT 'anon_private_evidence_boundary',has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') AND NOT has_table_privilege('anon','software_discovery.claim_evidence','SELECT')`);
 return '-- PR5.40 SELECT only: all 20 checks must be true.\n'+checks.join('\nUNION ALL\n')+';\n';
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const i=productivityPublicationInputs();for(const commit of [false,true])fs.writeFileSync(path.join(root,'supabase/data/PR5.40_'+(commit?'APPLY_AFTER_APPROVAL':'REHEARSE')+'.sql'),buildProductivityPublication(i,{commit}).sql);fs.writeFileSync(path.join(root,'supabase/verification/PR5.40_VERIFY.sql'),productivityPublicationVerification(i));console.log('PR5.40 proposal generated; owner approval pending. No remote execution.');}
