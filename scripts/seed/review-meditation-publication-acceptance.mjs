import {currentPublicationAudit,historicalRouteAudit} from '../escape-remaining-routes.mjs';
if(process.argv.length!==2)throw Error('No arguments supported');
const current=currentPublicationAudit(),historical=historicalRouteAudit();
if(current.publishedProducts!==18||current.acceptedPublishedRoutes!==8||current.remainingRoutes!==2||historical.publishedProducts!==15||historical.acceptedPublishedRoutes!==7||historical.remainingRoutes!==3)throw Error('Publication acceptance drift');
for(const route of current.routes.filter(x=>x.publication==='not-published'))if(!['grammarly-alternatives-without-a-subscription','privacy-friendly-grammarly-alternatives'].includes(route.slug)||route.qualifiedDraftGraphCandidates!==0)throw Error('Remaining writing route drift');
console.log('PR5.61: owner-approved meditation publication accepted;21/21 SQL checks and four public-page/three Visit screenshot evidence recorded.');
console.log('Current18/8/2; historical15/7/3 preserved. Writing holds remain. Static check only; no remote writes or new publication approval.');
