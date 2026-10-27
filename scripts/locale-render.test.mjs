// Build first. Exercises real Next routes against an isolated mock database.
import {createServer,request as httpRequest} from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {mockSupabase,products} from './locale-fixtures.mjs';
const mock=createServer(mockSupabase);mock.listen(0,'127.0.0.1');await once(mock,'listening');
const port=Number(process.env.LOCALE_TEST_PORT??3189),origin=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',String(port)],{cwd:process.cwd(),windowsHide:true,env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:`http://127.0.0.1:${mock.address().port}`,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'fixture-only-not-a-real-key',NEXT_PUBLIC_SITE_URL:'https://toolelse.com',VERCEL:'1',VERCEL_ENV:'production',VERCEL_WEB_ANALYTICS_ENABLED:'false',ANALYTICS_ENABLED:'false',ANALYTICS_PRODUCER_ENABLED:'false'}});
let output='';child.stdout.on('data',c=>output+=c);child.stderr.on('data',c=>output+=c);
const pause=ms=>new Promise(r=>setTimeout(r,ms));let checks=0;
const get=(path,headers={})=>new Promise((resolve,reject)=>{const req=httpRequest(origin+path,{headers:{host:'toolelse.com',...headers}},response=>{let html='';response.on('data',c=>html+=c);response.on('end',()=>resolve({response:{status:response.statusCode},html}));});req.on('error',reject);req.end();});
try{
 let ready=false;for(let i=0;i<100;i++){try{const r=await fetch(origin+'/privacy');if(r.status===200){ready=true;break;}}catch{}await pause(300);}assert.ok(ready,output);
 for(const path of ['/zh-hant','/zh-hant/escape/offline-notion-alternatives','/zh-hant/escape/pdf-editors-without-a-subscription','/zh-hant/privacy']){
  const {response,html}=await get(path);assert.equal(response.status,200,path);assert.match(html,/<html[^>]*lang="zh-Hant"/);assert.equal((html.match(/<html\b/g)||[]).length,1);assert.match(html,/href="\/zh-hant"/);assert.match(html,/rel="canonical" href="https:\/\/toolelse.com/);
  if(path.includes('/escape/')){assert.match(html,/hrefLang="en"|hrefLang="en"|hreflang="en"/);assert.match(html,/英文產品詳情/);assert.doesNotMatch(html,/>Unknown</);}
  if(path==='/zh-hant'){assert.doesNotMatch(html,/<form/);assert.match(html,/繁中搜尋功能尚未提供/);}
  if(path.endsWith('/privacy'))assert.match(html,/noindex/);
  writeFileSync('render-'+path.replaceAll('/','_')+'.html',html);checks++;
 }
 for(const path of ['/','/escape/offline-notion-alternatives']){const {response,html}=await get(path,{'x-toolelse-language':'zh-Hant','x-toolelse-path':'/zh-hant'});assert.equal(response.status,200);assert.match(html,/<html[^>]*lang="en"/);assert.match(html,/hrefLang="zh-Hant"|hreflang="zh-Hant"/);checks++;}
 const {html:xml,response:sitemapResponse}=await get('/sitemap.xml');assert.equal(sitemapResponse.status,200);assert.equal((xml.match(/<loc>/g)||[]).length,15);assert.match(xml,/hreflang="zh-Hant"/);assert.doesNotMatch(xml,/<loc>[^<]*privacy/);checks++;
 assert.equal((await get('/zh-hant/escape/simple-notion-alternatives')).response.status,404);checks++;
 // A live evidence text change must remove only the stale Chinese equivalent.
 products[0].description='Changed description without a reviewed translation';
 assert.equal((await get('/zh-hant/escape/offline-notion-alternatives')).response.status,404);
 const en=await get('/escape/offline-notion-alternatives');assert.equal(en.response.status,200);assert.doesNotMatch(en.html,/hreflang="zh-Hant"/);
 const changed=await get('/sitemap.xml');assert.doesNotMatch(changed.html,/<loc>https:\/\/toolelse.com\/zh-hant\/escape\/offline-notion-alternatives<\/loc>/);checks++;
 console.log(`${checks} Next integration checks passed`);
 if(process.env.LOCALE_KEEP_SERVER==='true'){products[0].description=Object.keys((await import('../lib/i18n/zh-hant-content.ts')).zhHantText).find(s=>s.startsWith('An open-source, local-first'));console.log('Fixture preview ready at '+origin+'; no production data or analytics');await new Promise(()=>{});}
}finally{child.kill();mock.close();}
