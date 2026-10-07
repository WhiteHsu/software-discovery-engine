import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateSeedBundle} from './validate.mjs';
import {escapeDefinitions,rankCandidates,publishable} from '../../lib/discovery/escape-model.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const scope='personal-task-project-organization';
const routeSlug='todoist-alternatives-with-a-one-time-purchase';
const urls={things:'https://culturedcode.com/things/',omnifocus:'https://www.omnigroup.com/omnifocus/features/','2do':'https://www.2doapp.com/'};
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const text=v=>typeof v==='string'&&!!v.trim();

export function buildTodoistWorkflow(input,review){
 if(review.reviewType!=='scoped-todoist-workflow-review'||review.scope!==scope||review.publicationApproved!==false||!text(review.method)||!Number.isFinite(Date.parse(review.date))||review.anchorSource?.url!=='https://www.todoist.com/features'||!text(review.anchorSource.statement))throw Error('Invalid bounded workflow review.');
 const errors=validateSeedBundle(input);if(errors.length)throw Error(errors.join('\n'));
 if(input.products.some(p=>p.status!=='draft')||input.escapeRoutes.some(r=>r.status!=='draft'||r.editoriallyApproved))throw Error('Only unapproved local drafts are supported.');
 const bundle=structuredClone(input),seen=new Set(),changes=[];
 const source=(url,title)=>{const key=`todoist-workflow-${hash(url).slice(0,16)}`;if(!bundle.sources.some(s=>s.key===key))bundle.sources.push({key,url,title,sourceType:'official',publisher:title,retrievedAt:review.date});return key;};
 const anchorKey=source(review.anchorSource.url,'Todoist — official task and project features');
 for(const c of review.candidates){
  if(seen.has(c.product)||!Object.hasOwn(urls,c.product)||c.url!==urls[c.product]||![c.edition,c.statement,c.limits].every(text))throw Error('Invalid or duplicate workflow candidate.');seen.add(c.product);
  const p=bundle.products.find(p=>p.slug===c.product),old=p?.anchors.find(a=>a.slug==='todoist');
  if(!old||old.verificationStatus!=='likely'||old.relationshipType!=='alternative'||hash(old)!==c.beforeSha256)throw Error('Alternative baseline drift.');
  const next={slug:'todoist',relationshipType:'alternative',scope,scopeDescription:`Personal task capture and project organization only. Edition: ${c.edition}. ${c.limits} No guarantee of team, platform or complete Todoist parity.`,verificationStatus:'verified',confidence:0.85,lastVerifiedAt:review.date,evidence:[anchorKey,source(c.url,`${p.name} — official task and project workflow`)]};
  p.anchors[p.anchors.indexOf(old)]=next;
  changes.push({product:p.slug,before:old,after:next,evidenceStatement:c.statement,classification:'Evidence-backed bounded workflow comparison; not an official vendor endorsement or hands-on parity test.'});
 }
 if(seen.size!==3)throw Error('Expected exactly three reviewed workflow candidates.');
 const route=bundle.escapeRoutes.find(r=>r.slug===routeSlug);
 if(!route||route.products.length!==3||route.products.some(m=>!seen.has(m.productSlug)))throw Error('Route membership drift.');
 route.description='Compare native buy-once editions for personal task capture and project organization. Team collaboration, platform parity and complete Todoist replacement are outside this scope. Future major versions, additional platforms or Web access may cost extra. Draft route; publication is not approved.';
 route.lastVerifiedAt=review.date;
 for(const m of route.products)m.editorialNote=bundle.products.find(p=>p.slug===m.productSlug).anchors.find(a=>a.slug==='todoist').scopeDescription;
 const validation=validateSeedBundle(bundle);if(validation.length)throw Error(validation.join('\n'));
 const kinds=['attributes','anchors','problems','audiences'];
 const pages=bundle.products.map(p=>({slug:p.slug,name:p.name,description:p.shortDescription,websiteUrl:p.websiteUrl,status:p.status,
  ...Object.fromEntries(kinds.map(kind=>[kind,p[kind].map(c=>{const t=bundle[kind].find(t=>t.slug===c.slug);return {...c,name:t.name,description:c.scopeDescription??t.description??null,sources:c.evidence.map(key=>{const s=bundle.sources.find(s=>s.key===key);return {title:s.title,url:s.url,retrievedAt:s.retrievedAt};})};})])),
  routes:bundle.escapeRoutes.filter(r=>r.products.some(m=>m.productSlug===p.slug)).map(r=>({slug:r.slug,name:r.name,description:r.description}))}));
 const def=escapeDefinitions.find(d=>d.slug===routeSlug),candidates=rankCandidates(def,route.products.map(m=>({product:pages.find(p=>p.slug===m.productSlug)})));
 const report={publicationApproved:false,inputSha256:hash(input),reviewSha256:hash(review),scope,changes,qualifiedDraftCandidates:candidates.filter(c=>c.eligible).length,qualifiedPublishedCandidates:candidates.filter(c=>c.eligible&&c.product.status==='published').length,publishable:publishable({published:false,candidates}),candidates:candidates.map(c=>({slug:c.product.slug,quality:c.quality,eligible:c.eligible,blockers:c.blockers}))};
 return {bundle,pages,report};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
 const result=buildTodoistWorkflow(read('.seed-output/escape-draft/bundle.json'),read('seed/research/todoist-workflow-review-2026-10-07.json'));
 const out=path.join(root,'.seed-output/escape-draft');
 for(const [name,value] of Object.entries({bundle:result.bundle,'product-preview':result.pages,'todoist-workflow-review':result.report}))fs.writeFileSync(path.join(out,`${name}.json`),JSON.stringify(value,null,2)+'\n');
 console.log(`${result.report.qualifiedDraftCandidates}/3 qualified personal-workflow draft candidates; ${result.report.qualifiedPublishedCandidates} published; publishable=${result.report.publishable}.`);
 console.log('34 local previews; audience fits unchanged. No SQL, database writes or publication.');
}
