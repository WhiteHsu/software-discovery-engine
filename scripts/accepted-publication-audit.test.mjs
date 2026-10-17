import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {acceptedPublicationAudit} from './accepted-publication-audit.mjs';
import {latestPublicationAudit,currentPublicationAudit,historicalRouteAudit} from './escape-remaining-routes.mjs';
test('accepted milestone qualifies scoped privacy while preserving all historical checkpoint entry points',()=>{
 const r=acceptedPublicationAudit();assert.deepEqual([r.publishedProducts,r.acceptedPublishedRoutes,r.remainingRoutes],[24,10,0]);
 assert.equal(r.experimentStarted,false);assert.equal(r.publicationApproved,false);
 const p=r.routes.find(x=>x.slug==='privacy-friendly-grammarly-alternatives');assert.equal(p.publication,'owner-confirmed-published');assert.equal(p.qualifiedDraftGraphCandidates,3);assert.ok(p.candidates.every(x=>x.eligible));
 for(const [audit,expected] of [[historicalRouteAudit,[15,7,3]],[currentPublicationAudit,[18,8,2]],[latestPublicationAudit,[21,9,1]]]){const a=audit();assert.deepEqual([a.publishedProducts,a.acceptedPublishedRoutes,a.remainingRoutes],expected);}
});
test('default audit command completes without import-cycle stall and reports current milestone',()=>{
 const text=execFileSync(process.execPath,[fileURLToPath(new URL('./escape-remaining-routes.mjs',import.meta.url))],{encoding:'utf8',timeout:15000});
 assert.match(text,/24 products, 10\/10 routes. Remaining: 0/);
});
