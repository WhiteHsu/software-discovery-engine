import test from 'node:test';
import assert from 'node:assert/strict';
import {products} from './locale-products-fixtures.mjs';
import {localizedProductReady,translateProduct} from '../lib/i18n/product-localized.ts';
import {chineseProduct,chinesePath,englishPath,localeNavigation} from '../lib/i18n/pilot.ts';
import {translatedProductSlugs} from '../lib/i18n/product-slugs.ts';
import {parseEventV2} from '../lib/analytics/events-v2.ts';
import {cleanVercelUrl} from '../lib/analytics/vercel-policy.ts';
import {sitemapXml} from '../lib/discovery/seo.ts';
import {latestVerification} from '../lib/discovery/model.ts';
test('all 30 full product display snapshots are translated without altering evidence, values or dates',()=>{
 assert.equal(products.length,30);assert.equal(translatedProductSlugs.length,30);
 for(const p of products){assert.ok(localizedProductReady(p),p.slug);const original=structuredClone(p),zh=translateProduct(p);assert.deepEqual(p,original);assert.equal(zh.name,p.name);assert.equal(zh.websiteUrl,p.websiteUrl);assert.equal(latestVerification(zh),latestVerification(p));for(const field of ['attributes','anchors','audiences','problems']){assert.deepEqual(zh[field].map(c=>c.slug),p[field].map(c=>c.slug));for(const [i,c] of zh[field].entries()){const old=p[field][i];assert.deepEqual(c.sources,old.sources);assert.equal(c.verificationStatus,old.verificationStatus);assert.equal(c.lastVerifiedAt,old.lastVerifiedAt);if(typeof old.value!=='string')assert.equal(c.value,old.value);}}}
});
test('incomplete, stale, draft or unregistered products fail closed',()=>{
 const p=products[0];for(const patch of [{description:p.description+' changed'},{status:'draft'},{slug:'invented'}])assert.equal(localizedProductReady({...p,...patch}),false);
 for(const field of ['attributes','audiences','problems','anchors']){const changed=structuredClone(p);changed[field].push({slug:'new',name:'Untranslated field',description:'Unreviewed content',verificationStatus:'verified',sources:[{title:'test',url:'https://example.org',retrievedAt:null}],value:true,confidence:.9,lastVerifiedAt:null});assert.equal(localizedProductReady(changed),false,field);}
});
test('all product equivalents preserve language and analytics paths; unsupported variants remain refused',()=>{
 for(const slug of translatedProductSlugs){const en='/software/'+slug,zh='/zh-hant'+en;assert.equal(chineseProduct(zh),slug);assert.ok(chinesePath(zh));assert.equal(englishPath(zh),en);assert.equal(localeNavigation(en,[],translatedProductSlugs).alternate,zh);assert.equal(localeNavigation(zh,[],translatedProductSlugs).alternate,en);assert.equal(localeNavigation(en,[],[]).alternate,null);assert.equal(cleanVercelUrl('https://toolelse.com'+zh+'?private=x#secret'),'https://toolelse.com'+zh);for(const name of ['page_viewed','outbound_clicked']){const e={version:2,eventId:crypto.randomUUID(),sessionId:crypto.randomUUID(),pageViewId:crypto.randomUUID(),occurredAt:new Date().toISOString(),name,surface:'product',path:zh,productSlug:slug,originSurface:'escape',originRouteSlug:'productivity-apps-you-can-buy-once',originPageViewId:crypto.randomUUID(),originExposureId:crypto.randomUUID(),originPosition:1};assert.equal(parseEventV2(e).path,zh);assert.throws(()=>parseEventV2({...e,productSlug:'mismatch'}));}}
 for(const path of ['/zh-hant/software/invented','/zh-hant/software/affine/','/zh-hant/software/affine?secret=x','/zh-hant/discover/'])assert.equal(chinesePath(path),false);
 const xml=sitemapXml('https://toolelse.com',['/software/affine','/zh-hant/software/affine']);assert.equal((xml.match(/hreflang="zh-Hant"/g)||[]).length,2);assert.doesNotMatch(sitemapXml('https://toolelse.com',['/software/affine']),/hreflang/);
});

test('unrendered dedicated-section metadata cannot hide otherwise complete product pages',()=>{
 for(const product of products){const p=structuredClone(product);for(const c of p.attributes)if(['pricing-model','supported-platforms','trade-off-summary'].includes(c.slug)){c.name='Internal taxonomy heading';c.description='Internal taxonomy explanation not rendered by product sections';}assert.ok(localizedProductReady(p),p.slug);
 const price=p.attributes.find(c=>c.slug==='pricing-model');if(price){price.value='Changed unreviewed pricing claim';price.verificationStatus='verified';price.sources=[{title:'Synthetic',url:'https://example.org',retrievedAt:null}];assert.equal(localizedProductReady(p),false,p.slug);}}
});
