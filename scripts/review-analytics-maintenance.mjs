import fs from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
if(process.argv.length!==2)throw Error('No arguments supported');
const pins={
  "ANALYTICS_MAINTENANCE_REVIEW.md": "895973485aca62e1dbdcb25e659e02b63d29acc73323f5c996b49ca4eb48e26c",
  "seed/research/analytics-maintenance-baseline-2026-10-19.json": "4a310d42aea3673d3c1085a3d07e69c2a979b086adcde49b1a179494f1f0c418",
  "supabase/data/PR5.112_REHEARSE.sql": "6361d7cf599f710e818d74bc607194a1964be3ef680c1588078f2ba7616ccb71",
  "supabase/data/PR5.112_UNSCHEDULE.sql": "f290405d728668243e811ab541264585e171abe34f9cec66e6709a6e10579f01",
  "supabase/migrations/202610190002_discovery_daily_purge.sql": "0a37f5cc26d33ae0f4eeedcc56012f318a4e92835b941e3eb0c845cf08ced988",
  "supabase/verification/PR5.112_VERIFY.sql": "8a604e760f0546782585b7818fcc15ec4e7cc12023eac3967dfea8af6a6dad52",
  "supabase/verification/PR5.112_RUN_STATUS.sql": "f6162e88ea47766bf93cd36825a70f2bcb5529b24294986f149cd56c136f1805",
  "scripts/analytics-maintenance.pgtest.mjs": "af273b4236deb9238e975984199011c309172de4b06f0e174cde0ed78fcbc032"
};
for(const [path,expected] of Object.entries(pins)){
 const actual=createHash('sha256').update(fs.readFileSync(new URL(path,root),'utf8').replace(/\r\n/g,'\n')).digest('hex');
 if(actual!==expected)throw Error('Review input drift: '+path);
}
console.log('PR5.112: owner snapshot pinned; shared pg_cron install and one fixed daily purge proposed. Collection remains OFF. No remote DB connection or secrets read. Actual scheduling/run verification pending.');
