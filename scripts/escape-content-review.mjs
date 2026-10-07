import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {escapeDefinitions,rankCandidates} from '../lib/discovery/escape-model.ts';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const safeUrl=value=>{try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}};
const dated=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value).toISOString().slice(0,10)===value;

export function buildContentReview(plan,bundle,pages){
  if(plan.status!=='research-only'||plan.publicationApproved!==false)throw new Error('Research plan cannot authorize publication.');
  if(!dated(plan.date))throw new Error('Invalid research date.');
  const definitions=new Map(escapeDefinitions.map(d=>[d.slug,d]));
  const products=new Map(pages.map(p=>[p.slug,p]));
  const taxonomyKeys=new Set();
  for(const t of plan.taxonomyProposals){
    const key=`${t.kind}/${t.slug}`;
    if(!['attributes','anchors','audiences'].includes(t.kind)||taxonomyKeys.has(key)||!t.description?.trim())throw new Error(`Invalid taxonomy proposal: ${key}`);
    if(t.kind==='attributes'&&(t.valueType!=='boolean'||!t.requiredEvidence?.trim()))throw new Error(`Missing boolean rubric: ${key}`);
    taxonomyKeys.add(key);
  }
  const seen=new Set();
  const rows=plan.routes.map(route=>{
    const def=definitions.get(route.slug);
    if(!def||seen.has(route.slug)||!route.work?.trim())throw new Error(`Invalid/duplicate route: ${route.slug}`);
    seen.add(route.slug);
    if(new Set(route.candidates).size!==route.candidates.length)throw new Error(`Duplicate candidate: ${route.slug}`);
    const members=route.candidates.map(slug=>{
      const product=products.get(slug);if(!product)throw new Error(`Unknown product: ${slug}`);
      return {product};
    });
    const missing=[...def.constraints.filter(slug=>!bundle.attributes.some(t=>t.slug===slug)).map(slug=>`attributes/${slug}`),
      ...(def.anchor&&!bundle.anchors.some(t=>t.slug===def.anchor)?[`anchors/${def.anchor}`]:[]),
      ...(def.audience&&!bundle.audiences.some(t=>t.slug===def.audience)?[`audiences/${def.audience}`]:[])];
    for(const key of missing)if(!taxonomyKeys.has(key))throw new Error(`Missing taxonomy proposal: ${key}`);
    const evaluated=rankCandidates(def,members);
    return {slug:route.slug,name:def.name,researchCandidates:members.length,additionalCandidatesToResearch:Math.max(0,3-members.length),
      qualifiedWithExistingEvidence:evaluated.filter(c=>c.eligible).length,missingTaxonomy:missing,
      candidates:evaluated.map(c=>({slug:c.product.slug,eligibleWithExistingEvidence:c.eligible,blockers:c.blockers})),nextReview:route.work};
  });
  if(seen.size!==definitions.size)throw new Error('Research plan must cover all ten routes.');
  for(const o of plan.observations){
    if(!products.has(o.productSlug)||!taxonomyKeys.has(`attributes/${o.attribute}`)||o.reviewStatus!=='pending'||!safeUrl(o.sourceUrl)||!dated(o.checkedAt)||o.checkedAt>plan.date||![true,false,null].includes(o.proposedValue)||!o.summary?.trim()||!o.limitations?.trim())throw new Error(`Invalid pending observation: ${o.productSlug}/${o.attribute}`);
  }
  return {date:plan.date,status:'research-only',publicationApproved:false,observationsApplied:0,routes:rows,
    warning:'Shortlists are research tasks, not approved memberships. Qualification uses existing fixture claims only. No source observation or taxonomy proposal is applied to previews, seed imports or production.'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const report=buildContentReview(read('seed/research/escape-content-2026-10-07.json'),read('.seed-output/editorial-fit/reviewed-five-ecosystems.json'),read('.seed-output/product-preview.json'));
  const output=path.join(root,'.seed-output/escape');fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,'content-review.json'),JSON.stringify(report,null,2)+'\n');
  const lines=report.routes.map(r=>`| ${r.name} | ${r.researchCandidates} | ${r.qualifiedWithExistingEvidence} | ${r.additionalCandidatesToResearch} | ${r.missingTaxonomy.join(', ')||'none'} |`);
  fs.writeFileSync(path.join(output,'content-review.md'),`# Escape content research — ${report.date}\n\n${report.warning}\n\n| Route | Research shortlist | Qualified with existing evidence | Additional candidates to research | Missing taxonomy |\n| --- | ---: | ---: | ---: | --- |\n${lines.join('\n')}\n\n`+report.routes.map(r=>`## ${r.name}\n\n${r.nextReview}\n\n`+r.candidates.map(c=>`- ${c.slug}: ${c.blockers.join('; ')||'Existing evidence passes; membership and publication still unapproved.'}`).join('\n')).join('\n\n')+'\n');
  console.log(report.routes.map(r=>`${r.name}: ${r.qualifiedWithExistingEvidence}/${r.researchCandidates} pass existing evidence; ${r.additionalCandidatesToResearch} additional candidates needed; missing taxonomy: ${r.missingTaxonomy.join(', ')||'none'}`).join('\n'));
  console.log('Research report only. 0 observations applied; 0 database writes; 0 publications.');
}
