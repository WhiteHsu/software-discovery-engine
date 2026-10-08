import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {validateSeedBundle} from './validate.mjs';import {escapeDefinitions,rankCandidates,publishable} from '../../lib/discovery/escape-model.ts';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const scope='personal-offline-note-object-organization';
const urls={overview:'https://doc.anytype.io/anytype/getting-started/readme',localOnly:'https://doc.anytype.io/anytype/data/sync-and-backup/local-only',membership:'https://raw.githubusercontent.com/anyproto/docs/main/resources/memberships/README.md',migration:'https://raw.githubusercontent.com/anyproto/docs/main/data/import-and-export/migrate-from-notion.md',notion:'https://www.notion.com/en-gb/help/use-pages-offline'};
export function buildAnytypeOfflineDraft(input,review){
 if(review.version!==1||review.reviewType!=='anytype-offline-documentary-review'||review.date!=='2026-10-08T00:00:00Z'||review.publicationApproved!==false||review.scope!==scope||!review.method?.trim()||review.sources?.length!==5)throw Error('Invalid unapproved scoped review');
 const errors=validateSeedBundle(input);if(errors.length)throw Error(errors.join('\n'));
 if(input.products.some(p=>p.status!=='draft')||input.escapeRoutes.some(r=>r.status!=='draft'||r.editoriallyApproved))throw Error('Expected separate local draft graph; live published records cannot be rewritten');
 const bundle=structuredClone(input),p=bundle.products.find(p=>p.slug==='anytype');
 if(!p||hash(p)!==review.beforeSha256||p.anchors.some(c=>c.slug==='notion'))throw Error('Anytype baseline drift');
 const sourceKeys={};
 for(const name of Object.keys(urls)){
  const s=review.sources.find(s=>s.id===name);
  if(!s||s.url!==urls[name]||!s.title?.trim()||!s.statement?.trim()||!s.limitations?.trim())throw Error('Missing official source/limitations');
  const key='anytype-offline-'+hash(s.url).slice(0,16)+'-2026-10-08';sourceKeys[name]=key;
  const row={key,url:s.url,title:s.title,sourceType:'documentation',publisher:name==='notion'?'Notion':'Anytype',retrievedAt:review.date};
  if(bundle.sources.some(s=>s.key===key))throw Error('Source identity collision');bundle.sources.push(row);
 }
 if(review.claims?.length!==3||new Set(review.claims.map(c=>c.slug)).size!==3)throw Error('Exactly three documentary attributes required');
 const allowed={'works-offline':['overview','localOnly'],'pricing-model':['membership'],'trade-off-summary':['localOnly','migration']};
 for(const c of review.claims){
  if(!Object.hasOwn(allowed,c.slug)||JSON.stringify(c.sources)!==JSON.stringify(allowed[c.slug])||(c.slug==='works-offline'?c.value!==true:typeof c.value!=='string'||!c.value.trim()))throw Error('Invalid attribute identity/value/source');
  if(c.slug==='trade-off-summary'&&(!c.value.includes('experimental')||!c.value.includes('Notion')))throw Error('Required migration/local-only limits missing');
  const old=p.attributes.find(a=>a.slug===c.slug);if(!old)throw Error('Missing prior attribute');
  p.attributes[p.attributes.indexOf(old)]={slug:c.slug,value:c.value,verificationStatus:'verified',confidence:.95,lastVerifiedAt:review.date,evidence:c.sources.map(id=>sourceKeys[id])};
 }
 if(!review.alternativeStatement?.trim()||!review.scopeDescription?.startsWith('Personal offline note and object organization only.')||!review.scopeDescription.includes('No guarantee of full Notion')||!review.routeDescription?.includes('Notion also supports offline'))throw Error('Comparison scope/context missing');
 p.anchors.push({slug:'notion',relationshipType:'alternative',scope,scopeDescription:review.scopeDescription,verificationStatus:'verified',confidence:.85,lastVerifiedAt:review.date,evidence:['overview','migration','notion'].map(id=>sourceKeys[id])});
 const route=bundle.escapeRoutes.find(r=>r.slug==='offline-notion-alternatives');
 if(!route||JSON.stringify(route.products.map(m=>m.productSlug).sort())!==JSON.stringify(['affine','appflowy','anytype','obsidian'].sort()))throw Error('Offline route membership drift');
 route.description=review.routeDescription;route.lastVerifiedAt=review.date;
 route.products.find(m=>m.productSlug==='anytype').editorialNote=review.scopeDescription;
 const validation=validateSeedBundle(bundle);if(validation.length)throw Error(validation.join('\n'));
 const kinds=['attributes','anchors','problems','audiences'];
 const pages=bundle.products.map(p=>({slug:p.slug,name:p.name,description:p.shortDescription,websiteUrl:p.websiteUrl,status:p.status,...Object.fromEntries(kinds.map(kind=>[kind,p[kind].map(c=>{const t=bundle[kind].find(t=>t.slug===c.slug);return {...c,name:t.name,description:c.scopeDescription??t.description??null,sources:c.evidence.map(key=>{const s=bundle.sources.find(s=>s.key===key);return {title:s.title,url:s.url,retrievedAt:s.retrievedAt};})};})])),routes:bundle.escapeRoutes.filter(r=>r.products.some(m=>m.productSlug===p.slug)).map(r=>({slug:r.slug,name:r.name,description:r.description}))}));
 const candidates=rankCandidates(escapeDefinitions[0],route.products.map(m=>({product:pages.find(p=>p.slug===m.productSlug)})));
 const report={publicationApproved:false,inputSha256:hash(input),reviewSha256:hash(review),scope,updatedProduct:'anytype',attributeClaims:3,newAnchorClaims:1,qualifiedDraftCandidates:candidates.filter(c=>c.eligible).length,qualifiedPublishedCandidates:0,publishable:publishable({published:false,candidates}),candidates:candidates.map(c=>({slug:c.product.slug,quality:c.quality,eligible:c.eligible,blockers:c.blockers})),notionContextSource:urls.notion,classification:'Bounded documentary comparison; no hands-on tests or complete replacement guarantee.'};
 return {bundle,pages,report};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('No arguments supported');const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));const r=buildAnytypeOfflineDraft(read('.seed-output/escape-draft/bundle.json'),read('seed/research/anytype-offline-review-2026-10-08.json'));for(const [name,value] of Object.entries({bundle:r.bundle,'product-preview':r.pages,'anytype-offline-review':r.report}))fs.writeFileSync('.seed-output/escape-draft/'+name+'.json',JSON.stringify(value,null,2)+'\n');console.log(`${r.report.qualifiedDraftCandidates}/4 qualified offline draft candidates; 0 published in local draft graph; publishable=false. No SQL, remote writes or publication.`);}catch(e){console.error(e.message);process.exitCode=1;}
}
