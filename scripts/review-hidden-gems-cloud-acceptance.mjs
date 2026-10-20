import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const pins={"lib/analytics/qa-exclusions.ts": "3f60217359124854929b6471545787cb92e7d05dfadeea1627c626784a1f466c", "scripts/analytics-qa-exclusions.test.mjs": "d017e77075b4bc2f61cea3e9c3b0d44a07a3bf1185d6d2c904021337d2dfa14a", "seed/research/hidden-gems-cloud-acceptance-2026-10-19.json": "50495975a50b26fada319ac3f9038ca20629c9623ce516c16c2c2cd6af814d16", "HIDDEN_GEMS_CLOUD_ACCEPTANCE.md": "d81fbd3e13c30391b6969c2bb679cf9c492c5b6541fd052b15c500bf265c0040"};
for(const [p,h] of Object.entries(pins)){const text=fs.readFileSync(new URL('../'+p,import.meta.url),'utf8').replace(/\r\n/g,'\n').trimEnd()+'\n';assert.equal(crypto.createHash('sha256').update(text).digest('hex'),h,p);}
console.log('PR5.118 QA receipt and packet pins verified; no network or database writes.');
