// Accepted QA identifiers only. These do not identify ordinary visitors.
// Evidence: analytics-cloud-acceptance, hidden-gems-cloud-acceptance and browser-privacy-input-acceptance receipts in seed/research/.
export const knownQaSessionIds:readonly string[]=Object.freeze([
 'e20a7cc5-b115-46bc-bd7a-1e25f645bf20',
 'dd469548-acd9-4fa9-8cec-124353f237f1',
 '7f244ce2-4ebe-497c-bc8c-4a4c8b015529',
 '61baa262-19fc-44b9-8053-3c080498ea85',
]);
export const knownQaEventIds:readonly string[]=Object.freeze([
 '97f18f34-5fc4-4f44-9912-11edde1d1da7',
]);
const sessions=new Set(knownQaSessionIds),events=new Set(knownQaEventIds);
export function isKnownQaEvent(event:{sessionId:string;eventId:string}){
 return sessions.has(event.sessionId.toLowerCase())||events.has(event.eventId.toLowerCase());
}
