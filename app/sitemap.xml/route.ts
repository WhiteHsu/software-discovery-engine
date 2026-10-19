import {requestSeo,liveSitemapPaths} from '@/lib/discovery/seo-server';
import {sitemapResponse} from '@/lib/discovery/seo';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=30;
export async function GET(){return sitemapResponse(await requestSeo(),liveSitemapPaths);}
