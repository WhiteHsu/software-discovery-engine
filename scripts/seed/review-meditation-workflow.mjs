import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {currentRouteAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=b=>createHash('sha256').update(b).digest('hex');
const r=JSON.parse(fs.readFileSync(path.join(root,'seed/research/meditation-workflow-review-2026-10-14.json'),'utf8'));
if(process.argv.length!==2||hash(JSON.stringify(r))!=='df25630a5cc29311bb795874c0c6171c8d5eec23a940c079d85dc6147ae0ab8b'||!r.researchOnly||r.publicationApproved||r.graphChanges||r.membershipChanges||r.engineChanges||r.qualifiedNewCandidates!==0)throw Error('Review drift');
for(const x of r.inputs)if(hash(fs.readFileSync(path.join(root,x.path),'utf8').replace(/\r\n/g,'\n'))!==x.sha256)throw Error('Historical content drift: '+x.path);
const a=currentRouteAudit(),route=a.routes.find(x=>x.slug===r.routeAudit.slug);
if(a.publishedProducts!==15||a.acceptedPublishedRoutes!==7||a.remainingRoutes!==3||!route||route.publication!=='not-published'||route.curatedCandidates!==3||route.qualifiedDraftGraphCandidates!==0)throw Error('Checkpoint drift');
for(const c of r.candidates){const actual=route.candidates.find(x=>x.slug===c.slug);if(!actual||JSON.stringify(actual.blockers)!==JSON.stringify(c.baselineBlockers))throw Error('Candidate gate drift');}
console.log('PR5.53: three exact free meditation editions reviewed; personal adult guided-selection/playback proposed, not executed.');
console.log('Calm free content preserved; HMP free Public Subscription distinguished from recurring payment; source age/OS mismatch retained.');
console.log('Static research/checkpoint check only. Zero newly qualified candidates; 15 products/7 routes/3 remaining. No writes.');
