import test from 'node:test';
import assert from 'node:assert/strict';
import {escapeDefinitions,publishable} from '../lib/discovery/escape-model.ts';
import {rankEscapeCandidates} from '../lib/discovery/privacy-route.ts';
import {pilotSlugs,chinesePath,englishPath,localeNavigation} from '../lib/i18n/pilot.ts';
import {localizedReady,zh,zhValue} from '../lib/i18n/localized.ts';
import {products,routes,membership} from './locale-expanded-fixtures.mjs';
import {parseEventV2} from '../lib/analytics/events-v2.ts';
import {cleanVercelUrl,safeVercelContext} from '../lib/analytics/vercel-policy.ts';
export const pages=routes.map(r=>({...r,published:true,lastVerifiedAt:r.last_verified_at,candidates:rankEscapeCandidates(escapeDefinitions.find(d=>d.slug===r.slug),membership.get(r.slug).map(slug=>({product:products.find(p=>p.slug===slug),noveltyScore:0})))}));
test('all ten public comparisons have complete translations without changing qualification or order',()=>{
 assert.equal(pages.length,10);assert.equal(pilotSlugs.length,10);
 for(const p of pages){assert.ok(publishable(p),p.slug);assert.ok(localizedReady(p),p.slug);assert.ok(zh(p.name));assert.ok(zh(p.description));const before=p.candidates.map(c=>c.product.slug);assert.ok(localizedReady(p));assert.deepEqual(p.candidates.map(c=>c.product.slug),before);for(const c of p.candidates.filter(c=>c.eligible)){for(const f of c.fit){assert.ok(zh(f.name),f.name);if(f.relationshipType)assert.ok(zh(f.description),f.description);else assert.ok(zhValue(f),String(f.value));}}}
});
test('every released route maps reciprocally and preserves localized analytics paths',()=>{
 for(const slug of pilotSlugs){const path='/zh-hant/escape/'+slug;assert.equal(chinesePath(path),true);assert.equal(englishPath(path),'/escape/'+slug);assert.equal(localeNavigation('/escape/'+slug,pilotSlugs).alternate,path);assert.equal(localeNavigation(path,pilotSlugs).alternate,'/escape/'+slug);assert.equal(localeNavigation(path,[]).alternate,null);assert.equal(cleanVercelUrl('https://toolelse.com'+path+'?private=x#secret'),'https://toolelse.com'+path);const e={version:2,eventId:crypto.randomUUID(),sessionId:crypto.randomUUID(),pageViewId:crypto.randomUUID(),occurredAt:new Date().toISOString(),name:'escape_route_viewed',surface:'escape',path,routeSlug:slug};assert.equal(parseEventV2(e).path,path);assert.throws(()=>parseEventV2({...e,routeSlug:'made-up'}));}
 for(const path of ['/zh-hant/escape/made-up','/zh-hant/software/untranslated-product','/zh-hant/discover'])assert.equal(chinesePath(path),false);
 assert.equal(safeVercelContext('c59194d0-2f93-4e79-b489-e001273abc29',null,''),false);
});
test('changed source wording and insufficient or draft evidence still withhold localized pages',()=>{
 for(const page of pages){const changed=structuredClone(page);changed.candidates.find(c=>c.eligible).product.description+=' New unreviewed wording';assert.equal(localizedReady(changed),false);assert.equal(localizedReady({...page,published:false}),false);assert.equal(localizedReady({...page,candidates:page.candidates.slice(0,2)}),false);}
});
test('privacy comparison retains exact local-operation bounds and rejects altered profiles',()=>{
 const p=pages.find(p=>p.slug==='privacy-friendly-grammarly-alternatives');assert.ok(localizedReady(p));assert.equal(p.candidates.filter(c=>c.eligible).length,3);
 for(const c of p.candidates){assert.ok(zhValue(c.product.attributes.find(a=>a.slug==='reviewed-local-operation')));const changed=structuredClone(c);changed.product.attributes.find(a=>a.slug==='reviewed-local-operation').value+=' Changed';const result=rankEscapeCandidates(escapeDefinitions.find(d=>d.slug===p.slug),[changed]);assert.equal(result[0].eligible,false);}
});
