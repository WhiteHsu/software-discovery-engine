const {PGlite}=await import(process.env.ANALYTICS_PG_TEST_MODULE??'@electric-sql/pglite');
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {collectEvents} from '../lib/analytics/http.ts';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const db=new PGlite();let tests=0;
const check=async(name,fn)=>{await fn();tests++;console.log('PASS '+name);};
const count=async(table)=>(await db.query(`SELECT count(*)::int n FROM software_discovery.${table}`)).rows[0].n;
const ingest=async events=>db.query('SELECT software_discovery.ingest_discovery_events($1::jsonb,$2) result',[JSON.stringify(events),'a'.repeat(64)]);
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const event={version:1,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:new Date().toISOString(),name:'product_impression',surface:'escape',routeSlug:'privacy-friendly-grammarly-alternatives',path:'/escape/privacy-friendly-grammarly-alternatives',productSlug:'vale-local-passive-3-24-0',exposureId:id(4),position:1};
try{
 await db.exec(`CREATE SCHEMA software_discovery; CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
 GRANT USAGE ON SCHEMA software_discovery TO anon,authenticated;
 CREATE TABLE software_discovery.products(id uuid PRIMARY KEY,slug text,status text);
 CREATE TABLE software_discovery.escape_routes(id uuid PRIMARY KEY,slug text,status text,editorially_approved boolean);
 CREATE TABLE software_discovery.escape_route_products(product_id uuid,escape_route_id uuid);
 CREATE TABLE software_discovery.claim_evidence(id uuid);
 CREATE FUNCTION software_discovery.product_discovery_page(text) RETURNS jsonb LANGUAGE sql AS 'SELECT NULL::jsonb';
 REVOKE ALL ON FUNCTION software_discovery.product_discovery_page(text) FROM PUBLIC;
 GRANT EXECUTE ON FUNCTION software_discovery.product_discovery_page(text) TO anon;
 INSERT INTO software_discovery.products SELECT md5(i::text)::uuid,CASE WHEN i=1 THEN 'vale-local-passive-3-24-0' ELSE 'product-'||i END,'published' FROM generate_series(1,24)i;
 INSERT INTO software_discovery.escape_routes SELECT md5(('r'||i)::text)::uuid,CASE WHEN i=1 THEN 'privacy-friendly-grammarly-alternatives' ELSE 'route-'||i END,'published',true FROM generate_series(1,10)i;
 INSERT INTO software_discovery.escape_route_products SELECT p.id,r.id FROM software_discovery.products p CROSS JOIN software_discovery.escape_routes r WHERE p.slug='vale-local-passive-3-24-0' AND r.slug='privacy-friendly-grammarly-alternatives';`);
 await check('rehearsal rolls back tables, functions and service schema usage',async()=>{
  await db.exec(read('supabase/data/PR5.109_REHEARSE.sql'));
  const r=(await db.query("SELECT to_regclass('software_discovery.discovery_events') t,has_schema_privilege('service_role','software_discovery','USAGE') u")).rows[0];assert.equal(r.t,null);assert.equal(r.u,false);
 });
 await check('migration applies; all ten shipped verification checks pass with no events',async()=>{
  await db.exec(read('supabase/migrations/202610190001_private_discovery_events.sql'));
  const r=await db.query(read('supabase/verification/PR5.109_VERIFY.sql'));assert.equal(r.rows.length,10);assert.ok(r.rows.every(x=>x.passed),JSON.stringify(r.rows));
 });
 await check('maintenance capability preflight works when pg_cron is absent and exposes no event rows',async()=>{
  const result=(await db.query(read('supabase/verification/PR5.111_MAINTENANCE_PREFLIGHT.sql'))).rows[0].snapshot;
  assert.equal(result.packet,'PR5.111');assert.equal(result.read_only,true);assert.equal(result.pg_cron,null);assert.equal(result.private_analytics_tables,true);assert.equal(result.event_counts.total,0);assert.equal(result.published_product_count,24);
 });
 await check('anonymous RPC and direct service table reads are denied',async()=>{
  await db.exec('SET ROLE anon');await assert.rejects(()=>ingest([event]));await db.exec('RESET ROLE');
  await db.exec('SET ROLE service_role');await assert.rejects(()=>count('discovery_events'));await db.exec('RESET ROLE');
 });
 await check('service definer RPC admits valid event once, deduplicates retry and rejects conflicting payload atomically',async()=>{
  await db.exec('SET ROLE service_role');assert.equal((await ingest([event])).rows[0].result.inserted,1);assert.equal((await ingest([event])).rows[0].result.inserted,0);
  await assert.rejects(()=>ingest([{...event,eventId:id(5)},{...event,position:2}]));await db.exec('RESET ROLE');assert.equal(await count('discovery_events'),1);
 });
 await check('unknown fields, stale events, nonpublic identity and removed route membership refuse writes',async()=>{
  for(const patch of [{email:'private@example.org'},{occurredAt:'2020-01-01T00:00:00.000Z'},{productSlug:'private-draft'},{routeSlug:'missing',path:'/escape/missing'},{position:0},{name:'invalid'}])await assert.rejects(()=>ingest([{...event,eventId:id(7),...patch}]));
  assert.equal(await count('discovery_events'),1);
 });
 await check('all four event names work; product views do not require a route placement',async()=>{
  await db.exec('BEGIN');
  try{
   const view={...event,eventId:id(20),pageViewId:id(21),name:'product_view',surface:'product',path:'/software/'+event.productSlug};delete view.routeSlug;delete view.position;delete view.exposureId;
   assert.equal((await ingest([view,{...view,name:'outbound_click',eventId:id(22)},{...event,name:'product_click',eventId:id(23)}])).rows[0].result.inserted,3);
  }finally{await db.exec('ROLLBACK');}
 });
 await check('HTTP validator to service-only SQL RPC persists only authoritative valid events',async()=>{
  await db.exec('BEGIN');
  try{
   await db.exec('SET ROLE service_role');
   const config={enabled:true,origin:'https://example.org',rateSecret:'c'.repeat(64),trustedVercel:true};
   const request=()=>new Request(config.origin+'/api/events',{method:'POST',headers:{origin:config.origin,'content-type':'application/json','x-vercel-forwarded-for':'203.0.113.1'},body:JSON.stringify([{...event,eventId:id(30)}])});
   const response=await collectEvents(request(),config,{now:()=>new Date(),admit:()=>true,publication:async()=>({products:new Set([event.productSlug]),placements:[{routeSlug:event.routeSlug,productSlug:event.productSlug,position:1}]}),store:async(events,key)=>{const result=await db.query('SELECT software_discovery.ingest_discovery_events($1::jsonb,$2) result',[JSON.stringify(events),key]);assert.equal(result.rows[0].result.inserted,1);return 'ok';}});
   assert.equal(response.status,204);await db.exec('RESET ROLE');assert.equal(await count('discovery_events'),2);
  }finally{await db.exec('ROLLBACK');}
 });
 await check('durable quota rejects excess requests; failed event inserts and quota changes roll back together',async()=>{
  for(let i=0;i<5;i++)await ingest(Array(20).fill(event));
  const before=(await db.query('SELECT * FROM software_discovery.discovery_event_limits ORDER BY bucket')).rows;
  await assert.rejects(()=>ingest(Array(20).fill(event)));
  assert.deepEqual((await db.query('SELECT * FROM software_discovery.discovery_event_limits ORDER BY bucket')).rows,before);assert.equal(await count('discovery_events'),1);
 });
 await check('retention function removes only events older than90 days and quota rows older than24h',async()=>{
  await db.exec("UPDATE software_discovery.discovery_events SET received_at=now()-interval '91 days'; INSERT INTO software_discovery.discovery_event_limits VALUES('old',now()-interval '25 hours',1)");
  await db.exec('SET ROLE service_role');const r=(await db.query('SELECT software_discovery.purge_discovery_events() result')).rows[0].result;await db.exec('RESET ROLE');assert.equal(r.eventsDeleted,1);assert.equal(r.limitsDeleted,1);assert.equal(await count('discovery_events'),0);
 });
 await check('repeated apply rejects without modifying existing storage',async()=>{
  await assert.rejects(()=>db.exec(read('supabase/migrations/202610190001_private_discovery_events.sql')));await db.exec('ROLLBACK');assert.equal(await count('discovery_events'),0);
 });
 console.log(`${tests} PostgreSQL-compatible scenario groups passed; synthetic data only.`);
}finally{await db.close();}
