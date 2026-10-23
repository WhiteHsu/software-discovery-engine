import test from 'node:test';
import assert from 'node:assert/strict';
import {searchConfig,searchRequest} from '../lib/discovery/search-http.ts';
import {collectorConfigV2,collectV2} from '../lib/analytics/http-v2.ts';
const origin='https://toolelse.com';
const env={NEXT_PUBLIC_SITE_URL:origin,VERCEL:'1',VERCEL_ENV:'production',DISCOVERY_SEARCH_ENABLED:'true',DISCOVERY_SEARCH_RATE_SECRET:'a'.repeat(64),OPENAI_API_KEY:'test-only',OPENAI_DISCOVERY_MODEL:'test-model',ANALYTICS_ENABLED:'true',ANALYTICS_MAINTENANCE_READY:'true',ANALYTICS_V2_ENABLED:'true',ANALYTICS_RATE_SECRET:'b'.repeat(64),ANALYTICS_CONTEXT_SECRET:'c'.repeat(64),SUPABASE_SERVICE_ROLE_KEY:'test-only'};
const req=(host,source,path,extra={})=>new Request(host+path,{method:'POST',headers:{origin:source,'sec-fetch-site':'same-origin','content-type':'application/json','x-vercel-forwarded-for':'203.0.113.1',...extra},body:JSON.stringify({query:'offline notes'})});
test('ToolElse production search accepts its origin and rejects old host or cross-origin before running search',async()=>{
 let calls=0; const deps={admit:()=>true,now:()=>0,run:async()=>{calls++;return {ok:true};}};
 const config=searchConfig(env);assert.equal(config.enabled,true);assert.equal(config.origin,origin);
 assert.equal((await searchRequest(req(origin,origin,'/api/discover'),config,deps)).status,200);
 for(const old of ['https://software-discovery-engine.vercel.app','https://www.toolelse.com']){
  assert.equal((await searchRequest(req(origin,old,'/api/discover'),config,deps)).status,403);
  assert.equal((await searchRequest(req(old,origin,'/api/discover'),config,deps)).status,403);
 }
 assert.equal(calls,1);assert.equal(searchConfig({...env,VERCEL_ENV:'preview'}).enabled,false);
});
test('ToolElse collector uses same origin, retains privacy opt-out and rejects old origins without storage',async()=>{
 const config=collectorConfigV2(env);assert.equal(config.enabled,true);assert.equal(config.origin,origin);
 const deps={now:()=>new Date('2026-10-23T00:00:00Z'),admit:()=>{throw Error('must not admit');},publication:async()=>{throw Error('must not read');},store:async()=>{throw Error('must not store');}};
 assert.equal((await collectV2(req(origin,origin,'/api/events/v2',{dnt:'1'}),config,deps)).status,204);
 for(const old of ['https://software-discovery-engine.vercel.app','https://www.toolelse.com'])assert.equal((await collectV2(req(origin,old,'/api/events/v2'),config,deps)).status,403);
});
