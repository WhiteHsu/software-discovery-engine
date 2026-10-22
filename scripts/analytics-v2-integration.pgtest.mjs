import fs from 'node:fs';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.ANALYTICS_PG_TEST_MODULE??'@electric-sql/pglite');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8').replaceAll('\r\n','\n');
const db=new PGlite();const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
let checks=0;const check=async(name,fn)=>{await fn();console.log('PASS '+name);checks++;};
const ingest=events=>db.query('SELECT software_discovery.ingest_discovery_events_v2($1::jsonb,$2) result',[JSON.stringify(events),'a'.repeat(64)]);
const event={version:2,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:new Date().toISOString(),name:'search_performed',surface:'search',path:'/discover',searchId:id(4),query:'Notion offline'};
try{
 await db.exec(`CREATE SCHEMA software_discovery;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;GRANT USAGE ON SCHEMA software_discovery TO service_role;
 CREATE TABLE software_discovery.products(slug text,status text);INSERT INTO software_discovery.products SELECT 'product-'||i,'published' FROM generate_series(1,24) i;
 CREATE TABLE software_discovery.escape_routes(slug text,status text,editorially_approved boolean);INSERT INTO software_discovery.escape_routes SELECT 'route-'||i,'published',true FROM generate_series(1,10) i;
 CREATE TABLE software_discovery.discovery_events(event_id uuid PRIMARY KEY,payload jsonb,received_at timestamptz);
 CREATE TABLE software_discovery.discovery_event_limits(bucket text,minute_start timestamptz,event_count integer CHECK(event_count BETWEEN 1 AND 1000),PRIMARY KEY(bucket,minute_start));
 ALTER TABLE software_discovery.discovery_events ENABLE ROW LEVEL SECURITY;ALTER TABLE software_discovery.discovery_events FORCE ROW LEVEL SECURITY;
 ALTER TABLE software_discovery.discovery_event_limits ENABLE ROW LEVEL SECURITY;ALTER TABLE software_discovery.discovery_event_limits FORCE ROW LEVEL SECURITY;
 CREATE SCHEMA cron;CREATE TABLE cron.job(jobname text,schedule text,command text,username text,database text,active boolean);
 INSERT INTO cron.job VALUES ('software_discovery_analytics_purge_v1','17 3 * * *','SELECT software_discovery.purge_discovery_events();','postgres','postgres',true);`);
 const old=read('supabase/migrations/202610190001_private_discovery_events.sql');await db.exec(old.slice(old.indexOf('CREATE FUNCTION software_discovery.purge_discovery_events()'),old.lastIndexOf('COMMIT;')));
 const before=(await db.query("SELECT md5(pg_get_functiondef('software_discovery.purge_discovery_events()'::regprocedure)) hash")).rows[0].hash;
 const migration=read('supabase/migrations/202610220001_discovery_events_v2.sql');
 await check('rollback rehearsal preserves v1 purge definition and leaves no v2 objects',async()=>{
  await db.exec(read('supabase/data/ANALYTICS_V2_STORAGE_REHEARSE.sql'));
  const r=(await db.query("SELECT to_regclass('software_discovery.discovery_events_v2') t,md5(pg_get_functiondef('software_discovery.purge_discovery_events()'::regprocedure)) hash")).rows[0];assert.equal(r.t,null);assert.equal(r.hash,before);
  assert.equal((await db.query('SELECT schedule FROM cron.job')).rows[0].schedule,'17 3 * * *');
 });
 await db.exec(migration);
 await check('private tables force RLS and only service role can execute ingest',async()=>{
  for(const t of ['discovery_events_v2','discovery_queries_v2']){const r=(await db.query(`SELECT relrowsecurity r,relforcerowsecurity f FROM pg_class WHERE oid='software_discovery.${t}'::regclass`)).rows[0];assert.ok(r.r&&r.f);for(const role of ['anon','authenticated','service_role'])assert.equal((await db.query(`SELECT has_table_privilege('${role}','software_discovery.${t}','SELECT,INSERT,UPDATE,DELETE') p`)).rows[0].p,false);}
  for(const role of ['anon','authenticated'])assert.equal((await db.query(`SELECT has_function_privilege('${role}','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE') p`)).rows[0].p,false);
  assert.equal((await db.query("SELECT has_function_privilege('service_role','software_discovery.ingest_discovery_events_v2(jsonb,text)','EXECUTE') p")).rows[0].p,true);
 });
 await check('ingestion separates diagnostic text, deduplicates and rejects conflicts atomically',async()=>{
  assert.equal((await ingest([event])).rows[0].result.inserted,1);assert.equal((await ingest([event])).rows[0].result.inserted,0);
  assert.equal((await db.query("SELECT payload ? 'query' q FROM software_discovery.discovery_events_v2")).rows[0].q,false);
  assert.equal((await db.query('SELECT query_text FROM software_discovery.discovery_queries_v2')).rows[0].query_text,'Notion offline');
  await assert.rejects(()=>ingest([{...event,eventId:id(7)},{...event,query:'changed'}]),/Conflicting/);
  assert.equal((await db.query('SELECT count(*)::int n FROM software_discovery.discovery_events_v2')).rows[0].n,1);
 });
 await check('invalid names, stale data, raw diagnostic identifiers and public role access fail',async()=>{
  for(const patch of [{name:'invented'},{occurredAt:'2020-01-01T00:00:00.000Z'},{query:'alice@example.com'},{query:'https://example.com/private'},{email:'private'}])await assert.rejects(()=>ingest([{...event,eventId:id(8),...patch}]));
  await db.exec('SET ROLE anon');await assert.rejects(()=>db.query('SELECT * FROM software_discovery.discovery_events_v2'));await db.exec('RESET ROLE');
 });
 await check('durable budget rejects overflow without partial insertion',async()=>{
  await db.exec("INSERT INTO software_discovery.discovery_event_limits VALUES ('global',date_trunc('minute',statement_timestamp()),1000) ON CONFLICT(bucket,minute_start) DO UPDATE SET event_count=1000");
  await assert.rejects(()=>ingest([{...event,eventId:id(9)}]),/admission limit/);
  assert.equal((await db.query('SELECT count(*)::int n FROM software_discovery.discovery_events_v2')).rows[0].n,1);
 });
 await check('existing purge target deletes expired diagnostics and both event versions',async()=>{
  await db.exec("UPDATE software_discovery.discovery_queries_v2 SET expires_at=statement_timestamp()-interval '1 minute';INSERT INTO software_discovery.discovery_events VALUES ('00000000-0000-4000-8000-000000000010','{}',statement_timestamp()-interval '91 days');");
  const r=(await db.query('SELECT software_discovery.purge_discovery_events() r')).rows[0].r;assert.equal(r.diagnosticQueriesDeleted,1);assert.equal(r.eventsDeleted,1);
  assert.equal((await db.query('SELECT count(*)::int n FROM software_discovery.discovery_events_v2')).rows[0].n,1);
  await db.exec("UPDATE software_discovery.discovery_events_v2 SET received_at=statement_timestamp()-interval '91 days'");assert.equal((await db.query('SELECT software_discovery.purge_discovery_events() r')).rows[0].r.v2EventsDeleted,1);
 });
 await check('repeated migration fails closed',async()=>{await assert.rejects(()=>db.exec(migration),/collision/);await db.exec('ROLLBACK');});
 await check('stored-event report separates three surfaces and preserves null denominators',async()=>{
  const rows=(await db.query(read('supabase/data/ANALYTICS_V2_METRICS.sql'))).rows;assert.deepEqual(rows.map(r=>r.surface),['search','escape','hidden_gems']);assert.ok(rows.every(r=>r.ctr===null));
  let n=100;
  for(const surface of ['search','escape','hidden_gems']){
   const e={version:2,eventId:id(n++),sessionId:id(2),pageViewId:id(3),occurredAt:'2026-10-22T00:00:00.000Z',name:'product_impression',surface,path:surface==='search'?'/discover':surface==='escape'?'/escape/route-1':'/hidden-gems',productSlug:'product-1',position:1,exposureId:id(n++),...(surface==='search'?{searchId:id(4),resultSetId:id(5)}:{}),...(surface==='escape'?{routeSlug:'route-1'}:{})};
   const click={...e,eventId:id(n++),name:'product_clicked',occurredAt:'2026-10-22T00:00:01.000Z'};
   for(const row of [e,click])await db.query('INSERT INTO software_discovery.discovery_events_v2(event_id,payload) VALUES ($1,$2::jsonb)',[row.eventId,JSON.stringify(row)]);
  }
  const filled=(await db.query(read('supabase/data/ANALYTICS_V2_METRICS.sql'))).rows;
  assert.ok(filled.every(r=>Number(r.impressions)===1&&Number(r.clicked_exposures)===1&&Number(r.ctr)===1&&Number(r.unmatched_clicks)===0));
  const outbound=(await db.query(read('supabase/data/ANALYTICS_V2_OUTBOUND_METRICS.sql'))).rows;assert.deepEqual(outbound.map(r=>r.origin),['search','escape','hidden_gems','unattributed']);assert.ok(outbound.every(r=>r.outbound_ctr===null));
  const view={version:2,eventId:id(200),sessionId:id(2),pageViewId:id(201),occurredAt:'2026-10-22T00:00:00.000Z',name:'page_viewed',surface:'product',path:'/software/product-1',productSlug:'product-1',originSurface:'search'};
  const action={...view,eventId:id(202),name:'outbound_clicked',occurredAt:'2026-10-22T00:00:01.000Z'};
  for(const row of [view,action])await db.query('INSERT INTO software_discovery.discovery_events_v2(event_id,payload) VALUES ($1,$2::jsonb)',[row.eventId,JSON.stringify(row)]);
  const converted=(await db.query(read('supabase/data/ANALYTICS_V2_OUTBOUND_METRICS.sql'))).rows.find(r=>r.origin==='search');assert.equal(Number(converted.product_views),1);assert.equal(Number(converted.outbound_product_views),1);assert.equal(Number(converted.outbound_ctr),1);
 });
 console.log(`${checks} storage integration checks passed`);
}catch(e){console.error(e.message);if(e.position)console.error(e.query?.slice(Number(e.position)-120,Number(e.position)+120));if(e.internalPosition)console.error(e.internalQuery?.slice(Number(e.internalPosition)-100,Number(e.internalPosition)+100));process.exitCode=1;}finally{await db.close();}
