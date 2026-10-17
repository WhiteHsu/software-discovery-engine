import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const hash=value=>createHash('sha256').update(value).digest('hex');
function fail(code){throw new Error(code);}
export function fingerprintTree(root){
  const rows=[];
  function walk(dir,prefix=''){
    for(const item of fs.readdirSync(dir,{withFileTypes:true})){
      const filename=path.join(dir,item.name),relative=prefix+item.name,stat=fs.lstatSync(filename);
      if(stat.isSymbolicLink())fail('DISTRIBUTION_LINK');
      if(stat.isDirectory())walk(filename,relative+'/');
      else if(stat.isFile())rows.push([relative,stat.size,hash(fs.readFileSync(filename))]);
      else fail('DISTRIBUTION_ENTRY');
    }
  }
  try{if(fs.lstatSync(root).isSymbolicLink())fail('DISTRIBUTION_LINK');walk(root);}catch(error){
    if(['DISTRIBUTION_LINK','DISTRIBUTION_ENTRY'].includes(error.message))throw error;
    fail('DISTRIBUTION_UNAVAILABLE');
  }
  rows.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
  return {fileCount:rows.length,fileTreeSha256:hash(JSON.stringify(rows))};
}
export function verifyTree(root,expected){
  const actual=fingerprintTree(root);
  if(actual.fileCount!==expected.fileCount||actual.fileTreeSha256!==expected.fileTreeSha256)fail('DISTRIBUTION_MISMATCH');
  return actual;
}
export function verifyDistributions(javaHome,toolHome){
  const filename=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../seed/research/languagetool-distribution-files-2026-10-17.json');
  const manifest=JSON.parse(fs.readFileSync(filename,'utf8'));
  if(hash(JSON.stringify(manifest))!=='9347719d97c617632765d6e9f70a1bd267002cdfb54da5614d8e5f4c2e00af86')fail('DISTRIBUTION_MANIFEST_DRIFT');
  return {java:verifyTree(javaHome,manifest.java),languagetool:verifyTree(toolHome,manifest.languagetool)};
}
