import type {MetadataRoute} from 'next';
import {requestSeo} from '@/lib/discovery/seo-server';
import {robotsConfig} from '@/lib/discovery/seo';
export const dynamic='force-dynamic';
export default async function robots():Promise<MetadataRoute.Robots>{return robotsConfig(await requestSeo());}
