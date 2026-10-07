import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createDatabasePlan} from './database-plan.mjs';
import {createCompactImportSql} from './import-sql-compact.mjs';

const targets=['things','omnifocus','2do'];
const changedAttributes=['one-time-purchase','no-subscription','pricing-model','trade-off-summary'];
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function selectTodoistImport(input){
 const b=structuredClone(input);
 b.escapeRoutes=[];
 b.products=targets.map(slug=>{
  const p=b.products.find(p=>p.slug===slug);if(!p)throw new Error(`Missing target: ${slug}`);
  if(p.status!=='draft')throw new Error(`Target must remain draft: ${slug}`);
  if(slug!=='2do'){
   p.attributes=p.attributes.filter(c=>changedAttributes.includes(c.slug));
   p.anchors=p.anchors.filter(c=>c.slug==='todoist'&&c.relationshipType==='alternative');
   p.problems=[];p.audiences=[];
  }
  return p;
 });
 for(const collection of ['attributes','anchors','problems','audiences']){
  const used=new Set(b.products.flatMap(p=>p[collection].map(c=>c.slug)));
  b[collection]=b[collection].filter(n=>used.has(n.slug));
 }
 const usedSources=new Set(b.products.flatMap(p=>['attributes','anchors','problems','audiences'].flatMap(k=>p[k].flatMap(c=>c.evidence))));
 b.sources=b.sources.filter(s=>usedSources.has(s.key));
 createDatabasePlan(b);return b;
}

// Runs inside the compact import's locked DO block, before any mutation.
function guardSql(guards){
 const payload=JSON.stringify(guards);
 if(payload.includes('$pr58_guard$'))throw new Error('Invalid guard delimiter');
 return `
  FOR op IN SELECT value FROM jsonb_array_elements($pr58_guard$${payload}$pr58_guard$::jsonb) LOOP
    t=op->>'table';
    input_data=op->'after'; row_data='{}';
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
    IF NOT found_row AND op->'before' <> 'null'::jsonb THEN RAISE EXCEPTION 'PR5.8 required baseline row missing: %',t; END IF;
    IF found_row AND NOT allowed THEN
      IF op->'before' = 'null'::jsonb THEN RAISE EXCEPTION 'PR5.8 unexpected existing row: %',t; END IF;
      input_data=op->'before'; where_data='{}';
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
      IF NOT allowed THEN RAISE EXCEPTION 'PR5.8 baseline drift; import aborted: %',t; END IF;
    END IF;
  END LOOP;
  -- Preserve all existing evidence links, including earlier seed pointers.
`;
}

export function buildTodoistDraftImport(baseline,reviewed,review,{commit=false}={}){
 const bundle=selectTodoistImport(reviewed);
 const prior=structuredClone(baseline);prior.products=prior.products.filter(p=>['things','omnifocus'].includes(p.slug));prior.escapeRoutes=[];
 if(prior.products.length!==2||baseline.products.some(p=>p.slug==='2do'))throw new Error('Unexpected baseline identities');
 if(review.version!==1||review.humanPublicationApproval!==false||review.baselineSha256!==digest(prior)||review.selectedSha256!==digest(bundle))throw new Error('Reviewed input drift or approval mismatch');
 for(const p of bundle.products){
  const c=p.anchors.find(c=>c.slug==='todoist');
  if(c?.scope!=='personal-task-project-organization'||c.verificationStatus!=='verified')throw new Error('Required reviewed scope missing');
 }
 const before=createDatabasePlan(prior),after=createDatabasePlan(bundle);
 const guards=[];
 for(const table of ['products','product_attributes','product_anchors','product_problems','product_audiences']){
  const a=after.tables.find(t=>t.table===table),b=before.tables.find(t=>t.table===table);
  for(const row of a.rows){
   const old=b.rows.find(r=>a.conflictColumns.every(k=>JSON.stringify(r[k])===JSON.stringify(row[k])))??null;
   guards.push({table,keys:a.conflictColumns,before:old,after:row});
  }
 }
 // Ownership authorizes only rows in this small bundle. No route ownership.
 const ownership={version:1,products:targets,routes:[],sources:[],taxonomy:{anchors:[],attributes:[],problems:[],audiences:[]}};
 let sql=createCompactImportSql(bundle,ownership,{commit});
 const marker="  own=data->'ownership';";
 if(!sql.includes(marker))throw new Error('Importer layout changed; cannot install guards');
 sql=sql.replace(marker,marker+guardSql(guards));
 // This packet adds reviewed sources without deleting historical/manual links.
 // Disable replacement loops in the embedded plan; other imports keep their policy.
 const plan=createDatabasePlan(bundle);
 const original=JSON.stringify({tables:plan.tables,evidenceReplacements:plan.evidenceReplacements,routeMembershipReplacements:plan.routeMembershipReplacements,ownership});
 const preserved=JSON.stringify({tables:plan.tables,evidenceReplacements:[],routeMembershipReplacements:[],ownership});
 if(!sql.includes(original))throw new Error('Importer payload changed');
 sql=sql.replace(original,preserved).replace('-- PR3.2C SQL Editor fix: one self-contained atomic DO statement.','-- PR5.8 selective draft import: Things/OmniFocus reviewed claims and new 2Do only.\n-- No product publication, route import, or evidence-link removal.');
 return {bundle,sql,report:{version:1,productSlugs:targets,productStatuses:bundle.products.map(p=>({slug:p.slug,status:p.status})),existingProductAttributeClaims:8,existingAnchorUpdates:2,newProducts:1,routes:0,humanPublicationApproval:false,baselineSha256:review.baselineSha256,selectedSha256:review.selectedSha256,sqlSha256:createHash('sha256').update(sql).digest('hex'),mode:commit?'apply':'rollback-rehearsal'}};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  if(process.argv.length!==2)throw new Error('This generator takes no arguments; generate both rehearsal/apply for review.');
  const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  const baseline=read('.seed-output/editorial-fit/reviewed-five-ecosystems.json'),reviewed=read('.seed-output/escape-draft/bundle.json'),review=read('seed/research/todoist-draft-import-2026-10-07.json');
  const out='.seed-output/todoist-draft-import';fs.mkdirSync(out,{recursive:true});
  for(const commit of [false,true]){
   const result=buildTodoistDraftImport(baseline,reviewed,review,{commit});
   fs.writeFileSync(`${out}/${commit?'PR5.8_APPLY':'PR5.8_REHEARSE'}.sql`,result.sql);
   fs.writeFileSync(`${out}/${commit?'apply':'rehearse'}-report.json`,JSON.stringify(result.report,null,2)+'\n');
   if(commit)fs.writeFileSync(`${out}/selected-bundle.json`,JSON.stringify(result.bundle,null,2)+'\n');
  }
  console.log('PR5.8: 3 draft products; 10 existing claim updates; no routes/publication. Rehearsal/apply SQL generated locally; no database writes.');
 }catch(error){console.error(error.message);process.exitCode=1;}
}
