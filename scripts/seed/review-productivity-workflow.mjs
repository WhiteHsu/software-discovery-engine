import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditRemainingRoutes} from '../escape-remaining-routes.mjs';
import {pdfWorkflowInputs,buildPdfWorkflow} from './build-pdf-workflow.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const review=JSON.parse(fs.readFileSync(path.join(root,'seed/research/productivity-workflow-review-2026-10-13.json'),'utf8'));
if(process.argv.length!==2||review.packet!=='PR5.35'||review.researchOnly!==true||review.publicationApproved!==false||review.graphChanges!==false||review.scope!=='personal-task-capture-project-organization-and-scheduling'||JSON.stringify(review.candidates.map(c=>c.slug))!==JSON.stringify(['things','omnifocus','2do'])||review.candidates[2].purchaseReview!=='pending')throw Error('Unexpected research scope or approval/purchase state');
// PR5.35 is a historical review; reconstruct its original dated checkpoint.
const inputs=pdfWorkflowInputs(),result=buildPdfWorkflow(inputs.baseline,inputs.review);
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const audit=auditRemainingRoutes(result.bundle,result.pages,read('seed/research/publication-checkpoint-2026-10-13.json'),read('seed/research/escape-content-2026-10-07.json'));
const route=audit.routes.find(r=>r.slug===review.route);
if(audit.publishedProducts!==15||audit.acceptedPublishedRoutes!==6||audit.remainingRoutes!==4||!route||route.qualifiedDraftGraphCandidates!==0)throw Error('Checkpoint or qualification drift: inspect before proceeding');
console.log('PR5.35 research only: 3 documented workflows; 2 purchase reviews documented, 2Do terms pending.');
console.log('Accepted: 15 products, 6/10 routes; 4 remaining. Productivity qualification unchanged: 0. No writes.');
