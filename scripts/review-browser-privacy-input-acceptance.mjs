import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const pins={"lib/analytics/qa-exclusions.ts": "f2133f1395e627b61ce2cf5ed2be8dccd4be34a1ce4593b073426e1e57ca1702", "scripts/analytics-qa-exclusions.test.mjs": "5027b542c6e0b2fd5dcde157e4db01703fe4d1aea56d601d01b7365e5e679f31", "seed/research/browser-privacy-input-acceptance-2026-10-20.json": "ae9bddd923b26d7bc4ea4d6e43e4508edcc74964f83fbe0015e5b0bbd3198539", "BROWSER_PRIVACY_INPUT_ACCEPTANCE.md": "b946ecdbf7cb43877035fcfd5bf07795fe3a143977459253cd82da44a7cbc269"};
for(const [p,h] of Object.entries(pins)){const text=fs.readFileSync(new URL('../'+p,import.meta.url),'utf8').replace(/\r\n/g,'\n').trimEnd()+'\n';assert.equal(crypto.createHash('sha256').update(text).digest('hex'),h,p);}
console.log('PR5.119 receipt and packet pins verified; no network or database writes.');
