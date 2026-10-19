const {PGlite}=await import(process.env.ANALYTICS_PG_TEST_MODULE??'@electric-sql/pglite');
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const db=new PGlite();let tests=0;
const check=async(name,fn)=>{await fn();tests++;console.log('PASS '+name);};
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const ingest=events=>db.query('SELECT software_discovery.ingest_discovery_events($1::jsonb,$2) result',[JSON.stringify(events),'a'.repeat(64)]);
const count=async()=>(await db.query('SELECT count(*)::int n FROM software_discovery.discovery_events')).rows[0].n;
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

 await db.exec(read('supabase/migrations/202610190001_private_discovery_events.sql'));
 const fingerprint=async()=>(await db.query("SELECT md5(pg_get_functiondef('software_discovery.ingest_discovery_events(jsonb,text)'::regprocedure)) h")).rows[0].h;
 assert.equal(await fingerprint(),'109b824edeaba7ce1c8b8653346d53bc');
 const before=await fingerprint();
 const legacy={version:1,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:new Date().toISOString(),name:'product_view',surface:'product',path:'/software/vale-local-passive-3-24-0',productSlug:'vale-local-passive-3-24-0'};
 await ingest([legacy]);
 await check('rehearsal verifies eleven boundaries then restores old function and existing event',async()=>{
  await db.exec(read('supabase/data/PR5.117_REHEARSE.sql'));
  assert.equal(await fingerprint(),before);assert.equal(await count(),1);
 });
 await check('migration preserves existing events and all eleven verification boundaries',async()=>{
  await db.exec(read('supabase/migrations/202610190003_hidden_gems_events.sql'));
  const r=await db.query(read('supabase/verification/PR5.117_VERIFY.sql'));assert.equal(r.rows.length,11);assert.ok(r.rows.every(x=>x.passed),JSON.stringify(r.rows));assert.equal(await count(),1);
 });
 // Swap only fixture public identities; retain the same 24/10 counts.
 await db.exec("UPDATE software_discovery.products SET slug='joplin' WHERE slug='product-2'; UPDATE software_discovery.escape_routes SET slug='simple-notion-alternatives' WHERE slug='route-2'; INSERT INTO software_discovery.escape_route_products SELECT p.id,r.id FROM software_discovery.products p CROSS JOIN software_discovery.escape_routes r WHERE p.slug='joplin' AND r.slug='simple-notion-alternatives'");
 const gem={...legacy,eventId:id(4),name:'product_impression',surface:'hidden_gems',path:'/hidden-gems',productSlug:'joplin',position:1,exposureId:id(5)};
 await check('service RPC stores editorial impression and click, deduplicates retry; legacy remains valid',async()=>{
  await db.exec('SET ROLE service_role');
  assert.equal((await ingest([gem])).rows[0].result.inserted,1);assert.equal((await ingest([gem])).rows[0].result.inserted,0);
  assert.equal((await ingest([{...gem,eventId:id(6),name:'product_click'}])).rows[0].result.inserted,1);
  assert.equal((await ingest([{...legacy,eventId:id(7)}])).rows[0].result.inserted,1);await db.exec('RESET ROLE');assert.equal(await count(),4);
 });
 await check('invalid editorial identities, context and mixed-validity batch never partially store',async()=>{
  for(const patch of [{productSlug:'vale-local-passive-3-24-0'},{position:4},{routeSlug:'simple-notion-alternatives'},{path:'/hidden-gems?q=secret'},{name:'product_view'},{exposureId:null}])await assert.rejects(()=>ingest([{...gem,eventId:id(8)},{...gem,eventId:id(9),...patch}]));
  assert.equal(await count(),4);
  await db.exec("UPDATE software_discovery.escape_routes SET editorially_approved=false WHERE slug='simple-notion-alternatives'");await assert.rejects(()=>ingest([{...gem,eventId:id(10)}]));
  await db.exec("UPDATE software_discovery.escape_routes SET editorially_approved=true WHERE slug='simple-notion-alternatives'");
 });
 await check('anonymous execution and service direct reads remain denied',async()=>{
  await db.exec('SET ROLE anon');await assert.rejects(()=>ingest([gem]));await db.exec('RESET ROLE');
  await db.exec('SET ROLE service_role');await assert.rejects(()=>count());await db.exec('RESET ROLE');
 });
 await check('repeated apply refuses without changing events or installed function',async()=>{
  const installed=await fingerprint();await assert.rejects(()=>db.exec(read('supabase/migrations/202610190003_hidden_gems_events.sql')));await db.exec('ROLLBACK');assert.equal(await fingerprint(),installed);assert.equal(await count(),4);
 });
 await check('unexpected ingest drift refuses before replacement',async()=>{
  const installed=await fingerprint();await db.exec("BEGIN; ALTER FUNCTION software_discovery.ingest_discovery_events(jsonb,text) SET search_path=public");
  // Test guard body in the existing test transaction, avoiding a nested BEGIN.
  const sql=read('supabase/migrations/202610190003_hidden_gems_events.sql');const guard=sql.slice(sql.indexOf('DO $guard$'),sql.indexOf('CREATE OR REPLACE FUNCTION'));
  await assert.rejects(()=>db.exec(guard));await db.exec('ROLLBACK');assert.equal(await fingerprint(),installed);
 });
 console.log(`${tests} PostgreSQL-compatible scenario groups passed; synthetic fixtures only.`);
}finally{await db.close();}
