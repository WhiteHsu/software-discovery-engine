import test from 'node:test';
import assert from 'node:assert/strict';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
import {rankEscapeCandidates} from '../lib/discovery/privacy-route.ts';
import {selectedGemCards} from '../lib/discovery/hidden-gems.ts';
import {gemText,localizedGemsReady} from '../lib/i18n/hidden-gems-localized.ts';
import {products,routes,membership} from './locale-expanded-fixtures.mjs';
import {chinesePath,englishPath,localeNavigation} from '../lib/i18n/pilot.ts';
import {sitemapXml} from '../lib/discovery/seo.ts';
import {parseEventV2} from '../lib/analytics/events-v2.ts';
const pages=routes.map(r=>({...r,published:true,lastVerifiedAt:r.last_verified_at,candidates:rankEscapeCandidates(escapeDefinitions.find(d=>d.slug===r.slug),membership.get(r.slug).map(slug=>({product:products.find(p=>p.slug===slug),noveltyScore:0})))}));
const cards=selectedGemCards(pages);
test('all editorial picks translate exact current source text without mutating selection, evidence or order',()=>{
 const before=structuredClone(cards);assert.equal(localizedGemsReady(cards),true);assert.deepEqual(cards.map(c=>c.slug),['joplin','krita','pdf24-creator']);
 for(const c of cards)for(const field of ['workflow','reason','scope','pricing','tradeOff'])assert.ok(gemText(c[field]),c[field]);
 assert.deepEqual(cards,before);
});
test('incomplete, duplicated or changed collections fail closed without alternative picks',()=>{
 assert.equal(localizedGemsReady([]),false);assert.equal(localizedGemsReady(cards.slice(1)),false);assert.equal(localizedGemsReady([cards[0],cards[0],cards[0]]),false);
 for(const field of ['workflow','reason','scope','pricing','tradeOff']){const changed=structuredClone(cards);changed[1][field]+=' New wording';assert.equal(localizedGemsReady(changed),false);}
});
test('collection navigation, canonical pairs and sanitized locale paths are reciprocal',()=>{
 assert.equal(chinesePath('/zh-hant/hidden-gems'),true);assert.equal(englishPath('/zh-hant/hidden-gems'),'/hidden-gems');
 assert.equal(localeNavigation('/hidden-gems',[],[],true).alternate,'/zh-hant/hidden-gems');assert.equal(localeNavigation('/zh-hant/hidden-gems',[],[],true).alternate,'/hidden-gems');assert.equal(localeNavigation('/hidden-gems',[]).alternate,null);
 const xml=sitemapXml('https://toolelse.com',['/hidden-gems','/zh-hant/hidden-gems']);assert.match(xml,/hreflang="zh-Hant"/);assert.throws(()=>sitemapXml('https://toolelse.com',['/zh-hant/hidden-gems/unknown']));
});
test('Chinese editorial events and downstream attribution preserve real localized paths',()=>{
 const base={version:2,eventId:crypto.randomUUID(),sessionId:crypto.randomUUID(),pageViewId:crypto.randomUUID(),occurredAt:new Date().toISOString(),surface:'hidden_gems',path:'/zh-hant/hidden-gems'};
 assert.equal(parseEventV2({...base,name:'page_viewed'}).path,base.path);
 for(const name of ['product_impression','product_clicked'])assert.equal(parseEventV2({...base,name,productSlug:'joplin',position:1,exposureId:crypto.randomUUID()}).path,base.path);
 const product={...base,surface:'product',path:'/zh-hant/software/joplin',productSlug:'joplin',originSurface:'hidden_gems',originPageViewId:base.pageViewId,originExposureId:crypto.randomUUID(),originPosition:1};
 for(const name of ['page_viewed','outbound_clicked'])assert.equal(parseEventV2({...product,name}).originSurface,'hidden_gems');
 assert.throws(()=>parseEventV2({...product,name:'outbound_clicked',originRouteSlug:'simple-notion-alternatives'}));
 assert.throws(()=>parseEventV2({...base,name:'page_viewed',path:'/zh-hant/hidden-gems/unknown'}));
});
