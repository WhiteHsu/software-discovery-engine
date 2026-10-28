import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {knownQaSessionIds,isKnownQaEvent} from '../lib/analytics/qa-exclusions.ts';
import {QA_SESSIONS,safeVercelContext} from '../lib/analytics/vercel-policy.ts';
import {metricsV2} from '../lib/analytics/metrics-v2.ts';
const reports=['supabase/data/ANALYTICS_V2_METRICS.sql','supabase/data/ANALYTICS_V2_OUTBOUND_METRICS.sql','supabase/verification/LOCALE_01_METRICS.sql','supabase/verification/LOCALE_03_METRICS.sql','supabase/verification/LOCALE_04_METRICS.sql'];
const receipt=JSON.parse(readFileSync(new URL('../seed/research/locale-production-qa-2026-10-28.json',import.meta.url),'utf8'));
test('accepted locale QA, legacy exclusions, SQL reports and Vercel share the exact same session set',()=>{
 assert.equal(knownQaSessionIds.length,13);assert.equal(new Set(knownQaSessionIds).size,13);assert.deepEqual([...QA_SESSIONS].sort(),[...knownQaSessionIds].sort());
 for(const id of [...receipt.priorExclusionsAligned,...receipt.sessions.map(s=>s.sessionId)]){assert.ok(knownQaSessionIds.includes(id));assert.ok(isKnownQaEvent({sessionId:id.toUpperCase(),eventId:crypto.randomUUID()}));assert.equal(safeVercelContext(id.toUpperCase(),null,''),false);}
 for(const file of reports){const sql=readFileSync(new URL('../'+file,import.meta.url),'utf8');const list=sql.match(/lower\(payload->>'sessionId'\) NOT IN \(([^)]+)\)/)[1];assert.deepEqual([...list.matchAll(/'([^']+)'/g)].map(m=>m[1]).sort(),[...knownQaSessionIds].sort(),file);}
});
test('metrics exclude complete QA journeys while keeping ordinary visits and exposure/outbound denominators',()=>{
 const make=(sessionId)=>{const pageViewId=crypto.randomUUID(),exposureId=crypto.randomUUID(),productPage=crypto.randomUUID();const e={version:2,sessionId,pageViewId,occurredAt:new Date().toISOString(),surface:'hidden_gems',path:'/zh-hant/hidden-gems',productSlug:'joplin',position:1,exposureId};return [{...e,eventId:crypto.randomUUID(),name:'product_impression'},{...e,eventId:crypto.randomUUID(),name:'product_clicked'},...['page_viewed','outbound_clicked'].map(name=>({version:2,eventId:crypto.randomUUID(),sessionId,pageViewId:productPage,occurredAt:e.occurredAt,name,surface:'product',path:'/zh-hant/software/joplin',productSlug:'joplin',originSurface:'hidden_gems',originPageViewId:pageViewId,originExposureId:exposureId,originPosition:1}))];};
 const qa=knownQaSessionIds.flatMap(make),ordinary=make(crypto.randomUUID()),all=[...qa,...ordinary],before=structuredClone(all),m=metricsV2(all);
 assert.equal(m.excludedQa,52);assert.equal(m.surfaces.hidden_gems.impressions,1);assert.equal(m.surfaces.hidden_gems.clickedExposures,1);assert.equal(m.surfaces.hidden_gems.ctr,1);assert.equal(m.product.views,1);assert.equal(m.product.outboundViews,1);assert.equal(m.product.ctr,1);assert.deepEqual(all,before);
 const onlyQa=metricsV2(qa);assert.equal(onlyQa.surfaces.hidden_gems.ctr,null);assert.equal(onlyQa.product.ctr,null);
 assert.equal(isKnownQaEvent({sessionId:crypto.randomUUID(),eventId:crypto.randomUUID()}),false);
});
