import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {meditationInputs,buildMeditationWorkflow} from './build-meditation-workflow.mjs';
import {createDatabasePlan} from './database-plan.mjs';
import {createCompactImportSql} from './import-sql-compact.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const BASELINE_HASH='7dd3f87ec63aa10a6653c7c93fda9bd45d146e6fe8ff3d23ac8da5f8d4644831';
const slugs=['medito','smiling-mind','healthy-minds-program'],routeSlug='meditation-apps-without-a-subscription';
const attributes=['no-subscription','pricing-model','trade-off-summary'];
const quote=x=>"'"+x.replaceAll("'","''")+"'",list=xs=>xs.map(quote).join(',')||'NULL';
export function meditationImportInputs(){return {...meditationInputs(),snapshot:JSON.parse(fs.readFileSync(path.join(root,'seed/research/meditation-import-baseline-2026-10-15.json'),'utf8'))};}
export function buildMeditationImport(input,{commit=false}={}){
 const {baseline,review,snapshot:s}=input;
 if(hash(s)!==BASELINE_HASH||s.packet!=='PR5.57'||s.read_only!==true||s.route.length||s.route_members.length||s.target_route_memberships.length||s.products.length!==3||s.products.some(p=>!slugs.includes(p.slug)||p.status!=='draft')||s.published_products.length!==15||s.approved_published_routes.length!==7||s.anon_private_evidence_boundary!==true)throw Error('PR5.58 baseline drift');
 const result=buildMeditationWorkflow(baseline,review),bundle=structuredClone(result.bundle);
 bundle.products=bundle.products.filter(p=>slugs.includes(p.slug));
 for(const p of bundle.products){p.attributes=p.attributes.filter(c=>attributes.includes(c.slug));p.anchors=p.anchors.filter(c=>c.slug==='calm'&&c.relationshipType==='alternative');p.problems=[];p.audiences=[];for(const c of [...p.attributes,...p.anchors])c.evidence=c.evidence.filter(k=>k.startsWith('meditation-'));}
 bundle.escapeRoutes=bundle.escapeRoutes.filter(r=>r.slug===routeSlug);
 for(const k of ['attributes','anchors','problems','audiences'])bundle[k]=bundle[k].filter(t=>bundle.products.some(p=>p[k].some(c=>c.slug===t.slug)));
 const keys=new Set(bundle.products.flatMap(p=>[...p.attributes,...p.anchors].flatMap(c=>c.evidence)));bundle.sources=bundle.sources.filter(s=>keys.has(s.key));
 const plan=createDatabasePlan(bundle),ownership={version:1,products:slugs,routes:[routeSlug],sources:[],taxonomy:{attributes:[],anchors:[],problems:[],audiences:[]}};
 const allowedTables=['evidence_sources','claim_evidence','product_attributes','product_anchors','product_attribute_evidence','product_anchor_evidence','escape_routes','escape_route_products'];
 const tables=plan.tables.filter(t=>allowedTables.includes(t.table));
 const ids=list(s.products.map(p=>p.id)),guards=[];
 for(const table of ['products','product_attributes','product_anchors','product_problems','product_audiences','product_attribute_evidence','product_anchor_evidence','product_problem_evidence','product_audience_evidence'])guards.push({table,rows:s[table],where:table==='products'?`slug IN (${list(slugs)})`:`product_id IN (${ids})`});
 for(const table of ['claim_evidence','evidence_sources'])guards.push({table,rows:s[table],where:`id IN (${list(s[table].map(r=>r.id))})`});
 for(const table of ['attributes','anchors','problems','audiences'])guards.push({table,rows:s['taxonomy_'+table],where:`id IN (${list(s['taxonomy_'+table].map(r=>r.id))})`});
 guards.push({table:'escape_route_products',rows:[],where:`product_id IN (${ids})`});
 const payload={tables,evidenceReplacements:[],routeMembershipReplacements:[],ownership,snapshot:s,guards};
 let sql=createCompactImportSql(bundle,ownership,{commit});
 const original=JSON.stringify({tables:plan.tables,evidenceReplacements:plan.evidenceReplacements,routeMembershipReplacements:plan.routeMembershipReplacements,ownership});
 if(!sql.includes(original))throw Error('Import template drift');sql=sql.replace(original,JSON.stringify(payload));
 const guard=`
  PERFORM set_config('TimeZone','UTC',true);
  IF EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='${routeSlug}') THEN RAISE EXCEPTION 'PR5.58 route drift or repeated apply; fresh preflight required'; END IF;
  IF EXISTS(SELECT 1 FROM software_discovery.evidence_sources WHERE seed_key LIKE 'meditation-%') OR EXISTS(SELECT 1 FROM software_discovery.claim_evidence WHERE seed_key IN (${list(plan.tables.find(t=>t.table==='claim_evidence').rows.map(r=>r.seed_key))})) THEN RAISE EXCEPTION 'PR5.58 reviewed provenance collision'; END IF;
  IF coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.products WHERE status='published'),'[]'::jsonb)<>data->'snapshot'->'published_products' OR coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved),'[]'::jsonb)<>data->'snapshot'->'approved_published_routes' THEN RAISE EXCEPTION 'PR5.58 publication drift'; END IF;
  IF NOT has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') OR has_table_privilege('anon','software_discovery.claim_evidence','SELECT') THEN RAISE EXCEPTION 'PR5.58 private evidence boundary drift'; END IF;
  FOR op IN SELECT value FROM jsonb_array_elements(data->'guards') LOOP
    EXECUTE format('SELECT coalesce(jsonb_agg(j ORDER BY j::text),''[]''::jsonb) FROM (SELECT to_jsonb(jsonb_populate_record(NULL::software_discovery.%I,r))-''created_at''-''updated_at'' j FROM jsonb_array_elements($1) r) x',op->>'table') INTO input_data USING op->'rows';
    EXECUTE format('SELECT coalesce(jsonb_agg(j ORDER BY j::text),''[]''::jsonb) FROM (SELECT to_jsonb(t)-''created_at''-''updated_at'' j FROM software_discovery.%I t WHERE %s) x',op->>'table',op->>'where') INTO row_data;
    IF input_data<>row_data THEN RAISE EXCEPTION 'PR5.58 stored baseline drift: %',op->>'table'; END IF;
  END LOOP;
`;
 sql=sql.replace("  own=data->'ownership';",guard+"  own=data->'ownership';");
 const count=t=>tables.find(x=>x.table===t).rows.length;
 if(count('product_attributes')!==9||count('product_anchors')!==3||count('escape_routes')!==1||count('escape_route_products')!==3)throw Error('Meditation import layout drift');
 return {sql,bundle,plan:{tables},guards,report:{packet:'PR5.58',baselineSha256:BASELINE_HASH,mode:commit?'apply-unapproved-drafts':'rehearsal-rollback',attributeClaims:9,scopedAnchors:3,routeMembers:3,newProducts:0,newTaxonomy:0,newSources:count('evidence_sources'),newEvidenceFragments:count('claim_evidence'),publicationApproved:false,productsRemain:'draft',routeRemains:'draft and not editorially approved',acceptedPublishedProducts:15,acceptedPublishedRoutes:7,repeatPolicy:'Reject after application; obtain fresh preflight instead of overwriting drift.'}};
}
export function meditationImportVerification(r){
 const s=meditationImportInputs().snapshot;
 const attrIds=s.taxonomy_attributes.filter(a=>attributes.includes(a.slug)).map(a=>a.id),calm=s.taxonomy_anchors.find(a=>a.slug==='calm').id;
 const retained=r.guards.map(g=>({...g,rows:g.table==='product_attributes'?g.rows.filter(a=>!attrIds.includes(a.attribute_id)):g.table==='product_anchors'?g.rows.filter(a=>a.anchor_id!==calm||a.relationship_type!=='alternative'):g.rows})).filter(g=>g.table!=='escape_route_products');
 const preservation=retained.map(g=>`UNION ALL SELECT 'retained_${g.table}',NOT EXISTS(SELECT 1 FROM jsonb_array_elements($verify$${JSON.stringify(g.rows)}$verify$::jsonb) x WHERE NOT EXISTS(SELECT 1 FROM software_discovery.${g.table} t WHERE to_jsonb(t)-'created_at'-'updated_at'=to_jsonb(jsonb_populate_record(NULL::software_discovery.${g.table},x))-'created_at'-'updated_at'))`).join('\n');
 const expected=r.bundle.products.flatMap(p=>[...p.attributes.map(c=>({product:p.slug,kind:'attribute',slug:c.slug,value:c.value,confidence:c.confidence,date:new Date(c.lastVerifiedAt).toISOString(),sources:c.evidence})),...p.anchors.map(c=>({product:p.slug,kind:'anchor',slug:c.slug,scope:c.scope,description:c.scopeDescription,confidence:c.confidence,date:new Date(c.lastVerifiedAt).toISOString(),sources:c.evidence}))]);
 const sourceRows=r.plan.tables.find(t=>t.table==='evidence_sources').rows.map(s=>({...s,retrieved_at:new Date(s.retrieved_at).toISOString()}));
 const fragments=r.plan.tables.find(t=>t.table==='claim_evidence').rows.map(row=>({key:row.seed_key,source:row.evidence_source_id.$ref.where.seed_key,notes:row.notes,excerpt:row.excerpt}));
 return `-- PR5.58: single SELECT only. Every passed value must be true; this does not publish anything.
WITH expected AS (SELECT value c FROM jsonb_array_elements($verify$${JSON.stringify(expected)}$verify$::jsonb))
SELECT 'three_original_draft_products' check_name,(SELECT count(*)=3 AND bool_and(status='draft') FROM software_discovery.products WHERE slug IN (${list(slugs)})) passed
UNION ALL SELECT 'nine_exact_reviewed_attributes',(SELECT count(*)=9 AND bool_and((a.verification_status='verified' AND a.confidence=(c->>'confidence')::numeric AND a.last_verified_at=(c->>'date')::timestamptz AND CASE WHEN jsonb_typeof(c->'value')='boolean' THEN to_jsonb(a.value_boolean)=c->'value' AND a.value_text IS NULL ELSE to_jsonb(a.value_text)=c->'value' AND a.value_boolean IS NULL END AND a.value_number IS NULL AND a.value_enum IS NULL) IS TRUE) FROM expected JOIN software_discovery.products p ON p.slug=c->>'product' JOIN software_discovery.attributes t ON t.slug=c->>'slug' JOIN software_discovery.product_attributes a ON a.product_id=p.id AND a.attribute_id=t.id WHERE c->>'kind'='attribute')
UNION ALL SELECT 'three_exact_scoped_anchors',(SELECT count(*)=3 AND bool_and((a.relationship_scope=c->>'scope' AND a.scope_description=c->>'description' AND a.verification_status='verified' AND a.confidence=(c->>'confidence')::numeric AND a.last_verified_at=(c->>'date')::timestamptz) IS TRUE) FROM expected JOIN software_discovery.products p ON p.slug=c->>'product' JOIN software_discovery.anchors t ON t.slug=c->>'slug' JOIN software_discovery.product_anchors a ON a.product_id=p.id AND a.anchor_id=t.id AND a.relationship_type='alternative' WHERE c->>'kind'='anchor')
UNION ALL SELECT 'reviewed_attribute_evidence_linked',NOT EXISTS(SELECT 1 FROM expected WHERE c->>'kind'='attribute' AND (SELECT count(DISTINCT src.seed_key) FROM software_discovery.products p JOIN software_discovery.attributes t ON t.slug=c->>'slug' JOIN software_discovery.product_attribute_evidence l ON l.product_id=p.id AND l.attribute_id=t.id JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources src ON src.id=e.evidence_source_id WHERE p.slug=c->>'product' AND (c->'sources') ? src.seed_key)<>jsonb_array_length(c->'sources'))
UNION ALL SELECT 'reviewed_anchor_evidence_linked',NOT EXISTS(SELECT 1 FROM expected WHERE c->>'kind'='anchor' AND (SELECT count(DISTINCT src.seed_key) FROM software_discovery.products p JOIN software_discovery.anchors t ON t.slug=c->>'slug' JOIN software_discovery.product_anchor_evidence l ON l.product_id=p.id AND l.anchor_id=t.id AND l.relationship_type='alternative' JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources src ON src.id=e.evidence_source_id WHERE p.slug=c->>'product' AND (c->'sources') ? src.seed_key)<>jsonb_array_length(c->'sources'))
UNION ALL SELECT 'reviewed_source_rows_exact',NOT EXISTS(SELECT 1 FROM jsonb_array_elements($verify$${JSON.stringify(sourceRows)}$verify$::jsonb) x WHERE NOT EXISTS(SELECT 1 FROM software_discovery.evidence_sources t WHERE t.seed_key=x->>'seed_key' AND t.source_type=x->>'source_type' AND t.title=x->>'title' AND t.url=x->>'url' AND t.publisher=x->>'publisher' AND t.retrieved_at=(x->>'retrieved_at')::timestamptz))
UNION ALL SELECT 'reviewed_fragment_rows_exact',NOT EXISTS(SELECT 1 FROM jsonb_array_elements($verify$${JSON.stringify(fragments)}$verify$::jsonb) x WHERE NOT EXISTS(SELECT 1 FROM software_discovery.claim_evidence e JOIN software_discovery.evidence_sources src ON src.id=e.evidence_source_id WHERE e.seed_key=x->>'key' AND src.seed_key=x->>'source' AND e.notes=x->>'notes' AND e.excerpt IS NULL))
UNION ALL SELECT 'unapproved_draft_route',EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='${routeSlug}' AND status='draft' AND NOT editorially_approved AND description=${quote(r.bundle.escapeRoutes[0].description)} AND last_verified_at='2026-10-15T00:00:00Z')
UNION ALL SELECT 'exact_three_route_members',(SELECT count(*)=3 AND count(DISTINCT p.slug)=3 AND bool_and(p.slug IN (${list(slugs)})) FROM software_discovery.escape_routes r JOIN software_discovery.escape_route_products m ON m.escape_route_id=r.id JOIN software_discovery.products p ON p.id=m.product_id WHERE r.slug='${routeSlug}')
UNION ALL SELECT 'no_other_target_memberships',NOT EXISTS(SELECT 1 FROM software_discovery.escape_route_products m JOIN software_discovery.products p ON p.id=m.product_id JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id WHERE p.slug IN (${list(slugs)}) AND r.slug<>'${routeSlug}')
UNION ALL SELECT 'published_slug_sets_preserved',coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.products WHERE status='published'),'[]'::jsonb)=$verify$${JSON.stringify(s.published_products)}$verify$::jsonb AND coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved),'[]'::jsonb)=$verify$${JSON.stringify(s.approved_published_routes)}$verify$::jsonb
UNION ALL SELECT 'drafts_hidden_from_public_rpc',software_discovery.product_discovery_page('medito') IS NULL AND software_discovery.product_discovery_page('smiling-mind') IS NULL AND software_discovery.product_discovery_page('healthy-minds-program') IS NULL
UNION ALL SELECT 'anon_private_evidence_boundary',has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') AND NOT has_table_privilege('anon','software_discovery.claim_evidence','SELECT')
${preservation};
`;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('No arguments supported');const i=meditationImportInputs(),r=buildMeditationImport(i);for(const commit of [false,true])fs.writeFileSync(path.join(root,`supabase/data/PR5.58_${commit?'APPLY_DRAFTS':'REHEARSE'}.sql`),buildMeditationImport(i,{commit}).sql);fs.writeFileSync(path.join(root,'supabase/verification/PR5.58_VERIFY.sql'),meditationImportVerification(r));const out=path.join(root,'.seed-output/meditation-import');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(r.report,null,2)+'\n');console.log('PR5.58 generated: nine attributes, three scoped anchors, one unapproved draft route; no remote execution.');}catch(e){console.error(e.message);process.exitCode=1;}
}
