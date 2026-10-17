import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {latestPublicationAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const review=JSON.parse(fs.readFileSync(path.join(root,'seed/research/privacy-writing-readiness-2026-10-17.json'),'utf8'));
if(process.argv.length!==2||createHash('sha256').update(JSON.stringify(review)).digest('hex')!=='e933cefe3698930b5b13fcfcd8f28e04782acb2e110b7c5008fa385821135f36')throw Error('Privacy research content drift');
if(!review.researchOnly||review.graphChanges||review.publicationApproved||review.qualifiedNewCandidates!==0)throw Error('Research boundary drift');
for(const source of review.provenance){if(createHash('sha256').update(fs.readFileSync(path.join(root,source.path),'utf8').replace(/\r\n/g,'\n')).digest('hex')!==source.sha256)throw Error('Readiness provenance drift: '+source.path);}
const axes=['processing','retention','training','cloud','telemetry','workflow'];
if(review.editions.length!==6||new Set(review.editions.map(x=>x.id)).size!==6||review.editions.some(x=>axes.some(a=>!x.axes[a])||!x.materialBlockers.length||x.ownerActionRequiredNow))throw Error('Edition or readiness boundary drift');
const audit=latestPublicationAudit(),privacy=audit.routes.find(x=>x.slug==='privacy-friendly-grammarly-alternatives');
if(audit.publishedProducts!==21||audit.acceptedPublishedRoutes!==9||audit.remainingRoutes!==1||!privacy||privacy.publication!=='not-published'||privacy.qualifiedDraftGraphCandidates!==0)throw Error('Accepted checkpoint or privacy qualification drift');
console.log('PR5.82: six distinct editions / six evidence axes; ten source receipts pinned.');
console.log('Priority: read-only local CLI source audit. Accepted 21/9/1; zero privacy qualifications.');
