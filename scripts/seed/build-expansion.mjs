import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateSeedBundle } from "./validate.mjs";
import { createDatabasePlan } from "./database-plan.mjs";
import { createCompactImportSql, createImportCountQuery } from "./import-sql-compact.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const date = "2026-10-06T00:00:00Z";
const ecosystems = ["notion", "todoist", "grammarly", "adobe-pdf", "calm"];
const definitions = [
  { slug: "supported-platforms", name: "Supported Platforms", description: "Source-listed platforms and edition scope; an omitted platform is not a verified negative.", category: "platform", valueType: "text" },
  { slug: "pricing-model", name: "Pricing Model", description: "Source-backed pricing model and relevant edition scope; excludes transient numeric prices.", category: "pricing", valueType: "text" },
  { slug: "trade-off-summary", name: "Trade-Off Summary", description: "Evidence-backed restrictions or explicitly provisional editorial interpretation, with confidence status.", category: "workflow", valueType: "text" },
];
const anchorDefinitions = [
  { slug: "todoist", name: "Todoist", description: "Task and project management ecosystem for users considering different planning workflows." },
  { slug: "grammarly", name: "Grammarly", description: "Grammar, writing assistance, and style-editing ecosystem; alternatives may cover only part of the workflow." },
  { slug: "adobe-pdf", name: "Adobe / PDF", description: "Acrobat-style PDF reading, editing, conversion, and document-tool ecosystem; feature parity is not implied." },
  { slug: "calm", name: "Calm / Meditation", description: "Meditation and sleep-content ecosystem; listing establishes software scope, not medical efficacy." },
];

export function buildExpansion(base, research) {
  const bundle = structuredClone(base);
  bundle.attributes.push(...definitions);
  bundle.anchors.push(...anchorDefinitions);
  const source = (record, kind, url) => {
    const key = `${record.slug}-${kind}-2026-10-06`;
    if (!bundle.sources.some((item) => item.key === key)) bundle.sources.push({
      key, sourceType: kind === "pricing" ? "pricing" : "official",
      title: `${record.name ?? record.slug} — ${kind} reference`, url,
      publisher: record.name ?? bundle.products.find((p) => p.slug === record.slug)?.name,
      retrievedAt: date,
    });
    return key;
  };
  const claim = (slug, value, evidence, status = "verified") => ({
    slug, value: status === "unknown" ? null : value,
    verificationStatus: status, confidence: status === "unknown" ? null : status === "likely" ? 0.75 : 0.95,
    lastVerifiedAt: status === "unknown" ? null : date,
    evidence: status === "unknown" ? [] : evidence,
  });
  const addMetadata = (product, record) => {
    for (const [slug, field, kind] of [["supported-platforms", "platforms", "platform"], ["pricing-model", "pricing", "pricing"], ["trade-off-summary", "tradeoff", "tradeoff"]]) {
      const status = record[`${kind}Status`] ?? "verified";
      const evidence = status === "unknown" ? [] : [source(record, kind, record[`${kind}Url`])];
      const extra = record[`extra${kind[0].toUpperCase()}${kind.slice(1)}Url`];
      if (extra && status !== "unknown") evidence.push(source(record, `${kind}-extra`, extra));
      product.attributes.push(claim(slug, record[field], evidence, status));
    }
  };
  for (const record of research.records) {
    const overview = source(record, "overview", record.url);
    const product = { slug: record.slug, name: record.name, shortDescription: record.summary,
      websiteUrl: record.url, status: "draft", anchors: [], attributes: [], problems: [], audiences: [] };
    const anchor = claim(record.anchor, null, [overview], record.anchorStatus ?? "likely");
    delete anchor.value;
    product.anchors.push({ ...anchor, relationshipType: "alternative" });
    addMetadata(product, record);
    for (const [field, slug, kind] of [["free", "free-core-use", "pricing"], ["offline", "works-offline", "overview"], ["aiOptional", "ai-optional", "overview"], ["localFirst", "local-first", "overview"], ["selfHostable", "self-hostable", "overview"], ["openSource", "open-source", "overview"], ["noAccount", "no-account-required", "overview"]]) {
      if (record[field] !== undefined) {
        const evidence = [source(record, kind, kind === "pricing" ? record.pricingUrl : record.url)];
        if (field === "free" && record.slug === "ginger") evidence.push(overview);
        product.attributes.push(claim(slug, record[field], evidence));
      }
    }
    // No inference of privacy, AI behavior, offline use, or license from marketing omissions.
    for (const slug of ["works-offline", "ai-optional", "open-source"]) {
      if (!product.attributes.some((item) => item.slug === slug)) product.attributes.push(claim(slug, null, [], "unknown"));
    }
    bundle.products.push(product);
  }
  for (const record of research.notionSupplements) addMetadata(bundle.products.find((product) => product.slug === record.slug), record);
  const errors = validateSeedBundle(bundle);
  if (errors.length) throw new Error(errors.join("\n"));
  return bundle;
}

