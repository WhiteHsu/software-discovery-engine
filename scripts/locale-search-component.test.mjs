// Render the actual TSX component with injected hook state; no network/model calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import ts from 'typescript';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {localizeSearchResult} from '../lib/i18n/search-localized.ts';
import {searchGraph} from '../lib/discovery/search-graph.ts';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
import {rankEscapeCandidates} from '../lib/discovery/privacy-route.ts';
import {products,routes,membership} from './locale-products-fixtures.mjs';
const componentUrl=new URL('../components/DiscoverySearch.tsx',import.meta.url).href;
const source=ts.transpileModule(readFileSync(new URL(componentUrl),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const mocks={react:`export function useState(initial){const s=globalThis.__searchComponentState;return [s.values[s.index++]??initial,()=>{}];}export const useEffect=()=>{};export const useRef=()=>({current:null});`,
 'next/link':`import {createElement} from '${import.meta.resolve('react')}';export default function Link(props){return createElement('a',props);}`,
 '@/lib/analytics/client-v2':`export const beginSearchV2=()=>undefined;export const observePlacementsV2=()=>()=>{};export const emitV2=()=>{};`,
 '@/lib/analytics/exposure':`export const exposureGate=()=>({});`,
 './discovery-search.module.css':`export default {};`,
};
const hook=registerHooks({resolve(s,c,next){if(c.parentURL===componentUrl){if(Object.hasOwn(mocks,s))return {url:'data:text/javascript,'+encodeURIComponent(mocks[s]),shortCircuit:true};if(s==='@/lib/i18n/search-localized')return {url:new URL('../lib/i18n/search-localized.ts',import.meta.url).href,shortCircuit:true};}return next(s,c);},load(url,c,next){if(url===componentUrl)return {format:'module',source,shortCircuit:true};return next(url,c);}});
const {default:Search}=await import(componentUrl);hook.deregister();
const intent={status:'ready',anchor:'notion',problem:null,attributes:['works-offline'],unresolved:false};
const pages=routes.map(r=>({...r,published:true,lastVerifiedAt:r.last_verified_at,candidates:rankEscapeCandidates(escapeDefinitions.find(d=>d.slug===r.slug),membership.get(r.slug).map(slug=>({product:products.find(p=>p.slug===slug),noveltyScore:0})))}));
const english={state:'results',intent,matches:searchGraph(intent,pages).map(m=>({...m,explanationFacts:m.facts.map(f=>f.id)})),explanationMode:'verified-evidence'};
const render=(result=null,{chinese=true,busy=false,error=''}={})=>{globalThis.__searchComponentState={index:0,values:['',busy,error,result,undefined]};try{return renderToStaticMarkup(createElement(Search,{chinese}));}finally{delete globalThis.__searchComponentState;}};
test('Chinese search results render translated evidence and localized product/comparison links with original positions',()=>{
 const html=render(localizeSearchResult(english));assert.match(html,/解析出的需求/);assert.match(html,/可離線使用/);assert.match(html,/符合需求的原因/);assert.match(html,/已查核的適用範圍/);assert.match(html,/所有符合需求的證據/);assert.doesNotMatch(html,/Why it fits|Reviewed scope|More detail needed/);
 for(const [i,m] of english.matches.entries()){assert.ok(html.includes(`data-search-product="${m.slug}" data-discovery-position="${i+1}" href="/zh-hant/software/${m.slug}"`));assert.ok(html.includes(`href="/zh-hant/escape/${m.routeSlug}"`));}
 assert.match(html,/你的需求會傳送至 OpenAI/);assert.match(html,/七天/);assert.match(render(english,{chinese:false}),/href="\/software\//);
});
test('Chinese idle, loading, error, clarification, unsupported and no-results messages preserve narrow-result meaning',()=>{
 assert.match(render(),/你想找什麼/);assert.match(render(null,{busy:true}),/正在核對/);assert.match(render(null,{error:'搜尋暫時無法使用'}),/role="alert"/);
 for(const [state,pattern] of [['clarify',/我們沒有移除你的其他要求/],['unsupported',/目前無法表示或查核的需求/],['no_results',/未放寬任何條件/]])assert.match(render({...english,state,matches:[]}),pattern);
});
