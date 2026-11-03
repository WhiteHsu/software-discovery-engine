import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {buildAccountFreeImport} from './seed/build-account-free-import.mjs';
const {PGlite}=await import(process.env.ACCOUNT_FREE_PG_MODULE??'@electric-sql/pglite');
const {pgcrypto}=await import(process.env.ACCOUNT_FREE_PG_CRYPTO??'@electric-sql/pglite/contrib/pgcrypto');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const schemaRoot=process.env.ACCOUNT_FREE_SCHEMA_ROOT??root;
const read=p=>fs.readFileSync(path.join(schemaRoot,p),'utf8');
const baseline=JSON.parse(fs.readFileSync(path.join(root,'seed/research/account-free-baseline-2026-11-02.json'),'utf8').replace(/^\uFEFF/,''));
const built=buildAccountFreeImport(),db=new PGlite({extensions:{pgcrypto}});
const tables=['products','attributes','product_attributes','product_anchors','product_audiences','product_problems','escape_routes','escape_route_products','evidence_sources','claim_evidence','product_attribute_evidence'];
const snapshot=async()=>{const data={};for(const t of tables)data[t]=(await db.query(`SELECT to_jsonb(t) r FROM software_discovery.${t} t ORDER BY to_jsonb(t)::text`)).rows.map(r=>r.r);return data;};
const insert=async(t,row)=>{const cols=Object.keys(row).map(k=>'"'+k+'"').join(',');await db.query(`INSERT INTO software_discovery.${t} (${cols}) SELECT ${cols} FROM jsonb_populate_record(NULL::software_discovery.${t},$1)`,[JSON.stringify(row)]);};
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log('PASS '+name);};
try{
 await db.exec('CREATE SCHEMA extensions; CREATE SCHEMA software_discovery; CREATE ROLE anon; CREATE ROLE authenticated;');
 for(const name of ['202610050001_core_graph_nodes.sql','202610050002_evidence_verification_foundation.sql','202610050003_graph_relationships_escape_routes.sql','202610050004_security_data_api_boundary.sql','202610060001_seed_claim_evidence_mapping.sql','202610060002_product_discovery_page.sql','202610070001_anchor_relationship_scope.sql'])await db.exec(read('supabase/migrations/'+name));
 for(const p of baseline.products)await insert('products',p);
 for(const a of baseline.attribute_taxonomy)await insert('attributes',a);
 for(const a of baseline.product_attributes){if(!(await db.query('SELECT 1 FROM software_discovery.attributes WHERE id=$1',[a.attribute_id])).rows.length)await insert('attributes',{id:a.attribute_id,slug:'fixture-'+a.attribute_id,name:'Baseline fixture attribute',category:'fixture',value_type:a.value_boolean!==null?'boolean':'text'});await insert('product_attributes',a);}
 // Include unrelated publication and manual provenance so preservation checks are non-vacuous.
 await db.exec("INSERT INTO software_discovery.products(slug,name,status) VALUES('unrelated-product','Unrelated','published'); INSERT INTO software_discovery.escape_routes(slug,name,status,editorially_approved) VALUES('unrelated-route','Unrelated','published',true); INSERT INTO software_discovery.escape_route_products(escape_route_id,product_id) SELECT r.id,p.id FROM software_discovery.escape_routes r,software_discovery.products p WHERE r.slug='unrelated-route' AND p.slug='unrelated-product'; INSERT INTO software_discovery.evidence_sources(id,source_type,title,url) VALUES('00000000-0000-4000-8000-000000000001','manual','Historical manual provenance','https://example.org/old'); INSERT INTO software_discovery.claim_evidence(id,evidence_source_id,notes) VALUES('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','Preserve this historical note')");
 const first=baseline.product_attributes[0];await db.query("INSERT INTO software_discovery.product_attribute_evidence(product_id,attribute_id,claim_evidence_id) VALUES($1,$2,'00000000-0000-4000-8000-000000000002')",[first.product_id,first.attribute_id]);
 const before=await snapshot();
 await check('rehearsal rolls back every inserted row',async()=>{await db.exec(built.rehearse);assert.deepEqual(await snapshot(),before);});
 await check('apply retains all existing product metadata and claim rows',async()=>{await db.exec(built.apply);const after=await snapshot();for(const t of tables)for(const row of before[t])assert.ok(after[t].some(r=>JSON.stringify(r)===JSON.stringify(row)),t);assert.equal(after.products.length,before.products.length+1);assert.equal(after.product_attributes.length,before.product_attributes.length+4);});
 const applied=await snapshot();
 await check('repeat apply preserves IDs and timestamps exactly',async()=>{await db.exec(built.apply);assert.deepEqual(await snapshot(),applied);});
 await check('all eleven shipped verification checks pass and public role cannot see drafts',async()=>{const rows=(await db.query(built.verify)).rows;assert.equal(rows.length,11);assert.ok(rows.every(r=>r.passed),JSON.stringify(rows));await db.exec('SET ROLE anon');assert.equal((await db.query("SELECT * FROM software_discovery.products WHERE slug='standard-notes'")).rows.length,0);assert.equal((await db.query("SELECT * FROM software_discovery.escape_routes WHERE slug='account-free-note-taking-apps'")).rows.length,0);await db.exec('RESET ROLE');});
 await check('later editorial changes abort apply and rollback without collateral changes',async()=>{await db.exec("UPDATE software_discovery.products SET name='Later edit' WHERE slug='standard-notes'");const edited=await snapshot();await assert.rejects(db.exec(built.apply),/conflicting or edited/);assert.deepEqual(await snapshot(),edited);await assert.rejects(db.exec(built.rollback),/conflicting or edited/);assert.deepEqual(await snapshot(),edited);await db.exec("UPDATE software_discovery.products SET name='Standard Notes' WHERE slug='standard-notes'");});
 await check('existing-product drift aborts before any changes',async()=>{await db.exec("UPDATE software_discovery.products SET short_description='Changed baseline' WHERE slug='obsidian'");const edited=await snapshot();await assert.rejects(db.exec(built.apply),/baseline drift/);assert.deepEqual(await snapshot(),edited);await db.query('UPDATE software_discovery.products SET short_description=$1 WHERE slug=$2',[baseline.products.find(p=>p.slug==='obsidian').short_description,'obsidian']);});
 await check('later membership prevents rollback and is retained',async()=>{await db.exec("INSERT INTO software_discovery.escape_routes(slug,name) VALUES('later-route','Later route');INSERT INTO software_discovery.escape_route_products(escape_route_id,product_id) SELECT r.id,p.id FROM software_discovery.escape_routes r,software_discovery.products p WHERE r.slug='later-route' AND p.slug='standard-notes'");const edited=await snapshot();await assert.rejects(db.exec(built.rollback),/gained claims or memberships/);assert.deepEqual(await snapshot(),edited);await db.exec("DELETE FROM software_discovery.escape_routes WHERE slug='later-route'");});
 await check('guarded rollback restores original rows and source counts',async()=>{await db.exec(built.rollback);assert.deepEqual(await snapshot(),before);});
 await check('conflicting preexisting route cannot be overwritten',async()=>{await db.exec("INSERT INTO software_discovery.escape_routes(slug,name) VALUES('account-free-note-taking-apps','Someone else draft')");const edited=await snapshot();await assert.rejects(db.exec(built.apply),/conflicting or edited/);assert.deepEqual(await snapshot(),edited);});
 console.log(`${checks} database integration checks passed.`);
}finally{await db.close();}
