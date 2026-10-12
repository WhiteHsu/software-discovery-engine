import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {notionAiBaseline,buildNotionAiWorkflow} from './build-notion-ai-workflow.mjs';
import {fullPublicationSelection} from './build-raster-publication.mjs';
import {createDatabasePlan} from './database-plan.mjs';
import {createCompactImportSql} from './import-sql-compact.mjs';
import {offlineWorkflowBaseline} from './build-offline-workflow.mjs';

const targets=['affine','appflowy','anytype'];
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,''));
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function notionAiImportInputs(){
 const baseline=notionAiBaseline(),review=read('seed/research/notion-ai-review-2026-10-12.json');
 return {baseline,reviewed:buildNotionAiWorkflow(baseline,review).bundle,review};
}
export function buildNotionAiImport(baseline,reviewed,review,{commit=false}={}){
 const canonical=buildNotionAiWorkflow(baseline,review).bundle;
 if(hash(canonical)!==hash(reviewed))throw Error('PR5.19 reviewed graph drift');
 const fullBefore=fullPublicationSelection(baseline,targets),fullAfter=fullPublicationSelection(reviewed,targets);
 for(const b of [fullBefore,fullAfter])for(const p of b.products)p.status='published';
 const before=createDatabasePlan(fullBefore),after=createDatabasePlan(fullAfter);
 // PR5.12 retained baseline source pointers even where the reviewed fixture replaced its evidence list.
 const historical=createDatabasePlan(fullPublicationSelection(offlineWorkflowBaseline().baseline,targets));
 for(const plan of [before,after])for(const op of plan.tables)if(op.table==='evidence_sources'||op.table==='claim_evidence'||op.table.endsWith('_evidence')){
  const rows=new Map(op.rows.map(r=>[JSON.stringify(op.conflictColumns.map(k=>r[k])),r]));
  for(const r of historical.tables.find(t=>t.table===op.table).rows){const key=JSON.stringify(op.conflictColumns.map(k=>r[k]));if(!rows.has(key))rows.set(key,r);}
  op.rows=[...rows.values()];
 }
 const guards=[];
 for(const a of after.tables){const b=before.tables.find(t=>t.table===a.table);
  for(const row of a.rows){const old=b.rows.find(r=>a.conflictColumns.every(k=>JSON.stringify(r[k])===JSON.stringify(row[k])))??null;
   guards.push({table:a.table,keys:a.conflictColumns,before:old,after:row});
  }
 }
 const bundle=structuredClone(fullAfter);
 for(const p of bundle.products){p.attributes=p.attributes.filter(a=>a.slug==='ai-optional');p.anchors=[];p.problems=[];p.audiences=[];}
 bundle.attributes=bundle.attributes.filter(a=>a.slug==='ai-optional');bundle.anchors=[];bundle.problems=[];bundle.audiences=[];
 const needed=new Set(bundle.products.flatMap(p=>p.attributes.flatMap(a=>a.evidence)));bundle.sources=bundle.sources.filter(s=>needed.has(s.key));
 const plan=createDatabasePlan(bundle);
 // Limit executable writes to the three claims and their source pointers; no product/taxonomy/route upserts.
 const tables=plan.tables.filter(t=>['evidence_sources','product_attributes','claim_evidence','product_attribute_evidence'].includes(t.table));
 const ownership={version:1,products:targets,routes:[],sources:[],taxonomy:{anchors:[],attributes:[],problems:[],audiences:[]}};
 let sql=createCompactImportSql(bundle,ownership,{commit});
 const original=JSON.stringify({tables:plan.tables,evidenceReplacements:plan.evidenceReplacements,routeMembershipReplacements:plan.routeMembershipReplacements,ownership});
 if(!sql.includes(original))throw Error('PR5.19 importer layout drift');
 sql=sql.replace(original,JSON.stringify({tables,evidenceReplacements:[],routeMembershipReplacements:[],ownership}));
 const counts=after.tables.filter(t=>t.table.startsWith('product_')).flatMap(a=>targets.map(slug=>({table:a.table,slug,before:before.tables.find(t=>t.table===a.table).rows.filter(r=>r.product_id.$ref.where.slug===slug).length,after:a.rows.filter(r=>r.product_id.$ref.where.slug===slug).length})));
 const guardSql=`
  IF (SELECT count(*) FROM software_discovery.products WHERE slug IN ('obsidian','things','omnifocus','2do','affine','anytype','appflowy','gimp','krita','paint-net') AND status='published')<>10 THEN RAISE EXCEPTION 'PR5.19 published prerequisites mismatch'; END IF;
  IF (SELECT count(*) FROM software_discovery.escape_routes WHERE slug IN ('todoist-alternatives-with-a-one-time-purchase','offline-notion-alternatives','photoshop-alternatives-without-a-subscription') AND status='published' AND editorially_approved)<>3 THEN RAISE EXCEPTION 'PR5.19 accepted routes mismatch'; END IF;
  IF EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='notion-alternatives-without-ai' AND (status<>'draft' OR editorially_approved)) THEN RAISE EXCEPTION 'PR5.19 no-AI route already exposed; fresh review required'; END IF;
  IF EXISTS(SELECT 1 FROM software_discovery.escape_route_products m JOIN software_discovery.products p ON p.id=m.product_id JOIN software_discovery.escape_routes r ON r.id=m.escape_route_id WHERE p.slug IN ('affine','appflowy','anytype') AND r.status='published' AND r.editorially_approved AND r.slug<>'offline-notion-alternatives') THEN RAISE EXCEPTION 'PR5.19 unexpected approved target route exposure'; END IF;
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
      IF op->'before'<>'null'::jsonb THEN RAISE EXCEPTION 'PR5.19 required reference missing'; END IF;
      CONTINUE;
    END IF;
    SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',value,value),' AND ') INTO key_condition FROM jsonb_array_elements_text(op->'keys');
    SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',key,key),' AND ') INTO match_condition FROM jsonb_object_keys(row_data) AS keys(key);
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s), EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s AND %s)',t,t,key_condition,t,t,key_condition,match_condition) INTO found_row,allowed USING row_data;
    IF NOT found_row AND op->'before'<>'null'::jsonb THEN RAISE EXCEPTION 'PR5.19 required baseline missing: %',t; END IF;
    IF found_row AND NOT allowed THEN
      IF op->'before'='null'::jsonb THEN RAISE EXCEPTION 'PR5.19 unexpected new evidence drift: %',t; END IF;
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
      IF NOT allowed THEN RAISE EXCEPTION 'PR5.19 baseline drift: %',t; END IF;
    END IF;
  END LOOP;
  FOR op IN SELECT value FROM jsonb_array_elements(data->'guardCounts') LOOP
    SELECT id INTO STRICT resolved_id FROM software_discovery.products WHERE slug=op->>'slug';
    EXECUTE format('SELECT count(*) FROM software_discovery.%I WHERE product_id=$1',op->>'table') INTO actual USING resolved_id;
    IF actual<>(op->>'before')::integer AND actual<>(op->>'after')::integer THEN RAISE EXCEPTION 'PR5.19 relationship/evidence set drift: %/%',op->>'table',op->>'slug'; END IF;
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
    IF actual<>expected THEN RAISE EXCEPTION 'PR5.19 unreviewed relationship/evidence identity'; END IF;
  END LOOP;
`;
 const marker="  own=data->'ownership';";if(!sql.includes(marker))throw Error('PR5.19 guard layout drift');
 sql=sql.replace(marker,marker+guardSql).replace('-- PR3.2C SQL Editor fix: one self-contained atomic DO statement.','-- PR5.19: update three AI Optional claims on already-published products; retain historical evidence. No route publication.');
 sql=sql.replace(JSON.stringify({tables,evidenceReplacements:[],routeMembershipReplacements:[],ownership}),JSON.stringify({tables,evidenceReplacements:[],routeMembershipReplacements:[],ownership,guardRows:guards,guardCounts:counts}));
 // Guarded tables are locked along with the mutation tables by the existing importer.
 const lockStart=sql.indexOf('  LOCK TABLE '),lockEnd=sql.indexOf(' IN SHARE ROW EXCLUSIVE MODE;',lockStart);
 sql=sql.slice(0,lockStart)+'  LOCK TABLE '+after.tables.map(t=>'software_discovery.'+t.table).join(',')+sql.slice(lockEnd);
 return {bundle,sql,report:{version:1,productSlugs:targets,attributeClaims:3,anchorUpdates:0,productWrites:0,routes:0,publicationApproved:false,mode:commit?'apply':'rollback-rehearsal',baselineSha256:hash(fullBefore),reviewedSha256:hash(fullAfter),sqlSha256:hash(sql)}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('No arguments supported');const {baseline,reviewed,review}=notionAiImportInputs(),out=path.join(root,'.seed-output/notion-ai-import');fs.mkdirSync(out,{recursive:true});
  for(const commit of [false,true]){const r=buildNotionAiImport(baseline,reviewed,review,{commit});fs.writeFileSync(path.join(out,`PR5.19_${commit?'APPLY':'REHEARSE'}.sql`),r.sql);fs.writeFileSync(path.join(out,`${commit?'apply':'rehearse'}-report.json`),JSON.stringify(r.report,null,2)+'\n');}
  console.log('PR5.19: three AI attributes on published products; zero product, anchor or route writes. SQL generated locally; no remote writes.');
 }catch(e){console.error(e.message);process.exitCode=1;}
}
