import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {productivityInputs,buildProductivityWorkflow} from './build-productivity-workflow.mjs';
import {createDatabasePlan} from './database-plan.mjs';import {createCompactImportSql} from './import-sql-compact.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const slugs=['things','omnifocus','2do'],routeSlug='productivity-apps-you-can-buy-once',pinned='0e1b95bb5cbb8fd5498d3613c0283d17b0d8adedfc2ef22c9b6d1f7a755d32b8';
const quote=x=>"'"+x.replaceAll("'","''")+"'",list=xs=>xs.map(quote).join(',')||'NULL';
export function productivityImportInputs(){return {...productivityInputs(),snapshot:JSON.parse(fs.readFileSync(path.join(root,'seed/research/productivity-import-baseline-2026-10-14.json'),'utf8'))};}
export function buildProductivityImport(input,{commit=false}={}){
 const {baseline,review,snapshot:s}=input;
 if(hash(s)!==pinned||s.packet!=='PR5.37'||s.read_only!==true||s.route.length||s.route_members.length||s.products.length!==3||s.products.some(p=>!slugs.includes(p.slug)||p.status!=='published')||s.published_products.length!==15||s.approved_published_routes.length!==6||s.anon_private_evidence_boundary!==true)throw Error('PR5.38 baseline drift');
 const result=buildProductivityWorkflow(baseline,review),bundle=structuredClone(result.bundle);
 bundle.products=bundle.products.filter(p=>slugs.includes(p.slug));
 for(const p of bundle.products){p.attributes=p.attributes.filter(c=>['personal-task-workflow-scope','one-time-purchase','pricing-model','trade-off-summary'].includes(c.slug));p.anchors=[];p.problems=[];p.audiences=[];for(const c of p.attributes)c.evidence=c.evidence.filter(k=>k.startsWith('productivity-'));}
 bundle.escapeRoutes=bundle.escapeRoutes.filter(r=>r.slug===routeSlug);
 for(const k of ['attributes','anchors','problems','audiences'])bundle[k]=bundle[k].filter(t=>bundle.products.some(p=>p[k].some(c=>c.slug===t.slug)));
 const keys=new Set(bundle.products.flatMap(p=>p.attributes.flatMap(c=>c.evidence)));bundle.sources=bundle.sources.filter(s=>keys.has(s.key));
 const plan=createDatabasePlan(bundle),ownership={version:1,products:slugs,routes:[routeSlug],sources:[],taxonomy:{attributes:[],anchors:[],problems:[],audiences:[]}};
 const tables=plan.tables.filter(t=>['evidence_sources','claim_evidence','product_attributes','product_attribute_evidence','escape_routes','escape_route_products'].includes(t.table)||t.table==='attributes').map(t=>t.table==='attributes'?{...t,rows:t.rows.filter(r=>r.slug==='personal-task-workflow-scope')}:t);
 const ids=list(s.products.map(p=>p.id)),guards=[];
 for(const table of ['products','product_attributes','product_anchors','product_problems','product_audiences','product_attribute_evidence','product_anchor_evidence','product_problem_evidence','product_audience_evidence'])guards.push({table,rows:s[table],where:table==='products'?`slug IN (${list(slugs)})`:`product_id IN (${ids})`});
 for(const table of ['claim_evidence','evidence_sources'])guards.push({table,rows:s[table],where:`id IN (${list(s[table].map(r=>r.id))})`});
 for(const table of ['attributes','anchors','problems','audiences'])guards.push({table,rows:s['taxonomy_'+table],where:`id IN (${list(s['taxonomy_'+table].map(r=>r.id))})${table==='attributes'?" OR slug='personal-task-workflow-scope'":''}`});
 guards.push({table:'escape_route_products',rows:s.target_route_memberships.map(m=>Object.fromEntries(Object.entries(m).filter(([k])=>!['route_slug','route_status','editorially_approved'].includes(k)))),where:`product_id IN (${ids})`});
 const payload={tables,evidenceReplacements:[],routeMembershipReplacements:[],ownership,snapshot:s,guards};
 let sql=createCompactImportSql(bundle,ownership,{commit});
 sql=sql.replace(JSON.stringify({tables:plan.tables,evidenceReplacements:plan.evidenceReplacements,routeMembershipReplacements:plan.routeMembershipReplacements,ownership}),JSON.stringify(payload));
 const guard=`
  PERFORM set_config('TimeZone','UTC',true);
  IF EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='${routeSlug}') THEN RAISE EXCEPTION 'PR5.38 route drift or repeated apply'; END IF;
  IF EXISTS(SELECT 1 FROM software_discovery.evidence_sources WHERE seed_key LIKE 'productivity-%') OR EXISTS(SELECT 1 FROM software_discovery.claim_evidence WHERE seed_key IN (${list(plan.tables.find(t=>t.table==='claim_evidence').rows.map(r=>r.seed_key))})) THEN RAISE EXCEPTION 'PR5.38 reviewed provenance collision'; END IF;
  IF coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.products WHERE status='published'),'[]'::jsonb)<>data->'snapshot'->'published_products' OR coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved),'[]'::jsonb)<>data->'snapshot'->'approved_published_routes' THEN RAISE EXCEPTION 'PR5.38 publication drift'; END IF;
  IF NOT has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') OR has_table_privilege('anon','software_discovery.claim_evidence','SELECT') THEN RAISE EXCEPTION 'PR5.38 private evidence boundary drift'; END IF;
  FOR op IN SELECT value FROM jsonb_array_elements(data->'guards') LOOP
    EXECUTE format('SELECT coalesce(jsonb_agg(j ORDER BY j::text),''[]''::jsonb) FROM (SELECT to_jsonb(jsonb_populate_record(NULL::software_discovery.%I,r))-''created_at''-''updated_at'' j FROM jsonb_array_elements($1) r) x',op->>'table') INTO input_data USING op->'rows';
    EXECUTE format('SELECT coalesce(jsonb_agg(j ORDER BY j::text),''[]''::jsonb) FROM (SELECT to_jsonb(t)-''created_at''-''updated_at'' j FROM software_discovery.%I t WHERE %s) x',op->>'table',op->>'where') INTO row_data;
    IF input_data<>row_data THEN RAISE EXCEPTION 'PR5.38 stored baseline drift: %',op->>'table'; END IF;
  END LOOP;
`;
 sql=sql.replace("  own=data->'ownership';",guard+"  own=data->'ownership';");
 if(tables.find(t=>t.table==='product_attributes').rows.length!==12||!sql.includes('PR5.38 stored baseline drift'))throw Error('Import layout mismatch');
 return {sql,bundle,guards,report:{packet:'PR5.38',baselineSha256:pinned,attributeClaims:12,newTaxonomy:1,newProducts:0,routeMembers:3,publicationApproved:false,productLifecycle:'preserve existing published states',mode:commit?'apply-unapproved-route':'rehearsal-rollback'}};
}
export function productivityImportVerification(r){
 const retainedAttributes=productivityImportInputs().snapshot.product_attributes.filter(a=>!productivityImportInputs().snapshot.taxonomy_attributes.some(t=>t.id===a.attribute_id&&['one-time-purchase','pricing-model','trade-off-summary'].includes(t.slug)));
 const preservation=[...r.guards.filter(g=>g.table!=='product_attributes'),{table:'product_attributes',rows:retainedAttributes}].map(g=>"UNION ALL SELECT 'retained_"+g.table+"',NOT EXISTS(SELECT 1 FROM jsonb_array_elements($verify$"+JSON.stringify(g.rows)+"$verify$::jsonb) x WHERE NOT EXISTS(SELECT 1 FROM software_discovery."+g.table+" t WHERE to_jsonb(t)-'created_at'-'updated_at'=to_jsonb(jsonb_populate_record(NULL::software_discovery."+g.table+",x))-'created_at'-'updated_at'))").join('\n');
 const pairs=r.bundle.products.flatMap(p=>p.attributes.map(c=>({slug:p.slug,attribute:c.slug,value:c.value}))),s=productivityImportInputs().snapshot;
 return `-- PR5.38: SELECT only. Every check must be true.
WITH expected AS (SELECT value c FROM jsonb_array_elements($verify$${JSON.stringify(pairs)}$verify$::jsonb))
SELECT 'three_published_products_preserved' check_name,(SELECT count(*)=3 AND bool_and(status='published') FROM software_discovery.products WHERE slug IN (${list(slugs)})) passed
UNION ALL SELECT 'twelve_exact_reviewed_attributes',(SELECT count(*)=12 AND bool_and(a.verification_status='verified' AND a.confidence=.9 AND a.last_verified_at='2026-10-13T00:00:00Z' AND coalesce(to_jsonb(a.value_text),to_jsonb(a.value_boolean))=c->'value') FROM expected JOIN software_discovery.products p ON p.slug=c->>'slug' JOIN software_discovery.attributes t ON t.slug=c->>'attribute' JOIN software_discovery.product_attributes a ON a.product_id=p.id AND a.attribute_id=t.id)
UNION ALL SELECT 'reviewed_sources_linked',NOT EXISTS(SELECT 1 FROM expected WHERE (SELECT count(DISTINCT src.seed_key) FROM software_discovery.products p JOIN software_discovery.attributes t ON t.slug=c->>'attribute' JOIN software_discovery.product_attribute_evidence l ON l.product_id=p.id AND l.attribute_id=t.id JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources src ON src.id=e.evidence_source_id WHERE p.slug=c->>'slug' AND (c->'sources') ? src.seed_key)<>jsonb_array_length(c->'sources'))
UNION ALL SELECT 'unapproved_draft_route',EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='${routeSlug}' AND status='draft' AND NOT editorially_approved)
UNION ALL SELECT 'exact_three_route_members',(SELECT count(*)=3 AND bool_and(p.slug IN (${list(slugs)})) FROM software_discovery.escape_routes r JOIN software_discovery.escape_route_products m ON m.escape_route_id=r.id JOIN software_discovery.products p ON p.id=m.product_id WHERE r.slug='${routeSlug}')
UNION ALL SELECT 'published_slug_sets_preserved',coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.products WHERE status='published'),'[]'::jsonb)=$verify$${JSON.stringify(s.published_products)}$verify$::jsonb AND coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved),'[]'::jsonb)=$verify$${JSON.stringify(s.approved_published_routes)}$verify$::jsonb
UNION ALL SELECT 'anon_private_evidence_boundary',has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') AND NOT has_table_privilege('anon','software_discovery.claim_evidence','SELECT')
${preservation};
`;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const i=productivityImportInputs();for(const commit of [false,true])fs.writeFileSync(path.join(root,'supabase/data/PR5.38_'+(commit?'APPLY_UNAPPROVED_ROUTE':'REHEARSE')+'.sql'),buildProductivityImport(i,{commit}).sql);fs.writeFileSync(path.join(root,'supabase/verification/PR5.38_VERIFY.sql'),productivityImportVerification(buildProductivityImport(i)));console.log('PR5.38 generated. No remote execution.');}
