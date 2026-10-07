import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildContentReview} from './escape-content-review.mjs';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
import {safeUrl} from '../lib/discovery/model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));

export function buildCandidateResearch(supplement,plan,bundle,pages){
  if(supplement.status!=='research-only'||supplement.publicationApproved!==false||supplement.date!==plan.date)throw new Error('Supplement is research-only and must match the plan date.');
  const identities=new Set(pages.map(p=>p.slug));
  const definitions=new Set(escapeDefinitions.map(d=>d.slug));
  const allowed=new Set(['attributes','anchors','audiences']);
  const taxonomy=new Set([...['attributes','anchors','audiences'].flatMap(kind=>bundle[kind].map(t=>`${kind}/${t.slug}`)),...plan.taxonomyProposals.map(t=>`${t.kind}/${t.slug}`)]);
  const nextPlan=structuredClone(plan);
  const nextPages=structuredClone(pages);
  for(const p of supplement.products){
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||identities.has(p.slug)||p.status!=='draft'||p.reviewStatus!=='pending'||!p.name?.trim()||!safeUrl(p.websiteUrl)||!p.scope?.trim()||!p.unresolved?.length||!p.unresolved.every(v=>typeof v==='string'&&v.trim()))throw new Error(`Invalid pending product: ${p.slug}`);
    identities.add(p.slug);
    if(!p.routeSlugs?.length||new Set(p.routeSlugs).size!==p.routeSlugs.length||p.routeSlugs.some(slug=>!definitions.has(slug)))throw new Error(`Invalid routes: ${p.slug}`);
    if(!p.claims?.length)throw new Error(`Missing claims: ${p.slug}`);
    const keys=new Set();
    for(const c of p.claims){
      const key=`${c.kind}/${c.slug}`;
      if(!allowed.has(c.kind)||!taxonomy.has(key)||keys.has(key)||c.reviewStatus!=='pending'||!['direct-source','editorial-inference'].includes(c.basis)||!safeUrl(c.sourceUrl)||!c.summary?.trim()||(!['boolean','string'].includes(typeof c.proposedValue)))throw new Error(`Invalid pending claim: ${p.slug}/${key}`);
      if(c.kind==='attributes'&&['pricing-model','trade-off-summary'].includes(c.slug)&&!(typeof c.proposedValue==='string'&&c.proposedValue.trim()))throw new Error(`Missing text scope: ${p.slug}/${key}`);
      keys.add(key);
    }
    for(const slug of ['pricing-model','trade-off-summary'])if(!keys.has(`attributes/${slug}`))throw new Error(`Missing ${slug}: ${p.slug}`);
    // Proposed values and source observations are deliberately NOT mapped to claims.
    nextPages.push({slug:p.slug,name:p.name,websiteUrl:p.websiteUrl,description:p.scope,status:'draft',attributes:[],anchors:[],audiences:[],problems:[],routes:[]});
    for(const slug of p.routeSlugs){
      const route=nextPlan.routes.find(r=>r.slug===slug);if(!route)throw new Error(`Missing route plan: ${slug}`);
      route.candidates.push(p.slug);
    }
  }
  const review=buildContentReview(nextPlan,bundle,nextPages);
  return {...review,newResearchProducts:supplement.products.length,acceptedProductsUnchanged:pages.length,
    pendingClaimProposals:supplement.products.reduce((n,p)=>n+p.claims.length,0),sourceDossiers:structuredClone(supplement.products)};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const report=buildCandidateResearch(read('seed/research/escape-candidates-2026-10-07.json'),read('seed/research/escape-content-2026-10-07.json'),read('.seed-output/editorial-fit/reviewed-five-ecosystems.json'),read('.seed-output/product-preview.json'));
  const output=path.join(root,'.seed-output/escape');fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,'candidate-research.json'),JSON.stringify(report,null,2)+'\n');
  const table=report.routes.map(r=>`| ${r.name} | ${r.researchCandidates} | ${r.qualifiedWithExistingEvidence} |`).join('\n');
  const dossiers=report.sourceDossiers.map(p=>`## ${p.name}\n\nScope: ${p.scope}\n\nReviewer: ______ Date: ______ Decision/corrections: ______\n\n`+p.claims.map(c=>`- [ ] ${c.kind}/${c.slug} — proposed ${JSON.stringify(c.proposedValue)} (${c.basis}; pending)\n  - ${c.summary}\n  - [Official source](${c.sourceUrl})`).join('\n')+'\n\nUnresolved:\n\n'+p.unresolved.map(s=>`- ${s}`).join('\n')).join('\n\n');
  fs.writeFileSync(path.join(output,'candidate-research.md'),`# Candidate source review — ${report.date}\n\nResearch-only. Accepted fixtures are unchanged; pending proposals never qualify or publish a product.\n\n| Route | Research shortlist | Qualified existing evidence |\n| --- | ---: | ---: |\n${table}\n\n${dossiers}\n`);
  console.log(`${report.newResearchProducts} new research products; ${report.pendingClaimProposals} pending claim proposals; ${report.acceptedProductsUnchanged} accepted product previews unchanged.`);
  console.log(report.routes.map(r=>`${r.name}: ${r.researchCandidates} research names; ${r.qualifiedWithExistingEvidence} pass existing evidence`).join('\n'));
  console.log('0 proposals applied. No database writes, SQL generation or publication. Read .seed-output/escape/candidate-research.md.');
}
