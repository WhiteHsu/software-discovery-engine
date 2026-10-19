import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {knownQaSessionIds,knownQaEventIds} from '../lib/analytics/qa-exclusions.ts';
const root=new URL('../',import.meta.url);
if(process.argv.length!==2)throw Error('No arguments supported');
const pins={
  "ANALYTICS_CLOUD_ACCEPTANCE.md": "671f69c4403d1f0fa9796154d595a3c4e00aa661de4ee28d9ca21231133ceb54",
  "seed/research/analytics-cloud-acceptance-2026-10-19.json": "c828b9aa9a6035ce291bd4c4e1710c39c122fe2fddfe6ac892439e6c46b80883",
  "lib/analytics/qa-exclusions.ts": "e0e579ad2478ad69879c06007ab1b2aab1ac28487f796203e7100b21ed109a1a",
  "lib/analytics/metrics.ts": "81fbe2b25890da0fe44ff88399e71faeb4213090145bd4cf8e763feade3495eb",
  "scripts/analytics-qa-exclusions.test.mjs": "f08097c07e93b61d966995bf036b678ad695116ae312661c0fd117637909169a"
};
for(const [path,expected] of Object.entries(pins)){
 const actual=createHash('sha256').update(fs.readFileSync(new URL(path,root),'utf8').replace(/\r\n/g,'\n')).digest('hex');
 if(actual!==expected)throw Error('Cloud acceptance input drift: '+path);
}
const receipt=JSON.parse(fs.readFileSync(new URL('seed/research/analytics-cloud-acceptance-2026-10-19.json',root),'utf8'));
assert.deepEqual(knownQaSessionIds,receipt.qa_exclusion.session_ids);
assert.deepEqual(knownQaEventIds,receipt.qa_exclusion.event_ids);
assert.equal(receipt.collector_probe.sql_checks.length,3);assert.equal(receipt.browser_journey.sql_checks.length,6);
assert.ok([...receipt.collector_probe.sql_checks,...receipt.browser_journey.sql_checks].every(x=>x.passed));
assert.equal(receipt.rollback.producer_enabled,false);assert.equal(receipt.experiment_started,false);
console.log('PR5.114: cloud collector3/3 and browser journey6/6 owner evidence pinned. Known QA sessions excluded by metrics helper; database rows unchanged. Producer rollback false/Ready reported; fresh browser check pending. No requests, secrets or remote settings accessed. Experiment not started.');
