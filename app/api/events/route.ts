import {collectEvents,collectorConfig,memoryAdmission} from '@/lib/analytics/http';
import {eventPublication} from '@/lib/analytics/publication';
import {analyticsService} from '@/lib/analytics/service';
export const runtime='nodejs';
export const maxDuration=10;
const admit=memoryAdmission();
export async function POST(request:Request){
 return collectEvents(request,collectorConfig(process.env),{publication:eventPublication,admit,now:()=>new Date(),store:async(events,key)=>{
  const {error}=await analyticsService().rpc('ingest_discovery_events',{batch:events,rate_key:key});
  if(error){if(error.message==='Analytics admission limit exceeded')return 'limited';throw new Error('Analytics storage unavailable');}
  return 'ok';
 }});
}
