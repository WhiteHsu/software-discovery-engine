import fs from 'node:fs';
import {escapeDefinitions,rankCandidates} from '../lib/discovery/escape-model.ts';
const bundle=JSON.parse(fs.readFileSync('.seed-output/editorial-fit/reviewed-five-ecosystems.json','utf8'));
const pages=JSON.parse(fs.readFileSync('.seed-output/product-preview.json','utf8'));
const report=escapeDefinitions.map(def=>{
  const route=bundle.escapeRoutes.find(r=>r.slug===def.slug);
  const candidates=rankCandidates(def,(route?.products??[]).flatMap(m=>{const p=pages.find(p=>p.slug===m.productSlug);return p?[{product:p,noveltyScore:m.noveltyScore}]:[];}));
  return {slug:def.slug,name:def.name,curatedCandidates:candidates.length,missingAnchor:!!def.anchor&&!bundle.anchors.some(a=>a.slug===def.anchor),missingAudience:!!def.audience&&!bundle.audiences.some(a=>a.slug===def.audience),qualifiedDraftCandidates:candidates.filter(c=>c.eligible).length,missingTaxonomy:def.constraints.filter(slug=>!bundle.attributes.some(a=>a.slug===slug)),candidates:candidates.map(c=>({slug:c.product.slug,eligible:c.eligible,blockers:c.blockers})),productionPublication:'Not approved by this report; current seed fixture statuses are draft.'};
});
fs.mkdirSync('.seed-output/escape',{recursive:true});
fs.writeFileSync('.seed-output/escape/readiness.json',JSON.stringify(report,null,2)+'\n');
console.log(report.map(r=>`${r.name}: ${r.qualifiedDraftCandidates}/${r.curatedCandidates} eligible draft candidates; missing taxonomy: ${r.missingTaxonomy.join(', ')||'none'}`).join('\n'));
