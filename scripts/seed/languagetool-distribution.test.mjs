import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fingerprintTree,verifyTree} from './languagetool-distribution.mjs';
function fixture(fn){const root=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'lt-tree-test-'));try{fs.mkdirSync(path.join(root,'libs'));fs.writeFileSync(path.join(root,'main.jar'),'unchanged-entry');fs.writeFileSync(path.join(root,'libs/dependency.jar'),'original-dependency');fn(root);}finally{fs.rmSync(root,{recursive:true});}}
test('a dependency modification fails while entrypoint bytes remain unchanged',()=>fixture(root=>{
 const pin=fingerprintTree(root),entry=fs.readFileSync(path.join(root,'main.jar'));
 fs.writeFileSync(path.join(root,'libs/dependency.jar'),'modified-dependency');
 assert.throws(()=>verifyTree(root,pin),{message:'DISTRIBUTION_MISMATCH'});
 assert.ok(fs.readFileSync(path.join(root,'main.jar')).equals(entry));
}));
test('unexpected configuration and missing resources both fail snapshot verification',()=>fixture(root=>{
 const pin=fingerprintTree(root);assert.deepEqual(verifyTree(root,pin),pin);
 const extra=path.join(root,'logback-test.xml');fs.writeFileSync(extra,'unexpected override');
 assert.throws(()=>verifyTree(root,pin),{message:'DISTRIBUTION_MISMATCH'});
 fs.unlinkSync(extra);fs.unlinkSync(path.join(root,'libs/dependency.jar'));
 assert.throws(()=>verifyTree(root,pin),{message:'DISTRIBUTION_MISMATCH'});
}));
test('directory junctions are rejected instead of following external content',t=>fixture(root=>{
 const target=path.join(root,'libs'),link=path.join(root,'linked');
 try{fs.symlinkSync(target,link,'junction');}catch(error){if(['EPERM','EACCES','ENOTSUP'].includes(error.code)){t.skip('OS does not permit creating a test junction');return;}throw error;}
 assert.throws(()=>fingerprintTree(root),{message:'DISTRIBUTION_LINK'});
}));
