// Isolated PostgreSQL rehearsal. Pass the installed PGlite module path as argv[2].
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {PGlite}=await import(pathToFileURL(process.argv[2]).href);
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const original=read('supabase/migrations/202610220001_discovery_events_v2.sql').match(/CREATE FUNCTION software_discovery.ingest_discovery_events_v2\([\s\S]*?END \$ingest\$;/)[0];
const migration=read('supabase/migrations/202610270001_zh_hant_event_paths.sql');
const db=new PGlite();let checks=0;
const check=async(name,fn)=>{await fn();checks++;console.log('PASS '+name);};
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const base={version:2,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:new Date().toISOString(),name:'page_viewed',surface:'home',path:'/zh-hant'};
const ingest=e=>db.query('SELECT software_discovery.ingest_discovery_events_v2($1::jsonb,$2) result',[JSON.stringify([e]),'a'.repeat(64)]);
try{
 await db.exec(`CREATE SCHEMA software_discovery;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;
 CREATE TABLE software_discovery.products(slug text,status text);
 CREATE TABLE software_discovery.escape_routes(slug text,status text,editorially_approved boolean);
 INSERT INTO software_discovery.products VALUES('affine','published');
 INSERT INTO software_discovery.escape_routes VALUES('offline-notion-alternatives','published',true),('simple-notion-alternatives','published',true),('draft','draft',false);
 CREATE TABLE software_discovery.discovery_events_v2(event_id uuid PRIMARY KEY,payload jsonb NOT NULL,received_at timestamptz);
 CREATE TABLE software_discovery.discovery_queries_v2(event_id uuid PRIMARY KEY,query_text text,expires_at timestamptz);
 CREATE TABLE software_discovery.discovery_event_limits(bucket text,minute_start timestamptz,event_count int,PRIMARY KEY(bucket,minute_start));
 ALTER TABLE software_discovery.discovery_events_v2 ENABLE ROW LEVEL SECURITY;
 ALTER TABLE software_discovery.discovery_events_v2 FORCE ROW LEVEL SECURITY;
 ALTER TABLE software_discovery.discovery_queries_v2 ENABLE ROW LEVEL SECURITY;
 ALTER TABLE software_discovery.discovery_queries_v2 FORCE ROW LEVEL SECURITY;
 GRANT USAGE ON SCHEMA software_discovery TO service_role,anon,authenticated;
 ${original}
 REVOKE ALL ON FUNCTION software_discovery.ingest_discovery_events_v2(jsonb,text) FROM PUBLIC,anon,authenticated;
 GRANT EXECUTE ON FUNCTION software_discovery.ingest_discovery_events_v2(jsonb,text) TO service_role;`);
 await check('baseline rejects Chinese paths',async()=>{await assert.rejects(()=>ingest(base));});
 await check('rehearsal changes roll back',async()=>{await db.exec(read('supabase/verification/LOCALE_01_REHEARSE.sql'));await assert.rejects(()=>ingest(base));});
 await check('migration preserves ACL, private storage and admits original payload',async()=>{
  await db.exec(migration);assert.ok(Object.values((await db.query(read('supabase/verification/LOCALE_01_VERIFY.sql'))).rows[0].locale_01_verification).every(v=>v===true));
  await db.exec('SET ROLE service_role');assert.equal((await ingest(base)).rows[0].result.inserted,1);await db.exec('RESET ROLE');
  assert.equal((await db.query('SELECT payload FROM software_discovery.discovery_events_v2')).rows[0].payload.path,'/zh-hant');
 });
 await check('Chinese placement accepted; unsupported, mismatched and unpublished paths rejected',async()=>{
  const e={...base,eventId:id(4),name:'product_impression',surface:'escape',path:'/zh-hant/escape/offline-notion-alternatives',routeSlug:'offline-notion-alternatives',productSlug:'affine',position:1,exposureId:id(5)};
  assert.equal((await ingest(e)).rows[0].result.inserted,1);
  for(const patch of [{path:'/zh-hant/escape/simple-notion-alternatives',routeSlug:'simple-notion-alternatives'},{path:'/zh-hant/escape/draft',routeSlug:'draft'},{routeSlug:'simple-notion-alternatives'},{path:'/zh-hant/discover'},{path:e.path+'?private=x'},{path:'/zh-hant',surface:'search'}])await assert.rejects(()=>ingest({...e,eventId:id(6),...patch}));
 });
 await check('English admission, retry deduplication and restricted access still work',async()=>{
  assert.equal((await ingest(base)).rows[0].result.inserted,0);
  assert.equal((await ingest({...base,eventId:id(8),path:'/'})).rows[0].result.inserted,1);
  await db.exec('SET ROLE anon');await assert.rejects(()=>ingest(base));await assert.rejects(()=>db.query('SELECT * FROM software_discovery.discovery_events_v2'));await db.exec('RESET ROLE');
 });
 await check('reapply refuses drift and rollback restores old validation without deleting events',async()=>{
  await assert.rejects(()=>db.exec(migration));await db.exec('ROLLBACK');
  const before=(await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n;
  await db.exec(read('supabase/verification/LOCALE_01_ROLLBACK.sql'));await assert.rejects(()=>ingest({...base,eventId:id(9)}));
  assert.equal((await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n,before);
 });
 console.log(`${checks} storage checks passed`);
}finally{await db.close();}
