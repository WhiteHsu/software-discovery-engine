// Synthetic claims use publicly displayed text for translation/render tests only.
// Confidence and sources below are test values, not new verification evidence.
import {readFileSync} from 'node:fs';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
const display=JSON.parse(readFileSync(new URL('./locale-expanded-display.json',import.meta.url),'utf8'));
const names={'Works Offline':'works-offline','AI Optional':'ai-optional','Focused Note Taking':'focused-note-taking','No Database Required':'no-database-required','Minimal Setup':'minimal-setup','One-Time Purchase':'one-time-purchase','No Subscription':'no-subscription','Privacy-Friendly':'privacy-friendly','Pricing Model':'pricing-model','Trade-Off Summary':'trade-off-summary','Reviewed Local Operation':'reviewed-local-operation','Personal Task Workflow Scope':'personal-task-workflow-scope'};
export const products=[];
export const routes=display.map((d,i)=>({id:'route-'+i,slug:d.slug,name:d.name,description:d.description,last_verified_at:d.date,status:'published',editorially_approved:true}));
export const membership=new Map();
for(const route of display){
 const def=escapeDefinitions.find(d=>d.slug===route.slug);membership.set(route.slug,route.cards.map(c=>c.slug));
 for(const card of route.cards){
  let p=products.find(p=>p.slug===card.slug);
  if(!p){p={slug:card.slug,name:card.name,description:card.description,websiteUrl:'https://example.org/'+card.slug,status:'published',attributes:[],anchors:[],audiences:[],problems:[],routes:[]};products.push(p);}
  p.routes.push({slug:route.slug,name:route.name,description:route.description});
  for(const c of card.claims){
   const attribute=names[c.name],relationship=!attribute;
   const claim={slug:attribute??def.anchor,name:c.name,description:c.description,value:relationship?undefined:c.value==='Yes'||c.name==='Privacy-Friendly'?true:c.value==='No'?false:c.value,verificationStatus:'verified',confidence:.9,lastVerifiedAt:c.date,sources:[{title:'Synthetic integration fixture; not verification evidence',url:'https://example.org/evidence',retrievedAt:c.date}],...(relationship?{relationshipType:'alternative',scope:route.slug==='privacy-friendly-grammarly-alternatives'?'personal-english-passive-construction-review':def.relationshipScope}:{} )};
   const list=relationship?p.anchors:p.attributes;if(!list.some(x=>x.slug===claim.slug))list.push(claim);
  }
 }
}
export function mockSupabase(req,res){
 const u=new URL(req.url,'http://localhost');let result=[];
 const send=value=>{res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(value));};
 if(u.pathname.endsWith('/rpc/product_discovery_page')){let body='';req.on('data',c=>body+=c);req.on('end',()=>send(products.find(p=>p.slug===JSON.parse(body||'{}').product_slug)??null));return;}
 if(u.pathname.endsWith('/escape_routes')){result=routes.filter(r=>!u.searchParams.has('slug')||'eq.'+r.slug===u.searchParams.get('slug'));if((req.headers.accept??'').includes('vnd.pgrst.object'))result=result[0]??null;}
 else if(u.pathname.endsWith('/escape_route_products')){const route=routes.find(r=>'eq.'+r.id===u.searchParams.get('escape_route_id'));result=(membership.get(route?.slug)??[]).map(slug=>({product_id:slug,novelty_score:0}));}
 else if(u.pathname.endsWith('/products')){result=products.filter(p=>p.status==='published').map(p=>({id:p.slug,slug:p.slug,status:p.status}));const ids=u.searchParams.get('id');if(ids?.startsWith('in.'))result=result.filter(p=>ids.slice(4,-1).split(',').includes(p.id));}
 send(result);
}
