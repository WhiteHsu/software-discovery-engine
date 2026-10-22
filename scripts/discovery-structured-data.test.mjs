import test from 'node:test';
import assert from 'node:assert/strict';
import {indexableProduct,productData,routeData,jsonLd,isoDate} from '../lib/discovery/structured-data.ts';
const claim=slug=>({slug,value:'Reviewed scope',verificationStatus:'verified',lastVerifiedAt:'2026-10-12T00:00:00Z',sources:[{url:'https://example.org/evidence'}]});
const p={slug:'example',name:'Example </script><script>alert(1)</script>',description:'Reviewed software',websiteUrl:'https://example.org',status:'published',attributes:[claim('pricing-model'),claim('trade-off-summary')],routes:[{slug:'offline-notion-alternatives'}]};
test('thin, draft, undated and unqualified products cannot enter indexing or structured-data publication',()=>{
 assert.equal(indexableProduct(p),true);
 for(const patch of [{status:'draft'},{description:''},{websiteUrl:'javascript:alert(1)'},{routes:[]},{attributes:[]},{attributes:[claim('pricing-model'),{...claim('trade-off-summary'),lastVerifiedAt:null}]}])assert.equal(indexableProduct({...p,...patch}),false);
});
test('product graph uses factual software identity, linked routes and matching breadcrumbs without invented ratings, prices or page modification dates',()=>{
 const data=productData('https://example.test',p),text=jsonLd(data);
 assert.doesNotMatch(text,/<|aggregateRating|offers|dateModified|lastReviewed/);
 const graph=JSON.parse(text)['@graph'];assert.equal(graph[1]['@type'],'SoftwareApplication');assert.equal(graph[1].name,p.name);
 assert.deepEqual(graph[0].relatedLink,['https://example.test/escape/offline-notion-alternatives']);
 assert.equal(graph[2].itemListElement[1].item,'https://example.test/software/example');
});
test('route graph preserves qualified order and route review date; invalid dates are omitted',()=>{
 const route={slug:'offline-notion-alternatives',name:'Offline alternatives',description:'Scope',lastVerifiedAt:'2026-10-12T00:00:00Z'};
 const graph=routeData('https://example.test',route,[p,{...p,slug:'second'}])['@graph'];
 assert.equal(graph[0].lastReviewed,'2026-10-12');assert.equal(graph[1].numberOfItems,2);assert.equal(graph[1].itemListElement[1].position,2);
 assert.equal(isoDate('invalid'),null);assert.equal(routeData('https://example.test',{...route,lastVerifiedAt:null},[])['@graph'][0].lastReviewed,undefined);
});
