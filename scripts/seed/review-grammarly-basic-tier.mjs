import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {currentRouteAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const r=JSON.parse(fs.readFileSync(path.join(root,'seed/research/grammarly-basic-tier-review-2026-10-14.json'),'utf8'));
if(process.argv.length!==2||createHash('sha256').update(JSON.stringify(r)).digest('hex')!=='bc3afcf519c0bd601f246b96a1f1b19c8f94cf7f124445023d5e5c549bff06de'||r.researchOnly!==true||r.publicationApproved!==false||r.graphChanges!==false||r.membershipChanges!==false||r.engineChanges!==false||r.qualifiedNewCandidates!==0)throw Error('Research content/scope drift');
const a=currentRouteAudit();
if(a.publishedProducts!==15||a.acceptedPublishedRoutes!==7||a.remainingRoutes!==3)throw Error('Accepted checkpoint drift');
for(const slug of ['grammarly-alternatives-without-a-subscription','privacy-friendly-grammarly-alternatives']){
 const route=a.routes.find(x=>x.slug===slug);
 if(!route||route.publication!=='not-published'||route.qualifiedDraftGraphCandidates!==0)throw Error('Grammarly baseline drift');
}
console.log('PR5.45: two official English tables cross-checked; selected Wordiness row is Premium-only.');
console.log('Hold the Basic shared-wordiness research proposal; no blanket rejection of Basic style checking.');
console.log('Character-limit conflict and Classic current paid terms remain unresolved.');
console.log('Checkpoint 15/7; zero new qualified candidates. No graph changes or writes.');
