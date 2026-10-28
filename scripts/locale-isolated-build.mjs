// Build a disposable source-only site with fixture settings baked in.
// Never copy .env*, .next, .git or production build artifacts.
import {mkdtemp,cp,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join,sep} from 'node:path';
import {spawn} from 'node:child_process';
export async function prepareLocaleBuild(mockUrl){
 const repo=process.cwd(),tempRoot=resolve(tmpdir()),cwd=await mkdtemp(join(tempRoot,'toolelse-locale-test-'));
 const cleanup=async()=>{
  const target=resolve(cwd);
  if(!target.startsWith(tempRoot+sep)||!target.slice(tempRoot.length+1).startsWith('toolelse-locale-test-'))throw Error('Unsafe test cleanup target');
  // Dependencies are an actual disposable copy, never a junction to the owner repo.
  await rm(target,{recursive:true,force:true});
 };
 const env={...process.env,NEXT_PUBLIC_SUPABASE_URL:mockUrl,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'fixture-only-not-a-real-key',NEXT_PUBLIC_SITE_URL:'https://toolelse.com',VERCEL:'1',VERCEL_ENV:'production',VERCEL_WEB_ANALYTICS_ENABLED:'false',ANALYTICS_ENABLED:'false',ANALYTICS_V2_ENABLED:'false',ANALYTICS_PRODUCER_ENABLED:'false',DISCOVERY_SEARCH_ENABLED:'false',NEXT_TELEMETRY_DISABLED:'1'};
 try{
  for(const name of ['app','components','lib','public','package.json','package-lock.json','next.config.ts','tsconfig.json','next-env.d.ts','proxy.ts']){
   try{await access(join(repo,name));}catch(e){if(e.code==='ENOENT'&&name==='public')continue;throw e;}
   await cp(join(repo,name),join(cwd,name),{recursive:true});
  }
  console.log('Copying existing dependencies into the isolated test site (no downloads)...');
  await cp(join(repo,'node_modules'),join(cwd,'node_modules'),{recursive:true,dereference:true});
  console.log('Building isolated fixture site (no environment files or existing build copied)...');
  await new Promise((resolveBuild,reject)=>{
   const build=spawn(process.execPath,[join(cwd,'node_modules/next/dist/bin/next'),'build','--webpack'],{cwd,env,windowsHide:true});
   let output='';build.stdout.on('data',c=>output+=c);build.stderr.on('data',c=>output+=c);
   build.on('error',reject);build.on('close',code=>code===0?resolveBuild():reject(Error('Isolated fixture build failed:\n'+output)));
  });
  return {cwd,env,cleanup};
 }catch(e){await cleanup();throw e;}
}
