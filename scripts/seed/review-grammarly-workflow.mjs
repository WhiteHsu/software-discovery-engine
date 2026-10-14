import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {currentRouteAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const r=JSON.parse(fs.readFileSync(path.join(root,'seed/research/grammarly-workflow-review-2026-10-14.json'),'utf8'));
if(process.argv.length!==2||createHash('sha256').update(JSON.stringify(r)).digest('hex')!=='a1c7193c99d0dd34144f36f4c8f59815786a28dd46eedde1796a8b08d9929260'||r.researchOnly!==true||r.publicationApproved!==false||r.graphChanges!==false)throw Error('Research content/scope drift');
const audit=currentRouteAudit();
if(audit.publishedProducts!==15||audit.acceptedPublishedRoutes!==7||audit.remainingRoutes!==3)throw Error('Publication checkpoint drift');
for(const route of r.routes){const a=audit.routes.find(a=>a.slug===route.slug);if(!a||a.publication!=='not-published'||a.qualifiedDraftGraphCandidates!==0)throw Error('Qualification drift');}
console.log('PR5.42: four edition reviews, nine primary sources; no claims applied or new qualification.');
console.log('Accepted checkpoint: 15 products, 7/10 routes, 3 remaining. No writes.');
