import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {buildExpansion} from './build-expansion.mjs';
import {buildSourceReview} from './build-source-review.mjs';
import {buildEditorialFit} from './build-editorial-fit.mjs';
import {buildEscapeDraft} from './build-escape-draft.mjs';
import {buildBuyOnceDraft} from './build-buy-once-draft.mjs';
import {buildTodoistWorkflow} from './build-todoist-workflow.mjs';
import {buildAnytypeOfflineDraft} from './build-anytype-offline-draft.mjs';
import {validateSeedBundle} from './validate.mjs';
import {escapeDefinitions, rankCandidates, publishable} from '../../lib/discovery/escape-model.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const reviewedHash = '7efb8fae5ad9b14f231d9c70178721d50176ada688bf41e73cc647cfa28c3219';
const scope = 'personal-offline-note-object-organization';
const routeSlug = 'offline-notion-alternatives';

// Always reconstruct from versioned research. Never reuse a previously patched output.
export function offlineWorkflowBaseline() {
  const expanded = buildExpansion(read('seed/data/notion-vertical-slice.json'), read('seed/research/expansion-2026-10-06.json'));
  const baseline = buildEditorialFit(buildSourceReview(expanded, read('seed/research/source-review-2026-10-06.json')).reviewed).reviewed;
  const escape = buildEscapeDraft(baseline, read('seed/research/escape-content-2026-10-07.json'), read('seed/research/escape-candidates-2026-10-07.json'), read('seed/research/escape-draft-review-2026-10-07.json')).reviewed;
  const purchase = buildBuyOnceDraft(escape, read('seed/research/escape-buy-once-review-2026-10-07.json')).bundle;
  const tasks = buildTodoistWorkflow(purchase, read('seed/research/todoist-workflow-review-2026-10-07.json')).bundle;
  return {baseline, bundle: buildAnytypeOfflineDraft(tasks, read('seed/research/anytype-offline-review-2026-10-08.json')).bundle};
}

