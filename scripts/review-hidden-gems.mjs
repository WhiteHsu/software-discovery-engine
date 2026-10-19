import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {gemSelections,indexableGemCollection} from '../lib/discovery/hidden-gems.ts';
const root=new URL('../',import.meta.url),hash=s=>createHash('sha256').update(s).digest('hex');
if(process.argv.length!==2)throw Error('No arguments supported');
const pins={
  "HIDDEN_GEMS_REVIEW.md": "6518c64c6d9357b6f0b4b88e981e8241de31eebf298cac82765e1ae20a1d79f1",
  "seed/research/seo-deployed-acceptance-2026-10-19.json": "58400990fc243de5f0fa07336af32a5b2c948514e099de83d5062ddb96f87cb1",
  "seed/research/hidden-gems-curation-2026-10-19.json": "d6ec2165942c861f73ecb91e12f474b271601f65267ec0f63ebee9f4e2a011f7",
  "lib/discovery/hidden-gems.ts": "5a90138101aabd69fd94383bd3cec976a558246a4aa273ce06df13b325b47331",
  "lib/discovery/hidden-gems-server.ts": "3a2fe7930b246218c85eb8cfd2b1c5045bb4e2e964e6e6a8562f5df8a556cf8b",
  "lib/discovery/seo.ts": "e7c1fd6560eac9d4a70047c6e86547d6a63646d66ace454a12e3f6b6f2b9c820",
  "lib/discovery/seo-server.ts": "338b40f4bdc3f0482e06ff25debc78a1b307d83dbf1bbf238c164ea96e068d07",
  "app/hidden-gems/page.tsx": "7926a46d756026f78350ebcc1f35f29f0dab79745f003087e894b54bdefc68d3",
  "app/hidden-gems/hidden-gems.module.css": "176b7268f1346a2c07dd82acd6e0a77533c2710b65cc59ea429216e388e6db75",
  "app/page.tsx": "441785fa60a015dc8b04cc987d3a766ea0c5fc042dc14fd8f755940d878937e7",
  "app/home.module.css": "c4b1f68d5a7d2ef2a0a37dee31a0d687b8797126d5faadb66518dcfd32fc014f",
  "scripts/hidden-gems.test.mjs": "8cb4f235e0b25cc50399763874c9ee62364c55dcc832faff3816207728112dba"
};
for(const [path,expected] of Object.entries(pins))if(hash(fs.readFileSync(new URL(path,root),'utf8').replace(/\r\n/g,'\n'))!==expected)throw Error('Hidden Gems input drift: '+path);
const curation=JSON.parse(fs.readFileSync(new URL('seed/research/hidden-gems-curation-2026-10-19.json',root),'utf8'));
for(const [path,expected] of Object.entries(curation.source_pins))if(hash(fs.readFileSync(new URL(path,root),'utf8').replace(/\r\n/g,'\n'))!==expected)throw Error('Editorial source drift: '+path);
assert.deepEqual(gemSelections.map(p=>p.slug),curation.selections.map(p=>p.product));
assert.deepEqual(gemSelections.map(p=>p.routeSlug),curation.selections.map(p=>p.route));
assert.equal(indexableGemCollection([]),false);assert.equal(curation.experiment_started,false);
console.log('PR5.116: three scoped editorial picks/source pins verified; live runtime qualification required. No new products/claims/SQL/secrets or analytics activation. Collection-specific telemetry and owner UI QA pending. Experiment not started.');
