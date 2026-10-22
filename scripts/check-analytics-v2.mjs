import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const names=['discovery-search','home-entries','discovery-navigation','escape-model','discovery-events','discovery-ingestion','analytics-http','discovery-producer','analytics-producer-config','analytics-qa-exclusions','route-catalog','accepted-publication-audit','discovery-seo','hidden-gems','hidden-gems-events','analytics-v2','analytics-v2-collector','analytics-v2-client'];
const result=spawnSync(process.execPath,['--test',...names.map(name=>fileURLToPath(new URL(name+'.test.mjs',import.meta.url)))],{stdio:'inherit'});
if(result.error){console.error('Unable to start analytics checks');process.exitCode=1;}else process.exitCode=result.status??1;
