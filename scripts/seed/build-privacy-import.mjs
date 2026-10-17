import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {privacyInputs,buildPrivacyGraph} from './build-privacy-graph-proposal.mjs';
import {createDatabasePlan} from './database-plan.mjs';
import {createCompactImportSql} from './import-sql-compact.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const BASELINE_HASH='019f012b228503eae4d355129727cfb049f0e7cd31a96a19ab7adfc828b3192a';
const slugs=['languagetool-local-cli-6-6','write-good-local-library-1-0-8','vale-local-passive-3-24-0'];
const routeSlug='privacy-friendly-grammarly-alternatives';
const retainedRouteSlug='grammarly-alternatives-without-a-subscription';
const quote=x=>"'"+x.replaceAll("'","''")+"'",list=xs=>xs.map(quote).join(',')||'NULL';
const collisionWhere=`slug IN (${list(['languagetool','vale','write-good',...slugs])}) OR lower(name) ~ '(language[[:space:]-]*tool|write[[:space:]-]*good|(^|[^a-z])vale([^a-z]|$))' OR lower(website_url) ~ '(languagetool[.]org|vale[.]sh|github[.]com/(btford/write-good|vale-cli/vale|errata-ai/vale))'`;
export function privacyImportInputs(){return {...privacyInputs(),snapshot:JSON.parse(fs.readFileSync(path.join(root,'seed/research/privacy-import-baseline-2026-10-17.json'),'utf8'))};}
export function buildPrivacyImport(input,{commit=false}={}){
 const {baseline,decision,review,snapshot:s}=input;
 if(hash(s)!==BASELINE_HASH||s.packet!=='PR5.101'||s.read_only!==true||s.products.length!==1||s.products[0].slug!=='languagetool'||s.products[0].status!=='draft'||s.route.length!==1||s.route[0].slug!==retainedRouteSlug||s.route_members.length!==3||s.target_route_memberships.length||s.published_products.length!==21||s.approved_published_routes.length!==9||s.anon_private_evidence_boundary!==true)throw Error('PR5.102 returned baseline drift');
 const result=buildPrivacyGraph(baseline,decision,review),bundle=structuredClone(result.bundle);
 bundle.products=bundle.products.filter(p=>slugs.includes(p.slug));
 bundle.escapeRoutes=bundle.escapeRoutes.filter(r=>r.slug===routeSlug);
 bundle.escapeRoutes[0].products=bundle.escapeRoutes[0].products.filter(m=>slugs.includes(m.productSlug)).map((m,i)=>({...m,position:i+1}));
 for(const k of ['attributes','anchors','problems','audiences'])bundle[k]=bundle[k].filter(t=>bundle.products.some(p=>p[k].some(c=>c.slug===t.slug)));
 const keys=new Set(bundle.products.flatMap(p=>[...p.attributes,...p.anchors].flatMap(c=>c.evidence)));
 bundle.sources=bundle.sources.filter(s=>keys.has(s.key));
 for(const t of bundle.attributes) {const old=s.taxonomy_attributes.find(x=>x.slug===t.slug);if(old){for(const k of ['name','description','category'])t[k]=old[k];t.valueType=old.value_type;}else if(!['privacy-friendly','reviewed-local-operation'].includes(t.slug))throw Error('Unexpected new taxonomy');}
 if(!s.taxonomy_anchors.some(x=>x.slug==='grammarly'))throw Error('Required anchor missing');
 if(s.taxonomy_attributes.some(t=>['privacy-friendly','reviewed-local-operation'].includes(t.slug)))throw Error('Unexpected taxonomy collision');
 const plan=createDatabasePlan(bundle),ownership={version:1,products:slugs,routes:[routeSlug],sources:[],taxonomy:{attributes:[],anchors:[],problems:[],audiences:[]}};
 const allowed=['attributes','products','evidence_sources','claim_evidence','product_attributes','product_anchors','product_attribute_evidence','product_anchor_evidence','escape_routes','escape_route_products'];
 const tables=plan.tables.filter(t=>allowed.includes(t.table)).map(t=>t.table==='attributes'?{...t,rows:t.rows.filter(r=>!s.taxonomy_attributes.some(a=>a.slug===r.slug))}:t),ids=list(s.products.map(p=>p.id)),guards=[];
 for(const table of ['products','product_attributes','product_anchors','product_problems','product_audiences','product_attribute_evidence','product_anchor_evidence','product_problem_evidence','product_audience_evidence'])guards.push({table,rows:s[table],where:table==='products'?`(${collisionWhere})`:`product_id IN (${ids})`,preserveWhere:table==='products'?`id IN (${ids})`:`product_id IN (${ids})`});
 for(const table of ['claim_evidence','evidence_sources'])guards.push({table,rows:s[table],where:`id IN (${list(s[table].map(r=>r.id))})`,preserveWhere:`id IN (${list(s[table].map(r=>r.id))})`});
 for(const table of ['attributes','anchors','problems','audiences'])guards.push({table,rows:s['taxonomy_'+table],where:`id IN (${list(s['taxonomy_'+table].map(r=>r.id))})`,preserveWhere:`id IN (${list(s['taxonomy_'+table].map(r=>r.id))})`});
 guards.push({table:'escape_routes',rows:s.route,where:`slug IN (${list([routeSlug,retainedRouteSlug])})`,preserveWhere:`slug=${quote(retainedRouteSlug)}`});
 guards.push({table:'escape_route_products',rows:s.route_members.map(({product_slug,...r})=>r),where:`escape_route_id IN (SELECT id FROM software_discovery.escape_routes WHERE slug=${quote(retainedRouteSlug)})`,preserveWhere:`escape_route_id IN (SELECT id FROM software_discovery.escape_routes WHERE slug=${quote(retainedRouteSlug)})`});
 guards.push({table:'escape_route_products',rows:[],where:`product_id IN (${ids})`,preserveWhere:`product_id IN (${ids})`});
 const payload={tables,evidenceReplacements:[],routeMembershipReplacements:[],ownership,snapshot:s,guards};
 let sql=createCompactImportSql(bundle,ownership,{commit});
 const original=JSON.stringify({tables:plan.tables,evidenceReplacements:plan.evidenceReplacements,routeMembershipReplacements:plan.routeMembershipReplacements,ownership});
 if(!sql.includes(original))throw Error('Import template changed');
 sql=sql.replace(original,JSON.stringify(payload));
 const guard=`
  PERFORM set_config('TimeZone','UTC',true);
  IF EXISTS(SELECT 1 FROM software_discovery.attributes WHERE slug IN ('privacy-friendly','reviewed-local-operation')) THEN RAISE EXCEPTION 'PR5.102 new taxonomy collision'; END IF;
  IF EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug IN (${list([routeSlug])})) THEN RAISE EXCEPTION 'PR5.102 route collision or repeated apply; obtain fresh snapshot'; END IF;
  IF EXISTS(SELECT 1 FROM software_discovery.evidence_sources WHERE seed_key LIKE 'privacy99-%') OR EXISTS(SELECT 1 FROM software_discovery.claim_evidence WHERE seed_key IN (${list(tables.find(t=>t.table==='claim_evidence').rows.map(x=>x.seed_key))})) THEN RAISE EXCEPTION 'PR5.102 provenance collision'; END IF;
  IF coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.products WHERE status='published'),'[]'::jsonb)<>data->'snapshot'->'published_products' OR coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved),'[]'::jsonb)<>data->'snapshot'->'approved_published_routes' THEN RAISE EXCEPTION 'PR5.102 publication drift'; END IF;
  IF NOT has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') OR has_table_privilege('anon','software_discovery.claim_evidence','SELECT') THEN RAISE EXCEPTION 'PR5.102 private evidence boundary drift'; END IF;
  FOR op IN SELECT value FROM jsonb_array_elements(data->'guards') LOOP
    EXECUTE format('SELECT coalesce(jsonb_agg(j ORDER BY j::text),''[]''::jsonb) FROM (SELECT to_jsonb(jsonb_populate_record(NULL::software_discovery.%I,r))-''created_at''-''updated_at'' j FROM jsonb_array_elements($1) r) x',op->>'table') INTO input_data USING op->'rows';
    EXECUTE format('SELECT coalesce(jsonb_agg(j ORDER BY j::text),''[]''::jsonb) FROM (SELECT to_jsonb(t)-''created_at''-''updated_at'' j FROM software_discovery.%I t WHERE %s) x',op->>'table',op->>'where') INTO row_data;
    IF input_data<>row_data THEN RAISE EXCEPTION 'PR5.102 retained baseline drift: %',op->>'table'; END IF;
  END LOOP;
`;
 sql=sql.replace("  own=data->'ownership';",guard+"  own=data->'ownership';");
 const count=t=>tables.find(x=>x.table===t).rows.length;
 if(count('products')!==3||count('product_attributes')!==12||count('product_anchors')!==3||count('escape_routes')!==1||count('escape_route_products')!==3)throw Error('Writing import layout drift');
 return {sql,bundle,plan:{tables},guards,report:{packet:'PR5.102',snapshotSha256:BASELINE_HASH,mode:commit?'apply-unapproved-drafts':'rehearsal-rollback',newProducts:3,newTaxonomy:2,attributeClaims:12,scopedAnchors:3,routeMembers:3,newSources:count('evidence_sources'),newEvidenceFragments:count('claim_evidence'),publicationApproved:false,acceptedPublishedProducts:21,acceptedPublishedRoutes:9,existingGenericLanguageTool:'All captured rows retained; not an import target',repeatPolicy:'Reject after apply; obtain fresh snapshot rather than overwrite drift'}};
}

