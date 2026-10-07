import { supported, safeUrl, type Claim, type ProductPage } from "./model.ts";

export const escapeDefinitions = [
  {slug:"offline-notion-alternatives",name:"Offline Notion Alternatives",anchor:"notion",constraints:["works-offline"]},
  {slug:"notion-alternatives-without-ai",name:"Notion Alternatives Without AI",anchor:"notion",constraints:["ai-optional"]},
  {slug:"simple-notion-alternatives",name:"Simple Notion Alternatives",anchor:"notion",constraints:["focused-note-taking","no-database-required","minimal-setup"]},
  {slug:"todoist-alternatives-with-a-one-time-purchase",name:"Todoist Alternatives With a One-Time Purchase",anchor:"todoist",relationshipScope:"personal-task-project-organization",constraints:["one-time-purchase"]},
  {slug:"privacy-friendly-grammarly-alternatives",name:"Privacy-Friendly Grammarly Alternatives",anchor:"grammarly",constraints:["privacy-friendly"]},
  {slug:"grammarly-alternatives-without-a-subscription",name:"Grammarly Alternatives Without a Subscription",anchor:"grammarly",constraints:["no-subscription"]},
  {slug:"photoshop-alternatives-without-a-subscription",name:"Photoshop Alternatives Without a Subscription",anchor:"photoshop",constraints:["no-subscription"]},
  {slug:"pdf-editors-without-a-subscription",name:"PDF Editors Without a Subscription",anchor:"adobe-pdf",constraints:["no-subscription"]},
  {slug:"meditation-apps-without-a-subscription",name:"Meditation Apps Without a Subscription",anchor:"calm",constraints:["no-subscription"]},
  {slug:"productivity-apps-you-can-buy-once",name:"Productivity Apps You Can Buy Once",anchor:null,constraints:["one-time-purchase"],audience:"productivity-users"},
] as const;
export type EscapeDefinition = typeof escapeDefinitions[number];
export type Candidate = {product:ProductPage; noveltyScore?:number|null};
export type Evaluation = Candidate & {eligible:boolean; reasons:string[]; blockers:string[]; quality:number; score:number; fit:Claim[]};
export type EscapePage = {slug:string;name:string;description:string|null;lastVerifiedAt:string|null;published:boolean;candidates:Evaluation[]};
const verified=(c:Claim|undefined):c is Claim => !!c && c.verificationStatus==="verified" && supported(c) && !!c.lastVerifiedAt && Number.isFinite(Date.parse(c.lastVerifiedAt));
const bounded=(n:unknown):n is number => typeof n==="number" && Number.isFinite(n) && n>=0 && n<=1;
export function evaluateCandidate(def:EscapeDefinition,candidate:Candidate):Evaluation {
  const p=candidate.product, blockers:string[]=[], fit:Claim[]=[];
  if(!safeUrl(p.websiteUrl))blockers.push("Official website is unavailable.");
  if(def.anchor){const a=p.anchors.find(c=>c.slug===def.anchor && c.relationshipType==="alternative");
    if(!verified(a))blockers.push("The anchor alternative relationship is not verified with dated evidence.");
    else if("relationshipScope" in def && a.scope!==def.relationshipScope)blockers.push("The alternative relationship must be reviewed for personal task and project organization.");
    else fit.push(a);}
  if("audience" in def){const a=p.audiences.find(c=>c.slug===def.audience);if(!verified(a))blockers.push("The productivity audience fit is unconfirmed.");else fit.push(a);}
  for(const slug of def.constraints){const c=p.attributes.find(c=>c.slug===slug);if(!verified(c)||c.value!==true)blockers.push(`${slug}: verified positive evidence is required.`);else fit.push(c);}
  for(const slug of ["pricing-model","trade-off-summary"]){const c=p.attributes.find(c=>c.slug===slug);if(!verified(c)||typeof c.value!=="string"||!c.value.trim())blockers.push(`${slug}: meaningful sourced information is required.`);else fit.push(c);}
  const quality=fit.length && fit.every(c=>bounded(c.confidence))?Math.min(...fit.map(c=>c.confidence!)):0;
  if(quality<.8)blockers.push("Evidence confidence is below the 0.80 quality threshold.");
  const eligible=blockers.length===0;
  // Novelty can move an eligible candidate by at most 0.05; it never qualifies a candidate.
  const novelty=bounded(candidate.noveltyScore)?candidate.noveltyScore:0;
  return {...candidate,eligible,blockers,fit,quality,score:eligible?quality+novelty*.05:0,reasons:eligible?[`Verified fit for ${def.name}.`,"Pricing and trade-offs have dated source evidence."]:[]};
}
export function rankCandidates(def:EscapeDefinition,candidates:Candidate[]) {
  const unique=Array.from(new Map(candidates.map(c=>[c.product.slug,c])).values());
  return unique.map(c=>evaluateCandidate(def,c)).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.score-a.score||a.product.slug.localeCompare(b.product.slug));
}
export function publishable(page:EscapePage) {return page.published && page.candidates.filter(c=>c.eligible&&c.product.status==="published").length>=3;}
