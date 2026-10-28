// Isolated PostgreSQL rehearsal. Supply an installed PGlite module path as argv[2].
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {PGlite}=await import(pathToFileURL(process.argv[2]).href);
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const original=read('supabase/migrations/202610220001_discovery_events_v2.sql').match(/CREATE FUNCTION software_discovery.ingest_discovery_events_v2\([\s\S]*?END \$ingest\$;/)[0];
const db=new PGlite();let checks=0;
const check=async(name,fn)=>{await fn();checks++;console.log('PASS '+name);};
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const base={version:2,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:new Date().toISOString(),name:'page_viewed',surface:'search',path:'/zh-hant/discover'};
const ingest=e=>db.query('SELECT software_discovery.ingest_discovery_events_v2($1::jsonb,$2) result',[JSON.stringify([e]),'a'.repeat(64)]);
try{
 await db.exec(`CREATE SCHEMA software_discovery;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;
 CREATE TABLE software_discovery.products(slug text,status text);
 CREATE TABLE software_discovery.escape_routes(slug text,status text,editorially_approved boolean);
 INSERT INTO software_discovery.products VALUES('joplin','published'),('krita','published'),('pdf24-creator','published'),('draft','draft');
 CREATE TABLE software_discovery.discovery_events_v2(event_id uuid PRIMARY KEY,payload jsonb NOT NULL,received_at timestamptz);
 CREATE TABLE software_discovery.discovery_queries_v2(event_id uuid PRIMARY KEY,query_text text,expires_at timestamptz);
 CREATE TABLE software_discovery.discovery_event_limits(bucket text,minute_start timestamptz,event_count int,PRIMARY KEY(bucket,minute_start));
 ALTER TABLE software_discovery.discovery_events_v2 ENABLE ROW LEVEL SECURITY;ALTER TABLE software_discovery.discovery_events_v2 FORCE ROW LEVEL SECURITY;
 ALTER TABLE software_discovery.discovery_queries_v2 ENABLE ROW LEVEL SECURITY;ALTER TABLE software_discovery.discovery_queries_v2 FORCE ROW LEVEL SECURITY;
 GRANT USAGE ON SCHEMA software_discovery TO service_role,anon,authenticated;
 ${original}
 REVOKE ALL ON FUNCTION software_discovery.ingest_discovery_events_v2(jsonb,text) FROM PUBLIC,anon,authenticated;
 GRANT EXECUTE ON FUNCTION software_discovery.ingest_discovery_events_v2(jsonb,text) TO service_role;`);
 for(const file of ['202610270001_zh_hant_event_paths.sql','202610270002_zh_hant_comparison_paths.sql','202610270003_zh_hant_product_paths.sql','202610280001_zh_hant_hidden_gems_paths.sql'])await db.exec(read('supabase/migrations/'+file));
 await check('prior definition rejects both Chinese search contexts',async()=>{for(const path of ['/zh-hant','/zh-hant/discover'])await assert.rejects(()=>ingest({...base,path}));});
 await check('rehearsal restores the prior ingestion definition',async()=>{await db.exec(read('supabase/verification/LOCALE_06_REHEARSE.sql'));await assert.rejects(()=>ingest(base));});
 await check('migration preserves fingerprint, storage privacy and privileges',async()=>{await db.exec(read('supabase/migrations/202610280002_zh_hant_search_paths.sql'));assert.ok(Object.values((await db.query(read('supabase/verification/LOCALE_06_VERIFY.sql'))).rows[0].locale_06_verification).every(v=>v===true));});
 const intent={status:'ready',anchor:'notion',problem:null,attributes:['works-offline'],unresolved:false};
 const searchId=id(10),resultSetId=id(11),exposureId=id(12);
 await check('Chinese attempts keep query diagnostics private, deduplicate and preserve seven-day expiry',async()=>{
  for(const [i,path] of ['/zh-hant','/zh-hant/discover'].entries()){
   const e={...base,eventId:id(20+i),name:'search_performed',path,searchId,query:'找可離線的 Notion 替代工具'};assert.equal((await ingest(e)).rows[0].result.inserted,1);assert.equal((await ingest(e)).rows[0].result.inserted,0);
   const stored=(await db.query('SELECT payload,received_at FROM software_discovery.discovery_events_v2 WHERE event_id=$1',[e.eventId])).rows[0];assert.equal(stored.payload.path,path);assert.equal(Object.hasOwn(stored.payload,'query'),false);
   const diagnostic=(await db.query('SELECT query_text,expires_at FROM software_discovery.discovery_queries_v2 WHERE event_id=$1',[e.eventId])).rows[0];assert.equal(diagnostic.query_text,e.query);assert.equal(Date.parse(diagnostic.expires_at)-Date.parse(stored.received_at),7*86400000);
  }
 });
 await check('outcomes, impressions, clicks and product origins persist exact localized paths and identities',async()=>{
  const e={...base,anchor:'notion',constraints:['works-offline'],searchId,resultSetId};
  const events=[{...e,eventId:id(30),name:'search_results_viewed',intent,outcome:'results',resultCount:1},...['product_impression','product_clicked'].map((name,i)=>({...e,eventId:id(31+i),name,productSlug:'joplin',position:1,exposureId})),...['page_viewed','outbound_clicked'].map((name,i)=>({...base,eventId:id(34+i),name,surface:'product',path:'/zh-hant/software/joplin',productSlug:'joplin',originSurface:'search',originPageViewId:base.pageViewId,originSearchId:searchId,originExposureId:exposureId,originPosition:1}))];
  for(const event of events){assert.equal((await ingest(event)).rows[0].result.inserted,1);assert.deepEqual((await db.query('SELECT payload FROM software_discovery.discovery_events_v2 WHERE event_id=$1',[event.eventId])).rows[0].payload,event);}
 });
 await check('invalid paths, surfaces, unpublished products and excessive positions remain refused',async()=>{
  for(const patch of [{path:base.path+'/'},{path:base.path+'?query=private'},{surface:'home'},{path:'/zh-hant/unknown'},{name:'product_clicked',productSlug:'draft',position:1,exposureId,searchId,resultSetId},{name:'product_clicked',productSlug:'joplin',position:7,exposureId,searchId,resultSetId}])await assert.rejects(()=>ingest({...base,eventId:id(50),...patch}));
 });
 await check('English search remains accepted and anonymous execution and reads stay blocked',async()=>{
  assert.equal((await ingest({...base,eventId:id(60),path:'/discover'})).rows[0].result.inserted,1);
  await db.exec('SET ROLE anon');await assert.rejects(()=>ingest(base));await assert.rejects(()=>db.query('SELECT * FROM software_discovery.discovery_events_v2'));await db.exec('RESET ROLE');
 });
 await check('guarded rollback preserves recorded events, diagnostics and Chinese Hidden Gems',async()=>{
  await assert.rejects(()=>db.exec(read('supabase/migrations/202610280002_zh_hant_search_paths.sql')));await db.exec('ROLLBACK');
  const count=(await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n;
  await db.exec(read('supabase/verification/LOCALE_06_ROLLBACK.sql'));await assert.rejects(()=>ingest({...base,eventId:id(70)}));
  assert.equal((await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n,count);assert.equal((await db.query('SELECT count(*) n FROM software_discovery.discovery_queries_v2')).rows[0].n,2);
  assert.equal((await ingest({...base,eventId:id(71),surface:'hidden_gems',path:'/zh-hant/hidden-gems'})).rows[0].result.inserted,1);
 });
 console.log(`${checks} storage checks passed`);
}finally{await db.close();}
