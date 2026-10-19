import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {getSupabasePublicConfig,SOFTWARE_DISCOVERY_SCHEMA} from '@/lib/supabase/config';

export function analyticsService(){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw new Error('Analytics service unavailable');
 const {url}=getSupabasePublicConfig();
 return createClient(url,key,{db:{schema:SOFTWARE_DISCOVERY_SCHEMA},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(4000)})}});
}
