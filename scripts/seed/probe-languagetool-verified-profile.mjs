import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {probe,assertNoJvmInjection} from './probe-languagetool-cli-profile.mjs';
import {verifyDistributions} from './languagetool-distribution.mjs';

export function verifiedProbe(javaHome,toolHome,env=process.env){
  assertNoJvmInjection(env);
  const snapshot=verifyDistributions(javaHome,toolHome);
  const {completeDistributionVerified,...result}=probe(javaHome,toolHome,env);
  return {...result,distributionFileSnapshotVerified:true,verifiedFileCounts:{java:snapshot.java.fileCount,languagetool:snapshot.languagetool.fileCount},atomicVerificationOrIsolation:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const args=process.argv.slice(2);
    if(args.length!==4||args[0]!=='--java-home'||args[2]!=='--tool-home')throw new Error('ARGUMENTS');
    console.log(JSON.stringify(verifiedProbe(args[1],args[3]),null,2));
  }catch(error){
    const codes=new Set(['DISTRIBUTION_LINK','DISTRIBUTION_ENTRY','DISTRIBUTION_UNAVAILABLE','DISTRIBUTION_MISMATCH','DISTRIBUTION_MANIFEST_DRIFT','JVM_OPTIONS_PRESENT','INVALID_RESULT','TEMP_BOUNDARY','ARTIFACT_UNAVAILABLE','ARTIFACT_MISMATCH','CHILD_FAILED','UNEXPECTED_MATCH_COUNT','TEMP_CLEANUP_FAILED','ARGUMENTS']);
    console.error(JSON.stringify({ok:false,code:codes.has(error?.message)?error.message:'PROBE_FAILED'}));process.exitCode=1;
  }
}
