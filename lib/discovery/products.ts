import "server-only";
import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@/lib/supabase/server";
import type { ProductPage } from "./model";

export const localPreview = () => process.env.NODE_ENV === "development" && process.env.PRODUCT_LOCAL_PREVIEW === "true";
export const getProduct = cache(async (slug: string): Promise<ProductPage | null> => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  if (localPreview()) {
    const pages: ProductPage[] = JSON.parse(await fs.readFile(path.join(process.cwd(), ".seed-output/product-preview.json"), "utf8"));
    return pages.find(p => p.slug === slug) ?? null;
  }
  const client = await createClient();
  const {data, error} = await client.rpc("product_discovery_page", {product_slug: slug});
  if (error) throw new Error("Product data is temporarily unavailable.");
  const page = data as ProductPage | null;
  return page?.status === "published" ? page : null;
});
