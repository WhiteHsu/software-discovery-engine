import "server-only";
import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import type { ProductPage } from "./model";
import { getEscape } from "./escapes";
import { previewFiles } from "./preview-files";

export const localPreview = () => process.env.NODE_ENV === "development" && process.env.PRODUCT_LOCAL_PREVIEW === "true";
export const getProduct = cache(async (slug: string): Promise<ProductPage | null> => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  if (localPreview()) {
    const pages: ProductPage[] = JSON.parse(await fs.readFile(path.join(process.cwd(), previewFiles(process.env)!.products), "utf8"));
    return pages.find(p => p.slug === slug) ?? null;
  }
  const client = await createClient();
  const {data, error} = await client.rpc("product_discovery_page", {product_slug: slug});
  if (error) throw new Error("Product data is temporarily unavailable.");
  const page = data as ProductPage | null;
  if(page?.status !== "published")return null;
  const available=await Promise.all(page.routes.map(async r=>(await getEscape(r.slug))?r:null));
  return {...page,routes:available.filter((r):r is ProductPage["routes"][number]=>r!==null)};
});
