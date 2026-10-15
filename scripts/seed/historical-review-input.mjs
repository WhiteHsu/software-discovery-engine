import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash=x=>createHash('sha256').update(x).digest('hex');
// Explicit reviewed transitions only: pre-meditation, meditation scope, writing scope.
const engineVersions=['61829cd748ca679821ab6371d108d9e614fa31980fc333eeceaa390ee1eaee0e','8f0b4ab061439cced108b079bd25ef5ebc169d5030afd4cfa09ab787c69f1854','cb81cd116102fc1ff4055fd361e8feadc2b8f63fdf79ab7fd550c50ee09ec7fc'];
export function historicalInputMatches(root,file,expected){
 const actual=hash(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'));
 return actual===expected || (file==='lib/discovery/escape-model.ts' && engineVersions.includes(expected) && engineVersions.includes(actual));
}
