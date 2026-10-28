// Public display snapshots enrich synthetic fixtures; confidence remains synthetic, never new evidence.
import {readFileSync} from 'node:fs';
import {products,routes,membership,mockSupabase} from './locale-expanded-fixtures.mjs';
const display=JSON.parse(readFileSync(new URL('./locale-products-display.json',import.meta.url),'utf8'));
for(const p of products){const d=display.find(d=>d.slug===p.slug);p.description=d.description;for(const field of ['attributes','audiences','problems','anchors'])for(const c of d[field]){const prior=p[field].find(v=>v.slug===c.slug);if(prior){prior.name=c.name;prior.description=c.description;}else p[field].push({...c,confidence:.9});}}
export {products,routes,membership,mockSupabase};
