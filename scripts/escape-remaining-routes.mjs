import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {meditationInputs,buildMeditationWorkflow} from './seed/build-meditation-workflow.mjs';
import {productivityInputs,buildProductivityWorkflow} from './seed/build-productivity-workflow.mjs';
import {escapeDefinitions,rankCandidates} from '../lib/discovery/escape-model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,''));
export function auditRemainingRoutes(bundle,pages,checkpoint,shortlists){
 if(checkpoint.version!==1||new Set(checkpoint.publishedProducts).size!==checkpoint.publishedProducts.length||new Set(checkpoint.publishedRoutes).size!==checkpoint.publishedRoutes.length||checkpoint.publishedProducts.some(s=>!bundle.products.some(p=>p.slug===s))||checkpoint.publishedRoutes.some(s=>!escapeDefinitions.some(d=>d.slug===s)))throw Error('Invalid publication checkpoint');
 const routes=escapeDefinitions.map(def=>{
  const route=bundle.escapeRoutes.find(r=>r.slug===def.slug),members=route?.products??[];
  const candidates=rankCandidates(def,members.flatMap(m=>{const product=pages.find(p=>p.slug===m.productSlug);return product?[{product,noveltyScore:m.noveltyScore??0}]:[];}));
  const accepted=checkpoint.publishedRoutes.includes(def.slug);
  return {slug:def.slug,name:def.name,publication:accepted?'owner-confirmed-published':'not-published',curatedCandidates:candidates.length,qualifiedDraftGraphCandidates:candidates.filter(c=>c.eligible).length,minimumAdditionalQualifiedCandidates:Math.max(0,3-candidates.filter(c=>c.eligible).length),researchShortlist:shortlists.routes.find(r=>r.slug===def.slug)?.candidates??[],missingTaxonomy:def.constraints.filter(s=>!bundle.attributes.some(a=>a.slug===s)),candidates:candidates.map(c=>({slug:c.product.slug,eligible:c.eligible,blockers:c.blockers})),nextWork:accepted?'Accepted publication; no re-import.':'Review scoped relationship, required constraints, pricing/trade-offs and dated primary evidence before selective import or publication.'};
 });
 return {version:1,recordedAt:checkpoint.recordedAt,basis:checkpoint.basis,publishedProducts:checkpoint.publishedProducts.length,acceptedPublishedRoutes:routes.filter(r=>r.publication==='owner-confirmed-published').length,remainingRoutes:routes.filter(r=>r.publication==='not-published').length,publicationApproved:false,qualificationBasis:'Reconstructed versioned draft graph; counts do not query live publication or approve new claims.',routes};
}
export function historicalRouteAudit(){const inputs=productivityInputs(),result=buildProductivityWorkflow(inputs.baseline,inputs.review);return auditRemainingRoutes(result.bundle,result.pages,read('seed/research/publication-checkpoint-2026-10-14.json'),read('seed/research/escape-content-2026-10-07.json'));}
// Backward-compatible frozen PR5.41 stage for historical review scripts.
// New callers must use currentPublicationAudit; this legacy alias remains 15/7/3.
export const currentRouteAudit=historicalRouteAudit;
export function currentPublicationAudit(){
 const checkpoint=read('seed/research/publication-checkpoint-2026-10-15.json');
 if(createHash('sha256').update(JSON.stringify(checkpoint)).digest('hex')!=='0b49676527173f2a405dc9dd41ac79c8ace3455501d59bf9fcb3cabb400b2896')throw Error('Accepted publication checkpoint drift');
 const i=meditationInputs(),r=buildMeditationWorkflow(i.baseline,i.review);
 const report=auditRemainingRoutes(r.bundle,r.pages,checkpoint,read('seed/research/escape-content-2026-10-07.json'));
 const meditation=report.routes.find(x=>x.slug==='meditation-apps-without-a-subscription');
 if(report.publishedProducts!==18||report.acceptedPublishedRoutes!==8||report.remainingRoutes!==2||meditation?.qualifiedDraftGraphCandidates!==3||meditation.publication!=='owner-confirmed-published')throw Error('Accepted meditation reconstruction drift');
 return {...report,qualificationBasis:'Reviewed meditation-stage draft reconstruction; accepted publication from owner evidence. Not a live database query or new publication approval.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('No arguments supported');const report=currentPublicationAudit(),out=path.join(root,'.seed-output/escape');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'remaining-routes.json'),JSON.stringify(report,null,2)+'\n');console.log(`Owner-confirmed: ${report.publishedProducts} products, ${report.acceptedPublishedRoutes}/10 routes. Remaining: ${report.remainingRoutes}. No graph changes or remote writes.`);for(const r of report.routes.filter(r=>r.publication==='not-published'))console.log(`${r.name}: ${r.qualifiedDraftGraphCandidates}/${r.curatedCandidates} qualified curated draft-graph candidates; ${r.researchShortlist.length} research-only names.`);}catch(e){console.error(e.message);process.exitCode=1;}
}
