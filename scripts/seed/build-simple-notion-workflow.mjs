import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {notionAiBaseline,buildNotionAiWorkflow} from './build-notion-ai-workflow.mjs';
import {validateSeedBundle} from './validate.mjs';
import {escapeDefinitions,rankCandidates,publishable} from '../../lib/discovery/escape-model.ts';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,''));
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const REVIEW_HASH='73aa5da9834dd70df44c8cf22131c5a07cf7c4bc5b0ada35e8962a21335e17ff';
const scope='personal-basic-note-capture-edit-organization';
export function simpleNotionInputs(){
 const baseline=buildNotionAiWorkflow(notionAiBaseline(),read('seed/research/notion-ai-review-2026-10-12.json')).bundle;
 return {baseline,review:read('seed/research/simple-notion-workflow-2026-10-13.json')};
}
export function buildSimpleNotionWorkflow(input,review){
 if(hash(review)!==REVIEW_HASH||hash(input)!==review.inputSha256||review.publicationApproved!==false||review.scope!==scope)throw Error('Simple Notion review/input drift');
 if(input.products.some(p=>p.status!=='draft')||input.escapeRoutes.some(r=>r.status!=='draft'||r.editoriallyApproved))throw Error('Only separate unapproved draft fixtures supported');
 const bundle=structuredClone(input),keys={};
 for(const s of review.sources){const key=`simple-notion-${s.id}-2026-10-13`;if(bundle.sources.some(s=>s.key===key))throw Error('Source collision');keys[s.id]=key;bundle.sources.push({key,title:s.title,url:s.url,publisher:s.publisher,sourceType:s.type,retrievedAt:review.date});}
 if(bundle.products.some(p=>p.slug==='simplenote'))throw Error('Unexpected Simplenote identity');
 bundle.products.push({...review.newProduct,status:'draft',attributes:[],anchors:[],problems:[],audiences:[]});
 const evidence=ids=>ids.map(id=>{if(!keys[id])throw Error('Missing source');return keys[id];});
 for(const c of review.candidates){
  const p=bundle.products.find(p=>p.slug===c.slug);
  for(const a of c.attributes){const old=p.attributes.find(x=>x.slug===a.slug),claim={slug:a.slug,value:a.value,verificationStatus:'verified',confidence:a.confidence,lastVerifiedAt:review.date,evidence:[...new Set([...(old?.evidence??[]),...evidence(a.sources)])]};if(old)p.attributes[p.attributes.indexOf(old)]=claim;else p.attributes.push(claim);}
  const old=p.anchors.find(a=>a.slug==='notion'&&a.relationshipType==='alternative');
  if(old?.scope&&old.scope!==scope)throw Error('Cannot overwrite another accepted relationship scope');
  const anchor={...old,slug:'notion',relationshipType:'alternative',scope,scopeDescription:c.scopeDescription,verificationStatus:'verified',confidence:.85,lastVerifiedAt:review.date,evidence:[...new Set([...(old?.evidence??[]),...evidence(c.anchorSources)])]};
  if(old)p.anchors[p.anchors.indexOf(old)]=anchor;else p.anchors.push(anchor);
 }
 const route=bundle.escapeRoutes.find(r=>r.slug==='simple-notion-alternatives');
 route.description=review.description;route.lastVerifiedAt=review.date;
 route.products=review.candidates.map((c,i)=>({productSlug:c.slug,position:i+1,noveltyScore:0,editorialNote:c.scopeDescription}));
 const errors=validateSeedBundle(bundle);if(errors.length)throw Error(errors.join('\n'));
 const kinds=['attributes','anchors','problems','audiences'];
 const pages=bundle.products.map(p=>({slug:p.slug,name:p.name,description:p.shortDescription,websiteUrl:p.websiteUrl,status:p.status,...Object.fromEntries(kinds.map(k=>[k,p[k].map(c=>({...c,name:bundle[k].find(t=>t.slug===c.slug).name,description:c.scopeDescription??bundle[k].find(t=>t.slug===c.slug).description??null,sources:c.evidence.map(key=>{const s=bundle.sources.find(s=>s.key===key);return {title:s.title,url:s.url,retrievedAt:s.retrievedAt};})}))])),routes:bundle.escapeRoutes.filter(r=>r.products.some(m=>m.productSlug===p.slug)).map(r=>({slug:r.slug,name:r.name,description:r.description}))}));
 const candidates=rankCandidates(escapeDefinitions[2],route.products.map(m=>({product:pages.find(p=>p.slug===m.productSlug),noveltyScore:0})));
 if(candidates.filter(c=>c.eligible).length!==3)throw Error('Three bounded draft candidates required');
 return {bundle,pages,report:{version:1,date:review.date,scope,publicationApproved:false,inputSha256:hash(input),reviewSha256:hash(review),newDraftProducts:1,attributeUpdates:review.candidates.reduce((n,c)=>n+c.attributes.length,0),anchorUpdates:3,qualifiedDraftCandidates:3,qualifiedPublishedCandidates:0,publishable:publishable({published:false,candidates}),selectionChange:review.selectionChange,candidates:candidates.map(c=>({slug:c.product.slug,eligible:c.eligible,quality:c.quality,blockers:c.blockers}))}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('No arguments supported');const {baseline,review}=simpleNotionInputs(),r=buildSimpleNotionWorkflow(baseline,review),out=path.join(root,'.seed-output/escape-draft');fs.mkdirSync(out,{recursive:true});for(const [name,data]of Object.entries({bundle:r.bundle,'product-preview':r.pages,'simple-notion-review':r.report}))fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(data,null,2)+'\n');console.log('PR5.23: three bounded draft candidates; one new draft product; zero publication or remote writes.');}catch(e){console.error(e.message);process.exitCode=1;}
}
