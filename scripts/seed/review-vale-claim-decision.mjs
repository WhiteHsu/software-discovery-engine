import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {preview} from './preview-scoped-privacy.mjs';
import {latestPublicationAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const review=JSON.parse(fs.readFileSync(path.join(root,'seed/research/vale-claim-decision-2026-10-17.json'),'utf8'));
if(process.argv.length!==2||createHash('sha256').update(JSON.stringify(review)).digest('hex')!=='a907fb63bf258162b512c3b33b2ae005b3646c9a3774ff9a1ad61226c4c9102b')throw Error('Claim decision content drift');
if(!review.researchOnly||review.graphChanges||review.publicationApproved||review.qualifiedNewCandidates!==0)throw Error('Proposal boundary drift');
for(const x of review.provenance){const text=fs.readFileSync(path.join(root,x.path),'utf8').replace(/\r\n/g,'\n');if(createHash('sha256').update(text).digest('hex')!==x.sha256)throw Error('Provenance drift: '+x.path);}
const report=preview(review);if(report.eligible!==3||!report.rows.every(x=>x.eligible)||!report.canPreparePublication)throw Error('Research decision drift');
const audit=latestPublicationAudit();if(audit.publishedProducts!==21||audit.acceptedPublishedRoutes!==9||audit.remainingRoutes!==1||audit.routes.find(x=>x.slug==='privacy-friendly-grammarly-alternatives')?.qualifiedDraftGraphCandidates!==0)throw Error('Public checkpoint drift');
console.log('PR5.98 審查成功：三款限定本機操作聲明獲研究支持。');
console.log('研究預覽3／3；正式圖譜仍0，公開21／9／1。可準備範圍／圖譜提案，尚未匯入或發佈。');
