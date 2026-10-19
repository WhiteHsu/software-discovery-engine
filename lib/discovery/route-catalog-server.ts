import 'server-only';
import {createClient} from '@/lib/supabase/server';
import {publishedRouteCards} from './route-catalog';
export async function getPublishedRouteCards(){
 const client=await createClient();
 const {data,error}=await client.from('escape_routes').select('slug,name,description,status,editorially_approved').eq('status','published').eq('editorially_approved',true);
 if(error)throw new Error('Route directory is temporarily unavailable.');
 return publishedRouteCards(data??[]);
}
