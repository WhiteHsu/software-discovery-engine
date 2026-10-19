import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareEventBatch,MAX_EVENT_BYTES} from '../lib/analytics/ingestion.ts';
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const e={version:1,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:'2026-10-19T01:00:00.000Z',name:'product_impression',surface:'escape',routeSlug:'privacy-friendly-grammarly-alternatives',path:'/escape/privacy-friendly-grammarly-alternatives',productSlug:'vale-local-passive-3-24-0',exposureId:id(4),position:1};
const now=new Date('2026-10-19T01:01:00.000Z');
const context={products:new Set([e.productSlug]),placements:[{routeSlug:e.routeSlug,productSlug:e.productSlug,position:1}]};
const prepare=(events,ctx=context)=>prepareEventBatch(JSON.stringify(events),ctx,now);
test('receiver deduplicates retry IDs and adds trusted receive time without mutating payloads',()=>{
 const r=prepare([e,e]);assert.equal(r.events.length,1);assert.equal(r.receivedAt,now.toISOString());assert.deepEqual(r.events[0],e);
 assert.throws(()=>prepare([e,{...e,exposureId:id(5)}]));
});
test('receiver rejects nonpublic products, removed memberships and changed ranking positions',()=>{
 assert.throws(()=>prepare([e],{...context,products:new Set()}));assert.throws(()=>prepare([e],{...context,placements:[]}));assert.throws(()=>prepare([{...e,position:2}]));
 const view={...e,name:'product_view',surface:'product',path:'/software/'+e.productSlug};delete view.routeSlug;delete view.position;delete view.exposureId;
 assert.equal(prepare([view],{...context,placements:[]}).events.length,1);
});
test('receiver bounds UTF8 bytes, count, timestamps and structure before storage',()=>{
 for(const body of ['null','{}','[]','bad',JSON.stringify(Array(21).fill(e)),' '.repeat(MAX_EVENT_BYTES+1)])assert.throws(()=>prepareEventBatch(body,context,now));
 for(const occurredAt of ['2026-10-18T01:00:59.999Z','2026-10-19T01:06:00.001Z'])assert.throws(()=>prepare([{...e,occurredAt}]));
 assert.equal(prepare([{...e,occurredAt:'2026-10-19T01:06:00.000Z'}]).events.length,1);
 assert.throws(()=>prepare([{...e,rawQuery:'private prose'}]));assert.throws(()=>prepareEventBatch(JSON.stringify([e]),context,new Date(NaN)));
});
