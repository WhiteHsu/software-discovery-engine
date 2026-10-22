import test from 'node:test';
import assert from 'node:assert/strict';
import {collectV2,collectorConfigV2} from '../lib/analytics/http-v2.ts';
import {signSearchContext,readSearchContext,validateSearchContext} from '../lib/analytics/context-v2.ts';
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const now=Date.parse('2026-10-22T00:00:00.000Z'),secret='a'.repeat(64);
const intent={status:'ready',anchor:'notion',problem:null,attributes:['works-offline'],unresolved:false};
const context={version:1,path:'/discover',sessionId:id(1),pageViewId:id(2),searchId:id(3),resultSetId:id(4),issuedAt:now,expiresAt:now+1800000,intent,outcome:'results',products:['joplin','obsidian']};
const receipt=signSearchContext(context,secret);
const event={version:2,eventId:id(5),sessionId:id(1),pageViewId:id(2),occurredAt:new Date(now).toISOString(),name:'product_impression',surface:'search',path:'/discover',searchId:id(3),resultSetId:id(4),productSlug:'joplin',position:1,exposureId:id(6),anchor:'notion',constraints:['works-offline']};
const env={NEXT_PUBLIC_SITE_URL:'https://example.com',ANALYTICS_ENABLED:'true',ANALYTICS_MAINTENANCE_READY:'true',ANALYTICS_V2_ENABLED:'true',ANALYTICS_RATE_SECRET:'b'.repeat(64),ANALYTICS_CONTEXT_SECRET:secret,SUPABASE_SERVICE_ROLE_KEY:'test-placeholder',VERCEL:'1',VERCEL_ENV:'production'};
const config=collectorConfigV2(env);
const req=(body,headers={})=>new Request('https://example.com/api/events/v2',{method:'POST',headers:{origin:'https://example.com','content-type':'application/json','x-vercel-forwarded-for':'203.0.113.9',...headers},body:JSON.stringify(body)});
const deps=(store=async()=> 'ok')=>({now:()=>new Date(now),admit:()=>true,publication:async()=>{},store});
test('signed contexts cannot change products, rank, identities, intent or lifetime',()=>{
 assert.deepEqual(readSearchContext(receipt,secret,now),context);validateSearchContext(event,context);
 for(const patch of [{sessionId:id(8)},{pageViewId:id(8)},{searchId:id(8)},{resultSetId:id(8)},{position:2},{productSlug:'invented'},{anchor:'todoist'},{constraints:[]}])assert.throws(()=>validateSearchContext({...event,...patch},context));
 assert.throws(()=>readSearchContext(receipt,'c'.repeat(64),now));assert.throws(()=>readSearchContext(receipt,secret,now-1));assert.throws(()=>readSearchContext(receipt,secret,now+1800000));
 const [body,sig]=receipt.split('.');assert.throws(()=>readSearchContext(Buffer.from(JSON.stringify({...context,products:['invented']})).toString('base64url')+'.'+sig,secret,now));
 assert.throws(()=>signSearchContext({...context,products:['joplin','joplin']},secret));
});
test('collector defaults off and rejects shared signing/rate secrets',async()=>{
 assert.equal(collectorConfigV2({...env,ANALYTICS_V2_ENABLED:undefined}).enabled,false);
 assert.equal(collectorConfigV2({...env,ANALYTICS_CONTEXT_SECRET:env.ANALYTICS_RATE_SECRET}).enabled,false);
 let calls=0;assert.equal((await collectV2(req({events:[event],receipt}),{...config,enabled:false},deps(async()=>{calls++;return 'ok';}))).status,404);assert.equal(calls,0);
});
test('collector requires receipt for search results and admits verified snapshots',async()=>{
 for(const body of [{events:[event]},{events:[{...event,position:2}],receipt},{events:[event],receipt:receipt+'a'}])assert.equal((await collectV2(req(body),config,deps())).status,400);
 let stored;const r=await collectV2(req({events:[event],receipt}),config,deps(async(e,key)=>{stored=e;assert.match(key,/^[a-f0-9]{64}$/);return 'ok';}));
 assert.equal(r.status,204);assert.deepEqual(stored,[event]);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('x-robots-tag'),'noindex');
});
test('opt-out, forged origin, invalid IP and limits block before persistence',async()=>{
 let calls=0;const d=deps(async()=>{calls++;return 'ok';});
 for(const [headers,status] of [[{dnt:'1'},204],[{'sec-gpc':'1'},204],[{origin:'https://evil.example'},403],[{'x-vercel-forwarded-for':'not-an-ip'},503],[{'content-type':'text/plain'},415]])assert.equal((await collectV2(req({events:[event],receipt},headers),config,d)).status,status);
 assert.equal((await collectV2(req({events:[event],receipt}),config,{...d,admit:()=>false})).status,429);assert.equal(calls,0);
});
test('query text is sanitized before storage and batches cannot mix page identities',async()=>{
 const attempt={...event,name:'search_performed',productSlug:undefined,position:undefined,exposureId:undefined,resultSetId:undefined,query:'Notion alice@example.com https://example.com/private'};
 let stored;const r=await collectV2(req({events:[attempt]}),config,deps(async(e)=>{stored=e;return 'ok';}));assert.equal(r.status,204);assert.equal(stored[0].query,'Notion [email] [url]');
 assert.equal((await collectV2(req({events:[attempt,{...attempt,eventId:id(9),pageViewId:id(10)}]}),config,deps())).status,400);
 assert.equal((await collectV2(req({events:[{...attempt,occurredAt:'2020-01-01T00:00:00.000Z'}]}),config,deps())).status,400);
});
test('publication failure and storage outage return bounded errors',async()=>{
 assert.equal((await collectV2(req({events:[event],receipt}),config,{...deps(),publication:async()=>{throw Error('draft');}})).status,400);
 assert.equal((await collectV2(req({events:[event],receipt}),config,deps(async()=>{throw Error('database detail');}))).status,503);
 assert.equal((await collectV2(req({events:[event],receipt}),config,deps(async()=> 'limited'))).status,429);
});
