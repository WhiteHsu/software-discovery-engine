import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {currentRouteAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const raw=fs.readFileSync(path.join(root,'seed/research/grammarly-replacement-research-2026-10-14.json'),'utf8');
const r=JSON.parse(raw);
if(process.argv.length!==2||createHash('sha256').update(raw.replaceAll('\r\n','\n')).digest('hex')!=='c02c3f86bb8104ebea8abd84e9545ab60a37a44e92829b1f5114c004b79b4b47'||r.researchOnly!==true||r.publicationApproved!==false||r.graphChanges!==false||r.membershipChanges!==false||r.engineChanges!==false||r.qualifiedNewCandidates!==0)throw Error('Research content/scope drift');
const a=currentRouteAudit();
if(a.publishedProducts!==15||a.acceptedPublishedRoutes!==7||a.remainingRoutes!==3)throw Error('Accepted checkpoint drift');
for(const slug of ['grammarly-alternatives-without-a-subscription','privacy-friendly-grammarly-alternatives']){
 const route=a.routes.find(x=>x.slug===slug);
 if(!route||route.publication!=='not-published'||route.qualifiedDraftGraphCandidates!==0)throw Error('Grammarly baseline drift');
}
console.log('PR5.47: Grazie Free extension is a research lead; Hemingway free web is explicitly separate from Classic.');
console.log('Free web before/after observed; Grazie/PWA entitled-session and full common-operation validation pending.');
console.log('Current proposal only; no identity or memberships applied. Checkpoint 15/7, zero new qualified candidates. No writes.');
