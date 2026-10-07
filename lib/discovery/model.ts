export type Source = { title: string; url: string | null; retrievedAt: string | null };
export type Claim = { slug: string; name: string; description: string | null; scope?: string | null; value?: string | number | boolean | null; relationshipType?: string; verificationStatus: "verified" | "likely" | "unknown"; confidence: number | null; lastVerifiedAt: string | null; sources: Source[] };
export type ProductPage = { slug: string; name: string; description: string | null; websiteUrl: string | null; status: string; attributes: Claim[]; anchors: Claim[]; audiences: Claim[]; problems: Claim[]; routes: { slug: string; name: string; description: string | null }[] };
export function safeUrl(value: string | null | undefined) {
  try { const url = new URL(value ?? ""); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function supported(c: Claim) {
  return c.verificationStatus !== "unknown" && c.sources.some(s => safeUrl(s.url));
}
export function claimValue(c: Claim) {
  if (!supported(c) || c.value === null || c.value === undefined) return "Unknown";
  return c.value === true ? "Yes" : c.value === false ? "No" : String(c.value);
}
export function latestVerification(p: ProductPage) {
  const dates = [...p.attributes, ...p.anchors, ...p.audiences, ...p.problems].filter(supported).map(c => c.lastVerifiedAt).filter((d): d is string => !!d && Number.isFinite(Date.parse(d)));
  return dates.sort((a,b) => Date.parse(b)-Date.parse(a))[0] ?? null;
}
