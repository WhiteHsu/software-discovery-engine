import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {offlineWorkflowBaseline,buildOfflineWorkflow} from './build-offline-workflow.mjs';
import {createDatabasePlan} from './database-plan.mjs';
import {createCompactImportSql} from './import-sql-compact.mjs';

const targets=['affine','appflowy','anytype'];
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
export function selectOfflineImport(input){
 const b=structuredClone(input);b.escapeRoutes=[];
 b.products=targets.map(slug=>{
  const p=b.products.find(p=>p.slug===slug);if(!p||p.status!=='draft')throw Error(`Required draft target: ${slug}`);
  p.attributes=p.attributes.filter(c=>['works-offline','pricing-model','trade-off-summary'].includes(c.slug));
  p.anchors=p.anchors.filter(c=>c.slug==='notion'&&c.relationshipType==='alternative');p.audiences=[];p.problems=[];
  if(p.attributes.length!==3||p.anchors.length!==1||p.anchors[0].scope!=='personal-offline-note-object-organization')throw Error('Required offline claims/scope missing');
  return p;
 });
 for(const collection of ['attributes','anchors','problems','audiences']){const used=new Set(b.products.flatMap(p=>p[collection].map(c=>c.slug)));b[collection]=b[collection].filter(c=>used.has(c.slug));}
 const used=new Set(b.products.flatMap(p=>[...p.attributes,...p.anchors].flatMap(c=>c.evidence)));b.sources=b.sources.filter(s=>used.has(s.key));
 createDatabasePlan(b);return b;
}

function guardsSql(guards){
 const payload=JSON.stringify(guards);if(payload.includes('$pr512_guard$'))throw Error('Invalid guard delimiter');
 return `
  IF (SELECT count(*) FROM software_discovery.products WHERE slug IN ('obsidian','things','omnifocus','2do') AND status='published')<>4 THEN RAISE EXCEPTION 'PR5.12 requires accepted PR5.9 published products'; END IF;
  IF NOT EXISTS(SELECT 1 FROM software_discovery.escape_routes WHERE slug='todoist-alternatives-with-a-one-time-purchase' AND status='published' AND editorially_approved) THEN RAISE EXCEPTION 'PR5.12 requires accepted Todoist route'; END IF;
  FOR op IN SELECT value FROM jsonb_array_elements($pr512_guard$${payload}$pr512_guard$::jsonb) LOOP
    t=op->>'table';input_data=op->'after';row_data='{}';
    FOR k,v IN SELECT * FROM jsonb_each(input_data) LOOP
      IF v ? '$ref' THEN
        target_table=v->'$ref'->>'table';
        SELECT key,value INTO STRICT target_key,target_value FROM jsonb_each_text(v->'$ref'->'where');
        resolved_id=NULL;
        EXECUTE format('SELECT id FROM software_discovery.%I WHERE %I=$1',target_table,target_key) INTO resolved_id USING target_value;
        v=coalesce(to_jsonb(resolved_id),'null'::jsonb);
      END IF;
      row_data=row_data||jsonb_build_object(k,v);
    END LOOP;
    SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',value,value),' AND ') INTO key_condition FROM jsonb_array_elements_text(op->'keys');
    SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',key,key),' AND ') INTO match_condition FROM jsonb_object_keys(row_data) AS keys(key);
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s), EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s AND %s)',t,t,key_condition,t,t,key_condition,match_condition) INTO found_row,allowed USING row_data;
    IF NOT found_row AND op->'before'<>'null'::jsonb THEN RAISE EXCEPTION 'PR5.12 required baseline row missing: %',t; END IF;
    IF found_row AND NOT allowed THEN
      IF op->'before'='null'::jsonb THEN RAISE EXCEPTION 'PR5.12 unexpected existing row: %',t; END IF;
      input_data=op->'before';where_data='{}';
      FOR k,v IN SELECT * FROM jsonb_each(input_data) LOOP
        IF v ? '$ref' THEN
          target_table=v->'$ref'->>'table';
          SELECT key,value INTO STRICT target_key,target_value FROM jsonb_each_text(v->'$ref'->'where');
          EXECUTE format('SELECT id FROM software_discovery.%I WHERE %I=$1',target_table,target_key) INTO STRICT resolved_id USING target_value;
          v=to_jsonb(resolved_id);
        END IF;
        where_data=where_data||jsonb_build_object(k,v);
      END LOOP;
      SELECT string_agg(format('target.%I IS NOT DISTINCT FROM source.%I',key,key),' AND ') INTO match_condition FROM jsonb_object_keys(where_data) AS keys(key);
      EXECUTE format('SELECT EXISTS(SELECT 1 FROM software_discovery.%I target CROSS JOIN jsonb_populate_record(NULL::software_discovery.%I,$1) source WHERE %s)',t,t,match_condition) INTO allowed USING where_data;
      IF NOT allowed THEN RAISE EXCEPTION 'PR5.12 baseline drift; import aborted: %',t; END IF;
    END IF;
  END LOOP;
`;
}

