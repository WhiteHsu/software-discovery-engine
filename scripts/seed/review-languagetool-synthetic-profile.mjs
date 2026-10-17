import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {latestPublicationAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const review=JSON.parse(fs.readFileSync(path.join(root,'seed/research/languagetool-synthetic-profile-2026-10-17.json'),'utf8'));
if(process.argv.length!==2||createHash('sha256').update(JSON.stringify(review)).digest('hex')!=='400cddf84e3d8b7e5ecf8db9cc76556da11248db8e06392e911586a7014fdf28')throw Error('Privacy research content drift');
if(!review.researchOnly||review.graphChanges||review.publicationApproved||review.qualifiedNewCandidates!==0)throw Error('Research boundary drift');
for(const item of [...review.implementationPins,...review.priorEvidence]){if(createHash('sha256').update(fs.readFileSync(path.join(root,item.path),'utf8').replace(/\r\n/g,'\n')).digest('hex')!==item.utf8LfSha256)throw Error('Profile provenance drift: '+item.path);}
const audit=latestPublicationAudit(),privacy=audit.routes.find(x=>x.slug==='privacy-friendly-grammarly-alternatives');
if(audit.publishedProducts!==21||audit.acceptedPublishedRoutes!==9||audit.remainingRoutes!==1||!privacy||privacy.publication!=='not-published'||privacy.qualifiedDraftGraphCandidates!==0)throw Error('Accepted checkpoint or privacy qualification drift');
console.log('PR5.85: four synthetic stdin cases, summary boundary and owned-temp cleanup recorded.');
console.log('No full privacy qualification. Accepted21/9/1; zero new qualifications.');
