// Mock scheduler: this engine cannot load pg_cron or run its background worker.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.ANALYTICS_PG_TEST_MODULE??'@electric-sql/pglite');
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const db=new PGlite();let tests=0;
const check=async(name,fn)=>{await fn();tests++;console.log('PASS '+name);};
const mock=`CREATE SCHEMA cron;
CREATE TABLE cron.job(jobid bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,jobname text,schedule text,command text,database text,username text,active boolean);
CREATE TABLE cron.job_run_details(runid bigint,jobid bigint,status text,start_time timestamptz,end_time timestamptz);
CREATE FUNCTION cron.schedule(text,text,text) RETURNS bigint LANGUAGE plpgsql AS $$DECLARE id bigint; BEGIN INSERT INTO cron.job(jobname,schedule,command,database,username,active) VALUES($1,$2,$3,'postgres','postgres',true) RETURNING jobid INTO id; RETURN id; END$$;
CREATE FUNCTION cron.unschedule(bigint) RETURNS boolean LANGUAGE plpgsql AS $$BEGIN DELETE FROM cron.job WHERE jobid=$1; RETURN FOUND; END$$;
INSERT INTO cron.job(jobname,schedule,command,database,username,active) VALUES('other_application','0 0 * * *','SELECT 1;','postgres','postgres',true);
SELECT set_config('cron.database_name','postgres',false),set_config('cron.timezone','GMT',false);`;
const substitute=sql=>sql.replace(/-- BEGIN REAL PG_CRON INSTALL[\s\S]*?-- END REAL PG_CRON INSTALL/,()=>mock);
const migration=read('supabase/migrations/202610190002_discovery_daily_purge.sql');
const rehearsal=read('supabase/data/PR5.112_REHEARSE.sql');
try{
 const fixture=read('scripts/analytics-storage.pgtest.mjs').match(/await db\.exec\(`([\s\S]*?)`\);/)[1];
 await db.exec(fixture);
 await db.exec(read('supabase/migrations/202610190001_private_discovery_events.sql'));
 await check('rehearsal/apply bodies identical except transaction outcome',async()=>{
  assert.equal(rehearsal.slice(rehearsal.indexOf('BEGIN;')).replace('ROLLBACK;','COMMIT;'),migration.slice(migration.indexOf('BEGIN;')));
 });
 await check('mock extension/job rollback leaves no cron schema',async()=>{
  await db.exec(substitute(rehearsal));assert.equal((await db.query("SELECT to_regnamespace('cron') n")).rows[0].n,null);
 });
 await check('changed publication baseline aborts before installation',async()=>{
  await db.exec("UPDATE software_discovery.products SET status='draft' WHERE slug='product-2'");
  await assert.rejects(db.exec(substitute(rehearsal)),/Publication baseline drift/);await db.exec('ROLLBACK');
  await db.exec("UPDATE software_discovery.products SET status='published' WHERE slug='product-2'");
 });
 await check('mock persistent job exact; other job preserved; configuration checks',async()=>{
  await db.exec(substitute(migration));
  const checks=(await db.query(read('supabase/verification/PR5.112_VERIFY.sql'))).rows;
  assert.equal(checks.length,8);
  for(const c of checks)assert.equal(c.passed,c.check_name!=='pg_cron_installed',JSON.stringify(c));
  assert.equal((await db.query('SELECT count(*)::int n FROM cron.job')).rows[0].n,2);
 });
 await check('missing run evidence stays false; completed scheduled evidence visible',async()=>{
  const query=read('supabase/verification/PR5.112_RUN_STATUS.sql');
  let row=(await db.query(query)).rows[0];assert.equal(row.last_run_status,null);assert.equal(row.latest_run_succeeded,false);
  await db.exec("INSERT INTO cron.job_run_details SELECT 1,jobid,'succeeded',now(),now() FROM cron.job WHERE jobname='software_discovery_analytics_purge_v1'");
  row=(await db.query(query)).rows[0];assert.equal(row.latest_run_succeeded,true);assert.ok(row.last_finished_at);
 });
 await check('existing scoped job is never overwritten',async()=>{
  const block=migration.match(/DO \$schedule\$[\s\S]*?END \$schedule\$;/)[0];
  await assert.rejects(db.exec(block),/Job name collision/);
  assert.equal((await db.query('SELECT count(*)::int n FROM cron.job')).rows[0].n,2);
 });
 await check('job drift refuses removal; exact removal preserves other job and data',async()=>{
  const remove=read('supabase/data/PR5.112_UNSCHEDULE.sql');
  await db.exec("UPDATE cron.job SET command='SELECT 2;' WHERE jobname='software_discovery_analytics_purge_v1'");
  await assert.rejects(db.exec(remove),/Job configuration drift/);await db.exec('ROLLBACK');
  await db.exec("UPDATE cron.job SET command='SELECT software_discovery.purge_discovery_events();' WHERE jobname='software_discovery_analytics_purge_v1'");
  await db.exec(remove);assert.deepEqual((await db.query('SELECT jobname FROM cron.job')).rows,[{jobname:'other_application'}]);
  assert.equal((await db.query("SELECT count(*)::int n FROM software_discovery.products WHERE status='published'")).rows[0].n,24);
 });
 console.log(`${tests} mock scheduler scenarios passed. Actual pg_cron installation/background execution NOT tested.`);
}finally{await db.close();}
