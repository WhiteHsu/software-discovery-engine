import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const pins={"lib/analytics/qa-exclusions.ts": "bae227e5e48fba070f9357fe8f9ba4857b77b29f79e9f47261f05a7cb0d932e2", "scripts/analytics-qa-exclusions.test.mjs": "ebf55ea0b7d21f56d2f6ca637adbae01480963fc08b714bfbc612ba362814de7", "seed/research/unexposed-click-acceptance-2026-10-20.json": "720fe42742a1acfa069d26da304bdf72ced00f14545e0a041006840210309c91", "UNEXPOSED_CLICK_ACCEPTANCE.md": "fe738066e3e8968fcd9bb87a42a5eb7c861715f687d73f144f06a9509c87b44f"};
for(const [p,h] of Object.entries(pins)){const text=fs.readFileSync(new URL('../'+p,import.meta.url),'utf8').replace(/\r\n/g,'\n').trimEnd()+'\n';assert.equal(crypto.createHash('sha256').update(text).digest('hex'),h,p);}
console.log('PR5.121 receipt and packet pins verified; no network or database writes.');
