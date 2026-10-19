import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {producerConfigEnabled} from '../lib/analytics/producer-config.ts';
const root=new URL('../',import.meta.url);
if(process.argv.length!==2)throw Error('No arguments supported');
const pins={
  ".env.example": "38540d17b3edc6103ce0967aafddbc4723df71bff9f4f5e7a637cecea87f30dc",
  "ANALYTICS_CONTROLLED_ACTIVATION.md": "6d7742c7861d0212ba0f6433de648a993a02a1eca1ed66ea0b9fbacc9fc67110",
  "seed/research/analytics-maintenance-acceptance-2026-10-19.json": "1985c3ca9c613ca46653c98bf5ec2ddf7e17bce3ebb1f4228bd8f6cfbca6d703",
  "lib/analytics/producer-config.ts": "d6cdbcf50c10ee1be6482a8c3cf94c432ea0838040b79719fee08c373d752b93",
  "lib/analytics/page-tracking.ts": "1b64ccb4901566977b552f9d64d14d939878da18b71ab04f2ad4a3efe1ba64ab",
  "scripts/analytics-producer-config.test.mjs": "6b79b98a911460e9f2672558f36b1d419693e6d083706427bbf73c3408492a4a",
  "scripts/analytics-live-probe.mjs": "f43fc146bb2839f035b9532b7879ff59c673afc76072e6209cd4a9355bc4dcf5"
};
for(const [path,expected] of Object.entries(pins)){
 const actual=createHash('sha256').update(fs.readFileSync(new URL(path,root),'utf8').replace(/\r\n/g,'\n')).digest('hex');
 if(actual!==expected)throw Error('Activation input drift: '+path);
}
const receipt=JSON.parse(fs.readFileSync(new URL('seed/research/analytics-maintenance-acceptance-2026-10-19.json',root),'utf8'));
if(receipt.configuration_checks.length!==8||receipt.storage_checks.length!==10||[...receipt.configuration_checks,...receipt.storage_checks].some(x=>!x.passed)||!receipt.run.latest_run_succeeded||receipt.run.expired_events_remaining!==0||receipt.run.expired_limits_remaining!==0||receipt.experiment_started)throw Error('Maintenance evidence drift');
if(producerConfigEnabled({}))throw Error('Producer must default off');
console.log('PR5.113: owner maintenance18/18 and completed scheduled success pinned. Independent producer defaults OFF. Collector-only QA prepared; no live requests, credentials or remote settings accessed. Experiment not started.');
