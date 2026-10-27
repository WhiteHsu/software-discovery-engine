// A comparison without an anchor omits the optional event field; null is not a product slug.
export function escapeContextV2(def:{slug:string;anchor:string|null;constraints:readonly string[]}){
 return {routeSlug:def.slug,...(def.anchor===null?{}:{anchor:def.anchor}),constraints:[...def.constraints]};
}
