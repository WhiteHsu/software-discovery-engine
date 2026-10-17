import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {writingInputs,buildWritingWorkflow} from './build-writing-passive-workflow.mjs';
import {validateSeedBundle} from './validate.mjs';
import {evaluatePrivacyProposal,privacyOperation} from '../../lib/discovery/privacy-proposal.ts';
import {publishable} from '../../lib/discovery/escape-model.ts';
import {latestPublicationAudit} from '../escape-remaining-routes.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=x=>createHash('sha256').update(x).digest('hex');
export function privacyInputs(){const i=writingInputs();return {baseline:buildWritingWorkflow(i.baseline,i.review).bundle,decision:JSON.parse(fs.readFileSync(path.join(root,'seed/research/vale-claim-decision-2026-10-17.json'),'utf8')),review:JSON.parse(fs.readFileSync(path.join(root,'seed/research/privacy-graph-proposal-2026-10-17.json'),'utf8'))};}
export function buildPrivacyGraph(baseline,decision,review){
  if(hash(JSON.stringify(review))!=='cf66eb7e61bf44d73d28d970f5c34115176993077ceaae873a2fe14150a97603')throw Error('Review content drift');
  if(hash(JSON.stringify(baseline))!==review.baselineHash||hash(JSON.stringify(decision))!==review.decisionHash||review.publicationApproved!==false||review.graphChanges!==false)throw Error('Proposal input drift');
  for(const x of review.provenance){if(hash(fs.readFileSync(path.join(root,x.path),'utf8').replace(/\r\n/g,'\n'))!==x.sha256)throw Error('Provenance drift');}
  const bundle=structuredClone(baseline),newSlugs=decision.candidates.map(x=>x.product.slug),profiles=[];
  if(new Set(decision.candidates.map(x=>x.family)).size!==3||new Set(newSlugs).size!==3)throw Error('Three distinct product families required');
  if(!bundle.attributes.some(x=>x.slug==='privacy-friendly'))bundle.attributes.push({slug:'privacy-friendly',name:'Privacy Friendly for Reviewed Operation',description:'Only the reviewed local operation; read its conditions and exclusions.',valueType:'boolean',category:'data_control'});
  bundle.attributes.push({slug:'reviewed-local-operation',name:'Reviewed Local Operation',description:'Exact version, conditions and exclusions for this local privacy claim.',valueType:'text',category:'data_control'});
  const route=bundle.escapeRoutes.find(x=>x.slug==='privacy-friendly-grammarly-alternatives');if(!route)throw Error('Missing privacy route');
  for(const c of decision.candidates){
    if(bundle.products.some(x=>x.slug===c.product.slug))throw Error('Product collision');
    const keys=[];for(const s of [...c.product.anchors,...c.product.attributes].flatMap(x=>x.sources)){const key='privacy99-'+hash(s.url).slice(0,18);if(!bundle.sources.some(x=>x.key===key))bundle.sources.push({key,title:s.title,url:s.url,publisher:c.family,sourceType:'repository',retrievedAt:s.retrievedAt});keys.push(key);}
    const evidence=[...new Set(keys)],common={verificationStatus:'verified',confidence:.85,lastVerifiedAt:'2026-10-17',evidence};
    const privacy=c.product.attributes.find(x=>x.slug==='privacy-friendly');if(privacy?.verificationStatus!=='verified'||privacy.value!==true)throw Error('Unreviewed candidate');
    const statement=c.product.name+'. '+privacy.description;
    const profile={slug:c.product.slug,profileId:c.profileId,statement,axes:c.axes};profiles.push(profile);
    const a=c.product.anchors[0];
    bundle.products.push({slug:c.product.slug,name:c.product.name,shortDescription:c.product.description,websiteUrl:c.product.websiteUrl,status:'draft',anchors:[{...common,slug:'grammarly',relationshipType:'alternative',scope:privacyOperation,scopeDescription:a.description}],attributes:[{...common,slug:'privacy-friendly',value:true},{...common,slug:'reviewed-local-operation',value:statement},...['pricing-model','trade-off-summary'].map(slug=>({...common,slug,value:c.product.attributes.find(x=>x.slug===slug).value}))],problems:[],audiences:[]});
    route.products.push({productSlug:c.product.slug,position:Math.max(0,...route.products.map(x=>x.position??0))+1,noveltyScore:0});
  }
  route.description=review.routeDescription;route.status='draft';route.editoriallyApproved=false;route.lastVerifiedAt='2026-10-17';
  const errors=validateSeedBundle(bundle);if(errors.length)throw Error(errors.join('\n'));
  const pages=bundle.products.filter(x=>newSlugs.includes(x.slug)).map(p=>({slug:p.slug,name:p.name,description:p.shortDescription,websiteUrl:p.websiteUrl,status:p.status,...Object.fromEntries(['anchors','attributes','problems','audiences'].map(kind=>[kind,p[kind].map(c=>({...c,name:bundle[kind].find(x=>x.slug===c.slug).name,description:c.scopeDescription??bundle[kind].find(x=>x.slug===c.slug).description??null,sources:c.evidence.map(key=>{const s=bundle.sources.find(x=>x.key===key);return {title:s.title,url:s.url,retrievedAt:s.retrievedAt};})}))])),routes:[{slug:route.slug,name:route.name,description:route.description}]}));
  const evaluated=pages.map(product=>evaluatePrivacyProposal({product},profiles.find(x=>x.slug===product.slug)));if(evaluated.some(x=>!x.eligible))throw Error('Scoped proposal did not qualify');
  return {bundle,pages,profiles,report:{proposalOnly:true,productionEngineIntegrated:false,newProducts:3,newAttributeClaims:12,newScopedAnchors:3,newMemberships:3,qualifiedDraftCandidates:3,qualifiedPublishedCandidates:0,publishable:publishable({published:false,candidates:evaluated}),publicationApproved:false,liveCollisionChecked:false,acceptedCheckpoint:{products:21,routes:9,remaining:1},candidates:evaluated.map(x=>({slug:x.product.slug,eligible:x.eligible,blockers:x.blockers}))}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(process.argv.length!==2)throw Error('No arguments supported');const i=privacyInputs(),r=buildPrivacyGraph(i.baseline,i.decision,i.review),audit=latestPublicationAudit();if(audit.publishedProducts!==21||audit.acceptedPublishedRoutes!==9||audit.remainingRoutes!==1)throw Error('Public checkpoint drift');
  const out=path.join(root,'.seed-output/privacy-graph-proposal');fs.mkdirSync(out,{recursive:true});for(const [name,value] of Object.entries({bundle:r.bundle,'product-preview':r.pages,report:r.report}))fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(value,null,2)+'\n');
  console.log('PR5.99 草稿成功：3款限定候選、12項屬性、3項關係與路線成員。正式圖譜未變；公開21／9／1。');
}
