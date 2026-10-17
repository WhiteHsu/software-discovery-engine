import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {evaluateCandidate} from '../../lib/discovery/escape-model.ts';
import {latestPublicationAudit} from '../escape-remaining-routes.mjs';
export const scope='personal-english-passive-construction-review';
export function evaluateScoped(candidate){
  const def={slug:'privacy-friendly-grammarly-alternatives',name:'Proposed scoped privacy route',anchor:'grammarly',relationshipScope:scope,constraints:['privacy-friendly']};
  const base=evaluateCandidate(def,candidate), p=candidate.product;
  const relationship=p.anchors.find(x=>x.slug==='grammarly'&&x.relationshipType==='alternative');
  const privacy=p.attributes.find(x=>x.slug==='privacy-friendly');
  const blockers=[...base.blockers];
  if(!candidate.profileId||relationship?.scope!==scope||privacy?.scope!==scope||candidate.relationshipProfile!==candidate.profileId||candidate.privacyProfile!==candidate.profileId)blockers.push('Relationship and privacy must use the same exact operation and edition profile.');
  const axes=['processing','retention','training','integrations','telemetry','rights'];
  if(!candidate.axes||axes.some(k=>!candidate.axes[k]?.summary||!candidate.axes[k]?.evidence?.length||!Number.isFinite(Date.parse(candidate.axes[k]?.reviewedAt))||candidate.axes[k].materialUnknown!==false))blockers.push('Six dated evidence axes must state selected-operation limits and have no unresolved material text path.');
  return {slug:p.slug,eligible:blockers.length===0,blockers:[...new Set(blockers)]};
}
export function preview(review){
  const seen=new Set();const rows=review.candidates.map(x=>{const row=evaluateScoped(x);if(seen.has(x.family)){row.eligible=false;row.blockers.push('Duplicate product family does not count toward three.');}seen.add(x.family);return row;});
  return {proposalOnly:true,appliedQualifications:0,eligible:rows.filter(x=>x.eligible).length,minimum:3,canPreparePublication:rows.filter(x=>x.eligible).length>=3,rows};
}
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(process.argv.length!==2)throw Error('No arguments supported');
  const review=JSON.parse(fs.readFileSync(path.join(root,'seed/research/scoped-privacy-preview-2026-10-17.json'),'utf8'));
  if(createHash('sha256').update(JSON.stringify(review)).digest('hex')!=='b7760e6ef01f957a0fd750b8caf289b46663f9e83947a15a76672d32843e5619')throw Error('Proposal content drift');
  if(!review.researchOnly||review.graphChanges||review.publicationApproved||review.qualifiedNewCandidates!==0)throw Error('Proposal boundary drift');
  for(const x of review.provenance){const text=fs.readFileSync(path.join(root,x.path),'utf8').replace(/\r\n/g,'\n');if(createHash('sha256').update(text).digest('hex')!==x.sha256)throw Error('Provenance drift: '+x.path);}
  const audit=latestPublicationAudit();if(audit.publishedProducts!==21||audit.acceptedPublishedRoutes!==9||audit.remainingRoutes!==1||audit.routes.find(x=>x.slug==='privacy-friendly-grammarly-alternatives')?.qualifiedDraftGraphCandidates!==0)throw Error('Publication checkpoint drift');
  const result=preview(review);if(result.eligible!==0)throw Error('Unreviewed privacy proposal unexpectedly qualified');
  console.log(JSON.stringify(result,null,2));
}
