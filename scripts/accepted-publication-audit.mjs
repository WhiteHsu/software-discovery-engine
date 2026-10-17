import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {latestPublicationAudit} from './escape-remaining-routes.mjs';
import {privacyPublicationInputs,buildPrivacyPublication} from './seed/build-privacy-publication.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function acceptedPublicationAudit(){
 const receipt=JSON.parse(fs.readFileSync(path.join(root,'seed/research/privacy-publication-checkpoint-2026-10-17.json'),'utf8'));
 if(createHash('sha256').update(JSON.stringify(receipt)).digest('hex')!=='f2b846963b6a27289ce448b05eca2e028bab5bdc5f920c92aa940102db343e70')throw Error('Privacy acceptance checkpoint drift');
 const sql=fs.readFileSync(path.join(root,receipt.verification.path),'utf8').replace(/\r\n/g,'\n');
 if(createHash('sha256').update(sql).digest('hex')!==receipt.verification.normalizedSha256||receipt.verification.results.length!==22||receipt.verification.results.some(x=>x.passed!==true)||receipt.experimentStarted)throw Error('Acceptance evidence drift');
 const old=latestPublicationAudit(),publication=buildPrivacyPublication(privacyPublicationInputs());
 const expectedProducts=[...privacyPublicationInputs().snapshot.published_products,...publication.report.products].sort();
 const expectedRoutes=[...privacyPublicationInputs().snapshot.approved_published_routes,publication.report.route].sort();
 if(JSON.stringify(receipt.publishedProducts)!==JSON.stringify(expectedProducts)||JSON.stringify(receipt.publishedRoutes)!==JSON.stringify(expectedRoutes)||new Set(receipt.publishedProducts).size!==24||new Set(receipt.publishedRoutes).size!==10||publication.candidates.some(x=>!x.eligible))throw Error('Accepted publication set or qualification drift');
 const routes=old.routes.map(r=>r.slug===publication.report.route?{...r,publication:'owner-confirmed-published',curatedCandidates:3,qualifiedDraftGraphCandidates:3,minimumAdditionalQualifiedCandidates:0,missingTaxonomy:[],candidates:publication.candidates.map(c=>({slug:c.product.slug,eligible:c.eligible,blockers:c.blockers})),nextWork:'Accepted scoped publication; no re-import.'}:r);
 return {...old,recordedAt:receipt.recordedAt,basis:receipt.basis,publishedProducts:24,acceptedPublishedRoutes:10,remainingRoutes:0,publicationApproved:false,experimentStarted:false,qualificationBasis:'Historical route reconstructions plus stored PR5.103 privacy data evaluated by scoped runtime. Accepted publication is owner evidence; no live query or new approval.',routes};
}
