import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {pdfWorkflowInputs,buildPdfWorkflow} from './build-pdf-workflow.mjs';
import {validateSeedBundle} from './validate.mjs';
import {escapeDefinitions,rankCandidates,publishable} from '../../lib/discovery/escape-model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const scope='personal-task-capture-project-organization-and-scheduling';
const REVIEW_HASH='3650b02bae0ba2a33be3d27c98e94d4b380770a39d8425a7734795c85597e3ce';
export function productivityInputs(){const i=pdfWorkflowInputs();return {baseline:buildPdfWorkflow(i.baseline,i.review).bundle,review:JSON.parse(fs.readFileSync(path.join(root,'seed/research/productivity-task-workflow-2026-10-13.json'),'utf8'))};}
export function buildProductivityWorkflow(input,review){
 if(hash(review)!==REVIEW_HASH||hash(input)!==review.inputSha256||review.publicationApproved!==false||review.scope!==scope)throw Error('Productivity review/input drift');
 if(input.products.some(p=>p.status!=='draft')||input.escapeRoutes.some(r=>r.status!=='draft'||r.editoriallyApproved))throw Error('Only unapproved draft fixtures supported');
 const bundle=structuredClone(input),keys={};
 if(bundle.attributes.some(a=>a.slug==='personal-task-workflow-scope'))throw Error('Workflow taxonomy collision');
 bundle.attributes.push({slug:'personal-task-workflow-scope',name:'Personal Task Workflow Scope',description:'Documented task capture, project organization and scheduling in the reviewed native edition; no team collaboration or feature parity inference.',valueType:'text',category:'workflow'});
 for(const s of review.sources){const key='productivity-'+s.id+'-2026-10-13';if(bundle.sources.some(x=>x.key===key))throw Error('Source collision');keys[s.id]=key;bundle.sources.push({key,title:s.title,url:s.url,publisher:s.publisher,sourceType:s.type,retrievedAt:review.date});}
 for(const c of review.candidates){const p=bundle.products.find(p=>p.slug===c.slug);if(!p)throw Error('Missing candidate');const evidence=c.sources.map(id=>{if(!keys[id])throw Error('Missing source');return keys[id];});
 for(const [slug,value] of [['personal-task-workflow-scope',scope],['one-time-purchase',true],['pricing-model',c.pricing],['trade-off-summary',c.limits]]){const old=p.attributes.find(a=>a.slug===slug),claim={slug,value,verificationStatus:'verified',confidence:.9,lastVerifiedAt:review.date,evidence:[...new Set([...(old?.evidence??[]),...evidence])]};if(old)p.attributes[p.attributes.indexOf(old)]=claim;else p.attributes.push(claim);}}
 const route=bundle.escapeRoutes.find(r=>r.slug==='productivity-apps-you-can-buy-once');route.description=review.description;route.lastVerifiedAt=review.date;route.products=review.candidates.map((c,i)=>({productSlug:c.slug,position:i+1,noveltyScore:0,editorialNote:c.limits}));
 const errors=validateSeedBundle(bundle);if(errors.length)throw Error(errors.join('\n'));
 const kinds=['attributes','anchors','problems','audiences'];
 const pages=bundle.products.map(p=>({slug:p.slug,name:p.name,description:p.shortDescription,websiteUrl:p.websiteUrl,status:p.status,...Object.fromEntries(kinds.map(k=>[k,p[k].map(c=>({...c,name:bundle[k].find(t=>t.slug===c.slug).name,description:c.scopeDescription??bundle[k].find(t=>t.slug===c.slug).description??null,sources:c.evidence.map(key=>{const s=bundle.sources.find(s=>s.key===key);return {title:s.title,url:s.url,retrievedAt:s.retrievedAt};})}))])),routes:bundle.escapeRoutes.filter(r=>r.products.some(m=>m.productSlug===p.slug)).map(r=>({slug:r.slug,name:r.name,description:r.description}))}));
 const candidates=rankCandidates(escapeDefinitions[9],route.products.map(m=>({product:pages.find(p=>p.slug===m.productSlug),noveltyScore:0})));
 if(candidates.filter(c=>c.eligible).length!==3)throw Error('Three bounded candidates required');
 return {bundle,pages,report:{publicationApproved:false,scope,qualifiedDraftCandidates:3,qualifiedPublishedCandidates:0,publishable:publishable({published:false,candidates}),newProducts:0,attributeUpdates:12,candidates:candidates.map(c=>({slug:c.product.slug,eligible:c.eligible,quality:c.quality,blockers:c.blockers}))}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const i=productivityInputs(),r=buildProductivityWorkflow(i.baseline,i.review),out=path.join(root,'.seed-output/escape-draft');fs.mkdirSync(out,{recursive:true});for(const [name,data] of Object.entries({bundle:r.bundle,'product-preview':r.pages,'productivity-workflow-review':r.report}))fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(data,null,2)+'\n');console.log('PR5.36: 3 bounded draft candidates; 0 new products, 0 publication or remote writes.');}
