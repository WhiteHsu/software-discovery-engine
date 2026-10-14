import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {currentRouteAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const r=JSON.parse(fs.readFileSync(path.join(root,'seed/research/writing-owner-corpus-2026-10-14.json'),'utf8'));
const p=JSON.parse(fs.readFileSync(path.join(root,r.corpus.source),'utf8'));
if(process.argv.length!==2||createHash('sha256').update(JSON.stringify(r)).digest('hex')!=='b8e083f6b2cd7675b38e546a2360f0cac065e5982e5c22dddf1858d037e52369'||r.researchOnly!==true||r.publicationApproved!==false||r.graphChanges!==false||r.membershipChanges!==false||r.engineChanges!==false||r.qualifiedNewCandidates!==0||r.results.length!==10)throw Error('Research content/scope drift');
for(const result of r.results){const sample=p.samples.find(s=>s.id===result.caseId);if(!sample||sample.before!==result.before.input||sample.manualAfter!==result.after.input)throw Error('Common corpus mismatch');}
const a=currentRouteAudit();
if(a.publishedProducts!==15||a.acceptedPublishedRoutes!==7||a.remainingRoutes!==3)throw Error('Accepted checkpoint drift');
for(const slug of ['grammarly-alternatives-without-a-subscription','privacy-friendly-grammarly-alternatives']){
 const route=a.routes.find(x=>x.slug===slug);
 if(!route||route.publication!=='not-published'||route.qualifiedDraftGraphCandidates!==0)throw Error('Grammarly baseline drift');
}
console.log('PR5.50: ten owner-observed Grazie/Grammarly corpus cases; 15/15 runnable cases observed including historical Hemingway.');
console.log('Pro examples and daily-masked suggestions are not stable Free entitlements; PWA lifetime remains not-entitled.');
console.log('Static record/corpus/checkpoint check only; no live browser or screenshot validation by this command. Checkpoint 15/7/3; no writes.');
