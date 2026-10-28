import 'server-only';
import {searchConfig,searchAdmission,searchRequest} from './search-http';
import {modelIntent,modelExplanations} from './search-model';
import {discover} from './search-service';
import {escapeDefinitions} from './escape-model';
import {getEscape} from './escapes';
import {searchReceipt} from '../analytics/search-receipt';
import {getChineseEscape,getChineseProduct} from '../i18n/server';
import {localizeSearchResult} from '../i18n/search-localized';
// Both languages use this endpoint and the same admission budget.
const admit=searchAdmission();
const errors:Record<number,string>={400:'請輸入 1～500 個字元的需求。',403:'無法接受此請求。',405:'請使用 POST。',415:'需要 JSON 格式。',429:'請稍等一分鐘再搜尋。',503:'搜尋暫時無法使用，請瀏覽已查核的比較或稍後再試。'};
export function makeSearchPost(){return async(request:Request)=>{
 const chinese=request.headers.get('x-discovery-locale')==='zh-Hant';
 const config=searchConfig(process.env);
 const response=await searchRequest(request,config,{admit,now:Date.now,run:async(query,signal)=>{
  const result=await discover(query,{
   parse:q=>modelIntent(q,config,signal),
   retrieve:async intent=>{
    const defs=escapeDefinitions.filter(d=>!intent.anchor||d.anchor===intent.anchor),pages=[];
    for(let offset=0;offset<defs.length;offset+=2){if(signal.aborted)throw Error('Search cancelled');pages.push(...await Promise.all(defs.slice(offset,offset+2).map(d=>getEscape(d.slug))));}
    return pages;
   },
   explain:matches=>modelExplanations(matches,config,signal),
  });
  let display=result;
  if(chinese){
   for(let offset=0;offset<result.matches.length;offset+=2){
    if(signal.aborted)throw Error('Search cancelled');
    const ready=await Promise.all(result.matches.slice(offset,offset+2).map(async m=>!!await getChineseProduct(m.slug)&&!!await getChineseEscape(m.routeSlug)));
    if(!ready.every(Boolean))throw Error('Search translation unavailable');
   }
   display=localizeSearchResult(result);
  }
  const analytics=searchReceipt(request,result,process.env);
  return analytics?{...display,analytics}:display;
 }});
 return chinese&&!response.ok?Response.json({error:errors[response.status]??errors[503]},{status:response.status,headers:response.headers}):response;
};}
