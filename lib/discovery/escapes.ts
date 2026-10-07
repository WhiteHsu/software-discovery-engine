import "server-only";
import {cache} from "react";
import fs from "node:fs/promises";
import path from "node:path";
import {createClient} from "@/lib/supabase/server";
import type {ProductPage} from "./model";
import {escapeDefinitions,rankCandidates,publishable,type EscapePage,type Candidate} from "./escape-model";
export const escapePreview=()=>process.env.NODE_ENV==="development"&&process.env.PRODUCT_LOCAL_PREVIEW==="true";
export const getEscape=cache(async(slug:string):Promise<EscapePage|null>=>{
  const def=escapeDefinitions.find(d=>d.slug===slug);if(!def)return null;
  if(escapePreview()){
    const pages:ProductPage[]=JSON.parse(await fs.readFile(path.join(process.cwd(),".seed-output/product-preview.json"),"utf8"));
    const bundle=JSON.parse(await fs.readFile(path.join(process.cwd(),".seed-output/editorial-fit/reviewed-five-ecosystems.json"),"utf8"));
    const route=bundle.escapeRoutes.find((r:{slug:string})=>r.slug===slug);
    const members: {productSlug:string;noveltyScore?:number}[]=route?.products??[];
    const candidates=members.flatMap(m=>{const p=pages.find(p=>p.slug===m.productSlug);return p?[{product:p,noveltyScore:m.noveltyScore}]:[];});
    return {slug,name:def.name,description:route?.description??"Candidate membership and constraint evidence have not been reviewed yet.",lastVerifiedAt:route?.lastVerifiedAt??null,published:false,candidates:rankCandidates(def,candidates)};
  }
  const client=await createClient();
  const {data:route,error}=await client.from("escape_routes").select("id,slug,name,description,status,editorially_approved,last_verified_at").eq("slug",slug).eq("status","published").eq("editorially_approved",true).maybeSingle();
  if(error)throw new Error("Route data is temporarily unavailable.");if(!route)return null;
  const {data:members,error:memberError}=await client.from("escape_route_products").select("product_id,novelty_score").eq("escape_route_id",route.id);
  if(memberError)throw new Error("Route candidates are temporarily unavailable.");
  if(!members?.length)return null;
  const {data:identities,error:identityError}=await client.from("products").select("id,slug").in("id",members.map(m=>m.product_id)).eq("status","published");
  if(identityError)throw new Error("Product identity is temporarily unavailable.");
  const results=await Promise.all((identities??[]).map(async p=>{
    const {data,error:pageError}=await client.rpc("product_discovery_page",{product_slug:p.slug});
    if(pageError)throw new Error("Product evidence is temporarily unavailable.");
    return data?.status==="published"?{product:data as ProductPage,noveltyScore:members.find(m=>m.product_id===p.id)?.novelty_score}:null;
  }));
  const candidates:Candidate[]=results.filter((c):c is NonNullable<typeof c>=>c!==null);
  const page={slug,name:route.name,description:route.description,lastVerifiedAt:route.last_verified_at,published:true,candidates:rankCandidates(def,candidates)};
  return publishable(page)?page:null;
});
