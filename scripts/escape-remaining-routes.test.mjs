import test from 'node:test';import assert from 'node:assert/strict';
import {latestPublicationAudit,currentPublicationAudit,historicalRouteAudit,currentRouteAudit,auditRemainingRoutes} from './escape-remaining-routes.mjs';
test('accepted publication and reconstructed draft qualification remain separate',()=>{const r=currentPublicationAudit();assert.equal(r.publishedProducts,18);assert.equal(r.acceptedPublishedRoutes,8);assert.equal(r.remainingRoutes,2);assert.equal(r.publicationApproved,false);assert.equal(r.routes.length,10);assert.equal(r.routes.find(r=>r.slug==='photoshop-alternatives-without-a-subscription').publication,'owner-confirmed-published');});
test('reviewed AI evidence qualifies while research shortlists remain leads',()=>{const r=currentPublicationAudit().routes.find(r=>r.slug==='notion-alternatives-without-ai');assert.equal(r.qualifiedDraftGraphCandidates,3);assert.equal(r.candidates.find(c=>c.slug==='anytype').eligible,true);assert.equal(r.publication,'owner-confirmed-published');assert.equal(currentPublicationAudit().routes.find(r=>r.slug==='pdf-editors-without-a-subscription').qualifiedDraftGraphCandidates,3);});
test('publication checkpoint rejects unknown or duplicate publications',()=>{for(const checkpoint of [{version:1,publishedProducts:['missing'],publishedRoutes:[]},{version:1,publishedProducts:[],publishedRoutes:['missing']},{version:1,publishedProducts:[],publishedRoutes:['offline-notion-alternatives','offline-notion-alternatives']}])assert.throws(()=>auditRemainingRoutes({products:[]},[],checkpoint,{routes:[]}));});

test('productivity publication is accepted with three reviewed workflows while exactly two writing routes remain',()=>{const r=currentPublicationAudit(),p=r.routes.find(x=>x.slug==='productivity-apps-you-can-buy-once');assert.equal(p.publication,'owner-confirmed-published');assert.equal(p.qualifiedDraftGraphCandidates,3);assert.deepEqual(r.routes.filter(x=>x.publication==='not-published').map(x=>x.slug).sort(),['grammarly-alternatives-without-a-subscription','privacy-friendly-grammarly-alternatives']);});

test('meditation acceptance has exactly three reviewed candidates without promoting writing research',()=>{
 const r=currentPublicationAudit(),m=r.routes.find(x=>x.slug==='meditation-apps-without-a-subscription');assert.equal(m.publication,'owner-confirmed-published');assert.equal(m.qualifiedDraftGraphCandidates,3);assert.deepEqual(m.candidates.map(c=>c.slug).sort(),['healthy-minds-program','medito','smiling-mind']);assert.ok(m.candidates.every(c=>c.eligible&&c.blockers.length===0));
 for(const route of r.routes.filter(x=>x.publication==='not-published'))assert.equal(route.qualifiedDraftGraphCandidates,0);assert.equal(r.publicationApproved,false);assert.match(r.qualificationBasis,/Not a live database query/);
});

test('historical review entry points retain their original15/7/3 checkpoint and unqualified meditation',()=>{
 const historical=historicalRouteAudit();assert.equal(historical.publishedProducts,15);assert.equal(historical.acceptedPublishedRoutes,7);assert.equal(historical.remainingRoutes,3);assert.equal(historical.routes.find(x=>x.slug==='meditation-apps-without-a-subscription').qualifiedDraftGraphCandidates,0);assert.deepEqual(currentRouteAudit(),historical);
});


test('latest accepted writing publication is21/9/1 with exactly three scoped editions and no privacy promotion',()=>{
 const r=latestPublicationAudit(),w=r.routes.find(x=>x.slug==='grammarly-alternatives-without-a-subscription');assert.equal(r.publishedProducts,21);assert.equal(r.acceptedPublishedRoutes,9);assert.equal(r.remainingRoutes,1);assert.equal(w.publication,'owner-confirmed-published');assert.equal(w.qualifiedDraftGraphCandidates,3);assert.deepEqual(w.candidates.filter(c=>c.eligible).map(c=>c.slug).sort(),['grazie-free-browser','hemingway-free-web','real-write-passive-checker']);assert.ok(!w.candidates.filter(c=>c.eligible).some(c=>c.slug==='hemingway-classic'));assert.equal(r.publicationApproved,false);
 const remaining=r.routes.filter(x=>x.publication==='not-published');assert.equal(remaining.length,1);assert.equal(remaining[0].slug,'privacy-friendly-grammarly-alternatives');assert.equal(remaining[0].qualifiedDraftGraphCandidates,0);assert.match(r.qualificationBasis,/Not a live database query/);
});

test('legacy meditation18/8/2 and productivity15/7/3 stages remain frozen after writing acceptance',()=>{
 const m=currentPublicationAudit(),p=currentRouteAudit();assert.equal(m.publishedProducts,18);assert.equal(m.acceptedPublishedRoutes,8);assert.equal(m.remainingRoutes,2);assert.equal(m.routes.find(x=>x.slug==='grammarly-alternatives-without-a-subscription').qualifiedDraftGraphCandidates,0);assert.equal(p.publishedProducts,15);assert.equal(p.acceptedPublishedRoutes,7);assert.equal(p.remainingRoutes,3);
});
