import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash=x=>createHash('sha256').update(x).digest('hex');
// Explicit reviewed transitions only: pre-meditation, meditation scope, writing scope.
// Issue #21: explicit hashes for scoped proposal and registered route; historical ten rubrics remain unchanged.
const engineVersions=['5a22ee8c87971aaa04e6bf7a5f6dc1cd2c1b9fc0f9b21403c32c38e52ec66a59','a4f09d0547e9f52c72590d6c73efcba58c9ba3579df0579b28090daefd5d6b54','61829cd748ca679821ab6371d108d9e614fa31980fc333eeceaa390ee1eaee0e','8f0b4ab061439cced108b079bd25ef5ebc169d5030afd4cfa09ab787c69f1854','cb81cd116102fc1ff4055fd361e8feadc2b8f63fdf79ab7fd550c50ee09ec7fc'];
export function historicalInputMatches(root,file,expected){
 const actual=hash(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'));
 return actual===expected || (file==='lib/discovery/escape-model.ts' && engineVersions.includes(expected) && engineVersions.includes(actual));
}