function resolved(row){
 return 'jsonb_build_object('+Object.entries(row).flatMap(([k,v])=>{
  const value=v&&typeof v==='object'&&v.$ref?`(SELECT to_jsonb(id) FROM software_discovery.${v.$ref.table} WHERE ${Object.keys(v.$ref.where)[0]}=${quote(Object.values(v.$ref.where)[0])})`:`${quote(JSON.stringify(v))}::jsonb`;
  return [quote(k),value];
 }).join(',')+')';
}
export function privacyImportVerification(r){
 const selected=`product_id IN (SELECT id FROM software_discovery.products WHERE slug IN (${list(slugs)}))`;
 const wheres={attributes:`slug IN ('privacy-friendly','reviewed-local-operation')`,products:`slug IN (${list(slugs)})`,evidence_sources:"seed_key LIKE 'privacy99-%'",claim_evidence:`seed_key IN (${list(r.plan.tables.find(t=>t.table==='claim_evidence').rows.map(x=>x.seed_key))}) OR evidence_source_id IN (SELECT id FROM software_discovery.evidence_sources WHERE seed_key LIKE 'privacy99-%')`,product_attributes:selected,product_anchors:selected,product_attribute_evidence:selected,product_anchor_evidence:selected,escape_routes:`slug='${routeSlug}'`,escape_route_products:`escape_route_id IN (SELECT id FROM software_discovery.escape_routes WHERE slug='${routeSlug}') OR ${selected}`};
 const checks=r.plan.tables.map(t=>{
  const expected=t.rows.map(row=>resolved(row));
  return `SELECT 'exact_${t.table}' check_name,(SELECT count(*)=${t.rows.length} FROM software_discovery.${t.table} WHERE ${wheres[t.table]}) AND NOT EXISTS(SELECT 1 FROM (VALUES ${expected.map(x=>`(${x})`).join(',')}) e(raw) WHERE NOT EXISTS(SELECT 1 FROM software_discovery.${t.table} t WHERE to_jsonb(t) @> (SELECT jsonb_object_agg(key,value) FROM jsonb_each(to_jsonb(jsonb_populate_record(NULL::software_discovery.${t.table},e.raw))) WHERE e.raw ? key))) passed`;
 });
 for(const g of r.guards)checks.push(`SELECT 'retained_${g.table}',coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text) FROM software_discovery.${g.table} t WHERE ${g.preserveWhere}),'[]'::jsonb)=(SELECT coalesce(jsonb_agg(j ORDER BY j::text),'[]'::jsonb) FROM (SELECT to_jsonb(jsonb_populate_record(NULL::software_discovery.${g.table},r)) j FROM jsonb_array_elements($verify$${JSON.stringify(g.rows)}$verify$::jsonb) r) x)`);
 const s=privacyImportInputs().snapshot;
 checks.push(`SELECT 'published_slug_sets_preserved',coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.products WHERE status='published'),'[]'::jsonb)=$verify$${JSON.stringify(s.published_products)}$verify$::jsonb AND coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved),'[]'::jsonb)=$verify$${JSON.stringify(s.approved_published_routes)}$verify$::jsonb`);
 checks.push(`SELECT 'draft_lifecycle_and_public_boundary',(SELECT count(*)=3 AND bool_and(status='draft') FROM software_discovery.products WHERE slug IN (${list(slugs)})) AND EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='${routeSlug}' AND status='draft' AND NOT editorially_approved) AND ${slugs.map(s=>`software_discovery.product_discovery_page('${s}') IS NULL`).join(' AND ')}`);
 checks.push(`SELECT 'no_extra_claims',NOT EXISTS(SELECT 1 FROM software_discovery.product_problems WHERE ${selected}) AND NOT EXISTS(SELECT 1 FROM software_discovery.product_audiences WHERE ${selected})`);
 checks.push("SELECT 'anon_private_evidence_boundary',has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') AND NOT has_table_privilege('anon','software_discovery.claim_evidence','SELECT')");
 return '-- PR5.102: SELECT only; every passed value must be true. Does not authorize publication.\n'+checks.join('\nUNION ALL\n')+';\n';
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('No arguments supported');const i=privacyImportInputs(),r=buildPrivacyImport(i);for(const commit of [false,true])fs.writeFileSync(path.join(root,`supabase/data/PR5.102_${commit?'APPLY_DRAFTS':'REHEARSE'}.sql`),buildPrivacyImport(i,{commit}).sql);fs.writeFileSync(path.join(root,'supabase/verification/PR5.102_VERIFY.sql'),privacyImportVerification(r));const out=path.join(root,'.seed-output/privacy-import');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(r.report,null,2)+'\n');console.log(JSON.stringify(r.report));}catch(e){console.error(e.message);process.exitCode=1;}
}
