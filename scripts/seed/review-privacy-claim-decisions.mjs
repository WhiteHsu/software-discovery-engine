import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {preview} from './preview-scoped-privacy.mjs';
import {latestPublicationAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const review=JSON.parse(fs.readFileSync(path.join(root,'seed/research/privacy-claim-decisions-2026-10-17.json'),'utf8'));
if(process.argv.length!==2||createHash('sha256').update(JSON.stringify(review)).digest('hex')!=='c6a62f480c0cb1b52fa73df8add98e4e54aa8934777b317ee2b1734ee7cef9c3')throw Error('Claim decision content drift');
if(!review.researchOnly||review.graphChanges||review.publicationApproved||review.qualifiedNewCandidates!==0)throw Error('Proposal boundary drift');
for(const x of review.provenance){const text=fs.readFileSync(path.join(root,x.path),'utf8').replace(/\r\n/g,'\n');if(createHash('sha256').update(text).digest('hex')!==x.sha256)throw Error('Provenance drift: '+x.path);}
const report=preview(review);if(report.eligible!==1||report.rows.find(x=>x.eligible)?.slug!=='write-good-local-library-1-0-8'||report.canPreparePublication)throw Error('Research decision drift');
const audit=latestPublicationAudit();if(audit.publishedProducts!==21||audit.acceptedPublishedRoutes!==9||audit.remainingRoutes!==1||audit.routes.find(x=>x.slug==='privacy-friendly-grammarly-alternatives')?.qualifiedDraftGraphCandidates!==0)throw Error('Public checkpoint drift');
console.log('PR5.96 審查成功：write-good限定本機函式的研究聲明獲支持；LanguageTool與Vale待查。');
console.log('研究預覽1／3，正式圖譜仍0；公開21／9／1，尚不可發佈。這是正常結果。');
for(const row of report.rows)console.log(row.slug+': '+(row.eligible?'限定研究聲明通過':'保留待查'));
