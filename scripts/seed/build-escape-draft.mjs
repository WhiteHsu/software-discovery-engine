import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateSeedBundle} from './validate.mjs';
import {escapeDefinitions,rankCandidates} from '../../lib/discovery/escape-model.ts';
import {safeUrl} from '../../lib/discovery/model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const collections=['attributes','anchors','problems','audiences'];

export function buildEscapeDraft(baseline,plan,proposal,audit){
  if(audit.reviewType!=='official-source-draft-review'||audit.humanPublicationApproval!==false||audit.proposalSha256!==hash(proposal)||!audit.reviewMethod?.trim()||!Number.isFinite(Date.parse(audit.date)))throw new Error('Invalid draft review identity/approval/date.');
  if(proposal.status!=='research-only'||proposal.publicationApproved!==false||plan.publicationApproved!==false)throw new Error('Inputs cannot approve publication.');
  const baselineErrors=validateSeedBundle(baseline);if(baselineErrors.length)throw new Error(baselineErrors.join('\n'));
  if(baseline.products.some(p=>p.status!=='draft')||baseline.escapeRoutes.some(r=>r.status!=='draft'||r.editoriallyApproved))throw new Error('Expected local draft baseline; published/review records cannot be rewritten by this builder.');
  const reviewed=structuredClone(baseline),changes=[],sourceKeys=new Set();
  for(const item of plan.taxonomyProposals){
    if(!['attributes','anchors','audiences'].includes(item.kind))throw new Error('Invalid taxonomy kind.');
    const {kind,requiredEvidence,...taxonomy}=item;
    void requiredEvidence;
    const existing=reviewed[kind].find(t=>t.slug===item.slug);
    if(existing)throw new Error(`Taxonomy collision: ${kind}/${item.slug}`);
    reviewed[kind].push(taxonomy);
  }
  const decisions=new Map();
  for(const d of audit.decisions){
    const key=`${d.product}/${d.kind}/${d.slug}`;
    if(decisions.has(key)||!['verified','likely','unknown'].includes(d.status)||!d.reason?.trim())throw new Error(`Invalid/duplicate decision: ${key}`);
    decisions.set(key,d);
  }
  const consumed=new Set(),newProducts=[];
  const source=(p,slug,url)=>{
    if(!safeUrl(url))throw new Error(`Unsafe source: ${url}`);
    const key=`escape-draft-${hash(url).slice(0,16)}`;
    const existing=reviewed.sources.find(s=>s.key===key);
    if(existing&&existing.url!==url)throw new Error('Source identity collision.');
    if(!existing)reviewed.sources.push({key,sourceType:slug==='pricing-model'?'pricing':'official',title:`${p.name} — official source`,url,publisher:p.name,retrievedAt:audit.date});
    sourceKeys.add(key);return key;
  };
  for(const p of proposal.products){
    if(reviewed.products.some(old=>old.slug===p.slug)||p.status!=='draft'||p.reviewStatus!=='pending')throw new Error(`New product must be a noncolliding draft: ${p.slug}`);
    if(!audit.descriptions[p.slug]?.trim())throw new Error(`Missing reviewed description: ${p.slug}`);
    const product={slug:p.slug,name:p.name,shortDescription:audit.descriptions[p.slug],websiteUrl:p.websiteUrl,status:'draft',attributes:[],anchors:[],audiences:[],problems:[]};
    for(const original of p.claims){
      const key=`${p.slug}/${original.kind}/${original.slug}`,d=decisions.get(key);
      if(!d||consumed.has(key)||!collections.includes(original.kind))throw new Error(`Missing/duplicate claim decision: ${key}`);
      consumed.add(key);
      if(original.basis==='editorial-inference'&&d.status==='verified')throw new Error(`Editorial interpretation cannot auto-promote: ${key}`);
      const urls=d.urls??[original.sourceUrl];
      if(d.status!=='unknown'&&(!urls.length||urls.some(url=>!safeUrl(url))))throw new Error(`Missing safe evidence: ${key}`);
      const claim={slug:original.slug,verificationStatus:d.status,confidence:d.status==='verified'?.95:d.status==='likely'?.75:null,lastVerifiedAt:d.status==='unknown'?null:audit.date,evidence:d.status==='unknown'?[]:urls.map(url=>source(p,original.slug,url))};
      if(original.kind==='attributes')claim.value=d.status==='unknown'?null:Object.hasOwn(d,'value')?d.value:original.proposedValue;
      if(original.kind==='anchors')claim.relationshipType='alternative';
      product[original.kind].push(claim);
      changes.push({product:p.slug,kind:original.kind,slug:original.slug,status:d.status,reason:d.reason});
    }
    const platforms=audit.platformClaims.filter(c=>c.product===p.slug);
    if(platforms.length!==1||!platforms[0].value?.trim()||!platforms[0].urls?.length)throw new Error(`Missing platform review: ${p.slug}`);
    product.attributes.push({slug:'supported-platforms',value:platforms[0].value,verificationStatus:'verified',confidence:.95,lastVerifiedAt:audit.date,evidence:platforms[0].urls.map(url=>source(p,'supported-platforms',url))});
    newProducts.push(product);reviewed.products.push(product);
  }
  if(consumed.size!==decisions.size||audit.platformClaims.length!==newProducts.length)throw new Error('Unused review decision/platform identity.');
  const routes=escapeDefinitions.map(def=>{
    const original=plan.routes.find(r=>r.slug===def.slug);if(!original)throw new Error(`Missing route: ${def.slug}`);
    const slugs=[...original.candidates,...proposal.products.filter(p=>p.routeSlugs.includes(def.slug)).map(p=>p.slug)];
    if(new Set(slugs).size!==slugs.length)throw new Error(`Duplicate route membership: ${def.slug}`);
    const route={slug:def.slug,name:def.name,status:'draft',editoriallyApproved:false,lastVerifiedAt:null,
      description:'Draft comparison for the stated workflow. Candidate relationships and editions remain subject to review; publication is not approved.',
      products:slugs.map((productSlug,i)=>({productSlug,position:i+1,editorialNote:'Draft review membership; not a publication decision.'}))};
    if(def.anchor)route.anchorSlug=def.anchor;
    return route;
  });
  reviewed.escapeRoutes=routes;
  const errors=validateSeedBundle(reviewed);if(errors.length)throw new Error(errors.join('\n'));
  const delta={version:baseline.version,sources:reviewed.sources.filter(s=>sourceKeys.has(s.key)),products:newProducts,escapeRoutes:[]};
  for(const kind of collections){const used=new Set(newProducts.flatMap(p=>p[kind].map(c=>c.slug)));delta[kind]=reviewed[kind].filter(t=>used.has(t.slug));}
  const deltaErrors=validateSeedBundle(delta);if(deltaErrors.length)throw new Error(deltaErrors.join('\n'));
  const pages=reviewed.products.map(p=>({slug:p.slug,name:p.name,description:p.shortDescription,websiteUrl:p.websiteUrl,status:p.status,
    ...Object.fromEntries(collections.map(kind=>[kind,p[kind].map(c=>{
      const t=reviewed[kind].find(t=>t.slug===c.slug);
      return {...c,name:t.name,description:t.description??null,sources:c.evidence.map(key=>{const s=reviewed.sources.find(s=>s.key===key);return {title:s.title,url:s.url,retrievedAt:s.retrievedAt};})};
    })])),routes:routes.filter(r=>r.products.some(m=>m.productSlug===p.slug)).map(r=>({slug:r.slug,name:r.name,description:r.description}))}));
  const report={humanPublicationApproval:false,baselineSha256:hash(baseline),proposalSha256:hash(proposal),newProducts:newProducts.length,
    claims:changes.length+newProducts.length,verified:changes.filter(c=>c.status==='verified').length+newProducts.length,likely:changes.filter(c=>c.status==='likely').length,
    routes:escapeDefinitions.map(def=>{const r=routes.find(r=>r.slug===def.slug);const candidates=rankCandidates(def,r.products.map(m=>({product:pages.find(p=>p.slug===m.productSlug)})));return {slug:def.slug,researchCandidates:candidates.length,qualified:candidates.filter(c=>c.eligible).length,candidates:candidates.map(c=>({slug:c.product.slug,blockers:c.blockers}))};}),changes};
  return {reviewed,delta,pages,report};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const result=buildEscapeDraft(read('.seed-output/editorial-fit/reviewed-five-ecosystems.json'),read('seed/research/escape-content-2026-10-07.json'),read('seed/research/escape-candidates-2026-10-07.json'),read('seed/research/escape-draft-review-2026-10-07.json'));
  const output=path.join(root,'.seed-output/escape-draft');fs.mkdirSync(output,{recursive:true});
  for(const [name,value] of Object.entries({bundle:result.reviewed,delta:result.delta,'product-preview':result.pages,review:result.report}))fs.writeFileSync(path.join(output,`${name}.json`),JSON.stringify(value,null,2)+'\n');
  console.log(`${result.pages.length} draft previews; ${result.report.newProducts} new products; ${result.report.verified} verified documentary claims; ${result.report.likely} likely editorial claims.`);
  console.log(result.report.routes.map(r=>`${r.slug}: ${r.qualified}/${r.researchCandidates} qualified draft candidates`).join('\n'));
  console.log('Separate local preview files only. Accepted baseline unchanged. No SQL, database writes or publication.');
}
