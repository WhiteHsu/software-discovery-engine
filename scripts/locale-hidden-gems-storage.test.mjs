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
const base={version:2,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:new Date().toISOString(),name:'page_viewed',surface:'hidden_gems',path:'/zh-hant/hidden-gems'};
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
 for(const file of ['202610270001_zh_hant_event_paths.sql','202610270002_zh_hant_comparison_paths.sql','202610270003_zh_hant_product_paths.sql'])await db.exec(read('supabase/migrations/'+file));
 await check('prior definition rejects Chinese editorial paths',async()=>{await assert.rejects(()=>ingest(base));});
 await check('rehearsal leaves the original ingestion definition intact',async()=>{await db.exec(read('supabase/verification/LOCALE_05_REHEARSE.sql'));await assert.rejects(()=>ingest(base));});
 await check('migration preserves fingerprint, private storage and execute privileges',async()=>{await db.exec(read('supabase/migrations/202610280001_zh_hant_hidden_gems_paths.sql'));assert.ok(Object.values((await db.query(read('supabase/verification/LOCALE_05_VERIFY.sql'))).rows[0].locale_05_verification).every(v=>v===true));});
 await check('localized views, placements, product visits and outbound events retain exact paths and origins',async()=>{
  const exposure=id(10);
  const events=[base,...['product_impression','product_clicked'].map((name,i)=>({...base,eventId:id(20+i),name,productSlug:'joplin',position:1,exposureId:exposure})),...['page_viewed','outbound_clicked'].map((name,i)=>({...base,eventId:id(30+i),pageViewId:id(40),name,surface:'product',path:'/zh-hant/software/joplin',productSlug:'joplin',originSurface:'hidden_gems',originPageViewId:base.pageViewId,originExposureId:exposure,originPosition:1}))];
  for(const e of events){assert.equal((await ingest(e)).rows[0].result.inserted,1);assert.equal((await ingest(e)).rows[0].result.inserted,0);assert.deepEqual((await db.query('SELECT payload FROM software_discovery.discovery_events_v2 WHERE event_id=$1',[e.eventId])).rows[0].payload,e);}
 });
 await check('unknown paths, wrong surfaces, unpublished products and invalid editorial positions remain rejected',async()=>{
  for(const patch of [{path:base.path+'/'},{path:'/zh-hant/hidden-gems?secret=x'},{surface:'home'},{path:'/zh-hant/discover'},{name:'product_clicked',productSlug:'draft',position:1,exposureId:id(50)},{name:'product_clicked',productSlug:'joplin',position:4,exposureId:id(50)}])await assert.rejects(()=>ingest({...base,eventId:id(51),...patch}));
 });
 await check('English editorial events remain accepted and anonymous access blocked',async()=>{
  assert.equal((await ingest({...base,eventId:id(60),path:'/hidden-gems'})).rows[0].result.inserted,1);
  await db.exec('SET ROLE anon');await assert.rejects(()=>ingest(base));await assert.rejects(()=>db.query('SELECT * FROM software_discovery.discovery_events_v2'));await db.exec('RESET ROLE');
 });
 await check('guard rejects reapplying or drift and rollback preserves historical events and Chinese products',async()=>{
  await assert.rejects(()=>db.exec(read('supabase/migrations/202610280001_zh_hant_hidden_gems_paths.sql')));await db.exec('ROLLBACK');
  const count=(await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n;
  await db.exec(read('supabase/verification/LOCALE_05_ROLLBACK.sql'));await assert.rejects(()=>ingest({...base,eventId:id(70)}));
  assert.equal((await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n,count);
  assert.equal((await ingest({...base,eventId:id(71),surface:'product',path:'/zh-hant/software/joplin',productSlug:'joplin'})).rows[0].result.inserted,1);
 });
 console.log(`${checks} storage checks passed`);
}finally{await db.close();}
