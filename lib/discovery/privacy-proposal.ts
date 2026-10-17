import {evaluateCandidate,escapeDefinitions,type Candidate} from './escape-model.ts';
import {supported} from './model.ts';
export const privacyOperation='personal-english-passive-construction-review';
export type PrivacyProfile={slug:string;profileId:string;statement:string;axes:Record<string,{summary:string;reviewedAt:string;evidence:string[];materialUnknown:boolean}>};
export function evaluatePrivacyProposal(candidate:Candidate,profile:PrivacyProfile){
  const def={...escapeDefinitions.find(x=>x.slug==='privacy-friendly-grammarly-alternatives')!,relationshipScope:privacyOperation};
  const base=evaluateCandidate(def,candidate),p=candidate.product,blockers=[...base.blockers];
  const a=p.anchors.find(x=>x.slug==='grammarly'&&x.relationshipType==='alternative');
  const local=p.attributes.find(x=>x.slug==='reviewed-local-operation');
  if(p.slug!==profile.slug||!profile.profileId||a?.scope!==privacyOperation||!local||local.value!==profile.statement||local.verificationStatus!=='verified'||!supported(local)||!local.lastVerifiedAt||!Number.isFinite(Date.parse(local.lastVerifiedAt))||(local.confidence??0)<.8)blockers.push('Exact edition and reviewed local operation must match the scoped relationship and dated evidence.');
  if(['processing','retention','training','integrations','telemetry','rights'].some(k=>!profile.axes[k]?.summary||!profile.axes[k]?.evidence?.length||!Number.isFinite(Date.parse(profile.axes[k]?.reviewedAt))||profile.axes[k].materialUnknown!==false))blockers.push('A material selected-operation evidence axis is unresolved.');
  return {...base,blockers:[...new Set(blockers)],eligible:blockers.length===0,score:blockers.length?0:base.score};
}
