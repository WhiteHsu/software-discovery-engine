import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const JAVA_SHA='1977f302375adbb920d41dac65c7e22eb9c2ed8e1e8d6258964154ff16f14406';
const CLI_SHA='7e652a409245a7c9ffce517c891cb6cc27eee00abbb32a3427995abd6f9096ac';
const RULES=new Set(['PASSIVE_VOICE_SIMPLE','PASSIVE_VOICE','REP_PASSIVE_VOICE']);
const CASES=[
  ['passive','The report was written by Mira. The parcel was sent by Leon.',2],
  ['active','Mira wrote the report. Leon sent the parcel.',0],
  ['adjectival','The students are bored.',0],
  ['positive','This are a test. It is also thought that tests are satisfactory. Instruments were played in most cultures.',2]
];
function fail(code){throw new Error(code);}
export function assertNoJvmInjection(env){
  const keys=new Set(['JAVA_TOOL_OPTIONS','JDK_JAVA_OPTIONS','_JAVA_OPTIONS']);
  if(Object.entries(env).some(([key,value])=>keys.has(key.toUpperCase())&&String(value??'').trim()))fail('JVM_OPTIONS_PRESENT');
}
export function projectMatches(raw,inputLength){
  let data;try{data=JSON.parse(raw);}catch{fail('INVALID_RESULT');}
  if(data?.software?.version!=='6.6'||!Array.isArray(data.matches)||data.matches.length>inputLength)fail('INVALID_RESULT');
  return data.matches.map(match=>{
    if(!RULES.has(match?.rule?.id)||!Number.isSafeInteger(match.offset)||!Number.isSafeInteger(match.length)||match.offset<0||match.length<=0||match.offset+match.length>inputLength)fail('INVALID_RESULT');
    return {ruleId:match.rule.id,offset:match.offset,length:match.length};
  });
}
export function assertOwnedTemp(tempRoot,tempPath){
  if(path.dirname(path.resolve(tempPath))!==path.resolve(tempRoot)||!/^lt-synthetic-[A-Za-z0-9]+$/.test(path.basename(tempPath)))fail('TEMP_BOUNDARY');
}
function pin(file,expected){
  let bytes;try{bytes=fs.readFileSync(file);}catch{fail('ARTIFACT_UNAVAILABLE');}
  if(createHash('sha256').update(bytes).digest('hex')!==expected)fail('ARTIFACT_MISMATCH');
}
export function probe(javaHome,toolHome,env=process.env){
  assertNoJvmInjection(env);
  const java=path.resolve(javaHome,'bin/java.exe'),jar=path.resolve(toolHome,'languagetool-commandline.jar');
  pin(java,JAVA_SHA);pin(jar,CLI_SHA);
  const tempRoot=fs.realpathSync(os.tmpdir());
  const work=fs.mkdtempSync(path.join(tempRoot,'lt-synthetic-'));
  assertOwnedTemp(tempRoot,work);
  const report={version:1,mode:'synthetic-stdin-summary-only',runtimeIdentityPinned:true,completeDistributionVerified:false,networkBlocked:false,runs:[],cleanup:'pending'};
  let failure;
  try{
    const home=path.join(work,'home'),tmp=path.join(work,'tmp');fs.mkdirSync(home);fs.mkdirSync(tmp);
    for(const [id,text,expected] of CASES){
      const result=spawnSync(java,['-Duser.home='+home,'-Djava.io.tmpdir='+tmp,'-jar',jar,'-l','en-US','-c','utf-8','--json','--level','PICKY','--enabledonly','--enable',[...RULES].join(','),'-'],{cwd:work,env,input:text+'\n',encoding:'utf8',windowsHide:true,timeout:15000,maxBuffer:1024*1024});
      // Raw stdout/stderr remain transient process results; never print or persist them.
      if(result.error||result.status!==0)fail('CHILD_FAILED');
      const matches=projectMatches(result.stdout,text.length);
      if(matches.length!==expected)fail('UNEXPECTED_MATCH_COUNT');
      report.runs.push({id,exitCode:0,matches});
    }
  }catch(error){failure=error;}
  finally{
    assertOwnedTemp(tempRoot,work);
    if(fs.realpathSync(work)!==path.resolve(work))fail('TEMP_BOUNDARY');
    try{fs.rmSync(work,{recursive:true});report.cleanup='owned-temp-removed';}catch{report.cleanup='incomplete';failure=new Error('TEMP_CLEANUP_FAILED');}
  }
  if(failure)throw failure;
  return report;
}
const isMain=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(isMain){
  try{
    const args=process.argv.slice(2);
    if(args.length!==4||args[0]!=='--java-home'||args[2]!=='--tool-home')fail('ARGUMENTS');
    console.log(JSON.stringify(probe(args[1],args[3]),null,2));
  }catch(error){
    const allowed=new Set(['JVM_OPTIONS_PRESENT','INVALID_RESULT','TEMP_BOUNDARY','ARTIFACT_UNAVAILABLE','ARTIFACT_MISMATCH','CHILD_FAILED','UNEXPECTED_MATCH_COUNT','TEMP_CLEANUP_FAILED','ARGUMENTS']);
    console.error(JSON.stringify({ok:false,code:allowed.has(error?.message)?error.message:'PROBE_FAILED'}));
    process.exitCode=1;
  }
}
