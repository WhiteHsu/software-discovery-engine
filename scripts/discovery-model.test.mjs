import {test} from "node:test";
import assert from "node:assert/strict";
import {safeUrl,claimValue,latestVerification} from "../lib/discovery/model.ts";
const c={slug:"offline",name:"Offline",description:null,value:false,verificationStatus:"verified",confidence:.9,lastVerifiedAt:"2026-10-05",sources:[{title:"Source",url:"https://example.com",retrievedAt:null}]};
test("unknown and unsupported negatives never render No",()=>{assert.equal(claimValue({...c,verificationStatus:"unknown"}),"Unknown");assert.equal(claimValue({...c,sources:[]}),"Unknown");assert.equal(claimValue(c),"No");assert.equal(claimValue({...c,value:true}),"Yes");});
test("outbound URLs reject script, malformed and credential URLs",()=>{for(const u of ["javascript:alert(1)","data:text/html,hello","https://user:pass@example.com","broken"])assert.equal(safeUrl(u),null);assert.equal(safeUrl("https://example.com"),"https://example.com/");});
test("freshness excludes unknown, unsupported and invalid dates",()=>{const p={attributes:[c,{...c,verificationStatus:"unknown",lastVerifiedAt:"2027-01-01"},{...c,sources:[],lastVerifiedAt:"2028-01-01"},{...c,lastVerifiedAt:"invalid"}],anchors:[],problems:[],audiences:[]};assert.equal(latestVerification(p),"2026-10-05");assert.equal(latestVerification({...p,attributes:[]}),null);});
