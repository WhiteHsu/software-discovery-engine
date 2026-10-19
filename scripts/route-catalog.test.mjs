import test from 'node:test';
import assert from 'node:assert/strict';
import {publishedRouteCards} from '../lib/discovery/route-catalog.ts';
const approved={slug:'privacy-friendly-grammarly-alternatives',name:'Privacy-Friendly Grammarly Alternatives',description:'Fixed local operations only.',status:'published',editorially_approved:true};
test('directory rejects drafts, unapproved routes, unknown identities and malformed data',()=>{
 assert.deepEqual(publishedRouteCards([]),[]);
 assert.deepEqual(publishedRouteCards([null,{}, {...approved,status:'draft'},{...approved,editorially_approved:false},{...approved,editorially_approved:'true'},{...approved,slug:'../../private'},{...approved,description:null}]),[]);
 assert.deepEqual(publishedRouteCards([approved]),[{slug:approved.slug,name:approved.name,description:approved.description}]);
});
test('approved live cards deduplicate and preserve scoped copy with deterministic ordering',()=>{
 const other={...approved,slug:'offline-notion-alternatives',name:'Offline Notion Alternatives'};
 const a=publishedRouteCards([approved,other,approved]);
 assert.equal(a.length,2);assert.equal(a[0].slug,other.slug);assert.equal(a[1].description,approved.description);assert.deepEqual(a,publishedRouteCards([other,approved]));
});
