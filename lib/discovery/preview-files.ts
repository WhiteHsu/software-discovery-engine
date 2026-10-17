export function previewFiles(env: {NODE_ENV?:string;PRODUCT_LOCAL_PREVIEW?:string;ESCAPE_DRAFT_PREVIEW?:string;PRIVACY_DRAFT_PREVIEW?:string}) {
  if(env.NODE_ENV!=="development"||env.PRODUCT_LOCAL_PREVIEW!=="true")return null;
  if(env.PRIVACY_DRAFT_PREVIEW==="true")return {products:".seed-output/privacy-graph-proposal/product-preview.json",bundle:".seed-output/privacy-graph-proposal/bundle.json"};
  return env.ESCAPE_DRAFT_PREVIEW==="true"
    ? {products:".seed-output/escape-draft/product-preview.json",bundle:".seed-output/escape-draft/bundle.json"}
    : {products:".seed-output/product-preview.json",bundle:".seed-output/editorial-fit/reviewed-five-ecosystems.json"};
}
