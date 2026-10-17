import {escapeDefinitions,rankCandidates,evaluateCandidate,type EscapeDefinition,type Candidate,type Evaluation} from './escape-model.ts';
import {evaluatePrivacyProposal} from './privacy-proposal.ts';
import {reviewedPrivacyProfiles} from './privacy-reviewed-profiles.ts';
import type {ProductPage,Claim} from './model.ts';
export const privacyRouteSlug='privacy-friendly-grammarly-alternatives';
export function rankEscapeCandidates(def:EscapeDefinition,candidates:Candidate[]):Evaluation[]{
  if(def.slug!==privacyRouteSlug)return rankCandidates(def,candidates);
  const families=new Set<string>();
  return [...new Map(candidates.map(c=>[c.product.slug,c])).values()].map(c=>{
    const profile=reviewedPrivacyProfiles.find(x=>x.slug===c.product.slug);
    if(!profile){const base=evaluateCandidate(def,c);return {...base,eligible:false,score:0,blockers:[...base.blockers,'No reviewed local edition and operation profile is registered.']};}
    const result=evaluatePrivacyProposal(c,profile),local=c.product.attributes.find(x=>x.slug==='reviewed-local-operation')!;
    if(result.eligible){
      if(families.has(profile.family))return {...result,eligible:false,score:0,blockers:['Another edition of this product family already counts for this route.']};
      families.add(profile.family);
      return {...result,fit:[...result.fit,local],reasons:['Verified only for the reviewed local operation.','Read the version, setup, text-output and retention limits below.']};
    }
    return result;
  }).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.score-a.score||a.product.slug.localeCompare(b.product.slug));
}
export function reviewedPrivacyOperation(product:ProductPage):string|null{
  const def=escapeDefinitions.find(x=>x.slug===privacyRouteSlug)!;
  const result=rankEscapeCandidates(def,[{product}])[0];
  return result?.eligible?String(product.attributes.find(x=>x.slug==='reviewed-local-operation')!.value):null;
}
export function privacyClaimForDisplay(product:ProductPage,claim:Claim):Claim{
  return claim.slug==='privacy-friendly'&&!reviewedPrivacyOperation(product)?{...claim,verificationStatus:'unknown'}:claim;
}