export function ecosystemBundle(bundle, ecosystem) {
  const products = bundle.products.filter((product) => ecosystem === "notion"
    ? ["obsidian", "anytype", "appflowy", "affine", "joplin", "logseq"].includes(product.slug)
    : product.anchors.some((claim) => claim.slug === ecosystem));
  const escapeRoutes = bundle.escapeRoutes.filter((route) => route.anchorSlug === ecosystem);
  const used = (collection) => new Set(products.flatMap((product) => product[collection].map((claim) => claim.slug)));
  const anchorSlugs = used("anchors");
  escapeRoutes.forEach((route) => anchorSlugs.add(route.anchorSlug));
  const sourceKeys = new Set(products.flatMap((product) => ["attributes", "anchors", "problems", "audiences"].flatMap((key) => product[key].flatMap((claim) => claim.evidence))));
  return { version: 1, sources: bundle.sources.filter((item) => sourceKeys.has(item.key)),
    anchors: bundle.anchors.filter((item) => anchorSlugs.has(item.slug)),
    attributes: bundle.attributes.filter((item) => used("attributes").has(item.slug)),
    problems: bundle.problems.filter((item) => used("problems").has(item.slug)),
    audiences: bundle.audiences.filter((item) => used("audiences").has(item.slug)), products, escapeRoutes };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = path.resolve(process.argv[2] ?? path.join(root, ".seed-output/expansion"));
  fs.mkdirSync(output, { recursive: true });
  const bundle = buildExpansion(read("seed/data/notion-vertical-slice.json"), read("seed/research/expansion-2026-10-06.json"));
  const ownership = read("seed/import-ownership.example.json");
  fs.writeFileSync(path.join(output, "five-ecosystems.json"), JSON.stringify(bundle, null, 2) + "\n");
  for (const [index, ecosystem] of ecosystems.entries()) {
    const batch = ecosystemBundle(bundle, ecosystem);
    const sql = createCompactImportSql(batch, ownership, { commit: true });
    if (Buffer.byteLength(sql) >= 200_000) throw new Error(`${ecosystem} SQL exceeds the conservative 200 KB limit`);
    const name = `${String(index + 1).padStart(2, "0")}_${ecosystem}`;
    fs.writeFileSync(path.join(output, `${name}.json`), JSON.stringify(batch, null, 2) + "\n");
    fs.writeFileSync(path.join(output, `${name}_IMPORT.sql`), sql);
    console.log(`${name}: ${batch.products.length} products; ${Buffer.byteLength(sql)} SQL bytes`);
  }
  fs.writeFileSync(path.join(output, "06_CHECK_COUNTS.sql"), createImportCountQuery(bundle));
  fs.writeFileSync(path.join(output, "database-plan.json"), JSON.stringify(createDatabasePlan(bundle), null, 2) + "\n");
  console.log("Research draft generated; human review and remote import remain pending.");
}
