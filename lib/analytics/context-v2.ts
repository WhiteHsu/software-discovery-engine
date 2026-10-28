import {createHmac,timingSafeEqual} from 'node:crypto';
import {parseSearchIntent,type SearchIntent} from '../discovery/search-intent.ts';
import type {EventV2} from './events-v2.ts';
export type SearchContextV2={version:1;path:'/'|'/discover'|'/zh-hant'|'/zh-hant/discover';sessionId:string;pageViewId:string;searchId:string;resultSetId:string;issuedAt:number;expiresAt:number;intent:SearchIntent;outcome:'results'|'no_results'|'clarify'|'unsupported';products:string[]};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const keys=['version','path','sessionId','pageViewId','searchId','resultSetId','issuedAt','expiresAt','intent','outcome','products'];
function context(value:unknown):SearchContextV2{
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid context');
 const c=value as SearchContextV2;
 if(Object.keys(c).length!==keys.length||Object.keys(c).some(k=>!keys.includes(k))||c.version!==1||!['/','/discover','/zh-hant','/zh-hant/discover'].includes(c.path))throw Error('Invalid context');
 for(const key of ['sessionId','pageViewId','searchId','resultSetId'] as const)if(typeof c[key]!=='string'||!uuid.test(c[key]))throw Error('Invalid context identity');
 parseSearchIntent(c.intent);
 if(!Number.isSafeInteger(c.issuedAt)||!Number.isSafeInteger(c.expiresAt)||c.expiresAt-c.issuedAt!==1800000)throw Error('Invalid lifetime');
 if(!['results','no_results','clarify','unsupported'].includes(c.outcome)||!Array.isArray(c.products)||c.products.length>6||c.products.some(p=>typeof p!=='string'||p.length>100||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p))||new Set(c.products).size!==c.products.length)throw Error('Invalid results');
 if((c.outcome==='results')!==(c.products.length>0))throw Error('Invalid result count');
 if((c.outcome==='results'||c.outcome==='no_results')?c.intent.status!=='ready':c.intent.status!==c.outcome)throw Error('Context intent mismatch');
 return c;
}
const secretCheck=(secret:string)=>{if(!/^[a-f0-9]{64,128}$/.test(secret))throw Error('Context signing unavailable');};
export function signSearchContext(value:SearchContextV2,secret:string){
 secretCheck(secret);const c=context(value),body=Buffer.from(JSON.stringify(c)).toString('base64url');
 return body+'.'+createHmac('sha256',secret).update('discovery-v2\0'+body).digest('base64url');
}
export function readSearchContext(token:string,secret:string,now:number){
 secretCheck(secret);if(typeof token!=='string'||token.length>6000||!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token))throw Error('Invalid receipt');
 const [body,signature]=token.split('.'),expected=createHmac('sha256',secret).update('discovery-v2\0'+body).digest(),received=Buffer.from(signature,'base64url');
 if(received.length!==expected.length||!timingSafeEqual(received,expected))throw Error('Invalid signature');
 const c=context(JSON.parse(Buffer.from(body,'base64url').toString('utf8')));
 if(!Number.isFinite(now)||now<c.issuedAt||now>=c.expiresAt)throw Error('Receipt expired');
 return c;
}
export function validateSearchContext(e:EventV2,c:SearchContextV2){
 if(e.sessionId.toLowerCase()!==c.sessionId)throw Error('Wrong session');
 if(e.surface==='search'&&e.name!=='search_performed'&&e.name!=='page_viewed'){
  if(e.path!==c.path||e.pageViewId.toLowerCase()!==c.pageViewId||e.searchId?.toLowerCase()!==c.searchId||e.resultSetId?.toLowerCase()!==c.resultSetId)throw Error('Wrong result set');
  if(e.anchor!==c.intent.anchor&&!(e.anchor===undefined&&c.intent.anchor===null))throw Error('Wrong anchor');
  if(JSON.stringify([...(e.constraints??[])].sort())!==JSON.stringify([...c.intent.attributes].sort()))throw Error('Wrong constraints');
  if(e.name==='search_results_viewed'){
   if(JSON.stringify(e.intent)!==JSON.stringify(c.intent)||e.outcome!==c.outcome||e.resultCount!==c.products.length)throw Error('Wrong search outcome');
  }else if(!e.position||c.products[e.position-1]!==e.productSlug)throw Error('Wrong search product/rank');
 }else if(e.originSurface==='search'){
  if(e.originPageViewId?.toLowerCase()!==c.pageViewId||e.originSearchId?.toLowerCase()!==c.searchId||!e.originPosition||c.products[e.originPosition-1]!==e.productSlug)throw Error('Wrong search attribution');
 }
 const occurred=Date.parse(e.occurredAt);if(occurred<c.issuedAt-5000||occurred>=c.expiresAt)throw Error('Event outside receipt lifetime');
}
