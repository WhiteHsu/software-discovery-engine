// Isolated PostgreSQL rehearsal. Pass the installed PGlite module path as argv[2].
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {PGlite}=await import(pathToFileURL(process.argv[2]).href);
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const original=read('supabase/migrations/202610220001_discovery_events_v2.sql').match(/CREATE FUNCTION software_discovery.ingest_discovery_events_v2\([\s\S]*?END \$ingest\$;/)[0];
const prior=read('supabase/migrations/202610270001_zh_hant_event_paths.sql');
const db=new PGlite();let checks=0;
const check=async(name,fn)=>{await fn();checks++;console.log('PASS '+name);};
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const base={version:2,eventId:id(1),sessionId:id(2),pageViewId:id(3),occurredAt:new Date().toISOString(),name:'page_viewed',surface:'home',path:'/zh-hant'};
const ingest=e=>db.query('SELECT software_discovery.ingest_discovery_events_v2($1::jsonb,$2) result',[JSON.stringify([e]),'a'.repeat(64)]);
try{
 await db.exec(`CREATE SCHEMA software_discovery;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;
 CREATE TABLE software_discovery.products(slug text,status text);
 CREATE TABLE software_discovery.escape_routes(slug text,status text,editorially_approved boolean);
 INSERT INTO software_discovery.products VALUES('affine','published');
 INSERT INTO software_discovery.escape_routes VALUES('offline-notion-alternatives','published',true),('simple-notion-alternatives','published',true),('draft','draft',false);
 CREATE TABLE software_discovery.discovery_events_v2(event_id uuid PRIMARY KEY,payload jsonb NOT NULL,received_at timestamptz);
 CREATE TABLE software_discovery.discovery_queries_v2(event_id uuid PRIMARY KEY,query_text text,expires_at timestamptz);
 CREATE TABLE software_discovery.discovery_event_limits(bucket text,minute_start timestamptz,event_count int,PRIMARY KEY(bucket,minute_start));
 ALTER TABLE software_discovery.discovery_events_v2 ENABLE ROW LEVEL SECURITY;
 ALTER TABLE software_discovery.discovery_events_v2 FORCE ROW LEVEL SECURITY;
 ALTER TABLE software_discovery.discovery_queries_v2 ENABLE ROW LEVEL SECURITY;
 ALTER TABLE software_discovery.discovery_queries_v2 FORCE ROW LEVEL SECURITY;
 GRANT USAGE ON SCHEMA software_discovery TO service_role,anon,authenticated;
 ${original}
 REVOKE ALL ON FUNCTION software_discovery.ingest_discovery_events_v2(jsonb,text) FROM PUBLIC,anon,authenticated;
 GRANT EXECUTE ON FUNCTION software_discovery.ingest_discovery_events_v2(jsonb,text) TO service_role;`);
 await db.exec(prior);

 await db.exec(read('supabase/migrations/202610270002_zh_hant_comparison_paths.sql'));
 const product={...base,surface:'product',path:'/zh-hant/software/affine',productSlug:'affine'};
 await check('prior definition rejects Chinese product paths',async()=>{await assert.rejects(()=>ingest(product));});
 await check('rehearsal leaves the original definition intact',async()=>{await db.exec(read('supabase/verification/LOCALE_04_REHEARSE.sql'));await assert.rejects(()=>ingest(product));});
 await check('migration preserves private tables and execute restrictions',async()=>{await db.exec(read('supabase/migrations/202610270003_zh_hant_product_paths.sql'));assert.ok(Object.values((await db.query(read('supabase/verification/LOCALE_04_VERIFY.sql'))).rows[0].locale_04_verification).every(v=>v===true));});
 await check('all 30 published Chinese products persist exact paths and deduplicate',async()=>{
 const {translatedProductSlugs}=await import('../lib/i18n/product-slugs.ts');
 for(const [i,slug] of translatedProductSlugs.entries()){
 await db.query("INSERT INTO software_discovery.products SELECT $1,'published' WHERE NOT EXISTS(SELECT FROM software_discovery.products WHERE slug=$1)",[slug]);
 const e={...product,eventId:id(100+i),path:'/zh-hant/software/'+slug,productSlug:slug};assert.equal((await ingest(e)).rows[0].result.inserted,1);assert.equal((await ingest(e)).rows[0].result.inserted,0);assert.equal((await db.query('SELECT payload FROM software_discovery.discovery_events_v2 WHERE event_id=$1',[e.eventId])).rows[0].payload.path,e.path);
 }
 });
 await check('invalid, mismatched and draft products remain blocked',async()=>{
 await db.exec("INSERT INTO software_discovery.products VALUES('draft','draft')");
 for(const patch of [{productSlug:'things'},{path:'/zh-hant/software/invented',productSlug:'invented'},{path:'/zh-hant/software/draft',productSlug:'draft'},{path:product.path+'?private=x'}])await assert.rejects(()=>ingest({...product,eventId:id(500),...patch}));
 });
 await check('English and outbound events retain admission and anonymous access stays blocked',async()=>{
 assert.equal((await ingest({...product,eventId:id(600),path:'/software/affine'})).rows[0].result.inserted,1);
 assert.equal((await ingest({...product,eventId:id(601),name:'outbound_clicked'})).rows[0].result.inserted,1);
 await db.exec('SET ROLE anon');await assert.rejects(()=>ingest(base));await assert.rejects(()=>db.query('SELECT * FROM software_discovery.discovery_events_v2'));await db.exec('RESET ROLE');
 });
 await check('guarded rollback preserves recorded events',async()=>{
 const n=(await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n;
 await db.exec(read('supabase/verification/LOCALE_04_ROLLBACK.sql'));await assert.rejects(()=>ingest({...product,eventId:id(700)}));assert.equal((await db.query('SELECT count(*) n FROM software_discovery.discovery_events_v2')).rows[0].n,n);
 });
 console.log(`${checks} storage checks passed`);
}finally{await db.close();}
