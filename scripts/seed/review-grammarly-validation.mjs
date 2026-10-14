import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {currentRouteAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const r=JSON.parse(fs.readFileSync(path.join(root,'seed/research/grammarly-workflow-validation-2026-10-14.json'),'utf8'));
if(process.argv.length!==2||createHash('sha256').update(JSON.stringify(r)).digest('hex')!=='3883f194302e1a313aab7ef325690e468614fe33345d279025bcbddc7a82f133'||r.researchOnly!==true||r.publicationApproved!==false||r.graphChanges!==false||r.membershipChanges!==false||r.engineChanges!==false||r.qualifiedNewCandidates!==0)throw Error('Research content/scope drift');
const a=currentRouteAudit();
if(a.publishedProducts!==15||a.acceptedPublishedRoutes!==7||a.remainingRoutes!==3)throw Error('Accepted checkpoint drift');
for(const slug of ['grammarly-alternatives-without-a-subscription','privacy-friendly-grammarly-alternatives']){
 const route=a.routes.find(x=>x.slug===slug);
 if(!route||route.publication!=='not-published'||route.qualifiedDraftGraphCandidates!==0)throw Error('Grammarly baseline drift');
}
console.log('PR5.46: five anonymous checker observations; screenshots recorded separately in ZIP evidence/.');
console.log('Sample-specific feedback only; authenticated Basic and paid candidate apps were not tested.');
console.log('Current three-edition style proposal cannot advance. Classic store terms body empty, paid rights unresolved.');
console.log('Checkpoint 15/7; zero new qualified candidates. No writes, network access or browser automation.');
