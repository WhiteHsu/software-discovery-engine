// Owner-invoked synthetic collector QA. Does not read secrets or enable any flags.
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const args=process.argv.slice(2);
if(args.length!==1||args[0]!=='--send'){
 console.log('No request sent. After deploying PR5.113 and enabling ONLY the collector, run: node scripts/analytics-live-probe.mjs --send');
 if(args.length)process.exitCode=1;
}else{
 const origin='https://software-discovery-engine.vercel.app';
 const event={version:1,eventId:randomUUID(),sessionId:randomUUID(),pageViewId:randomUUID(),occurredAt:new Date().toISOString(),name:'product_view',surface:'product',path:'/software/vale-local-passive-3-24-0',productSlug:'vale-local-passive-3-24-0'};
 const privacy={...event,eventId:randomUUID()},invalid={...event,eventId:randomUUID(),qaUnsupported:true};
 const directory=new URL('../.seed-output/',import.meta.url);fs.mkdirSync(directory,{recursive:true});
 const tag=event.eventId,receiptUrl=new URL('analytics-live-probe-'+tag+'.json',directory),sqlUrl=new URL('analytics-live-probe-'+tag+'.sql',directory);
 const receipt={packet:'PR5.113',synthetic:true,experimentStarted:false,origin,createdAt:new Date().toISOString(),acceptedEventId:event.eventId,privacyEventId:privacy.eventId,rejectedEventId:invalid.eventId,sessionId:event.sessionId,results:[]};
 const save=()=>fs.writeFileSync(receiptUrl,JSON.stringify(receipt,null,2)+'\n');save();
 const sql=`-- Privileged owner SELECT only. Probe-specific IDs; no event payloads returned.
SELECT 'synthetic_probe_stored_once' AS check_name,count(*)=1 AS passed FROM software_discovery.discovery_events WHERE event_id='${event.eventId}'::uuid
UNION ALL SELECT 'privacy_probe_not_stored',count(*)=0 FROM software_discovery.discovery_events WHERE event_id='${privacy.eventId}'::uuid
UNION ALL SELECT 'invalid_probe_not_stored',count(*)=0 FROM software_discovery.discovery_events WHERE event_id='${invalid.eventId}'::uuid;
`;
 fs.writeFileSync(sqlUrl,sql);
 console.log('Synthetic QA session (exclude from demand metrics): '+event.sessionId);
 console.log('Receipt: '+fileURLToPath(receiptUrl));console.log('Owner verification SQL: '+fileURLToPath(sqlUrl));
 const requests=[['accepted',event,{},204],['duplicate',event,{},204],['privacy',privacy,{'Sec-GPC':'1'},204],['invalid',invalid,{},400]];
 for(const [name,payload,extra,expected] of requests){
  try{
   const response=await fetch(origin+'/api/events',{method:'POST',headers:{Origin:origin,'Sec-Fetch-Site':'same-origin','Content-Type':'application/json',...extra},body:JSON.stringify([payload]),redirect:'manual',signal:AbortSignal.timeout(10_000)});
   receipt.results.push({name,status:response.status,expected,passed:response.status===expected});save();
   console.log(name+': HTTP '+response.status+' (expected '+expected+')');
   await response.body?.cancel();
   if(response.status!==expected){process.exitCode=1;console.log('Stopped. Do not retry automatically; verify the saved IDs in SQL first.');break;}
  }catch{
   receipt.results.push({name,status:null,expected,passed:false,error:'network_or_timeout'});save();process.exitCode=1;
   console.log('Stopped on network/timeout. Outcome may be ambiguous; verify the saved IDs before another run.');break;
  }
 }
 console.log('HTTP results alone do not prove persistence. Run the generated SQL and return all3 checks plus this receipt.');
}
