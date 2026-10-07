import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateSeedBundle} from './validate.mjs';
import {escapeDefinitions,rankCandidates} from '../../lib/discovery/escape-model.ts';
import {safeUrl} from '../../lib/discovery/model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const kinds=['attributes','anchors','problems','audiences'];
const allowedProducts=['things','omnifocus'];
const allowedClaims=['one-time-purchase','no-subscription','pricing-model','trade-off-summary'];
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');

export function buildBuyOnceDraft(input,review){
  if(review.reviewType!=='buy-once-documentary-review'||review.humanPublicationApproval!==false||!review.reviewMethod?.trim()||!Number.isFinite(Date.parse(review.date)))throw Error('Invalid documentary review.');
  const errors=validateSeedBundle(input);if(errors.length)throw Error(errors.join('\n'));
  if(input.products.some(p=>p.status!=='draft')||input.escapeRoutes.some(r=>r.status!=='draft'||r.editoriallyApproved))throw Error('Only unapproved local draft input is supported.');
  const bundle=structuredClone(input),seen=new Set(),changes=[];
  for(const c of review.claims){
    const identity=`${c.product}/${c.slug}`;
    if(seen.has(identity)||!allowedProducts.includes(c.product)||!allowedClaims.includes(c.slug)||!c.scope?.trim()||!safeUrl(c.url))throw Error('Invalid/duplicate scoped claim.');
    const expected=c.product==='things'?'https://culturedcode.com/things/support/articles/2803552/':'https://www.omnigroup.com/omnifocus/buy/';
    if(c.url!==expected)throw Error('Unexpected official source.');
    if(['one-time-purchase','no-subscription'].includes(c.slug)?c.value!==true:typeof c.value!=='string'||!c.value.trim())throw Error('Invalid claim value.');
    seen.add(identity);
    const p=bundle.products.find(p=>p.slug===c.product);if(!p)throw Error('Missing reviewed product.');
    const old=p.attributes.find(a=>a.slug===c.slug);
    const before=old?{value:old.value,verificationStatus:old.verificationStatus}:null;
    if(JSON.stringify(before)!==JSON.stringify(c.before))throw Error(`Baseline drift: ${identity}`);
    if(!bundle.attributes.some(a=>a.slug===c.slug))throw Error('Missing attribute taxonomy.');
    const key=`buy-once-${hash(c.url).slice(0,16)}`;
    if(!bundle.sources.some(s=>s.key===key))bundle.sources.push({key,url:c.url,title:`${p.name} — official purchase terms`,sourceType:'pricing',publisher:p.name,retrievedAt:review.date});
    const next={slug:c.slug,value:c.value,verificationStatus:'verified',confidence:0.95,lastVerifiedAt:review.date,evidence:[key]};
    if(old)p.attributes[p.attributes.indexOf(old)]=next;else p.attributes.push(next);
    changes.push({identity,before,after:next,scope:c.scope});
  }
  if(seen.size!==8)throw Error('Expected eight documentary claims for two products.');
  const validation=validateSeedBundle(bundle);if(validation.length)throw Error(validation.join('\n'));
  const pages=bundle.products.map(p=>({slug:p.slug,name:p.name,description:p.shortDescription,websiteUrl:p.websiteUrl,status:p.status,
    ...Object.fromEntries(kinds.map(kind=>[kind,p[kind].map(c=>{const t=bundle[kind].find(t=>t.slug===c.slug);return {...c,name:t.name,description:t.description??null,sources:c.evidence.map(key=>{const s=bundle.sources.find(s=>s.key===key);return {title:s.title,url:s.url,retrievedAt:s.retrievedAt};})};})])),
    routes:bundle.escapeRoutes.filter(r=>r.products.some(m=>m.productSlug===p.slug)).map(r=>({slug:r.slug,name:r.name,description:r.description}))}));
  const report={humanPublicationApproval:false,inputSha256:hash(input),reviewSha256:hash(review),changes,
    routes:escapeDefinitions.map(def=>{const r=bundle.escapeRoutes.find(r=>r.slug===def.slug);const candidates=rankCandidates(def,(r?.products??[]).map(m=>({product:pages.find(p=>p.slug===m.productSlug)})));return {slug:def.slug,qualified:candidates.filter(c=>c.eligible).length,candidates:candidates.map(c=>({slug:c.product.slug,blockers:c.blockers}))};})};
  return {bundle,pages,report};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
  const input=read('.seed-output/escape-draft/bundle.json');
  const result=buildBuyOnceDraft(input,read('seed/research/escape-buy-once-review-2026-10-07.json'));
  const out=path.join(root,'.seed-output/escape-draft');
  fs.writeFileSync(path.join(out,'buy-once-review.json'),JSON.stringify(result.report,null,2)+'\n');
  fs.writeFileSync(path.join(out,'bundle.json'),JSON.stringify(result.bundle,null,2)+'\n');
  fs.writeFileSync(path.join(out,'product-preview.json'),JSON.stringify(result.pages,null,2)+'\n');
  console.log('34 draft previews; eight scoped documentary claims updated for Things and OmniFocus.');
  console.log('Alternative/audience judgments remain unchanged; no SQL, database writes or publication.');
}
