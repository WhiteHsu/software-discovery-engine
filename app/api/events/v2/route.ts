import {collectV2,collectorConfigV2} from '@/lib/analytics/http-v2';
import {memoryAdmission} from '@/lib/analytics/http';
import {publicationV2} from '@/lib/analytics/publication-v2';
import {analyticsService} from '@/lib/analytics/service';
export const runtime='nodejs';
export const maxDuration=15;
const admit=memoryAdmission();
export async function POST(request:Request){
 return collectV2(request,collectorConfigV2(process.env),{admit,now:()=>new Date(),publication:publicationV2,store:async(events,key)=>{
  const {error}=await analyticsService().rpc('ingest_discovery_events_v2',{batch:events,rate_key:key});
  if(error){if(error.message==='Analytics admission limit exceeded')return 'limited';throw Error('Analytics unavailable');}return 'ok';
 }});
}
