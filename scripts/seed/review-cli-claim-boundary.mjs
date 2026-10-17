import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {preview} from './preview-scoped-privacy.mjs';
import {latestPublicationAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const review=JSON.parse(fs.readFileSync(path.join(root,'seed/research/cli-claim-boundary-2026-10-17.json'),'utf8'));
if(process.argv.length!==2||createHash('sha256').update(JSON.stringify(review)).digest('hex')!=='53dbfcd4c65abbb490f24ee05cae29903ee5d698a98c321611e179052cd4b4da')throw Error('Claim decision content drift');
if(!review.researchOnly||review.graphChanges||review.publicationApproved||review.qualifiedNewCandidates!==0)throw Error('Proposal boundary drift');
for(const x of review.provenance){const text=fs.readFileSync(path.join(root,x.path),'utf8').replace(/\r\n/g,'\n');if(createHash('sha256').update(text).digest('hex')!==x.sha256)throw Error('Provenance drift: '+x.path);}
const report=preview(review);if(report.eligible!==2||report.rows.find(x=>x.slug==='vale-local-passive-3-24-0')?.eligible||report.canPreparePublication)throw Error('Research decision drift');
const audit=latestPublicationAudit();if(audit.publishedProducts!==21||audit.acceptedPublishedRoutes!==9||audit.remainingRoutes!==1||audit.routes.find(x=>x.slug==='privacy-friendly-grammarly-alternatives')?.qualifiedDraftGraphCandidates!==0)throw Error('Public checkpoint drift');
console.log('PR5.97 審查成功：LanguageTool條件式CLI聲明與write-good限定函式獲研究支持；Vale待查。');
console.log('研究預覽2／3，正式圖譜仍0；公開21／9／1，尚不可發佈。正常結果。');
