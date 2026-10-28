// Build a disposable fixture site; never reuse a build containing owner environment settings.
import {createServer,request as httpRequest} from 'node:http';
import {spawn} from 'node:child_process';
import {prepareLocaleBuild} from './locale-isolated-build.mjs';
import {once} from 'node:events';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {pilotSlugs} from '../lib/i18n/pilot.ts';
import {mockSupabase,products} from './locale-products-fixtures.mjs';
const mock=createServer(mockSupabase);mock.listen(0,'127.0.0.1');await once(mock,'listening');
const port=Number(process.env.LOCALE_TEST_PORT??3189),origin=`http://127.0.0.1:${port}`;
let isolated;try{isolated=await prepareLocaleBuild(`http://127.0.0.1:${mock.address().port}`);}catch(e){mock.close();throw e;}
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',String(port)],{cwd:isolated.cwd,windowsHide:true,env:isolated.env});
let output='';child.stdout.on('data',c=>output+=c);child.stderr.on('data',c=>output+=c);
const pause=ms=>new Promise(r=>setTimeout(r,ms));let checks=0;
const get=(path,headers={})=>new Promise((resolve,reject)=>{const req=httpRequest(origin+path,{headers:{host:'toolelse.com',...headers}},response=>{let html='';response.on('data',c=>html+=c);response.on('end',()=>resolve({response:{status:response.statusCode},html}));});req.on('error',reject);req.end();});
try{
 let ready=false;for(let i=0;i<100;i++){try{const r=await fetch(origin+'/privacy');if(r.status===200){ready=true;break;}}catch{}await pause(300);}assert.ok(ready,output);
 for(const path of ['/zh-hant',...pilotSlugs.map(s=>'/zh-hant/escape/'+s),'/zh-hant/privacy']){
  const {response,html}=await get(path);assert.equal(response.status,200,path);assert.match(html,/<html[^>]*lang="zh-Hant"/);assert.equal((html.match(/<html\b/g)||[]).length,1);assert.match(html,/href="\/zh-hant"/);assert.match(html,/rel="canonical" href="https:\/\/toolelse.com/);
  if(path.includes('/escape/'))assert.match(html,/Synthetic integration fixture; not verification evidence/,'Mock data required; refusing to test another data source');
  if(path.includes('/escape/')){const en=await get(path.slice(8));assert.equal(en.response.status,200);const placements=h=>[...h.matchAll(/data-discovery-product="([^"]+)" data-discovery-position="([^"]+)"/g)].map(m=>m[1]+':'+m[2]);assert.deepEqual(placements(html),placements(en.html),path);assert.match(html,/hrefLang="en"|hreflang="en"/);assert.match(html,/hrefLang="en"|hrefLang="en"|hreflang="en"/);assert.match(html,/href="\/zh-hant\/software\//);assert.doesNotMatch(html,/>Unknown</);}
  if(path.includes('privacy-friendly-grammarly')){assert.match(html,/僅限已查核的本機操作/);assert.match(html,/不保證零保留/);assert.doesNotMatch(html,/>是 · 查核日期/);}
  if(path==='/zh-hant'){assert.doesNotMatch(html,/<form/);assert.match(html,/繁中搜尋功能尚未提供/);}
  if(path.endsWith('/privacy'))assert.match(html,/noindex/);
  writeFileSync(join(isolated.cwd,'render-'+path.replaceAll('/','_')+'.html'),html);checks++;
 }

 for(const p of products){const path='/zh-hant/software/'+p.slug;const {response,html}=await get(path);assert.equal(response.status,200,path);assert.match(html,/<html[^>]*lang="zh-Hant"/);assert.ok(html.includes('rel="canonical" href="https://toolelse.com'+path+'"'));assert.match(html,/值得探索的原因/);assert.doesNotMatch(html,/>Unknown</);const en=await get('/software/'+p.slug);assert.equal(en.response.status,200);assert.match(en.html,/hrefLang="zh-Hant"|hreflang="zh-Hant"/);checks++;}
 assert.equal((await get('/zh-hant/software/untranslated-product')).response.status,404);checks++;
 for(const path of ['/','/escape/offline-notion-alternatives']){const {response,html}=await get(path,{'x-toolelse-language':'zh-Hant','x-toolelse-path':'/zh-hant'});assert.equal(response.status,200);assert.match(html,/<html[^>]*lang="en"/);assert.match(html,/hrefLang="zh-Hant"|hreflang="zh-Hant"/);checks++;}
 const {html:xml,response:sitemapResponse}=await get('/sitemap.xml');assert.equal(sitemapResponse.status,200);assert.equal((xml.match(/<loc>/g)||[]).length,2*products.length+2*pilotSlugs.length+3);assert.match(xml,/hreflang="zh-Hant"/);assert.doesNotMatch(xml,/<loc>https:\/\/toolelse.com\/(?:zh-hant\/)?privacy<\/loc>/);checks++;
 assert.equal((await get('/zh-hant/escape/made-up')).response.status,404);checks++;
 // A live evidence text change must remove only the stale Chinese equivalent.
 products[0].description='Changed description without a reviewed translation';
 assert.equal((await get('/zh-hant/software/'+products[0].slug)).response.status,404);
 assert.equal((await get('/zh-hant/escape/offline-notion-alternatives')).response.status,404);
 const en=await get('/escape/offline-notion-alternatives');assert.equal(en.response.status,200);assert.doesNotMatch(en.html,/hreflang="zh-Hant"/);
 const changed=await get('/sitemap.xml');assert.doesNotMatch(changed.html,/<loc>https:\/\/toolelse.com\/zh-hant\/escape\/offline-notion-alternatives<\/loc>/);checks++;
 console.log(`${checks} Next integration checks passed`);
 if(process.env.LOCALE_KEEP_SERVER==='true'){products[0].description=Object.keys((await import('../lib/i18n/zh-hant-content.ts')).zhHantText).find(s=>s.startsWith('An open-source, local-first'));console.log('Fixture preview ready at '+origin+'; no production data or analytics');await new Promise(()=>{});}
}finally{const exited=once(child,'exit');child.kill();await exited;mock.close();await isolated.cleanup();}
