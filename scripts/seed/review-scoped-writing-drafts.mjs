import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {latestPublicationAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const review=JSON.parse(fs.readFileSync(path.join(root,'seed/research/scoped-writing-drafts-2026-10-17.json'),'utf8'));
if(process.argv.length!==2||createHash('sha256').update(JSON.stringify(review)).digest('hex')!=='e520451e7737a67990794e595e3a61c20ad374fb94148ac49153c8e606c476af')throw Error('Privacy research content drift');
if(!review.researchOnly||review.graphChanges||review.publicationApproved||review.qualifiedNewCandidates!==0)throw Error('Research boundary drift');
const audit=latestPublicationAudit(),privacy=audit.routes.find(x=>x.slug==='privacy-friendly-grammarly-alternatives');
if(audit.publishedProducts!==21||audit.acceptedPublishedRoutes!==9||audit.remainingRoutes!==1||!privacy||privacy.publication!=='not-published'||privacy.qualifiedDraftGraphCandidates!==0)throw Error('Accepted checkpoint or privacy qualification drift');
for(const item of review.provenance){const value=fs.readFileSync(path.join(root,item.path),'utf8').replace(/\r\n/g,'\n');if(createHash('sha256').update(value).digest('hex')!==item.sha256)throw Error('Evidence provenance drift: '+item.path);}
console.log('PR5.94: three concrete scoped dossiers; selected Vale config/rule gate resolved. Draft only; accepted21/9/1; zero applied qualifications.');
