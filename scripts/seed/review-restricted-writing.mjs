import {historicalInputMatches} from './historical-review-input.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {currentRouteAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=b=>createHash('sha256').update(b).digest('hex');
const r=JSON.parse(fs.readFileSync(path.join(root,'seed/research/restricted-writing-review-2026-10-14.json'),'utf8'));
if(process.argv.length!==2||hash(JSON.stringify(r))!=='c5a5e8b6430f6a398333d58230b45d36255dbdbd2783712e40aa292d68ae4ad2'||!r.researchOnly||r.publicationApproved||r.graphChanges||r.membershipChanges||r.engineChanges||r.qualifiedNewCandidates!==0)throw Error('Review drift');
// Historical raw-byte hashes retain their archived representation. Runtime checks normalize CRLF only.
const normalizedInputs={"seed/research/hemingway-common-corpus-2026-10-14.json":"a9f0d6bb1fd167446854d50d511bf992cf1225bc851867b22e2b27f26a78bfa7","seed/research/writing-owner-corpus-2026-10-14.json":"efb5b344f5a0d9fc810bb33c263fc6bdacbf65e68d155f406ff3c9f4288ab482","seed/research/grammarly-validation-protocol-2026-10-14.json":"a3186e89e2a84087921d049fa3ce4f53f48790afb434de3f87fc6d636ff5a99a","GRAMMARLY_REPLACEMENT_RESEARCH.md":"8d0ccc735fa2cf02187c0f00ee5408766c66e6faff8462d8c4dd86557ddc049c","lib/discovery/escape-model.ts":"61829cd748ca679821ab6371d108d9e614fa31980fc333eeceaa390ee1eaee0e"};
for(const input of r.inputs){
 if(!historicalInputMatches(root,input.path,normalizedInputs[input.path]))throw Error('Historical evidence or engine input drift: '+input.path);
}
const a=currentRouteAudit();
if(a.publishedProducts!==15||a.acceptedPublishedRoutes!==7||a.remainingRoutes!==3)throw Error('Checkpoint drift');
for(const decision of r.routeDecisions){const route=a.routes.find(x=>x.slug===decision.slug);if(!route||route.publication!=='not-published'||route.qualifiedDraftGraphCandidates!==0)throw Error('Grammarly route drift');}
console.log('PR5.51: restricted workflow review complete; common exact-edition/Free-anchor evidence incomplete. Qualification and publication held.');
console.log('15/15 runnable observations are not 15 passed features or three alternatives. PWA lifetime remains not-entitled.');
console.log('Frozen evidence and checkpoint check only; no live product/vendor verification. Checkpoint 15/7/3; zero new candidates; no writes.');
