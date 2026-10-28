// Accepted QA identifiers only. These do not identify ordinary visitors.
// Evidence: accepted analytics QA receipts in seed/research/, including unexposed-click-acceptance.
// Locale QA provenance: seed/research/locale-production-qa-2026-10-28.json
export const knownQaSessionIds:readonly string[]=Object.freeze([
 'e20a7cc5-b115-46bc-bd7a-1e25f645bf20',
 'dd469548-acd9-4fa9-8cec-124353f237f1',
 '7f244ce2-4ebe-497c-bc8c-4a4c8b015529',
 '61baa262-19fc-44b9-8053-3c080498ea85',
 'c52c9eed-061e-4618-bf9f-5dc2f44a85b3',
 '0033efa0-5a71-48af-9a56-291a6b7f81b0',
 'b4e6515b-b308-4905-869f-323da4139ab1',
 'c59194d0-2f93-4e79-b489-e001273abc29',
 'b14b674e-bcba-4458-b15f-b7cf0ca57341',
 '4cc150fb-9cc8-4c66-baf1-aaf81ee23b07',
 '78cca68c-f935-4468-889b-efac3996b62d',
 'f062fe13-899b-436e-bb41-8e2e89446a6b',
 '9fe51376-c388-4bb3-8300-a6881d112ff0',
]);
export const knownQaEventIds:readonly string[]=Object.freeze([
 '97f18f34-5fc4-4f44-9912-11edde1d1da7',
]);
const sessions=new Set(knownQaSessionIds),events=new Set(knownQaEventIds);
export function isKnownQaEvent(event:{sessionId:string;eventId:string}){
 return sessions.has(event.sessionId.toLowerCase())||events.has(event.eventId.toLowerCase());
}
