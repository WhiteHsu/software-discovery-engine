import {purgeEvents} from '@/lib/analytics/http';
import {analyticsService} from '@/lib/analytics/service';
export const runtime='nodejs';
export const maxDuration=10;
export async function POST(request:Request){
 return purgeEvents(request,process.env.ANALYTICS_MAINTENANCE_SECRET??'',process.env.ANALYTICS_PURGE_ENABLED==='true',async()=>{
  const {error}=await analyticsService().rpc('purge_discovery_events');if(error)throw new Error('Maintenance unavailable');
 });
}
