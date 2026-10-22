import fs from 'node:fs';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.ANALYTICS_PG_TEST_MODULE??'@electric-sql/pglite');
const db=new PGlite();
try{
 await db.exec('CREATE SCHEMA software_discovery; CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE TABLE software_discovery.discovery_events(event_id uuid PRIMARY KEY,payload jsonb); INSERT INTO software_discovery.discovery_events VALUES (\'00000000-0000-4000-8000-000000000001\',\'{"version":1}\');');
 const sql=fs.readFileSync(new URL('../supabase/data/ANALYTICS_V2_REHEARSE.sql',import.meta.url),'utf8');
 assert.match(sql,/ROLLBACK;\s*$/);assert.doesNotMatch(sql,/\bCOMMIT\s*;/i);
 await db.exec(sql);
 assert.equal((await db.query("SELECT to_regclass('software_discovery.discovery_events_v2') t")).rows[0].t,null);
 assert.equal((await db.query('SELECT count(*)::int n FROM software_discovery.discovery_events')).rows[0].n,1);
 console.log('PASS rehearsal rolls back new objects and preserves historical events');
 const inspect=sql.replace(/ROLLBACK;\s*$/,'COMMIT;');
 // Only the isolated in-memory test commits the candidate DDL for assertions.
 await db.exec(inspect);
 const r=(await db.query("SELECT relrowsecurity rls,relforcerowsecurity forced FROM pg_class WHERE oid='software_discovery.discovery_events_v2'::regclass")).rows[0];assert.equal(r.rls,true);assert.equal(r.forced,true);
 for(const role of ['anon','authenticated','service_role']){
  const p=(await db.query(`SELECT has_table_privilege('${role}','software_discovery.discovery_events_v2','SELECT') s,has_table_privilege('${role}','software_discovery.discovery_events_v2','INSERT') i`)).rows[0];assert.equal(p.s,false);assert.equal(p.i,false);
 }
 console.log('PASS new storage denies public/browser/service direct access and forces RLS');
 for(const payload of [{},{version:1,name:'page_viewed',eventId:'00000000-0000-4000-8000-000000000002'},{version:2,name:'made_up',eventId:'00000000-0000-4000-8000-000000000002'}]){
  await assert.rejects(()=>db.query('INSERT INTO software_discovery.discovery_events_v2(event_id,payload) VALUES ($1,$2::jsonb)',['00000000-0000-4000-8000-000000000002',JSON.stringify(payload)]));
 }
 const payload={version:2,name:'page_viewed',eventId:'00000000-0000-4000-8000-000000000002'};
 await db.query('INSERT INTO software_discovery.discovery_events_v2(event_id,payload) VALUES ($1,$2::jsonb)',[payload.eventId,JSON.stringify(payload)]);
 await assert.rejects(()=>db.query('INSERT INTO software_discovery.discovery_events_v2(event_id,payload) VALUES ($1,$2::jsonb)',[payload.eventId,JSON.stringify(payload)]));
 console.log('PASS storage rejects missing contract fields, v1, unknown names and duplicate IDs');
 await assert.rejects(()=>db.exec(sql),/already exists/);await db.exec('ROLLBACK');
 console.log('PASS existing-object collision fails closed');
}finally{await db.close();}
