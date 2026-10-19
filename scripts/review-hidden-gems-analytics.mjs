import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const pins={
  "HIDDEN_GEMS_ANALYTICS_REVIEW.md": "1196a652109301c8b9ae381688e0f4d0a239012bf5b390e267d9b2606c9ee013",
  "components/DiscoveryTracker.tsx": "6284d3937ab44993f3503946501021cd9e16e0836abfd11b6d36d7c6be362266",
  "app/hidden-gems/page.tsx": "2b2e38cdb6aa2b38203371cb2cd030f931743e71826fa3ec801184cf734f8d65",
  "lib/analytics/events.ts": "be13b8c03798c18ac2d1897fa3a1d617fd2dc9e8e8b11cced7cac7a1c5701614",
  "lib/analytics/ingestion.ts": "59ac61220d9ee0ae26be2751d53f0be7616f16342132b7d300156efd8bef7eb1",
  "lib/analytics/metrics.ts": "028adc1cda143ab2ce9400f093c140a5d990cd48f2fd6e8efd56e75c4880aac0",
  "lib/analytics/publication.ts": "cde7c96d35c726d9ae2c48278dbf4634d8e0dddf75fc333d72981bd807928e0d",
  "scripts/hidden-gems-events.test.mjs": "a8fc8a2c7357c44bb780233fe0b04cd0c62fc57479b2df5218bb1daef42c353a",
  "scripts/hidden-gems-storage.pgtest.mjs": "35aa902976c4a48a5bbf50cb3ff626ee1ca7bef5d01ea723022a9d27aa772c60",
  "supabase/data/PR5.117_REHEARSE.sql": "80e766201ec7517cbdf21578831ae769cb768abc68a5f77052d44f73dbaa0282",
  "supabase/migrations/202610190003_hidden_gems_events.sql": "7f99cd3dce9ab8950e6debabda36cdeb6393e54432cb9fdfde8e5ced782d4863",
  "supabase/verification/PR5.117_VERIFY.sql": "62ca7841e0283b1f4169f19ba745287c08d147c70c1558149b22d37c46900d13",
  "seed/research/hidden-gems-analytics-preflight-2026-10-19.json": "ff51e05be5d764396bf54ed0c1c8022ced8ea66b3d527a743cd43c1f077d24f3"
};
for(const [path,hash] of Object.entries(pins)){
 const s=fs.readFileSync(new URL('../'+path,import.meta.url),'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').trimEnd()+'\n';
 assert.equal(crypto.createHash('sha256').update(s).digest('hex'),hash,'Packet/source drift: '+path);
}
const receipt=JSON.parse(fs.readFileSync(new URL('../seed/research/hidden-gems-analytics-preflight-2026-10-19.json',import.meta.url),'utf8'));
assert.ok(Object.values(receipt.checks).every(v=>v===true));assert.equal(receipt.producerEnabled,false);assert.equal(receipt.experimentStarted,false);
console.log('PR5.117 packet pins and frozen owner preflight verified; no network, secrets or database writes.');
