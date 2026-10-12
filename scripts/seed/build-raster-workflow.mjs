import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {offlineWorkflowBaseline,buildOfflineWorkflow} from './build-offline-workflow.mjs';
import {validateSeedBundle} from './validate.mjs';
import {escapeDefinitions,rankCandidates,publishable} from '../../lib/discovery/escape-model.ts';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const reviewedHash='a00c72f6e39e6e302d0221c03674cbb39e3933ef28adac67643f6a225fdca5c5';
const scope='desktop-raster-layers-painting-basic-adjustment';
const routeSlug='photoshop-alternatives-without-a-subscription';

export function rasterWorkflowBaseline(){
 const {baseline,bundle}=offlineWorkflowBaseline();
 return {baseline,bundle:buildOfflineWorkflow(bundle,read('seed/research/offline-workflow-review-2026-10-08.json')).bundle};
}
export function buildRasterWorkflow(input,review){
 if(hash(review)!==reviewedHash||review.publicationApproved!==false||review.scope!==scope)throw Error('Raster review drift: a fresh reviewed packet is required');
 const errors=validateSeedBundle(input);if(errors.length)throw Error(errors.join('\n'));
 if(input.products.some(p=>p.status!=='draft')||input.escapeRoutes.some(r=>r.status!=='draft'||r.editoriallyApproved))throw Error('Only separate unapproved local draft graphs are supported');
 for(const slug of ['gimp','krita','paint-net'])if(hash(input.products.find(p=>p.slug===slug))!==review.beforeSha256[slug])throw Error(`Raster product baseline drift: ${slug}`);
 const bundle=structuredClone(input),route=bundle.escapeRoutes.find(r=>r.slug===routeSlug);
 if(!route||hash(route)!==review.routeBeforeSha256)throw Error('Raster route baseline drift');
 const keys={};
 for(const source of review.sources){
  const key=`raster-workflow-${hash(source.url).slice(0,16)}-2026-10-12`;
  if(bundle.sources.some(s=>s.key===key))throw Error('Raster source collision');
  bundle.sources.push({key,url:source.url,title:source.title,sourceType:'documentation',publisher:source.publisher,retrievedAt:review.date});keys[source.id]=key;
 }
 for(const candidate of review.candidates){
  const product=bundle.products.find(p=>p.slug===candidate.slug);
  for(const [slug,value,ids] of [['no-subscription',true,candidate.pricingSources],['pricing-model',candidate.pricing,candidate.pricingSources],['trade-off-summary',candidate.tradeoff,candidate.tradeoffSources],['supported-platforms',candidate.platforms,candidate.platformSources]]){
   const old=product.attributes.find(a=>a.slug===slug);if(!old)throw Error(`Missing reviewed attribute: ${slug}`);
   product.attributes[product.attributes.indexOf(old)]={...old,value,verificationStatus:'verified',confidence:.95,lastVerifiedAt:review.date,evidence:[...new Set([...old.evidence,...ids.map(id=>keys[id])])]};
  }
  const old=product.anchors.find(a=>a.slug==='photoshop'&&a.relationshipType==='alternative');if(!old)throw Error('Missing reviewed Photoshop relationship');
  product.anchors[product.anchors.indexOf(old)]={...old,scope,scopeDescription:candidate.scopeDescription,verificationStatus:'verified',confidence:.85,lastVerifiedAt:review.date,evidence:[...new Set([...old.evidence,...candidate.anchorSources.map(id=>keys[id])])]};
  const member=route.products.find(m=>m.productSlug===candidate.slug);if(!member)throw Error('Missing reviewed route member');member.editorialNote=candidate.scopeDescription;member.noveltyScore=0;
 }
 route.description='Compare no-subscription desktop applications for raster layers, painting and basic image adjustment: GIMP, Krita and Paint.NET. Free official releases qualify; this does not mean a paid perpetual license. Workflow, platform, PSD, RAW and print-production limits differ. No guarantee of full Photoshop parity. Draft route; publication is not approved.';
 route.lastVerifiedAt=review.date;
 const validation=validateSeedBundle(bundle);if(validation.length)throw Error(validation.join('\n'));
 const kinds=['attributes','anchors','problems','audiences'];
 const pages=bundle.products.map(p=>({slug:p.slug,name:p.name,description:p.shortDescription,websiteUrl:p.websiteUrl,status:p.status,
  ...Object.fromEntries(kinds.map(kind=>[kind,p[kind].map(claim=>({...claim,name:bundle[kind].find(t=>t.slug===claim.slug).name,description:claim.scopeDescription??bundle[kind].find(t=>t.slug===claim.slug).description??null,sources:claim.evidence.map(key=>{const s=bundle.sources.find(s=>s.key===key);return{title:s.title,url:s.url,retrievedAt:s.retrievedAt};})}))])),
  routes:bundle.escapeRoutes.filter(r=>r.products.some(m=>m.productSlug===p.slug)).map(r=>({slug:r.slug,name:r.name,description:r.description}))}));
 const candidates=rankCandidates(escapeDefinitions[6],route.products.map(m=>({product:pages.find(p=>p.slug===m.productSlug),noveltyScore:m.noveltyScore})));
 const report={publicationApproved:false,scope,method:review.method,inputSha256:hash(input),reviewSha256:hash(review),attributeUpdates:12,relationshipUpdates:3,qualifiedDraftCandidates:candidates.filter(c=>c.eligible).length,qualifiedPublishedCandidates:0,publishable:publishable({published:false,candidates}),candidates:candidates.map(c=>({slug:c.product.slug,eligible:c.eligible,quality:c.quality,blockers:c.blockers}))};
 if(report.qualifiedDraftCandidates!==3)throw Error('Expected three bounded raster draft candidates');
 return{bundle,pages,report};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  if(process.argv.length!==2)throw Error('No arguments supported');
  const{baseline,bundle}=rasterWorkflowBaseline(),result=buildRasterWorkflow(bundle,read('seed/research/raster-workflow-review-2026-10-12.json'));
  const out=path.join(root,'.seed-output/escape-draft');fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.join(root,'.seed-output/editorial-fit'),{recursive:true});
  fs.writeFileSync(path.join(root,'.seed-output/editorial-fit/reviewed-five-ecosystems.json'),JSON.stringify(baseline,null,2)+'\n');
  for(const[name,value]of Object.entries({bundle:result.bundle,'product-preview':result.pages,'raster-workflow-review':result.report}))fs.writeFileSync(path.join(out,`${name}.json`),JSON.stringify(value,null,2)+'\n');
  console.log('PR5.14: three bounded raster draft candidates; zero published; publishable=false. Rebuilt from versioned research; safe to rerun. No SQL or remote writes.');
 }catch(error){console.error(error.message);process.exitCode=1;}
}
