import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {productivityInputs,buildProductivityWorkflow} from './build-productivity-workflow.mjs';
import {validateSeedBundle} from './validate.mjs';
import {escapeDefinitions,rankCandidates,publishable} from '../../lib/discovery/escape-model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const textHash=x=>createHash('sha256').update(x.replace(/\r\n/g,'\n')).digest('hex');
const REVIEW_HASH='f7d7fb834780724656c6cf3b390d34da3b65f1a295d566b10ce08a5e75e59eb9';
export const meditationScope='personal-adult-guided-meditation-selection-playback';
export function meditationInputs(){
 const i=productivityInputs();
 return {baseline:buildProductivityWorkflow(i.baseline,i.review).bundle,review:JSON.parse(fs.readFileSync(path.join(root,'seed/research/meditation-workflow-2026-10-15.json'),'utf8'))};
}
export function buildMeditationWorkflow(input,review){
 if(hash(review)!==REVIEW_HASH||hash(input)!==review.inputSha256||review.publicationApproved!==false||review.scope!==meditationScope)throw Error('Meditation review/input drift');
 for(const x of review.sourcePins)if(textHash(fs.readFileSync(path.join(root,x.path),'utf8'))!==x.sha256)throw Error('Meditation historical evidence drift');
 if(textHash(fs.readFileSync(path.join(root,review.engineTransition.path),'utf8'))!==review.engineTransition.newNormalizedSha256)throw Error('Scoped engine drift');
 if(input.products.some(p=>p.status!=='draft')||input.escapeRoutes.some(r=>r.status!=='draft'||r.editoriallyApproved))throw Error('Only unapproved draft fixtures supported');
 const bundle=structuredClone(input),keys={};
 for(const s of review.sources){const key='meditation-'+s.id.toLowerCase()+'-2026-10-15';if(bundle.sources.some(x=>x.key===key))throw Error('Meditation source collision');keys[s.id]=key;bundle.sources.push({key,title:s.title,url:s.url,publisher:s.publisher,sourceType:s.sourceType,retrievedAt:s.retrievedAt});}
 const evidence=ids=>ids.map(id=>{if(!keys[id])throw Error('Missing meditation source');return keys[id];});
 for(const c of review.candidates){
  const p=bundle.products.find(p=>p.slug===c.slug);if(!p)throw Error('Missing meditation candidate');
  for(const [slug,value] of [['no-subscription',true],['pricing-model',c.pricingModel],['trade-off-summary',c.tradeOffSummary]]){
   const old=p.attributes.find(a=>a.slug===slug),claim={slug,value,verificationStatus:'verified',confidence:c.confidence,lastVerifiedAt:review.date,evidence:[...new Set([...(old?.evidence??[]),...evidence(c.sourceIds)])]};
   if(old)p.attributes[p.attributes.indexOf(old)]=claim;else p.attributes.push(claim);
  }
  const old=p.anchors.find(a=>a.slug==='calm'&&a.relationshipType==='alternative');
  if(old?.scope&&old.scope!==meditationScope)throw Error('Existing Calm scope conflict');
  const anchor={...old,slug:'calm',relationshipType:'alternative',scope:meditationScope,scopeDescription:c.relationship,verificationStatus:'verified',confidence:c.confidence,lastVerifiedAt:review.date,evidence:[...new Set([...(old?.evidence??[]),...evidence(c.sourceIds)])]};
  if(old)p.anchors[p.anchors.indexOf(old)]=anchor;else p.anchors.push(anchor);
 }
 const route=bundle.escapeRoutes.find(r=>r.slug==='meditation-apps-without-a-subscription');if(!route)throw Error('Missing meditation route');
 route.description=review.description;route.lastVerifiedAt=review.date;
 // Preserve all existing memberships, positions and novelty values. This packet changes claims, not selection.
 const errors=validateSeedBundle(bundle);if(errors.length)throw Error(errors.join('\n'));
 const kinds=['attributes','anchors','problems','audiences'];
 const pages=bundle.products.map(p=>({slug:p.slug,name:p.name,description:p.shortDescription,websiteUrl:p.websiteUrl,status:p.status,...Object.fromEntries(kinds.map(k=>[k,p[k].map(c=>({...c,name:bundle[k].find(t=>t.slug===c.slug).name,description:c.scopeDescription??bundle[k].find(t=>t.slug===c.slug).description??null,sources:c.evidence.map(key=>{const s=bundle.sources.find(s=>s.key===key);return {title:s.title,url:s.url,retrievedAt:s.retrievedAt};})}))])),routes:bundle.escapeRoutes.filter(r=>r.products.some(m=>m.productSlug===p.slug)).map(r=>({slug:r.slug,name:r.name,description:r.description}))}));
 const def=escapeDefinitions.find(d=>d.slug===route.slug),candidates=rankCandidates(def,route.products.map(m=>({product:pages.find(p=>p.slug===m.productSlug),noveltyScore:m.noveltyScore??0})));
 if(candidates.filter(c=>c.eligible).length!==3)throw Error('Three bounded meditation draft candidates required');
 return {bundle,pages,report:{version:1,scope:meditationScope,publicationApproved:false,inputSha256:hash(input),reviewSha256:hash(review),newProducts:0,newMemberships:0,attributeUpdates:9,anchorUpdates:3,qualifiedDraftCandidates:3,qualifiedPublishedCandidates:0,publishable:publishable({published:false,candidates}),environment:review.metadata,anchorLimit:'Calm sampled access explicitly limited to three free listens; reset/counting unknown.',candidates:candidates.map(c=>({slug:c.product.slug,eligible:c.eligible,quality:c.quality,blockers:c.blockers}))}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('No arguments supported');const i=meditationInputs(),r=buildMeditationWorkflow(i.baseline,i.review),out=path.join(root,'.seed-output/meditation-draft');fs.mkdirSync(out,{recursive:true});for(const [name,value] of Object.entries({bundle:r.bundle,'product-preview':r.pages,'meditation-workflow-review':r.report}))fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(value,null,2)+'\n');console.log('PR5.56: three bounded meditation draft candidates; zero published, no database or remote writes.');}catch(e){console.error(e.message);process.exitCode=1;}
}
