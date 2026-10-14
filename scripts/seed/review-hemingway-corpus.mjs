import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {currentRouteAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const r=JSON.parse(fs.readFileSync(path.join(root,'seed/research/hemingway-common-corpus-2026-10-14.json'),'utf8'));
const p=JSON.parse(fs.readFileSync(path.join(root,r.corpus.source),'utf8'));
if(process.argv.length!==2||createHash('sha256').update(JSON.stringify(r)).digest('hex')!=='672d75a0e59f0aa3e54055f7d162dc0b13a7ed82668a3dfe5060d738d461b850'||r.researchOnly!==true||r.publicationApproved!==false||r.graphChanges!==false||r.membershipChanges!==false||r.engineChanges!==false||r.qualifiedNewCandidates!==0||r.results.length!==5)throw Error('Research content/scope drift');
for(const result of r.results){const sample=p.samples.find(s=>s.id===result.caseId);if(!sample||sample.before!==result.before.input||sample.manualAfter!==result.after.input)throw Error('Common corpus mismatch');}
const a=currentRouteAudit();
if(a.publishedProducts!==15||a.acceptedPublishedRoutes!==7||a.remainingRoutes!==3)throw Error('Accepted checkpoint drift');
for(const slug of ['grammarly-alternatives-without-a-subscription','privacy-friendly-grammarly-alternatives']){
 const route=a.routes.find(x=>x.slug===slug);
 if(!route||route.publication!=='not-published'||route.qualifiedDraftGraphCandidates!==0)throw Error('Grammarly baseline drift');
}
console.log('PR5.49: five Hemingway corpus cases observed; three flag-only, redundancy/control no related feedback.');
console.log('Ten Grazie/Grammarly cases not run; five PWA lifetime cases not-entitled. Not five passed features.');
console.log('Static record/corpus/checkpoint check only; no live browser test or screenshot verification by this command.');
console.log('Checkpoint 15/7; zero new qualified candidates. No writes.');