export function buildOfflineWorkflow(input, review) {
  if (hash(review) !== reviewedHash || review.publicationApproved !== false || review.scope !== scope) throw Error('Offline review drift: a fresh reviewed packet is required');
  const errors = validateSeedBundle(input);
  if (errors.length) throw Error(errors.join('\n'));
  if (input.products.some(p => p.status !== 'draft') || input.escapeRoutes.some(r => r.status !== 'draft' || r.editoriallyApproved)) throw Error('Only separate unapproved local draft graphs are supported');
  for (const slug of ['affine', 'appflowy', 'anytype']) {
    if (hash(input.products.find(p => p.slug === slug)) !== review.beforeSha256[slug]) throw Error(`Offline product baseline drift: ${slug}`);
  }
  const bundle = structuredClone(input);
  const route = bundle.escapeRoutes.find(r => r.slug === routeSlug);
  if (!route || hash(route) !== review.routeBeforeSha256) throw Error('Offline route baseline drift');
  const keys = {};
  for (const s of review.sources) {
    const key = `offline-workflow-${hash(s.url).slice(0, 16)}-2026-10-08`;
    if (bundle.sources.some(s => s.key === key)) throw Error('Offline source collision');
    bundle.sources.push({key, url:s.url, title:s.title, sourceType:s.id.endsWith('pricing')?'pricing':'documentation', publisher:s.publisher, retrievedAt:review.date});
    keys[s.id] = key;
  }
  for (const c of review.candidates) {
    const p = bundle.products.find(p => p.slug === c.slug);
    const prefix = c.slug;
    const offlineSource = prefix === 'affine' ? 'affine-download' : 'appflowy-start';
    const proposals = [
      {slug:'works-offline', value:true, evidence:[keys[offlineSource]]},
      {slug:'pricing-model', value:c.pricing, evidence:[keys[`${prefix}-pricing`]]},
      {slug:'trade-off-summary', value:c.tradeoff, evidence:[keys[offlineSource], keys[`${prefix}-pricing`], keys[`${prefix}-import`], ...(prefix==='appflowy'?[keys['appflowy-compare']]:[])]},
    ];
    for (const proposal of proposals) {
      const old = p.attributes.find(a => a.slug === proposal.slug);
      if (!old) throw Error('Missing reviewed attribute');
      p.attributes[p.attributes.indexOf(old)] = {...proposal, verificationStatus:'verified', confidence:.95, lastVerifiedAt:review.date, evidence:[...new Set([...old.evidence, ...proposal.evidence])]};
    }
    const old = p.anchors.find(a => a.slug === 'notion' && a.relationshipType === 'alternative');
    if (!old) throw Error('Missing reviewed Notion relationship');
    p.anchors[p.anchors.indexOf(old)] = {...old, scope, scopeDescription:c.scopeDescription, confidence:.85, lastVerifiedAt:review.date, evidence:[...new Set([...old.evidence, keys[offlineSource], keys[`${prefix}-import`], keys['notion-offline']])]};
    route.products.find(m => m.productSlug === c.slug).editorialNote = c.scopeDescription;
  }
  route.description = 'Compare installed native workspaces for personal offline notes and locally available organized content. Notion also supports offline desktop/mobile pages, with page/device preparation and feature limits. Cloud sync, hosted imports, remote attachments and collaboration have separate requirements. No guarantee of complete Notion feature or migration parity. Draft route; publication is not approved.';
  route.lastVerifiedAt = review.date;
  const validation = validateSeedBundle(bundle);
  if (validation.length) throw Error(validation.join('\n'));
  const kinds = ['attributes', 'anchors', 'problems', 'audiences'];
  const pages = bundle.products.map(p => ({slug:p.slug, name:p.name, description:p.shortDescription, websiteUrl:p.websiteUrl, status:p.status,
    ...Object.fromEntries(kinds.map(kind => [kind,p[kind].map(c => {
      const taxonomy = bundle[kind].find(t => t.slug === c.slug);
      return {...c,name:taxonomy.name,description:c.scopeDescription??taxonomy.description??null,sources:c.evidence.map(key => {
        const s = bundle.sources.find(s => s.key === key);
        return {title:s.title,url:s.url,retrievedAt:s.retrievedAt};
      })};
    })])), routes:bundle.escapeRoutes.filter(r => r.products.some(m => m.productSlug === p.slug)).map(r => ({slug:r.slug,name:r.name,description:r.description}))}));
  const candidates = rankCandidates(escapeDefinitions[0],route.products.map(m => ({product:pages.find(p => p.slug === m.productSlug),noveltyScore:0})));
  const report = {publicationApproved:false, scope, inputSha256:hash(input), reviewSha256:hash(review), attributeUpdates:6, relationshipUpdates:2, qualifiedDraftCandidates:candidates.filter(c => c.eligible).length, qualifiedPublishedCandidates:0, publishable:publishable({published:false,candidates}), candidates:candidates.map(c => ({slug:c.product.slug,eligible:c.eligible,quality:c.quality,blockers:c.blockers}))};
  if (report.qualifiedDraftCandidates !== 3) throw Error('Expected three bounded offline draft candidates');
  return {bundle,pages,report};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 2) throw Error('No arguments supported');
    const {baseline,bundle} = offlineWorkflowBaseline();
    const result = buildOfflineWorkflow(bundle,read('seed/research/offline-workflow-review-2026-10-08.json'));
    const out = path.join(root,'.seed-output/escape-draft');
    fs.mkdirSync(out,{recursive:true});
    fs.mkdirSync(path.join(root,'.seed-output/editorial-fit'),{recursive:true});
    fs.writeFileSync(path.join(root,'.seed-output/editorial-fit/reviewed-five-ecosystems.json'),JSON.stringify(baseline,null,2)+'\n');
    for (const [name,value] of Object.entries({bundle:result.bundle,'product-preview':result.pages,'offline-workflow-review':result.report})) fs.writeFileSync(path.join(out,`${name}.json`),JSON.stringify(value,null,2)+'\n');
    console.log('3/4 qualified bounded offline draft candidates; 0 published in local draft graph; publishable=false.');
    console.log('Rebuilt from versioned research; safe to rerun. No SQL, remote writes or publication.');
  } catch (error) { console.error(error.message); process.exitCode=1; }
}
