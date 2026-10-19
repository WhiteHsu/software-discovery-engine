// Optional isolated test. Mock cron catalog only; no real extension/background worker.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.ANALYTICS_PG_TEST_MODULE??'@electric-sql/pglite');
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const db=new PGlite();let tests=0;
const check=async(name,fn)=>{await fn();tests++;console.log('PASS '+name);};
const resume=read('supabase/data/PR5.112A_RESUME.sql'),rehearse=read('supabase/data/PR5.112A_REHEARSE.sql');
const substitute=sql=>sql.replace(/-- BEGIN REAL EXTENSION CHECK[\s\S]*?-- END REAL EXTENSION CHECK/,'-- Extension catalog availability simulated in this test only.');
const jobs=async()=>(await db.query('SELECT * FROM cron.job ORDER BY jobid')).rows;
const fails=async(sql,message)=>{await assert.rejects(db.exec(substitute(sql)),message);await db.exec('ROLLBACK');};
try{
 const fixture=read('scripts/analytics-storage.pgtest.mjs').match(/await db\.exec\(`([\s\S]*?)`\);/)[1];
 await db.exec(fixture);
 await db.exec(read('supabase/migrations/202610190001_private_discovery_events.sql'));
 let mock=read('scripts/analytics-maintenance.pgtest.mjs').match(/const mock=`([\s\S]*?)`;/)[1];
 mock=mock.replace('active boolean);',"active boolean,nodename text DEFAULT 'localhost',nodeport integer DEFAULT 5432);");
 await db.exec(mock);
 await check('rehearsal and resume differ only in transaction outcome; no extension or grants mutation',async()=>{
  assert.equal(rehearse.slice(rehearse.indexOf('BEGIN;')).replace('ROLLBACK;','COMMIT;'),resume.slice(resume.indexOf('BEGIN;')));
  assert.doesNotMatch(resume,/\b(?:CREATE|DROP)\s+EXTENSION|\bGRANT\b|\bREVOKE\b|\bALTER\s+SYSTEM/i);
 });
 const baseline=await jobs();
 await check('absent-job rehearsal rolls back job and preserves existing scheduler/other job',async()=>{
  await db.exec(substitute(rehearse));assert.deepEqual(await jobs(),baseline);
 });
 await check('wrong clock or disabled history stops before scheduling',async()=>{
  await db.exec("SELECT set_config('cron.timezone','Asia/Taipei',false)");await fails(resume,/database\/timezone drift/);assert.deepEqual(await jobs(),baseline);
  await db.exec("SELECT set_config('cron.timezone','GMT',false),set_config('cron.log_run','off',false)");await fails(resume,/logging must be enabled/);
  await db.exec("SELECT set_config('cron.log_run','on',false)");assert.deepEqual(await jobs(),baseline);
 });
 await check('private grant drift refuses work',async()=>{
  await db.exec('GRANT SELECT ON software_discovery.discovery_events TO anon');await fails(resume,/Private storage boundary drift/);
  await db.exec('REVOKE SELECT ON software_discovery.discovery_events FROM anon');assert.deepEqual(await jobs(),baseline);
 });
 await check('resume creates one scoped job; configuration checks pass except mocked extension',async()=>{
  await db.exec(substitute(resume));assert.equal((await jobs()).length,2);
  const checks=(await db.query(read('supabase/verification/PR5.112A_VERIFY.sql'))).rows;assert.equal(checks.length,8);
  for(const c of checks)assert.equal(c.passed,c.check_name!=='pg_cron_installed',JSON.stringify(c));
 });
 await check('existing exact rehearsal and repeated resume retain job IDs and history',async()=>{
  const before=await jobs();await db.exec("INSERT INTO cron.job_run_details SELECT 1,jobid,'succeeded',now(),now() FROM cron.job WHERE jobname='software_discovery_analytics_purge_v1'");
  await db.exec(substitute(rehearse));await db.exec(substitute(resume));assert.deepEqual(await jobs(),before);
  assert.equal((await db.query('SELECT count(*)::int n FROM cron.job_run_details')).rows[0].n,1);
 });
 await check('changed, inactive, duplicate or remote scoped jobs are refused without overwrite',async()=>{
  for(const [column,value] of [['schedule','0 0 * * *'],['command','SELECT 2;'],['database','elsewhere'],['username','service_role'],['nodename','external.example']]){
   const before=await jobs();await db.query(`UPDATE cron.job SET ${column}=$1 WHERE jobname='software_discovery_analytics_purge_v1'`,[value]);
   const drift=await jobs();await fails(resume,/no overwrite permitted/);assert.deepEqual(await jobs(),drift);
   await db.query(`UPDATE cron.job SET ${column}=$1 WHERE jobname='software_discovery_analytics_purge_v1'`,[before[1][column]]);
  }
  await db.exec("UPDATE cron.job SET active=false WHERE jobname='software_discovery_analytics_purge_v1'");await fails(resume,/no overwrite permitted/);
  await db.exec("UPDATE cron.job SET active=true WHERE jobname='software_discovery_analytics_purge_v1'; INSERT INTO cron.job(jobname) VALUES('software_discovery_analytics_purge_v1')");
  await fails(resume,/no overwrite permitted/);await db.exec('DELETE FROM cron.job WHERE schedule IS NULL');
  assert.deepEqual((await jobs())[0],baseline[0]);
 });
 console.log(`${tests} recovery mock scenarios passed; actual pg_cron installation and background execution NOT tested.`);
}finally{await db.close();}
