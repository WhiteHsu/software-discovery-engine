import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseEventV2} from '../lib/analytics/events-v2.ts';
import {collectV2,collectorConfigV2} from '../lib/analytics/http-v2.ts';
import {chinesePath,englishPath,languageAlternates} from '../lib/i18n/pilot.ts';
import {zhHantText} from '../lib/i18n/zh-hant-content.ts';
import {localizedReady,zhValue} from '../lib/i18n/localized.ts';
import {sitemapXml} from '../lib/discovery/seo.ts';
import {cleanVercelUrl,safeVercelContext,QA_SESSIONS} from '../lib/analytics/vercel-policy.ts';
import {rankCandidates,escapeDefinitions} from '../lib/discovery/escape-model.ts';
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const base={version:2,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:new Date().toISOString(),name:'page_viewed',surface:'home',path:'/zh-hant'};
const route='offline-notion-alternatives';
test('only actual pilot paths have language equivalents',()=>{
 assert.equal(chinesePath('/zh-hant'),true);assert.equal(chinesePath('/zh-hant/privacy'),true);
 assert.equal(englishPath('/zh-hant/escape/'+route),'/escape/'+route);
 for(const p of ['/zh-hant/escape/made-up','/zh-hant/software/appflowy','/zh-hant/discover','/zh-hant/?secret=x'])assert.equal(chinesePath(p),false);
 assert.deepEqual(languageAlternates('/'),{en:'/','zh-Hant':'/zh-hant'});
});
test('events preserve Chinese path and reject forged or unsupported locale contexts',()=>{
 assert.equal(parseEventV2(base).path,'/zh-hant');
 const e={...base,name:'product_impression',surface:'escape',path:'/zh-hant/escape/'+route,routeSlug:route,productSlug:'affine',position:1,exposureId:id(4)};
 assert.equal(parseEventV2(e).path,e.path);
 for(const patch of [{surface:'search'},{path:'/zh-hant/escape/made-up',routeSlug:'simple-notion-alternatives'},{path:e.path+'?secret=x'},{routeSlug:'pdf-editors-without-a-subscription'}])assert.throws(()=>parseEventV2({...e,...patch}));
 assert.equal(parseEventV2({...base,path:'/'}).path,'/');
 assert.throws(()=>parseEventV2({...base,surface:'search',name:'search_performed',searchId:id(4)}));
});
test('real collector contract admits Chinese pages, preserves payload, and checks publication',async()=>{
 const env={NEXT_PUBLIC_SITE_URL:'https://toolelse.com',ANALYTICS_ENABLED:'true',ANALYTICS_MAINTENANCE_READY:'true',ANALYTICS_V2_ENABLED:'true',ANALYTICS_RATE_SECRET:'a'.repeat(64),ANALYTICS_CONTEXT_SECRET:'b'.repeat(64),SUPABASE_SERVICE_ROLE_KEY:'test-only',VERCEL:'1',VERCEL_ENV:'production'};
 const request=()=>new Request('https://toolelse.com/api/events/v2',{method:'POST',headers:{origin:'https://toolelse.com','content-type':'application/json','x-vercel-forwarded-for':'203.0.113.2'},body:JSON.stringify({events:[base]})});
 let stored;const deps={now:()=>new Date(),admit:()=>true,publication:async()=>{},store:async events=>{stored=events;return 'ok';}};
 assert.equal((await collectV2(request(),collectorConfigV2(env),deps)).status,204);assert.equal(stored[0].path,base.path);
 assert.equal((await collectV2(request(),collectorConfigV2(env),{...deps,publication:async()=>{throw Error('withheld');}})).status,400);
});
test('Vercel accepts only released Chinese paths and keeps query removal and opt-outs',()=>{
 assert.equal(cleanVercelUrl('https://toolelse.com/zh-hant?private=x#secret'),'https://toolelse.com/zh-hant');
 assert.equal(cleanVercelUrl('https://toolelse.com/zh-hant/discover'),null);
 assert.equal(safeVercelContext(null,'1',''),false);
 for(const qa of QA_SESSIONS)assert.equal(safeVercelContext(qa,null,''),false);
 assert.equal(safeVercelContext(null,null,'https://toolelse.com/zh-hant/escape/'+route),true);
 assert.equal(safeVercelContext(null,null,'https://else.example/private'),false);
});
test('sitemap emits reciprocal alternates only when both live pages exist',()=>{
 const en='/escape/'+route,zh='/zh-hant'+en;
 const xml=sitemapXml('https://toolelse.com',['/','/zh-hant',en,zh]);
 assert.equal((xml.match(/hreflang="zh-Hant"/g)||[]).length,4);
 assert.equal((sitemapXml('https://toolelse.com',[en]).match(/hreflang=/g)||[]).length,0);
 assert.throws(()=>sitemapXml('https://toolelse.com',['/zh-hant/escape/made-up']));
});
test('translation readiness preserves ordering and withholds stale, incomplete or unpublished evidence',()=>{
 const strings=Object.keys(zhHantText),desc=strings.find(s=>s.startsWith('An open-source, local-first')),pricing=strings.find(s=>s.startsWith('Free local editor')),tradeoff=strings.find(s=>s.startsWith('Native desktop local content')),scope=strings.find(s=>s.startsWith('Personal offline note and object organization only. Native'));
 const claim=(slug,name,value,extra={})=>({slug,name,value,verificationStatus:'verified',confidence:.9,lastVerifiedAt:'2026-10-08T00:00:00Z',sources:[{title:'Source',url:'https://example.org',retrievedAt:null}],...extra});
 const candidates=['affine','anytype','appflowy'].map(slug=>({product:{slug,name:slug,description:desc,status:'published',websiteUrl:'https://example.org',attributes:[claim('works-offline','Works Offline',true),claim('pricing-model','Pricing Model',pricing),claim('trade-off-summary','Trade-Off Summary',tradeoff)],anchors:[claim('notion','Notion',undefined,{relationshipType:'alternative',scope:'personal-offline-note-object-organization',description:scope})],audiences:[],problems:[],routes:[]}}));
 const page={slug:route,name:'Offline Notion Alternatives',description:strings[0],lastVerifiedAt:'2026-10-08T00:00:00Z',published:true,candidates:rankCandidates(escapeDefinitions[0],candidates)};
 const before=JSON.stringify(page);assert.equal(localizedReady(page),true);assert.equal(JSON.stringify(page),before);
 assert.equal(localizedReady({...page,description:'new unreviewed English copy'}),false);
 assert.equal(localizedReady({...page,published:false}),false);
 assert.equal(localizedReady({...page,candidates:page.candidates.slice(0,2)}),false);
 assert.equal(zhValue({...candidates[0].product.attributes[0],verificationStatus:'unknown'}),'未知');
});
test('translation covers public source snapshot long-form content',()=>{
 // Source snapshot is embedded as dictionary keys. No autogenerated claim translation.
 assert.ok(Object.keys(zhHantText).length>=40);
 for(const value of Object.values(zhHantText))assert.ok(value.trim());
 const page=readFileSync(new URL('../app/zh-hant/escape/[slug]/page.tsx',import.meta.url),'utf8');
 assert.match(page,/getChineseEscape/);assert.doesNotMatch(page,/DiscoveryTracker/);
});
