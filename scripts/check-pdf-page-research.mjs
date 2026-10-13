import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const report=JSON.parse(fs.readFileSync(fileURLToPath(new URL('../seed/research/pdf-page-operations-2026-10-13.json',import.meta.url)),'utf8').replace(/^\uFEFF/,''));
const required=['reorder-pages','rotate-pages','remove-pages','extract-pages','save-pdf'];
const ids=new Set(report.sources.map(s=>s.id));
if(report.packet!=='PR5.28'||report.applied!==false||report.publicationApproved!==false||report.qualifiedCandidatesAdded!==0||report.candidates.length!==3||ids.size!==report.sources.length)throw Error('Invalid unapplied research packet');
for(const c of report.candidates){
 if(c.qualified!==false||c.nativeTestStatus!=='not-run'||c.operations.length!==5||new Set(c.operations.map(o=>o.operation)).size!==5||!c.holds.length)throw Error('Invalid candidate boundaries');
 for(const o of c.operations)if(!required.includes(o.operation)||!['supported','pending'].includes(o.documentaryStatus)||o.sources.some(id=>!ids.has(id))||(o.documentaryStatus==='supported'&&!o.sources.length)||(o.documentaryStatus==='pending'&&o.sources.length))throw Error('Invalid operation evidence');
 console.log(`${c.slug}: ${c.operations.filter(o=>o.documentaryStatus==='supported').length}/5 documentary operations; native tests not run; qualification held.`);
}
console.log('PR5.28 valid. Applied=false; publicationApproved=false; qualifiedCandidatesAdded=0. No writes.');