export function buildOfflineDraftImport(baseline,reviewed,review,{commit=false}={}){
 const bundle=selectOfflineImport(reviewed),prior=structuredClone(baseline);prior.products=prior.products.filter(p=>targets.includes(p.slug));prior.escapeRoutes=[];
 if(prior.products.length!==3||review.version!==1||review.publicationApproved!==false||review.baselineSha256!==digest(prior)||review.selectedSha256!==digest(bundle))throw Error('Offline import reviewed input drift');
 const before=createDatabasePlan(prior),after=createDatabasePlan(bundle),guards=[];
 for(const table of ['products','product_attributes','product_anchors']){
  const a=after.tables.find(t=>t.table===table),b=before.tables.find(t=>t.table===table);
  for(const row of a.rows){const old=b.rows.find(r=>a.conflictColumns.every(k=>JSON.stringify(r[k])===JSON.stringify(row[k])))??null;guards.push({table,keys:a.conflictColumns,before:old,after:row});}
 }
 const ownership={version:1,products:targets,routes:[],sources:[],taxonomy:{anchors:[],attributes:[],problems:[],audiences:[]}};
 let sql=createCompactImportSql(bundle,ownership,{commit});const marker="  own=data->'ownership';";
 if(!sql.includes(marker))throw Error('Importer guard layout changed');sql=sql.replace(marker,marker+guardsSql(guards));
 const plan=createDatabasePlan(bundle),original=JSON.stringify({tables:plan.tables,evidenceReplacements:plan.evidenceReplacements,routeMembershipReplacements:plan.routeMembershipReplacements,ownership});
 if(!sql.includes(original))throw Error('Importer payload changed');
 sql=sql.replace(original,JSON.stringify({tables:plan.tables,evidenceReplacements:[],routeMembershipReplacements:[],ownership})).replace('-- PR3.2C SQL Editor fix: one self-contained atomic DO statement.','-- PR5.12 selective offline draft claims only; no product/route publication or evidence removal.');
 return {bundle,sql,report:{version:1,productSlugs:targets,attributeClaims:9,scopedAnchors:3,routes:0,newProducts:0,publicationApproved:false,mode:commit?'apply':'rollback-rehearsal',baselineSha256:review.baselineSha256,selectedSha256:review.selectedSha256,sqlSha256:digest(sql)}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  if(process.argv.length!==2)throw Error('No arguments supported');
  const {baseline,bundle}=offlineWorkflowBaseline(),reviewed=buildOfflineWorkflow(bundle,read('seed/research/offline-workflow-review-2026-10-08.json')).bundle;
  const review=read('seed/research/offline-draft-import-2026-10-12.json'),out=path.join(root,'.seed-output/offline-draft-import');fs.mkdirSync(out,{recursive:true});
  for(const commit of [false,true]){const r=buildOfflineDraftImport(baseline,reviewed,review,{commit});fs.writeFileSync(path.join(out,`PR5.12_${commit?'APPLY':'REHEARSE'}.sql`),r.sql);fs.writeFileSync(path.join(out,`${commit?'apply':'rehearse'}-report.json`),JSON.stringify(r.report,null,2)+'\n');}
  console.log('PR5.12: three existing draft products; nine attribute claims and three scoped anchors; no routes/publication. SQL generated locally; no database writes.');
 }catch(error){console.error(error.message);process.exitCode=1;}
}
