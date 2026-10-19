import test from 'node:test';
import assert from 'node:assert/strict';
import {exposureGate} from '../lib/analytics/exposure.ts';
import {eventQueue} from '../lib/analytics/queue.ts';
function clock(){let now=0,next=0;const timers=new Map();return {api:{set:(fn,delay)=>{const id=++next;timers.set(id,{fn,at:now+delay});return id;},clear:id=>timers.delete(id)},tick(ms){now+=ms;for(const [id,t] of [...timers])if(t.at<=now){timers.delete(id);t.fn();}},size:()=>timers.size};}
test('visible entry needs50% for a continuous second; hidden document cancels timing',()=>{
 const c=clock(),sent=[],gate=exposureGate(k=>sent.push(k),c.api);gate.active(true);gate.visibility('vale','title',.49);c.tick(2000);assert.equal(sent.length,0);
 gate.visibility('vale','title',.5);c.tick(999);gate.active(false);c.tick(1000);assert.equal(sent.length,0);
 gate.active(true);c.tick(999);assert.equal(sent.length,0);c.tick(1);assert.deepEqual(sent,['vale']);
});
test('a viewport exit restarts timing; repeated entries and separate product links do not double count',()=>{
 const c=clock(),sent=[],gate=exposureGate(k=>sent.push(k),c.api);gate.active(true);gate.visibility('vale','row',1);c.tick(800);gate.visibility('vale','row',0);c.tick(500);
 gate.visibility('vale','card',1);c.tick(200);gate.visibility('vale','row',1);gate.visibility('vale','card',0);c.tick(800);assert.deepEqual(sent,['vale']);
 gate.visibility('vale','row',0);gate.visibility('vale','row',1);c.tick(5000);assert.equal(sent.length,1);
 gate.visibility('lt','row',1);gate.dispose();c.tick(5000);assert.equal(sent.length,1);assert.equal(c.size(),0);
});
const event=i=>({version:1,eventId:'event-'+i,name:'product_impression',description:'synthetic'});
test('transport queue bounds batch count and flushes exactly once with stable event IDs',()=>{
 const sent=[],q=eventQueue((body,unload)=>sent.push({data:JSON.parse(body),unload}));for(let i=0;i<21;i++)q.push(event(i));assert.equal(sent[0].data.length,20);assert.equal(q.size(),1);
 q.flush(true);q.flush();assert.equal(sent.length,2);assert.equal(sent[1].unload,true);assert.equal(sent[1].data[0].eventId,'event-20');
});
test('transport queue bounds UTF8 bytes and isolates dispatch exceptions from navigation callers',()=>{
 const sent=[],q=eventQueue(body=>sent.push(body));for(let i=0;i<3;i++)q.push({...event(i),description:'字'.repeat(3000)});q.flush();assert.equal(sent.length,3);assert.ok(sent.every(body=>new TextEncoder().encode(body).length<=16384));
 q.push({...event(9),description:'x'.repeat(17000)});assert.equal(q.size(),0);
 const failing=eventQueue(()=>{throw Error('network');});failing.push(event(1));assert.doesNotThrow(()=>failing.flush());assert.equal(failing.size(),0);
});
