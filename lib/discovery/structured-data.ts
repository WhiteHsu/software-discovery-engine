import {safeUrl,supported,type ProductPage} from './model.ts';
export function isoDate(value:string|null){
 return value&&Number.isFinite(Date.parse(value))?new Date(value).toISOString().slice(0,10):null;
}
export function indexableProduct(p:ProductPage){
 return p.status==='published'&&!!p.name.trim()&&!!p.description?.trim()&&!!safeUrl(p.websiteUrl)&&p.routes.length>0&&['pricing-model','trade-off-summary'].every(slug=>p.attributes.some(c=>c.slug===slug&&c.verificationStatus==='verified'&&supported(c)&&!!isoDate(c.lastVerifiedAt)&&typeof c.value==='string'&&!!c.value.trim()));
}
export function breadcrumbData(origin:string,path:string,name:string){
 return {'@type':'BreadcrumbList','@id':origin+path+'#breadcrumbs',itemListElement:[
  {'@type':'ListItem',position:1,name:'Home',item:origin+'/'},
  {'@type':'ListItem',position:2,name,item:origin+path},
 ]};
}
export function productData(origin:string,p:ProductPage){
 const path='/software/'+p.slug,url=origin+path;
 return {'@context':'https://schema.org','@graph':[
  {'@type':'WebPage','@id':url+'#page',url,name:p.name,description:p.description,mainEntity:{'@id':url+'#software'},breadcrumb:{'@id':url+'#breadcrumbs'},relatedLink:p.routes.map(r=>origin+'/escape/'+r.slug)},
  {'@type':'SoftwareApplication','@id':url+'#software',name:p.name,description:p.description,url:safeUrl(p.websiteUrl),mainEntityOfPage:{'@id':url+'#page'}},
  breadcrumbData(origin,path,p.name),
 ]};
}
export function routeData(origin:string,p:{slug:string;name:string;description:string|null;lastVerifiedAt:string|null},products:ProductPage[]){
 const path='/escape/'+p.slug,url=origin+path,reviewed=isoDate(p.lastVerifiedAt);
 return {'@context':'https://schema.org','@graph':[
  {'@type':'CollectionPage','@id':url+'#page',url,name:p.name,description:p.description,...(reviewed?{lastReviewed:reviewed}:{}),breadcrumb:{'@id':url+'#breadcrumbs'},mainEntity:{'@id':url+'#candidates'}},
  {'@type':'ItemList','@id':url+'#candidates',numberOfItems:products.length,itemListElement:products.map((product,i)=>({'@type':'ListItem',position:i+1,name:product.name,url:origin+'/software/'+product.slug}))},
  breadcrumbData(origin,path,p.name),
 ]};
}
export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
