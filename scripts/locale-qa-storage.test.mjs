// Execute the actual read-only SQL reports in isolated PostgreSQL (PGlite).
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {knownQaSessionIds} from '../lib/analytics/qa-exclusions.ts';
const {PGlite}=await import(pathToFileURL(process.argv[2]).href),db=new PGlite();
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const ordinary=crypto.randomUUID();
try{
 await db.exec('CREATE SCHEMA software_discovery;CREATE TABLE software_discovery.discovery_events(payload jsonb,received_at timestamptz);CREATE TABLE software_discovery.discovery_events_v2(payload jsonb,received_at timestamptz);');
 for(const sessionId of [...knownQaSessionIds,ordinary]){
  const pageViewId=crypto.randomUUID(),exposureId=crypto.randomUUID(),productPage=crypto.randomUUID();
  for(const name of ['product_impression','product_clicked','page_viewed','outbound_clicked']){
   const product=['page_viewed','outbound_clicked'].includes(name);
   const e={version:2,eventId:crypto.randomUUID(),sessionId,pageViewId:product?productPage:pageViewId,occurredAt:new Date().toISOString(),name,surface:product?'product':'hidden_gems',path:product?'/zh-hant/software/joplin':'/zh-hant/hidden-gems',productSlug:'joplin',...(product?{originSurface:'hidden_gems'}:{position:1,exposureId})};
   await db.query('INSERT INTO software_discovery.discovery_events_v2 VALUES($1,statement_timestamp())',[JSON.stringify(e)]);
  }
 }
 const placement=read('supabase/data/ANALYTICS_V2_METRICS.sql'),outbound=read('supabase/data/ANALYTICS_V2_OUTBOUND_METRICS.sql');
 const p=(await db.query(placement)).rows.find(r=>r.surface==='hidden_gems');assert.equal(p.impressions,1);assert.equal(p.clicked_exposures,1);assert.equal(Number(p.ctr),1);
 const o=(await db.query(outbound)).rows.find(r=>r.origin==='hidden_gems');assert.equal(o.product_views,1);assert.equal(o.outbound_product_views,1);assert.equal(Number(o.outbound_ctr),1);
 const inventory=read('supabase/verification/LOCALE_04_METRICS.sql').replace('NULL::timestamptz AS start_at, NULL::timestamptz AS end_at',"statement_timestamp()-interval '1 day' AS start_at, statement_timestamp()+interval '1 day' AS end_at");
 assert.equal((await db.query(inventory)).rows.reduce((n,r)=>n+Number(r.events),0),4);
 assert.equal((await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n,56);
 await db.query("DELETE FROM software_discovery.discovery_events_v2 WHERE payload->>'sessionId'=$1",[ordinary]);
 assert.equal((await db.query(placement)).rows.find(r=>r.surface==='hidden_gems').ctr,null);assert.equal((await db.query(outbound)).rows.find(r=>r.origin==='hidden_gems').outbound_ctr,null);
 console.log('PASS: actual SQL reports exclude 13 QA sessions, retain ordinary activity and raw QA, preserve NULL denominators.');
}finally{await db.close();}
