import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {pdfWorkflowInputs,buildPdfWorkflow} from './build-pdf-workflow.mjs';
import {createDatabasePlan} from './database-plan.mjs';import {createCompactImportSql} from './import-sql-compact.mjs';
import {createSimpleNotionVerification} from './build-simple-notion-import.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const slugs=['pdf-xchange-editor','pdf24-creator','pdfgear'],routeSlug='pdf-editors-without-a-subscription';
const baselineHash='44eb96c162875137af773c2831ff13eb2c7659e5204b961a77c13063d47e30b8';
export function pdfImportInputs(){return {...pdfWorkflowInputs(),snapshot:JSON.parse(fs.readFileSync(path.join(root,'seed/research/pdf-import-baseline-2026-10-13.json'),'utf8'))};}
export function buildPdfImport(input,{commit=false}={}){
 const {baseline,review,snapshot}=input;if(hash(snapshot)!==baselineHash||snapshot.packet!=='PR5.30'||snapshot.read_only!==true||snapshot.route.length||snapshot.route_members.length||snapshot.products.length!==3||snapshot.products.some(p=>p.status!=='draft'||!slugs.includes(p.slug))||snapshot.published_products.length!==12||snapshot.approved_published_routes.length!==5||snapshot.anon_private_evidence_boundary!==true)throw Error('PDF production baseline drift');
 const result=buildPdfWorkflow(baseline,review),bundle=structuredClone(result.bundle);
 bundle.products=bundle.products.filter(p=>slugs.includes(p.slug));
 for(const p of bundle.products){const c=review.candidates.find(c=>c.slug===p.slug);p.attributes=p.attributes.filter(a=>c.attributes.some(x=>x.slug===a.slug));p.anchors=p.anchors.filter(a=>a.slug==='adobe-pdf'&&a.relationshipType==='alternative');p.problems=[];p.audiences=[];for(const a of [...p.attributes,...p.anchors])a.evidence=a.evidence.filter(k=>k.startsWith('pdf-workflow-'));}
 bundle.escapeRoutes=bundle.escapeRoutes.filter(r=>r.slug===routeSlug);
 for(const k of ['attributes','anchors','problems','audiences'])bundle[k]=bundle[k].filter(t=>bundle.products.some(p=>p[k].some(c=>c.slug===t.slug)));
 const keys=new Set(bundle.products.flatMap(p=>[...p.attributes,...p.anchors].flatMap(c=>c.evidence)));bundle.sources=bundle.sources.filter(s=>keys.has(s.key));
 const ownership={version:1,products:slugs,routes:[routeSlug],sources:[],taxonomy:{anchors:[],attributes:[],problems:[],audiences:[]}},plan=createDatabasePlan(bundle);
 const tables=plan.tables.filter(t=>['evidence_sources','product_attributes','product_anchors','claim_evidence','product_attribute_evidence','product_anchor_evidence','escape_routes','escape_route_products'].includes(t.table));
 const productIds=snapshot.products.map(p=>p.id);
 const guardTables=['products','product_attributes','product_anchors','product_problems','product_audiences','product_attribute_evidence','product_anchor_evidence','product_problem_evidence','product_audience_evidence','claim_evidence','evidence_sources'];
 const guards=guardTables.map(table=>({table,rows:snapshot[table],where:table==='products'?`slug IN ('${slugs.join("','")}')`:table==='claim_evidence'||table==='evidence_sources'?`id IN (${snapshot[table].map(r=>`'${r.id}'::uuid`).join(',')||'NULL::uuid'})`:`product_id IN (${productIds.map(id=>`'${id}'::uuid`).join(',')})`}));
 guards.push(...['attributes','anchors'].map(table=>({table,rows:snapshot['taxonomy_'+table],where:`id IN (${snapshot['taxonomy_'+table].map(r=>`'${r.id}'::uuid`).join(',')})`})));
 let sql=createCompactImportSql(bundle,ownership,{commit});
 const original=JSON.stringify({tables:plan.tables,evidenceReplacements:plan.evidenceReplacements,routeMembershipReplacements:plan.routeMembershipReplacements,ownership});
 sql=sql.replace(original,JSON.stringify({tables,evidenceReplacements:[],routeMembershipReplacements:[],ownership,snapshot,guards}));
 const guard=`
  PERFORM set_config('TimeZone','UTC',true);
  IF EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='${routeSlug}') THEN RAISE EXCEPTION 'PR5.31 route no longer absent; fresh preflight required'; END IF;
  IF EXISTS(SELECT 1 FROM software_discovery.evidence_sources WHERE seed_key LIKE 'pdf-workflow-%') THEN RAISE EXCEPTION 'PR5.31 reviewed source collision'; END IF;
  IF coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.products WHERE status='published'),'[]'::jsonb)<>data->'snapshot'->'published_products' OR coalesce((SELECT jsonb_agg(slug ORDER BY slug) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved),'[]'::jsonb)<>data->'snapshot'->'approved_published_routes' THEN RAISE EXCEPTION 'PR5.31 publication drift'; END IF;
  IF EXISTS(SELECT 1 FROM software_discovery.escape_route_products WHERE product_id IN (${productIds.map(id=>`'${id}'::uuid`).join(',')})) THEN RAISE EXCEPTION 'PR5.31 unexpected target membership'; END IF;
  FOR op IN SELECT value FROM jsonb_array_elements(data->'guards') LOOP
    SELECT coalesce(jsonb_agg(r-'created_at'-'updated_at' ORDER BY (r-'created_at'-'updated_at')::text),'[]'::jsonb) INTO input_data FROM jsonb_array_elements(op->'rows') r;
    EXECUTE format('SELECT coalesce(jsonb_agg(to_jsonb(t)-''created_at''-''updated_at'' ORDER BY (to_jsonb(t)-''created_at''-''updated_at'')::text),''[]''::jsonb) FROM software_discovery.%I t WHERE %s',op->>'table',op->>'where') INTO row_data;
    IF input_data<>row_data THEN RAISE EXCEPTION 'PR5.31 stored baseline drift: %',op->>'table'; END IF;
  END LOOP;
`;
 sql=sql.replace("  own=data->'ownership';",guard+"  own=data->'ownership';");
 if(!sql.includes('PR5.31 stored baseline drift')||tables.find(t=>t.table==='product_attributes').rows.length!==9||tables.find(t=>t.table==='product_anchors').rows.length!==3)throw Error('Bounded import layout drift');
 return {sql,bundle,report:{packet:'PR5.31',snapshotSha256:baselineHash,mode:commit?'apply-drafts':'rehearsal-rollback',attributeClaims:9,scopedAnchors:3,routeMembers:3,newProducts:0,publicationApproved:false,publishedProducts:12,publishedRoutes:5,repeatPolicy:'Reject after application; obtain fresh preflight, never overwrite drift.'}};
}
export function createPdfImportVerification(r){
const verifiedBundle=structuredClone(r.bundle); for(const p of verifiedBundle.products) for(const c of [...p.attributes,...p.anchors]) c.lastVerifiedAt += "T00:00:00Z"; let sql=createSimpleNotionVerification(verifiedBundle);
sql=sql.replaceAll('PR5.24','PR5.31').replaceAll('seventeen_exact_reviewed_attributes','nine_exact_reviewed_attributes').replace('count(*)=17','count(*)=9').replaceAll("('joplin','obsidian','simplenote')","('pdf-xchange-editor','pdf24-creator','pdfgear')").replace("status=CASE WHEN slug='obsidian' THEN 'published' ELSE 'draft' END","status='draft'").replaceAll("t.slug='notion'","t.slug='adobe-pdf'").replace("a.slug=c->>'slug' AND l.relationship_type='alternative'","a.slug=c->>'slug' AND l.relationship_type='alternative'");
sql=sql.replace(/UNION ALL SELECT 'simple_route_remains_unapproved'[^\n]+/,"UNION ALL SELECT 'pdf_route_remains_unapproved',EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='pdf-editors-without-a-subscription' AND status='draft' AND NOT editorially_approved)");
sql=sql.replaceAll('ten_products_four_routes_preserved','twelve_products_five_routes_preserved').replace('count(*)=10 FROM','count(*)=12 FROM').replace('count(*)=4 FROM','count(*)=5 FROM');
sql=sql.replace(/UNION ALL SELECT 'draft_products_hidden_from_public_rpc'[^\n]+/,"UNION ALL SELECT 'draft_products_hidden_from_public_rpc',software_discovery.product_discovery_page('pdf-xchange-editor') IS NULL AND software_discovery.product_discovery_page('pdf24-creator') IS NULL AND software_discovery.product_discovery_page('pdfgear') IS NULL");
sql=sql.replace(/UNION ALL SELECT 'obsidian_public_scoped_projection'[^\n]+/,"UNION ALL SELECT 'pdf_route_exact_three_members',(SELECT count(*)=3 AND count(DISTINCT p.slug)=3 AND bool_and(p.slug IN ('pdf-xchange-editor','pdf24-creator','pdfgear')) FROM software_discovery.escape_route_products m JOIN software_discovery.products p ON p.id=m.product_id JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id WHERE r.slug='pdf-editors-without-a-subscription')");

return sql;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{if(process.argv.length!==2)throw Error('No arguments supported');const i=pdfImportInputs();for(const commit of [false,true]){const r=buildPdfImport(i,{commit});fs.writeFileSync(path.join(root,`supabase/data/PR5.31_${commit?'APPLY_DRAFTS':'REHEARSE'}.sql`),r.sql);fs.mkdirSync(path.join(root,'.seed-output/pdf-import'),{recursive:true});fs.writeFileSync(path.join(root,'.seed-output/pdf-import/report.json'),JSON.stringify(r.report,null,2)+'\n');}fs.writeFileSync(path.join(root,'supabase/verification/PR5.31_VERIFY.sql'),createPdfImportVerification(buildPdfImport(i)));console.log('PR5.31 generated: nine attributes, three scoped anchors, one unapproved draft route. No remote execution.');}catch(e){console.error(e.message);process.exitCode=1;}}
