import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {seoContext,robotsConfig} from '../lib/discovery/seo.ts';
const root=new URL('../',import.meta.url);
if(process.argv.length!==2)throw Error('No arguments supported');
const pins={
  "DISCOVERY_SEO_REVIEW.md": "dabd4bc763b93828767899482c1f44e6f8bbb600f384e41034794a85d153ecd0",
  "lib/discovery/seo.ts": "b8e5b6a63c2fac474cc2415b32a83eae304301e297b5d74d79e8d30f904f02dd",
  "lib/discovery/seo-server.ts": "bcea36344aaf474045233276065d8c2b998032c3720748655fd9204706c198eb",
  "app/robots.ts": "5becc7b40a8caba7065511ce76141c37db1e3d8b9a9753f3eff5cd88409185ee",
  "app/sitemap.xml/route.ts": "229aa4df907d2b0615d8045b621013fb7624b40406456b2c547170e60a398a42",
  "app/layout.tsx": "1914f27fb8dd1c9c383655e4f520eb5528b419c8af5756f310e5b6028e2be220",
  "app/software/[slug]/page.tsx": "67fa4dbc5012728700d93e947b348712f5421de2e45991aa1bb94008f723889f",
  "app/escape/[slug]/page.tsx": "6c4a3d9ec9ce569826168b8f3cbbae96468b4a2f9aafbd704c7f69f5a180c5eb",
  "scripts/discovery-seo.test.mjs": "db728d901c758c63e65e968120a8efd481556259f9bcf45554500aac1b87734b"
};
for(const [path,expected] of Object.entries(pins)){
 const actual=createHash('sha256').update(fs.readFileSync(new URL(path,root),'utf8').replace(/\r\n/g,'\n')).digest('hex');
 if(actual!==expected)throw Error('SEO input drift: '+path);
}
const origin='https://software-discovery-engine.vercel.app';
assert.equal(seoContext({},new URL(origin).host).indexable,false);
assert.deepEqual(robotsConfig({origin,indexable:false}),{rules:{userAgent:'*',disallow:'/'}});
console.log('PR5.115: live public sitemap/runtime guards and canonical production-only indexing pinned. Preview/alias noindex. No fixture fallback, invented lastmod, database/grant changes or analytics activation. No remote requests or secrets read. Owner deployed-output QA pending; experiment not started.');
