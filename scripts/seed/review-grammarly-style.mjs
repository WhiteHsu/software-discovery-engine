import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {currentRouteAudit} from '../escape-remaining-routes.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const r=JSON.parse(fs.readFileSync(path.join(root,'seed/research/grammarly-style-review-2026-10-14.json'),'utf8'));
const digest=createHash('sha256').update(JSON.stringify(r)).digest('hex');
if(process.argv.length!==2||digest!=='4991228e276018a39738259bb5fb4b0a13d2025ab56605ff1d6ac26e09122614'
  ||r.researchOnly!==true||r.publicationApproved!==false||r.graphChanges!==false
  ||r.membershipChanges!==false||r.engineChanges!==false||r.qualifiedNewCandidates!==0){
  throw Error('Research content or scope drift');
}
const a=currentRouteAudit();
if(a.publishedProducts!==15||a.acceptedPublishedRoutes!==7||a.remainingRoutes!==3){
  throw Error('Accepted checkpoint drift');
}
for(const slug of ['grammarly-alternatives-without-a-subscription','privacy-friendly-grammarly-alternatives']){
  const route=a.routes.find(x=>x.slug===slug);
  if(!route||route.publication!=='not-published'||route.qualifiedDraftGraphCandidates!==0){
    throw Error('Grammarly baseline qualification/publication drift');
  }
}
console.log('PR5.44: 17 source observations; restricted short English prose review prepared.');
console.log('Hemingway current paid terms and LanguageTool Basic per-rule entitlements remain pending.');
console.log('LanguageTool character-limit conflict retained; ProWritingAid Premium lifetime is an online personal account service.');
console.log('Manual product validation not performed. Zero new qualified candidates. Checkpoint 15/7; no writes.');
