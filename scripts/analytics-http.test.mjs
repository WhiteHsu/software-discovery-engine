import test from 'node:test';
import assert from 'node:assert/strict';
import {collectEvents,collectorConfig,dailyRateKey,memoryAdmission,purgeEvents} from '../lib/analytics/http.ts';
const now=new Date('2026-10-19T02:00:00.000Z');
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const e={version:1,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:now.toISOString(),name:'product_impression',surface:'escape',routeSlug:'privacy-friendly-grammarly-alternatives',path:'/escape/privacy-friendly-grammarly-alternatives',productSlug:'vale-local-passive-3-24-0',exposureId:id(4),position:1};
const config={enabled:true,origin:'https://example.org',rateSecret:'a'.repeat(64),trustedVercel:true};
const headers={'origin':config.origin,'content-type':'application/json','sec-fetch-site':'same-origin','x-vercel-forwarded-for':'203.0.113.1'};
const request=(body=JSON.stringify([e]),patch={})=>new Request(config.origin+'/api/events',{method:'POST',headers:{...headers,...patch},body});
const context={products:new Set([e.productSlug]),placements:[{routeSlug:e.routeSlug,productSlug:e.productSlug,position:1}]};
const setup=()=>{const calls={lookup:0,store:0,key:'',events:[]};return {calls,deps:{now:()=>now,admit:()=>true,publication:async()=>{calls.lookup++;return context;},store:async(events,key)=>{calls.store++;calls.key=key;calls.events=events;return 'ok';}}};};
test('default configuration is disabled and requires maintenance, secrets, canonical HTTPS and production platform',()=>{
 assert.equal(collectorConfig({}).enabled,false);
 const env={ANALYTICS_ENABLED:'true',ANALYTICS_MAINTENANCE_READY:'true',NEXT_PUBLIC_SITE_URL:config.origin,ANALYTICS_RATE_SECRET:config.rateSecret,SUPABASE_SERVICE_ROLE_KEY:'synthetic-test-only',VERCEL:'1',VERCEL_ENV:'production'};
 assert.equal(collectorConfig(env).enabled,true);assert.equal(collectorConfig(env).trustedVercel,true);
 for(const patch of [{ANALYTICS_MAINTENANCE_READY:'false'},{ANALYTICS_RATE_SECRET:''},{SUPABASE_SERVICE_ROLE_KEY:''},{NEXT_PUBLIC_SITE_URL:'https://example.org/private'}])assert.equal(collectorConfig({...env,...patch}).enabled,false);
});
test('disabled endpoint does no publication lookup or write',async()=>{
 const {calls,deps}=setup();assert.equal((await collectEvents(request(),{...config,enabled:false},deps)).status,404);assert.equal(calls.lookup+calls.store,0);
});
test('valid batch is checked against authoritative placement then stored with daily opaque quota key',async()=>{
 const {calls,deps}=setup();const response=await collectEvents(request(JSON.stringify([e,e])),config,deps);
 assert.equal(response.status,204);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(calls.store,1);assert.equal(calls.events.length,1);assert.match(calls.key,/^[a-f0-9]{64}$/);assert.ok(!calls.key.includes('203.0.113'));
 assert.notEqual(calls.key,dailyRateKey('203.0.113.1',config.rateSecret,new Date('2026-10-20T02:00:00.000Z')));
 assert.equal(dailyRateKey('2001:db8::1',config.rateSecret,now),dailyRateKey('2001:0db8:0:0:0:0:0:1',config.rateSecret,now));
});
test('cross-origin, cross-site, unsupported content and missing trusted IP are rejected before graph lookup',async()=>{
 for(const [patch,status] of [[{origin:'https://evil.example'},403],[{'sec-fetch-site':'cross-site'},403],[{'content-type':'text/plain'},415],[{'content-encoding':'gzip'},415],[{'x-vercel-forwarded-for':'bad'},503],[{'x-vercel-forwarded-for':'203.0.113.1, 192.0.2.1'},503]]){
  const {calls,deps}=setup();assert.equal((await collectEvents(request(undefined,patch),config,deps)).status,status);assert.equal(calls.lookup+calls.store,0);
 }
 const {deps}=setup();assert.equal((await collectEvents(request(),{...config,trustedVercel:false},deps)).status,503);
});
test('DNT and global privacy signal skip collection without reading or writing events',async()=>{
 for(const patch of [{dnt:'1'},{'sec-gpc':'1'}]){const {calls,deps}=setup();assert.equal((await collectEvents(request('not JSON',patch),config,deps)).status,204);assert.equal(calls.lookup+calls.store,0);}
});
test('streamed bytes and declared size are bounded; invalid JSON/schema and mixed pages do not reach storage',async()=>{
 for(const [body,patch,status] of [[' '.repeat(16385),{},413],['[]',{'content-length':'999999'},413],['bad',{},400],[JSON.stringify([{...e,rawQuery:'private text'}]),{},400],[JSON.stringify([e,{...e,eventId:id(9),pageViewId:id(10)}]),{},400]]){
  const {calls,deps}=setup();assert.equal((await collectEvents(request(body,patch),config,deps)).status,status);assert.equal(calls.store,0);assert.equal(calls.lookup,0);
 }
});
test('request stream timeout is bounded and sanitized',async()=>{
 const r=new Request(config.origin+'/api/events',{method:'POST',headers,duplex:'half',body:new ReadableStream({start(){}})});
 const {calls,deps}=setup();assert.equal((await collectEvents(r,config,{...deps,readTimeoutMs:10})).status,408);assert.equal(calls.lookup+calls.store,0);
});
test('missing qualified placement, durable quota and unavailable storage fail without exposing internal errors',async()=>{
 const {deps}=setup();assert.equal((await collectEvents(request(),config,{...deps,publication:async()=>({...context,placements:[]})})).status,400);
 const limited=await collectEvents(request(),config,{...deps,store:async()=>'limited'});assert.equal(limited.status,429);assert.equal(limited.headers.get('retry-after'),'60');
 const failed=await collectEvents(request(),config,{...deps,store:async()=>{throw Error('secret internal failure');}});assert.equal(failed.status,503);assert.equal(await failed.text(),'');
});
test('instance admission caps requests before expensive work and resets at minute boundary',async()=>{
 const admit=memoryAdmission();for(let n=0;n<30;n++)assert.equal(admit('same',now.getTime()),true);assert.equal(admit('same',now.getTime()),false);assert.equal(admit('same',now.getTime()+60000),true);
 const {calls,deps}=setup();assert.equal((await collectEvents(request(),config,{...deps,admit:()=>false})).status,429);assert.equal(calls.lookup+calls.store,0);
});
test('purge endpoint is independently disabled/authenticated and never returns event contents',async()=>{
 let calls=0;const purge=async()=>{calls++;};const secret='b'.repeat(64);
 const r=token=>new Request(config.origin+'/api/internal/analytics/purge',{method:'POST',headers:{authorization:token}});
 assert.equal((await purgeEvents(r('Bearer '+secret),secret,false,purge)).status,404);assert.equal((await purgeEvents(r('bad'),secret,true,purge)).status,401);assert.equal(calls,0);
 assert.equal((await purgeEvents(r('Bearer '+secret),secret,true,purge)).status,204);assert.equal(calls,1);
 assert.equal((await purgeEvents(r('Bearer '+secret),secret,true,async()=>{throw Error('private');})).status,503);
});
