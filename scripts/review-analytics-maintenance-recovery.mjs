import fs from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
if(process.argv.length!==2)throw Error('No arguments supported');
const pins={
  "ANALYTICS_MAINTENANCE_RECOVERY.md": "bae43401ab16ec1ffc537a1864f29414403c650e0df163924c911b0d17cb2ff4",
  "seed/research/analytics-maintenance-installed-2026-10-19.json": "780430f7af5910903b4aa514b358f7209ef178a015c8af1d13e9037c8f80a60f",
  "supabase/data/PR5.112A_REHEARSE.sql": "5a185dfd929e3673feca696e41fede95d17d4603ebe732a3048377b965dffbca",
  "supabase/data/PR5.112A_RESUME.sql": "0f52c2b3dc106e9f0f4b6a727d6e7ba82b1d16264a042f6978393fe8c633e901",
  "supabase/verification/PR5.112A_VERIFY.sql": "18a210b8df3a3afb6ff9f213a9c4656d73ab139da7b541c021be808c9d907829",
  "scripts/analytics-maintenance-recovery.pgtest.mjs": "9cf62c15dfe9268849c25f78b9ca9d1be05df6c3f39b26bb4267fbe28b6ef645"
};
for(const [path,expected] of Object.entries(pins)){
 const actual=createHash('sha256').update(fs.readFileSync(new URL(path,root),'utf8').replace(/\r\n/g,'\n')).digest('hex');
 if(actual!==expected)throw Error('Recovery input drift: '+path);
}
console.log('PR5.112A: installed pg_cron owner snapshot pinned; recovery only, no extension/grant changes. Exact job retained, absent job created, drift refused. Collection OFF. Owner rehearsal/apply/run evidence pending. No remote DB or secrets accessed.');
