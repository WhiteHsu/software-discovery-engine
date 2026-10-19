import test from 'node:test';
import assert from 'node:assert/strict';
import {producerConfigEnabled} from '../lib/analytics/producer-config.ts';
const ready={ANALYTICS_ENABLED:'true',ANALYTICS_MAINTENANCE_READY:'true',NEXT_PUBLIC_SITE_URL:'https://software-discovery-engine.vercel.app',ANALYTICS_RATE_SECRET:'a'.repeat(64),SUPABASE_SERVICE_ROLE_KEY:'synthetic-test-only',VERCEL:'1',VERCEL_ENV:'production'};
test('collector readiness alone cannot activate visitor producers',()=>{
 for(const value of [undefined,'false','TRUE','1',''])assert.equal(producerConfigEnabled({...ready,ANALYTICS_PRODUCER_ENABLED:value}),false);
 assert.equal(producerConfigEnabled({...ready,ANALYTICS_PRODUCER_ENABLED:'true'}),true);
});
test('producer gate preserves every collector and production-runtime prerequisite',()=>{
 const enabled={...ready,ANALYTICS_PRODUCER_ENABLED:'true'};
 for(const [key,value] of [['ANALYTICS_ENABLED','false'],['ANALYTICS_MAINTENANCE_READY','false'],['NEXT_PUBLIC_SITE_URL','http://insecure.example'],['ANALYTICS_RATE_SECRET','invalid'],['SUPABASE_SERVICE_ROLE_KEY',''],['VERCEL','0'],['VERCEL_ENV','preview']])assert.equal(producerConfigEnabled({...enabled,[key]:value}),false,key);
 assert.equal(producerConfigEnabled({}),false);
});
