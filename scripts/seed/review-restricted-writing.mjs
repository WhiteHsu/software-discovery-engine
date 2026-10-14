import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {currentRouteAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=b=>createHash('sha256').update(b).digest('hex');
const r=JSON.parse(fs.readFileSync(path.join(root,'seed/research/restricted-writing-review-2026-10-14.json'),'utf8'));
if(process.argv.length!==2||hash(JSON.stringify(r))!=='c5a5e8b6430f6a398333d58230b45d36255dbdbd2783712e40aa292d68ae4ad2'||!r.researchOnly||r.publicationApproved||r.graphChanges||r.membershipChanges||r.engineChanges||r.qualifiedNewCandidates!==0)throw Error('Review drift');
for(const input of r.inputs)if(hash(fs.readFileSync(path.join(root,input.path)))!==input.sha256)throw Error('Historical evidence or engine input drift');
const a=currentRouteAudit();
if(a.publishedProducts!==15||a.acceptedPublishedRoutes!==7||a.remainingRoutes!==3)throw Error('Checkpoint drift');
for(const decision of r.routeDecisions){const route=a.routes.find(x=>x.slug===decision.slug);if(!route||route.publication!=='not-published'||route.qualifiedDraftGraphCandidates!==0)throw Error('Grammarly route drift');}
console.log('PR5.51: restricted workflow review complete; common exact-edition/Free-anchor evidence incomplete. Qualification and publication held.');
console.log('15/15 runnable observations are not 15 passed features or three alternatives. PWA lifetime remains not-entitled.');
console.log('Frozen evidence and checkpoint check only; no live product/vendor verification. Checkpoint 15/7/3; zero new candidates; no writes.');
