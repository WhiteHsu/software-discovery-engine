import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {meditationInputs,buildMeditationWorkflow} from './build-meditation-workflow.mjs';
import {validateSeedBundle} from './validate.mjs';
import {escapeDefinitions,rankCandidates,publishable} from '../../lib/discovery/escape-model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=x=>createHash('sha256').update(x).digest('hex');
export const writingScope='personal-english-passive-construction-review';
export function writingInputs(){
 const i=meditationInputs();
 return {baseline:buildMeditationWorkflow(i.baseline,i.review).bundle,review:JSON.parse(fs.readFileSync(path.join(root,'seed/research/writing-passive-workflow-2026-10-15.json'),'utf8'))};
}
export function buildWritingWorkflow(input,review){
 if(hash(JSON.stringify(review))!=='e6209062e3751f581a54b8680da354e570026f61900bc2d880badf954635d7a2'||hash(JSON.stringify(input))!==review.inputSha256||review.publicationApproved!==false||review.scope!==writingScope)throw Error('Writing input/review drift');
 for(const x of review.sourcePins)if(hash(fs.readFileSync(path.join(root,x.path),'utf8').replace(/\r\n/g,'\n'))!==x.sha256)throw Error('Writing historical evidence drift');
 if(hash(fs.readFileSync(path.join(root,review.engineTransition.path),'utf8').replace(/\r\n/g,'\n'))!==review.engineTransition.newNormalizedSha256)throw Error('Writing scoped engine drift');
 if(input.products.some(p=>p.status!=='draft')||input.escapeRoutes.some(r=>r.status!=='draft'||r.editoriallyApproved))throw Error('Only unapproved draft fixtures supported');
 const bundle=structuredClone(input),keys={};
 for(const s of review.sources){const key='writing67-'+s.id.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-2026-10-15';if(bundle.sources.some(x=>x.key===key)||Object.values(keys).includes(key))throw Error('Writing source collision');keys[s.id]=key;bundle.sources.push({key,title:s.title,url:s.url,publisher:s.publisher,sourceType:s.sourceType,retrievedAt:s.retrievedAt});}
 const evidence=ids=>[...new Set(ids.map(id=>{if(!keys[id])throw Error('Missing reviewed source: '+id);return keys[id];}))];
 const route=bundle.escapeRoutes.find(r=>r.slug==='grammarly-alternatives-without-a-subscription');
 if(!route)throw Error('Missing writing route');
 let position=Math.max(0,...route.products.map(x=>x.position??0));
 for(const c of review.candidates){
  if(bundle.products.some(p=>p.slug===c.slug)||route.products.some(p=>p.productSlug===c.slug))throw Error('Writing identity collision');
  const claim={verificationStatus:'verified',confidence:c.confidence,lastVerifiedAt:review.date,evidence:evidence(c.sourceIds)};
  bundle.products.push({slug:c.slug,name:c.name,shortDescription:c.shortDescription,websiteUrl:c.websiteUrl,status:'draft',anchors:[{...claim,slug:'grammarly',relationshipType:'alternative',scope:writingScope,scopeDescription:c.relationship}],attributes:[{...claim,slug:'no-subscription',value:true},{...claim,slug:'pricing-model',value:c.pricingModel},{...claim,slug:'trade-off-summary',value:c.tradeOffSummary}],problems:[],audiences:[]});
  route.products.push({productSlug:c.slug,position:++position,noveltyScore:0});
 }
 route.description=review.description;route.lastVerifiedAt=review.date;
 const errors=validateSeedBundle(bundle);if(errors.length)throw Error(errors.join('\n'));
 const kinds=['attributes','anchors','problems','audiences'];
 const pages=bundle.products.map(p=>({slug:p.slug,name:p.name,description:p.shortDescription,websiteUrl:p.websiteUrl,status:p.status,...Object.fromEntries(kinds.map(k=>[k,p[k].map(c=>({...c,name:bundle[k].find(t=>t.slug===c.slug).name,description:c.scopeDescription??bundle[k].find(t=>t.slug===c.slug).description??null,sources:c.evidence.map(key=>{const s=bundle.sources.find(s=>s.key===key);return {title:s.title,url:s.url,retrievedAt:s.retrievedAt};})}))])),routes:bundle.escapeRoutes.filter(r=>r.products.some(m=>m.productSlug===p.slug)).map(r=>({slug:r.slug,name:r.name,description:r.description}))}));
 const def=escapeDefinitions.find(d=>d.slug===route.slug),candidates=rankCandidates(def,route.products.map(m=>({product:pages.find(p=>p.slug===m.productSlug),noveltyScore:m.noveltyScore??0})));
 const eligible=candidates.filter(c=>c.eligible).map(c=>c.product.slug).sort();
 if(JSON.stringify(eligible)!==JSON.stringify(review.candidates.map(c=>c.slug).sort()))throw Error('Exactly three reviewed writing drafts must qualify');
 return {bundle,pages,report:{scope:writingScope,newProducts:3,newAttributeClaims:9,newScopedAnchors:3,newMemberships:3,qualifiedDraftCandidates:3,qualifiedPublishedCandidates:0,publishable:publishable({published:false,candidates}),publicationApproved:false,liveCollisionChecked:false,acceptedCheckpoint:{products:18,routes:8,remaining:2},candidates:candidates.map(c=>({slug:c.product.slug,eligible:c.eligible,quality:c.quality,blockers:c.blockers}))}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('No arguments supported');const i=writingInputs(),r=buildWritingWorkflow(i.baseline,i.review),out=path.join(root,'.seed-output/writing-passive-draft');fs.mkdirSync(out,{recursive:true});for(const [name,value] of Object.entries({bundle:r.bundle,'product-preview':r.pages,'writing-workflow-review':r.report}))fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(value,null,2)+'\n');console.log('PR5.67: three scoped local writing draft candidates qualify; zero published. No database writes.');}catch(e){console.error(e.message);process.exitCode=1;}
}
