import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
import {rankEscapeCandidates} from '../lib/discovery/privacy-route.ts';
import {products,routes,membership} from './locale-products-fixtures.mjs';
import {localizeSearchResult} from '../lib/i18n/search-localized.ts';
const pages=routes.map(r=>({...r,published:true,lastVerifiedAt:r.last_verified_at,candidates:rankEscapeCandidates(escapeDefinitions.find(d=>d.slug===r.slug),membership.get(r.slug).map(slug=>({product:products.find(p=>p.slug===slug),noveltyScore:0})))}));
const ready={status:'ready',anchor:'notion',problem:null,attributes:['works-offline'],unresolved:false};
const mocks={
 'server-only':'export {};',
 './escapes':`export async function getEscape(slug){return globalThis.__searchRouteFixture.pages.find(p=>p.slug===slug)??null;}`,
 '../i18n/server':`export async function getChineseProduct(){return globalThis.__searchRouteFixture.translated?{}:null;} export async function getChineseEscape(){return globalThis.__searchRouteFixture.translated?{}:null;}`,
 './search-model':`export async function modelIntent(query){globalThis.__searchRouteFixture.parsed.push(query);return globalThis.__searchRouteFixture.intents[query];} export async function modelExplanations(matches){return {explanations:matches.map(m=>({slug:m.slug,factIds:m.facts.map(f=>f.id)}))};}`,
};
const hooks=registerHooks({resolve(s,c,next){if(s==='server-only'||c.parentURL?.endsWith('/lib/discovery/search-route.ts')&&Object.hasOwn(mocks,s))return {url:'data:text/javascript,'+encodeURIComponent(mocks[s]),shortCircuit:true};if(c.parentURL?.endsWith('/lib/discovery/search-route.ts')&&s.startsWith('.')&&!s.endsWith('.ts'))return {url:new URL(s+'.ts',c.parentURL).href,shortCircuit:true};return next(s,c);}});
const {makeSearchPost}=await import('../lib/discovery/search-route.ts');hooks.deregister();
test('actual English and Chinese requests share qualification, translate all outcomes, enforce readiness and share admission',async()=>{
 const env={NEXT_PUBLIC_SITE_URL:'https://toolelse.com',DISCOVERY_SEARCH_ENABLED:'true',DISCOVERY_SEARCH_RATE_SECRET:'a'.repeat(64),OPENAI_API_KEY:'synthetic-no-network',OPENAI_DISCOVERY_MODEL:'synthetic',VERCEL:'1',VERCEL_ENV:'production',ANALYTICS_ENABLED:'false'};
 const saved=new Map(Object.keys(env).map(k=>[k,process.env[k]]));Object.assign(process.env,env);
 globalThis.__searchRouteFixture={pages,translated:true,parsed:[],intents:{'Notion offline':ready,'找可離線的 Notion 替代工具':ready,'釐清':{...ready,status:'clarify',unresolved:true},'未知':{...ready,status:'unsupported',unresolved:true},'無結果':{...ready,attributes:['privacy-friendly']}}};
 const en=makeSearchPost(),zh=makeSearchPost();let client=1;
 const request=(query,chinese=true,ip=`203.0.113.${client++}`)=>new Request('https://toolelse.com/api/discover',{method:'POST',headers:{origin:'https://toolelse.com',...(chinese?{'x-discovery-locale':'zh-Hant'}:{}),'content-type':'application/json','x-vercel-forwarded-for':ip},body:JSON.stringify({query})});
 try{
  const english=await en(request('Notion offline',false)),chinese=await zh(request('找可離線的 Notion 替代工具'));assert.equal(english.status,200);assert.equal(chinese.status,200);
  const englishBody=await english.json(),chineseBody=await chinese.json();assert.ok(englishBody.matches.length);assert.deepEqual(chineseBody,localizeSearchResult(englishBody));assert.deepEqual(globalThis.__searchRouteFixture.parsed,['Notion offline','找可離線的 Notion 替代工具']);assert.equal(chinese.headers.get('cache-control'),'no-store');assert.equal(chinese.headers.get('x-robots-tag'),'noindex');
  for(const [query,state] of [['釐清','clarify'],['未知','unsupported'],['無結果','no_results']]){const r=await zh(request(query));assert.equal(r.status,200);assert.equal((await r.json()).state,state);}
  globalThis.__searchRouteFixture.translated=false;const missing=await zh(request('找可離線的 Notion 替代工具'));assert.equal(missing.status,503);assert.match((await missing.json()).error,/搜尋暫時無法使用/);assert.equal((await en(request('Notion offline',false))).status,200);
  globalThis.__searchRouteFixture.translated=true;
  for(const chinese of [true,false,true])assert.equal((await (chinese?zh:en)(request(chinese?'找可離線的 Notion 替代工具':'Notion offline',chinese,'203.0.113.100'))).status,200);
  const limited=await zh(request('找可離線的 Notion 替代工具',true,'203.0.113.100'));assert.equal(limited.status,429);assert.match((await limited.json()).error,/一分鐘/);
  const invalid=await zh(request(''));assert.equal(invalid.status,400);assert.match((await invalid.json()).error,/1～500/);
 }finally{delete globalThis.__searchRouteFixture;for(const [k,v] of saved){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
