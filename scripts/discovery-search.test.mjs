import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSearchIntent,validateQuery} from '../lib/discovery/search-intent.ts';
import {searchGraph,validateExplanations} from '../lib/discovery/search-graph.ts';
import {discover} from '../lib/discovery/search-service.ts';
import {modelIntent,structuredResponse} from '../lib/discovery/search-model.ts';
import {searchConfig,searchAdmission,searchRequest} from '../lib/discovery/search-http.ts';
const intent={status:'ready',anchor:'notion',problem:null,attributes:['works-offline','ai-optional'],unresolved:false};
const claim=(slug,value=true,confidence=.9)=>({slug,name:slug,description:'Reviewed bounded workflow.',value,confidence,verificationStatus:'verified',lastVerifiedAt:'2026-10-21',sources:[{title:'Source',url:'https://example.org/evidence',retrievedAt:'2026-10-21'}]});
function page(){return {slug:'offline-notion-alternatives',published:true,description:'Personal offline note workflow.',candidates:['a','b','c'].map(slug=>({noveltyScore:0,eligible:true,product:{slug,name:slug.toUpperCase(),description:'Reviewed product.',status:'published',websiteUrl:'https://example.org',attributes:[claim('works-offline'),claim('ai-optional'),claim('pricing-model','Reviewed price'),claim('trade-off-summary','Setup and sync require review')],anchors:[{...claim('notion',undefined),relationshipType:'alternative',scope:'personal-offline-note-object-organization'}],problems:[claim('unwanted-ai')],audiences:[],routes:[]}}))};}
const explanation=matches=>({explanations:matches.map(m=>({slug:m.slug,factIds:m.facts.map(f=>f.id)}))});
test('query and structured intent are bounded; anchor/problem/constraints must use known taxonomy',()=>{
 assert.equal(validateQuery('  Notion offline  '),'Notion offline');assert.deepEqual(parseSearchIntent(intent),intent);
 for(const q of ['',null,'x'.repeat(501),'x\u0000'])assert.throws(()=>validateQuery(q));
 for(const patch of [{anchor:'invented'},{problem:'invented'},{attributes:['zero-ai-features']},{attributes:Array(6).fill('works-offline')},{attributes:['works-offline','works-offline']},{products:['invented']},{unresolved:true},{anchor:null,attributes:[]}])assert.throws(()=>parseSearchIntent({...intent,...patch}));
 assert.equal(parseSearchIntent({...intent,problem:'unwanted-ai'}).problem,'unwanted-ai');
});
test('AND retrieval excludes a product missing any requested evidence, including problem evidence',()=>{
 const p=page();p.candidates[1].product.attributes.find(a=>a.slug==='ai-optional').value=false;
 assert.deepEqual(searchGraph(intent,[p]).map(m=>m.slug),['a','c']);
 p.candidates[0].product.problems[0].verificationStatus='likely';
 assert.deepEqual(searchGraph({...intent,problem:'unwanted-ai'},[p]).map(m=>m.slug),['c']);
 assert.deepEqual(searchGraph({...intent,attributes:[...intent.attributes,'minimal-setup']},[p]),[]);
 assert.deepEqual(searchGraph({...intent,anchor:'todoist'},[p]),[]);
});
test('live qualification is recomputed; stale flags, drafts and thin routes cannot pass',()=>{
 for(const mutate of [p=>p.published=false,p=>p.candidates.pop(),p=>p.candidates[0].product.status='draft',p=>p.candidates[0].product.attributes.find(a=>a.slug==='trade-off-summary').sources=[]]){
  const p=page();mutate(p);assert.deepEqual(searchGraph(intent,[p]),[]);
 }
 assert.deepEqual(searchGraph({...intent,attributes:['privacy-friendly']},[page()]),[]);
});
test('quality precedes novelty; search deduplicates deterministically across supplied routes',()=>{
 const p=page();p.candidates[0].noveltyScore=1;p.candidates[0].product.attributes.find(a=>a.slug==='ai-optional').confidence=.79;
 assert.deepEqual(searchGraph(intent,[p]).map(m=>m.slug),['b','c']);
 const clean=page();clean.candidates[2].noveltyScore=1;
 assert.deepEqual(searchGraph(intent,[clean]).map(m=>m.slug),['c','a','b']);
 assert.equal(searchGraph(intent,[clean,structuredClone(clean)]).length,3);
});
test('unknown and negative critical values never qualify even with published status',()=>{
 for(const patch of [{value:null},{verificationStatus:'likely'},{confidence:null},{lastVerifiedAt:null},{sources:[{url:'javascript:alert(1)'}]}]){
  const p=page();for(const c of p.candidates)Object.assign(c.product.attributes.find(a=>a.slug==='ai-optional'),patch);assert.deepEqual(searchGraph(intent,[p]),[]);
 }
});
test('explanation may select only returned products and their own fact IDs without changing order',()=>{
 const matches=searchGraph(intent,[page()]),good=explanation(matches);
 assert.equal(validateExplanations(good,matches).length,3);
 const invented=structuredClone(good);invented.explanations[0].slug='invented';assert.throws(()=>validateExplanations(invented,matches));
 const bogus=structuredClone(good);bogus.explanations[0].factIds=['attribute:free-core-use'];assert.throws(()=>validateExplanations(bogus,matches));
 const extra=structuredClone(good);extra.explanations[0].prose='Invented claim';assert.throws(()=>validateExplanations(extra,matches));
 assert.deepEqual(validateExplanations({explanations:[...good.explanations].reverse()},matches).map(e=>e.slug),matches.map(m=>m.slug));
});
test('pipeline skips retrieval on unsupported intent, skips AI explanation on no match and falls back safely',async()=>{
 let reads=0,explanations=0;
 const deps={parse:async()=>({...intent,status:'clarify',unresolved:true}),retrieve:async()=>{reads++;return [page()];},explain:async m=>{explanations++;return explanation(m);}};
 assert.equal((await discover('Notion offline',deps)).state,'clarify');assert.equal(reads,0);
 deps.parse=async()=>({...intent,attributes:['local-first']});assert.equal((await discover('Notion local',deps)).state,'no_results');assert.equal(explanations,0);
 deps.parse=async()=>intent;const good=await discover('Notion offline without required AI',deps);assert.equal(good.explanationMode,'ai-selected-evidence');
 deps.explain=async()=>({explanations:[{slug:'invented',factIds:['invented']}]});const fallback=await discover('Notion offline',deps);assert.equal(fallback.explanationMode,'verified-evidence');assert.deepEqual(fallback.matches.map(m=>m.slug),good.matches.map(m=>m.slug));
});
test('REST adapter uses strict schema and private server config; incomplete/refused/invented output fails',async()=>{
 let sent;
 const send=async(url,options)=>{sent={url,options};return Response.json({status:'completed',output:[{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify(intent)}]}]});};
 const config={key:'test-secret',model:'test-model'},signal=new AbortController().signal;
 assert.deepEqual(await modelIntent('Notion offline',config,signal,send),intent);
 const body=JSON.parse(sent.options.body);assert.equal(sent.url,'https://api.openai.com/v1/responses');assert.equal(body.store,false);assert.equal(body.text.format.strict,true);assert.equal(body.tools,undefined);assert.equal(body.model,'test-model');assert.equal(body.max_output_tokens,1600);
 for(const output of [{status:'incomplete',output:[]},{status:'completed',output:[{type:'message',role:'assistant',content:[{type:'refusal',refusal:'No'}]}]}])await assert.rejects(()=>structuredResponse(config,'test',{},'test','query',signal,async()=>Response.json(output)));
 await assert.rejects(()=>modelIntent('query',config,signal,async()=>Response.json({status:'completed',output:[{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify({...intent,products:['made-up']})}]}]})));
});
const env={DISCOVERY_SEARCH_ENABLED:'true',VERCEL:'1',VERCEL_ENV:'production',NEXT_PUBLIC_SITE_URL:'https://example.org',DISCOVERY_SEARCH_RATE_SECRET:'a'.repeat(64),OPENAI_API_KEY:'synthetic',OPENAI_DISCOVERY_MODEL:'test-model'};
const req=(patch={})=>new Request('https://example.org/api/discover',{method:'POST',headers:{origin:'https://example.org','sec-fetch-site':'same-origin','content-type':'application/json','x-vercel-forwarded-for':'192.0.2.1',...patch.headers},body:patch.body??JSON.stringify({query:'Notion offline'})});
test('HTTP default-off, origin, trusted IP, media and body guards block model calls',async()=>{
 let calls=0;const deps={admit:()=>true,now:()=>0,run:async()=>{calls++;return {state:'no_results'};}};
 assert.equal((await searchRequest(req(),searchConfig({}),deps)).status,503);
 assert.equal(searchConfig({...env,VERCEL_ENV:'preview'}).enabled,false);
 for(const [request,status] of [[req({headers:{origin:'https://evil.org'}}),403],[req({headers:{'x-vercel-forwarded-for':'invalid'}}),503],[req({headers:{'content-type':'text/plain'}}),415],[req({body:JSON.stringify({query:'ok',products:['invented']})}),400],[req({body:'x'.repeat(3073)}),400]])assert.equal((await searchRequest(request,searchConfig(env),deps)).status,status);
 assert.equal(calls,0);
});
test('HTTP permits bounded requests, emits noindex/no-store, limits requests and aborts on deadline',async()=>{
 const deps={admit:searchAdmission(),now:()=>0,run:async()=>({state:'no_results'})};
 for(let i=0;i<3;i++){const response=await searchRequest(req(),searchConfig(env),deps);assert.equal(response.status,200);assert.equal(response.headers.get('x-robots-tag'),'noindex');assert.equal(response.headers.get('cache-control'),'no-store');}
 assert.equal((await searchRequest(req(),searchConfig(env),deps)).status,429);
 let signal;const timed=await searchRequest(req(),searchConfig(env),{admit:()=>true,now:()=>0,timeoutMs:5,run:async(_,s)=>{signal=s;return new Promise(()=>{});}});assert.equal(timed.status,503);assert.equal(signal.aborted,true);
});
