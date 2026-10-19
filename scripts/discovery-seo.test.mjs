import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalOrigin,seoContext,sitemapPaths,publishedSitemapPaths,sitemapXml,sitemapResponse,robotsConfig} from '../lib/discovery/seo.ts';
const origin='https://software-discovery-engine.vercel.app',env={VERCEL:'1',VERCEL_ENV:'production',NEXT_PUBLIC_SITE_URL:origin};
test('only canonical production host is indexable; previews, aliases, local and missing host fail closed',()=>{
 assert.equal(seoContext(env,'software-discovery-engine.vercel.app').indexable,true);
 for(const [patch,host] of [[{VERCEL_ENV:'preview'},new URL(origin).host],[{VERCEL_ENV:'development'},new URL(origin).host],[{VERCEL:'0'},new URL(origin).host],[{},'deployment-alias.vercel.app'],[{},'localhost:3000'],[{},null]])assert.equal(seoContext({...env,...patch},host).indexable,false);
 assert.equal(seoContext({},new URL(origin).host).indexable,false);
});
test('canonical origin rejects credentials, insecure scheme, paths, queries and nondefault ports',()=>{
 assert.equal(canonicalOrigin({}),origin);assert.equal(canonicalOrigin({NEXT_PUBLIC_SITE_URL:origin+'/'}),origin);
 for(const url of ['http://example.org','https://user:pass@example.org','https://example.org/private','https://example.org/?q=x','https://example.org/#x','https://example.org:8443'])assert.throws(()=>canonicalOrigin({NEXT_PUBLIC_SITE_URL:url}));
});
test('sitemap includes deduplicated published paths only, omitting malformed identities and drafts',()=>{
 const products=[{slug:'affine',status:'published'},{slug:'affine',status:'published'},{slug:'draft',status:'draft'},{slug:'escape?x=1',status:'published'},null];
 const routes=[{slug:'offline-notion-alternatives',published:true},{slug:'draft-route',published:false},{slug:'unknown-status'},{slug:'../private',published:true},{slug:'unregistered-route',published:true}];
 assert.deepEqual(sitemapPaths(products,routes),['/','/escape/offline-notion-alternatives','/software/affine']);
 const xml=sitemapXml(origin,sitemapPaths(products,routes));assert.equal((xml.match(/<loc>/g)||[]).length,3);assert.doesNotMatch(xml,/lastmod|draft|private|changefreq|priority/);
 assert.throws(()=>sitemapXml(origin,['//other.example/']));
});
test('preview sitemap never queries the graph; production failure is503 instead of partial successful inventory',async()=>{
 let calls=0;const load=async()=>{calls++;return ['/'];};
 const preview=await sitemapResponse({origin,indexable:false},load);assert.equal(calls,0);assert.equal(preview.status,200);assert.doesNotMatch(await preview.text(),/<loc>/);
 const live=await sitemapResponse({origin,indexable:true},load);assert.equal(calls,1);assert.equal(live.status,200);assert.match(await live.text(),/<loc>https:\/\/software-discovery-engine.vercel.app\/<\/loc>/);
 const failed=await sitemapResponse({origin,indexable:true},async()=>{throw Error('private diagnostic');});assert.equal(failed.status,503);assert.equal(failed.headers.get('Retry-After'),'300');assert.doesNotMatch(await failed.text(),/private diagnostic/);
});
test('robots advertises only canonical production sitemap and blocks previews entirely',()=>{
 const prod=robotsConfig({origin,indexable:true});assert.equal(prod.sitemap,origin+'/sitemap.xml');assert.equal(prod.rules.disallow,'/api/');
 const preview=robotsConfig({origin,indexable:false});assert.deepEqual(preview,{rules:{userAgent:'*',disallow:'/'}});
});
test('catalog requires public page identity/status and qualified routes, not identity-list status alone',async()=>{
 const paths=await publishedSitemapPaths({identities:async()=>[{slug:'affine'},{slug:'withheld'},{slug:'draft'}],product:async slug=>slug==='withheld'?null:{slug,status:slug==='draft'?'draft':'published'},routes:async()=>[{slug:'offline-notion-alternatives',published:true},null,{slug:'unqualified',published:false}]});
 assert.deepEqual(paths,['/','/escape/offline-notion-alternatives','/software/affine']);
});
test('catalog refuses overflow, malformed rows, RPC identity drift and route-read failure without partial inventory',async()=>{
 const base={identities:async()=>[{slug:'affine'}],product:async slug=>({slug,status:'published'}),routes:async()=>[]};
 for(const identities of [[null],[{slug:'../invalid'}],Array.from({length:500},()=>({slug:'affine'}))])await assert.rejects(publishedSitemapPaths({...base,identities:async()=>identities}));
 await assert.rejects(publishedSitemapPaths({...base,product:async()=>({slug:'other',status:'published'})}),/identity drift/);
 await assert.rejects(publishedSitemapPaths({...base,routes:async()=>{throw Error('backend unavailable');}}),/backend unavailable/);
});
