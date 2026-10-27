import {chinesePath} from '../i18n/pilot.ts';
// Supplementary page views only; independently gated from Supabase analytics.
export const QA_SESSIONS = new Set(["c59194d0-2f93-4e79-b489-e001273abc29","e20a7cc5-b115-46bc-bd7a-1e25f645bf20", "dd469548-acd9-4fa9-8cec-124353f237f1", "7f244ce2-4ebe-497c-bc8c-4a4c8b015529", "61baa262-19fc-44b9-8053-3c080498ea85", "c52c9eed-061e-4618-bf9f-5dc2f44a85b3", "0033efa0-5a71-48af-9a56-291a6b7f81b0"]);
const PUBLIC_PATHS = new Set(["/", "/escape/grammarly-alternatives-without-a-subscription", "/escape/meditation-apps-without-a-subscription", "/escape/notion-alternatives-without-ai", "/escape/offline-notion-alternatives", "/escape/pdf-editors-without-a-subscription", "/escape/photoshop-alternatives-without-a-subscription", "/escape/privacy-friendly-grammarly-alternatives", "/escape/productivity-apps-you-can-buy-once", "/escape/simple-notion-alternatives", "/escape/todoist-alternatives-with-a-one-time-purchase", "/hidden-gems", "/software/2do", "/software/affine", "/software/anytype", "/software/appflowy", "/software/foxit-pdf-editor", "/software/gimp", "/software/grazie-free-browser", "/software/healthy-minds-program", "/software/hemingway-classic", "/software/hemingway-free-web", "/software/insight-timer", "/software/joplin", "/software/krita", "/software/languagetool-local-cli-6-6", "/software/medito", "/software/obsidian", "/software/omnifocus", "/software/paint-net", "/software/pdf-xchange-editor", "/software/pdf24-creator", "/software/pdfgear", "/software/prowritingaid", "/software/real-write-passive-checker", "/software/sejda", "/software/simplenote", "/software/smiling-mind", "/software/stirling-pdf", "/software/things", "/software/vale-local-passive-3-24-0", "/software/write-good-local-library-1-0-8", "/discover", "/privacy"]);
export function vercelAnalyticsEnabled(env: Record<string,string|undefined>):boolean {
 return env.VERCEL==='1' && env.VERCEL_ENV==='production' && env.VERCEL_WEB_ANALYTICS_ENABLED==='true';
}
export function cleanVercelUrl(value:string):string|null {
 try {const u=new URL(value);if(u.origin!=='https://toolelse.com'||u.username||u.password||!(PUBLIC_PATHS.has(u.pathname)||chinesePath(u.pathname)))return null;return u.origin+u.pathname;}catch{return null;}
}
export function safeVercelContext(session:string|null,optOut:string|null,referrer:string):boolean {
 if(optOut==='1'||(session!==null && QA_SESSIONS.has(session.toLowerCase())))return false;
 if(!referrer)return true;
 try {const u=new URL(referrer);if(!['https:','http:'].includes(u.protocol)||u.username||u.password||u.search||u.hash)return false;
 // SDK beforeSend exposes only event.url, not referrer. Drop events whose
 // referrer path cannot be proven public rather than claiming it was redacted.
 return u.origin==='https://toolelse.com'?(PUBLIC_PATHS.has(u.pathname)||chinesePath(u.pathname)):u.pathname==='/';
 }catch{return false;}
}
