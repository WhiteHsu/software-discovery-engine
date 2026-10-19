// Accepted QA identifiers only. These do not identify ordinary visitors.
// Keep synchronized with seed/research/analytics-cloud-acceptance-2026-10-19.json.
export const knownQaSessionIds:readonly string[]=Object.freeze([
 'e20a7cc5-b115-46bc-bd7a-1e25f645bf20',
 'dd469548-acd9-4fa9-8cec-124353f237f1',
]);
export const knownQaEventIds:readonly string[]=Object.freeze([
 '97f18f34-5fc4-4f44-9912-11edde1d1da7',
]);
const sessions=new Set(knownQaSessionIds),events=new Set(knownQaEventIds);
export function isKnownQaEvent(event:{sessionId:string;eventId:string}){
 return sessions.has(event.sessionId.toLowerCase())||events.has(event.eventId.toLowerCase());
}
