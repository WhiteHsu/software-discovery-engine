import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {simpleNotionInputs,buildSimpleNotionWorkflow} from './build-simple-notion-workflow.mjs';
import {fullPublicationSelection} from './build-raster-publication.mjs';
import {createDatabasePlan} from './database-plan.mjs';
import {createCompactImportSql} from './import-sql-compact.mjs';

const targets=['joplin','obsidian','simplenote'];
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function simpleNotionImportInputs(){const {baseline,review}=simpleNotionInputs();return {baseline,review,reviewed:buildSimpleNotionWorkflow(baseline,review).bundle};}
export function buildSimpleNotionImport(baseline,reviewed,review,{commit=false}={}){
 const canonical=buildSimpleNotionWorkflow(baseline,review).bundle;
 if(hash(canonical)!==hash(reviewed))throw Error('PR5.24 reviewed graph drift');
 const fullBefore=fullPublicationSelection(baseline,targets.filter(s=>s!=='simplenote'));
 const fullAfter=fullPublicationSelection(reviewed,targets);
 for(const b of [fullBefore,fullAfter])b.products.find(p=>p.slug==='obsidian').status='published';
 const before=createDatabasePlan(fullBefore),after=createDatabasePlan(fullAfter),taxonomy=createDatabasePlan(baseline);
 const guards=[];
 for(const a of after.tables){const b=before.tables.find(t=>t.table===a.table);
  for(const row of a.rows){const prior=['anchors','attributes','problems','audiences'].includes(a.table)?taxonomy.tables.find(t=>t.table===a.table):b;
   const old=prior.rows.find(r=>a.conflictColumns.every(k=>JSON.stringify(r[k])===JSON.stringify(row[k])))??null;
   guards.push({table:a.table,keys:a.conflictColumns,before:old,after:row});
  }
 }
 const bundle=structuredClone(fullAfter);
 for(const p of bundle.products){const candidate=review.candidates.find(c=>c.slug===p.slug);p.attributes=p.attributes.filter(a=>candidate.attributes.some(c=>c.slug===a.slug));p.anchors=p.anchors.filter(a=>a.slug==='notion'&&a.relationshipType==='alternative');p.problems=[];p.audiences=[];}
 for(const k of ['attributes','anchors','problems','audiences'])bundle[k]=bundle[k].filter(t=>bundle.products.some(p=>p[k].some(c=>c.slug===t.slug)));
 const needed=new Set(bundle.products.flatMap(p=>[...p.attributes,...p.anchors].flatMap(c=>c.evidence)));bundle.sources=bundle.sources.filter(s=>needed.has(s.key));
 const plan=createDatabasePlan(bundle);
 const allowedTables=['evidence_sources','products','product_attributes','product_anchors','claim_evidence','product_attribute_evidence','product_anchor_evidence'];
 const tables=plan.tables.filter(t=>allowedTables.includes(t.table)).map(t=>t.table==='products'?{...t,rows:t.rows.filter(r=>r.slug==='simplenote')}:t);
 const ownership={version:1,products:targets,routes:[],sources:[],taxonomy:{anchors:[],attributes:[],problems:[],audiences:[]}};
 let sql=createCompactImportSql(bundle,ownership,{commit});
 const counts=after.tables.filter(t=>t.table.startsWith('product_')).flatMap(a=>targets.map(slug=>({table:a.table,slug,before:before.tables.find(t=>t.table===a.table).rows.filter(r=>r.product_id.$ref.where.slug===slug).length,after:a.rows.filter(r=>r.product_id.$ref.where.slug===slug).length})));
 const original=JSON.stringify({tables:plan.tables,evidenceReplacements:plan.evidenceReplacements,routeMembershipReplacements:plan.routeMembershipReplacements,ownership});
 if(!sql.includes(original))throw Error('PR5.24 importer layout drift');
 sql=sql.replace(original,JSON.stringify({tables,evidenceReplacements:[],routeMembershipReplacements:[],ownership,guardRows:guards,guardCounts:counts}));
 const guardSql=`
  IF (SELECT count(*) FROM software_discovery.products WHERE status='published')<>10 OR (SELECT count(*) FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved)<>4 THEN RAISE EXCEPTION 'PR5.24 global accepted publication count drift'; END IF;
  IF NOT EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='simple-notion-alternatives' AND status='draft' AND NOT editorially_approved) THEN RAISE EXCEPTION 'PR5.24 requires existing unapproved Simple Notion route'; END IF;
  IF (SELECT count(*) FROM software_discovery.products WHERE slug IN ('obsidian','things','omnifocus','2do','affine','anytype','appflowy','gimp','krita','paint-net') AND status='published')<>10 THEN RAISE EXCEPTION 'PR5.24 published prerequisites mismatch'; END IF;
  IF (SELECT count(*) FROM software_discovery.escape_routes WHERE slug IN ('todoist-alternatives-with-a-one-time-purchase','offline-notion-alternatives','photoshop-alternatives-without-a-subscription','notion-alternatives-without-ai') AND status='published' AND editorially_approved)<>4 THEN RAISE EXCEPTION 'PR5.24 accepted routes mismatch'; END IF;
  IF EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='simple-notion-alternatives' AND (status<>'draft' OR editorially_approved)) THEN RAISE EXCEPTION 'PR5.24 Simple Notion route already exposed; fresh review required'; END IF;
  IF EXISTS(SELECT 1 FROM software_discovery.escape_route_products m JOIN software_discovery.products p ON p.id=m.product_id JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id WHERE p.slug IN ('joplin','obsidian','simplenote') AND r.status='published' AND r.editorially_approved) THEN RAISE EXCEPTION 'PR5.24 unexpected approved target route exposure'; END IF;
  FOR op IN SELECT value FROM jsonb_array_elements(data->'guardRows') LOOP
    t=op->>'table';input_data=op->'after';row_data='{}';bad=false;
    FOR k,v IN SELECT * FROM jsonb_each(input_data) LOOP
      IF v ? '$ref' THEN
        target_table=v->'$ref'->>'table';SELECT key,value INTO STRICT target_key,target_value FROM jsonb_each_text(v->'$ref'->'where');
        resolved_id=NULL;EXECUTE format('SELECT id FROM software_discovery.%I WHERE %I=$1',target_table,target_key) INTO resolved_id USING target_value;
        IF resolved_id IS NULL THEN bad=true; END IF;v=coalesce(to_jsonb(resolved_id),'null'::jsonb);
      END IF;
      row_data=row_data||jsonb_build_object(k,v);
    END LOOP;
    IF bad THEN
      IF op->'before'<>'null'::jsonb THEN RAISE EXCEPTION 'PR5.24 required reference missing'; END IF;
      CONTINUE;
    END IF;
    SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',value,value),' AND ') INTO key_condition FROM jsonb_array_elements_text(op->'keys');
    SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',key,key),' AND ') INTO match_condition FROM jsonb_object_keys(row_data) AS keys(key);
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s), EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s AND %s)',t,t,key_condition,t,t,key_condition,match_condition) INTO found_row,allowed USING row_data;
    IF NOT found_row AND op->'before'<>'null'::jsonb THEN RAISE EXCEPTION 'PR5.24 required baseline missing: %',t; END IF;
    IF found_row AND NOT allowed THEN
      IF op->'before'='null'::jsonb THEN RAISE EXCEPTION 'PR5.24 unexpected new evidence drift: %',t; END IF;
      input_data=op->'before';where_data='{}';
      FOR k,v IN SELECT * FROM jsonb_each(input_data) LOOP
        IF v ? '$ref' THEN
          target_table=v->'$ref'->>'table';SELECT key,value INTO STRICT target_key,target_value FROM jsonb_each_text(v->'$ref'->'where');
          EXECUTE format('SELECT id FROM software_discovery.%I WHERE %I=$1',target_table,target_key) INTO STRICT resolved_id USING target_value;v=to_jsonb(resolved_id);
        END IF;
        where_data=where_data||jsonb_build_object(k,v);
      END LOOP;
      SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',key,key),' AND ') INTO match_condition FROM jsonb_object_keys(where_data) AS keys(key);
      EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s)',t,t,match_condition) INTO allowed USING where_data;
      IF NOT allowed THEN RAISE EXCEPTION 'PR5.24 baseline drift: %',t; END IF;
    END IF;
  END LOOP;
  FOR op IN SELECT value FROM jsonb_array_elements(data->'guardCounts') LOOP
    SELECT id INTO resolved_id FROM software_discovery.products WHERE slug=op->>'slug'; IF resolved_id IS NULL THEN CONTINUE; END IF;
    EXECUTE format('SELECT count(*) FROM software_discovery.%I WHERE product_id=$1',op->>'table') INTO actual USING resolved_id;
    IF actual<>(op->>'before')::integer AND actual<>(op->>'after')::integer THEN RAISE EXCEPTION 'PR5.24 relationship/evidence set drift: %/%',op->>'table',op->>'slug'; END IF;
    expected=0;
    FOR replacement IN SELECT value FROM jsonb_array_elements(data->'guardRows') g WHERE g->>'table'=op->>'table' AND g->'after'->'product_id'->'$ref'->'where'->>'slug'=op->>'slug' LOOP
      row_data='{}';bad=false;
      FOR k,v IN SELECT * FROM jsonb_each(replacement->'after') LOOP
        IF v ? '$ref' THEN
          target_table=v->'$ref'->>'table';SELECT key,value INTO STRICT target_key,target_value FROM jsonb_each_text(v->'$ref'->'where');
          resolved_id=NULL;EXECUTE format('SELECT id FROM software_discovery.%I WHERE %I=$1',target_table,target_key) INTO resolved_id USING target_value;
          IF resolved_id IS NULL THEN bad=true; END IF;v=coalesce(to_jsonb(resolved_id),'null'::jsonb);
        END IF;
        row_data=row_data||jsonb_build_object(k,v);
      END LOOP;
      IF NOT bad THEN
        SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',value,value),' AND ') INTO key_condition FROM jsonb_array_elements_text(replacement->'keys');
        EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s)',op->>'table',op->>'table',key_condition) INTO found_row USING row_data;
        IF found_row THEN expected=expected+1; END IF;
      END IF;
    END LOOP;
    IF actual<>expected THEN RAISE EXCEPTION 'PR5.24 unreviewed relationship/evidence identity'; END IF;
  END LOOP;
`;
 const marker="  own=data->'ownership';";if(!sql.includes(marker))throw Error('PR5.24 guard layout drift');sql=sql.replace(marker,marker+guardSql);
 sql=sql.replace('-- PR3.2C SQL Editor fix: one self-contained atomic DO statement.','-- PR5.24 selective basic-note claims; preserve published Obsidian. No route/product publication.');
 const lockStart=sql.indexOf('  LOCK TABLE '),lockEnd=sql.indexOf(' IN SHARE ROW EXCLUSIVE MODE;',lockStart);
 sql=sql.slice(0,lockStart)+'  LOCK TABLE '+after.tables.map(t=>'software_discovery.'+t.table).join(',')+sql.slice(lockEnd);
 return {bundle,sql,report:{version:1,productSlugs:targets,newDraftProducts:1,existingProductWrites:0,attributeClaims:17,scopedAnchors:3,routes:0,publicationApproved:false,evidenceRemoval:false,mode:commit?'apply':'rollback-rehearsal',baselineSha256:hash(fullBefore),selectedSha256:hash(bundle),sqlSha256:hash(sql)}};
}
export function createSimpleNotionVerification(bundle){
 const claims=bundle.products.flatMap(p=>p.attributes.map(c=>({product:p.slug,attribute:c.slug,value:c.value,confidence:c.confidence,date:c.lastVerifiedAt})));
 const anchors=bundle.products.map(p=>({product:p.slug,...p.anchors[0]}));
 const links=bundle.products.flatMap(p=>['attributes','anchors'].flatMap(kind=>p[kind].flatMap(c=>c.evidence.map(source=>({product:p.slug,kind,slug:c.slug,source})))));
 const data=JSON.stringify({claims,anchors,links});
 return `-- PR5.24 read-only after APPLY: exactly ten true checks required.
WITH data AS (SELECT $verify$${data}$verify$::jsonb d),
expected_claims AS (SELECT c FROM data,jsonb_array_elements(d->'claims') c),
expected_anchors AS (SELECT c FROM data,jsonb_array_elements(d->'anchors') c),
expected_links AS (SELECT c FROM data,jsonb_array_elements(d->'links') c)
SELECT 'target_lifecycle_preserved' check_name,(SELECT count(*)=3 AND bool_and(status=CASE WHEN slug='obsidian' THEN 'published' ELSE 'draft' END) FROM software_discovery.products WHERE slug IN ('joplin','obsidian','simplenote')) passed
UNION ALL SELECT 'seventeen_exact_reviewed_attributes',(SELECT count(*)=17 AND bool_and(EXISTS(SELECT 1 FROM software_discovery.product_attributes a JOIN software_discovery.products p ON p.id=a.product_id JOIN software_discovery.attributes t ON t.id=a.attribute_id WHERE p.slug=c->>'product' AND t.slug=c->>'attribute' AND coalesce(to_jsonb(a.value_boolean),to_jsonb(a.value_text),to_jsonb(a.value_number),to_jsonb(a.value_enum))=c->'value' AND a.verification_status='verified' AND a.confidence=(c->>'confidence')::numeric AND a.last_verified_at=(c->>'date')::timestamptz)) FROM expected_claims)
UNION ALL SELECT 'three_exact_bounded_anchors',(SELECT count(*)=3 AND bool_and(EXISTS(SELECT 1 FROM software_discovery.product_anchors a JOIN software_discovery.products p ON p.id=a.product_id JOIN software_discovery.anchors t ON t.id=a.anchor_id WHERE p.slug=c->>'product' AND t.slug='notion' AND a.relationship_type='alternative' AND a.relationship_scope=c->>'scope' AND a.scope_description=c->>'scopeDescription' AND a.verification_status='verified' AND a.confidence=.85 AND a.last_verified_at=(c->>'lastVerifiedAt')::timestamptz)) FROM expected_anchors)
UNION ALL SELECT 'reviewed_and_historical_evidence_retained',(SELECT bool_and(CASE WHEN c->>'kind'='attributes' THEN EXISTS(SELECT 1 FROM software_discovery.product_attribute_evidence l JOIN software_discovery.products p ON p.id=l.product_id JOIN software_discovery.attributes a ON a.id=l.attribute_id JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources s ON s.id=e.evidence_source_id WHERE p.slug=c->>'product' AND a.slug=c->>'slug' AND s.seed_key=c->>'source') ELSE EXISTS(SELECT 1 FROM software_discovery.product_anchor_evidence l JOIN software_discovery.products p ON p.id=l.product_id JOIN software_discovery.anchors a ON a.id=l.anchor_id JOIN software_discovery.claim_evidence e ON e.id=l.claim_evidence_id JOIN software_discovery.evidence_sources s ON s.id=e.evidence_source_id WHERE p.slug=c->>'product' AND a.slug=c->>'slug' AND l.relationship_type='alternative' AND s.seed_key=c->>'source') END) FROM expected_links)
UNION ALL SELECT 'simple_route_remains_unapproved',EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='simple-notion-alternatives' AND status='draft' AND NOT editorially_approved)
UNION ALL SELECT 'ten_products_four_routes_preserved',(SELECT count(*)=10 FROM software_discovery.products WHERE status='published') AND (SELECT count(*)=4 FROM software_discovery.escape_routes WHERE status='published' AND editorially_approved)
UNION ALL SELECT 'draft_products_hidden_from_public_rpc',software_discovery.product_discovery_page('joplin') IS NULL AND software_discovery.product_discovery_page('simplenote') IS NULL
UNION ALL SELECT 'obsidian_public_scoped_projection',EXISTS(SELECT 1 FROM jsonb_array_elements(software_discovery.product_discovery_page('obsidian')->'anchors') a WHERE a->>'slug'='notion' AND a->>'scope'='personal-basic-note-capture-edit-organization' AND length(trim(a->>'description'))>0)
UNION ALL SELECT 'prior_offline_anchors_preserved',(SELECT count(*)=3 AND bool_and(c.relationship_scope='personal-offline-note-object-organization' AND c.verification_status='verified') FROM software_discovery.product_anchors c JOIN software_discovery.products p ON p.id=c.product_id JOIN software_discovery.anchors a ON a.id=c.anchor_id WHERE p.slug IN ('affine','appflowy','anytype') AND a.slug='notion' AND c.relationship_type='alternative')
UNION ALL SELECT 'anon_private_evidence_boundary',has_function_privilege('anon','software_discovery.product_discovery_page(text)','EXECUTE') AND NOT has_table_privilege('anon','software_discovery.claim_evidence','SELECT');
`;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('No arguments supported');const {baseline,reviewed,review}=simpleNotionImportInputs(),out=path.join(root,'.seed-output/simple-notion-import');fs.mkdirSync(out,{recursive:true});
  for(const commit of [false,true]){const r=buildSimpleNotionImport(baseline,reviewed,review,{commit});fs.writeFileSync(path.join(out,`PR5.24_${commit?'APPLY':'REHEARSE'}.sql`),r.sql);fs.writeFileSync(path.join(out,`${commit?'apply':'rehearse'}-report.json`),JSON.stringify(r.report,null,2)+'\n');}
  fs.writeFileSync(path.join(out,'PR5.24_VERIFY.sql'),createSimpleNotionVerification(buildSimpleNotionImport(baseline,reviewed,review).bundle));
  console.log('PR5.24: one new draft product; 17 attributes and three scoped anchors; published Obsidian retained. No route/publication or remote writes.');
 }catch(e){console.error(e.message);process.exitCode=1;}
}
