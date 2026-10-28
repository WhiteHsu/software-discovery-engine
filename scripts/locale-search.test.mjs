import test from 'node:test';
import assert from 'node:assert/strict';
import {searchGraph} from '../lib/discovery/search-graph.ts';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
import {rankEscapeCandidates} from '../lib/discovery/privacy-route.ts';
import {searchAnchors,searchAttributes,searchProblems} from '../lib/discovery/search-intent.ts';
import {products,routes,membership} from './locale-products-fixtures.mjs';
import {localizeSearchResult,searchIntentLabels} from '../lib/i18n/search-localized.ts';
import {chinesePath,englishPath,localeNavigation} from '../lib/i18n/pilot.ts';
import {parseEventV2} from '../lib/analytics/events-v2.ts';
import {searchReceipt} from '../lib/analytics/search-receipt.ts';
import {readSearchContext,validateSearchContext} from '../lib/analytics/context-v2.ts';
import {collectorConfigV2,collectV2} from '../lib/analytics/http-v2.ts';
export const pages=routes.map(r=>({...r,published:true,lastVerifiedAt:r.last_verified_at,candidates:rankEscapeCandidates(escapeDefinitions.find(d=>d.slug===r.slug),membership.get(r.slug).map(slug=>({product:products.find(p=>p.slug===slug),noveltyScore:0})))}));
const intent={status:'ready',anchor:'notion',problem:null,attributes:['works-offline'],unresolved:false};
const resultFor=i=>{const matches=searchGraph(i,pages).map(m=>({...m,explanationFacts:m.facts.map(f=>f.id)}));return {state:matches.length?'results':'no_results',intent:i,matches,explanationMode:'verified-evidence'};};
test('all represented needs use complete Chinese labels and translated matches retain exact qualification/order/evidence',()=>{
 for(const slug of [...searchAnchors,...searchAttributes,...searchProblems])assert.ok(searchIntentLabels[slug]);
 const intents=[...searchAnchors.map(anchor=>({...intent,anchor,attributes:[]})),...searchAttributes.map(a=>({...intent,anchor:null,attributes:[a]})),...searchProblems.map(problem=>({...intent,anchor:null,attributes:[],problem})),{...intent,attributes:['focused-note-taking','no-database-required','minimal-setup','works-offline','ai-optional']}];
 let translatedCount=0;
 for(const i of intents){const source=resultFor(i),before=structuredClone(source),zh=localizeSearchResult(source);assert.deepEqual(source,before);assert.deepEqual(zh.intent,source.intent);assert.equal(zh.state,source.state);assert.deepEqual(zh.matches.map(m=>[m.slug,m.routeSlug,m.score,m.checkedAt,m.explanationFacts]),source.matches.map(m=>[m.slug,m.routeSlug,m.score,m.checkedAt,m.explanationFacts]));for(const [n,m] of zh.matches.entries()){assert.deepEqual(m.facts.map(f=>[f.id,f.checkedAt,f.sources]),source.matches[n].facts.map(f=>[f.id,f.checkedAt,f.sources]));translatedCount++;}}
 assert.ok(translatedCount>20);
});
test('missing display translations fail the whole result, while no-match/clarify/unsupported states retain all requirements',()=>{
 const source=resultFor(intent);assert.ok(source.matches.length);
 for(const field of ['description','scope','pricing','tradeOff']){const changed=structuredClone(source);changed.matches[0][field]+=' Unknown wording';assert.throws(()=>localizeSearchResult(changed));}
 const fact=structuredClone(source);fact.matches[0].facts[0].value+=' Changed';assert.throws(()=>localizeSearchResult(fact));
 for(const state of ['no_results','clarify','unsupported']){const empty={...source,state,intent:state==='no_results'?intent:{...intent,status:state,unresolved:true},matches:[]};assert.deepEqual(localizeSearchResult(empty),empty);}
});
test('discover navigation and search event paths map reciprocally without admitting variants',()=>{
 assert.equal(chinesePath('/zh-hant/discover'),true);assert.equal(englishPath('/zh-hant/discover'),'/discover');assert.equal(localeNavigation('/discover',[]).alternate,'/zh-hant/discover');assert.equal(localeNavigation('/zh-hant/discover',[]).alternate,'/discover');
 const e={version:2,eventId:crypto.randomUUID(),sessionId:crypto.randomUUID(),pageViewId:crypto.randomUUID(),occurredAt:new Date().toISOString(),name:'search_performed',surface:'search',searchId:crypto.randomUUID()};
 for(const path of ['/','/discover','/zh-hant','/zh-hant/discover'])assert.equal(parseEventV2({...e,path}).path,path);
 for(const path of ['/zh-hant/discover/','/zh-hant/discover?query=private','/zh-hant/unknown'])assert.throws(()=>parseEventV2({...e,path}));
});
test('Chinese signed search results and downstream origin pass the actual collector; tampering remains blocked',async()=>{
 const env={NEXT_PUBLIC_SITE_URL:'https://toolelse.com',ANALYTICS_ENABLED:'true',ANALYTICS_MAINTENANCE_READY:'true',ANALYTICS_V2_ENABLED:'true',ANALYTICS_RATE_SECRET:'a'.repeat(64),ANALYTICS_CONTEXT_SECRET:'b'.repeat(64),SUPABASE_SERVICE_ROLE_KEY:'synthetic',VERCEL:'1',VERCEL_ENV:'production'};
 const now=Date.now(),source=resultFor(intent),c={sessionId:crypto.randomUUID(),pageViewId:crypto.randomUUID(),searchId:crypto.randomUUID(),path:'/zh-hant/discover'};
 const req=new Request('https://toolelse.com/api/discover',{headers:{'x-discovery-locale':'zh-Hant','x-discovery-context':JSON.stringify(c)}});
 const metadata=searchReceipt(req,source,env,now);assert.ok(metadata);const context=readSearchContext(metadata.receipt,env.ANALYTICS_CONTEXT_SECRET,now);assert.equal(context.path,c.path);
 assert.equal(searchReceipt(new Request('https://toolelse.com/api/discover',{headers:{'x-discovery-context':JSON.stringify(c)}}),source,env,now),undefined);
 assert.equal(searchReceipt(new Request(req,{headers:{...Object.fromEntries(req.headers),dnt:'1'}}),source,env,now),undefined);
 const base={...c,version:2,eventId:crypto.randomUUID(),occurredAt:new Date(now).toISOString(),surface:'search',anchor:intent.anchor,constraints:intent.attributes,resultSetId:metadata.resultSetId};
 const event={...base,name:'product_clicked',productSlug:source.matches[0].slug,position:1,exposureId:crypto.randomUUID()};validateSearchContext(parseEventV2(event),context);
 const product={version:2,eventId:crypto.randomUUID(),sessionId:c.sessionId,pageViewId:crypto.randomUUID(),occurredAt:base.occurredAt,name:'outbound_clicked',surface:'product',path:'/zh-hant/software/'+event.productSlug,productSlug:event.productSlug,originSurface:'search',originPageViewId:c.pageViewId,originSearchId:c.searchId,originExposureId:event.exposureId,originPosition:1};
 const collect=async e=>{let stored;const response=await collectV2(new Request('https://toolelse.com/api/events/v2',{method:'POST',headers:{origin:'https://toolelse.com','content-type':'application/json','x-vercel-forwarded-for':'203.0.113.8'},body:JSON.stringify({events:[e],receipt:metadata.receipt})}),collectorConfigV2(env),{now:()=>new Date(now),admit:()=>true,publication:async()=>{},store:async events=>{stored=events;return 'ok';}});return {status:response.status,stored};};
 assert.equal((await collect(event)).status,204);assert.equal((await collect(product)).stored[0].originPageViewId,c.pageViewId);
 for(const patch of [{path:'/discover'},{position:2},{productSlug:'invented'}])assert.equal((await collect({...event,...patch})).status,400);
});
