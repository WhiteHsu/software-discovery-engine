import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {currentRouteAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=b=>createHash('sha256').update(b).digest('hex');
const r=JSON.parse(fs.readFileSync(path.join(root,'seed/research/grammarly-free-anchor-supplement-2026-10-14.json'),'utf8'));
if(process.argv.length!==2||hash(JSON.stringify(r))!=='22265cb3623f3d07946cfe49ff876eaf02957cfa15a7ee21ba6e1fe4d9afd151'||!r.researchOnly||r.publicationApproved||r.graphChanges||r.membershipChanges||r.engineChanges||r.qualifiedNewCandidates!==0)throw Error('Review drift');
// Historical raw-byte hashes retain their archived representation. Runtime checks normalize CRLF only.
const normalizedInputs={"seed/research/writing-owner-corpus-2026-10-14.json":"efb5b344f5a0d9fc810bb33c263fc6bdacbf65e68d155f406ff3c9f4288ab482","seed/research/restricted-writing-review-2026-10-14.json":"a82f87c649704d2a65517a171cc5179b8d6764da345ec629eac6bbfb1577da51"};
for(const input of r.inputs){
 const content=fs.readFileSync(path.join(root,input.path),'utf8').replace(/\r\n/g,'\n');
 if(hash(content)!==normalizedInputs[input.path])throw Error('Historical evidence or engine input drift: '+input.path);
}
const a=currentRouteAudit();
if(a.publishedProducts!==15||a.acceptedPublishedRoutes!==7||a.remainingRoutes!==3)throw Error('Checkpoint drift');
for(const decision of [{slug:'grammarly-alternatives-without-a-subscription'},{slug:'privacy-friendly-grammarly-alternatives'}]){const route=a.routes.find(x=>x.slug===decision.slug);if(!route||route.publication!=='not-published'||route.qualifiedDraftGraphCandidates!==0)throw Error('Grammarly route drift');}
console.log('PR5.52: official Free conciseness category retained; one supplemental Docs filler probe returned no feedback. Exact ordinary Free style operation remains unverified.');
console.log('Original 15/15 corpus unchanged; one separate probe; PWA lifetime not-entitled. Qualification/publication hold; checkpoint 15/7/3.');
console.log('Static record/input/checkpoint verification only; no live source, browser or screenshot validation; no writes.');
