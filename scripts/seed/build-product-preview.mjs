import fs from "node:fs";
const bundle = JSON.parse(fs.readFileSync(".seed-output/editorial-fit/reviewed-five-ecosystems.json", "utf8"));
const pages = bundle.products.map(p => ({
  slug:p.slug, name:p.name, description:p.shortDescription, websiteUrl:p.websiteUrl, status:p.status,
  ...Object.fromEntries(["attributes","anchors","audiences","problems"].map(kind => [kind,p[kind].map(c => {
    const taxonomy=bundle[kind].find(t => t.slug===c.slug);
    return {...c,name:taxonomy.name,description:taxonomy.description,sources:c.evidence.map(key => {
      const s=bundle.sources.find(s=>s.key===key);
      return {title:s.title,url:s.url,retrievedAt:s.retrievedAt};
    })};
  })])),
  routes:bundle.escapeRoutes.filter(r=>r.products.some(m=>m.productSlug===p.slug)).map(r=>({slug:r.slug,name:r.name,description:r.description}))
}));
fs.writeFileSync(".seed-output/product-preview.json", JSON.stringify(pages,null,2)+"\n");
console.log("30 local draft previews generated. No database writes or publication.");
