import test from 'node:test';
import assert from 'node:assert/strict';
import {escapeDefinitions} from '../lib/discovery/escape-model.ts';
import {publishedRouteCards} from '../lib/discovery/route-catalog.ts';
import {anchorOptions,constraintOptions,navigationSelection,filterRouteCards} from '../lib/discovery/navigation.ts';
const cards=publishedRouteCards(escapeDefinitions.map(d=>({...d,description:'Reviewed scope.',status:'published',editorially_approved:true})));
test('all reviewed routes remain reachable by constraint; anchor choices use registered identities',()=>{
 const reachable=new Set(constraintOptions.flatMap(o=>filterRouteCards(cards,navigationSelection({constraint:o.value})).map(c=>c.slug)));
 assert.equal(reachable.size,10);
 for(const option of anchorOptions){const result=filterRouteCards(cards,navigationSelection({anchor:option.value}));assert.ok(result.length);assert.ok(result.every(c=>escapeDefinitions.find(d=>d.slug===c.slug).anchor===option.value));}
});
test('combined filters intersect existing approved cards and never fabricate routes or broaden scope',()=>{
 const select=navigationSelection({anchor:'notion',constraint:'offline'});
 assert.deepEqual(filterRouteCards(cards,select).map(c=>c.slug),['offline-notion-alternatives']);
 assert.deepEqual(filterRouteCards(cards,navigationSelection({anchor:'todoist',constraint:'offline'})),[]);
 assert.deepEqual(filterRouteCards(cards.filter(c=>c.slug!=='offline-notion-alternatives'),select),[]);
 assert.deepEqual(filterRouteCards([{slug:'unapproved-combination',name:'x',description:'x'}],navigationSelection({})),[]);
 assert.deepEqual(filterRouteCards(cards,navigationSelection({})),cards);
});
test('unknown, repeated and malformed selections return no matches instead of silently selecting all',()=>{
 for(const params of [{anchor:'unknown'},{constraint:'privacy-first'},{anchor:['notion','todoist']},{constraint:['offline']},{anchor:'<script>'}]){
  const selection=navigationSelection(params);assert.equal(selection.invalid,true);assert.equal(selection.filtered,true);assert.deepEqual(filterRouteCards(cards,selection),[]);
 }
 assert.equal(navigationSelection({}).filtered,false);
 assert.equal(navigationSelection({anchor:'',constraint:''}).invalid,false);
});
