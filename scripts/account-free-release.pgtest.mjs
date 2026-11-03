import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {buildAccountFreeRelease} from './seed/build-account-free-release.mjs';
import {buildAccountFreeImport} from './seed/build-account-free-import.mjs';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
import {rankEscapeCandidates} from '../lib/discovery/privacy-route.ts';
import {searchGraph} from '../lib/discovery/search-graph.ts';
import {localizedReady} from '../lib/i18n/localized.ts';
import {localizedProductReady} from '../lib/i18n/product-localized.ts';
import {localizeSearchResult} from '../lib/i18n/search-localized.ts';
const {PGlite}=await import(process.env.ACCOUNT_FREE_PG_MODULE??'@electric-sql/pglite');
const {pgcrypto}=await import(process.env.ACCOUNT_FREE_PG_CRYPTO??'@electric-sql/pglite/contrib/pgcrypto');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,'');
const baseline=JSON.parse(read('seed/research/account-free-baseline-2026-11-02.json'));
const release=buildAccountFreeRelease(),draft=buildAccountFreeImport(),db=new PGlite({extensions:{pgcrypto}});
const snapshot=async()=>{const result={};for(const {tablename:t} of (await db.query("SELECT tablename FROM pg_tables WHERE schemaname='software_discovery' ORDER BY tablename")).rows)result[t]=(await db.query(`SELECT to_jsonb(t) r FROM software_discovery.${t} t ORDER BY to_jsonb(t)::text`)).rows.map(r=>r.r);return result;};
const insert=async(t,row)=>{const cols=Object.keys(row).map(k=>'"'+k+'"').join(',');await db.query(`INSERT INTO software_discovery.${t} (${cols}) SELECT ${cols} FROM jsonb_populate_record(NULL::software_discovery.${t},$1)`,[JSON.stringify(row)]);};
let checks=0;const check=async(name,fn)=>{await fn();checks++;console.log('PASS '+name);};
const event=(surface,path,extra={})=>({version:2,eventId:randomUUID(),sessionId:randomUUID(),pageViewId:randomUUID(),occurredAt:new Date().toISOString(),name:surface==='escape'?'escape_route_viewed':'page_viewed',surface,path,...extra});
const ingest=async e=>db.query('SELECT software_discovery.ingest_discovery_events_v2($1::jsonb,$2) r',[JSON.stringify([e]),'a'.repeat(64)]);
try{
 await db.exec('CREATE SCHEMA extensions; CREATE SCHEMA software_discovery; CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
 for(const f of fs.readdirSync(path.join(root,'supabase/migrations')).filter(f=>f.endsWith('.sql')&&f<'202610190001').sort())await db.exec(read('supabase/migrations/'+f));
 // Install real storage/function DDL in a synthetic empty fixture. Historical
 // rollout guards require old production counts/cron and are not this test's subject.
 for(const f of ['202610190001_private_discovery_events.sql','202610220001_discovery_events_v2.sql']){const text=read('supabase/migrations/'+f),start=text.indexOf('CREATE TABLE');if(start<0)throw Error('Storage fixture DDL missing');await db.exec('BEGIN;'+text.slice(start));}
 for(const f of fs.readdirSync(path.join(root,'supabase/migrations')).filter(f=>f>='202610270001'&&f<'202611030001').sort())await db.exec(read('supabase/migrations/'+f));
 for(const p of baseline.products)await insert('products',p);
 for(const a of baseline.attribute_taxonomy)await insert('attributes',a);
 for(const a of baseline.product_attributes){if(!(await db.query('SELECT 1 FROM software_discovery.attributes WHERE id=$1',[a.attribute_id])).rows.length)await insert('attributes',{id:a.attribute_id,slug:'fixture-'+a.attribute_id,name:'Baseline fixture attribute',category:'fixture',value_type:a.value_boolean!==null?'boolean':'text'});await insert('product_attributes',a);}
 for(const item of baseline.public_product_pages.filter(x=>x.page))for(const c of item.page.attributes){const a=baseline.attribute_taxonomy.find(a=>a.slug===c.slug);if(!a)continue;const productId=baseline.products.find(p=>p.slug===item.slug).id;for(const s of c.sources){const sourceId=randomUUID(),claimId=randomUUID();await insert('evidence_sources',{id:sourceId,source_type:'documentation',title:s.title,url:s.url,retrieved_at:s.retrievedAt});await insert('claim_evidence',{id:claimId,evidence_source_id:sourceId,notes:'Historical manual source fixture; preserve'});await insert('product_attribute_evidence',{product_id:productId,attribute_id:a.id,claim_evidence_id:claimId});}}
 await db.exec(draft.apply);const before=await snapshot();
 await check('publication blocked until exact collector patch is ready',async()=>{await assert.rejects(db.exec(release.apply),/analytics patch/);assert.deepEqual(await snapshot(),before);});
 await check('analytics patch changes only the exact function body and is idempotent',async()=>{await db.exec(release.analyticsApply);assert.deepEqual(await snapshot(),before);const metadata=(await db.query("SELECT prosrc,proacl,proowner,prosecdef,proconfig FROM pg_proc WHERE oid='software_discovery.ingest_discovery_events_v2(jsonb,text)'::regprocedure")).rows;await db.exec(release.analyticsApply);assert.deepEqual((await db.query("SELECT prosrc,proacl,proowner,prosecdef,proconfig FROM pg_proc WHERE oid='software_discovery.ingest_discovery_events_v2(jsonb,text)'::regprocedure")).rows,metadata);});
 await check('patched collector still rejects draft route and draft Standard Notes',async()=>{await assert.rejects(ingest(event('escape','/zh-hant/escape/account-free-note-taking-apps',{routeSlug:'account-free-note-taking-apps'})),/Unpublished route/);await assert.rejects(ingest(event('product','/zh-hant/software/standard-notes',{productSlug:'standard-notes'})),/Unpublished product/);assert.deepEqual(await snapshot(),before);});
 await check('publication rehearsal restores every row',async()=>{await db.exec(release.rehearse);assert.deepEqual(await snapshot(),before);});
 await check('publication retains every old record and gives three eligible localized candidates',async()=>{await db.exec(release.apply);const after=await snapshot();for(const [t,rows] of Object.entries(before))for(const r of rows){if(t==='products'&&r.slug==='standard-notes'||t==='escape_routes'&&r.slug==='account-free-note-taking-apps')continue;assert.ok(after[t].some(x=>JSON.stringify(x)===JSON.stringify(r)),t);}
  const products=[];for(const slug of ['affine','obsidian','standard-notes'])products.push((await db.query('SELECT software_discovery.product_discovery_page($1) p',[slug])).rows[0].p);
  const r=(await db.query("SELECT * FROM software_discovery.escape_routes WHERE slug='account-free-note-taking-apps'")).rows[0],def=escapeDefinitions.find(d=>d.slug===r.slug),page={slug:r.slug,name:r.name,description:r.description,published:true,lastVerifiedAt:r.last_verified_at,candidates:rankEscapeCandidates(def,products.map(product=>({product,noveltyScore:0})))};
  assert.ok(page.candidates.every(c=>c.eligible));assert.ok(localizedReady(page));assert.ok(localizedProductReady(products.find(p=>p.slug==='standard-notes')));
  const intent={status:'ready',anchor:null,problem:null,attributes:['no-account-required'],unresolved:false};const matches=searchGraph(intent,[page]);assert.equal(matches.length,3);assert.deepEqual(localizeSearchResult({state:'results',intent,matches,explanationMode:'verified-evidence'}).matches.map(m=>m.slug),matches.map(m=>m.slug));
 });
 const published=await snapshot();
 await check('repeated publication does not change any IDs or timestamps',async()=>{await db.exec(release.apply);assert.deepEqual(await snapshot(),published);});
 await check('all eight shipped release verification checks pass',async()=>{const rows=(await db.query(release.verify)).rows;assert.equal(rows.length,8);assert.ok(rows.every(r=>r.passed===true),JSON.stringify(rows));});
 await check('collector accepts new English and Chinese route/product events and existing Chinese route',async()=>{
  for(const lang of ['','/zh-hant']){assert.equal((await ingest(event('escape',lang+'/escape/account-free-note-taking-apps',{routeSlug:'account-free-note-taking-apps'}))).rows[0].r.inserted,1);assert.equal((await ingest(event('product',lang+'/software/standard-notes',{productSlug:'standard-notes'}))).rows[0].r.inserted,1);}
  await db.exec("INSERT INTO software_discovery.escape_routes(slug,name,status,editorially_approved) VALUES('offline-notion-alternatives','Existing route','published',true)");assert.equal((await ingest(event('escape','/zh-hant/escape/offline-notion-alternatives',{routeSlug:'offline-notion-alternatives'}))).rows[0].r.inserted,1);
 });
 await check('invalid localized paths remain rejected',async()=>{await assert.rejects(ingest(event('product','/zh-hant/software/made-up',{productSlug:'standard-notes'})),/Invalid page|Product context/);});
 await check('later scope edit blocks publication and rollback atomically',async()=>{await db.query('UPDATE software_discovery.product_attributes SET confidence=.85 WHERE product_id=$1 AND attribute_id=$2',[release.data.guardProducts[0].id,release.data.scopeId]);const edited=await snapshot();await assert.rejects(db.exec(release.apply),/scope\/provenance drift/);assert.deepEqual(await snapshot(),edited);await assert.rejects(db.exec(release.rollback),/scope\/provenance drift/);assert.deepEqual(await snapshot(),edited);await db.query('UPDATE software_discovery.product_attributes SET confidence=.9 WHERE product_id=$1 AND attribute_id=$2',[release.data.guardProducts[0].id,release.data.scopeId]);});
 await check('rollback restores draft graph while retaining all original sources and analytics events',async()=>{const eventCount=(await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n;await db.exec(release.rollback);const now=await snapshot();for(const t of ['products','attributes','product_attributes','evidence_sources','claim_evidence','product_attribute_evidence'])assert.deepEqual(now[t],before[t],t);assert.equal((await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n,eventCount);assert.equal((await db.query(draft.verify)).rows.every(r=>r.passed),true);});
 await check('collector rollback preserves access controls and stored events',async()=>{const count=(await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n;await db.exec(release.analyticsRollback);await db.exec(release.analyticsRollback);assert.equal((await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n,count);await assert.rejects(ingest(event('product','/zh-hant/software/standard-notes',{productSlug:'standard-notes'})),/Invalid page/);});
 console.log(`${checks} release database checks passed. No remote writes.`);
}finally{await db.close();}
