import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {currentRouteAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const r=JSON.parse(fs.readFileSync(path.join(root,'seed/research/grammarly-validation-protocol-2026-10-14.json'),'utf8'));
if(process.argv.length!==2||createHash('sha256').update(JSON.stringify(r)).digest('hex')!=='c63f4b8c3a1f3806fe10291933b590280d7508efa4adbd8abaf9700faf9535fe'||r.researchOnly!==true||r.publicationApproved!==false||r.graphChanges!==false||r.membershipChanges!==false||r.engineChanges!==false||r.qualifiedNewCandidates!==0||r.resultProtocol.status!=='prepared-not-executed')throw Error('Protocol content/scope drift');
const a=currentRouteAudit();
if(a.publishedProducts!==15||a.acceptedPublishedRoutes!==7||a.remainingRoutes!==3)throw Error('Accepted checkpoint drift');
for(const slug of ['grammarly-alternatives-without-a-subscription','privacy-friendly-grammarly-alternatives']){
 const route=a.routes.find(x=>x.slug===slug);
 if(!route||route.publication!=='not-published'||route.qualifiedDraftGraphCandidates!==0)throw Error('Grammarly baseline drift');
}
console.log('PR5.48: five fixed short cases, four planned sessions; owner evidence intake prepared, not executed.');
console.log('Grazie browser Free numeric/zero-metering proofreading facts remain unknown. IDE evidence not transferred.');
console.log('Owner chose Grammarly Free and Chrome; PWA lifetime unavailable. Product evidence pending; no automatic tier substitution.');
console.log('Checkpoint 15/7; zero new qualified candidates. No writes.');
