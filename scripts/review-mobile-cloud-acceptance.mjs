import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const pins={"lib/analytics/qa-exclusions.ts": "1246119c24c8c7236f8146164c5d0cdd4668915f67fd199378e3368e1355a8cf", "scripts/analytics-qa-exclusions.test.mjs": "4fb287486557f0a5d2e6ce3c7a743d442d6f906735a4d00388bd306dc2963142", "seed/research/mobile-cloud-acceptance-2026-10-20.json": "754c3565c963839141dc8dc7c634cac8b573b65a07a817990518ce96305e4d0e", "MOBILE_CLOUD_ACCEPTANCE.md": "238747f7ec9842c42eb50f7890cbc98a7e8c66728db68910778f0c7d98ecbd7e"};
for(const [p,h] of Object.entries(pins)){const text=fs.readFileSync(new URL('../'+p,import.meta.url),'utf8').replace(/\r\n/g,'\n').trimEnd()+'\n';assert.equal(crypto.createHash('sha256').update(text).digest('hex'),h,p);}
console.log('PR5.120 mobile receipt and packet pins verified; no network or database writes.');
