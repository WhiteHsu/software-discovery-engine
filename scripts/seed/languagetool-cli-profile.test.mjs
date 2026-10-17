import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {projectMatches,assertNoJvmInjection,assertOwnedTemp,probe} from './probe-languagetool-cli-profile.mjs';

test('text-bearing context, sentence, suggestions and messages do not cross the report boundary',()=>{
  const canary='PRIVATE-CANARY-DO-NOT-REPORT';
  const raw=JSON.stringify({software:{version:'6.6',name:canary},matches:[{rule:{id:'PASSIVE_VOICE',description:canary},offset:0,length:3,message:canary,context:{text:canary},sentence:canary,replacements:[{value:canary}]}],extra:canary});
  const report=JSON.stringify(projectMatches(raw,100));
  assert.ok(!report.includes(canary));
  assert.deepEqual(JSON.parse(report),[{ruleId:'PASSIVE_VOICE',offset:0,length:3}]);
});
test('malformed or unexpected outputs fail with fixed codes rather than echoing raw text',()=>{
  for(const raw of ['SECRET ERROR BODY',JSON.stringify({software:{version:'6.7'},matches:[]}),JSON.stringify({software:{version:'6.6'},matches:[{rule:{id:'SECRET_BODY'},offset:0,length:1}]}),JSON.stringify({software:{version:'6.6'},matches:[{rule:{id:'PASSIVE_VOICE'},offset:100,length:1}]})]){
    assert.throws(()=>projectMatches(raw,10),{message:'INVALID_RESULT'});
  }
});
test('JVM option injection is rejected before artifact access and never exposes values',()=>{
  const env={jdk_java_options:'-javaagent:PRIVATE_CANARY'};
  assert.throws(()=>probe('missing-runtime','missing-tool',env),{message:'JVM_OPTIONS_PRESENT'});
  assert.doesNotThrow(()=>assertNoJvmInjection({JAVA_TOOL_OPTIONS:'',PATH:'ordinary'}));
});
test('temporary cleanup guard rejects parent directories and arbitrary adjacent names',()=>{
  const root=path.resolve('synthetic-temp');
  assert.doesNotThrow(()=>assertOwnedTemp(root,path.join(root,'lt-synthetic-Ab123')));
  for(const target of [root,path.resolve('outside/lt-synthetic-Ab123'),path.join(root,'important-data'),path.join(root,'lt-synthetic-Ab123','nested')])assert.throws(()=>assertOwnedTemp(root,target),{message:'TEMP_BOUNDARY'});
});
